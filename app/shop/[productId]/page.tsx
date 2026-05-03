'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { demoGarageProducts } from '@/lib/demo-content/products'
import { demoExpertBuildCatalog } from '@/lib/demo-content/expert-builds'
import { garageCategories } from '@/types/garage'
import type { ProductAvailabilityStatus } from '@/types/garage'

// ── Constants ─────────────────────────────────────────────────────────────────

const BUILD_KEY = 'browse_build'
const BROWSE_BIKE_KEY = 'browse_bike_selection_v2'

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

// ── Utilities ─────────────────────────────────────────────────────────────────

function demoPrice(productId: number): number {
  return 140 + ((productId * 7) % 180)
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function getCategoryLabel(categoryId: string): string {
  return garageCategories.find(c => c.id === categoryId)?.label ?? categoryId
}

// ── Stock indicator ───────────────────────────────────────────────────────────

const STOCK_META: Record<ProductAvailabilityStatus, { color: string; label: string }> = {
  available:     { color: '#1D9E75', label: 'In stock' },
  limited:       { color: '#BA7517', label: 'Low stock' },
  'coming-soon': { color: '#44423E', label: 'Coming soon' },
  unavailable:   { color: '#44423E', label: 'Unavailable' },
}

function StockDot({ status }: { status: ProductAvailabilityStatus }) {
  const { color, label } = STOCK_META[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontSize: 10, color }}>{label}</span>
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [fromSource, setFromSource]   = useState<'browse' | 'shop' | 'compare' | 'garage' | null>(null)
  const [compareBuildId, setCompareBuildId] = useState<string | null>(null)
  const [inBuild,    setInBuild]      = useState(false)
  const [buildAdded, setBuildAdded]   = useState(false)
  const [selectedBikeLabel, setSelectedBikeLabel] = useState<string | null>(null)

  const productId = parseInt(params?.productId as string, 10)
  const product   = useMemo(
    () => demoGarageProducts.find(p => p.id === productId) ?? null,
    [productId]
  )

  const basePrice = product ? demoPrice(product.id) : 0

  // Read `?from` param and current build state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    setFromSource(from === 'browse' ? 'browse' : from === 'shop' ? 'shop' : from === 'compare' ? 'compare' : from === 'garage' ? 'garage' : null)
    setCompareBuildId(params.get('buildId'))

    try {
      const stored = sessionStorage.getItem(BUILD_KEY)
      const list: number[] = stored ? JSON.parse(stored) : []
      if (product) setInBuild(list.includes(product.id))
    } catch { /* ignore */ }

    try {
      const storedBike = sessionStorage.getItem(BROWSE_BIKE_KEY)
      const bike = storedBike ? JSON.parse(storedBike) as {
        make?: string
        model?: string
        variant?: string | null
        year?: number
        userSelected?: boolean
      } : null
      if (bike?.userSelected && bike.make && bike.model && bike.year) {
        setSelectedBikeLabel([bike.make, bike.model, bike.variant, bike.year].filter(Boolean).join(' '))
      } else {
        setSelectedBikeLabel(null)
      }
    } catch { /* ignore */ }
  }, [product])

  // Expert build count
  const expertBuildCount = useMemo(
    () => demoExpertBuildCatalog.filter(
      b => product ? b.accessories.some(a => a.productId === product.id) : false
    ).length,
    [product]
  )

  function toggleBuild() {
    if (!product) return

    try {
      const stored = sessionStorage.getItem(BUILD_KEY)
      const list: number[] = stored ? JSON.parse(stored) : []
      const nowIn = !inBuild
      const newList = nowIn ? [...list, product.id] : list.filter(id => id !== product.id)
      sessionStorage.setItem(BUILD_KEY, JSON.stringify(newList))
      setInBuild(nowIn)
      if (nowIn) setBuildAdded(true)
    } catch { /* ignore */ }
  }

  function handleBack() {
    if (fromSource === 'browse') {
      router.push('/browse?restoreBrowse=1')
      return
    }
    if (fromSource === 'shop') {
      router.push(product ? `/shop?productId=${product.id}` : '/shop')
      return
    }
    if (fromSource === 'compare' && compareBuildId) {
      router.push(`/expert/${compareBuildId}?restoreCompare=1`)
      return
    }
    if (fromSource === 'garage') {
      router.push('/garage?restoreGarage=1')
      return
    }
    router.back()
  }

  const backLabel = fromSource === 'browse' ? 'Back to Browse'
                  : fromSource === 'shop'   ? 'Back to Shop'
                  : fromSource === 'compare' ? 'Back to comparison'
                  : fromSource === 'garage' ? 'Back to Garage'
                  : 'Back'

  const accent    = product ? CATEGORY_ACCENT[product.categoryId] ?? '#E8841A' : '#E8841A'
  const catLabel  = product ? getCategoryLabel(product.categoryId) : ''

  // Demo suppliers (3 per product)
  const suppliers = useMemo(() => {
    if (!product) return []

    const realLink = product.affiliateLinks?.[0]
    return [
      {
        name: realLink?.vendorName ?? product.brand,
        url:  realLink?.url ?? product.supplierUrl ?? null,
        price: basePrice,
        status: product.availabilityStatus ?? 'available',
        delivery: '2–3 days',
      },
      {
        name: 'Wunderlich',
        url: null,
        price: basePrice + 17,
        status: 'available' as ProductAvailabilityStatus,
        delivery: '3–5 days',
      },
      {
        name: 'Nippy Normans',
        url: null,
        price: basePrice + 34,
        status: 'limited' as ProductAvailabilityStatus,
        delivery: '5–7 days',
      },
    ]
  }, [product, basePrice])

  if (!product) {
    return (
      <main style={{ backgroundColor: '#0D0D0D', color: '#F5F3EE', minHeight: '100vh', padding: 20 }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#E8841A',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            padding: 0,
          }}
        >
          {backLabel}
        </button>
        <section style={{ marginTop: 28, display: 'grid', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Product not found</h1>
          <p style={{ margin: 0, color: '#B8AFA6', lineHeight: 1.5 }}>
            This product link does not match an accessory in the current catalogue.
          </p>
          <button
            type="button"
            onClick={() => router.push('/shop')}
            style={{
              marginTop: 10,
              width: 'fit-content',
              backgroundColor: '#E8841A',
              border: 'none',
              borderRadius: 8,
              color: '#0D0D0D',
              cursor: 'pointer',
              fontWeight: 900,
              padding: '11px 14px',
            }}
          >
            View supplier options
          </button>
        </section>
      </main>
    )
  }

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', paddingBottom: 48 }}>

      {/* ── Nav bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={handleBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#E8841A', fontSize: 12, fontWeight: 500, padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8841A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {backLabel}
        </button>

        <span style={{
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 12, color: '#F5F3EE',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          Product detail
        </span>

        <div style={{ width: 52 }} />
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>

        {/* ── Product image ─────────────────────────────────────────────── */}
        <div style={{
          width: '100%', height: 200,
          backgroundColor: '#1A1814',
          borderRadius: 12, overflow: 'hidden',
          position: 'relative',
        }}>
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {/* Category badge */}
          <span style={{
            position: 'absolute', top: 10, left: 10,
            backgroundColor: `rgba(${hexToRgb(accent)},0.14)`,
            border: `1px solid rgba(${hexToRgb(accent)},0.32)`,
            color: accent,
            borderRadius: 20, padding: '3px 9px',
            fontSize: 10, fontWeight: 500,
          }}>
            {catLabel}
          </span>
        </div>

        {/* ── Identity card ─────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '13px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#F5F3EE', lineHeight: 1.3 }}>
              {product.name}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6A6860' }}>{product.brand}</p>
          </div>

          {/* Fit badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            backgroundColor: 'rgba(29,158,117,0.08)',
            borderRadius: 20, padding: '3px 9px', width: 'fit-content',
          }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5.5" stroke="#1D9E75" strokeWidth="1" />
              <polyline points="3,6 5,8.5 9,4" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 9, fontWeight: 500, color: '#1D9E75' }}>
              Guaranteed fit · {product.fitmentConfidence ?? 'Exact fit'}
            </span>
          </span>

          {selectedBikeLabel && (
            <p style={{
              margin: 0,
              padding: '8px 10px',
              borderRadius: 10,
              backgroundColor: '#1A1814',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#B8AFA6',
              fontSize: 11,
              lineHeight: 1.4,
            }}>
              Fitment checked for <span style={{ color: '#F5F3EE', fontWeight: 600 }}>{selectedBikeLabel}</span>
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: 24, color: '#F5F3EE',
            }}>
              From ${basePrice}
            </span>
            <span style={{ fontSize: 11, color: '#6A6860' }}>{suppliers.length} suppliers</span>
          </div>
        </div>

        {/* ── Primary actions ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleBuild}
            style={{
              flex: 1, padding: '12px 0',
              backgroundColor: inBuild ? 'rgba(29,158,117,0.12)' : 'transparent',
              border: inBuild ? '1px solid rgba(29,158,117,0.35)' : '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              color: inBuild ? '#1D9E75' : '#F5F3EE',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {inBuild ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5.5" stroke="#1D9E75" strokeWidth="1" />
                  <polyline points="3,6 5,8.5 9,4" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                In Build
              </>
            ) : 'Add to Build'}
          </button>

          <button
            onClick={() => router.push(`/shop?productId=${product.id}`)}
            style={{
              flex: 1, padding: '12px 0',
              backgroundColor: '#E8841A', border: 'none',
              borderRadius: 8, color: '#0D0D0D',
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: 12,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            Shop →
          </button>
        </div>

        {buildAdded && (
          <p style={{ margin: 0, fontSize: 11, color: '#1D9E75', textAlign: 'center' }}>
            Added to this temporary build list
          </p>
        )}

        {/* ── Description ───────────────────────────────────────────────── */}
        {product.description && (
          <div style={{
            backgroundColor: '#141414',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '13px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 3, height: 14, backgroundColor: accent, borderRadius: 2 }} />
              <p style={{
                margin: 0,
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                fontWeight: 900, fontSize: 11, color: '#F5F3EE',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Description
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#B8AFA6', lineHeight: 1.6 }}>
              {product.description}
            </p>
          </div>
        )}

        {/* ── Product details ───────────────────────────────────────────── */}
        <div style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '13px 14px',
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 3, height: 14, backgroundColor: accent, borderRadius: 2 }} />
            <p style={{
              margin: 0,
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: 11, color: '#F5F3EE',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Product details
            </p>
          </div>

          {[
            { label: 'Brand',    value: product.brand },
            { label: 'Category', value: catLabel },
            { label: 'Type',     value: product.subcategory ?? '—' },
            { label: 'Fitment',  value: product.fitmentConfidence ?? 'Exact fit' },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <span style={{ fontSize: 12, color: '#6A6860' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#F5F3EE' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Expert builds ─────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '13px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 3, height: 14, backgroundColor: '#7F77DD', borderRadius: 2 }} />
            <p style={{
              margin: 0,
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: 11, color: '#F5F3EE',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Expert builds
            </p>
          </div>

          {expertBuildCount > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#B8AFA6' }}>
                Featured in{' '}
                <span style={{ color: '#F5F3EE', fontWeight: 600 }}>{expertBuildCount}</span>{' '}
                expert {expertBuildCount === 1 ? 'build' : 'builds'}
              </p>
              <button
                onClick={() => router.push('/expert')}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontSize: 11, fontWeight: 500, color: '#E8841A', cursor: 'pointer',
                }}
              >
                View builds →
              </button>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: '#44423E' }}>
              Not yet featured in any expert builds
            </p>
          )}
        </div>

        {/* ── Shop options summary ──────────────────────────────────────── */}
        <div style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '13px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 3, height: 14, backgroundColor: '#639922', borderRadius: 2 }} />
              <p style={{
                margin: 0,
                fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                fontWeight: 900, fontSize: 11, color: '#F5F3EE',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Shop options
              </p>
            </div>
            <span style={{ fontSize: 11, color: '#6A6860' }}>{suppliers.length} suppliers</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suppliers.map((s, i) => (
              <div
                key={s.name}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px',
                  backgroundColor: i === 0 ? 'rgba(99,153,34,0.06)' : '#1A1814',
                  border: i === 0 ? '1px solid rgba(99,153,34,0.2)' : '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    backgroundColor: '#141414', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#44423E', textTransform: 'uppercase',
                  }}>
                    {s.name[0]}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#F5F3EE' }}>{s.name}</p>
                    <div style={{ marginTop: 2 }}><StockDot status={s.status} /></div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {i === 0 && (
                    <span style={{
                      fontSize: 9, fontWeight: 500, color: '#639922',
                      backgroundColor: 'rgba(99,153,34,0.12)',
                      border: '1px solid rgba(99,153,34,0.28)',
                      borderRadius: 20, padding: '1px 6px',
                    }}>
                      Best price
                    </span>
                  )}
                  <span style={{
                    fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
                    fontWeight: 900, fontSize: 15, color: '#F5F3EE',
                  }}>
                    ${s.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push(`/shop?productId=${product.id}`)}
            style={{
              display: 'block', width: '100%', marginTop: 12,
              backgroundColor: '#E8841A', border: 'none',
              borderRadius: 8, padding: '11px 0',
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: 12,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              color: '#0D0D0D', cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            Compare supplier options
            <span style={{
              display: 'block', fontSize: 10, fontWeight: 400,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textTransform: 'none', letterSpacing: 'normal',
              color: 'rgba(0,0,0,0.5)', marginTop: 2,
            }}>
              opens supplier options in Accessorise It
            </span>
          </button>
        </div>

        {/* ── Affiliate disclosure ──────────────────────────────────────── */}
        <p style={{
          textAlign: 'center', fontSize: 10, color: '#3A3830',
          margin: 0, lineHeight: 1.5,
        }}>
          We may earn a commission on purchases made through links on this page. This doesn&apos;t affect the price you pay.
        </p>

      </div>
    </div>
  )
}
