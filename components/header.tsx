import Link from "next/link"
import { createClient as createServerClient } from "@/lib/supabase/server"
import UserMenu from "@/components/user-menu"

export default async function Header() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">TechForum</h1>
      </div>

      <nav className="flex items-center gap-3">
        {!user ? (
          <>
            <Link href="/login" className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition">
              Sign in
            </Link>
            <Link href="/login" className="px-4 py-2 text-sm rounded-md bg-black text-white hover:opacity-90 transition">
              Sign up
            </Link>
          </>
        ) : (
          <UserMenu email={user.email ?? null} />
        )}
      </nav>
    </header>
  )
}