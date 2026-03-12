'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server-client'
import { db } from '@/db'
import { userRoles } from '@/db/schemas/user-roles.schema'

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

  // Insert the authenticated user into our custom roles table
  if (data?.user) {
    try {
       await db.insert(userRoles).values({
         userId: data.user.id,
         role: 'user', // Default role for all new signups
       });
    } catch (dbError) {
       console.error("Failed to insert user role:", dbError);
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard/user')
}

export async function signout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
