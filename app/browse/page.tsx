'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { loadGarageFromSupabase } from '@/lib/garage/persistence'
import { demoGarageProducts } from '@/lib/demo-content/products'
import { demoGarageBikes } from '@/lib/demo-content/bikes'
import { garageCategories } from '@/types/garage'
import type { Product } from '@/types/garage'

// ── Constants ─────────────────────────────────────────────────────────────────

const SESSION_KEY = 'browse_bike'

const CATEGORY_ACCENT: Record<string, string> = {
  luggage:                   '#E8841A',
  protection:                '#7F77DD',
  navigation:                '#1D9E75',
  tyres:                     '#BA7517',
  lighting:                  '#639922',
  comfort:                   '#1456B0',
  ergonomics:                '#1456B0',
  electrical:                '#7F77DD',
  'connectivity-navigation': '#1D9E75',
  'safety-visibility':       '#639922',
  'rider-tech-recording':    '#7F77DD',
  'power-support':           '#BA7517',
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SelectedBike = {
  id: string
  make: string
  model: string
  variant: string | null
  year: number
}

type ApiMake  = { id: string; name: string; slug: string }
type ApiModel = { id: string; name: string; slug: string; category: string }

// ── Utilities ─────────────────────────────────────────────────────────────────

function demoPrice(productId: number): number {
  return 140 + ((productId * 7) % 180)
}

function bikeDisplayName(bike: SelectedBike): string {
  return [bike.year, bike.make, bike.model, bike.variant].filter(Boolean).join(' ')
}

function getCategoryAccent(categoryId: string): string {
  return CATEGORY_ACCENT[categoryId] ?? '#E8841A'
}

function getCategoryLabel(categoryId: string): string {
  return garageCategories.find(c => c.id === categoryId)?.label ?? categoryId
}

// ── FitBadge ──────────────────────────────────────────────────────────────────

function FitBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(29,158,117,0.08)',
      borderRadius: 20, padding: '2px 7px',
      width: 'fit-content',
    }}>
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5.5" stroke="#1D9E75" strokeWidth="1" />
        <polyline points="3,6 5,8.5 9,4" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 9, fontWeight: 500, color: '#1D9E75' }}>Guaranteed fit</span>
    </span>
  )
}

