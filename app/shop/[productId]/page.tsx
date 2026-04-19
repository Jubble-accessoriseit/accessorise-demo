'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { demoGarageProducts } from '@/lib/demo-content/products'
import type { Product, ProductAvailabilityStatus } from '@/types/garage'

// ── Types ─────────────────────────────────────────────────────────────────────

type SortMode = 'best-price' | 'in-stock' | 'fastest'

type SupplierRow = {
  vendorName: string
  url: string
  price: number
  stockStatus: ProductAvailabilityStatus
  deliveryLabel: string
}

// ── Demo supplier builder ─────────────────────────────────────────────────────

const SYNTHETIC_VENDORS = [
  { name: 'Wunderlich', stockOffset: 0 },
  { name: 'Nippy Normans', stockOffset: 1 },
]

const DELIVERY_LABELS = ['2–3 days', '3–5 days', '5–7 days']

function getStockStatus(
  base: ProductAvailabilityStatus | null | undefined,
  offset: number
): ProductAvailabilityStatus {
  if (offset === 0) return base ?? 'available'
  if (offset === 1) return 'available'
  return 'limited'
}

function buildDemoSuppliers(product: Product): SupplierRow[] {
  const basePrice = 140 + ((product.id * 7) % 180)
  const realLink = product.affiliateLinks?.[0]

  return [
    {
      vendorName: realLink?.vendorName ?? product.brand,
      url: realLink?.url ?? product.supplierUrl ?? '#',
      price: basePrice,
      stockStatus: getStockStatus(product.availabilityStatus, 0),
      deliveryLabel: DELIVERY_LABELS[0],
    },
    ...SYNTHETIC_VENDORS.map((v, i) => ({
      vendorName: v.name,
      url: '#',
      price: basePrice + (i === 0 ? 17 : 34),
      stockStatus: getStockStatus(product.availabilityStatus, v.stockOffset + 1),
      deliveryLabel: DELIVERY_LABELS[i + 1],
    })),
  ]
}

function sortSuppliers(rows: SupplierRow[], mode: SortMode): SupplierRow[] {
  const copy = [...rows]
  if (mode === 'best-price') return copy.sort((a, b) => a.price - b.price)
  if (mode === 'in-stock') {
    const order: Record<ProductAvailabilityStatus, number> = {
      available: 0, limited: 1, 'coming-soon': 2, unavailable: 3,
    }
    return copy.sort((a, b) => order[a.stockStatus] - order[b.stockStatus])
  }
  return copy.sort(
    (a, b) =>
      DELIVERY_LABELS.indexOf(a.deliveryLabel) -
      DELIVERY_LABELS.indexOf(b.deliveryLabel)
  )
}

// ── Stock indicator ───────────────────────────────────────────────────────────

const STOCK_META: Record<ProductAvailabilityStatus, { color: string; label: string }> = {
  available:     { color: '#1D9E75', label: 'In stock' },
  limited:       { color: '#BA7517', label: 'Low stock' },
  'coming-soon': { color: '#44423E', label: 'Coming soon' },
  unavailable:   { color: '#44423E', label: 'Unavailable' },
}

function StockIndicator({ status }: { status: ProductAvailabilityStatus }) {
  const { color, label } = STOCK_META[status]
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      <span style={{ fontSize: 10, color }}>{label}</span>
    </span>
  )
}

function VendorLogo({ name }: { name: string }) {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
      backgroundColor: '#1A1814',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 700, color: '#44423E',
      textTransform: 'uppercase',
    }}>
      {name[0]}
    </div>
  )
}

// ── Supplier cards ────────────────────────────────────────────────────────────

