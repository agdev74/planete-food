"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export type UserProfile = {
  id: string; full_name: string | null; phone: string | null;
  wallet_balance: number; is_admin: boolean; address: string | null;
  zip_code: string | null; city: string | null;
};

type UserContextType = {
  user: User | null; profile: UserProfile | null; loading: boolean;
  refreshProfile: () => Promise<void>; signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  // ✅ On utilise directement Supabase Client (qui ne souffre pas du cache de Next.js)
  const fetchProfile = useCallback(async (userId: string, silent = false) => {
    if (!silent) setLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (err) {
      console.error("[UserContext Fetch Error]:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ✅ La fonction magique qui force la récupération des données fraîches
  const refreshProfile = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await fetchProfile(currentUser.id, true);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null); setProfile(null); setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error("useUser must be used within a UserProvider");
  return context;
};