'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addPublicSubscriber(formData: FormData) {
  const supabase = await createClient()
  const organizationId = (formData.get('orgId') as string) ?? ''
  const email = (formData.get('email') as string)?.trim()
  const name = ((formData.get('name') as string) || '').trim() || null

  if (!organizationId) throw new Error('Missing organization id')
  if (!email) throw new Error('Email is required')

  // Insert subscriber (RLS policy must allow anon insert)
  const { error } = await supabase.from('subscribers').insert({
    organization_id: organizationId,
    email,
    name,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/subscribe/${organizationId}`)
} 