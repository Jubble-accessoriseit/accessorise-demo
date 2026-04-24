'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { GarageBikeRecord, GarageBuildItem, GarageBuildRecord } from '@/types/garage'
import { garageCategories } from '@/types/garage'
import { formatGaragePriceDisplay } from '@/lib/garage/price-display'
import { AddAccessoryModal } from './AddAccessoryModal'
import { ReturnPrompt } from './ReturnPrompt'

type ItemState = 'fitted' | 'wishlist' | 'moved_on'
type Filter = 'all' | 'fitted' | 'wishlist' | 'history'
type MenuMode = 'root' | 'edit-state' | 'confirm-remove'

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
      <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', backgroundColor: '#1D9E75', flexShrink: 0 }} />
    )
  }
  if (state === 'wishlist') {
    return (
      <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', border: '1.5px solid #888780', backgroundColor: 'transparent', flexShrink: 0 }} />
    )
  }
  return (
    <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', backgroundColor: '#5DCAA5', flexShrink: 0 }} />
  )
}

const STATE_META: Record<ItemState, { label: string; color: string }> = {
  fitted:   { label: 'Fitted',    color: '#1D9E75' },
  wishlist: { label: 'Wish list', color: '#888780' },
  moved_on: { label: 'History',   color: '#5DCAA5' },
}

const STATE_ORDER: ItemState[] = ['fitted', 'wishlist', 'moved_on']

// ── Bike header card ─────────────────────────────────────────────────────────

