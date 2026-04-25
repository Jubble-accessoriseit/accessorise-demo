'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GarageBikeRecord, GarageBuildItem, GarageBuildRecord } from '@/types/garage'
import { garageCategories } from '@/types/garage'
import { formatGaragePriceDisplay } from '@/lib/garage/price-display'

type GarageItemStatus = 'wishlist' | 'bought' | 'removed'
type GarageItemCondition = 'New' | 'Used'

type GarageItemRecord = {
  status: GarageItemStatus
  currentlyOnBike: boolean
  purchasePrice: string
  purchaseDate: string
  supplier: string
  installedDate: string
  removedDate: string
  condition: GarageItemCondition
  notes: string
}

type GarageScreenProps = {
  bikes: GarageBikeRecord[]
  selectedBike: GarageBikeRecord | null
  selectedBuild: GarageBuildRecord | null
  onSwitchBike: () => void
  onDeleteBike?: () => void
  onDeleteBuild?: () => void
  onSwitchBikeTo?: (bike: GarageBikeRecord) => void
}

const BROWSE_BIKE_KEY = 'browse_bike_selection_v2'
const EXPERT_BIKE_CONTEXT_KEY = 'expert_bike_context_v1'
const GARAGE_RETURN_KEY = 'garage_return_context_v1'
const GARAGE_ITEM_RECORD_KEY = 'garage_item_records_v1'

function getBikeTitle(bike: GarageBikeRecord) {
  return [bike.year, bike.make, bike.model, bike.variant].filter(Boolean).join(' ')
}

function getBikeName(bike: GarageBikeRecord) {
  return bike.nickname ?? bike.garageBikeName ?? getBikeTitle(bike)
}

function getCategoryLabel(categoryId: string) {
  return garageCategories.find((category) => category.id === categoryId)?.label ?? categoryId
}

function getDefaultStatus(item: GarageBuildItem): GarageItemStatus {
  const n = item.productId % 3
  if (n === 1) return 'wishlist'
  if (n === 0) return 'removed'
  return 'bought'
}

function getDefaultRecord(item: GarageBuildItem): GarageItemRecord {
  const status = getDefaultStatus(item)
  return {
    status,
    currentlyOnBike: status === 'bought',
    purchasePrice: item.product.price > 0 ? String(item.product.price) : '',
    purchaseDate: status === 'wishlist' ? '' : '2025-04-12',
    supplier: item.product.affiliateLinks?.[0]?.vendorName ?? item.product.brand,
    installedDate: status === 'bought' ? '2025-04-18' : '',
    removedDate: status === 'removed' ? '2026-02-05' : '',
    condition: 'New',
    notes: '',
  }
}

function statusLabel(status: GarageItemStatus, currentlyOnBike: boolean) {
  if (status === 'removed') return 'Previously fitted'
  if (currentlyOnBike) return 'Currently fitted'
  if (status === 'bought') return 'Bought'
  return 'Wish list'
}

function tyreFitmentForBike(bike: GarageBikeRecord) {
  const model = `${bike.make} ${bike.model}`.toLowerCase()
  if (model.includes('r1300gs') || model.includes('r1300gsa')) {
    return { front: '120/70 R19', rear: '170/60 R17' }
  }
  if (model.includes('tenere')) {
    return { front: '90/90 R21', rear: '150/70 R18' }
  }
  return { front: 'Front size not saved', rear: 'Rear size not saved' }
}

function getPhotos(bike: GarageBikeRecord) {
  const photos = bike.photos?.map((photo) => photo.imageUrl) ?? []
  const hero = bike.heroImageUrl ?? bike.image ?? null
  return Array.from(new Set([hero, ...photos].filter((value): value is string => Boolean(value))))
}

function writeGarageReturnContext(input: {
  bike: GarageBikeRecord
  build: GarageBuildRecord | null
  itemId?: string | null
  photoIndex?: number
}) {
  sessionStorage.setItem(
    GARAGE_RETURN_KEY,
    JSON.stringify({
      bikeId: input.bike.id,
      buildId: input.build?.id ?? null,
      selectedItemId: input.itemId ?? null,
      selectedPhotoIndex: input.photoIndex ?? 0,
      scrollY: window.scrollY,
    }),
  )
}

function writeBikeContexts(bike: GarageBikeRecord) {
  const browseBike = {
    id: bike.sourceBikeId ?? bike.id,
    make: bike.make,
    model: bike.model,
    variant: bike.variant ?? null,
    year: bike.year,
    source: 'garage',
    userSelected: true,
  }

  sessionStorage.setItem(BROWSE_BIKE_KEY, JSON.stringify(browseBike))
  sessionStorage.setItem(
    EXPERT_BIKE_CONTEXT_KEY,
    JSON.stringify({
      make: bike.make,
      model: bike.model,
      variant: bike.variant ?? undefined,
      year: String(bike.year),
      image: bike.heroImageUrl ?? bike.image ?? undefined,
    }),
  )
}

function loadItemRecords() {
  try {
    const raw = sessionStorage.getItem(GARAGE_ITEM_RECORD_KEY)
    return raw ? (JSON.parse(raw) as Record<string, GarageItemRecord>) : {}
  } catch {
    return {}
  }
}

function saveItemRecords(records: Record<string, GarageItemRecord>) {
  sessionStorage.setItem(GARAGE_ITEM_RECORD_KEY, JSON.stringify(records))
}

function formatStoredPrice(value: string, fallback: number) {
  const numeric = Number(String(value || fallback).replace(/[^0-9.]/g, ''))
  return formatGaragePriceDisplay(Number.isFinite(numeric) ? numeric : fallback)
}

