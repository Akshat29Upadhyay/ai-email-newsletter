'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createOrganization(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  const name = (formData.get('name') as string)?.trim()
  if (!name) {
    throw new Error('Organization name is required')
  }

  const { error } = await supabase.from('organizations').insert({
    name,
    owner_id: user.id,
  })
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function listOrganizations() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
} 