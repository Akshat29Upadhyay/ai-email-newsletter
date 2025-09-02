'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function sendEmail(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')

  const organizationId = (formData.get('orgId') as string) ?? ''
  const subject = ((formData.get('subject') as string) || '').trim()
  const baseHtml = ((formData.get('html') as string) || '').trim()
  if (!organizationId) throw new Error('Missing organization id')
  if (!subject) throw new Error('Subject is required')
  if (!baseHtml) throw new Error('HTML content is required')

  // Verify ownership
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, owner_id, name')
    .eq('id', organizationId)
    .single()
  if (orgError || !org || org.owner_id !== user.id) throw new Error('Unauthorized')

  // Fetch subscriber emails
  const { data: subscribers, error: subsError } = await supabase
    .from('subscribers')
    .select('email, status, name')
    .eq('organization_id', organizationId)
    .eq('status', 'subscribed')

  if (subsError) throw new Error(subsError.message)

  const recipientEmails: string[] = (subscribers || [])
    .map((s) => s.email)
    .filter((e): e is string => typeof e === 'string' && e.length > 0)

  const resendApiKey = process.env.RESEND_API_KEY
  const configuredFrom = process.env.RESEND_FROM_EMAIL
  const defaultFrom = 'Acme <onboarding@resend.dev>'
  const fromEmail = configuredFrom && !configuredFrom.endsWith('@example.com') ? configuredFrom : defaultFrom
  const fallbackTo = process.env.RESEND_FALLBACK_TO || process.env.NEWSLETTER_TEST_EMAIL

  if (!resendApiKey) throw new Error('Missing RESEND_API_KEY')

  // Build robust absolute base URL
  const envSite = process.env.NEXT_PUBLIC_SITE_URL?.trim() || ''
  const vercelUrl = process.env.VERCEL_URL?.trim() || ''
  const normalizedBase = envSite
    ? envSite.replace(/\/$/, '')
    : vercelUrl
    ? `https://${vercelUrl.replace(/\/$/, '')}`
    : 'http://localhost:3000'

  function withUnsubscribeFooter(html: string, email: string, recipientName?: string) {
    const unsubscribeUrl = `${normalizedBase}/api/unsubscribe?org=${encodeURIComponent(organizationId)}&email=${encodeURIComponent(email)}`
    const greeting = recipientName ? `Hi ${recipientName},<br><br>` : ''
    const footer = `
      <hr style="margin-top:24px;margin-bottom:12px;border:none;border-top:1px solid #e5e7eb;"/>
      <p style="color:#6b7280;font-size:12px;line-height:1.5;">
        If you no longer wish to receive these emails from ${org?.name || 'our newsletter'}, you can 
        <a href="${unsubscribeUrl}" style="color:#3b82f6;">unsubscribe here</a>.
      </p>
      <p style="color:#6b7280;font-size:12px;line-height:1.5;">
        This email was sent to ${email}
      </p>
    `
    return greeting + html + footer
  }

  // Initialize Resend
  const resend = new Resend(resendApiKey)

  let finalTo: string[] = recipientEmails
  let usedFallback = false

  if (finalTo.length === 0) {
    if (!fallbackTo) {
      throw new Error('No subscribed recipients and RESEND_FALLBACK_TO not set')
    }
    finalTo = [fallbackTo]
    usedFallback = true
  }

  try {
    // Send emails in batches to avoid rate limits
    const batchSize = 50 // Resend allows up to 100 recipients per email
    const batches = []
    
    for (let i = 0; i < finalTo.length; i += batchSize) {
      const batch = finalTo.slice(i, i + batchSize)
      batches.push(batch)
    }

    const emailPromises = batches.map(async (batch) => {
      if (batch.length === 1) {
        // Single recipient - personalize the email
        const recipient = subscribers?.find(s => s.email === batch[0])
        const personalizedHtml = withUnsubscribeFooter(baseHtml, batch[0], recipient?.name || undefined)
        
        return resend.emails.send({
          from: fromEmail,
          to: batch[0],
          subject: subject,
          html: personalizedHtml,
        })
      } else {
        // Multiple recipients - use generic unsubscribe footer
        const genericHtml = withUnsubscribeFooter(baseHtml, '')
        
        return resend.emails.send({
          from: fromEmail,
          to: batch,
          subject: subject,
          html: genericHtml,
        })
      }
    })

    const results = await Promise.all(emailPromises)
    
    // Check for any failures
    const failedEmails = results.filter(result => result.error)
    if (failedEmails.length > 0) {
      console.error('Some emails failed to send:', failedEmails)
      // Continue with successful sends, but log the failures
    }

    // Log successful sends
    const successfulSends = results.filter(result => !result.error).length
    console.log(`Successfully sent ${successfulSends} emails to ${finalTo.length} recipients`)

  } catch (error) {
    console.error('Resend API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('domain is not verified')) {
        throw new Error('Resend error: Sending domain is not verified. Set RESEND_FROM_EMAIL to a verified domain or omit it to use onboarding@resend.dev during development.')
      }
      if (error.message.includes('API key')) {
        throw new Error('Resend error: Invalid API key. Please check your RESEND_API_KEY environment variable.')
      }
      throw new Error(`Resend error: ${error.message}`)
    }
    
    throw new Error('Failed to send emails. Please try again.')
  }

  // Record the email in the database
  try {
    await supabase.from('emails').insert({
      organization_id: organizationId,
      subject,
      body: baseHtml,
      created_by: user.id,
      status: 'sent',
      recipient_count: finalTo.length,
    })
  } catch (dbError) {
    console.error('Failed to record email in database:', dbError)
    // Don't fail the entire operation if database recording fails
  }

  revalidatePath(`/dashboard/org/${organizationId}`)
  redirect(`/dashboard/org/${organizationId}`)
} 