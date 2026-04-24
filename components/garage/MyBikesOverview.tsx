'use client'

import { useRouter } from 'next/navigation'
import type { GarageBikeRecord, GarageBuildItem, GarageBuildRecord } from '@/types/garage'

// Same demo state mapping used in GarageScreen — replace with item.state once type is extended
function getDemoItemState(item: GarageBuildItem): 'fitted' | 'wishlist' | 'moved_on' {
  const n = item.productId % 3
  if (n === 0) return 'moved_on'
  if (n === 1) return 'wishlist'
  return 'fitted'
}

function getBikeSummary(bike: GarageBikeRecord): { fitted: number; wishlist: number } {
  const items = bike.builds.flatMap((b) => b.buildItems)
  return {
    fitted:   items.filter((i) => getDemoItemState(i) === 'fitted').length,
    wishlist: items.filter((i) => getDemoItemState(i) === 'wishlist').length,
  }
}

function getPreferredBuild(bike: GarageBikeRecord): GarageBuildRecord | null {
  return bike.builds.find((b) => b.isPrimary) ?? bike.builds[0] ?? null
}

type Props = {
  bikes: GarageBikeRecord[]
  onSelectBike: (bike: GarageBikeRecord, build: GarageBuildRecord | null) => void
  activeBikeId?: string | null
}

export function MyBikesOverview({ bikes, onSelectBike, activeBikeId }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-8">
      {/* Heading */}
      <div className="flex items-center gap-2">
        <span
          style={{
            display: 'inline-block', width: 3, height: 14,
            backgroundColor: '#E8841A', borderRadius: 2, flexShrink: 0,
          }}
        />
        <span
          className="uppercase tracking-[0.05em] text-[#F5F3EE]"
          style={{ fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 12 }}
        >
          My Bikes
        </span>
        <span style={{ fontSize: 11, color: '#44423E' }}>{bikes.length}</span>
      </div>

      {/* Bike cards */}
      {bikes.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-[12px] py-10 px-5 text-center"
          style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p style={{ fontSize: 13, color: '#6A6860' }}>No bikes saved yet. Add your first bike below.</p>
        </div>
      ) : (
        bikes.map((bike) => {
          const bikeName = [bike.year, bike.make, bike.model, bike.variant].filter(Boolean).join(' ')
          const build = getPreferredBuild(bike)
          const { fitted, wishlist } = getBikeSummary(bike)

          return (
            <button
              key={bike.id}
              onClick={() => onSelectBike(bike, build)}
              className="w-full text-left flex gap-3 items-start rounded-[12px] p-[13px]"
              style={{
                backgroundColor: '#141414',
                border: bike.id === activeBikeId
                  ? '1px solid rgba(232,132,26,0.35)'
                  : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
              }}
            >
              {/* Photo */}
              {(() => {
                const photoUrl = bike.image ?? bike.photos?.[0]?.imageUrl ?? null
                return photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={bike.model}
                    className="flex-shrink-0"
                    style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', objectPosition: 'center' }}
                  />
                ) : (
                  <div
                    className="flex flex-col items-center justify-center gap-1 flex-shrink-0"
                    style={{ width: 56, height: 56, border: '1.5px dashed rgba(255,255,255,0.1)', borderRadius: 10, backgroundColor: '#1A1814' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                )
              })()}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[#F5F3EE] font-semibold leading-tight truncate" style={{ fontSize: 13 }}>
                  {bikeName}
                </p>
                {bike.nickname && (
                  <p style={{ fontSize: 11, color: '#6A6860', marginTop: 2 }}>{bike.nickname}</p>
                )}

                {/* Accessory summary pills */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{ backgroundColor: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.18)' }}
                  >
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#1D9E75', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 500, color: '#1D9E75' }}>{fitted} fitted</span>
                  </span>
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{ backgroundColor: 'rgba(136,135,128,0.08)', border: '1px solid rgba(136,135,128,0.18)' }}
                  >
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', border: '1.5px solid #888780', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 500, color: '#888780' }}>{wishlist} wish list</span>
                  </span>
                </div>
              </div>

              {/* Chevron */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#44423E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 self-center">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )
        })
      )}

      {/* Add a bike */}
      <button
        onClick={() => router.push('/garage/build')}
        className="w-full text-center"
        style={{
          border: '1.5px dashed rgba(232,132,26,0.3)',
          borderRadius: 10,
          padding: '13px 14px',
          fontSize: 12,
          fontWeight: 500,
          color: 'rgba(232,132,26,0.6)',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        }}
      >
        + Add a bike
      </button>
    </div>
  )
}
