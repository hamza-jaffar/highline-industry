'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server-client'
import { db } from '@/db'
import { userRoles } from '@/db/schemas/user-roles.schema'
import { getUserRole } from '@/lib/db/queries'

export type FormState = {
  success: boolean;
  message: string;
};

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, message: error.message };
  }

  // Get user role and redirect to appropriate dashboard
  if (data?.user) {
    try {
      const role = await getUserRole(data.user.id);
      revalidatePath('/', 'layout')
      redirect(`/dashboard/${role}`)
    } catch (error) {
      console.error('Error getting user role after login:', error);
      // Fallback to user dashboard
      revalidatePath('/', 'layout')
      redirect('/dashboard/user')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard/user')
}

export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const targetName = formData.get('name') as string // optional metadata mapping

  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signUp({
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

  // Always assume email confirmation is required for security
  // Role will be created in the callback route after email verification
  return {
    success: true,
    message: "Registration successful! Please check your email and click the verification link to complete your account setup."
  };
}

export async function signout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
