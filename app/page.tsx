import Link from 'next/link'

const HOME_HERO_IMAGE_URL =
  'https://exieufhwbrbeilmjltny.supabase.co/storage/v1/object/public/app-assets/home/home-hero-accessories-collage-v1.png'

const ORANGE = '#E8841A'

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{
        display: 'inline-block', width: 3, height: 14,
        backgroundColor: ORANGE, borderRadius: 2, flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
        fontWeight: 900, fontSize: 12, color: '#F5F3EE',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {children}
      </span>
    </div>
  )
}

// ── Explore cards ─────────────────────────────────────────────────────────────

type ExploreCardProps = {
  href: string
  icon: React.ReactNode
  title: string
  subtitle: string
  fullWidth?: boolean
}

function ExploreCard({ href, icon, title, subtitle, fullWidth = false }: ExploreCardProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: fullWidth ? 'row' : 'column',
        alignItems: fullWidth ? 'center' : 'flex-start',
        gap: fullWidth ? 14 : 10,
        backgroundColor: '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: fullWidth ? '16px 14px' : '13px 12px 14px',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: fullWidth ? 40 : 34,
        height: fullWidth ? 40 : 34,
        borderRadius: 9,
        backgroundColor: `rgba(232,132,26,0.1)`,
        border: `1px solid rgba(232,132,26,0.22)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 600, fontSize: 13, color: '#F5F3EE',
          lineHeight: 1.25,
        }}>
          {title}
        </p>
        <p style={{
          margin: '3px 0 0', fontSize: 11, color: '#6A6860', lineHeight: 1.45,
        }}>
          {subtitle}
        </p>
      </div>

      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, alignSelf: fullWidth ? 'center' : 'flex-end', marginTop: fullWidth ? 0 : 6 }}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  )
}

// ── Why row ───────────────────────────────────────────────────────────────────

function WhyRow({
  icon,
  title,
  description,
  last = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  last?: boolean
}) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 0' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          backgroundColor: `rgba(232,132,26,0.1)`,
          border: `1px solid rgba(232,132,26,0.22)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 3px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 600, fontSize: 13, color: '#F5F3EE',
          }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: '#6A6860', lineHeight: 1.55 }}>
            {description}
          </p>
        </div>
      </div>
      {!last && (
        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', margin: '0 -14px' }} />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', paddingBottom: 40 }}>

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 280 }}>
        <img
          src={HOME_HERO_IMAGE_URL}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center right',
          }}
        />
        {/* Gradient overlay — dark on left, fades right */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(13,13,13,0.92) 40%, rgba(13,13,13,0.55) 75%, rgba(13,13,13,0.3) 100%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '32px 20px 36px', maxWidth: 260 }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: 16,
          }}>
            <span style={{
              display: 'inline-block', width: 6, height: 6,
              borderRadius: '50%', backgroundColor: ORANGE, flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 10, fontWeight: 600, color: ORANGE,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              For every bike
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            margin: '0 0 10px',
            fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
            fontWeight: 900, fontSize: 40, lineHeight: 1.0,
            textTransform: 'uppercase', letterSpacing: '0.02em',
          }}>
            <span style={{ color: '#F5F3EE' }}>Find the<br /></span>
            <span style={{ color: ORANGE }}>right fit.</span>
          </h1>

          {/* Subheading */}
          <p style={{
            margin: '0 0 24px',
            fontSize: 12, color: 'rgba(245,243,238,0.65)', lineHeight: 1.6,
          }}>
            Accessories matched<br />to your bike.
          </p>

          {/* Primary CTA */}
          <Link
            href="/browse"
            style={{
              display: 'inline-block',
              backgroundColor: ORANGE,
              color: '#0D0D0D',
              borderRadius: 8,
              padding: '13px 20px',
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: 12,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            Start with your bike
          </Link>
        </div>
      </section>

      {/* ── 2. Explore ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '24px 20px 0' }}>
        <SectionHeading>Explore</SectionHeading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Full-width lead card */}
          <ExploreCard
            fullWidth
            href="/browse"
            title="Find Accessories"
            subtitle="Build your list"
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />

          {/* 2×2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <ExploreCard
              href="/expert"
              title="Expert Builds"
              subtitle="See real setups"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              }
            />
            <ExploreCard
              href="/garage/build?step=Compare"
              title="Compare Builds"
              subtitle="Your build vs expert builds"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <polyline points="8 7 3 12 8 17" />
                  <polyline points="16 7 21 12 16 17" />
                </svg>
              }
            />
            <ExploreCard
              href="/garage"
              title="Save to Garage"
              subtitle="Keep bikes & builds"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }
            />
            <ExploreCard
              href="/shop"
              title="Shop"
              subtitle="Ready to buy"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ── 3. Why Accessorise It ───────────────────────────────────────────── */}
      <section style={{ padding: '24px 20px 0' }}>
        <SectionHeading>Why Accessorise It</SectionHeading>

        <div style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '0 14px',
        }}>
          <WhyRow
            title="Guaranteed fit"
            description="Every accessory is filtered to your exact bike before you see it — no guessing, no returns."
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
          />
          <WhyRow
            title="Real expert builds"
            description="Learn from riders who've already done it — complete builds on bikes just like yours."
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            }
          />
          <WhyRow
            last
            title="Multiple suppliers"
            description="Compare prices and stock across all retailers in one place — always see the best deal."
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            }
          />
        </div>
      </section>

    </main>
  )
}
