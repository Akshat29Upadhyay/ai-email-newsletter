import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from './send'
import ComposeEditor from './ComposeEditor'

export default async function ComposePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: auth, error } = await supabase.auth.getUser()
  if (error || !auth?.user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, owner_id')
    .eq('id', params.id)
    .single()

  if (!org || org.owner_id !== auth.user.id) redirect('/dashboard')

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Compose email – {org.name}</h1>
      <ComposeEditor orgId={org.id} action={sendEmail} />
    </div>
  )
} 