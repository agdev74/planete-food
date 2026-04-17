-- 1. On nettoie les anciennes politiques permissives
DROP POLICY IF EXISTS "owner_full_access" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- 2. On autorise la LECTURE de son propre profil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- 3. On autorise la CRÉATION de son propre profil (quand on se connecte la 1ere fois)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. LA SÉCURITÉ : On autorise la MISE À JOUR, mais on bloque is_admin et is_livreur
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Le hack : on force la nouvelle valeur à être strictement égale à l'ancienne valeur en base
    AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    -- (Décommente la ligne ci-dessous si tu as déjà créé la colonne is_livreur en base)
    -- AND is_livreur = (SELECT is_livreur FROM public.profiles WHERE id = auth.uid())
  );