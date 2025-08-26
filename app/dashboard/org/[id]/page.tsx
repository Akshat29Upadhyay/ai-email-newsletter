import { redirect } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { addSubscriber } from './actions'

type Subscriber = {
  id: string
  email: string
  name: string | null
  status: string
  created_at: string
}

export default async function OrgPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: auth, error } = await supabase.auth.getUser()
  if (error || !auth?.user) redirect('/login')

  // Verify the org belongs to the current user
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, owner_id')
    .eq('id', params.id)
    .single()

  if (!org || org.owner_id !== auth.user.id) {
    redirect('/dashboard')
  }

  // Fetch subscribers
  const { data: subscribersData } = await supabase
    .from('subscribers')
    .select('id, email, name, status, created_at')
    .eq('organization_id', params.id)
    .order('created_at', { ascending: false })

  const subscribers: Subscriber[] = (subscribersData as Subscriber[]) ?? []

  return (
    <div className="max-w-5xl mx-auto p-4 h-[90svh]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{org.name}</h1>
        <p className="text-sm text-gray-600">Organization ID: {org.id}</p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-3">Subscribers ({subscribers.length})</h2>
          {subscribers.length === 0 ? (
            <p className="text-sm text-gray-600">No subscribers yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {subscribers.map((s: Subscriber) => (
                <li key={s.id} className="py-3">
                  <p className="font-medium">{s.email}</p>
                  <p className="text-xs text-gray-500">{s.name ?? '—'} • {s.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-3">Add Subscriber</h2>
          <form action={addSubscriber} className="flex flex-col gap-3">
            <input type="hidden" name="orgId" value={org.id} />
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input id="email" name="email" type="email" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Name (optional)</label>
              <input id="name" name="name" type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <button type="submit" className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:opacity-90 transition w-fit">Add</button>
          </form>
        </div>
      </section>

      <section className="mt-8 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-medium mb-2">Public subscribe link</h2>
        <p className="text-sm text-gray-700 mb-3">Share this link so people can subscribe to your newsletter:</p>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="px-2 py-1 bg-gray-100 rounded text-xs">/subscribe/{org.id}</code>
          <Link href={`/subscribe/${org.id}`} className="text-sm text-black underline">Open</Link>
        </div>
      </section>
    </div>
  )
} 