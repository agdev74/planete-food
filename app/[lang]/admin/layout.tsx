import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminHeader from './AdminHeader' 

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: Promise<{ lang: string }> 
}) {
  const { lang } = await params 
  const cookieStore = await cookies() 

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 1. On vérifie si un utilisateur est connecté
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // 🔀 Redirection vers l'accueil car la page /login a été supprimée
    redirect(`/${lang || 'fr'}`)
  }

  // 2. On interroge la table profiles pour vérifier le rôle de cet utilisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  // 3. Le Videur : Si le profil n'existe pas ou n'est pas admin, on l'éjecte !
  if (!profile || profile.is_admin !== true) {
    redirect(`/${lang || 'fr'}`)
  }

  // 4. Si on arrive ici, l'utilisateur est un Admin légitime. On affiche le contenu.
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <AdminHeader lang={lang} />

      {/* --- ZONE DE CONTENU --- */}
      <main className="relative">
        <div className="fixed inset-0 bg-[url('/pattern-kimono.png')] opacity-[0.02] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 px-4">
          {children}
        </div>
      </main>
    </div>
  )
}