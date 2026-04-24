'use client'

import { useState, useMemo, useRef } from 'react'
import { demoGarageProducts } from '@/lib/demo-content/products'
import { garageCategories } from '@/types/garage'
import type { Product } from '@/types/garage'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3
type ItemState = 'wishlist' | 'fitted'

type AddAccessoryModalProps = {
  bikeName: string
  bikeId: string | null
  onClose: () => void
  onViewBuild: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCategoryLabel(categoryId: string): string {
  return garageCategories.find(c => c.id === categoryId)?.label ?? categoryId
}

function matchesSearch(p: Product, q: string): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  return (
    p.name.toLowerCase().includes(lower) ||
    p.brand.toLowerCase().includes(lower)
  )
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#44423E', fontSize: 22, lineHeight: 1, padding: 4,
        display: 'flex', alignItems: 'center', flexShrink: 0,
      }}
      aria-label="Close"
    >
      ×
    </button>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 4, padding: 0,
      }}
      aria-label="Back"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="#E8841A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: '50%',
      backgroundColor: 'rgba(29,158,117,0.12)',
      border: '1px solid rgba(29,158,117,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
}

// ── Fit badge ─────────────────────────────────────────────────────────────────

function FitBadge({ label = 'Guaranteed fit' }: { label?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(29,158,117,0.08)', borderRadius: 20,
      padding: '2px 8px',
    }}>
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5.5" stroke="#1D9E75" strokeWidth="1" />
        <polyline points="3,6 5,8.5 9,4" stroke="#1D9E75" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 9, fontWeight: 500, color: '#1D9E75' }}>{label}</span>
    </span>
  )
}

// ── Category pills row with scroll arrows ─────────────────────────────────────

function CategoryPillsRow({
  categoryIds, activeCategoryId, onSelect,
}: {
  categoryIds: string[]
  activeCategoryId: string
  onSelect: (id: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 120 : -120, behavior: 'smooth' })
  }

  const arrowStyle: React.CSSProperties = {
    flexShrink: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 6px',
    color: '#B8AFA6',
    display: 'flex',
    alignItems: 'center',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 12px', gap: 0 }}>
      <button type="button" onClick={() => scroll('left')} style={arrowStyle} aria-label="Scroll left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        style={{
          flex: 1, display: 'flex', gap: 8,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}
      >
        {categoryIds.map(catId => {
          const active = activeCategoryId === catId
          return (
            <button
              type="button"
              key={catId}
              onClick={() => onSelect(catId)}
              style={{
                flexShrink: 0, borderRadius: 20, padding: '6px 13px',
                fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
                border: active ? '1px solid rgba(232,132,26,0.22)' : '1px solid rgba(255,255,255,0.07)',
                backgroundColor: active ? 'rgba(232,132,26,0.1)' : '#141414',
                color: active ? '#E8841A' : '#B8AFA6',
              }}
            >
              {catId === 'all' ? 'All' : getCategoryLabel(catId)}
            </button>
          )
        })}
      </div>

      <button type="button" onClick={() => scroll('right')} style={arrowStyle} aria-label="Scroll right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}

// ── Step 1 ────────────────────────────────────────────────────────────────────

