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

type GarageBike = SelectedBike & { nickname: string | null }

type ApiMake  = { id: string; name: string; slug: string }
type ApiModel = { id: string; name: string; slug: string; category: string }
type SortMode = 'default' | 'price-asc' | 'price-desc' | 'brand-az' | 'brand-za'

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

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

// ── FitBadge ──────────────────────────────────────────────────────────────────

function FitBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(29,158,117,0.08)',
      borderRadius: 20, padding: '2px 7px', width: 'fit-content',
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

function ProductCard({
  product,
  onDetails,
  onShop,
}: {
  product: Product
  onDetails: () => void
  onShop: () => void
}) {
  const price    = demoPrice(product.id)
  const accent   = getCategoryAccent(product.categoryId)
  const catLabel = getCategoryLabel(product.categoryId)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      backgroundColor: '#141414',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      {/* Photo area */}
      <div style={{ position: 'relative', width: '100%', height: 90, backgroundColor: '#1A1814', flexShrink: 0 }}>
        {product.image && (
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
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
        <span style={{ position: 'absolute', top: 7, right: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '9px 10px 10px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        <p style={{
          margin: 0, fontSize: 12, fontWeight: 600, color: '#F5F3EE', lineHeight: 1.3,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {product.name}
        </p>
        <p style={{ margin: 0, fontSize: 10, color: '#6A6860' }}>{product.brand}</p>
        <p style={{ margin: '2px 0 4px', fontSize: 11, fontWeight: 500, color: '#F5F3EE' }}>
          From ${price}
        </p>
        <FitBadge />

        {/* Action row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button
            onClick={onDetails}
            style={{
              flex: 1, padding: '7px 0',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 7, color: '#F5F3EE',
              fontSize: 10, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Details
          </button>
          <button
            onClick={onShop}
            style={{
              flex: 1, padding: '7px 0',
              backgroundColor: '#E8841A',
              border: 'none',
              borderRadius: 7, color: '#0D0D0D',
              fontSize: 10, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}
          >
            Shop
          </button>
        </div>
      </div>
    </div>
  )
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
  const [selectedBike,    setSelectedBike]    = useState<SelectedBike | null>(null)
  const [showingSelector, setShowingSelector] = useState(false)
  const [initialising,    setInitialising]    = useState(true)

  // Garage bikes (logged-in users)
  const [garageBikes, setGarageBikes] = useState<GarageBike[]>([])

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
  const [activeCategory, setActiveCategory] = useState('')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [sortMode,       setSortMode]       = useState<SortMode>('default')

  // ── Initialise: sessionStorage → auth → show selector ──────────────────────

  useEffect(() => {
    async function init() {
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

      setShowingSelector(true)
      setInitialising(false)
    }

    init()
  }, [])

  // ── Load garage bikes in parallel (non-blocking) ───────────────────────────

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session || cancelled) return
        const snapshot = await loadGarageFromSupabase(demoGarageBikes)
        if (cancelled) return
        setGarageBikes(
          (snapshot?.bikes ?? []).map(b => ({
            id: b.id,
            make: b.make,
            model: b.model,
            variant: b.variant ?? null,
            year: b.year,
            nickname: b.nickname ?? null,
          }))
        )
      } catch { /* ignore */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ── Fetch makes eagerly ────────────────────────────────────────────────────

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/bikes/options', { signal: controller.signal })
      .then(r => r.json())
      .then(d => setMakes(d.makes ?? []))
      .catch(() => { /* ignore */ })
    return () => controller.abort()
  }, [])

  // ── Cascade: fetch models when make changes ────────────────────────────────

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

  // ── Cascade: fetch variants when model changes ─────────────────────────────

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

  // ── Cascade: fetch years when variant is ready ─────────────────────────────

  useEffect(() => {
    const needsVar    = variants.length > 1
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
    fetch(
      `/api/bikes/options?make=${encodeURIComponent(selectedMakeId)}&model=${encodeURIComponent(selectedModelId)}&variant=${encodeURIComponent(variantParam)}`,
      { signal: controller.signal }
    )
      .then(r => r.json())
      .then(d => { setYears(d.years ?? []); setLoadingYears(false) })
      .catch(err => { if (err.name !== 'AbortError') setLoadingYears(false) })
    return () => controller.abort()
  }, [selectedVariant, variants, selectedModelId, selectedMakeId, loadingVariants])

  // ── Handlers ───────────────────────────────────────────────────────────────

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

  const handleGarageBikeSelect = useCallback((bikeId: string) => {
    const bike = garageBikes.find(b => b.id === bikeId)
    if (!bike) return
    const { nickname: _n, ...rest } = bike
    void _n
    setSelectedBike(rest)
    setShowingSelector(false)
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(rest)) } catch { /* ignore */ }
  }, [garageBikes])

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

  // ── Derived data ───────────────────────────────────────────────────────────

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>()
    const result: Array<{ id: string; label: string }> = []
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
    if (activeCategory) {
      list = list.filter(p => p.categoryId === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      )
    }
    if (sortMode === 'price-asc')  list = [...list].sort((a, b) => demoPrice(a.id) - demoPrice(b.id))
    if (sortMode === 'price-desc') list = [...list].sort((a, b) => demoPrice(b.id) - demoPrice(a.id))
    if (sortMode === 'brand-az')   list = [...list].sort((a, b) => a.brand.localeCompare(b.brand))
    if (sortMode === 'brand-za')   list = [...list].sort((a, b) => b.brand.localeCompare(a.brand))
    return list
  }, [activeCategory, searchQuery, sortMode])

  const needsVariant = variants.length > 1
  const canActivate  = !!selectedMakeId && !!selectedModelId && !!selectedYear && (!needsVariant || !!selectedVariant)
  const bikeNameForPlaceholder = selectedBike ? bikeDisplayName(selectedBike) : 'your bike'
  const hasFilter = searchQuery.trim() !== '' || activeCategory !== ''

  // ── Loading state ──────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 20px 0' }}>

        {/* ── A: Bike selector / context banner ────────────────────────── */}
        {selectedBike && !showingSelector ? (

          /* Compact bike context card */
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

          /* Cascading selector panel */
          <div style={{
            backgroundColor: '#141414',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 13,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {/* Title */}
            <div style={{ marginBottom: 2 }}>
              <p style={{
                margin: 0,
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                fontWeight: 900, fontSize: 13, color: '#F5F3EE',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Choose your bike
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6A6860' }}>
                Get guaranteed-fit accessories
              </p>
            </div>

            {/* Garage bikes quick-select (logged-in users with existing bikes) */}
            {garageBikes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#44423E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  From your garage
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {garageBikes.map(b => (
                    <button
                      key={b.id}
                      onClick={() => handleGarageBikeSelect(b.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 12px',
                        backgroundColor: '#1A1814',
                        border: '1px solid rgba(232,132,26,0.18)',
                        borderRadius: 8,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE' }}>
                        {b.nickname ?? bikeDisplayName(b)}
                      </span>
                      <span style={{ fontSize: 10, color: '#E8841A', fontWeight: 500 }}>Select →</span>
                    </button>
                  ))}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 10, color: '#44423E', fontWeight: 500 }}>
                  Or search manually
                </p>
              </div>
            )}

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

            {/* Variant — only shown when multiple variants exist */}
            {selectedModelId && !loadingVariants && needsVariant && (
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedVariant}
                  onChange={e => setSelectedVariant(e.target.value)}
                  style={selectStyle(true)}
                >
                  <option value="">Variant</option>
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

        {selectedBike && (
          <>
            {/* ── B: Search bar ─────────────────────────────────────────── */}
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

            {/* ── C: Controls row (category + sort dropdowns) ────────────── */}
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Category dropdown */}
              <div style={{ position: 'relative', flex: 1 }}>
                <select
                  value={activeCategory}
                  onChange={e => setActiveCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 32px 8px 12px',
                    backgroundColor: activeCategory ? 'rgba(232,132,26,0.1)' : '#141414',
                    border: activeCategory
                      ? '1px solid rgba(232,132,26,0.22)'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20,
                    color: activeCategory ? '#E8841A' : '#B8AFA6',
                    fontSize: 11, fontWeight: 500,
                    outline: 'none', cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  <option value="">All categories</option>
                  {categoryOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke={activeCategory ? '#E8841A' : '#6A6860'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Sort dropdown */}
              <div style={{ position: 'relative', flex: 1 }}>
                <select
                  value={sortMode}
                  onChange={e => setSortMode(e.target.value as SortMode)}
                  style={{
                    width: '100%',
                    padding: '8px 32px 8px 12px',
                    backgroundColor: sortMode !== 'default' ? 'rgba(232,132,26,0.1)' : '#141414',
                    border: sortMode !== 'default'
                      ? '1px solid rgba(232,132,26,0.22)'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20,
                    color: sortMode !== 'default' ? '#E8841A' : '#B8AFA6',
                    fontSize: 11, fontWeight: 500,
                    outline: 'none', cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  <option value="default">Sort</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="brand-az">Brand: A–Z</option>
                  <option value="brand-za">Brand: Z–A</option>
                </select>
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke={sortMode !== 'default' ? '#E8841A' : '#6A6860'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* ── D: Empty state (no filter active) ─────────────────────── */}
            {!hasFilter && (
              <div style={{
                backgroundColor: '#141414',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '16px 14px',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div>
                  <p style={{
                    margin: 0,
                    fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                    fontWeight: 900, fontSize: 12, color: '#F5F3EE',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    Browse by category
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6A6860' }}>
                    All accessories guaranteed to fit your bike
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {categoryOptions.map(({ id, label }) => {
                    const accent = getCategoryAccent(id)
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveCategory(id)}
                        style={{
                          borderRadius: 20, padding: '6px 13px',
                          fontSize: 11, fontWeight: 500, cursor: 'pointer',
                          backgroundColor: `rgba(${hexToRgb(accent)},0.08)`,
                          border: `1px solid rgba(${hexToRgb(accent)},0.22)`,
                          color: accent,
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                <p style={{ margin: 0, fontSize: 11, color: '#44423E', textAlign: 'center' }}>
                  Or search above to find a specific accessory
                </p>
              </div>
            )}

            {/* ── E: Results header + grid ───────────────────────────────── */}
            {hasFilter && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#6A6860' }}>
                    {filteredProducts.length} accessories · all guaranteed fit
                  </span>
                  {(activeCategory || sortMode !== 'default') && (
                    <button
                      onClick={() => { setActiveCategory(''); setSortMode('default') }}
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        fontSize: 11, fontWeight: 500, color: '#6A6860', cursor: 'pointer',
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#6A6860', fontSize: 13 }}>
                    No accessories match your search.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {filteredProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onDetails={() => router.push(`/shop/${product.id}?from=browse`)}
                        onShop={() => router.push(`/shop?productId=${product.id}`)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </main>
  )
}
