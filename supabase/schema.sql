-- 1. Création de la table 'profiles'
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  wallet_balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sécurité RLS : Un utilisateur ne peut voir et modifier que SON propre profil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs voient leur propre profil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Les utilisateurs modifient leur propre profil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Création de la table 'loyalty_transactions'
CREATE TABLE public.loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL, -- Positif pour un gain, Négatif pour une dépense
  order_id TEXT, -- Pour lier la transaction à une commande Stripe
  description TEXT, -- Ex: 'Cashback Commande #123'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sécurité RLS : Un utilisateur ne peut voir que SES transactions
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs voient leurs propres transactions" ON public.loyalty_transactions FOR SELECT USING (auth.uid() = user_id);

-- 3. AUTOMATISATION : Créer un profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. AUTOMATISATION : Mettre à jour la cagnotte automatiquement à chaque transaction
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + NEW.amount
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_loyalty_transaction_inserted
  AFTER INSERT ON public.loyalty_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();