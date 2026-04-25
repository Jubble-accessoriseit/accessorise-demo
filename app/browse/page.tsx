'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { loadGarageFromSupabase } from '@/lib/garage/persistence'
import { demoGarageBikes } from '@/lib/demo-content/bikes'
import { demoGarageProducts } from '@/lib/demo-content/products'
import { garageCategories } from '@/types/garage'
import type { Product } from '@/types/garage'

const BROWSE_BIKE_KEY = 'browse_bike_selection_v2'
const BROWSE_RETURN_KEY = 'browse_return_context_v1'

const CATEGORY_ACCENT: Record<string, string> = {
  luggage: '#E8841A',
  protection: '#7F77DD',
  navigation: '#1D9E75',
  lighting: '#639922',
  electrical: '#7F77DD',
  'safety-visibility': '#639922',
  'connectivity-navigation': '#1D9E75',
  'rider-tech-recording': '#7F77DD',
  'power-support': '#BA7517',
  ergonomics: '#1456B0',
  tyres: '#BA7517',
}

type SelectedBike = {
  id: string
  make: string
  model: string
  variant: string | null
  year: number
  source: 'manual' | 'garage'
}

type PersistedBrowseBike = SelectedBike & { userSelected: true }
type BrowseReturnContext = {
  selectedBike: PersistedBrowseBike
  searchQuery: string
  activeCategory: string
  sortMode: SortMode
}
type GarageBike = SelectedBike & { nickname: string | null }
type ApiMake = { id: string; name: string; slug: string }
type ApiModel = { id: string; name: string; slug: string; category: string }
type SortMode = 'default' | 'price-asc' | 'price-desc' | 'brand-az' | 'brand-za'

const quickCategories = [
  { id: 'luggage', label: 'Luggage' },
  { id: 'protection', label: 'Protection' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'safety-visibility', label: 'Safety & Visibility' },
  { id: 'electrical', label: 'Electrical' },
]

