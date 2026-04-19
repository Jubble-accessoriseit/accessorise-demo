'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
  const pathname  = usePathname()
  const router    = useRouter()
  const [session, setSession]           = useState<Session | null>(null)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [signingOut, setSigningOut]     = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  async function handleSignOut() {
    setSigningOut(true)
    setMenuOpen(false)
    await supabase.auth.signOut()
    setSigningOut(false)
    router.push('/')
  }

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
          <div ref={avatarRef} style={{ position: 'relative' }}>
            {/* Avatar button */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                backgroundColor: menuOpen ? 'rgba(28,105,212,0.22)' : 'rgba(28,105,212,0.12)',
                border: menuOpen ? '1px solid rgba(28,105,212,0.4)' : '1px solid transparent',
                color: '#1C69D4', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              {signingOut ? (
                <span style={{ fontSize: 10, opacity: 0.6 }}>…</span>
              ) : (
                getInitials(session)
              )}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                backgroundColor: '#141414',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, overflow: 'hidden',
                minWidth: 148,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                zIndex: 100,
              }}>
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3.5 py-2.5 text-[#F5F3EE] no-underline hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors"
                  style={{
                    fontSize: 12, fontWeight: 500,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  My account
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="block w-full text-left px-3.5 py-2.5 text-[#F5F3EE] bg-transparent border-none hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors disabled:opacity-50"
                  style={{ fontSize: 12, fontWeight: 500, cursor: signingOut ? 'not-allowed' : 'pointer' }}
                >
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            )}
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