function Step1Search({
  bikeName, bikeId,
  onSelect, onClose,
}: {
  bikeName: string
  bikeId: string | null
  onSelect: (p: Product) => void
  onClose: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState('all')

  const bikeProducts = useMemo(
    () => demoGarageProducts.filter(p =>
      !bikeId ||
      p.compatibility.bikeIds.includes(bikeId) ||
      p.compatibility.universal === true
    ),
    [bikeId]
  )

  const availableCategoryIds = useMemo(
    () => Array.from(new Set(bikeProducts.map(p => p.categoryId))),
    [bikeProducts]
  )

  const visibleProducts = useMemo(
    () => bikeProducts
      .filter(p => activeCategoryId === 'all' || p.categoryId === activeCategoryId)
      .filter(p => matchesSearch(p, searchQuery)),
    [bikeProducts, activeCategoryId, searchQuery]
  )

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F3EE', margin: 0 }}>
          Add to {bikeName}
        </p>
        <CloseBtn onClose={onClose} />
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 20px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8, padding: '10px 12px',
        }}>
          <SearchIcon />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search accessories for your ${bikeName}...`}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 12, color: '#F5F3EE', caretColor: '#E8841A',
            }}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#44423E', fontSize: 16, padding: 0, lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category pills with scroll arrows */}
      <CategoryPillsRow
        categoryIds={['all', ...availableCategoryIds]}
        activeCategoryId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 20px', paddingBottom: 24 }}>
        {visibleProducts.length === 0 ? (
          <p style={{ fontSize: 13, color: '#6A6860', textAlign: 'center', padding: '32px 0' }}>
            No accessories found for your search.
          </p>
        ) : (
          visibleProducts.map((product, i) => {
            const isTopResult = i === 0 && !searchQuery
            return (
              <button type="button" key={product.id} onClick={() => onSelect(product)}
                style={{
                  display: 'flex', gap: 12, alignItems: 'center',
                  backgroundColor: isTopResult ? 'rgba(232,132,26,0.03)' : '#141414',
                  border: isTopResult
                    ? '1px solid rgba(232,132,26,0.22)'
                    : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: 13,
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                {/* Image */}
                <div style={{ width: 44, height: 44, backgroundColor: '#1A1814', borderRadius: 8, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                  {product.image && (
                    <img src={product.image} alt={product.name}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', margin: 0, lineHeight: 1.3 }}>
                    {product.name}
                  </p>
                  <p style={{ fontSize: 10, color: '#6A6860', margin: '2px 0 4px' }}>{product.brand}</p>
                  <FitBadge />
                </div>
                {/* Chevron */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )
          })
        )}
      </div>
    </>
  )
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

function Step2Details({
  product, itemState, setItemState,
  boughtAt, setBoughtAt,
  pricePaid, setPricePaid,
  datePurchased, setDatePurchased,
  onBack, onClose, onConfirm,
}: {
  product: Product
  itemState: ItemState
  setItemState: (s: ItemState) => void
  boughtAt: string
  setBoughtAt: (v: string) => void
  pricePaid: string
  setPricePaid: (v: string) => void
  datePurchased: string
  setDatePurchased: (v: string) => void
  onBack: () => void
  onClose: () => void
  onConfirm: () => void
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    backgroundColor: '#1A1814', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 6, padding: '8px 10px',
    fontSize: 12, color: '#F5F3EE',
    outline: 'none', caretColor: '#E8841A',
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
        <BackBtn onClick={onBack} />
        <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F3EE', margin: 0 }}>Add details</p>
        <CloseBtn onClose={onClose} />
      </div>

      {/* Accessory summary card — amber border */}
      <div style={{ margin: '0 20px 16px' }}>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          backgroundColor: '#141414', border: '1px solid rgba(232,132,26,0.22)',
          borderRadius: 12, padding: 13,
        }}>
          <div style={{ width: 44, height: 44, backgroundColor: '#1A1814', borderRadius: 8, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
            {product.image && (
              <img src={product.image} alt={product.name}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', margin: 0, lineHeight: 1.3 }}>{product.name}</p>
            <p style={{ fontSize: 10, color: '#6A6860', margin: '2px 0 4px' }}>{product.brand}</p>
            <FitBadge />
          </div>
        </div>
      </div>

      {/* "Adding as" heading */}
      <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', margin: '0 20px 8px' }}>Adding as</p>

      {/* State option cards */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px' }}>
        {/* Wish list */}
        <button type="button" onClick={() => setItemState('wishlist')}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 6, padding: '14px 10px',
            backgroundColor: itemState === 'wishlist' ? 'rgba(136,135,128,0.05)' : '#141414',
            border: itemState === 'wishlist' ? '1px solid #888780' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, cursor: 'pointer',
          }}>
          {/* Outline dot */}
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #888780' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE' }}>Wish list</span>
          <span style={{ fontSize: 10, color: '#6A6860' }}>Save to buy later</span>
        </button>

        {/* Fitted */}
        <button type="button" onClick={() => setItemState('fitted')}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 6, padding: '14px 10px',
            backgroundColor: itemState === 'fitted' ? 'rgba(29,158,117,0.05)' : '#141414',
            border: itemState === 'fitted' ? '1px solid #1D9E75' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, cursor: 'pointer',
          }}>
          {/* Solid dot */}
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: '#1D9E75' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE' }}>Fitted</span>
          <span style={{ fontSize: 10, color: '#6A6860' }}>I have this installed</span>
        </button>
      </div>

      {/* Conditional expansion */}
      <div style={{ margin: '0 20px 4px' }}>
        {itemState === 'fitted' ? (
          /* Purchase details card */
          <div style={{
            backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 13,
          }}>
            {[
              { label: 'Bought at', value: boughtAt, onChange: setBoughtAt, placeholder: 'e.g. Wunderlich', type: 'text' },
              { label: 'Price paid', value: pricePaid, onChange: setPricePaid, placeholder: '$0.00', type: 'text' },
              { label: 'Date', value: datePurchased, onChange: setDatePurchased, placeholder: '', type: 'date' },
            ].map(({ label, value, onChange, placeholder, type }, i) => (
              <div key={label} style={{ marginBottom: i < 2 ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: '#6A6860' }}>{label}</span>
                  <span style={{ fontSize: 9, color: '#44423E' }}>optional</span>
                </div>
                <input
                  type={type}
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Info note */
          <div style={{
            backgroundColor: 'rgba(232,132,26,0.06)',
            border: '1px solid rgba(232,132,26,0.24)',
            borderRadius: 12, padding: 13,
          }}>
            <p style={{ fontSize: 11, color: '#E8841A', margin: 0, lineHeight: 1.5 }}>
              This will be saved to your wish list. You can mark it as bought once you&apos;ve purchased it.
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '16px 20px 32px' }}>
        <button type="button" onClick={onConfirm}
          style={{
            width: '100%',
            backgroundColor: '#E8841A', color: '#0D0D0D',
            border: 'none', borderRadius: 8,
            padding: '13px 20px',
            fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
            fontWeight: 900, fontSize: 13,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            cursor: 'pointer',
          }}>
          {itemState === 'wishlist' ? 'Add to wish list' : 'Mark as fitted'}
        </button>
      </div>
    </>
  )
}

// ── Step 3 ────────────────────────────────────────────────────────────────────

function Step3Confirmation({
  product, itemState,
  onViewBuild, onAddAnother, onClose,
}: {
  product: Product
  itemState: ItemState
  onViewBuild: () => void
  onAddAnother: () => void
  onClose: () => void
}) {
  const isFitted = itemState === 'fitted'

  return (
    <>
      {/* Header — close only */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' }}>
        <CloseBtn onClose={onClose} />
      </div>

      {/* Centred content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 20px 40px', gap: 16 }}>
        <CheckCircle />

        <p style={{
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 18, textTransform: 'uppercase',
          letterSpacing: '0.04em', color: '#F5F3EE', margin: 0,
        }}>
          Added to your garage
        </p>

        {/* Item preview card */}
        <div style={{
          width: '100%', display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
          backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: 13,
        }}>
          <div style={{ width: 44, height: 44, backgroundColor: '#1A1814', borderRadius: 8, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
            {product.image && (
              <img src={product.image} alt={product.name}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', margin: 0, lineHeight: 1.3 }}>{product.name}</p>
            <p style={{ fontSize: 10, color: '#6A6860', margin: '2px 0 6px' }}>{product.brand}</p>
            {/* State badge */}
            <span style={{
              display: 'inline-block',
              fontSize: 9, fontWeight: 500,
              padding: '2px 8px', borderRadius: 20,
              backgroundColor: isFitted ? 'rgba(29,158,117,0.12)' : 'rgba(136,135,128,0.1)',
              color: isFitted ? '#1D9E75' : '#888780',
            }}>
              {isFitted ? 'Fitted' : 'Wish list'}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <button type="button" onClick={onViewBuild}
            style={{
              width: '100%', backgroundColor: '#E8841A', color: '#0D0D0D',
              border: 'none', borderRadius: 8, padding: '13px 20px',
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: 13,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer',
            }}>
            View my build
          </button>
          <button type="button" onClick={onAddAnother}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F5F3EE',
              borderRadius: 8, padding: '13px 20px',
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: 13,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer',
            }}>
            Add another accessory
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function AddAccessoryModal({ bikeName, bikeId, onClose, onViewBuild }: AddAccessoryModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [itemState, setItemState] = useState<ItemState>('wishlist')
  const [boughtAt, setBoughtAt] = useState('')
  const [pricePaid, setPricePaid] = useState('')
  const [datePurchased, setDatePurchased] = useState('')

  function handleSelectProduct(p: Product) {
    setSelectedProduct(p)
    setStep(2)
  }

  function handleConfirm() {
    setStep(3)
  }

  function handleAddAnother() {
    setSelectedProduct(null)
    setItemState('wishlist')
    setBoughtAt('')
    setPricePaid('')
    setDatePurchased('')
    setStep(1)
  }

  function handleViewBuild() {
    onViewBuild()
    onClose()
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      {/* Sheet — stops propagation so clicks inside don't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 430,
          maxHeight: '90vh', overflowY: 'auto',
          backgroundColor: '#0D0D0D',
          borderRadius: '20px 20px 0 0',
          scrollbarWidth: 'none',
        }}
      >
        {step === 1 && (
          <Step1Search
            bikeName={bikeName}
            bikeId={bikeId}
            onSelect={handleSelectProduct}
            onClose={onClose}
          />
        )}

        {step === 2 && selectedProduct && (
          <Step2Details
            product={selectedProduct}
            itemState={itemState}
            setItemState={setItemState}
            boughtAt={boughtAt}
            setBoughtAt={setBoughtAt}
            pricePaid={pricePaid}
            setPricePaid={setPricePaid}
            datePurchased={datePurchased}
            setDatePurchased={setDatePurchased}
            onBack={() => setStep(1)}
            onClose={onClose}
            onConfirm={handleConfirm}
          />
        )}

        {step === 3 && selectedProduct && (
          <Step3Confirmation
            product={selectedProduct}
            itemState={itemState}
            onViewBuild={handleViewBuild}
            onAddAnother={handleAddAnother}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}
