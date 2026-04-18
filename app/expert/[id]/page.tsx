'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { demoExpertBuildCatalog } from '@/lib/demo-content/expert-builds'
import { demoGarageProducts } from '@/lib/demo-content/products'
import type { ExpertBuild, ExpertBuildAccessory } from '@/lib/expert-builds/types'
import { garageCategories } from '@/types/garage'
import { use } from 'react'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBikeLabel(build: ExpertBuild): string {
  const { make, model, yearStart, yearEnd } = build.bikeFitment
  const years = yearStart === yearEnd ? String(yearStart) : `${yearStart}–${yearEnd}`
  return `${years} ${make} ${model}`
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (parts[0]?.[0] ?? '?').toUpperCase()
}

function purposeLabel(purpose: string): string {
  const map: Record<string, string> = {
    touring: 'Touring', adventure: 'Adventure', 'off-road': 'Enduro',
    commuter: 'Commuter', performance: 'Performance', mixed: 'Mixed',
  }
  return map[purpose] ?? purpose
}

function getCategoryLabel(categoryId: string): string {
  return garageCategories.find(c => c.id === categoryId)?.label ?? categoryId
}

function getPriceLabel(productId?: number | null): string {
  if (!productId) return '—'
  const product = demoGarageProducts.find(p => p.id === productId)
  if (!product || product.price <= 0) return '—'
  return `£${product.price}`
}

function countBuildsUsing(accId: string): number {
  return demoExpertBuildCatalog.filter(
    b => b.published && b.accessories.some(a => a.id === accId)
  ).length
}

function groupByCategory(accessories: ExpertBuildAccessory[]) {
  const order: string[] = []
  const map = new Map<string, ExpertBuildAccessory[]>()
  for (const acc of accessories) {
    if (!map.has(acc.categoryId)) {
      order.push(acc.categoryId)
      map.set(acc.categoryId, [])
    }
    map.get(acc.categoryId)!.push(acc)
  }
  return order.map(catId => ({
    catId,
    label: getCategoryLabel(catId),
    items: map.get(catId)!,
  }))
}

// ── Shared small components ───────────────────────────────────────────────────

