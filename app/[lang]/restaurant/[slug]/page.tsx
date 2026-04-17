import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import MenuClient, { type MenuItem } from "../../menu/MenuClient";
import DynamicRestaurantGrid from "@/components/DynamicRestaurantGrid";
import type { Metadata } from "next";
import type { Restaurant } from "@/types";

export const revalidate = 3600;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("name, description")
    .eq("slug", slug)
    .single();

  return {
    title: data ? `${data.name} | Planet Food` : "Restaurant | Planet Food",
    description: data?.description ?? "",
  };
}

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!restaurant) notFound();

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select(
      "id, name_fr, name_en, name_es, description_fr, description_en, description_es, price, image_url, category, is_available, variants, addons"
    )
    .eq("restaurant_id", restaurant.id)
    .eq("is_available", true)
    .order("id", { ascending: true });

  const items: MenuItem[] = (menuItems ?? []).map((item) => ({
    ...item,
    name: item.name_fr,
    restaurant_id: restaurant.id,
    restaurant_name: restaurant.name,
  }));

  return (
    <>
      <DynamicRestaurantGrid current={restaurant as Restaurant} />
      <MenuClient initialItems={items} noHeader />
    </>
  );
}