function demoPrice(productId: number): number {
  return 140 + ((productId * 7) % 180)
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function getCategoryAccent(categoryId: string): string {
  return CATEGORY_ACCENT[categoryId] ?? '#E8841A'
}

function getCategoryLabel(categoryId: string): string {
  return garageCategories.find(c => c.id === categoryId)?.label ?? categoryId
}

function bikeDisplayName(bike: Pick<SelectedBike, 'make' | 'model' | 'variant' | 'year'>): string {
  return [bike.make, bike.model, bike.variant, bike.year].filter(Boolean).join(' ')
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function buildBikeId(make: string, model: string, variant: string | null, year: number): string {
  const normalizedMake = slugify(make)
  const compactModel = model.replace(/\s+/g, '')
  const variantPart = variant && variant !== 'Base' ? `-${slugify(variant)}` : ''
  return `${normalizedMake}-${slugify(compactModel)}${variantPart}-${year}`
}

function normalizeBikeSignature(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function isProductCompatible(product: Product, bike: SelectedBike): boolean {
  if (product.compatibility.universal) return true
  if (product.compatibility.bikeIds.includes(bike.id)) return true

  const bikeModel = normalizeBikeSignature(bike.model)
  const bikeMake = normalizeBikeSignature(bike.make)
  if (bikeMake === 'bmw' && bikeModel.includes('r1300gs')) {
    return product.compatibility.bikeIds.some(id => id.includes('bmw-r1300gs') || id.includes('bmw-r1300gsa'))
  }
  if (bikeMake === 'yamaha' && bikeModel.includes('tenere700')) {
    return product.compatibility.bikeIds.some(id => id.includes('yamaha-tenere-700'))
  }
  return false
}

function FitBadge({ label = 'Guaranteed fit' }: { label?: string }) {
  return (
    <span className="fit-badge">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="5.5" stroke="#1D9E75" strokeWidth="1" />
        <polyline points="3,6 5,8.5 9,4" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  )
}

function SelectField({
  label,
  value,
  disabled,
  children,
  onChange,
}: {
  label: string
  value: string
  disabled?: boolean
  children: ReactNode
  onChange: (value: string) => void
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  )
}

function ProductCard({ product, onDetails, onShop }: { product: Product; onDetails: () => void; onShop: () => void }) {
  const accent = getCategoryAccent(product.categoryId)
  const price = product.price > 0 ? product.price : demoPrice(product.id)

  return (
    <article className="product-card">
      <div className="product-image">
        {product.image ? <img src={product.image} alt={product.name} /> : null}
        <span className="category-pill" style={{ '--accent': accent, '--accent-rgb': hexToRgb(accent) } as CSSProperties}>
          {getCategoryLabel(product.categoryId)}
        </span>
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <p>{product.brand || 'Supplier to be confirmed'}</p>
        <strong>{price > 0 ? `$${price}` : '$Unknown'}</strong>
        <FitBadge label={product.fitmentConfidence ?? 'Guaranteed fit'} />
        <div className="product-actions">
          <button type="button" className="secondary-action" onClick={onDetails}>View details</button>
          <button type="button" className="primary-action" onClick={onShop}>Shop</button>
        </div>
      </div>
    </article>
  )
}

export default function BrowsePage() {
  const router = useRouter()

  const [initialising, setInitialising] = useState(true)
  const [selectedBike, setSelectedBike] = useState<SelectedBike | null>(null)
  const [garageBikes, setGarageBikes] = useState<GarageBike[]>([])

  const [makes, setMakes] = useState<ApiMake[]>([])
  const [models, setModels] = useState<ApiModel[]>([])
  const [variants, setVariants] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])

  const [selectedMakeId, setSelectedMakeId] = useState('')
  const [selectedMakeName, setSelectedMakeName] = useState('')
  const [selectedModelId, setSelectedModelId] = useState('')
  const [selectedModelName, setSelectedModelName] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [loadingYears, setLoadingYears] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('default')

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const params = new URLSearchParams(window.location.search)
        if (params.get('restoreBrowse') === '1') {
          const raw = sessionStorage.getItem(BROWSE_RETURN_KEY)
          const context = raw ? JSON.parse(raw) as BrowseReturnContext : null
          const bike = context?.selectedBike

          if (bike?.userSelected && bike.id && bike.make && bike.model && bike.year && !cancelled) {
            setSelectedBike(bike)
            setSelectedMakeId(bike.make)
            setSelectedMakeName(bike.make)
            setSelectedModelId(bike.model)
            setSelectedModelName(bike.model)
            setSelectedVariant(bike.variant ?? '')
            setSelectedYear(String(bike.year))
            setSearchQuery(context?.searchQuery ?? '')
            setActiveCategory(context?.activeCategory ?? '')
            setSortMode(context?.sortMode ?? 'default')
            router.replace('/browse', { scroll: false })
          }
        }
      } catch { /* ignore invalid return context */ }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && !cancelled) {
          const snapshot = await loadGarageFromSupabase(demoGarageBikes)
          if (!cancelled) {
            setGarageBikes(
              (snapshot?.bikes ?? []).map(bike => ({
                id: bike.sourceBikeId ?? bike.id,
                make: bike.make,
                model: bike.model,
                variant: bike.variant ?? null,
                year: bike.year,
                nickname: bike.nickname ?? bike.garageBikeName ?? null,
                source: 'garage',
              }))
            )
          }
        }
      } catch { /* signed-out or garage unavailable */ }

      if (!cancelled) setInitialising(false)
    }

    init()
    return () => { cancelled = true }
  }, [router])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/bikes/options', { signal: controller.signal })
      .then(response => response.json())
      .then(data => setMakes(data.makes ?? []))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!selectedMakeId) {
      setModels([])
      setVariants([])
      setYears([])
      return
    }

    const controller = new AbortController()
    setLoadingModels(true)
    setModels([])
    setVariants([])
    setYears([])
    fetch(`/api/bikes/options?make=${encodeURIComponent(selectedMakeId)}`, { signal: controller.signal })
      .then(response => response.json())
      .then(data => setModels(data.models ?? []))
      .catch(() => {})
      .finally(() => setLoadingModels(false))
    return () => controller.abort()
  }, [selectedMakeId])

  useEffect(() => {
    if (!selectedMakeId || !selectedModelId) {
      setVariants([])
      setYears([])
      return
    }

    const controller = new AbortController()
    setLoadingVariants(true)
    setVariants([])
    setYears([])
    fetch(`/api/bikes/options?make=${encodeURIComponent(selectedMakeId)}&model=${encodeURIComponent(selectedModelId)}`, { signal: controller.signal })
      .then(response => response.json())
      .then(data => setVariants(data.variants ?? []))
      .catch(() => {})
      .finally(() => setLoadingVariants(false))
    return () => controller.abort()
  }, [selectedMakeId, selectedModelId])

  useEffect(() => {
    if (!selectedMakeId || !selectedModelId || loadingVariants) {
      setYears([])
      return
    }

    const needsVariant = variants.length > 0
    if (needsVariant && !selectedVariant) {
      setYears([])
      return
    }

    const controller = new AbortController()
    setLoadingYears(true)
    const variantParam = needsVariant ? selectedVariant : ''
    fetch(`/api/bikes/options?make=${encodeURIComponent(selectedMakeId)}&model=${encodeURIComponent(selectedModelId)}&variant=${encodeURIComponent(variantParam)}`, { signal: controller.signal })
      .then(response => response.json())
      .then(data => setYears(data.years ?? []))
      .catch(() => {})
      .finally(() => setLoadingYears(false))
    return () => controller.abort()
  }, [selectedMakeId, selectedModelId, selectedVariant, variants, loadingVariants])

  const commitBikeSelection = useCallback((bike: SelectedBike) => {
    setSelectedBike(bike)
    setSearchQuery('')
    setActiveCategory('')
    setSortMode('default')
    try {
      const persisted: PersistedBrowseBike = { ...bike, userSelected: true }
      sessionStorage.setItem(BROWSE_BIKE_KEY, JSON.stringify(persisted))
    } catch { /* ignore */ }
  }, [])

  const openProductDetails = useCallback((productId: number) => {
    if (selectedBike) {
      try {
        const context: BrowseReturnContext = {
          selectedBike: { ...selectedBike, userSelected: true },
          searchQuery,
          activeCategory,
          sortMode,
        }
        sessionStorage.setItem(BROWSE_RETURN_KEY, JSON.stringify(context))
      } catch { /* ignore */ }
    }

    router.push(`/shop/${productId}?from=browse`)
  }, [activeCategory, router, searchQuery, selectedBike, sortMode])

  useEffect(() => {
    if (!selectedMakeId || !selectedModelId || !selectedYear) return
    if (variants.length > 0 && !selectedVariant) return

    const variant = variants.length > 0 ? selectedVariant : null
    commitBikeSelection({
      id: buildBikeId(selectedMakeName || selectedMakeId, selectedModelName || selectedModelId, variant, Number(selectedYear)),
      make: selectedMakeName || selectedMakeId,
      model: selectedModelName || selectedModelId,
      variant,
      year: Number(selectedYear),
      source: 'manual',
    })
  }, [commitBikeSelection, selectedMakeId, selectedMakeName, selectedModelId, selectedModelName, selectedVariant, selectedYear, variants])

  function handleMakeChange(value: string) {
    const make = makes.find(item => item.id === value)
    setSelectedMakeId(value)
    setSelectedMakeName(make?.name ?? value)
    setSelectedModelId('')
    setSelectedModelName('')
    setSelectedVariant('')
    setSelectedYear('')
    setSelectedBike(null)
    setSearchQuery('')
    setActiveCategory('')
  }

  function handleModelChange(value: string) {
    const model = models.find(item => item.id === value)
    setSelectedModelId(value)
    setSelectedModelName(model?.name ?? value)
    setSelectedVariant('')
    setSelectedYear('')
    setSelectedBike(null)
    setSearchQuery('')
    setActiveCategory('')
  }

  function handleGarageBikeSelect(value: string) {
    const bike = garageBikes.find(item => item.id === value)
    if (!bike) return
    setSelectedMakeId(bike.make)
    setSelectedMakeName(bike.make)
    setSelectedModelId(bike.model)
    setSelectedModelName(bike.model)
    setSelectedVariant(bike.variant ?? '')
    setSelectedYear(String(bike.year))
    commitBikeSelection(bike)
  }

  function clearBike() {
    setSelectedBike(null)
    setSelectedMakeId('')
    setSelectedMakeName('')
    setSelectedModelId('')
    setSelectedModelName('')
    setSelectedVariant('')
    setSelectedYear('')
    setSearchQuery('')
    setActiveCategory('')
    setSortMode('default')
    try { sessionStorage.removeItem(BROWSE_BIKE_KEY) } catch { /* ignore */ }
  }

  const categoryOptions = useMemo(
    () => garageCategories.filter(category => category.id !== 'all' && demoGarageProducts.some(product => product.categoryId === category.id)),
    []
  )

  const hasActiveResults = Boolean(selectedBike && (searchQuery.trim() || activeCategory))

  const filteredProducts = useMemo(() => {
    if (!selectedBike || !hasActiveResults) return []

    let products = demoGarageProducts.filter(product => isProductCompatible(product, selectedBike))
    if (activeCategory) products = products.filter(product => product.categoryId === activeCategory)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      products = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        (product.subcategory ?? '').toLowerCase().includes(query)
      )
    }

    if (sortMode === 'price-asc') products = [...products].sort((a, b) => demoPrice(a.id) - demoPrice(b.id))
    if (sortMode === 'price-desc') products = [...products].sort((a, b) => demoPrice(b.id) - demoPrice(a.id))
    if (sortMode === 'brand-az') products = [...products].sort((a, b) => a.brand.localeCompare(b.brand))
    if (sortMode === 'brand-za') products = [...products].sort((a, b) => b.brand.localeCompare(a.brand))

    return products
  }, [activeCategory, hasActiveResults, searchQuery, selectedBike, sortMode])

  const selectedBikeLabel = selectedBike ? bikeDisplayName(selectedBike) : ''

  if (initialising) {
    return (
      <main className="browse-page">
        <style jsx>{styles}</style>
        <div className="loading-state">
          <span />
          Loading Browse...
        </div>
      </main>
    )
  }

  return (
    <main className="browse-page">
      <style jsx>{styles}</style>
      <div className="browse-shell">
        <section className="bike-card">
          <div className="bike-card-header">
            <div>
              <h1>Choose your bike</h1>
              <p>Select your bike&apos;s make, model, variant, and year to browse compatible accessories.</p>
            </div>
            {selectedBike ? <button type="button" className="change-bike" onClick={clearBike}>Clear</button> : null}
          </div>

          {garageBikes.length > 0 ? (
            <label className="field garage-field">
              <span>Garage</span>
              <select defaultValue="" onChange={event => handleGarageBikeSelect(event.target.value)}>
                <option value="">Select from Garage</option>
                {garageBikes.map(bike => (
                  <option key={bike.id} value={bike.id}>
                    {bike.nickname ? `${bike.nickname} - ${bikeDisplayName(bike)}` : bikeDisplayName(bike)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="selector-grid">
            <SelectField label="Make" value={selectedMakeId} onChange={handleMakeChange}>
              <option value="">Make</option>
              {makes.map(make => <option key={make.id} value={make.id}>{make.name}</option>)}
            </SelectField>

            <SelectField label="Model" value={selectedModelId} disabled={!selectedMakeId || loadingModels} onChange={handleModelChange}>
              <option value="">{loadingModels ? 'Loading...' : 'Model'}</option>
              {models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
            </SelectField>

            <SelectField label="Variant" value={selectedVariant} disabled={!selectedModelId || loadingVariants || variants.length === 0} onChange={value => { setSelectedVariant(value); setSelectedYear(''); setSelectedBike(null) }}>
              <option value="">{loadingVariants ? 'Loading...' : variants.length === 0 ? 'Base' : 'Variant'}</option>
              {variants.map(variant => <option key={variant} value={variant}>{variant}</option>)}
            </SelectField>

            <SelectField label="Year" value={selectedYear} disabled={!selectedModelId || loadingYears || (variants.length > 0 && !selectedVariant)} onChange={value => setSelectedYear(value)}>
              <option value="">{loadingYears ? 'Loading...' : 'Year'}</option>
              {years.map(year => <option key={year} value={String(year)}>{year}</option>)}
            </SelectField>
          </div>

          <div className={selectedBike ? 'bike-status active' : 'bike-status'}>
            <div className="bike-status-icon" />
            <div>
              <strong>{selectedBike ? selectedBikeLabel : 'No bike selected yet'}</strong>
              <span>{selectedBike ? 'Ready to browse. Search or choose a category to view compatible accessories.' : 'Choose your bike, then browse compatible accessories.'}</span>
            </div>
          </div>
        </section>

        <section className="search-section" aria-label="Accessory search and filters">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              disabled={!selectedBike}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search accessories for your selected bike"
            />
          </div>

          <div className="control-row">
            <label>
              <select value={activeCategory} disabled={!selectedBike} onChange={event => setActiveCategory(event.target.value)}>
                <option value="">Choose category</option>
                {categoryOptions.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
              </select>
            </label>

            <label>
              <select value={sortMode} disabled={!selectedBike} onChange={event => setSortMode(event.target.value as SortMode)}>
                <option value="default">Sort</option>
                <option value="price-asc">Price low to high</option>
                <option value="price-desc">Price high to low</option>
                <option value="brand-az">Brand A-Z</option>
                <option value="brand-za">Brand Z-A</option>
              </select>
            </label>
          </div>
        </section>

        {!selectedBike ? (
          <section className="landing-empty">
            <div className="empty-illustration">
              <svg width="74" height="74" viewBox="0 0 74 74" fill="none" aria-hidden="true">
                <circle cx="37" cy="37" r="35" stroke="#E8841A" strokeOpacity="0.28" strokeWidth="2" />
                <path d="M21 43h8l6-12h11l7 12h3" stroke="#E8841A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="48" r="5" stroke="#F5F3EE" strokeOpacity="0.82" strokeWidth="3" />
                <circle cx="52" cy="48" r="5" stroke="#F5F3EE" strokeOpacity="0.82" strokeWidth="3" />
              </svg>
            </div>
            <h2>Choose your bike first</h2>
            <p>Select a make, model, variant, and year above. We&apos;ll keep the accessory list quiet until you search or choose a category.</p>
          </section>
        ) : !hasActiveResults ? (
          <section className="guided-empty">
            <div className="empty-illustration">
              <svg width="74" height="74" viewBox="0 0 74 74" fill="none" aria-hidden="true">
                <rect x="18" y="20" width="38" height="34" rx="10" stroke="#E8841A" strokeOpacity="0.38" strokeWidth="2" />
                <path d="M28 34h18M28 42h12" stroke="#F5F3EE" strokeOpacity="0.78" strokeWidth="3" strokeLinecap="round" />
                <circle cx="52" cy="24" r="8" fill="#E8841A" fillOpacity="0.16" />
                <path d="m49 24 2 2 4-5" stroke="#E8841A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2>No accessories shown yet</h2>
            <p>Search by name or choose a category to see compatible products for your bike.</p>
            <div className="quick-chips">
              {quickCategories.map(category => (
                <button key={category.id} type="button" onClick={() => setActiveCategory(category.id)}>
                  {category.label}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="results-section">
            <div className="results-header">
              <div>
                <strong>{filteredProducts.length} compatible accessories</strong>
                <span>{selectedBikeLabel}</span>
              </div>
              <button type="button" onClick={() => { setSearchQuery(''); setActiveCategory('') }}>Clear</button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-results">
                <h2>No matching accessories</h2>
                <p>Try a different search or choose another category.</p>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDetails={() => openProductDetails(product.id)}
                    onShop={() => router.push(`/shop?productId=${product.id}&from=browse`)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

const styles = `
  .browse-page {
    min-height: 100vh;
    background: #0D0D0D;
    color: #F5F3EE;
    padding-bottom: 44px;
  }

  .browse-shell {
    width: min(100%, 1040px);
    margin: 0 auto;
    padding: 16px 20px 0;
    display: grid;
    gap: 14px;
  }

  .bike-card, .guided-empty, .landing-empty, .product-card, .no-results {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    box-shadow: 0 16px 42px rgba(0,0,0,0.2);
  }

  .bike-card {
    padding: 16px;
    display: grid;
    gap: 14px;
  }

  .bike-card-header {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
  }

  h1, h2, h3, p {
    margin: 0;
  }

  .bike-card h1 {
    font-size: 28px;
    line-height: 1;
    letter-spacing: 0;
    font-weight: 850;
    color: #F5F3EE;
  }

  .bike-card p {
    margin-top: 7px;
    max-width: 620px;
    color: #B8AFA6;
    font-size: 13px;
    line-height: 1.45;
  }

  .change-bike {
    border: 1px solid rgba(232,132,26,0.28);
    color: #E8841A;
    background: rgba(232,132,26,0.08);
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .selector-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .field {
    display: grid;
    gap: 6px;
  }

  .field span {
    color: #8F887F;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  select, input {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    border: 1px solid rgba(255,255,255,0.1);
    background: #1A1A1A;
    color: #F5F3EE;
    border-radius: 12px;
    min-height: 46px;
    padding: 0 13px;
    font-size: 14px;
    outline: none;
  }

  select:disabled, input:disabled {
    color: #54504A;
    opacity: 0.65;
    cursor: not-allowed;
  }

  .garage-field {
    padding: 12px;
    border-radius: 14px;
    background: #1A1814;
    border: 1px solid rgba(232,132,26,0.16);
  }

  .bike-status {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    padding: 12px;
    border-radius: 14px;
    background: #101010;
    border: 1px solid rgba(255,255,255,0.05);
  }

  .bike-status.active {
    border-color: rgba(232,132,26,0.24);
    background: rgba(232,132,26,0.06);
  }

  .bike-status-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 50%, rgba(232,132,26,0.28), rgba(232,132,26,0.06));
    border: 1px solid rgba(232,132,26,0.22);
  }

  .bike-status strong {
    display: block;
    color: #F5F3EE;
    font-size: 13px;
    line-height: 1.25;
  }

  .bike-status span {
    display: block;
    margin-top: 3px;
    color: #8F887F;
    font-size: 11px;
    line-height: 1.35;
  }

  .search-section {
    display: grid;
    gap: 10px;
  }

  .search-box {
    position: relative;
  }

  .search-box svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #6A6860;
    pointer-events: none;
  }

  .search-box input {
    padding-left: 42px;
    background: #141414;
  }

  .control-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .guided-empty, .landing-empty {
    min-height: 270px;
    padding: 24px 18px;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 12px;
    text-align: center;
  }

  .empty-illustration {
    width: 92px;
    height: 92px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,132,26,0.13), rgba(232,132,26,0.02));
  }

  .guided-empty h2, .landing-empty h2, .no-results h2 {
    font-size: 22px;
    font-weight: 850;
    letter-spacing: 0;
    color: #F5F3EE;
  }

  .guided-empty p, .landing-empty p, .no-results p {
    max-width: 420px;
    color: #B8AFA6;
    font-size: 13px;
    line-height: 1.55;
  }

  .quick-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
  }

  .quick-chips button {
    border: 1px solid rgba(232,132,26,0.28);
    background: rgba(232,132,26,0.08);
    color: #E8841A;
    border-radius: 999px;
    min-height: 34px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
  }

  .results-section {
    display: grid;
    gap: 12px;
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .results-header strong {
    display: block;
    font-size: 14px;
    color: #F5F3EE;
  }

  .results-header span {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    color: #8F887F;
  }

  .results-header button {
    border: none;
    background: none;
    color: #E8841A;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .product-card {
    overflow: hidden;
    display: grid;
  }

  .product-image {
    position: relative;
    height: 118px;
    background: #1A1814;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .category-pill {
    position: absolute;
    top: 9px;
    left: 9px;
    max-width: calc(100% - 18px);
    border-radius: 999px;
    padding: 4px 8px;
    background: rgba(var(--accent-rgb),0.13);
    border: 1px solid rgba(var(--accent-rgb),0.3);
    color: var(--accent);
    font-size: 10px;
    font-weight: 750;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-body {
    padding: 11px;
    display: grid;
    gap: 5px;
  }

  .product-body h3 {
    font-size: 13px;
    font-weight: 760;
    line-height: 1.25;
    min-height: 32px;
    color: #F5F3EE;
  }

  .product-body p {
    color: #8F887F;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-body strong {
    color: #F5F3EE;
    font-size: 14px;
  }

  .fit-badge {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(29,158,117,0.09);
    color: #1D9E75;
    font-size: 10px;
    font-weight: 750;
  }

  .product-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 6px;
  }

  .primary-action, .secondary-action {
    border-radius: 10px;
    min-height: 38px;
    padding: 0 8px;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
  }

  .primary-action {
    border: none;
    background: #E8841A;
    color: #0D0D0D;
    text-transform: uppercase;
  }

  .secondary-action {
    border: 1px solid rgba(255,255,255,0.11);
    background: transparent;
    color: #F5F3EE;
  }

  .no-results {
    padding: 32px 18px;
    text-align: center;
    display: grid;
    gap: 8px;
    justify-items: center;
  }

  .loading-state {
    min-height: 48vh;
    display: grid;
    gap: 12px;
    place-items: center;
    align-content: center;
    color: #8F887F;
    font-size: 13px;
  }

  .loading-state span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #E8841A;
    animation: pulse 1.4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.82); }
  }

  @media (min-width: 720px) {
    .browse-shell {
      padding-top: 24px;
      gap: 18px;
    }

    .bike-card {
      padding: 22px;
    }

    .selector-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .product-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }

    .product-image {
      height: 150px;
    }
  }

  @media (max-width: 380px) {
    .browse-shell {
      padding-left: 14px;
      padding-right: 14px;
    }

    .selector-grid, .product-grid {
      grid-template-columns: 1fr;
    }
  }
`
