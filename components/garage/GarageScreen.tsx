'use client'

import { useState, useMemo } from 'react'
import type { GarageBikeRecord, GarageBuildItem, GarageBuildRecord } from '@/types/garage'
import { garageCategories } from '@/types/garage'
import { formatGaragePriceDisplay } from '@/lib/garage/price-display'
import { AddAccessoryModal } from './AddAccessoryModal'

type ItemState = 'fitted' | 'wishlist' | 'moved_on'
type Filter = 'all' | 'fitted' | 'wishlist' | 'history'

// GarageBuildItem.state is in the DB schema but not yet in the TypeScript type.
// This derives a demo state from productId so all three variants are visible.
// Replace with `item.state` once the type is extended.
function getDemoItemState(item: GarageBuildItem): ItemState {
  const n = item.productId % 3
  if (n === 0) return 'moved_on'
  if (n === 1) return 'wishlist'
  return 'fitted'
}

function getCategoryLabel(categoryId: string): string {
  return garageCategories.find((c) => c.id === categoryId)?.label ?? categoryId
}

// ── Dots ────────────────────────────────────────────────────────────────────

function StateDot({ state, size = 8 }: { state: ItemState; size?: number }) {
  if (state === 'fitted') {
    return (
      <span
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#1D9E75',
          flexShrink: 0,
        }}
      />
    )
  }
  if (state === 'wishlist') {
    return (
      <span
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1.5px solid #888780`,
          backgroundColor: 'transparent',
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#5DCAA5',
        flexShrink: 0,
      }}
    />
  )
}

const STATE_META: Record<ItemState, { label: string; color: string }> = {
  fitted:   { label: 'Fitted',    color: '#1D9E75' },
  wishlist: { label: 'Wish list', color: '#888780' },
  moved_on: { label: 'History',   color: '#5DCAA5' },
}

// ── Bike header card ─────────────────────────────────────────────────────────

