'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addSubscriber(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  const organizationId = (formData.get('orgId') as string) ?? ''
  const email = (formData.get('email') as string)?.trim()
  const name = ((formData.get('name') as string) || '').trim() || null

  if (!organizationId) throw new Error('Missing organization id')
  if (!email) throw new Error('Email is required')

  // Verify ownership of organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, owner_id')
    .eq('id', organizationId)
    .single()

  if (orgError || !org || org.owner_id !== user.id) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('subscribers').insert({
    organization_id: organizationId,
    email,
    name,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/org/${organizationId}`)
} 