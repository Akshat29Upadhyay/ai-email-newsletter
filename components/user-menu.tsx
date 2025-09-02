'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signout } from '@/app/login/actions'

export default function UserMenu({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const initial = email?.charAt(0).toUpperCase() || 'U'

  return (
    <div ref={menuRef} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </button>
      <div className={`absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-md transition ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="px-3 py-2 text-xs text-gray-500 truncate" title={email ?? undefined}>{email}</div>
        <div className="px-3 pb-3">
          <form action={signout}>
            <button type="submit" className="w-full px-3 py-2 text-sm font-medium rounded-md bg-black text-white hover:bg-red-700 transition">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 