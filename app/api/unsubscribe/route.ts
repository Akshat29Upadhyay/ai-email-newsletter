import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('org')
  const email = searchParams.get('email')

  if (!orgId || !email) {
    return new NextResponse('Missing org or email', { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('subscribers')
    .update({ status: 'unsubscribed' })
    .eq('organization_id', orgId)
    .ilike('email', email)

  if (error) {
    return new NextResponse('Failed to unsubscribe', { status: 500 })
  }

  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Unsubscribed</title></head><body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji; padding: 24px;">` +
      `<h1 style="font-size: 20px; margin: 0 0 12px;">You have been unsubscribed</h1>` +
      `<p style="color:#475569; margin:0;">${email} will no longer receive emails from this organization.</p>` +
      `</body></html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  )
} 