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

  const fetchProfile = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      // ⚡ BYPASS CLIENT : On utilise l'API serveur pour lire le profil
      const response = await fetch("/api/get-profile");
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("[UserContext Fetch Error]:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    await fetchProfile(true);
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
          await fetchProfile();
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