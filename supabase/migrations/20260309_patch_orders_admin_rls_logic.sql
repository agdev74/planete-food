-- 1. On nettoie les anciennes politiques qui utilisaient le système JWT
DROP POLICY IF EXISTS "orders_admin_select" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;

-- 2. On recrée les politiques en ciblant notre source de vérité : la table profiles
-- LECTURE POUR ADMIN
CREATE POLICY "orders_admin_select" ON public.orders
  FOR SELECT TO authenticated
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );

-- SUPPRESSION POUR ADMIN
CREATE POLICY "orders_admin_delete" ON public.orders
  FOR DELETE TO authenticated
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );

-- MISE A JOUR POUR ADMIN (le coeur du problème soulevé par Claude)
CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE TO authenticated
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE )
  WITH CHECK ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );