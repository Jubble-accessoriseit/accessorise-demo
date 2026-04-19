'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { demoExpertBuildCatalog } from '@/lib/demo-content/expert-builds'
import { demoGarageProducts } from '@/lib/demo-content/products'
import type { ExpertBuild } from '@/lib/expert-builds/types'
import { garageCategories } from '@/types/garage'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

type GarageItemState = 'wishlist' | 'fitted' | null

type TableRow = {
  key: string
  title: string
  brand: string
  categoryId: string
  productId: number | null
  photoUrl: string | null
  expertNotes: string | null
  inExpert: boolean
}

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

function getDemoGarageState(productId: number): 'wishlist' | 'fitted' | null {
  const n = productId % 3
  if (n === 0) return null
  if (n === 1) return 'wishlist'
  return 'fitted'
}

function getAccPrice(productId: number): number {
  return 140 + ((productId * 7) % 180)
}

function groupTableRows(rows: TableRow[]) {
  const order: string[] = []
  const map = new Map<string, TableRow[]>()
  for (const row of rows) {
    if (!map.has(row.categoryId)) {
      order.push(row.categoryId)
      map.set(row.categoryId, [])
    }
    map.get(row.categoryId)!.push(row)
  }
  return order.map(catId => ({
    catId,
    label: getCategoryLabel(catId),
    rows: map.get(catId)!,
  }))
}

// ── Shared sheet pieces ───────────────────────────────────────────────────────

const SHEET_STYLE: React.CSSProperties = {
  position: 'fixed', bottom: 0, left: 0, right: 0,
  backgroundColor: '#141414',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '12px 12px 0 0',
  zIndex: 200,
  maxHeight: '90vh',
  overflowY: 'auto',
  paddingBottom: 'env(safe-area-inset-bottom, 16px)',
}

function SheetBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 199, backgroundColor: 'rgba(0,0,0,0.55)' }}
    />
  )
}

function SheetDragHandle() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 6 }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)' }} />
    </div>
  )
}

function FitBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(29,158,117,0.08)', borderRadius: 20,
      padding: '2px 8px', fontSize: 9, fontWeight: 500, color: '#1D9E75',
    }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Guaranteed fit
    </span>
  )
}

// ── ProductDetailSheet ────────────────────────────────────────────────────────

