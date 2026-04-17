-- 1. On coupe l'accès direct via l'API publique (anonyme et utilisateurs connectés)
REVOKE ALL ON public.profiles_old_backup FROM anon, authenticated;

-- 2. On désintègre toutes les anciennes politiques permissives (IF EXISTS pour la sécurité)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles_old_backup;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles_old_backup;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles_old_backup;
DROP POLICY IF EXISTS "owner_full_access" ON public.profiles_old_backup;

-- 3. On force l'activation du bouclier RLS (au cas où il aurait été désactivé)
ALTER TABLE public.profiles_old_backup ENABLE ROW LEVEL SECURITY;