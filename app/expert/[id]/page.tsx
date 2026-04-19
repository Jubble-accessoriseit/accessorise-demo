'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { demoExpertBuildCatalog } from '@/lib/demo-content/expert-builds'
import { demoGarageProducts } from '@/lib/demo-content/products'
import type { ExpertBuild, ExpertBuildAccessory } from '@/lib/expert-builds/types'
import { garageCategories } from '@/types/garage'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

type GarageItemState = 'wishlist' | 'fitted' | null

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
  return `$${product.price}`
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

// Same modulo logic as GarageScreen.getDemoItemState — null means not in current active build
function getDemoGarageState(productId: number): 'wishlist' | 'fitted' | null {
  const n = productId % 3
  if (n === 0) return null
  if (n === 1) return 'wishlist'
  return 'fitted'
}

function getAccPrice(productId: number): number {
  return 140 + ((productId * 7) % 180)
}

// ── Shared sheet pieces ───────────────────────────────────────────────────────

const SHEET_STYLE: React.CSSProperties = {
  position: 'fixed', bottom: 0, left: 0, right: 0,
  backgroundColor: '#141414',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '12px 12px 0 0',
  zIndex: 200,
  paddingBottom: 'env(safe-area-inset-bottom, 16px)',
}

function SheetBackdrop({ onClose }: { onClose: () => void }) {
  return <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 199, backgroundColor: 'rgba(0,0,0,0.55)' }} />
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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: 'rgba(29,158,117,0.08)', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 500, color: '#1D9E75' }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Guaranteed fit
    </span>
  )
}

// ── AddToGarageSheet ──────────────────────────────────────────────────────────

function AddToGarageSheet({
  acc, build, garageState, onAddWishlist, onAddFitted, onClose,
}: {
  acc: ExpertBuildAccessory
  build: ExpertBuild
  garageState: GarageItemState
  onAddWishlist: () => void
  onAddFitted: () => void
  onClose: () => void
}) {
  const hasPhoto = (acc.installedPhotoIds?.length ?? 0) > 0
  const photoUrl = hasPhoto ? build.primaryPhoto?.imageUrl ?? null : null
  const price = acc.productId ? getAccPrice(acc.productId) : null
  const inBuild = garageState !== null

  return (
    <>
      <SheetBackdrop onClose={onClose} />
      <div style={SHEET_STYLE}>
        <SheetDragHandle />

        {/* Accessory summary */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 20px 14px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 8, backgroundColor: '#1A1814', flexShrink: 0, overflow: 'hidden' }}>
            {photoUrl && <img src={photoUrl} alt={acc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F3EE', margin: '0 0 2px', lineHeight: 1.3 }}>{acc.title}</p>
            <p style={{ fontSize: 11, color: '#6A6860', margin: '0 0 6px' }}>{acc.brand}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <FitBadge />
              {price !== null && <span style={{ fontSize: 11, color: '#6A6860' }}>From ${price}</span>}
            </div>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />

        {/* Actions */}
        <div style={{ padding: '14px 20px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inBuild ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                  width: '100%', padding: 13, borderRadius: 8,
                  backgroundColor: '#1C69D4', border: 'none',
                  fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                  fontWeight: 900, fontSize: 13, color: '#fff',
                  textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
                }}
              >
                Add to wish list
              </button>
              <button
                onClick={() => { onAddFitted(); onClose() }}
                style={{
                  width: '100%', padding: 12, borderRadius: 8,
                  backgroundColor: 'transparent', border: '1px solid rgba(29,158,117,0.4)',
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
  // Snapshot the count at mount so the success message is accurate after garageItems updates
  const [snapCount] = useState(toAddCount)

  return (
    <>
      <SheetBackdrop onClose={onClose} />
      <div style={SHEET_STYLE}>
        <SheetDragHandle />

        {saved ? (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 900, color: '#F5F3EE', margin: '0 0 4px', fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em' }}>
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
              <p style={{ fontSize: 14, fontWeight: 900, color: '#F5F3EE', margin: '0 0 6px', fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em' }}>
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
                style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 500, color: '#F5F3EE', cursor: 'pointer' }}
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

// ── CompareBuildSection ───────────────────────────────────────────────────────

function CompareBuildSection({
  build, garageItems, isLoggedIn,
}: {
  build: ExpertBuild
  garageItems: Partial<Record<number, 'wishlist' | 'fitted'>>
  isLoggedIn: boolean
}) {
  const seeded = build.accessories.filter(a => a.productId != null)

  return (
    <div style={{ padding: '0 20px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ display: 'inline-block', width: 3, height: 14, backgroundColor: '#E8841A', borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F5F3EE' }}>
          Compare with my build
        </span>
        <span style={{ fontSize: 11, color: '#44423E' }}>{seeded.length}</span>
      </div>

      {!isLoggedIn ? (
        <div style={{ backgroundColor: 'rgba(232,132,26,0.06)', border: '1px solid rgba(232,132,26,0.24)', borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F3EE', margin: '0 0 4px' }}>
            Sign in to compare with your build
          </p>
          <p style={{ fontSize: 11, color: '#6A6860', margin: '0 0 12px', lineHeight: 1.5 }}>
            See which of these accessories you already have fitted, on your wish list, or still missing.
          </p>
          <Link
            href="/login"
            style={{ display: 'inline-block', padding: '9px 18px', borderRadius: 8, backgroundColor: '#E8841A', fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 12, color: '#0D0D0D', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Column headers */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 13px', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: '#44423E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Accessory</span>
            <span style={{ width: 52, textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#44423E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expert</span>
            <span style={{ width: 64, textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#44423E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>My build</span>
          </div>

          {seeded.map((acc, i) => {
            const productId = acc.productId!
            const hasPhoto = (acc.installedPhotoIds?.length ?? 0) > 0
            const photoUrl = hasPhoto ? build.primaryPhoto?.imageUrl ?? null : null
            const myState = garageItems[productId] ?? null
            const isLast = i === seeded.length - 1

            return (
              <div
                key={acc.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)' }}
              >
                {/* Thumbnail */}
                <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: '#1A1814', flexShrink: 0, overflow: 'hidden' }}>
                  {photoUrl && <img src={photoUrl} alt={acc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>

                {/* Name + brand */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: '#F5F3EE', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.title}</p>
                  <p style={{ fontSize: 10, color: '#6A6860', margin: '1px 0 0' }}>{acc.brand}</p>
                </div>

                {/* Expert — always blue tick */}
                <div style={{ width: 52, display: 'flex', justifyContent: 'center' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#1C69D4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>

                {/* My build */}
                <div style={{ width: 64, display: 'flex', justifyContent: 'center' }}>
                  {myState === 'fitted' ? (
                    <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  ) : myState === 'wishlist' ? (
                    <span style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid #888780', backgroundColor: 'transparent', display: 'inline-block', flexShrink: 0 }} />
                  ) : (
                    <span style={{ fontSize: 14, color: '#44423E', lineHeight: 1 }}>—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Shared small components ───────────────────────────────────────────────────

function CategoryTag({ label }: { label: string }) {
  return (
    <span style={{ backgroundColor: 'rgba(28,105,212,0.08)', border: '1px solid rgba(28,105,212,0.16)', color: '#1C69D4', fontSize: 9, fontWeight: 500, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span style={{ backgroundColor: 'rgba(28,105,212,0.1)', border: '1px solid rgba(28,105,212,0.2)', color: '#1C69D4', fontSize: 9, fontWeight: 500, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      Verified
    </span>
  )
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-block', width: 3, height: 14, backgroundColor: '#1C69D4', borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F5F3EE' }}>
        {label}
      </span>
      <span style={{ fontSize: 11, color: '#44423E' }}>{count}</span>
    </div>
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

// ── Accessory card ────────────────────────────────────────────────────────────

function AccessoryCard({
  acc, build, garageState, onAdd,
}: {
  acc: ExpertBuildAccessory
  build: ExpertBuild
  garageState: GarageItemState
  onAdd: () => void
}) {
  const usageCount = countBuildsUsing(acc.id)
  const price = getPriceLabel(acc.productId)
  const hasPhoto = (acc.installedPhotoIds?.length ?? 0) > 0
  const hasProductId = acc.productId != null
  const inBuild = garageState !== null

  return (
    <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 13, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {/* 52px photo area */}
      <div style={{ width: 52, height: 52, backgroundColor: '#1A1814', borderRadius: 8, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        {hasPhoto && build.primaryPhoto?.imageUrl && (
          <img src={build.primaryPhoto.imageUrl} alt={acc.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', lineHeight: 1.3, margin: 0 }}>{acc.title}</p>
        <p style={{ fontSize: 10, color: '#6A6860', margin: '2px 0 0' }}>{acc.brand}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1D9E75', flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 500, color: '#1D9E75' }}>Fitted</span>
          <span style={{ fontSize: 10, color: '#44423E' }}>·</span>
          <span style={{ fontSize: 11, color: '#6A6860' }}>{price}</span>
        </div>

        <p style={{ fontSize: 11, fontWeight: 500, color: '#1456B0', margin: '4px 0 0' }}>
          ↗ Used in {usageCount} expert {usageCount === 1 ? 'build' : 'builds'}
        </p>
      </div>

      {/* + button or green tick */}
      {hasProductId && (
        inBuild ? (
          <span
            style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            aria-label={`${acc.title} is in your build`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        ) : (
          <button
            onClick={onAdd}
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(28,105,212,0.35)', color: '#1C69D4', backgroundColor: 'transparent', fontSize: 18, fontWeight: 300, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            aria-label={`Add ${acc.title} to garage`}
          >
            +
          </button>
        )
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExpertBuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [garageItems, setGarageItems] = useState<Partial<Record<number, 'wishlist' | 'fitted'>>>({})
  const [addSheetAcc, setAddSheetAcc] = useState<ExpertBuildAccessory | null>(null)
  const [saveSheetOpen, setSaveSheetOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const build = useMemo(
    () => demoExpertBuildCatalog.find(b => b.id === id || b.slug === id) ?? null,
    [id]
  )

  // Check auth and seed demo garage state from build accessories
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session))

    if (!build) return
    const initial: Partial<Record<number, 'wishlist' | 'fitted'>> = {}
    for (const acc of build.accessories) {
      if (acc.productId != null) {
        const s = getDemoGarageState(acc.productId)
        if (s !== null) initial[acc.productId] = s
      }
    }
    setGarageItems(initial)
  }, [id, build])

  const categoryGroups = useMemo(
    () => (build ? groupByCategory(build.accessories) : []),
    [build]
  )

  const uniqueCategories = useMemo(
    () => (build ? new Set(build.accessories.map(a => a.categoryId)).size : 0),
    [build]
  )

  const photoCount = build ? 1 + build.galleryPhotos.length : 0

  // Count seeded accessories not yet in garageItems (null = not in build)
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
          <Link href="/expert" style={{ fontSize: 12, color: '#1C69D4', fontWeight: 500 }}>← Back to Expert builds</Link>
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
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }} aria-label="Go back">
            <BackArrow />
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
            {build.title}
          </span>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#44423E', display: 'flex', alignItems: 'center', flexShrink: 0 }} aria-label="Share">
          <ShareIcon />
        </button>
      </div>

      {/* B — Photo area */}
      <div style={{ position: 'relative', height: 158, backgroundColor: '#1A1814', overflow: 'hidden' }}>
        {build.primaryPhoto?.imageUrl && (
          <img src={build.primaryPhoto.imageUrl} alt={build.primaryPhoto.alt} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
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
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
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

      {/* F — Accessory sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 20px' }}>
        {categoryGroups.map(({ catId, label, items }) => (
          <div key={catId} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionHeader label={label} count={items.length} />
            {items.map(acc => (
              <AccessoryCard
                key={acc.id}
                acc={acc}
                build={build}
                garageState={acc.productId != null ? (garageItems[acc.productId] ?? null) : null}
                onAdd={() => setAddSheetAcc(acc)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* G — Compare section */}
      <div style={{ marginTop: 28 }}>
        <CompareBuildSection build={build} garageItems={garageItems} isLoggedIn={isLoggedIn} />
      </div>

      {/* H — Shop all accessories CTA */}
      <div style={{ padding: '24px 20px 0' }}>
        <button
          style={{ width: '100%', backgroundColor: '#1C69D4', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 20px', fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}
        >
          Shop all accessories
        </button>
      </div>

      {/* Sheets */}
      {addSheetAcc && (
        <AddToGarageSheet
          acc={addSheetAcc}
          build={build}
          garageState={addSheetAcc.productId != null ? (garageItems[addSheetAcc.productId] ?? null) : null}
          onAddWishlist={() => addSheetAcc.productId != null && handleAddWishlist(addSheetAcc.productId)}
          onAddFitted={() => addSheetAcc.productId != null && handleAddFitted(addSheetAcc.productId)}
          onClose={() => setAddSheetAcc(null)}
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
