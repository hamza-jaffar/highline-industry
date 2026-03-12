'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server-client'

export type FormState = {
  success: boolean;
  message: string;
};

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/', 'layout')
  redirect('/shop')
}

export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const targetName = formData.get('name') as string // optional metadata mapping

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: targetName,
      }
    }
  })

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/', 'layout')
  redirect('/shop')
}

export async function signout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