function CategoryTag({ label }: { label: string }) {
  return (
    <span
      style={{
        backgroundColor: 'rgba(232,132,26,0.08)',
        border: '1px solid rgba(232,132,26,0.16)',
        color: '#E8841A',
        fontSize: 9,
        fontWeight: 500,
        padding: '3px 9px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span
      style={{
        backgroundColor: 'rgba(232,132,26,0.1)',
        border: '1px solid rgba(232,132,26,0.2)',
        color: '#E8841A',
        fontSize: 9,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
      }}
    >
      Verified
    </span>
  )
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-block', width: 3, height: 14, backgroundColor: '#E8841A', borderRadius: 2, flexShrink: 0 }} />
      <span
        style={{
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#F5F3EE',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 11, color: '#44423E' }}>{count}</span>
    </div>
  )
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8841A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

// ── Accessory card ────────────────────────────────────────────────────────────

function AccessoryCard({ acc, build }: { acc: ExpertBuildAccessory; build: ExpertBuild }) {
  const usageCount = countBuildsUsing(acc.id)
  const price = getPriceLabel(acc.productId)
  const hasPhoto = (acc.installedPhotoIds?.length ?? 0) > 0

  return (
    <div
      style={{
        backgroundColor: '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 13,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      {/* 52px photo area */}
      <div
        style={{
          width: 52,
          height: 52,
          backgroundColor: '#1A1814',
          borderRadius: 8,
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {hasPhoto && build.primaryPhoto?.imageUrl && (
          <img
            src={build.primaryPhoto.imageUrl}
            alt={acc.title}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', lineHeight: 1.3, margin: 0 }}>
          {acc.title}
        </p>
        <p style={{ fontSize: 10, color: '#6A6860', margin: '2px 0 0' }}>
          {acc.brand}
        </p>

        {/* State + price row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1D9E75', flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 500, color: '#1D9E75' }}>Fitted</span>
          <span style={{ fontSize: 10, color: '#44423E' }}>·</span>
          <span style={{ fontSize: 11, color: '#6A6860' }}>{price}</span>
        </div>

        {/* Discovery link */}
        <p style={{ fontSize: 11, fontWeight: 500, color: '#C4741A', margin: '4px 0 0' }}>
          ↗ Used in {usageCount} expert {usageCount === 1 ? 'build' : 'builds'}
        </p>
      </div>

      {/* + add button */}
      <button
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid rgba(232,132,26,0.35)',
          color: '#E8841A',
          backgroundColor: 'transparent',
          fontSize: 18,
          fontWeight: 300,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        aria-label={`Add ${acc.title} to garage`}
      >
        +
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExpertBuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const build = useMemo(
    () => demoExpertBuildCatalog.find(b => b.id === id || b.slug === id) ?? null,
    [id]
  )

  const categoryGroups = useMemo(
    () => (build ? groupByCategory(build.accessories) : []),
    [build]
  )

  const uniqueCategories = useMemo(
    () => (build ? new Set(build.accessories.map(a => a.categoryId)).size : 0),
    [build]
  )

  const photoCount = build ? 1 + build.galleryPhotos.length : 0

  if (!build) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: '#141414',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: 32,
          }}
        >
          <p style={{ fontSize: 13, color: '#6A6860', margin: '0 0 16px' }}>Build not found.</p>
          <Link
            href="/expert"
            style={{ fontSize: 12, color: '#E8841A', fontWeight: 500 }}
          >
            ← Back to Expert builds
          </Link>
        </div>
      </div>
    )
  }

  const bikeLabel = getBikeLabel(build)
  const initials = getInitials(build.builderName)

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', paddingBottom: 32 }}>

      {/* A — Back nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}
            aria-label="Go back"
          >
            <BackArrow />
          </button>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#F5F3EE',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 220,
            }}
          >
            {build.title}
          </span>
        </div>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#44423E', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="Share"
        >
          <ShareIcon />
        </button>
      </div>

      {/* B — Photo area */}
      <div style={{ position: 'relative', height: 158, backgroundColor: '#1A1814', overflow: 'hidden' }}>
        {build.primaryPhoto?.imageUrl && (
          <img
            src={build.primaryPhoto.imageUrl}
            alt={build.primaryPhoto.alt}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        )}
        {build.credibility?.hasRealBuildPhotos && (
          <span
            style={{
              position: 'absolute', top: 8, left: 8,
              backgroundColor: 'rgba(232,132,26,0.15)',
              border: '1px solid rgba(232,132,26,0.3)',
              color: '#E8841A',
              fontSize: 9, fontWeight: 500,
              padding: '2px 8px', borderRadius: 20,
            }}
          >
            Owner photos · real bike
          </span>
        )}
        <span
          style={{
            position: 'absolute', top: 8, right: 8,
            backgroundColor: 'rgba(0,0,0,0.55)',
            color: '#F5F3EE',
            fontSize: 9, fontWeight: 500,
            padding: '2px 8px', borderRadius: 20,
          }}
        >
          {photoCount} photos
        </span>
      </div>

      {/* C — Rider info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '12px 20px 8px' }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: 'rgba(232,132,26,0.12)',
            color: '#E8841A',
            fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE' }}>{build.builderName}</span>
        {build.credibility?.verifiedBuilder && <VerifiedBadge />}
        <span style={{ fontSize: 11, color: '#6A6860' }}>{bikeLabel}</span>
        <CategoryTag label={purposeLabel(build.dna.purpose)} />
      </div>

      {/* D — Stats row */}
      <div style={{ padding: '0 20px 12px' }}>
        <div
          style={{
            backgroundColor: '#141414',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
          }}
        >
          {[
            { value: build.accessories.length, label: 'accessories' },
            { value: uniqueCategories,          label: 'categories' },
            { value: purposeLabel(build.dna.purpose), label: 'build type' },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '12px 8px',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: typeof value === 'number' ? 20 : 13,
                  color: '#F5F3EE',
                  lineHeight: 1,
                }}
              >
                {value}
              </span>
              <span style={{ fontSize: 10, color: '#6A6860', marginTop: 4 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* E — Save + Share buttons */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
        <button
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            border: '1px solid rgba(232,132,26,0.35)',
            color: '#E8841A',
            backgroundColor: 'transparent',
            borderRadius: 8,
            padding: '10px 0',
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <BookmarkIcon />
          Save this build
        </button>
        <button
          style={{
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F5F3EE',
            backgroundColor: 'transparent',
            borderRadius: 8,
            cursor: 'pointer',
            flexShrink: 0,
          }}
          aria-label="Share"
        >
          <ShareIcon />
        </button>
      </div>

      {/* F — Accessory sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 20px' }}>
        {categoryGroups.map(({ catId, label, items }) => (
          <div key={catId} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionHeader label={label} count={items.length} />
            {items.map(acc => (
              <AccessoryCard key={acc.id} acc={acc} build={build} />
            ))}
          </div>
        ))}
      </div>

      {/* G — Shop all accessories CTA */}
      <div style={{ padding: '24px 20px 0' }}>
        <button
          style={{
            width: '100%',
            backgroundColor: '#E8841A',
            color: '#0D0D0D',
            border: 'none',
            borderRadius: 8,
            padding: '13px 20px',
            fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
            fontWeight: 900,
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          Shop all accessories
        </button>
      </div>

    </div>
  )
}