// ── ProductCard ───────────────────────────────────────────────────────────────

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const price   = demoPrice(product.id)
  const accent  = getCategoryAccent(product.categoryId)
  const catLabel = getCategoryLabel(product.categoryId)

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column',
        backgroundColor: '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, overflow: 'hidden',
        textAlign: 'left', cursor: 'pointer',
        padding: 0, width: '100%',
      }}
    >
      {/* Photo area */}
      <div style={{ position: 'relative', width: '100%', height: 90, backgroundColor: '#1A1814', flexShrink: 0 }}>
        {product.image && (
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}

        {/* Category badge — top left */}
        <span style={{
          position: 'absolute', top: 7, left: 7,
          backgroundColor: `rgba(${hexToRgb(accent)},0.12)`,
          border: `1px solid rgba(${hexToRgb(accent)},0.28)`,
          color: accent,
          borderRadius: 20, padding: '2px 7px',
          fontSize: 9, fontWeight: 500, lineHeight: 1.4,
        }}>
          {catLabel}
        </span>

        {/* Bookmark icon — top right */}
        <span style={{ position: 'absolute', top: 7, right: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '9px 10px 11px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p style={{
          margin: 0, fontSize: 12, fontWeight: 600, color: '#F5F3EE', lineHeight: 1.3,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {product.name}
        </p>
        <p style={{ margin: 0, fontSize: 10, color: '#6A6860' }}>{product.brand}</p>
        <p style={{ margin: '2px 0', fontSize: 11, fontWeight: 500, color: '#F5F3EE' }}>
          From ${price}
        </p>
        <FitBadge />
      </div>
    </button>
  )
}

// hex → "r,g,b" for rgba() usage in badges
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

// ── DropdownChevron ───────────────────────────────────────────────────────────

function DropdownChevron({ disabled = false }: { disabled?: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke={disabled ? '#3A3830' : '#6A6860'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ── Shared select style ───────────────────────────────────────────────────────

const selectStyle = (enabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '10px 36px 10px 12px',
  backgroundColor: '#141414',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: enabled ? '#F5F3EE' : '#3A3830',
  fontSize: 13,
  fontWeight: 500,
  outline: 'none',
  cursor: enabled ? 'pointer' : 'not-allowed',
  appearance: 'none',
  opacity: enabled ? 1 : 0.5,
})

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BrowsePage() {
  const router = useRouter()

  // Bike context
  const [selectedBike,   setSelectedBike]   = useState<SelectedBike | null>(null)
  const [showingSelector, setShowingSelector] = useState(false)
  const [initialising,   setInitialising]   = useState(true)

  // Dropdown data
  const [makes,  setMakes]  = useState<ApiMake[]>([])
  const [models, setModels] = useState<ApiModel[]>([])
  const [years,  setYears]  = useState<number[]>([])

  // Dropdown selections
  const [selectedMakeId,    setSelectedMakeId]    = useState('')
  const [selectedModelId,   setSelectedModelId]   = useState('')
  const [selectedYear,      setSelectedYear]      = useState('')
  const [selectedVariant,   setSelectedVariant]   = useState('')
  const [selectedMakeName,  setSelectedMakeName]  = useState('')
  const [selectedModelName, setSelectedModelName] = useState('')

  // Loading states
  const [loadingModels,   setLoadingModels]   = useState(false)
  const [loadingYears,    setLoadingYears]    = useState(false)
  const [loadingVariants, setLoadingVariants] = useState(false)

  // Variant options (only shown when > 1 distinct variant exists)
  const [variants, setVariants] = useState<string[]>([])

  // Filters
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery,    setSearchQuery]    = useState('')

  // ── Initialise: sessionStorage → auth → show selector ──────────────────────

  useEffect(() => {
    async function init() {
      // 1. Restore from sessionStorage
      try {
        const raw = sessionStorage.getItem(SESSION_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as SelectedBike
          if (parsed?.id && parsed?.make && parsed?.model && parsed?.year) {
            setSelectedBike(parsed)
            setInitialising(false)
            return
          }
        }
      } catch { /* ignore */ }

      // 2. Load from logged-in garage
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const snapshot = await loadGarageFromSupabase(demoGarageBikes)
          const firstBike = snapshot?.bikes?.[0]
          if (firstBike) {
            const bike: SelectedBike = {
              id: firstBike.id,
              make: firstBike.make,
              model: firstBike.model,
              variant: firstBike.variant ?? null,
              year: firstBike.year,
            }
            setSelectedBike(bike)
            try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(bike)) } catch { /* ignore */ }
            setInitialising(false)
            return
          }
        }
      } catch { /* ignore */ }

      // 3. Fall through to selector
      setShowingSelector(true)
      setInitialising(false)
    }

    init()
  }, [])

  // ── Fetch makes eagerly (ready before selector appears) ────────────────────

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/bikes/options', { signal: controller.signal })
      .then(r => r.json())
      .then(d => setMakes(d.makes ?? []))
      .catch(() => { /* ignore */ })
    return () => controller.abort()
  }, [])

  // ── Cascade: fetch models when make changes ─────────────────────────────────

  useEffect(() => {
    if (!selectedMakeId) {
      setModels([])
      setSelectedModelId('')
      setSelectedModelName('')
      setYears([])
      setSelectedYear('')
      return
    }
    const controller = new AbortController()
    setLoadingModels(true)
    setSelectedModelId('')
    setSelectedModelName('')
    setYears([])
    setSelectedYear('')
    fetch(`/api/bikes/options?make=${encodeURIComponent(selectedMakeId)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { setModels(d.models ?? []); setLoadingModels(false) })
      .catch(err => { if (err.name !== 'AbortError') setLoadingModels(false) })
    return () => controller.abort()
  }, [selectedMakeId])

  // ── Cascade: fetch variants when model changes ──────────────────────────────

  useEffect(() => {
    if (!selectedModelId) {
      setVariants([])
      setSelectedVariant('')
      setYears([])
      setSelectedYear('')
      setLoadingVariants(false)
      return
    }
    const controller = new AbortController()
    setLoadingVariants(true)
    setSelectedVariant('')
    setVariants([])
    setYears([])
    setSelectedYear('')
    fetch(`/api/bikes/options?make=${encodeURIComponent(selectedMakeId)}&model=${encodeURIComponent(selectedModelId)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        setVariants(d.variants ?? [])
        setLoadingVariants(false)
      })
      .catch(err => { if (err.name !== 'AbortError') setLoadingVariants(false) })
    return () => controller.abort()
  }, [selectedModelId, selectedMakeId])

  // ── Cascade: fetch years when variant is ready ───────────────────────────────

  useEffect(() => {
    const needsVar = variants.length > 1
    const variantReady = !needsVar || !!selectedVariant

    if (!selectedModelId || loadingVariants || !variantReady) {
      setYears([])
      setSelectedYear('')
      return
    }

    const controller = new AbortController()
    const variantParam = needsVar ? selectedVariant : ''
    setLoadingYears(true)
    setSelectedYear('')
    fetch(`/api/bikes/options?make=${encodeURIComponent(selectedMakeId)}&model=${encodeURIComponent(selectedModelId)}&variant=${encodeURIComponent(variantParam)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { setYears(d.years ?? []); setLoadingYears(false) })
      .catch(err => { if (err.name !== 'AbortError') setLoadingYears(false) })
    return () => controller.abort()
  }, [selectedVariant, variants, selectedModelId, selectedMakeId, loadingVariants])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFindAccessories = useCallback(() => {
    if (!selectedMakeId || !selectedModelId || !selectedYear) return
    if (variants.length > 1 && !selectedVariant) return
    const variant = variants.length > 1 ? selectedVariant : (variants[0] ?? null)
    const bike: SelectedBike = {
      id: `${selectedModelId}-${selectedYear}${variant ? `-${variant}` : ''}`,
      make: selectedMakeName,
      model: selectedModelName,
      variant: variant || null,
      year: parseInt(selectedYear, 10),
    }
    setSelectedBike(bike)
    setShowingSelector(false)
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(bike)) } catch { /* ignore */ }
  }, [selectedMakeId, selectedModelId, selectedYear, selectedVariant, selectedMakeName, selectedModelName, variants])

  const handleChange = useCallback(() => {
    setSelectedBike(null)
    setShowingSelector(true)
    setSelectedMakeId('')
    setSelectedModelId('')
    setSelectedVariant('')
    setVariants([])
    setYears([])
    setSelectedYear('')
    setLoadingVariants(false)
    setLoadingYears(false)
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  }, [])

  // ── Derived data ────────────────────────────────────────────────────────────

  const categoryPills = useMemo(() => {
    const seen = new Set<string>()
    const result: Array<{ id: string; label: string }> = [{ id: 'all', label: 'All' }]
    for (const p of demoGarageProducts) {
      if (!seen.has(p.categoryId)) {
        seen.add(p.categoryId)
        result.push({ id: p.categoryId, label: getCategoryLabel(p.categoryId) })
      }
    }
    return result
  }, [])

  const filteredProducts = useMemo(() => {
    let list = demoGarageProducts
    if (activeCategory !== 'all') {
      list = list.filter(p => p.categoryId === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, searchQuery])

  const needsVariant = variants.length > 1
  const canActivate = !!selectedMakeId && !!selectedModelId && !!selectedYear && (!needsVariant || !!selectedVariant)
  const bikeNameForPlaceholder = selectedBike ? bikeDisplayName(selectedBike) : 'your bike'
  const hasFilter = searchQuery.trim() !== '' || activeCategory !== 'all'

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (initialising) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12, minHeight: '50vh',
      }}>
        <style>{`@keyframes bp { 0%,100%{opacity:1} 50%{opacity:0.25} }`}</style>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          backgroundColor: '#E8841A',
          animation: 'bp 1.5s ease-in-out infinite',
        }} />
        <span style={{ fontSize: 13, color: '#6A6860' }}>Loading…</span>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 20px 0' }}>

        {/* ── A: Bike selector ─────────────────────────────────────────── */}
        {selectedBike && !showingSelector ? (

          /* Compact card */
          <div style={{
            backgroundColor: '#141414',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '11px 13px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                margin: 0, fontSize: 13, fontWeight: 600, color: '#F5F3EE',
                lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {bikeDisplayName(selectedBike)}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 10, color: '#6A6860' }}>
                Guaranteed fit · {demoGarageProducts.length} accessories
              </p>
            </div>
            <button
              onClick={handleChange}
              style={{
                flexShrink: 0, background: 'none', border: 'none', padding: 0,
                fontSize: 11, fontWeight: 500, color: '#E8841A', cursor: 'pointer',
              }}
            >
              Change
            </button>
          </div>

        ) : (

          /* Cascading dropdown selector */
          <div style={{
            backgroundColor: '#141414',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 13,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <p style={{
              margin: 0,
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: 12, color: '#F5F3EE',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Select your bike
            </p>

            {/* Make */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedMakeId}
                onChange={e => {
                  const opt = e.target.options[e.target.selectedIndex]
                  setSelectedMakeId(e.target.value)
                  setSelectedMakeName(opt.text)
                }}
                style={selectStyle(true)}
              >
                <option value="">Make</option>
                {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <DropdownChevron />
            </div>

            {/* Model */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedModelId}
                disabled={!selectedMakeId || loadingModels}
                onChange={e => {
                  const opt = e.target.options[e.target.selectedIndex]
                  setSelectedModelId(e.target.value)
                  setSelectedModelName(opt.text)
                }}
                style={selectStyle(!!selectedMakeId && !loadingModels)}
              >
                <option value="">{loadingModels ? 'Loading…' : 'Model'}</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <DropdownChevron disabled={!selectedMakeId || loadingModels} />
            </div>

            {/* Series / Variant — only shown when multiple variants exist */}
            {selectedModelId && !loadingVariants && needsVariant && (
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedVariant}
                  onChange={e => setSelectedVariant(e.target.value)}
                  style={selectStyle(true)}
                >
                  <option value="">Series / Variant</option>
                  {variants.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <DropdownChevron />
              </div>
            )}

            {/* Year */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedYear}
                disabled={!selectedModelId || loadingYears || (needsVariant && !selectedVariant)}
                onChange={e => setSelectedYear(e.target.value)}
                style={selectStyle(!!selectedModelId && !loadingYears && (!needsVariant || !!selectedVariant))}
              >
                <option value="">{loadingYears ? 'Loading…' : 'Year'}</option>
                {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
              <DropdownChevron disabled={!selectedModelId || loadingYears || (needsVariant && !selectedVariant)} />
            </div>

            {/* CTA */}
            <button
              onClick={handleFindAccessories}
              disabled={!canActivate}
              style={{
                backgroundColor: canActivate ? '#E8841A' : 'rgba(232,132,26,0.25)',
                color: canActivate ? '#0D0D0D' : 'rgba(255,255,255,0.25)',
                border: 'none', borderRadius: 8, padding: '12px 20px',
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                fontWeight: 900, fontSize: 12,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                cursor: canActivate ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.15s',
              }}
            >
              Find accessories →
            </button>
          </div>
        )}

        {selectedBike && (<>

        {/* ── B: Search bar ────────────────────────────────────────────── */}
        <div style={{ position: 'relative' }}>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search accessories for ${bikeNameForPlaceholder}...`}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px 10px 34px',
              backgroundColor: '#141414',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: '#F5F3EE', fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        {/* ── C: Category pills ────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          {categoryPills.map(({ id, label }) => {
            const isActive = activeCategory === id
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                style={{
                  flexShrink: 0, borderRadius: 20, padding: '6px 13px',
                  fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
                  border: isActive
                    ? '1px solid rgba(232,132,26,0.22)'
                    : '1px solid rgba(255,255,255,0.07)',
                  backgroundColor: isActive ? 'rgba(232,132,26,0.1)' : '#141414',
                  color: isActive ? '#E8841A' : '#B8AFA6',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* ── D+E: Results + grid — only when search or category is active ── */}
        {hasFilter && (<>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#6A6860' }}>
            {filteredProducts.length} accessories · all guaranteed fit
          </span>
          <button style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: 11, fontWeight: 500, color: '#E8841A', cursor: 'pointer',
          }}>
            Sort &amp; filter
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{
            padding: '40px 0', textAlign: 'center',
            color: '#6A6860', fontSize: 13,
          }}>
            No accessories match your search.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => router.push(`/shop/${product.id}`)}
              />
            ))}
          </div>
        )}

        </>)}

        </>)}

      </div>
    </main>
  )
}
