'use client'

import { useMemo, useState } from 'react'
import type { MotorcycleTyreSize } from '@/lib/garage/tyres'
import { garageEyebrowStyle } from './GarageLayout'

// ── Category hint display labels ──────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  'adventure-cruiser-front-offroad-rear': 'Adventure / Cruiser',
  'adventure-offroad-front-cruiser':      'Adventure / Off-road',
  'cruiser-scooter-rear':                 'Cruiser / Scooter',
  'custom-cruiser-big-wheel':             'Custom / Cruiser (Big Wheel)',
  'road-cruiser-offroad-rear':            'Road / Cruiser',
  'road-custom':                          'Road / Custom',
  'scooter-cruiser-small-road':           'Scooter / Cruiser',
  'scooter-mini-moto':                    'Scooter / Mini-moto',
  'sport-road-supermoto':                 'Sport / Road / Supermoto',
  'supermoto-race':                       'Supermoto / Race',
}

const CONSTRUCTION_LABELS: Record<string, string> = {
  'B':                'Bias (B)',
  'bias/unspecified': 'Bias / Unspecified',
  'R':                'Radial (R)',
  'ZR':               'Radial Sport (ZR)',
}

function categoryLabel(hint: string | null): string {
  if (!hint) return hint ?? ''
  return CATEGORY_LABELS[hint] ?? hint
}

function constructionLabel(c: string | null): string {
  if (!c) return c ?? ''
  return CONSTRUCTION_LABELS[c] ?? c
}

// ── Shared select style ───────────────────────────────────────────────────────

const fieldSelectStyle: React.CSSProperties = {
  minHeight: 36,
  padding: '7px 10px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  fontSize: 12,
  color: '#111827',
  width: '100%',
  outline: 'none',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
}

const disabledSelectStyle: React.CSSProperties = {
  ...fieldSelectStyle,
  background: '#f3f4f6',
  color: '#9ca3af',
}

// ── Props ─────────────────────────────────────────────────────────────────────

