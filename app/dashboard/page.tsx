import { redirect } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { createOrganization, listOrganizations } from './actions'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  const organizations = await listOrganizations()

  return (
    <div className="max-w-5xl mx-auto p-4 min-h-[80svh]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome, {data.user.email}</p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-3">Your Newsletters</h2>
          <div className="max-h-64 overflow-y-auto">
            {organizations.length === 0 ? (
              <p className="text-sm text-gray-600 p-2">No newsletters yet. Create one to get started.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {organizations.map((org) => (
                  <li key={org.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-gray-500">ID: {org.id}</p>
                    </div>
                    <Link href={`/dashboard/org/${org.id}`} className="text-sm text-black underline">Open</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-3">Create Organization</h2>
          <form action={createOrganization} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
              <input id="name" name="name" type="text" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <button type="submit" className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:opacity-90 transition w-fit">Create</button>
          </form>
        </div>
      </section>

      
    </div>
  )
}