function BestPriceCard({ supplier, savings }: { supplier: SupplierRow; savings: number }) {
  return (
    <div style={{ backgroundColor: '#141414', border: '1px solid rgba(99,153,34,0.32)', borderRadius: 12, padding: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          backgroundColor: 'rgba(99,153,34,0.12)', border: '1px solid rgba(99,153,34,0.28)',
          color: '#639922', fontSize: 9, fontWeight: 500,
          padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap',
        }}>
          Best price
        </span>
        {savings > 0 && (
          <span style={{ fontSize: 11, fontWeight: 500, color: '#639922' }}>↓ ${savings} cheaper</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <VendorLogo name={supplier.vendorName} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', margin: 0, lineHeight: 1.3 }}>{supplier.vendorName}</p>
          <div style={{ marginTop: 3 }}><StockIndicator status={supplier.stockStatus} /></div>
          <p style={{ fontSize: 10, color: '#6A6860', margin: '2px 0 0' }}>{supplier.deliveryLabel}</p>
        </div>
        <span style={{
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 22, color: '#F5F3EE', flexShrink: 0,
        }}>
          ${supplier.price}
        </span>
      </div>

      <a
        href={supplier.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', marginTop: 12, width: '100%',
          backgroundColor: '#1C69D4', color: '#0D0D0D',
          border: 'none', borderRadius: 8, padding: '10px 0',
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 12,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          textAlign: 'center', textDecoration: 'none', cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        Buy now
        <span style={{
          display: 'block', fontSize: 10, fontWeight: 400,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textTransform: 'none', letterSpacing: 'normal',
          color: 'rgba(0,0,0,0.5)', marginTop: 2,
        }}>
          opens retailer site ↗
        </span>
      </a>
    </div>
  )
}

function StandardSupplierCard({ supplier }: { supplier: SupplierRow }) {
  return (
    <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <VendorLogo name={supplier.vendorName} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F3EE', margin: 0, lineHeight: 1.3 }}>{supplier.vendorName}</p>
          <div style={{ marginTop: 3 }}><StockIndicator status={supplier.stockStatus} /></div>
          <p style={{ fontSize: 10, color: '#6A6860', margin: '2px 0 0' }}>{supplier.deliveryLabel}</p>
        </div>
        <span style={{
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 22, color: '#F5F3EE', flexShrink: 0,
        }}>
          ${supplier.price}
        </span>
      </div>

      <a
        href={supplier.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', marginTop: 12, width: '100%',
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)', color: '#F5F3EE',
          borderRadius: 8, padding: '10px 0',
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 12,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          textAlign: 'center', textDecoration: 'none', cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        Buy now
        <span style={{
          display: 'block', fontSize: 10, fontWeight: 400,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textTransform: 'none', letterSpacing: 'normal',
          color: '#44423E', marginTop: 2,
        }}>
          opens retailer site ↗
        </span>
      </a>
    </div>
  )
}

// ── Sort pills ────────────────────────────────────────────────────────────────

const SORT_PILLS: Array<{ id: SortMode; label: string }> = [
  { id: 'best-price', label: 'Best price' },
  { id: 'in-stock',   label: 'In stock first' },
  { id: 'fastest',    label: 'Fastest delivery' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShopProductPage() {
  const params = useParams()
  const router = useRouter()
  const [sortMode, setSortMode] = useState<SortMode>('best-price')

  const productId = parseInt(params?.productId as string, 10)
  const product = useMemo(
    () => demoGarageProducts.find(p => p.id === productId) ?? demoGarageProducts[0],
    [productId]
  )

  const suppliers = useMemo(() => {
    const rows = buildDemoSuppliers(product)
    return sortSuppliers(rows, sortMode)
  }, [product, sortMode])

  const savings = suppliers.length >= 2 ? suppliers[1].price - suppliers[0].price : 0

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', paddingBottom: 40 }}>

      {/* A — Back navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#1C69D4', fontSize: 12, fontWeight: 500, padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C69D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Garage
        </button>

        <span style={{
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 12, color: '#F5F3EE',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          Shop suppliers
        </span>

        <div style={{ width: 52 }} />
      </div>

      {/* B — Accessory summary card */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: 13,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F3EE', margin: 0, lineHeight: 1.3 }}>
            {product.name}
          </p>

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            backgroundColor: 'rgba(29,158,117,0.08)',
            borderRadius: 20, padding: '2px 8px',
            width: 'fit-content',
          }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5.5" stroke="#1D9E75" strokeWidth="1" />
              <polyline points="3,6 5,8.5 9,4" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 9, fontWeight: 500, color: '#1D9E75' }}>
              Guaranteed fit · {product.fitmentConfidence ?? 'Exact fit'}
            </span>
          </span>

          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#6A6860' }}>From ${suppliers[0]?.price ?? '—'}</span>
            <span style={{ fontSize: 11, color: '#6A6860' }}>{suppliers.length} suppliers</span>
          </div>
        </div>
      </div>

      {/* C — Sort pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 20px 0', scrollbarWidth: 'none' }}>
        {SORT_PILLS.map(({ id, label }) => {
          const active = sortMode === id
          return (
            <button
              key={id}
              onClick={() => setSortMode(id)}
              style={{
                flexShrink: 0, borderRadius: 20, padding: '6px 13px',
                fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
                border: active ? '1px solid rgba(28,105,212,0.22)' : '1px solid rgba(255,255,255,0.07)',
                backgroundColor: active ? 'rgba(28,105,212,0.1)' : '#141414',
                color: active ? '#1C69D4' : '#5A5852',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* D — Supplier cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 20px 0' }}>
        {suppliers.map((supplier, i) =>
          i === 0 ? (
            <BestPriceCard key={supplier.vendorName} supplier={supplier} savings={savings} />
          ) : (
            <StandardSupplierCard key={supplier.vendorName} supplier={supplier} />
          )
        )}
      </div>

      {/* E — Affiliate disclosure */}
      <p style={{
        textAlign: 'center', fontSize: 10, color: '#3A3830',
        padding: '24px 20px 0', margin: 0, lineHeight: 1.5,
      }}>
        We may earn a commission on purchases made through links on this page. This doesn&apos;t affect the price you pay.
      </p>

    </div>
  )
}