function BikeHeaderCard({
  bike, build, bikes, onSwitchBike, onDeleteBike, onDeleteBuild, onSwitchBikeTo,
}: {
  bike: GarageBikeRecord
  build: GarageBuildRecord | null
  bikes: GarageBikeRecord[]
  onSwitchBike: () => void
  onDeleteBike?: () => void
  onDeleteBuild?: () => void
  onSwitchBikeTo?: (bike: GarageBikeRecord) => void
}) {
  const [showDeleteBikeConfirm, setShowDeleteBikeConfirm] = useState(false)
  const [buildMenuOpen, setBuildMenuOpen] = useState(false)
  const [buildMenuMode, setBuildMenuMode] = useState<'root' | 'rename' | 'delete'>('root')
  const [buildNameOverride, setBuildNameOverride] = useState<string | null>(null)
  const [renameInput, setRenameInput] = useState('')
  const [showBikePicker, setShowBikePicker] = useState(false)

  const bikeName = [bike.year, bike.make, bike.model, bike.variant].filter(Boolean).join(' ')
  const reg = bike.nickname ?? '—'
  const buildName = buildNameOverride ?? build?.name ?? 'My Build'
  const otherBikes = bikes.filter(b => b.id !== bike.id)

  const baseSheetStyle: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    backgroundColor: '#141414',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px 12px 0 0',
    zIndex: 200,
    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
  }

  const DragHandle = () => (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 6 }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)' }} />
    </div>
  )

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', padding: '14px 20px',
    fontSize: 13, fontWeight: 500, color: '#F5F3EE',
    background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
  }

  return (
    <>
      <div className="flex gap-3 items-start rounded-[12px] p-[13px]" style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(() => {
          const photoUrl = bike.image ?? bike.photos?.[0]?.imageUrl ?? null
          return photoUrl ? (
            <img src={photoUrl} alt={bike.model} className="flex-shrink-0" style={{ width: 62, height: 62, borderRadius: 10, objectFit: 'cover', objectPosition: 'center' }} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0" style={{ width: 62, height: 62, border: '1.5px dashed rgba(232,132,26,0.25)', borderRadius: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(232,132,26,0.4)" strokeWidth="1.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span style={{ fontSize: 9, color: 'rgba(232,132,26,0.4)', fontWeight: 500 }}>Add photo</span>
            </div>
          )
        })()}
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <p className="text-[#F5F3EE] font-semibold leading-tight truncate" style={{ fontSize: 13 }}>{bikeName}</p>
          <p style={{ fontSize: 11, color: '#6A6860' }}>{reg}</p>
          {/* Build name + options button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 1 }}>
            <p style={{ fontSize: 11, color: '#6A6860', margin: 0 }}>{buildName}</p>
            <button
              onClick={() => { setBuildMenuMode('root'); setBuildMenuOpen(true) }}
              style={{ fontSize: 18, color: '#B8B6B0', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1, marginLeft: 8, flexShrink: 0 }}
              aria-label="Build options"
            >
              ⋮
            </button>
          </div>
          <button
            onClick={otherBikes.length > 0 ? () => setShowBikePicker(true) : onSwitchBike}
            className="text-left mt-1"
            style={{ fontSize: 11, color: '#E8841A', fontWeight: 500, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            Switch bike
          </button>
          <button
            onClick={() => setShowDeleteBikeConfirm(true)}
            className="text-left mt-0.5"
            style={{ fontSize: 11, color: '#DC3535', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            Delete bike
          </button>
        </div>
      </div>

      {/* Build options sheet */}
      {buildMenuOpen && (
        <>
          <div onClick={() => setBuildMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199, backgroundColor: 'rgba(0,0,0,0.55)' }} />
          <div style={baseSheetStyle}>
            <DragHandle />
            {buildMenuMode === 'root' && (
              <>
                <div style={{ padding: '4px 20px 10px', fontSize: 11, color: '#6A6860', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {buildName}
                </div>
                <button
                  onClick={() => { setRenameInput(buildName); setBuildMenuMode('rename') }}
                  className="hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors"
                  style={rowStyle}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Rename build
                </button>
                <div style={{ height: 1, margin: '0 20px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                <button
                  onClick={() => setBuildMenuMode('delete')}
                  className="hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors"
                  style={{ ...rowStyle, color: '#DC3535' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC3535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Delete build
                </button>
                <div style={{ height: 8 }} />
              </>
            )}

            {buildMenuMode === 'rename' && (
              <>
                <div style={{ padding: '12px 20px 16px' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#F5F3EE', margin: '0 0 12px' }}>Rename build</p>
                  <input
                    type="text"
                    value={renameInput}
                    onChange={e => setRenameInput(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 12px',
                      backgroundColor: '#1A1814',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8,
                      color: '#F5F3EE', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, padding: '0 20px 12px' }}>
                  <button
                    onClick={() => setBuildMenuMode('root')}
                    style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 500, color: '#F5F3EE', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { if (renameInput.trim()) setBuildNameOverride(renameInput.trim()); setBuildMenuOpen(false) }}
                    style={{ flex: 2, padding: 13, borderRadius: 8, backgroundColor: '#E8841A', border: 'none', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                  >
                    Save
                  </button>
                </div>
              </>
            )}

            {buildMenuMode === 'delete' && (
              <>
                <div style={{ padding: '8px 20px 16px' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#F5F3EE', margin: '0 0 8px' }}>Delete this build?</p>
                  <p style={{ fontSize: 12, color: '#6A6860', lineHeight: 1.55, margin: 0 }}>
                    {buildName} will be permanently deleted. This cannot be undone.
                  </p>
                </div>
                <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />
                <div style={{ display: 'flex', gap: 10, padding: '14px 20px 8px' }}>
                  <button
                    onClick={() => setBuildMenuMode('root')}
                    style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 500, color: '#F5F3EE', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setBuildMenuOpen(false); onDeleteBuild?.() }}
                    style={{ flex: 2, padding: 13, borderRadius: 8, backgroundColor: '#DC3535', border: 'none', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                  >
                    Delete build
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Bike picker sheet */}
      {showBikePicker && (
        <>
          <div onClick={() => setShowBikePicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 199, backgroundColor: 'rgba(0,0,0,0.55)' }} />
          <div style={baseSheetStyle}>
            <DragHandle />
            <div style={{ padding: '4px 20px 10px', fontSize: 11, color: '#6A6860', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              Switch to...
            </div>
            {otherBikes.map(b => {
              const bName = [b.year, b.make, b.model, b.variant].filter(Boolean).join(' ')
              const bPhoto = b.image ?? b.photos?.[0]?.imageUrl ?? null
              return (
                <button
                  key={b.id}
                  onClick={() => { setShowBikePicker(false); onSwitchBikeTo?.(b) }}
                  className="hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors"
                  style={rowStyle}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 7, flexShrink: 0, overflow: 'hidden', backgroundColor: '#1A1814' }}>
                    {bPhoto && <img src={bPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bName}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )
            })}
            <div style={{ height: 1, margin: '0 20px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <button
              onClick={() => { setShowBikePicker(false); onSwitchBike() }}
              style={{ display: 'block', width: '100%', padding: '12px 20px', fontSize: 12, fontWeight: 500, color: '#E8841A', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              View all bikes →
            </button>
            <div style={{ height: 8 }} />
          </div>
        </>
      )}

      {/* Delete bike confirmation sheet */}
      {showDeleteBikeConfirm && (
        <>
          <div onClick={() => setShowDeleteBikeConfirm(false)} style={{ position: 'fixed', inset: 0, zIndex: 199, backgroundColor: 'rgba(0,0,0,0.55)' }} />
          <div style={baseSheetStyle}>
            <DragHandle />
            <div style={{ padding: '8px 20px 16px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#F5F3EE', margin: '0 0 8px' }}>Delete this bike?</p>
              <p style={{ fontSize: 12, color: '#6A6860', lineHeight: 1.55, margin: 0 }}>
                This will permanently delete {bikeName} and all associated accessories and photos. This cannot be undone.
              </p>
            </div>
            <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />
            <div style={{ display: 'flex', gap: 10, padding: '14px 20px 8px' }}>
              <button
                onClick={() => setShowDeleteBikeConfirm(false)}
                style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 500, color: '#F5F3EE', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteBikeConfirm(false); onDeleteBike?.() }}
                style={{ flex: 2, padding: 13, borderRadius: 8, backgroundColor: '#DC3535', border: 'none', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
              >
                Delete bike
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Stat cards ───────────────────────────────────────────────────────────────

function StatCard({ count, label, borderColor }: { count: number; label: string; borderColor: string }) {
  return (
    <div className="flex-1 flex flex-col items-start rounded-[11px] p-[11px]" style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${borderColor}` }}>
      <span className="text-[#F5F3EE] leading-none" style={{ fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 22 }}>
        {count}
      </span>
      <span style={{ fontSize: 10, color: '#6A6860', marginTop: 4 }}>{label}</span>
    </div>
  )
}

// ── Filter pills ─────────────────────────────────────────────────────────────

const FILTER_CONFIG: Array<{ filter: Filter; label: string; dot?: ItemState }> = [
  { filter: 'all',      label: 'All' },
  { filter: 'fitted',   label: 'Fitted',    dot: 'fitted' },
  { filter: 'wishlist', label: 'Wish list', dot: 'wishlist' },
  { filter: 'history',  label: 'History',   dot: 'moved_on' },
]

function FilterPills({ active, onChange }: { active: Filter; onChange: (f: Filter) => void }) {
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
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
              border: isActive ? '1px solid rgba(232,132,26,0.22)' : '1px solid rgba(255,255,255,0.07)',
              backgroundColor: isActive ? 'rgba(232,132,26,0.1)' : '#141414',
              color: isActive ? '#E8841A' : '#B8AFA6',
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

// ── Accessory menu sheet ──────────────────────────────────────────────────────

function AccessoryMenuSheet({
  item,
  currentState,
  mode,
  onSetMode,
  onStateChange,
  onRemove,
  onViewDetails,
  onClose,
}: {
  item: GarageBuildItem
  currentState: ItemState
  mode: MenuMode
  onSetMode: (m: MenuMode) => void
  onStateChange: (s: ItemState) => void
  onRemove: () => void
  onViewDetails: () => void
  onClose: () => void
}) {
  const sheetStyle: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    backgroundColor: '#141414',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px 12px 0 0',
    zIndex: 200,
    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', padding: '14px 20px',
    fontSize: 13, fontWeight: 500, color: '#F5F3EE',
    background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
  }

  const dividerStyle: React.CSSProperties = {
    height: 1, margin: '0 20px', backgroundColor: 'rgba(255,255,255,0.06)',
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 199, backgroundColor: 'rgba(0,0,0,0.55)' }} />

      {/* Sheet */}
      <div style={sheetStyle}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 6 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)' }} />
        </div>

        {mode === 'root' && (
          <>
            {/* Item name label */}
            <div style={{ padding: '4px 20px 10px', fontSize: 11, color: '#6A6860', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {item.product.name}
            </div>

            <button
              className="hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors"
              style={rowStyle}
              onClick={() => onSetMode('edit-state')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <StateDot state={currentState} size={10} />
                Edit state
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div style={dividerStyle} />

            <button
              className="hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors"
              style={rowStyle}
              onClick={() => onSetMode('confirm-remove')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Remove from build
            </button>

            <div style={dividerStyle} />

            <button
              className="hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors"
              style={rowStyle}
              onClick={() => { onViewDetails(); onClose() }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              View details
            </button>

            <div style={{ height: 8 }} />
          </>
        )}

        {mode === 'edit-state' && (
          <>
            <div style={{ padding: '4px 20px 10px', fontSize: 11, color: '#6A6860', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              Change state for {item.product.name}
            </div>

            {STATE_ORDER.map((s) => {
              const meta = STATE_META[s]
              const isCurrent = s === currentState
              return (
                <button
                  key={s}
                  className="hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors"
                  style={{ ...rowStyle, color: isCurrent ? meta.color : '#F5F3EE' }}
                  onClick={() => { onStateChange(s); onClose() }}
                >
                  <StateDot state={s} size={10} />
                  <span style={{ flex: 1 }}>{meta.label}</span>
                  {isCurrent && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              )
            })}

            <div style={dividerStyle} />
            <button
              className="hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors"
              style={{ ...rowStyle, color: '#6A6860' }}
              onClick={() => onSetMode('root')}
            >
              ← Back
            </button>
            <div style={{ height: 8 }} />
          </>
        )}

        {mode === 'confirm-remove' && (
          <>
            <div style={{ padding: '12px 20px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F3EE', margin: '0 0 4px' }}>
                Remove from build?
              </p>
              <p style={{ fontSize: 12, color: '#6A6860', margin: 0, lineHeight: 1.5 }}>
                {item.product.name} will be removed from your current build.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '0 20px 16px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px', fontSize: 12, fontWeight: 500,
                  color: '#F5F3EE', backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onRemove(); onClose() }}
                style={{
                  flex: 1, padding: '12px', fontSize: 12, fontWeight: 600,
                  color: '#fff', backgroundColor: 'rgba(220,53,53,0.85)',
                  border: '1px solid rgba(220,53,53,0.5)', borderRadius: 8, cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Accessory item card ───────────────────────────────────────────────────────

function AccessoryCard({
  item,
  state,
  onShopNow,
  onStateChange,
  onRemove,
}: {
  item: GarageBuildItem
  state: ItemState
  onShopNow?: () => void
  onStateChange: (newState: ItemState) => void
  onRemove: () => void
}) {
  const { product } = item
  const meta = STATE_META[state]
  const isHistory = state === 'moved_on'
  const isWishlist = state === 'wishlist'
  const priceLabel = formatGaragePriceDisplay(product.price)

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuMode, setMenuMode] = useState<MenuMode>('root')
  const [expanded, setExpanded] = useState(false)

  function openMenu() {
    setMenuMode('root')
    setMenuOpen(true)
  }

  return (
    <>
      <div
        className="rounded-[12px] p-[13px]"
        style={
          isHistory
            ? { backgroundColor: '#111008', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 11, opacity: 0.75 }
            : { backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }
        }
      >
        <div className="flex gap-3 items-start">
          {/* Product image */}
          <div className="flex-shrink-0 rounded-[8px] overflow-hidden" style={{ width: 52, height: 52, backgroundColor: '#1A1814' }}>
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : null}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[#F5F3EE] font-semibold leading-tight truncate" style={{ fontSize: 12 }}>
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
                onClick={onShopNow}
                className="mt-2 rounded-full px-3 py-1 flex-shrink-0"
                style={{ fontSize: 11, fontWeight: 500, color: '#E8841A', border: '1px solid rgba(232,132,26,0.35)', backgroundColor: 'transparent', cursor: 'pointer' }}
              >
                Shop now →
              </button>
            )}
          </div>

          {/* Three-dot / close button */}
          <button
            onClick={expanded ? () => setExpanded(false) : openMenu}
            className="flex-shrink-0 flex items-center justify-center"
            style={{ width: 28, height: 28, fontSize: expanded ? 16 : 18, color: expanded ? '#6A6860' : '#B8B6B0', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
            aria-label={expanded ? 'Collapse details' : 'More options'}
          >
            {expanded ? '✕' : '⋮'}
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex flex-col gap-2">
              {/* Detail rows */}
              {[
                { label: 'Supplier', value: product.affiliateLinks?.[0]?.vendorName ?? product.brand },
                { label: 'Listed price', value: priceLabel },
                { label: 'Price paid', value: '—' },
                { label: 'Date fitted', value: '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-baseline">
                  <span style={{ fontSize: 11, color: '#6A6860' }}>{label}</span>
                  <span style={{ fontSize: 11, color: '#F5F3EE', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Shop now */}
            <Link
              href={`/shop/${item.productId}`}
              className="mt-3 flex items-center justify-center gap-1 rounded-full"
              style={{
                padding: '7px 16px',
                fontSize: 11, fontWeight: 500, color: '#E8841A',
                border: '1px solid rgba(232,132,26,0.35)',
                backgroundColor: 'transparent',
                textDecoration: 'none',
              }}
            >
              Shop now ↗
              <span style={{ fontSize: 10, color: '#44423E', marginLeft: 2 }}>opens retailer site</span>
            </Link>
          </div>
        )}
      </div>

      {/* Menu sheet — rendered outside card flow via fixed positioning */}
      {menuOpen && (
        <AccessoryMenuSheet
          item={item}
          currentState={state}
          mode={menuMode}
          onSetMode={setMenuMode}
          onStateChange={onStateChange}
          onRemove={onRemove}
          onViewDetails={() => setExpanded(true)}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ display: 'inline-block', width: 3, height: 14, backgroundColor: '#E8841A', borderRadius: 2, flexShrink: 0 }} />
      <span className="uppercase tracking-[0.05em] text-[#F5F3EE]" style={{ fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 12 }}>
        {label}
      </span>
      <span style={{ fontSize: 11, color: '#44423E' }}>{count}</span>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyPrompt({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-[12px] py-10 px-5 text-center" style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
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
  onDeleteBike?: () => void
  onDeleteBuild?: () => void
  onSwitchBikeTo?: (bike: GarageBikeRecord) => void
}

type ReturnPromptState = {
  productName: string
  retailerName: string
  price: number | null
  productId: number
}

export function GarageScreen({ bikes: _bikes, selectedBike, selectedBuild, onSwitchBike, onDeleteBike, onDeleteBuild, onSwitchBikeTo }: GarageScreenProps) {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [showModal, setShowModal] = useState(false)
  const [modalKey, setModalKey] = useState(0)
  const [returnPrompt, setReturnPrompt] = useState<ReturnPromptState | null>(null)

  // Local-only overrides — persisted to Supabase in a future pass
  const [stateOverrides, setStateOverrides] = useState<Record<string, ItemState>>({})
  const [removedItemIds, setRemovedItemIds] = useState<Set<string>>(new Set())

  const allItems = useMemo(() => selectedBuild?.buildItems ?? [], [selectedBuild])

  // Apply state overrides and filter removed items
  const itemsWithState = useMemo(
    () =>
      allItems
        .filter((item) => !removedItemIds.has(item.id))
        .map((item) => ({ item, state: stateOverrides[item.id] ?? getDemoItemState(item) })),
    [allItems, stateOverrides, removedItemIds]
  )

  const counts = useMemo(
    () => ({
      fitted:   itemsWithState.filter((x) => x.state === 'fitted').length,
      wishlist: itemsWithState.filter((x) => x.state === 'wishlist').length,
      history:  itemsWithState.filter((x) => x.state === 'moved_on').length,
    }),
    [itemsWithState]
  )

  const visibleItems = useMemo(() => {
    if (activeFilter === 'all')      return itemsWithState
    if (activeFilter === 'fitted')   return itemsWithState.filter((x) => x.state === 'fitted')
    if (activeFilter === 'wishlist') return itemsWithState.filter((x) => x.state === 'wishlist')
    return itemsWithState.filter((x) => x.state === 'moved_on')
  }, [itemsWithState, activeFilter])

  const categoryGroups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, Array<{ item: GarageBuildItem; state: ItemState }>>()
    for (const entry of visibleItems) {
      const catId = entry.item.product.categoryId
      if (!map.has(catId)) { order.push(catId); map.set(catId, []) }
      map.get(catId)!.push(entry)
    }
    return order.map((catId) => ({ catId, label: getCategoryLabel(catId), entries: map.get(catId)! }))
  }, [visibleItems])

  function handleStateChange(itemId: string, newState: ItemState) {
    setStateOverrides((prev) => ({ ...prev, [itemId]: newState }))
  }

  function handleRemove(itemId: string) {
    setRemovedItemIds((prev) => new Set([...prev, itemId]))
  }

  if (!selectedBike) {
    return (
      <div className="px-5 pt-4">
        <EmptyPrompt message="No bike selected — choose a bike in the Bike tab to see your garage." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-8">
      {returnPrompt && (
        <ReturnPrompt
          productName={returnPrompt.productName}
          retailerName={returnPrompt.retailerName}
          price={returnPrompt.price}
          onBought={() => setReturnPrompt(null)}
          onNotYet={() => setReturnPrompt(null)}
          onRemove={() => setReturnPrompt(null)}
        />
      )}

      <BikeHeaderCard
        bike={selectedBike}
        build={selectedBuild}
        bikes={_bikes}
        onSwitchBike={onSwitchBike}
        onDeleteBike={onDeleteBike}
        onDeleteBuild={onDeleteBuild}
        onSwitchBikeTo={onSwitchBikeTo}
      />

      <div className="flex gap-2">
        <StatCard count={counts.fitted}   label="Fitted"    borderColor="#1D9E75" />
        <StatCard count={counts.wishlist} label="Wish list" borderColor="#888780" />
        <StatCard count={counts.history}  label="History"   borderColor="#5DCAA5" />
      </div>

      <FilterPills active={activeFilter} onChange={setActiveFilter} />

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
                <AccessoryCard
                  key={item.id}
                  item={item}
                  state={state}
                  onStateChange={(newState) => handleStateChange(item.id, newState)}
                  onRemove={() => handleRemove(item.id)}
                  onShopNow={
                    state === 'wishlist'
                      ? () => {
                          const basePrice = 140 + ((item.productId * 7) % 180)
                          setReturnPrompt({
                            productName: item.product.name,
                            retailerName: item.product.affiliateLinks?.[0]?.vendorName ?? item.product.brand,
                            price: basePrice,
                            productId: item.productId,
                          })
                          router.push(`/shop/${item.productId}`)
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <button
        className="w-full text-center"
        onClick={() => { setModalKey(k => k + 1); setShowModal(true) }}
        style={{
          border: '1.5px dashed rgba(232,132,26,0.25)', borderRadius: 10,
          padding: '13px 14px', fontSize: 12, fontWeight: 500,
          color: 'rgba(232,132,26,0.5)', backgroundColor: 'transparent', cursor: 'pointer',
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
