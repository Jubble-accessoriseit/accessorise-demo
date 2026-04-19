import Link from 'next/link'
import { HomeHeroCtas } from './components/HomeHeroCtas'

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{
        display: 'inline-block', width: 3, height: 14,
        backgroundColor: '#1C69D4', borderRadius: 2, flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
        fontWeight: 900, fontSize: 12, color: '#F5F3EE',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {label}
      </span>
      {count && (
        <span style={{ fontSize: 11, color: '#44423E' }}>{count}</span>
      )}
    </div>
  )
}

function FeatureCard({
  title,
  descriptor,
  barColor,
  href,
}: {
  title: string
  descriptor: string
  barColor: string
  href: string
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        backgroundColor: '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '13px 13px 14px',
        textDecoration: 'none',
        borderTop: `3px solid ${barColor}`,
      }}
    >
      <span style={{
        fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
        fontWeight: 900, fontSize: 12, color: '#F5F3EE',
        textTransform: 'uppercase', letterSpacing: '0.04em',
        lineHeight: 1.2,
      }}>
        {title}
      </span>
      <span style={{ fontSize: 11, color: '#6A6860', lineHeight: 1.45 }}>
        {descriptor}
      </span>
    </Link>
  )
}

function ValueProp({
  icon,
  headline,
  descriptor,
}: {
  icon: React.ReactNode
  headline: string
  descriptor: string
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        backgroundColor: 'rgba(28,105,212,0.1)',
        border: '1px solid rgba(28,105,212,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 3px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 600, fontSize: 12, color: '#F5F3EE',
        }}>
          {headline}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: '#6A6860', lineHeight: 1.5 }}>
          {descriptor}
        </p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', paddingBottom: 40 }}>

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#110F0A', padding: '28px 20px 32px' }}>

        {/* Motorcycles category pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: 'rgba(28,105,212,0.1)',
          border: '1px solid rgba(28,105,212,0.22)',
          borderRadius: 20, padding: '5px 12px',
          marginBottom: 20,
        }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6,
            borderRadius: '50%', backgroundColor: '#1C69D4', flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: '#1C69D4' }}>
            Motorcycles
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          margin: '0 0 14px',
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 44, lineHeight: 1.02,
          color: '#F5F3EE', textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}>
          Find Gear /<br />
          That{' '}
          <span style={{ color: '#1C69D4' }}>Fits.</span>
        </h1>

        {/* Subtext */}
        <p style={{
          margin: '0 0 24px',
          fontSize: 12, color: '#6A6860', lineHeight: 1.65,
          maxWidth: 340,
        }}>
          Select your exact bike. Browse accessories with guaranteed fitment.
          Plan your build, compare expert setups, and shop with confidence.
        </p>

        {/* CTAs — auth-aware client component */}
        <HomeHeroCtas />
      </section>

      {/* ── 2. Jump straight in ─────────────────────────────────────────────── */}
      <section style={{ padding: '24px 20px 0' }}>
        <SectionHeader label="Jump straight in" />
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        }}>
          <FeatureCard
            title="Expert Builds"
            descriptor="Learn from real rider setups on your exact bike"
            barColor="#7F77DD"
            href="/expert"
          />
          <FeatureCard
            title="Browse Parts"
            descriptor="Guaranteed fit for every accessory you see"
            barColor="#1D9E75"
            href="/browse"
          />
          <FeatureCard
            title="Plan Build"
            descriptor="Track what's fitted, wished for and moved on"
            barColor="#1C69D4"
            href="/garage"
          />
          <FeatureCard
            title="Shop Suppliers"
            descriptor="Compare prices across all stockists at once"
            barColor="#639922"
            href="/shop"
          />
        </div>
      </section>

      {/* ── 3. Why Accessorise It ───────────────────────────────────────────── */}
      <section style={{ padding: '24px 20px 0' }}>
        <SectionHeader label="Why Accessorise It" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ValueProp
            headline="Guaranteed fit"
            descriptor="Every accessory is filtered to your exact bike before you see it — no guessing, no returns."
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C69D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
          <ValueProp
            headline="Real expert builds"
            descriptor="Learn from riders who've already done it — complete builds on bikes just like yours."
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C69D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            }
          />
          <ValueProp
            headline="Multiple suppliers"
            descriptor="Compare prices and stock across all retailers in one place — always see the best deal."
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C69D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── 4. Hero image strip ─────────────────────────────────────────────── */}
      <section style={{ marginTop: 24 }}>
        <img
          src="/placeholder-new.jpg"
          alt=""
          style={{ display: 'block', width: '100%', height: 220, objectFit: 'cover', objectPosition: 'center' }}
        />
        <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 11, color: '#6A6860' }}>
          From luggage to lighting — every accessory, guaranteed to fit your bike.
        </p>
      </section>

    </main>
  )
}
