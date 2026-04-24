'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { demoExpertBuildCatalog } from '@/lib/demo-content/expert-builds'
import type { ExpertBuild, ExpertBuildAccessory } from '@/lib/expert-builds/types'
import { garageCategories } from '@/types/garage'

// ── Types ────────────────────────────────────────────────────────────────────

type PurposeFilter = 'all' | 'touring' | 'adventure' | 'enduro' | 'by-accessory'

type SelectedBike = {
  id: string
  make: string
  model: string
  variant: string | null
  year: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function matchesPurpose(build: ExpertBuild, filter: PurposeFilter): boolean {
  if (filter === 'all' || filter === 'by-accessory') return true
  const purposeMap: Record<string, string> = { touring: 'touring', adventure: 'adventure', enduro: 'off-road' }
  return build.dna.purpose === purposeMap[filter]
}

function matchesSearch(build: ExpertBuild, q: string): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  return (
    build.title.toLowerCase().includes(lower) ||
    build.builderName.toLowerCase().includes(lower) ||
    `${build.bikeFitment.make} ${build.bikeFitment.model}`.toLowerCase().includes(lower) ||
    build.accessories.some(a => a.title.toLowerCase().includes(lower)) ||
    build.tags.some(t => t.toLowerCase().includes(lower))
  )
}

// ── SVG icons ────────────────────────────────────────────────────────────────

