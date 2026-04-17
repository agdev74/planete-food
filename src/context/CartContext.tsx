"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import type { MenuItem, CartItem, Variant, Addon, RestaurantGroup } from "@/types";

export type { MenuItem, CartItem, Variant, Addon, RestaurantGroup };

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem, options?: { variant?: Variant; addons?: Addon[] }) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  comboSavings: number;
  restaurantGroups: RestaurantGroup[];
}

function makeCartKey(itemId: number, restaurantId?: number, variantSize?: string): string {
  const parts = [String(itemId)];
  if (restaurantId) parts.push(String(restaurantId));
  if (variantSize) parts.push(variantSize);
  return parts.join(":");
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("pf_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erreur de lecture du panier", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("pf_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (item: MenuItem, options?: { variant?: Variant; addons?: Addon[] }) => {
    const { variant, addons } = options ?? {};
    const effectivePrice = variant ? variant.price : item.price;
    const cartKey = makeCartKey(item.id, item.restaurant_id, variant?.size);

    setItems((prev) => {
      const existing = prev.find((i) => i._cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i._cartKey === cartKey
            ? { ...i, quantity: i.quantity + 1, selected_addons: addons ?? i.selected_addons }
            : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          price: effectivePrice,
          quantity: 1,
          selected_variant: variant,
          selected_addons: addons,
          _cartKey: cartKey,
        },
      ];
    });
  };

  const removeFromCart = (cartKey: string) => {
    setItems((prev) => prev.filter((i) => i._cartKey !== cartKey));
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartKey);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i._cartKey === cartKey ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("pf_cart");
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const { totalPrice, comboSavings } = useMemo(() => {
    // Group items that carry combo_prices tiers by (restaurant_id, variant.size)
    const comboGroups = new Map<string, CartItem[]>();
    let baseTotal = 0;

    items.forEach((item) => {
      if (item.selected_variant?.combo_prices?.length) {
        const key = `${item.restaurant_id ?? 0}:${item.selected_variant.size}`;
        if (!comboGroups.has(key)) comboGroups.set(key, []);
        comboGroups.get(key)!.push(item);
      } else {
        baseTotal += item.price * item.quantity;
      }
    });

    let comboTotal = 0;
    let savings = 0;

    comboGroups.forEach((group) => {
      const unitPrice = group[0].price;
      const tiers = [...group[0].selected_variant!.combo_prices!].sort((a, b) => b.qty - a.qty);
      const totalQty = group.reduce((s, i) => s + i.quantity, 0);
      const standardCost = totalQty * unitPrice;
      let remaining = totalQty;
      let groupCost = 0;

      // Greedy: fill with the highest applicable tier first
      for (const tier of tiers) {
        if (remaining >= tier.qty) {
          const times = Math.floor(remaining / tier.qty);
          groupCost += times * tier.price;
          remaining -= times * tier.qty;
        }
      }
      groupCost += remaining * unitPrice;

      savings += Math.max(0, standardCost - groupCost);
      comboTotal += groupCost;
    });

    return { totalPrice: baseTotal + comboTotal, comboSavings: savings };
  }, [items]);

  const restaurantGroups = useMemo<RestaurantGroup[]>(() => {
    const groupMap = new Map<number | null, CartItem[]>();
    items.forEach((item) => {
      const key = item.restaurant_id ?? null;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    });
    return Array.from(groupMap.entries()).map(([restaurantId, groupItems]) => ({
      restaurant_id: restaurantId,
      restaurant_name: groupItems[0]?.restaurant_name ?? "Menu Général",
      items: groupItems,
      subtotal: groupItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }));
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        comboSavings,
        restaurantGroups,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider");
  }
  return context;
}
