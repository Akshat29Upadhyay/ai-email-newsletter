'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sendEmail(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')

  const organizationId = (formData.get('orgId') as string) ?? ''
  const subject = ((formData.get('subject') as string) || '').trim()
  const html = ((formData.get('html') as string) || '').trim()
  if (!organizationId) throw new Error('Missing organization id')
  if (!subject) throw new Error('Subject is required')
  if (!html) throw new Error('HTML content is required')

  // Verify ownership
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, owner_id')
    .eq('id', organizationId)
    .single()
  if (orgError || !org || org.owner_id !== user.id) throw new Error('Unauthorized')

  // Fetch subscriber emails
  const { data: subscribers, error: subsError } = await supabase
    .from('subscribers')
    .select('email, status')
    .eq('organization_id', organizationId)
    .eq('status', 'subscribed')

  if (subsError) throw new Error(subsError.message)

  const recipientEmails: string[] = (subscribers || [])
    .map((s) => s.email)
    .filter((e): e is string => typeof e === 'string' && e.length > 0)

  const resendApiKey = process.env.RESEND_API_KEY
  // Safe default for development: Resend onboarding domain (no domain verification needed)
  const configuredFrom = process.env.RESEND_FROM_EMAIL
  const defaultFrom = 'Acme <onboarding@resend.dev>'
  const fromEmail = configuredFrom && !configuredFrom.endsWith('@example.com') ? configuredFrom : defaultFrom

  const fallbackTo = process.env.RESEND_FALLBACK_TO || process.env.NEWSLETTER_TEST_EMAIL

  if (!resendApiKey) throw new Error('Missing RESEND_API_KEY')

  async function send(toList: string[]) {
    return fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toList,
        subject,
        html,
      }),
    })
  }

  let finalTo: string[] = recipientEmails
  let usedFallback = false

  // If there are no recipients, try fallback immediately
  if (finalTo.length === 0) {
    if (!fallbackTo) {
      throw new Error('No subscribed recipients and RESEND_FALLBACK_TO not set')
    }
    finalTo = [fallbackTo]
    usedFallback = true
  }

  // Try sending to intended recipients
  let response = await send(finalTo)

  // If failed and we weren't already using fallback, try fallback once
  if (!response.ok && !usedFallback && fallbackTo) {
    finalTo = [fallbackTo]
    usedFallback = true
    response = await send(finalTo)
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    const message = text || response.statusText
    if (response.status === 403 && message.includes('domain is not verified')) {
      throw new Error('Resend error: Sending domain is not verified. Set RESEND_FROM_EMAIL to a verified domain or omit it to use onboarding@resend.dev during development.')
    }
    throw new Error(`Resend error: ${message}`)
  }

  // Record email in DB
  await supabase.from('emails').insert({
    organization_id: organizationId,
    subject,
    body: html,
    created_by: user.id,
    status: 'sent',
  })

  revalidatePath(`/dashboard/org/${organizationId}`)
  redirect(`/dashboard/org/${organizationId}`)
} 