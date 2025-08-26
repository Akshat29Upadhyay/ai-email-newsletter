import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

type OrganizationWithCount = {
  id: string
  name: string
  subscribers: { count: number }[]
}

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  const { data: orgsData } = await supabase
    .from('organizations')
    .select('id, name, subscribers(count)')
    .order('created_at', { ascending: false })

  const organizations = (orgsData as OrganizationWithCount[]) ?? []

  return (
    <div className="min-h-[90svh] p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold">TechForum</h1>
          <p className="text-lg text-gray-500">AI Email Newsletter Platform</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {user && (
            <Link href="/dashboard" className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:opacity-90 transition">
              Go to Dashboard
            </Link>
          )}
          <Link href="/login" className="text-sm underline">Sign up to start your own newsletter</Link>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-2">Explore Newsletters</h2>
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm h-64 overflow-y-auto">
            {organizations.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-600 p-4">No organizations yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {organizations.map((org: OrganizationWithCount) => {
                  const subscriberCount = (org.subscribers?.[0]?.count as number) ?? 0
                  return (
                    <li key={org.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{org.name}</p>
                        <p className="text-xs text-gray-500 truncate">{subscriberCount} subscribers</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/subscribe/${org.id}`} className="px-3 py-1.5 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition">Subscribe</Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}