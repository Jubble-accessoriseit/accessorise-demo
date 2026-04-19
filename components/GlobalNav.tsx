'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

const TABS = [
  { label: 'Home',   href: '/'       },
  { label: 'Browse', href: '/browse' },
  { label: 'Expert', href: '/expert' },
  { label: 'Garage', href: '/garage' },
  { label: 'Shop',   href: '/shop'   },
]

function getInitials(session: Session): string {
  const name = session.user.user_metadata?.full_name as string | undefined
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  return (session.user.email?.[0] ?? '?').toUpperCase()
}

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export default function GlobalNav() {
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0D0D0D]">
      {/* Logo row */}
      <div className="flex items-center justify-between px-5 py-3">
        <Link
          href="/"
          className="no-underline text-[#F5F3EE] text-sm uppercase tracking-[0.04em]"
          style={{ fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900 }}
        >
          ACCESSORISE <span className="text-[#1C69D4]">IT</span>
        </Link>

        {session ? (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-[#1C69D4]"
            style={{ backgroundColor: 'rgba(28,105,212,0.12)' }}
          >
            {getInitials(session)}
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#1C69D4] no-underline"
            style={{ border: '1px solid rgba(28,105,212,0.35)' }}
          >
            Log in
          </Link>
        )}
      </div>

      {/* Tab row */}
      <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(({ label, href }) => {
          const active = isActive(href, pathname)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 whitespace-nowrap text-center text-xs no-underline"
              style={{
                color: active ? '#1C69D4' : '#5A5852',
                fontWeight: active ? 600 : 500,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                paddingTop: '13px',
                paddingBottom: '10px',
                borderBottom: active ? '3px solid #1C69D4' : '3px solid transparent',
                backgroundColor: active ? 'rgba(28,105,212,0.06)' : 'transparent',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
