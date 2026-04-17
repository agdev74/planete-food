"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Search, Edit2, Trash2, Plus, X, Upload, Loader2,
  CheckCircle2, AlertCircle, Wand2, Lock,
  LogOut, Power, PowerOff, RefreshCw
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";

interface MenuItem {
  id: number;
  name_fr: string;
  name_en: string;
  name_es: string;
  price: string | number;
  category: string;
  description_fr: string;
  description_en: string;
  description_es: string;
  image_url: string;
  is_available: boolean;
  restaurant_id: number | null;
}

interface RestaurantOption {
  id: number;
  name: string;
}

export default function AdminMenu() {
  const supabase = useMemo(() => createClient(), []);
  const { lang } = useTranslation();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [restaurantsLoaded, setRestaurantsLoaded] = useState(false);
  const [activeRestaurantId, setActiveRestaurantId] = useState<number | null>(null);

  const [form, setForm] = useState<Omit<MenuItem, 'id' | 'is_available'>>({
    name_fr: "", name_en: "", name_es: "",
    price: "",
    category: "Nos Spécialités",
    description_fr: "", description_en: "", description_es: "",
    image_url: "",
    restaurant_id: null,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Receives restaurantId as a parameter so it never captures activeRestaurantId
  // in its closure — deps stay [supabase, showToast] and the function is stable forever.
  const fetchMenu = useCallback(async (restaurantId: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("id", { ascending: false });

    if (error) {
      showToast(error.message, 'error');
    } else if (data) {
      setItems(data as MenuItem[]);
    }
    setLoading(false);
  }, [supabase, showToast]);

  // Fetch restaurants once; sets activeRestaurantId which triggers the menu fetch below.
  useEffect(() => {
    supabase.from("restaurants").select("id, name").order("name")
      .then(({ data, error }) => {
        if (error) {
          console.error("[DIAG] Erreur fetch restaurants (menu):", error);
        }
        if (data && data.length > 0) {
          setRestaurants(data as RestaurantOption[]);
          setActiveRestaurantId((data as RestaurantOption[])[0].id);
        }
      })
      .finally(() => setRestaurantsLoaded(true));
  }, [supabase]);

  // Fetch menu whenever the active restaurant changes. fetchMenu is stable so this
  // only re-runs when activeRestaurantId actually changes — no spurious re-fetches.
  useEffect(() => {
    if (activeRestaurantId === null) return;
    fetchMenu(activeRestaurantId);
  }, [activeRestaurantId, fetchMenu]);

  const activeRestaurantName = restaurants.find(r => r.id === activeRestaurantId)?.name ?? "—";

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !currentStatus })
      .eq("id", id);

    if (error) {
      showToast("Erreur de mise à jour", "error");
    } else {
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, is_available: !currentStatus } : item
      ));
      showToast(!currentStatus ? "Produit activé" : "Produit marqué comme épuisé");
    }
    setUpdatingId(null);
  };

  const handleTranslate = async () => {
    if (!form.name_fr && !form.description_fr) {
      showToast("Remplissez d'abord le Français", 'error');
      return;
    }
    setIsTranslating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setForm(prev => ({
        ...prev,
        name_en: prev.name_en || prev.name_fr,
        name_es: prev.name_es || prev.name_fr,
        description_en: prev.description_en || prev.description_fr,
        description_es: prev.description_es || prev.description_fr
      }));
      showToast("Suggestions générées !");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = `/${lang}/login?logout=true`;
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('sushi-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('sushi-images').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
      showToast("Image mise à jour !");
    } catch (err) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);

    const safePrice = String(form.price).replace(',', '.');
    const productData = { ...form, price: parseFloat(safePrice) };

    try {
      if (editingId) {
        const { error } = await supabase.from("menu_items").update(productData).eq("id", editingId);
        if (error) throw error;
        showToast("Produit modifié !");
      } else {
        const { error } = await supabase.from("menu_items").insert([{ ...productData, is_available: true }]);
        if (error) throw error;
        showToast("Nouveau produit ajouté !");
      }
      setIsModalOpen(false);
      resetForm();
      if (activeRestaurantId !== null) fetchMenu(activeRestaurantId);
    } catch (err) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (confirm(`Supprimer définitivement "${name}" ?`)) {
      try {
        const { error } = await supabase.from("menu_items").delete().eq("id", id);
        if (error) throw error;
        setItems(prev => prev.filter(i => i.id !== id));
        showToast("Produit supprimé.");
      } catch (err) {
        const error = err as Error;
        showToast(error.message, 'error');
      }
    }
  }

  const resetForm = () => {
    setForm({
      name_fr: "", name_en: "", name_es: "", price: "",
      category: "Nos Spécialités", description_fr: "", description_en: "", description_es: "",
      image_url: "", restaurant_id: activeRestaurantId,
    });
    setEditingId(null);
  };

  const openEditModal = (item: MenuItem) => {
    setForm({
      ...item,
      price: item.price ? item.price.toString() : "",
      name_en: item.name_en || "",
      name_es: item.name_es || "",
      description_en: item.description_en || "",
      description_es: item.description_es || ""
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const filteredItems = items.filter((item) =>
    (item.name_fr || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (item.category || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white pt-24 md:pt-32">
      <AnimatePresence>
        {toast && (
          <m.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-10 right-10 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-neutral-900/90 border-green-500/50 text-green-400' : 'bg-neutral-900/90 border-red-500/50 text-red-400'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-xs uppercase tracking-widest">{toast.message}</span>
          </m.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold uppercase tracking-wider text-brand-primary">Administration</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 mt-4 text-xs font-bold text-gray-400 hover:text-white bg-neutral-900/50 border border-neutral-800 rounded-xl transition-all hover:bg-red-600/10 hover:border-red-600/40 uppercase tracking-widest shadow-inner">
              <LogOut size={14} /> Se déconnecter
            </button>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} disabled={activeRestaurantId === null} className="flex items-center gap-2 bg-brand-primary hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-violet-900/20 uppercase text-xs tracking-widest disabled:opacity-40 disabled:cursor-not-allowed">
             <Plus size={20} /> Nouveau Produit
          </button>
        </div>

        {/* Restaurant tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {!restaurantsLoaded ? (
            <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase font-bold tracking-widest">
              <Loader2 size={14} className="animate-spin" /> Chargement des enseignes…
            </div>
          ) : restaurants.length === 0 ? (
            <p className="text-neutral-500 text-xs uppercase font-bold tracking-widest">Aucune enseigne trouvée.</p>
          ) : (
            restaurants.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRestaurantId(r.id)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                  activeRestaurantId === r.id
                    ? "bg-brand-primary border-brand-primary text-white shadow-glow"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                }`}
              >
                {r.name}
              </button>
            ))
          )}
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="Rechercher..." className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-brand-primary outline-none shadow-xl transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-500">
              <Loader2 className="animate-spin text-brand-primary" size={40} />
              <p className="italic uppercase text-xs tracking-widest">Chargement…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-800/50 text-gray-400 uppercase text-xs tracking-widest">
                  <tr>
                    <th className="p-5">Plat</th>
                    <th className="p-5 text-center">Catégorie</th>
                    <th className="p-5 text-center">Disponibilité</th>
                    <th className="p-5 text-center">Prix</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-neutral-600 text-xs uppercase tracking-widest font-bold italic">
                        Aucun produit pour {activeRestaurantName}
                      </td>
                    </tr>
                  )}
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={`transition-colors group ${!item.is_available ? 'bg-red-900/5 opacity-60' : 'hover:bg-white/5'}`}>
                      <td className="p-5 flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0">
                          <Image src={item.image_url || "/placeholder-sushi.jpg"} alt={item.name_fr || "Produit"} fill className={`rounded-xl object-cover bg-neutral-800 border border-neutral-800 shadow-lg ${!item.is_available ? 'grayscale' : ''}`} />
                        </div>
                        <div>
                          <div className="font-bold text-white">{item.name_fr}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 italic">{item.description_fr}</div>
                        </div>
                      </td>
                      <td className="p-5 text-center text-xs text-gray-400 font-bold uppercase">{item.category}</td>
                      <td className="p-5 text-center">
                        <button onClick={() => toggleAvailability(item.id, item.is_available)} disabled={updatingId === item.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all border ${item.is_available ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"}`}>
                          {updatingId === item.id ? <RefreshCw size={12} className="animate-spin" /> : item.is_available ? <><Power size={12} /> Actif</> : <><PowerOff size={12} /> Épuisé</>}
                        </button>
                      </td>
                      <td className="p-5 text-center font-mono text-brand-primary font-bold">{Number(item.price || 0).toFixed(2)} CHF</td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => openEditModal(item)} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(item.id, item.name_fr || String(item.id))} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 md:backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity" style={{ WebkitTransform: 'translate3d(0,0,0)' }}>
            <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-3xl max-w-4xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
                <h2 className="text-2xl font-bold uppercase tracking-tighter">{editingId ? "Modifier" : "Ajouter"}</h2>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleTranslate} disabled={isTranslating} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition disabled:opacity-50">
                    {isTranslating ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />} Traduire
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="bg-neutral-800 p-2 rounded-full hover:bg-neutral-700 transition"><X size={20} /></button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Nom (FR)</label><input className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-brand-primary transition text-white" value={form.name_fr} onChange={e => setForm({...form, name_fr: e.target.value})} required /></div>
                  <div><label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Nom (EN)</label><input className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-brand-primary transition text-white" value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} /></div>
                  <div><label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Nom (ES)</label><input className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-brand-primary transition text-white" value={form.name_es} onChange={e => setForm({...form, name_es: e.target.value})} /></div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div><label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Prix (CHF)</label><input type="text" inputMode="decimal" className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-brand-primary transition text-white" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
                  <div>
                    <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Catégorie</label>
                    <select className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-brand-primary transition text-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="Nos Spécialités">Nos Spécialités</option>
                      <option value="Entrées">Entrées</option>
                      <option value="Plats Principaux">Plats Principaux</option>
                      <option value="Accompagnements">Accompagnements</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Boissons">Boissons</option>
                      <option value="Formules">Formules</option>
                      <option value="À Partager">À Partager</option>
                      <option value="Burgers">Burgers</option>
                      <option value="Pizzas">Pizzas</option>
                      <option value="Tacos & Crêpes">Tacos & Crêpes</option>
                      <option value="BBQ & Grillades">BBQ & Grillades</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Restaurant</label>
                    <div className="w-full bg-black border border-neutral-700 p-3 rounded-xl text-white flex items-center gap-2 text-sm">
                      <Lock size={13} className="text-neutral-500 shrink-0" />
                      <span className="font-bold truncate">{activeRestaurantName}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Desc (FR)</label><textarea className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-brand-primary h-24 transition text-white" value={form.description_fr} onChange={e => setForm({...form, description_fr: e.target.value})} /></div>
                  <div><label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Desc (EN)</label><textarea className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-brand-primary h-24 transition text-white" value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})} /></div>
                  <div><label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Desc (ES)</label><textarea className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-brand-primary h-24 transition text-white" value={form.description_es} onChange={e => setForm({...form, description_es: e.target.value})} /></div>
                </div>

                <div className="border-2 border-dashed border-neutral-800 p-6 rounded-2xl text-center hover:border-brand-primary transition-colors group relative">
                  {form.image_url ? (
                    <div className="relative inline-block">
                      <Image src={form.image_url} alt="Aperçu" width={150} height={128} className="rounded-lg object-cover shadow-xl" />
                      <button type="button" onClick={() => setForm(prev => ({...prev, image_url: ""}))} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white shadow-lg"><X size={12}/></button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto mb-2 text-gray-600 group-hover:text-brand-primary transition-colors" />
                      <label htmlFor="image-upload-admin" className="cursor-pointer text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                        {uploading ? "Envoi..." : "Upload photo"}
                      </label>
                      <input id="image-upload-admin" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </>
                  )}
                </div>

                <button type="submit" disabled={actionLoading || uploading || isTranslating} className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-violet-700 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50">
                  {actionLoading ? <Loader2 className="animate-spin" size={20} /> : (editingId ? "Sauvegarder" : "Ajouter")}
                </button>
              </form>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
