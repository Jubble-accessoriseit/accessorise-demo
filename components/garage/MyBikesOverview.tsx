'use client'

import { useRouter } from 'next/navigation'
import type { GarageBikeRecord, GarageBuildRecord } from '@/types/garage'

function getPreferredBuild(bike: GarageBikeRecord): GarageBuildRecord | null {
  return bike.builds.find((build) => build.isPrimary) ?? bike.builds[0] ?? null
}

function getBikeTitle(bike: GarageBikeRecord) {
  return [bike.year, bike.make, bike.model, bike.variant].filter(Boolean).join(' ')
}

function getBikeName(bike: GarageBikeRecord) {
  return bike.nickname ?? bike.garageBikeName ?? getBikeTitle(bike)
}

function getPhotoUrl(bike: GarageBikeRecord) {
  return bike.heroImageUrl ?? bike.image ?? bike.photos?.find((photo) => photo.isCover)?.imageUrl ?? bike.photos?.[0]?.imageUrl ?? null
}

function getAccessoryCount(bike: GarageBikeRecord) {
  return bike.builds.reduce((total, build) => total + build.buildItems.length, 0)
}

function getLastUpdated(bike: GarageBikeRecord) {
  const dates = bike.builds.map((build) => build.updatedAt).filter(Boolean)
  const latest = dates.sort().at(-1)
  if (!latest) return 'updated recently'

  const diff = Date.now() - new Date(latest).getTime()
  const days = Math.max(0, Math.floor(diff / 86_400_000))
  if (days === 0) return 'updated today'
  if (days === 1) return 'updated yesterday'
  return `updated ${days} days ago`
}

type Props = {
  bikes: GarageBikeRecord[]
  onSelectBike: (bike: GarageBikeRecord, build: GarageBuildRecord | null) => void
  activeBikeId?: string | null
}

export function MyBikesOverview({ bikes, onSelectBike, activeBikeId }: Props) {
  const router = useRouter()
  const primaryBikeId = bikes.find((bike) => bike.builds.some((build) => build.isPrimary))?.id ?? bikes[0]?.id ?? null

  return (
    <main className="garage-overview">
      <section className="overview-header">
        <p>Garage</p>
        <h1>My bikes</h1>
        <span>{bikes.length} saved {bikes.length === 1 ? 'bike' : 'bikes'}</span>
      </section>

      {bikes.length === 0 ? (
        <section className="empty-card">
          <h2>No bikes saved yet</h2>
          <p>Add your first bike to start tracking builds, photos, accessories, and fitment.</p>
          <button type="button" onClick={() => router.push('/garage/build')}>Add a bike</button>
        </section>
      ) : (
        <section className="bike-list" aria-label="Saved bikes">
          {bikes.map((bike) => {
            const build = getPreferredBuild(bike)
            const photoUrl = getPhotoUrl(bike)
            const isPrimary = bike.id === primaryBikeId

            return (
              <article key={bike.id} className={bike.id === activeBikeId ? 'bike-card active' : 'bike-card'}>
                <div className="bike-photo">
                  {photoUrl ? <img src={photoUrl} alt="" /> : <span>Bike photo</span>}
                </div>
                <div className="bike-copy">
                  <div className="title-row">
                    <div>
                      <h2>{getBikeName(bike)}</h2>
                      <p>{getBikeTitle(bike)}</p>
                    </div>
                    {isPrimary ? <span className="primary-badge">Primary bike</span> : null}
                  </div>

                  <div className="fact-grid">
                    <span>{bike.builds.length} saved {bike.builds.length === 1 ? 'build' : 'builds'}</span>
                    <span>{getAccessoryCount(bike)} accessories</span>
                    <span>{bike.photoCount ?? bike.photos?.length ?? 0} photos</span>
                    <span>{getLastUpdated(bike)}</span>
                  </div>

                  <button type="button" onClick={() => onSelectBike(bike, build)}>
                    View details
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <button type="button" className="add-bike" onClick={() => router.push('/garage/build')}>
        Add a bike
      </button>

      <style jsx>{`
        .garage-overview {
          min-height: 100vh;
          background: #0d0d0d;
          color: #f5f3ee;
          padding: 18px 16px 42px;
          display: grid;
          gap: 16px;
        }

        .overview-header {
          display: grid;
          gap: 4px;
        }

        .overview-header p {
          margin: 0;
          color: #e8841a;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .overview-header h1,
        .empty-card h2,
        .bike-card h2 {
          margin: 0;
        }

        .overview-header h1 {
          font-size: 2rem;
          line-height: 1;
        }

        .overview-header span,
        .empty-card p,
        .bike-card p {
          color: #b8afa6;
        }

        .bike-list {
          display: grid;
          gap: 12px;
        }

        .bike-card,
        .empty-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          box-shadow: 0 18px 46px rgba(0,0,0,0.28);
        }

        .bike-card {
          min-height: 218px;
          display: grid;
          grid-template-columns: 118px minmax(0, 1fr);
          gap: 13px;
          padding: 12px;
        }

        .bike-card.active {
          border-color: rgba(232,132,26,0.38);
        }

        .bike-photo {
          min-height: 194px;
          border-radius: 16px;
          overflow: hidden;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.07);
          display: grid;
          place-items: center;
          color: #6a6860;
          font-size: 0.78rem;
          text-align: center;
        }

        .bike-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .bike-copy {
          min-width: 0;
          display: grid;
          gap: 12px;
          align-content: space-between;
        }

        .title-row {
          display: grid;
          gap: 8px;
        }

        .bike-card h2 {
          font-size: 1.15rem;
          line-height: 1.1;
        }

        .bike-card p {
          margin: 4px 0 0;
          font-size: 0.82rem;
          line-height: 1.35;
        }

        .primary-badge {
          width: fit-content;
          border-radius: 999px;
          padding: 6px 9px;
          background: rgba(232,132,26,0.15);
          border: 1px solid rgba(232,132,26,0.32);
          color: #e8841a;
          font-size: 0.68rem;
          font-weight: 900;
        }

        .fact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .fact-grid span {
          border-radius: 11px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.06);
          color: #b8afa6;
          padding: 8px;
          font-size: 0.72rem;
          font-weight: 800;
        }

        button {
          min-height: 44px;
          border-radius: 14px;
          border: 0;
          background: #e8841a;
          color: #17110b;
          font-weight: 950;
          cursor: pointer;
        }

        .add-bike {
          border: 1px dashed rgba(232,132,26,0.38);
          background: transparent;
          color: #e8841a;
        }

        .empty-card {
          padding: 24px 18px;
          display: grid;
          gap: 12px;
          text-align: center;
        }

        @media (min-width: 760px) {
          .garage-overview {
            width: min(1040px, 100%);
            margin: 0 auto;
            padding: 28px 24px 54px;
          }

          .bike-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 430px) {
          .bike-card {
            grid-template-columns: 1fr;
          }

          .bike-photo {
            min-height: 190px;
          }
        }
      `}</style>
    </main>
  )
}