function BikeHeaderCard({
  bike,
  build,
  onSwitchBike,
}: {
  bike: GarageBikeRecord
  build: GarageBuildRecord | null
  onSwitchBike: () => void
}) {
  const bikeName = [bike.year, bike.make, bike.model, bike.variant].filter(Boolean).join(' ')
  const reg = bike.nickname ?? '—'
  const buildName = build?.name ?? 'My Build'

  return (
    <div
      className="flex gap-3 items-start rounded-[12px] p-[13px]"
      style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Photo area */}
      <div
        className="flex flex-col items-center justify-center gap-1 flex-shrink-0"
        style={{
          width: 62,
          height: 62,
          border: '1.5px dashed rgba(232,132,26,0.25)',
          borderRadius: 10,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(232,132,26,0.4)" strokeWidth="1.5">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span style={{ fontSize: 9, color: 'rgba(232,132,26,0.4)', fontWeight: 500 }}>Add photo</span>
      </div>

      {/* Text */}
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <p className="text-[#F5F3EE] font-semibold leading-tight truncate" style={{ fontSize: 13 }}>
          {bikeName}
        </p>
        <p style={{ fontSize: 11, color: '#6A6860' }}>{reg}</p>
        <p style={{ fontSize: 11, color: '#6A6860' }}>{buildName}</p>
        <button
          onClick={onSwitchBike}
          className="text-left mt-1"
          style={{ fontSize: 11, color: '#E8841A', fontWeight: 500, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          Switch bike
        </button>
      </div>
    </div>
  )
}

// ── Stat cards ───────────────────────────────────────────────────────────────

function StatCard({ count, label, borderColor }: { count: number; label: string; borderColor: string }) {
  return (
    <div
      className="flex-1 flex flex-col items-start rounded-[11px] p-[11px]"
      style={{
        backgroundColor: '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <span
        className="text-[#F5F3EE] leading-none"
        style={{ fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 22 }}
      >
        {count}
      </span>
      <span style={{ fontSize: 10, color: '#6A6860', marginTop: 4 }}>{label}</span>
    </div>
  )
}

// ── Filter pills ─────────────────────────────────────────────────────────────

const FILTER_CONFIG: Array<{ filter: Filter; label: string; dot?: ItemState }> = [
  { filter: 'all',      label: 'All' },
  { filter: 'fitted',   label: 'Fitted',     dot: 'fitted' },
  { filter: 'wishlist', label: 'Wish list',  dot: 'wishlist' },
  { filter: 'history',  label: 'History',    dot: 'moved_on' },
]

function FilterPills({
  active,
  onChange,
}: {
  active: Filter
  onChange: (f: Filter) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
      {FILTER_CONFIG.map(({ filter, label, dot }) => {
        const isActive = active === filter
        return (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-[13px] py-[6px] flex-shrink-0"
            style={{
              fontSize: 11,
              fontWeight: 500,
              border: isActive
                ? '1px solid rgba(232,132,26,0.22)'
                : '1px solid rgba(255,255,255,0.07)',
              backgroundColor: isActive ? 'rgba(232,132,26,0.1)' : '#141414',
              color: isActive ? '#E8841A' : '#5A5852',
              cursor: 'pointer',
            }}
          >
            {dot && <StateDot state={dot} size={8} />}
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Accessory item card ───────────────────────────────────────────────────────

function AccessoryCard({ item, state }: { item: GarageBuildItem; state: ItemState }) {
  const { product } = item
  const meta = STATE_META[state]
  const isHistory = state === 'moved_on'
  const isWishlist = state === 'wishlist'
  const priceLabel = formatGaragePriceDisplay(product.price)

  return (
    <div
      className="flex gap-3 items-start rounded-[12px] p-[13px]"
      style={
        isHistory
          ? {
              backgroundColor: '#111008',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 11,
              opacity: 0.75,
            }
          : {
              backgroundColor: '#141414',
              border: '1px solid rgba(255,255,255,0.06)',
            }
      }
    >
      {/* Product image */}
      <div
        className="flex-shrink-0 rounded-[8px] overflow-hidden"
        style={{ width: 52, height: 52, backgroundColor: '#1A1814' }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[#F5F3EE] font-semibold leading-tight truncate"
          style={{ fontSize: 12 }}
        >
          {product.name}
        </p>
        <p style={{ fontSize: 10, color: '#6A6860', marginTop: 1 }}>{product.brand}</p>

        {/* State + price row */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <StateDot state={state} size={8} />
          <span style={{ fontSize: 10, fontWeight: 500, color: meta.color }}>{meta.label}</span>
          <span style={{ fontSize: 10, color: '#44423E' }}>·</span>
          <span style={{ fontSize: 11, color: '#6A6860' }}>{priceLabel}</span>
        </div>

        {/* Shop now — wish list only */}
        {isWishlist && (
          <button
            className="mt-2 rounded-full px-3 py-1 flex-shrink-0"
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#E8841A',
              border: '1px solid rgba(232,132,26,0.35)',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            Shop now →
          </button>
        )}
      </div>

      {/* Three-dot menu */}
      <button
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          fontSize: 18,
          color: '#44423E',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          lineHeight: 1,
        }}
        aria-label="More options"
      >
        ⋮
      </button>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
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
      <span style={{ fontSize: 11, color: '#44423E' }}>{count}</span>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyPrompt({ message }: { message: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-[12px] py-10 px-5 text-center"
      style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p style={{ fontSize: 13, color: '#6A6860' }}>{message}</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type GarageScreenProps = {
  bikes: GarageBikeRecord[]
  selectedBike: GarageBikeRecord | null
  selectedBuild: GarageBuildRecord | null
  onSwitchBike: () => void
}

export function GarageScreen({ bikes: _bikes, selectedBike, selectedBuild, onSwitchBike }: GarageScreenProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [showModal, setShowModal] = useState(false)
  const [modalKey, setModalKey] = useState(0)

  const allItems = useMemo(
    () => selectedBuild?.buildItems ?? [],
    [selectedBuild]
  )

  // Assign demo state and compute counts
  const itemsWithState = useMemo(
    () => allItems.map((item) => ({ item, state: getDemoItemState(item) })),
    [allItems]
  )

  const counts = useMemo(
    () => ({
      fitted:   itemsWithState.filter((x) => x.state === 'fitted').length,
      wishlist: itemsWithState.filter((x) => x.state === 'wishlist').length,
      history:  itemsWithState.filter((x) => x.state === 'moved_on').length,
    }),
    [itemsWithState]
  )

  // Filter items by active pill
  const visibleItems = useMemo(() => {
    if (activeFilter === 'all')      return itemsWithState
    if (activeFilter === 'fitted')   return itemsWithState.filter((x) => x.state === 'fitted')
    if (activeFilter === 'wishlist') return itemsWithState.filter((x) => x.state === 'wishlist')
    return itemsWithState.filter((x) => x.state === 'moved_on')
  }, [itemsWithState, activeFilter])

  // Group visible items by categoryId, preserving insertion order
  const categoryGroups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, Array<{ item: GarageBuildItem; state: ItemState }>>()
    for (const entry of visibleItems) {
      const catId = entry.item.product.categoryId
      if (!map.has(catId)) {
        order.push(catId)
        map.set(catId, [])
      }
      map.get(catId)!.push(entry)
    }
    return order.map((catId) => ({ catId, label: getCategoryLabel(catId), entries: map.get(catId)! }))
  }, [visibleItems])

  if (!selectedBike) {
    return (
      <div className="px-5 pt-4">
        <EmptyPrompt message="No bike selected — choose a bike in the Bike tab to see your garage." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-8">
      {/* A — Bike header */}
      <BikeHeaderCard bike={selectedBike} build={selectedBuild} onSwitchBike={onSwitchBike} />

      {/* B — Stat cards */}
      <div className="flex gap-2">
        <StatCard count={counts.fitted}   label="Fitted"     borderColor="#1D9E75" />
        <StatCard count={counts.wishlist} label="Wish list"  borderColor="#888780" />
        <StatCard count={counts.history}  label="History"    borderColor="#5DCAA5" />
      </div>

      {/* C — Filter pills */}
      <FilterPills active={activeFilter} onChange={setActiveFilter} />

      {/* D+E — Accessory sections */}
      {categoryGroups.length === 0 ? (
        <EmptyPrompt
          message={
            activeFilter === 'all'
              ? 'No accessories in this build yet.'
              : `No ${activeFilter === 'history' ? 'history' : activeFilter} items.`
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {categoryGroups.map(({ catId, label, entries }) => (
            <div key={catId} className="flex flex-col gap-2">
              <SectionHeader label={label} count={entries.length} />
              {entries.map(({ item, state }) => (
                <AccessoryCard key={item.id} item={item} state={state} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* F — Add accessory CTA */}
      <button
        className="w-full text-center"
        onClick={() => { setModalKey(k => k + 1); setShowModal(true) }}
        style={{
          border: '1.5px dashed rgba(232,132,26,0.25)',
          borderRadius: 10,
          padding: '13px 14px',
          fontSize: 12,
          fontWeight: 500,
          color: 'rgba(232,132,26,0.5)',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        }}
      >
        + Add accessory
      </button>

      {showModal && (
        <AddAccessoryModal
          key={modalKey}
          bikeName={[selectedBike?.year, selectedBike?.make, selectedBike?.model].filter(Boolean).join(' ')}
          bikeId={selectedBike?.id ?? null}
          onClose={() => setShowModal(false)}
          onViewBuild={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
