'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Clean inputs: trim whitespace and enforce lowercase on email
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Supabase Auth Login Error:', error.message)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  const { data: allowedUser, error: allowlistError } = await supabase
    .from('allowed_users')
    .select('id')
    .ilike('email', email)
    .maybeSingle()

  if (allowlistError) {
    console.error('Allowed users lookup error:', allowlistError.message)
    await supabase.auth.signOut()
    redirect('/login?error=The allowed_users table could not be checked. Apply the Supabase RLS migration.')
  }

  if (!allowedUser) {
    await supabase.auth.signOut()
    redirect('/login?error=This account is not authorized to use the application.')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}