function ProductDetailSheet({
  row, garageState, onAddWishlist, onAddFitted, onClose,
}: {
  row: TableRow
  garageState: GarageItemState
  onAddWishlist: () => void
  onAddFitted: () => void
  onClose: () => void
}) {
  const price = row.productId ? getAccPrice(row.productId) : null
  const inBuild = garageState !== null

  return (
    <>
      <SheetBackdrop onClose={onClose} />
      <div style={SHEET_STYLE}>
        <SheetDragHandle />

        {/* Large photo — 160px */}
        <div style={{ height: 160, backgroundColor: '#1A1814', overflow: 'hidden', flexShrink: 0 }}>
          {row.photoUrl ? (
            <img
              src={row.photoUrl}
              alt={row.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          )}
        </div>

        {/* Product info */}
        <div style={{ padding: '14px 20px 12px' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#F5F3EE', margin: '0 0 3px', lineHeight: 1.3 }}>
            {row.title}
          </p>
          <p style={{ fontSize: 11, color: '#6A6860', margin: '0 0 9px' }}>{row.brand}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <FitBadge />
            {price !== null && (
              <span style={{ fontSize: 11, color: '#6A6860' }}>From ${price}</span>
            )}
          </div>
        </div>

        {/* Expert notes */}
        {row.expertNotes && (
          <>
            <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />
            <div style={{ padding: '12px 20px' }}>
              <p style={{
                fontSize: 9, fontWeight: 700, color: '#44423E',
                textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px',
              }}>
                Expert&apos;s note
              </p>
              <p style={{ fontSize: 12, color: '#6A6860', lineHeight: 1.6, margin: 0 }}>
                {row.expertNotes}
              </p>
            </div>
          </>
        )}

        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />

        {/* Actions */}
        <div style={{ padding: '14px 20px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {row.productId && (
            <Link
              href={`/shop/${row.productId}`}
              style={{
                display: 'block', textAlign: 'center', padding: 13, borderRadius: 8,
                backgroundColor: '#1C69D4', textDecoration: 'none',
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                fontWeight: 900, fontSize: 13, color: '#fff',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              Shop now ↗
            </Link>
          )}

          {inBuild ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', backgroundColor: '#1D9E75',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F3EE', margin: 0 }}>In your build</p>
                <p style={{ fontSize: 11, color: '#6A6860', margin: '2px 0 0' }}>
                  {garageState === 'fitted' ? 'Fitted' : 'On your wish list'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => { onAddWishlist(); onClose() }}
                style={{
                  width: '100%', padding: 12, borderRadius: 8,
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(28,105,212,0.4)',
                  fontSize: 12, fontWeight: 600, color: '#1C69D4', cursor: 'pointer',
                }}
              >
                Add to wish list
              </button>
              <button
                onClick={() => { onAddFitted(); onClose() }}
                style={{
                  width: '100%', padding: 11, borderRadius: 8,
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(29,158,117,0.35)',
                  fontSize: 12, fontWeight: 600, color: '#1D9E75', cursor: 'pointer',
                }}
              >
                Already fitted
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── SaveBuildSheet ────────────────────────────────────────────────────────────

function SaveBuildSheet({
  build, toAddCount, onSave, onClose, saved,
}: {
  build: ExpertBuild
  toAddCount: number
  onSave: () => void
  onClose: () => void
  saved: boolean
}) {
  const [snapCount] = useState(toAddCount)

  return (
    <>
      <SheetBackdrop onClose={onClose} />
      <div style={SHEET_STYLE}>
        <SheetDragHandle />

        {saved ? (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <span style={{
              width: 52, height: 52, borderRadius: '50%',
              backgroundColor: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div>
              <p style={{
                fontSize: 14, fontWeight: 900, color: '#F5F3EE', margin: '0 0 4px',
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                textTransform: 'uppercase', letterSpacing: '0.03em',
              }}>
                Added to your garage
              </p>
              <p style={{ fontSize: 12, color: '#6A6860', margin: 0 }}>
                {snapCount} {snapCount === 1 ? 'accessory' : 'accessories'} added to your wish list
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: 13, borderRadius: 8, marginTop: 4,
                backgroundColor: '#1C69D4', border: 'none',
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                fontWeight: 900, fontSize: 13, color: '#fff',
                textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 20px 16px' }}>
              <p style={{
                fontSize: 14, fontWeight: 900, color: '#F5F3EE', margin: '0 0 6px',
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                textTransform: 'uppercase', letterSpacing: '0.03em',
              }}>
                Save this build?
              </p>
              <p style={{ fontSize: 12, color: '#6A6860', margin: 0, lineHeight: 1.55 }}>
                Add {snapCount} {snapCount === 1 ? 'accessory' : 'accessories'} from {build.title} to your wish list.
              </p>
            </div>
            <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />
            <div style={{ padding: '14px 20px 8px', display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: 12, borderRadius: 8,
                  backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: 12, fontWeight: 500, color: '#F5F3EE', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                style={{
                  flex: 2, padding: 13, borderRadius: 8,
                  backgroundColor: '#1C69D4', border: 'none',
                  fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                  fontWeight: 900, fontSize: 13, color: '#fff',
                  textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
                }}
              >
                Add {snapCount} {snapCount === 1 ? 'accessory' : 'accessories'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Shared small components ───────────────────────────────────────────────────

function CategoryTag({ label }: { label: string }) {
  return (
    <span style={{
      backgroundColor: 'rgba(28,105,212,0.08)', border: '1px solid rgba(28,105,212,0.16)',
      color: '#1C69D4', fontSize: 9, fontWeight: 500,
      padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span style={{
      backgroundColor: 'rgba(28,105,212,0.1)', border: '1px solid rgba(28,105,212,0.2)',
      color: '#1C69D4', fontSize: 9, fontWeight: 500,
      padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap',
    }}>
      Verified
    </span>
  )
}

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C69D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

// ── ComparisonTable ───────────────────────────────────────────────────────────

function ComparisonTable({
  tableGroups, garageItems, isLoggedIn, onRowTap, onQuickAdd,
}: {
  tableGroups: Array<{ catId: string; label: string; rows: TableRow[] }>
  garageItems: Partial<Record<number, 'wishlist' | 'fitted'>>
  isLoggedIn: boolean
  onRowTap: (row: TableRow) => void
  onQuickAdd: (productId: number) => void
}) {
  const totalCount = tableGroups.reduce((n, g) => n + g.rows.length, 0)

  return (
    <div style={{ padding: '0 20px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{
          display: 'inline-block', width: 3, height: 14,
          backgroundColor: '#1C69D4', borderRadius: 2, flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 12, textTransform: 'uppercase',
          letterSpacing: '0.05em', color: '#F5F3EE',
        }}>
          Gear comparison
        </span>
        <span style={{ fontSize: 11, color: '#44423E' }}>{totalCount}</span>
      </div>

      <div style={{
        backgroundColor: '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 44px 68px',
          alignItems: 'center',
          padding: '9px 13px',
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#44423E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Accessory
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#44423E', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
            Expert
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#44423E', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
            My build
          </span>
        </div>

        {/* Sign-in prompt for logged-out riders */}
        {!isLoggedIn && (
          <div style={{
            margin: '10px 13px 4px',
            backgroundColor: 'rgba(28,105,212,0.06)',
            border: '1px solid rgba(28,105,212,0.24)',
            borderRadius: 10,
            padding: '10px 13px',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', margin: '0 0 4px' }}>
              Sign in to see your build
            </p>
            <p style={{ fontSize: 11, color: '#6A6860', margin: '0 0 10px', lineHeight: 1.5 }}>
              See which of these you already have fitted or on your wish list.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-block', padding: '7px 14px', borderRadius: 8,
                backgroundColor: '#1C69D4', textDecoration: 'none',
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                fontWeight: 900, fontSize: 11, color: '#fff',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              Sign in
            </Link>
          </div>
        )}

        {/* Category groups */}
        {tableGroups.map(({ catId, label, rows }, gIdx) => (
          <div key={catId}>
            {/* Category header row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 13px',
              backgroundColor: 'rgba(255,255,255,0.025)',
              borderTop: gIdx === 0 && isLoggedIn
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                width: 3, height: 11,
                backgroundColor: '#1C69D4', borderRadius: 1, flexShrink: 0,
              }} />
              <span style={{
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                fontWeight: 900, fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F5F3EE',
              }}>
                {label}
              </span>
              <span style={{ fontSize: 10, color: '#44423E' }}>{rows.length}</span>
            </div>

            {/* Accessory rows */}
            {rows.map((row, rIdx) => {
              const myState = row.productId != null ? (garageItems[row.productId] ?? null) : null
              const showPlus = isLoggedIn && row.productId != null && myState === null
              const isLast = rIdx === rows.length - 1

              return (
                <div
                  key={row.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 44px 68px',
                    alignItems: 'center',
                    borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Accessory name cell — tappable */}
                  <button
                    onClick={() => onRowTap(row)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '10px 0 10px 13px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', minWidth: 0,
                    }}
                  >
                    {/* 36px thumbnail */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 6,
                      backgroundColor: '#1A1814', flexShrink: 0, overflow: 'hidden',
                    }}>
                      {row.photoUrl && (
                        <img
                          src={row.photoUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    {/* Name + brand */}
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: 11, fontWeight: 500, color: '#F5F3EE',
                        margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {row.title}
                      </p>
                      <p style={{ fontSize: 10, color: '#6A6860', margin: '1px 0 0' }}>
                        {row.brand}
                      </p>
                    </div>
                  </button>

                  {/* Expert column */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {row.inExpert ? (
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        backgroundColor: '#1C69D4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    ) : (
                      <span style={{ fontSize: 14, color: '#44423E', lineHeight: 1 }}>—</span>
                    )}
                  </div>

                  {/* My Build column */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {!isLoggedIn ? (
                      <span style={{ fontSize: 14, color: '#3A3830', lineHeight: 1 }}>—</span>
                    ) : myState === 'fitted' ? (
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        backgroundColor: '#1D9E75',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    ) : myState === 'wishlist' ? (
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: '1.5px solid #888780',
                        backgroundColor: 'transparent',
                        display: 'inline-block', flexShrink: 0,
                      }} />
                    ) : showPlus ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onQuickAdd(row.productId!) }}
                        style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: '1px solid rgba(28,105,212,0.4)',
                          color: '#1C69D4', backgroundColor: 'transparent',
                          fontSize: 16, fontWeight: 300, lineHeight: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0,
                        }}
                        aria-label={`Add ${row.title} to wish list`}
                      >
                        +
                      </button>
                    ) : (
                      <span style={{ fontSize: 14, color: '#44423E', lineHeight: 1 }}>—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExpertBuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [garageItems, setGarageItems] = useState<Partial<Record<number, 'wishlist' | 'fitted'>>>({})
  const [detailRow, setDetailRow] = useState<TableRow | null>(null)
  const [saveSheetOpen, setSaveSheetOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const build = useMemo(
    () => demoExpertBuildCatalog.find(b => b.id === id || b.slug === id) ?? null,
    [id]
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session))

    // Seed garage state from ALL demo products (not just this build's accessories)
    const initial: Partial<Record<number, 'wishlist' | 'fitted'>> = {}
    for (const product of demoGarageProducts) {
      const s = getDemoGarageState(product.id)
      if (s !== null) initial[product.id] = s
    }
    setGarageItems(initial)
  }, [id])

  const uniqueCategories = useMemo(
    () => (build ? new Set(build.accessories.map(a => a.categoryId)).size : 0),
    [build]
  )

  const photoCount = build ? 1 + build.galleryPhotos.length : 0

  // Build unified comparison rows: expert accessories + garage-only products
  const tableRows = useMemo((): TableRow[] => {
    if (!build) return []
    const rows: TableRow[] = []
    const expertProductIds = new Set<number>()

    for (const acc of build.accessories) {
      if (acc.productId != null) expertProductIds.add(acc.productId)
      const hasPhoto = (acc.installedPhotoIds?.length ?? 0) > 0
      rows.push({
        key: `expert-${acc.id}`,
        title: acc.title,
        brand: acc.brand,
        categoryId: acc.categoryId,
        productId: acc.productId ?? null,
        photoUrl: hasPhoto ? build.primaryPhoto?.imageUrl ?? null : null,
        expertNotes: acc.notes ?? null,
        inExpert: true,
      })
    }

    // Garage-only: demo products the rider has that aren't in this expert build
    for (const product of demoGarageProducts) {
      if (expertProductIds.has(product.id)) continue
      if (getDemoGarageState(product.id) === null) continue
      rows.push({
        key: `garage-${product.id}`,
        title: product.name,
        brand: product.brand,
        categoryId: product.categoryId,
        productId: product.id,
        photoUrl: product.image,
        expertNotes: null,
        inExpert: false,
      })
    }

    return rows
  }, [build])

  const tableGroups = useMemo(() => groupTableRows(tableRows), [tableRows])

  // Count expert accessories not yet in garageItems (for save sheet)
  const toAddCount = useMemo(
    () => build?.accessories.filter(a => a.productId != null && !garageItems[a.productId!]).length ?? 0,
    [build, garageItems]
  )

  function handleAddWishlist(productId: number) {
    setGarageItems(prev => ({ ...prev, [productId]: 'wishlist' }))
  }

  function handleAddFitted(productId: number) {
    setGarageItems(prev => ({ ...prev, [productId]: 'fitted' }))
  }

  function handleSaveAll() {
    if (!build) return
    setGarageItems(prev => {
      const next = { ...prev }
      for (const acc of build.accessories) {
        if (acc.productId != null && !next[acc.productId]) {
          next[acc.productId] = 'wishlist'
        }
      }
      return next
    })
    setSaveSuccess(true)
  }

  if (!build) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 32 }}>
          <p style={{ fontSize: 13, color: '#6A6860', margin: '0 0 16px' }}>Build not found.</p>
          <Link href="/expert" style={{ fontSize: 12, color: '#1C69D4', fontWeight: 500 }}>
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
          <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
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
          <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(28,105,212,0.15)', border: '1px solid rgba(28,105,212,0.3)', color: '#1C69D4', fontSize: 9, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>
            Owner photos · real bike
          </span>
        )}
        <span style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.55)', color: '#F5F3EE', fontSize: 9, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>
          {photoCount} photos
        </span>
      </div>

      {/* C — Rider info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '12px 20px 8px' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(28,105,212,0.12)', color: '#1C69D4', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {initials}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE' }}>{build.builderName}</span>
        {build.credibility?.verifiedBuilder && <VerifiedBadge />}
        <span style={{ fontSize: 11, color: '#6A6860' }}>{bikeLabel}</span>
        <CategoryTag label={purposeLabel(build.dna.purpose)} />
      </div>

      {/* D — Stats row */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            { value: build.accessories.length, label: 'accessories' },
            { value: uniqueCategories, label: 'categories' },
            { value: purposeLabel(build.dna.purpose), label: 'build type' },
          ].map(({ value, label }, i) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <span style={{ fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: typeof value === 'number' ? 20 : 13, color: '#F5F3EE', lineHeight: 1 }}>
                {value}
              </span>
              <span style={{ fontSize: 10, color: '#6A6860', marginTop: 4 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* E — Save + Share buttons */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px' }}>
        <button
          onClick={() => { setSaveSuccess(false); setSaveSheetOpen(true) }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid rgba(28,105,212,0.35)', color: '#1C69D4', backgroundColor: 'transparent', borderRadius: 8, padding: '10px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          <BookmarkIcon />
          Save this build
        </button>
        <button
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F3EE', backgroundColor: 'transparent', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}
          aria-label="Share"
        >
          <ShareIcon />
        </button>
      </div>

      {/* F — Unified comparison table */}
      <ComparisonTable
        tableGroups={tableGroups}
        garageItems={garageItems}
        isLoggedIn={isLoggedIn}
        onRowTap={setDetailRow}
        onQuickAdd={handleAddWishlist}
      />

      {/* G — Shop all CTA */}
      <div style={{ padding: '24px 20px 0' }}>
        <button
          style={{ width: '100%', backgroundColor: '#1C69D4', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 20px', fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}
        >
          Shop all accessories
        </button>
      </div>

      {/* Sheets */}
      {detailRow && (
        <ProductDetailSheet
          row={detailRow}
          garageState={detailRow.productId != null ? (garageItems[detailRow.productId] ?? null) : null}
          onAddWishlist={() => detailRow.productId != null && handleAddWishlist(detailRow.productId)}
          onAddFitted={() => detailRow.productId != null && handleAddFitted(detailRow.productId)}
          onClose={() => setDetailRow(null)}
        />
      )}

      {saveSheetOpen && (
        <SaveBuildSheet
          build={build}
          toAddCount={toAddCount}
          onSave={handleSaveAll}
          onClose={() => { setSaveSheetOpen(false); setSaveSuccess(false) }}
          saved={saveSuccess}
        />
      )}

    </div>
  )
}
