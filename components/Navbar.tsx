import { createClient } from '@/utils/supabase/server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    isAdmin = data?.role === 'admin'
  }

  return <NavbarClient isLoggedIn={Boolean(user)} isAdmin={isAdmin} />
}