export function GarageScreen({ bikes, selectedBike, selectedBuild, onSwitchBike }: GarageScreenProps) {
  const router = useRouter()
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [records, setRecords] = useState<Record<string, GarageItemRecord>>({})
  const [draftRecord, setDraftRecord] = useState<GarageItemRecord | null>(null)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    setRecords(loadItemRecords())
  }, [])

  useEffect(() => {
    if (!selectedBike) return
    try {
      const raw = sessionStorage.getItem(GARAGE_RETURN_KEY)
      const context = raw ? JSON.parse(raw) as {
        bikeId?: string
        selectedItemId?: string | null
        selectedPhotoIndex?: number
        scrollY?: number
      } : null
      if (!context || context.bikeId !== selectedBike.id) return
      setSelectedPhotoIndex(context.selectedPhotoIndex ?? 0)
      setSelectedItemId(context.selectedItemId ?? null)
      if (!context.selectedItemId) {
        window.setTimeout(() => window.scrollTo({ top: context.scrollY ?? 0 }), 80)
      }
    } catch {
      /* ignore invalid return context */
    }
  }, [selectedBike])

  const photos = useMemo(() => (selectedBike ? getPhotos(selectedBike) : []), [selectedBike])
  const heroPhoto = photos[selectedPhotoIndex] ?? null
  const items = selectedBuild?.buildItems ?? []
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null
  const selectedRecord = selectedItem
    ? records[selectedItem.id] ?? getDefaultRecord(selectedItem)
    : null

  useEffect(() => {
    if (!selectedItem) {
      setDraftRecord(null)
      return
    }
    setDraftRecord(records[selectedItem.id] ?? getDefaultRecord(selectedItem))
    setSaveMessage('')
  }, [records, selectedItem])

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const record = records[item.id] ?? getDefaultRecord(item)
        if (record.currentlyOnBike && record.status !== 'removed') acc.current++
        if (record.status === 'bought') acc.bought++
        if (record.status === 'wishlist') acc.wishlist++
        if (record.status === 'removed') acc.removed++
        return acc
      },
      { current: 0, bought: 0, wishlist: 0, removed: 0 },
    )
  }, [items, records])

  if (!selectedBike) {
    return (
      <main className="garage-detail">
        <section className="empty-card">No bike selected.</section>
        <style jsx>{styles}</style>
      </main>
    )
  }

  const currentBike = selectedBike
  const isPrimaryBike = bikes.find((bike) => bike.builds.some((build) => build.isPrimary))?.id === currentBike.id
  const tyreFitment = tyreFitmentForBike(currentBike)

  function openBrowse() {
    writeBikeContexts(currentBike)
    writeGarageReturnContext({ bike: currentBike, build: selectedBuild, photoIndex: selectedPhotoIndex })
    router.push('/browse?fromGarage=1')
  }

  function openCompare() {
    writeBikeContexts(currentBike)
    writeGarageReturnContext({ bike: currentBike, build: selectedBuild, photoIndex: selectedPhotoIndex })
    router.push('/expert?fromGarage=1')
  }

  function openItemDetail(item: GarageBuildItem) {
    writeGarageReturnContext({ bike: currentBike, build: selectedBuild, itemId: item.id, photoIndex: selectedPhotoIndex })
    setSelectedItemId(item.id)
  }

  function saveDetails() {
    if (!selectedItem || !draftRecord) return
    const next = { ...records, [selectedItem.id]: draftRecord }
    setRecords(next)
    saveItemRecords(next)
    setSaveMessage('Saved locally for this session. Persistent item fields need a database update.')
  }

  if (selectedItem && draftRecord && selectedRecord) {
    return (
      <main className="garage-detail item-detail">
        <button className="back-link" type="button" onClick={() => setSelectedItemId(null)}>Back to Garage build</button>

        <section className="item-hero card">
          <img src={selectedItem.product.image} alt="" />
          <div>
            <span className="category-pill">{getCategoryLabel(selectedItem.product.categoryId)}</span>
            <h1>{selectedItem.product.name}</h1>
            <p>{selectedItem.product.brand}</p>
            <strong>Fits {getBikeTitle(selectedBike)}</strong>
            {selectedItem.product.categoryId === 'tyres' ? (
              <small>Tyre reference: front {tyreFitment.front}, rear {tyreFitment.rear}</small>
            ) : null}
          </div>
        </section>

        <section className="action-row">
          <button
            type="button"
            onClick={() => {
              writeBikeContexts(currentBike)
              writeGarageReturnContext({
                bike: currentBike,
                build: selectedBuild,
                itemId: selectedItem.id,
                photoIndex: selectedPhotoIndex,
              })
              router.push('/browse?fromGarage=1')
            }}
          >
            View in Browse
          </button>
          <button type="button" className="secondary" onClick={openCompare}>Compare</button>
        </section>

        <section className="card form-card">
          <h2>Ownership details</h2>
          <div className="segmented">
            {(['wishlist', 'bought', 'removed'] as GarageItemStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                className={draftRecord.status === status ? 'active' : ''}
                onClick={() =>
                  setDraftRecord({
                    ...draftRecord,
                    status,
                    currentlyOnBike: status === 'removed' || status === 'wishlist' ? false : draftRecord.currentlyOnBike,
                  })
                }
              >
                {status === 'wishlist' ? 'Wish list' : status === 'bought' ? 'Bought' : 'Removed'}
              </button>
            ))}
          </div>

          <label className="toggle-row">
            <span>Currently on bike</span>
            <input
              type="checkbox"
              checked={draftRecord.currentlyOnBike}
              disabled={draftRecord.status !== 'bought'}
              onChange={(event) => setDraftRecord({ ...draftRecord, currentlyOnBike: event.target.checked })}
            />
          </label>

          <div className="field-grid">
            <label>Purchase price<input value={draftRecord.purchasePrice} onChange={(e) => setDraftRecord({ ...draftRecord, purchasePrice: e.target.value })} placeholder="A$1,689.00" /></label>
            <label>Purchase date<input type="date" value={draftRecord.purchaseDate} onChange={(e) => setDraftRecord({ ...draftRecord, purchaseDate: e.target.value })} /></label>
            <label>Supplier/store<input value={draftRecord.supplier} onChange={(e) => setDraftRecord({ ...draftRecord, supplier: e.target.value })} placeholder="Touratech Australia" /></label>
            <label>Installed date<input type="date" value={draftRecord.installedDate} onChange={(e) => setDraftRecord({ ...draftRecord, installedDate: e.target.value })} /></label>
            {draftRecord.status === 'removed' ? (
              <label>Removed date<input type="date" value={draftRecord.removedDate} onChange={(e) => setDraftRecord({ ...draftRecord, removedDate: e.target.value })} /></label>
            ) : null}
            <label>Condition<select value={draftRecord.condition} onChange={(e) => setDraftRecord({ ...draftRecord, condition: e.target.value as GarageItemCondition })}><option>New</option><option>Used</option></select></label>
          </div>

          <label>Notes<textarea maxLength={250} value={draftRecord.notes} onChange={(e) => setDraftRecord({ ...draftRecord, notes: e.target.value })} placeholder="Installation notes, fitment quirks, or supplier details." /></label>

          <div className="linked-status">
            <strong>Linked build status</strong>
            <span>{draftRecord.status === 'removed' ? 'Previously used' : draftRecord.currentlyOnBike ? 'Active in current build' : 'Not currently fitted'}</span>
          </div>
        </section>

        <section className="card lifecycle">
          <h2>Lifecycle history</h2>
          {[
            ['Wish list', selectedItem.createdAt?.slice(0, 10) ?? '-'],
            ['Bought', draftRecord.purchaseDate || '-'],
            ['Installed', draftRecord.installedDate || '-'],
            ['Removed', draftRecord.removedDate || '-'],
          ].map(([label, date]) => (
            <div key={label} className={date === '-' ? 'inactive' : ''}>
              <span />
              <strong>{label}</strong>
              <em>{date}</em>
            </div>
          ))}
        </section>

        <section className="action-row">
          <button type="button" onClick={saveDetails}>Save details</button>
          <button type="button" className="secondary" onClick={() => setSelectedItemId(null)}>Return to Garage</button>
        </section>
        {saveMessage ? <p className="save-message">{saveMessage}</p> : null}

        <style jsx>{styles}</style>
      </main>
    )
  }

  return (
    <main className="garage-detail">
      <button className="back-link" type="button" onClick={onSwitchBike}>Back to Garage</button>

      <section className="photo-card card">
        <div className="hero-photo">
          {heroPhoto ? <img src={heroPhoto} alt="" /> : <span>No bike photo yet</span>}
        </div>
        <div className="thumb-row">
          {photos.length > 0 ? photos.map((photo, index) => (
            <button key={photo} type="button" className={index === selectedPhotoIndex ? 'active' : ''} onClick={() => setSelectedPhotoIndex(index)}>
              <img src={photo} alt="" />
            </button>
          )) : <button type="button" className="placeholder-thumb">+</button>}
        </div>
      </section>

      <section className="identity-card card">
        <div>
          <p className="eyebrow">Garage bike</p>
          <h1>{getBikeName(selectedBike)}</h1>
          <span>{getBikeTitle(selectedBike)}</span>
        </div>
        {isPrimaryBike ? <span className="primary-badge">Primary bike</span> : null}
        <button type="button" className="icon-action">Edit bike info</button>
      </section>

      <section className="action-row">
        <button type="button" onClick={openBrowse}>Browse accessories</button>
        <button type="button" className="secondary" onClick={openCompare}>Compare builds</button>
      </section>

      <section className="card info-card">
        <h2>Bike information & fitment</h2>
        <div className="info-grid">
          <span><strong>Make</strong>{selectedBike.make}</span>
          <span><strong>Model</strong>{selectedBike.model}</span>
          <span><strong>Variant</strong>{selectedBike.variant ?? 'Base'}</span>
          <span><strong>Year</strong>{selectedBike.year}</span>
          <span><strong>Saved build</strong>{selectedBuild?.name ?? 'No active build'}</span>
        </div>
        <div className="tyre-card">
          <div>
            <strong>Tyre fitment reference</strong>
            <p>Confirmed sizes for exact tyre fitment.</p>
          </div>
          <span>Front tyre size: {tyreFitment.front}</span>
          <span>Rear tyre size: {tyreFitment.rear}</span>
          <button type="button">Edit tyre fitment</button>
        </div>
      </section>

      <section className="status-grid">
        <article className="current"><strong>{counts.current}</strong><span>Currently fitted</span></article>
        <article className="bought"><strong>{counts.bought}</strong><span>Bought</span></article>
        <article className="wishlist"><strong>{counts.wishlist}</strong><span>Wish list</span></article>
        <article className="removed"><strong>{counts.removed}</strong><span>Previously fitted</span></article>
      </section>

      <section className="card build-card">
        <div className="section-heading">
          <h2>Build items</h2>
          <span>{items.length} items</span>
        </div>
        {items.length === 0 ? (
          <p className="empty-copy">No accessories in this build yet.</p>
        ) : (
          <div className="item-list">
            {items.map((item) => {
              const record = records[item.id] ?? getDefaultRecord(item)
              const label = statusLabel(record.status, record.currentlyOnBike)
              return (
                <article key={item.id} id={`garage-item-${item.id}`} className="item-row">
                  <img src={item.product.image} alt="" />
                  <div>
                    <h3>{item.product.name}</h3>
                    <p>{item.product.brand}</p>
                    <small>{record.purchaseDate ? `${record.purchaseDate} · ${formatStoredPrice(record.purchasePrice, item.product.price || 0)}` : record.status === 'removed' ? `Removed ${record.removedDate || '-'}` : 'Purchase details not saved'}</small>
                  </div>
                  <span className={`status-pill ${record.status} ${record.currentlyOnBike ? 'current' : ''}`}>{label}</span>
                  <button type="button" onClick={() => openItemDetail(item)}>View details</button>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <style jsx>{styles}</style>
    </main>
  )
}

const styles = `
  .garage-detail {
    min-height: 100vh;
    background: #0d0d0d;
    color: #f5f3ee;
    padding: 16px 16px 42px;
    display: grid;
    gap: 14px;
  }

  .card {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    box-shadow: 0 18px 46px rgba(0,0,0,0.25);
  }

  .back-link {
    justify-self: start;
    border: 0;
    background: transparent;
    color: #e8841a;
    font-weight: 900;
    cursor: pointer;
    padding: 4px 0;
  }

  h1, h2, h3, p {
    margin: 0;
  }

  .photo-card {
    padding: 12px;
    display: grid;
    gap: 10px;
  }

  .hero-photo {
    min-height: 270px;
    border-radius: 16px;
    overflow: hidden;
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.07);
    display: grid;
    place-items: center;
    color: #7a7268;
  }

  .hero-photo img,
  .thumb-row img,
  .item-row img,
  .item-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
  }

  .thumb-row button {
    width: 62px;
    height: 48px;
    border-radius: 12px;
    padding: 0;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);
    background: #1a1a1a;
    flex: 0 0 auto;
    cursor: pointer;
  }

  .thumb-row button.active {
    border-color: #e8841a;
  }

  .identity-card {
    padding: 16px;
    display: grid;
    gap: 12px;
  }

  .eyebrow {
    color: #e8841a;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .identity-card h1 {
    margin-top: 4px;
    font-size: 1.65rem;
    line-height: 1;
  }

  .identity-card span,
  .empty-copy {
    color: #b8afa6;
  }

  .primary-badge,
  .category-pill {
    width: fit-content;
    border-radius: 999px;
    padding: 6px 9px;
    background: rgba(232,132,26,0.15);
    border: 1px solid rgba(232,132,26,0.32);
    color: #e8841a;
    font-size: 0.7rem;
    font-weight: 900;
  }

  .icon-action {
    width: fit-content;
    border: 1px solid rgba(255,255,255,0.1);
    background: #1a1a1a;
    color: #f5f3ee;
  }

  .action-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  button {
    min-height: 46px;
    border-radius: 14px;
    border: 0;
    background: #e8841a;
    color: #17110b;
    font-weight: 950;
    cursor: pointer;
  }

  button.secondary,
  .action-row .secondary {
    background: #1a1a1a;
    color: #f5f3ee;
    border: 1px solid rgba(255,255,255,0.12);
  }

  .info-card,
  .build-card,
  .form-card,
  .lifecycle {
    padding: 16px;
    display: grid;
    gap: 14px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .info-grid span,
  .tyre-card,
  .linked-status {
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 11px;
    color: #b8afa6;
    display: grid;
    gap: 4px;
  }

  .info-grid strong,
  .tyre-card strong,
  .linked-status strong {
    color: #f5f3ee;
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tyre-card p {
    color: #7a7268;
    font-size: 0.82rem;
  }

  .tyre-card button {
    margin-top: 6px;
    background: transparent;
    border: 1px solid rgba(232,132,26,0.34);
    color: #e8841a;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .status-grid article {
    background: #141414;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 13px;
    display: grid;
    gap: 4px;
  }

  .status-grid strong {
    font-size: 1.45rem;
  }

  .status-grid span {
    color: #b8afa6;
    font-size: 0.78rem;
    font-weight: 800;
  }

  .current strong { color: #72d69a; }
  .bought strong, .wishlist strong { color: #e8841a; }
  .removed strong { color: #8f887f; }

  .section-heading {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
  }

  .section-heading span {
    color: #7a7268;
    font-size: 0.8rem;
  }

  .item-list {
    display: grid;
    gap: 10px;
  }

  .item-row {
    display: grid;
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    padding: 10px;
    border-radius: 16px;
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.07);
  }

  .item-row img {
    width: 54px;
    height: 54px;
    border-radius: 13px;
  }

  .item-row h3 {
    font-size: 0.95rem;
    line-height: 1.2;
  }

  .item-row p,
  .item-row small {
    display: block;
    margin-top: 3px;
    color: #8f887f;
    font-size: 0.76rem;
  }

  .item-row button {
    grid-column: 1 / -1;
    background: transparent;
    color: #e8841a;
    border: 1px solid rgba(232,132,26,0.28);
  }

  .status-pill {
    width: fit-content;
    border-radius: 999px;
    padding: 6px 9px;
    font-size: 0.72rem;
    font-weight: 900;
    color: #f5f3ee;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .status-pill.current { color: #72d69a; background: rgba(114,214,154,0.13); }
  .status-pill.bought { color: #e8841a; background: rgba(232,132,26,0.13); }
  .status-pill.wishlist { color: #e8841a; background: rgba(232,132,26,0.08); }
  .status-pill.removed { color: #b8afa6; background: rgba(255,255,255,0.06); }

  .item-hero {
    padding: 14px;
    display: grid;
    gap: 14px;
  }

  .item-hero img {
    height: 220px;
    border-radius: 16px;
    background: #1a1a1a;
  }

  .item-hero h1 {
    margin-top: 10px;
    font-size: 1.55rem;
    line-height: 1.05;
  }

  .item-hero p,
  .item-hero small,
  .item-hero strong {
    display: block;
    margin-top: 5px;
    color: #b8afa6;
  }

  .segmented {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
    padding: 5px;
    border-radius: 15px;
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.07);
  }

  .segmented button {
    min-height: 40px;
    background: transparent;
    border: 0;
    color: #b8afa6;
  }

  .segmented button.active {
    background: #e8841a;
    color: #17110b;
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 12px;
    border-radius: 14px;
    background: #1a1a1a;
  }

  .toggle-row input {
    width: 22px;
    height: 22px;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  label {
    display: grid;
    gap: 7px;
    color: #b8afa6;
    font-size: 0.78rem;
    font-weight: 800;
  }

  input,
  select,
  textarea {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    border-radius: 13px;
    border: 1px solid rgba(255,255,255,0.1);
    background: #1a1a1a;
    color: #f5f3ee;
    padding: 11px;
    font: inherit;
  }

  textarea {
    min-height: 96px;
    resize: vertical;
  }

  .lifecycle div {
    display: grid;
    grid-template-columns: 18px 1fr auto;
    gap: 10px;
    align-items: center;
    color: #f5f3ee;
  }

  .lifecycle div span {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: #e8841a;
  }

  .lifecycle div.inactive {
    color: #6a6860;
  }

  .lifecycle div.inactive span {
    background: #3a3830;
  }

  .lifecycle em {
    color: #8f887f;
    font-style: normal;
    font-size: 0.78rem;
  }

  .save-message {
    text-align: center;
    color: #72d69a;
    font-size: 0.82rem;
  }

  @media (min-width: 760px) {
    .garage-detail {
      width: min(1040px, 100%);
      margin: 0 auto;
      padding: 28px 24px 54px;
    }

    .item-row {
      grid-template-columns: 64px minmax(0, 1fr) auto auto;
    }

    .item-row button {
      grid-column: auto;
      min-width: 120px;
    }

    .item-row img {
      width: 64px;
      height: 64px;
    }

    .item-hero {
      grid-template-columns: 280px 1fr;
      align-items: center;
    }

    .item-hero img {
      height: 260px;
    }

    .identity-card {
      grid-template-columns: 1fr auto auto;
      align-items: center;
    }
  }

  @media (max-width: 430px) {
    .field-grid,
    .info-grid,
    .action-row {
      grid-template-columns: 1fr;
    }
  }
`