type GarageTyreSelectorProps = {
  tyreSizes: MotorcycleTyreSize[]
  selectedFrontTyreSizeId?: string | null
  selectedRearTyreSizeId?: string | null
  onSelectFrontTyreSize?: (id: string | null) => void
  onSelectRearTyreSize?: (id: string | null) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GarageTyreSelector({
  tyreSizes,
  selectedFrontTyreSizeId,
  selectedRearTyreSizeId,
  onSelectFrontTyreSize,
  onSelectRearTyreSize,
}: GarageTyreSelectorProps) {
  const [search,       setSearch]       = useState('')
  const [rimFilter,    setRimFilter]    = useState('')
  const [catFilter,    setCatFilter]    = useState('')
  const [consFilter,   setConsFilter]   = useState('')

  // ── Derive distinct filter options from full list ──────────────────────────

  const rimOptions = useMemo(() => {
    const seen = new Set<number>()
    for (const t of tyreSizes) {
      if (t.rim_diameter_in !== null) seen.add(t.rim_diameter_in)
    }
    return [...seen].sort((a, b) => a - b)
  }, [tyreSizes])

  const catOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const t of tyreSizes) {
      if (t.primary_category_hint) seen.add(t.primary_category_hint)
    }
    return [...seen].sort()
  }, [tyreSizes])

  const consOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const t of tyreSizes) {
      if (t.construction) seen.add(t.construction)
    }
    return [...seen].sort()
  }, [tyreSizes])

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tyreSizes.filter(t => {
      if (rimFilter && String(t.rim_diameter_in) !== rimFilter) return false
      if (catFilter && t.primary_category_hint !== catFilter) return false
      if (consFilter && t.construction !== consFilter) return false
      if (q) {
        const label = (t.size_label ?? '').toLowerCase()
        const norm  = (t.normalized_size ?? '').toLowerCase()
        if (!label.includes(q) && !norm.includes(q)) return false
      }
      return true
    })
  }, [tyreSizes, search, rimFilter, catFilter, consFilter])

  // ── Selected size details ──────────────────────────────────────────────────

  const frontSize = tyreSizes.find(t => t.tyre_size_id === selectedFrontTyreSizeId) ?? null
  const rearSize  = tyreSizes.find(t => t.tyre_size_id === selectedRearTyreSizeId)  ?? null

  // ── Empty state ────────────────────────────────────────────────────────────

  if (tyreSizes.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 20,
          padding: 18,
          border: '1px solid rgba(226,232,240,0.95)',
          boxShadow: '0 10px 22px rgba(15,23,42,0.05)',
        }}
      >
        <div style={{ ...garageEyebrowStyle, marginBottom: 6 }}>Tyre sizes</div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          Tyre size data is not available at the moment. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 20,
        padding: 16,
        border: '1px solid rgba(226,232,240,0.95)',
        boxShadow: '0 10px 22px rgba(15,23,42,0.05)',
        display: 'grid',
        gap: 14,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <div style={{ ...garageEyebrowStyle, marginBottom: 4 }}>Tyre sizes</div>
        <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.1, color: '#0f172a', fontWeight: 800 }}>
          Tyre size reference guide
        </h3>
        <p style={{ margin: '5px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.45, maxWidth: 640 }}>
          Browse {tyreSizes.length} tyre sizes from our reference library. Use the filters to narrow the list,
          then select a front and rear size for your build planning.
        </p>
      </div>

      {/* ── Search + filters ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))',
          gap: 8,
          alignItems: 'end',
        }}
      >
        {/* Search */}
        <div style={{ display: 'grid', gap: 4 }}>
          <label style={{ ...garageEyebrowStyle }}>Search size</label>
          <div style={{ position: 'relative' }}>
            <svg
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="e.g. 120/70 or 190/55"
              style={{
                ...fieldSelectStyle,
                paddingLeft: 30,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Rim diameter */}
        <div style={{ display: 'grid', gap: 4 }}>
          <label style={{ ...garageEyebrowStyle }}>Rim diameter</label>
          <select
            value={rimFilter}
            onChange={e => setRimFilter(e.target.value)}
            style={fieldSelectStyle}
          >
            <option value="">All rims</option>
            {rimOptions.map(r => (
              <option key={r} value={String(r)}>{r}&quot;</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div style={{ display: 'grid', gap: 4 }}>
          <label style={{ ...garageEyebrowStyle }}>Category</label>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            style={fieldSelectStyle}
          >
            <option value="">All categories</option>
            {catOptions.map(c => (
              <option key={c} value={c}>{categoryLabel(c)}</option>
            ))}
          </select>
        </div>

        {/* Construction */}
        <div style={{ display: 'grid', gap: 4 }}>
          <label style={{ ...garageEyebrowStyle }}>Construction</label>
          <select
            value={consFilter}
            onChange={e => setConsFilter(e.target.value)}
            style={fieldSelectStyle}
          >
            <option value="">All types</option>
            {consOptions.map(c => (
              <option key={c} value={c}>{constructionLabel(c)}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 && (
        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
          No tyre sizes match the current filters.{' '}
          <button
            type="button"
            onClick={() => { setSearch(''); setRimFilter(''); setCatFilter(''); setConsFilter('') }}
            style={{ background: 'none', border: 'none', padding: 0, color: '#3b82f6', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
          >
            Clear filters
          </button>
        </p>
      )}

      {/* ── Front / rear dropdowns ───────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        {/* Front */}
        <div
          style={{
            padding: 12,
            borderRadius: 16,
            border: frontSize ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
            background: frontSize
              ? 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <div style={{ ...garageEyebrowStyle, marginBottom: 6 }}>Front tyre</div>
          <select
            value={selectedFrontTyreSizeId ?? ''}
            onChange={e => onSelectFrontTyreSize?.(e.target.value || null)}
            style={filtered.length === 0 ? disabledSelectStyle : fieldSelectStyle}
            disabled={filtered.length === 0}
          >
            <option value="">Select front size</option>
            {filtered.map(t => (
              <option key={t.tyre_size_id} value={t.tyre_size_id}>
                {t.size_label}
                {t.construction && t.construction !== 'bias/unspecified'
                  ? ` · ${t.construction}`
                  : ''}
                {t.rim_diameter_in ? ` · ${t.rim_diameter_in}"` : ''}
              </option>
            ))}
          </select>
          {frontSize && (
            <div style={{ marginTop: 8, display: 'grid', gap: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{frontSize.size_label}</span>
              {frontSize.section_width_mm && (
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Width: {frontSize.section_width_mm}mm
                  {frontSize.aspect_ratio ? ` · Aspect: ${frontSize.aspect_ratio}%` : ''}
                </span>
              )}
              {frontSize.primary_category_hint && (
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {categoryLabel(frontSize.primary_category_hint)}
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelectFrontTyreSize?.(null)}
                style={{
                  marginTop: 4,
                  background: 'none', border: '1px solid #cbd5e1',
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 11, color: '#64748b', cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Rear */}
        <div
          style={{
            padding: 12,
            borderRadius: 16,
            border: rearSize ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
            background: rearSize
              ? 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <div style={{ ...garageEyebrowStyle, marginBottom: 6 }}>Rear tyre</div>
          <select
            value={selectedRearTyreSizeId ?? ''}
            onChange={e => onSelectRearTyreSize?.(e.target.value || null)}
            style={filtered.length === 0 ? disabledSelectStyle : fieldSelectStyle}
            disabled={filtered.length === 0}
          >
            <option value="">Select rear size</option>
            {filtered.map(t => (
              <option key={t.tyre_size_id} value={t.tyre_size_id}>
                {t.size_label}
                {t.construction && t.construction !== 'bias/unspecified'
                  ? ` · ${t.construction}`
                  : ''}
                {t.rim_diameter_in ? ` · ${t.rim_diameter_in}"` : ''}
              </option>
            ))}
          </select>
          {rearSize && (
            <div style={{ marginTop: 8, display: 'grid', gap: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{rearSize.size_label}</span>
              {rearSize.section_width_mm && (
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Width: {rearSize.section_width_mm}mm
                  {rearSize.aspect_ratio ? ` · Aspect: ${rearSize.aspect_ratio}%` : ''}
                </span>
              )}
              {rearSize.primary_category_hint && (
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {categoryLabel(rearSize.primary_category_hint)}
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelectRearTyreSize?.(null)}
                style={{
                  marginTop: 4,
                  background: 'none', border: '1px solid #cbd5e1',
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 11, color: '#64748b', cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Fitment disclaimer ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '10px 13px',
          borderRadius: 14,
          background: '#fffbeb',
          border: '1px solid #fde68a',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.2 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 11, color: '#92400e', lineHeight: 1.55 }}>
          <strong>Reference guide only.</strong>{' '}
          Tyre sizes shown here are a general reference. Actual fitment depends on your bike&apos;s
          OEM size, rim width, load index, speed rating, tube or tubeless requirement, tyre clearance,
          and front/rear pairing. Always consult your owner&apos;s manual and a qualified tyre fitter
          before purchasing.
        </p>
      </div>

      {/* ── Result count ────────────────────────────────────────────────── */}
      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
        Showing {filtered.length} of {tyreSizes.length} sizes
        {(search || rimFilter || catFilter || consFilter) && (
          <>
            {' · '}
            <button
              type="button"
              onClick={() => { setSearch(''); setRimFilter(''); setCatFilter(''); setConsFilter('') }}
              style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              Clear all filters
            </button>
          </>
        )}
      </p>
    </div>
  )
}