function SearchIcon({ size = 14, color = '#44423E' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8841A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

// ── Shared small components ───────────────────────────────────────────────────

function CategoryTag({ label }: { label: string }) {
  return (
    <span
      className="rounded-full whitespace-nowrap"
      style={{
        backgroundColor: 'rgba(232,132,26,0.08)',
        border: '1px solid rgba(232,132,26,0.16)',
        color: '#E8841A',
        fontSize: 9,
        fontWeight: 500,
        padding: '3px 9px',
      }}
    >
      {label}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span
      className="rounded-full whitespace-nowrap"
      style={{
        backgroundColor: 'rgba(232,132,26,0.1)',
        border: '1px solid rgba(232,132,26,0.2)',
        color: '#E8841A',
        fontSize: 9,
        fontWeight: 500,
        padding: '2px 8px',
      }}
    >
      Verified
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#F5F3EE] font-semibold" style={{ fontSize: 12 }}>
      {children}
    </p>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-[12px] py-10 px-5 text-center"
      style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p style={{ fontSize: 13, color: '#6A6860' }}>{message}</p>
    </div>
  )
}

// ── Search bar ────────────────────────────────────────────────────────────────

function SearchBar({
  value,
  onChange,
  placeholder = 'Search builds, bikes or accessories...',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-[8px] px-3 py-2.5"
      style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <SearchIcon size={14} color="#44423E" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none"
        style={{ fontSize: 12, color: '#F5F3EE', caretColor: '#E8841A' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ fontSize: 14, color: '#44423E', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      )}
    </div>
  )
}

// ── Filter pills ──────────────────────────────────────────────────────────────

const FILTER_PILLS: Array<{ id: PurposeFilter; label: string; icon?: boolean }> = [
  { id: 'all',          label: 'All builds' },
  { id: 'touring',      label: 'Touring' },
  { id: 'adventure',    label: 'Adventure' },
  { id: 'enduro',       label: 'Enduro' },
  { id: 'by-accessory', label: 'By accessory', icon: true },
]

function FilterPills({
  active,
  onChange,
}: {
  active: PurposeFilter
  onChange: (f: PurposeFilter) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
      {FILTER_PILLS.map(({ id, label, icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full flex-shrink-0"
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '6px 13px',
              border: isActive
                ? '1px solid rgba(232,132,26,0.22)'
                : '1px solid rgba(255,255,255,0.07)',
              backgroundColor: isActive ? 'rgba(232,132,26,0.1)' : '#141414',
              color: isActive ? '#E8841A' : '#5A5852',
              cursor: 'pointer',
            }}
          >
            {icon && <SearchIcon size={10} color={isActive ? '#E8841A' : '#5A5852'} />}
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Featured build card ───────────────────────────────────────────────────────

function FeaturedBuildCard({ build }: { build: ExpertBuild }) {
  const photoCount = 1 + build.galleryPhotos.length
  const bikeLabel = getBikeLabel(build)
  const initials = getInitials(build.builderName)
  const uniqueCategories = new Set(build.accessories.map(a => a.categoryId)).size

  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Photo area */}
      <div style={{ position: 'relative', height: 136, backgroundColor: '#1A1814', overflow: 'hidden' }}>
        {build.primaryPhoto?.imageUrl && (
          <img
            src={build.primaryPhoto.imageUrl}
            alt={build.primaryPhoto.alt}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        )}
        {/* Photo count badge */}
        <span
          className="absolute top-2 right-2 rounded-full"
          style={{
            backgroundColor: 'rgba(0,0,0,0.55)',
            color: '#F5F3EE',
            fontSize: 9,
            fontWeight: 500,
            padding: '2px 8px',
          }}
        >
          {photoCount} photos
        </span>
        {/* Real build photos badge */}
        {build.credibility?.hasRealBuildPhotos && (
          <span
            className="absolute top-2 left-2 rounded-full"
            style={{
              backgroundColor: 'rgba(232,132,26,0.15)',
              border: '1px solid rgba(232,132,26,0.3)',
              color: '#E8841A',
              fontSize: 9,
              fontWeight: 500,
              padding: '2px 8px',
            }}
          >
            Owner photos · real bike
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-[13px]">
        {/* Rider info row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0 text-[#E8841A] font-semibold"
            style={{
              width: 26,
              height: 26,
              backgroundColor: 'rgba(232,132,26,0.12)',
              fontSize: 11,
            }}
          >
            {initials}
          </div>
          <span className="text-[#F5F3EE] font-semibold" style={{ fontSize: 12 }}>
            {build.builderName}
          </span>
          {build.credibility?.verifiedBuilder && <VerifiedBadge />}
          <span style={{ fontSize: 11, color: '#6A6860' }}>{bikeLabel}</span>
          <CategoryTag label={purposeLabel(build.dna.purpose)} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: build.accessories.length, label: 'accessories' },
            { value: uniqueCategories, label: 'categories' },
            { value: purposeLabel(build.dna.purpose), label: 'build type' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <span
                className="text-[#F5F3EE] leading-none"
                style={{
                  fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: typeof value === 'number' ? 20 : 13,
                }}
              >
                {value}
              </span>
              <span style={{ fontSize: 10, color: '#6A6860', marginTop: 3 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        {build.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {build.tags.slice(0, 3).map(tag => (
              <CategoryTag key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/expert/${build.id}`}
          className="block w-full text-center rounded-[8px] no-underline"
          style={{
            border: '1px solid rgba(232,132,26,0.35)',
            color: '#E8841A',
            fontSize: 12,
            fontWeight: 600,
            padding: '10px 0',
          }}
        >
          Compare build →
        </Link>
      </div>
    </div>
  )
}

// ── Compact build card ────────────────────────────────────────────────────────

function CompactBuildCard({ build }: { build: ExpertBuild }) {
  const bikeLabel = getBikeLabel(build)

  return (
    <Link
      href={`/expert/${build.id}`}
      className="flex gap-3 items-center rounded-[12px] p-[13px] no-underline"
      style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Photo */}
      <div
        style={{ width: 60, height: 60, backgroundColor: '#1A1814', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}
      >
        {build.primaryPhoto?.imageUrl && (
          <img
            src={build.primaryPhoto.imageUrl}
            alt={build.primaryPhoto.alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[#F5F3EE] font-semibold truncate" style={{ fontSize: 12 }}>
          {build.title}
        </p>
        <p style={{ fontSize: 11, color: '#6A6860', marginTop: 2 }}>{bikeLabel}</p>
        <div className="flex gap-1.5 flex-wrap mt-1.5">
          {build.tags.slice(0, 2).map(tag => (
            <CategoryTag key={tag} label={tag} />
          ))}
        </div>
      </div>

      <ChevronRight />
    </Link>
  )
}

// ── By-accessory view ─────────────────────────────────────────────────────────

type AccessoryEntry = ExpertBuildAccessory & { buildIds: string[] }

function ByAccessoryView({ builds }: { builds: ExpertBuild[] }) {
  const [accessoryQuery, setAccessoryQuery] = useState('')
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryEntry | null>(null)

  // Collect all unique accessories across all builds, merging buildIds
  const allAccessories = useMemo<AccessoryEntry[]>(() => {
    const map = new Map<string, AccessoryEntry>()
    for (const build of builds) {
      for (const acc of build.accessories) {
        if (map.has(acc.id)) {
          map.get(acc.id)!.buildIds.push(build.id)
        } else {
          map.set(acc.id, { ...acc, buildIds: [build.id] })
        }
      }
    }
    return Array.from(map.values())
  }, [builds])

  const filteredAccessories = useMemo(() => {
    if (!accessoryQuery) return allAccessories
    const lower = accessoryQuery.toLowerCase()
    return allAccessories.filter(
      a => a.title.toLowerCase().includes(lower) || a.brand.toLowerCase().includes(lower)
    )
  }, [allAccessories, accessoryQuery])

  // Group by categoryId
  const grouped = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, AccessoryEntry[]>()
    for (const acc of filteredAccessories) {
      if (!map.has(acc.categoryId)) {
        order.push(acc.categoryId)
        map.set(acc.categoryId, [])
      }
      map.get(acc.categoryId)!.push(acc)
    }
    return order.map(catId => ({ catId, label: getCategoryLabel(catId), items: map.get(catId)! }))
  }, [filteredAccessories])

  // Builds that include the selected accessory
  const matchingBuilds = useMemo(() => {
    if (!selectedAccessory) return []
    return builds.filter(b => b.accessories.some(a => a.id === selectedAccessory.id))
  }, [builds, selectedAccessory])

  if (selectedAccessory) {
    return (
      <div className="flex flex-col gap-4">
        {/* Back + heading */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedAccessory(null)}
            className="flex items-center gap-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content' }}
          >
            <ChevronLeft />
            <span style={{ fontSize: 11, color: '#E8841A', fontWeight: 500 }}>All accessories</span>
          </button>
          <p className="text-[#F5F3EE] font-semibold" style={{ fontSize: 13 }}>
            Builds featuring {selectedAccessory.title}
          </p>
        </div>

        {matchingBuilds.length === 0 ? (
          <EmptyState message="No builds include this accessory." />
        ) : (
          <div className="flex flex-col gap-2">
            {matchingBuilds.map(b => (
              <CompactBuildCard key={b.id} build={b} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchBar
        value={accessoryQuery}
        onChange={setAccessoryQuery}
        placeholder="Search accessories..."
      />

      {grouped.length === 0 ? (
        <EmptyState message="No accessories match your search." />
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(({ catId, label, items }) => (
            <div key={catId} className="flex flex-col gap-2">
              {/* Section header */}
              <div className="flex items-center gap-2">
                <span
                  style={{
                    display: 'inline-block',
                    width: 3,
                    height: 14,
                    backgroundColor: '#E8841A',
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="uppercase tracking-[0.05em] text-[#F5F3EE]"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  {label}
                </span>
                <span style={{ fontSize: 11, color: '#44423E' }}>{items.length}</span>
              </div>

              {/* Accessory rows */}
              {items.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccessory(acc)}
                  className="flex items-center justify-between rounded-[12px] p-[13px] w-full text-left"
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-[#F5F3EE] font-semibold truncate" style={{ fontSize: 12 }}>
                      {acc.title}
                    </p>
                    <p style={{ fontSize: 11, color: '#6A6860', marginTop: 2 }}>{acc.brand}</p>
                  </div>
                  <span
                    className="flex-shrink-0 ml-3 whitespace-nowrap"
                    style={{ fontSize: 11, color: '#1456B0', fontWeight: 500 }}
                  >
                    ↗ {acc.buildIds.length} {acc.buildIds.length === 1 ? 'build' : 'builds'}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExpertPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<PurposeFilter>('all')
  const [bikeContext, setBikeContext] = useState<SelectedBike | null>(null)

  // Read selected bike from sessionStorage (set by the Browse screen)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('browse_bike')
      if (raw) {
        const parsed = JSON.parse(raw) as SelectedBike
        if (parsed?.make && parsed?.model) setBikeContext(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  const publishedBuilds = useMemo(
    () => demoExpertBuildCatalog.filter(b => b.published),
    []
  )

  // Builds matching the selected bike (make + model, case-insensitive)
  const buildsForBike = useMemo(() => {
    if (!bikeContext) return publishedBuilds
    return publishedBuilds.filter(b =>
      b.bikeFitment.make.toLowerCase() === bikeContext.make.toLowerCase() &&
      b.bikeFitment.model.toLowerCase() === bikeContext.model.toLowerCase()
    )
  }, [publishedBuilds, bikeContext])

  const filteredBuilds = useMemo(
    () =>
      buildsForBike
        .filter(b => matchesPurpose(b, activeFilter))
        .filter(b => matchesSearch(b, searchQuery)),
    [buildsForBike, activeFilter, searchQuery]
  )

  const featuredBuild = useMemo(
    () => filteredBuilds.find(b => b.featured) ?? filteredBuilds[0] ?? null,
    [filteredBuilds]
  )

  const moreBuilds = useMemo(
    () => filteredBuilds.filter(b => b.id !== featuredBuild?.id),
    [filteredBuilds, featuredBuild]
  )

  const bikeLabel = bikeContext
    ? [bikeContext.year, bikeContext.make, bikeContext.model, bikeContext.variant].filter(Boolean).join(' ')
    : null

  // True when bike is set but no builds match (before search/filter applied)
  const noBuildsForBike = !!bikeContext && buildsForBike.length === 0

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-8 min-h-screen bg-[#0D0D0D]">

      {/* A0 — Bike context banner */}
      {bikeContext ? (
        <div style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '11px 13px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 600, color: '#F5F3EE',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {bikeLabel}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 10, color: '#6A6860' }}>
              {noBuildsForBike ? 'No builds found for this bike' : `${buildsForBike.length} expert ${buildsForBike.length === 1 ? 'build' : 'builds'} for your bike`}
            </p>
          </div>
          <button
            onClick={() => router.push('/browse')}
            style={{ flexShrink: 0, background: 'none', border: 'none', padding: 0, fontSize: 11, fontWeight: 500, color: '#E8841A', cursor: 'pointer' }}
          >
            Change
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#6A6860' }}>Showing all expert builds</p>
          <Link href="/browse" style={{ fontSize: 11, fontWeight: 500, color: '#E8841A', textDecoration: 'none' }}>
            Browse for your bike →
          </Link>
        </div>
      )}

      {/* A — Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* B — Filter pills */}
      <FilterPills active={activeFilter} onChange={setActiveFilter} />

      {/* E — By-accessory mode */}
      {activeFilter === 'by-accessory' ? (
        <ByAccessoryView builds={publishedBuilds} />
      ) : noBuildsForBike ? (
        /* No builds for selected bike — offer to show all */
        <div
          className="flex flex-col items-center gap-3 rounded-[12px] py-10 px-5 text-center"
          style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p style={{ fontSize: 13, color: '#6A6860', margin: 0 }}>
            No expert builds found for {bikeLabel}.
          </p>
          <button
            onClick={() => setBikeContext(null)}
            style={{
              background: 'none', border: '1px solid rgba(232,132,26,0.35)',
              borderRadius: 20, padding: '6px 14px',
              fontSize: 11, fontWeight: 500, color: '#E8841A', cursor: 'pointer',
            }}
          >
            Show all builds
          </button>
        </div>
      ) : (
        <>
          {filteredBuilds.length === 0 ? (
            <EmptyState message="No builds match your search." />
          ) : (
            <>
              {/* C — Featured build */}
              {featuredBuild && (
                <div className="flex flex-col gap-2">
                  <SectionLabel>Featured build</SectionLabel>
                  <FeaturedBuildCard build={featuredBuild} />
                </div>
              )}

              {/* D — More builds */}
              {moreBuilds.length > 0 && (
                <div className="flex flex-col gap-2">
                  <SectionLabel>More builds</SectionLabel>
                  <div className="flex flex-col gap-2">
                    {moreBuilds.map(build => (
                      <CompactBuildCard key={build.id} build={build} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
