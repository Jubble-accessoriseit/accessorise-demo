'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { demoExpertBuildCatalog } from '@/lib/demo-content/expert-builds';
import { supabase } from '@/lib/supabase';
import type { ExpertBuild } from '@/lib/expert-builds/types';

type SelectedBike = {
  make: string;
  model: string;
  variant?: string;
  year?: string;
  image?: string;
};

type ClassificationFilter = 'all' | 'touring' | 'adventure' | 'enduro' | 'expedition';
type SortMode = 'most-liked' | 'newest' | 'az';

const BROWSE_BIKE_KEY = 'browse_bike_selection_v2';
const EXPERT_LIKES_KEY = 'expert_build_likes_v1';

const classificationFilters: Array<{ id: ClassificationFilter; label: string }> = [
  { id: 'all', label: 'All builds' },
  { id: 'touring', label: 'Touring' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'enduro', label: 'Enduro' },
  { id: 'expedition', label: 'Expedition' },
];

function normalize(value?: string | null) {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildMatchesBike(build: ExpertBuild, bike: SelectedBike | null) {
  if (!bike?.make || !bike.model) return true;

  return (
    normalize(build.bikeFitment.make) === normalize(bike.make) &&
    normalize(build.bikeFitment.model) === normalize(bike.model)
  );
}

function getBuildClassification(build: ExpertBuild): ClassificationFilter {
  const haystack = [
    build.dna?.ridingStyle,
    build.dna?.terrainFocus,
    ...(build.tags ?? []),
    build.title,
    build.summary,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (haystack.includes('enduro')) return 'enduro';
  if (haystack.includes('expedition') || haystack.includes('overland')) return 'expedition';
  if (haystack.includes('adventure')) return 'adventure';
  return 'touring';
}

function formatBikeTitle(bike: SelectedBike | null) {
  if (!bike) return '';
  return [bike.year, bike.make, bike.model, bike.variant].filter(Boolean).join(' ');
}

function formatFitment(build: ExpertBuild) {
  const years =
    build.bikeFitment.yearStart === build.bikeFitment.yearEnd
      ? String(build.bikeFitment.yearStart)
      : `${build.bikeFitment.yearStart}-${build.bikeFitment.yearEnd}`;

  return [years, build.bikeFitment.make, build.bikeFitment.model]
    .filter(Boolean)
    .join(' ');
}

function formatLikes(count: number) {
  if (count >= 1000) {
    const value = count / 1000;
    return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}k`;
  }

  return String(count);
}

function getBuildSearchText(build: ExpertBuild) {
  return [
    build.title,
    build.builderName,
    build.summary,
    build.description,
    build.bikeFitment.make,
    build.bikeFitment.model,
    build.dna?.ridingStyle,
    build.dna?.terrainFocus,
    ...(build.tags ?? []),
    ...build.accessories.map((item) => `${item.title} ${item.brand} ${item.categoryId}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function ExpertPage() {
  const router = useRouter();
  const [selectedBike, setSelectedBike] = useState<SelectedBike | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classification, setClassification] = useState<ClassificationFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('most-liked');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [likedBuildIds, setLikedBuildIds] = useState<string[]>([]);
  const [loginPromptBuild, setLoginPromptBuild] = useState<ExpertBuild | null>(null);

  useEffect(() => {
    const rawBike = sessionStorage.getItem(BROWSE_BIKE_KEY);
    if (rawBike) {
      try {
        setSelectedBike(JSON.parse(rawBike));
      } catch {
        sessionStorage.removeItem(BROWSE_BIKE_KEY);
      }
    }

    const rawLikes = localStorage.getItem(EXPERT_LIKES_KEY);
    if (rawLikes) {
      try {
        const parsed = JSON.parse(rawLikes);
        if (Array.isArray(parsed)) setLikedBuildIds(parsed.filter((id) => typeof id === 'string'));
      } catch {
        localStorage.removeItem(EXPERT_LIKES_KEY);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(Boolean(data.session));
    });
  }, []);

  const buildsWithLikes = useMemo(
    () =>
      demoExpertBuildCatalog
        .filter((build) => build.published)
        .map((build) => ({
          build,
          likeCount: (build.likeCount ?? 0) + (likedBuildIds.includes(build.id) ? 1 : 0),
          liked: likedBuildIds.includes(build.id),
          classification: getBuildClassification(build),
        })),
    [likedBuildIds],
  );

  const bikeMatchedBuilds = useMemo(
    () => buildsWithLikes.filter(({ build }) => buildMatchesBike(build, selectedBike)),
    [buildsWithLikes, selectedBike],
  );

  const filteredBuilds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = bikeMatchedBuilds.filter(({ build, classification: buildClassification }) => {
      const matchesSearch = !query || getBuildSearchText(build).includes(query);
      const matchesClassification = classification === 'all' || buildClassification === classification;
      return matchesSearch && matchesClassification;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'az') return a.build.title.localeCompare(b.build.title);
      if (sortMode === 'newest') return b.build.id.localeCompare(a.build.id);
      return b.likeCount - a.likeCount;
    });
  }, [bikeMatchedBuilds, classification, searchQuery, sortMode]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || classification !== 'all';
  const noBikeMatches = selectedBike && bikeMatchedBuilds.length === 0;

  function toggleLike(build: ExpertBuild) {
    if (!isLoggedIn) {
      setLoginPromptBuild(build);
      return;
    }

    setLikedBuildIds((current) => {
      const next = current.includes(build.id)
        ? current.filter((id) => id !== build.id)
        : [...current, build.id];
      localStorage.setItem(EXPERT_LIKES_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearFilters() {
    setSearchQuery('');
    setClassification('all');
    setSortMode('most-liked');
  }

  return (
    <main className="expert-page">
      <section className="expert-shell">
        <section className={`bike-context ${selectedBike ? 'selected' : 'empty'}`}>
          <div className="bike-thumb" aria-hidden="true">
            {selectedBike?.image ? <img src={selectedBike.image} alt="" /> : <span>EX</span>}
          </div>
          <div>
            <p className="eyebrow">Selected bike</p>
            {selectedBike ? (
              <>
                <h1>{formatBikeTitle(selectedBike)}</h1>
                <p>
                  {bikeMatchedBuilds.length} expert {bikeMatchedBuilds.length === 1 ? 'build' : 'builds'} for
                  your bike
                </p>
              </>
            ) : (
              <>
                <h1>Choose a bike to focus Expert Builds</h1>
                <p>Browse all expert builds now, or choose your bike for make and model matches.</p>
              </>
            )}
          </div>
          <button type="button" onClick={() => router.push('/browse')} className="change-bike">
            Change
          </button>
        </section>

        <section className="controls-panel">
          <label className="search-box">
            <span>Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search expert builds..."
            />
          </label>

          <div className="filter-row">
            <label>
              <span>Sort by likes</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                <option value="most-liked">Most liked</option>
                <option value="newest">Newest</option>
                <option value="az">A-Z</option>
              </select>
            </label>
          </div>

          <div className="classification-chips" aria-label="Classification filters">
            {classificationFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setClassification(filter.id)}
                className={classification === filter.id ? 'active' : ''}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <p className="sort-note">
            {sortMode === 'most-liked' ? 'Ordered by likes (highest first)' : 'Filtered builds update live'}
          </p>
        </section>

        {filteredBuilds.length > 0 ? (
          <section className="build-list" aria-label="Expert build list">
            {filteredBuilds.map(({ build, likeCount, liked, classification: buildClassification }) => (
              <article key={build.id} className="build-card">
                <div className="build-image">
                  <img src={build.primaryPhoto.imageUrl} alt={build.primaryPhoto.alt} />
                  <button
                    type="button"
                    onClick={() => toggleLike(build)}
                    className={`like-badge ${liked ? 'liked' : ''}`}
                    aria-label={liked ? `Unlike ${build.title}` : `Like ${build.title}`}
                  >
                    <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
                    <strong>{formatLikes(likeCount)}</strong>
                    <small>likes</small>
                  </button>
                </div>

                <div className="build-card-body">
                  <div className="build-title-row">
                    <div>
                      <p className="eyebrow">{build.builderName}</p>
                      <h2>{build.title}</h2>
                    </div>
                    <span className="classification-badge">{buildClassification}</span>
                  </div>

                  <p className="fitment-line">{formatFitment(build)}</p>
                  <p className="summary">{build.summary}</p>

                  <div className="build-meta">
                    <span>{build.accessories.length} accessories</span>
                    <span>{new Set(build.accessories.map((item) => item.categoryId)).size} categories</span>
                    <span>{formatLikes(likeCount)} likes</span>
                  </div>

                  <button type="button" className="compare-button" onClick={() => router.push(`/expert/${build.id}`)}>
                    Compare build
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="no-match-card">
            <div className="no-match-illustration" aria-hidden="true">
              <span />
            </div>
            <p className="eyebrow">Expert builds</p>
            <h2>{noBikeMatches ? 'No expert builds match this bike yet' : 'No expert builds match this filter yet'}</h2>
            <p>
              {noBikeMatches
                ? 'Try another bike or browse all expert builds.'
                : 'Try another classification or sort option. Liked builds can be sorted by popularity.'}
            </p>

            {hasActiveFilters ? (
              <div className="active-filter-summary">
                {searchQuery.trim() ? <span>Search: {searchQuery.trim()}</span> : null}
                <span>Classification: {classificationFilters.find((item) => item.id === classification)?.label}</span>
                <span>Sort: {sortMode === 'most-liked' ? 'Most liked' : sortMode === 'newest' ? 'Newest' : 'A-Z'}</span>
              </div>
            ) : null}

            <div className="empty-actions">
              <button type="button" onClick={clearFilters}>
                Clear all filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedBike(null);
                  clearFilters();
                }}
              >
                Show all
              </button>
            </div>
          </section>
        )}
      </section>

      {loginPromptBuild ? (
        <div className="modal-backdrop" role="presentation">
          <section className="signin-modal" role="dialog" aria-modal="true" aria-labelledby="signin-title">
            <h2 id="signin-title">Sign in to like expert builds.</h2>
            <p>{loginPromptBuild.title} will be waiting when you return.</p>
            <div>
              <button type="button" onClick={() => router.push('/login?returnTo=/expert')}>
                Sign in
              </button>
              <button type="button" onClick={() => setLoginPromptBuild(null)}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <style jsx>{`
        .expert-page {
          min-height: 100vh;
          background: #0d0d0d;
          color: #f5f3ee;
          padding-bottom: 48px;
        }

        .expert-shell {
          width: min(1080px, 100%);
          margin: 0 auto;
          padding: 18px 16px 32px;
          display: grid;
          gap: 16px;
        }

        .bike-context,
        .controls-panel,
        .build-card,
        .no-match-card {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
        }

        .bike-context {
          display: grid;
          grid-template-columns: 58px 1fr auto;
          align-items: center;
          gap: 14px;
          padding: 16px;
        }

        .bike-thumb {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          overflow: hidden;
          background: #1a1a1a;
          border: 1px solid rgba(232, 132, 26, 0.24);
          display: grid;
          place-items: center;
          color: #e8841a;
          font-weight: 900;
        }

        .bike-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .eyebrow {
          margin: 0 0 5px;
          color: #e8841a;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        h1,
        h2,
        p {
          margin: 0;
        }

        .bike-context h1 {
          font-size: clamp(1.18rem, 4vw, 1.8rem);
          line-height: 1.08;
        }

        .bike-context p:not(.eyebrow) {
          margin-top: 6px;
          color: #b8afa6;
          font-size: 0.9rem;
        }

        .change-bike {
          border: 1px solid rgba(232, 132, 26, 0.44);
          background: rgba(232, 132, 26, 0.12);
          color: #f5f3ee;
          border-radius: 999px;
          padding: 10px 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .controls-panel {
          padding: 16px;
          display: grid;
          gap: 14px;
        }

        label {
          display: grid;
          gap: 8px;
          color: #b8afa6;
          font-size: 0.78rem;
          font-weight: 800;
        }

        input,
        select {
          width: 100%;
          min-height: 48px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #1a1a1a;
          color: #f5f3ee;
          padding: 0 14px;
          font: inherit;
          outline: none;
        }

        input:focus,
        select:focus {
          border-color: rgba(232, 132, 26, 0.72);
          box-shadow: 0 0 0 3px rgba(232, 132, 26, 0.16);
        }

        .classification-chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .classification-chips button {
          flex: 0 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #1a1a1a;
          color: #b8afa6;
          border-radius: 999px;
          padding: 11px 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .classification-chips button.active {
          border-color: rgba(232, 132, 26, 0.62);
          background: rgba(232, 132, 26, 0.16);
          color: #f5f3ee;
        }

        .sort-note {
          color: #7a7268;
          font-size: 0.82rem;
        }

        .build-list {
          display: grid;
          gap: 14px;
        }

        .build-card {
          overflow: hidden;
        }

        .build-image {
          position: relative;
          aspect-ratio: 16 / 10;
          background: #1a1a1a;
        }

        .build-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .build-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(13, 13, 13, 0.12), rgba(13, 13, 13, 0.5));
          pointer-events: none;
        }

        .like-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(13, 13, 13, 0.82);
          color: #f5f3ee;
          border-radius: 999px;
          padding: 8px 10px;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        .like-badge span {
          color: #e8841a;
          font-size: 1.05rem;
          line-height: 1;
        }

        .like-badge small {
          color: #b8afa6;
          font-size: 0.72rem;
        }

        .like-badge.liked {
          border-color: rgba(232, 132, 26, 0.62);
          background: rgba(232, 132, 26, 0.2);
        }

        .build-card-body {
          padding: 16px;
          display: grid;
          gap: 12px;
        }

        .build-title-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .build-title-row h2 {
          font-size: 1.28rem;
          line-height: 1.1;
        }

        .classification-badge {
          flex: 0 0 auto;
          border-radius: 999px;
          border: 1px solid rgba(232, 132, 26, 0.32);
          background: rgba(232, 132, 26, 0.12);
          color: #f5f3ee;
          padding: 7px 10px;
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: capitalize;
        }

        .fitment-line {
          color: #d9d0c6;
          font-weight: 800;
        }

        .summary {
          color: #9f968d;
          line-height: 1.45;
          font-size: 0.92rem;
        }

        .build-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .build-meta span {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #1a1a1a;
          color: #b8afa6;
          border-radius: 999px;
          padding: 8px 10px;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .compare-button,
        .empty-actions button,
        .signin-modal button:first-child {
          min-height: 48px;
          border: 0;
          border-radius: 16px;
          background: #e8841a;
          color: #17110b;
          font-weight: 950;
          cursor: pointer;
        }

        .no-match-card {
          padding: 28px 18px;
          text-align: center;
          display: grid;
          justify-items: center;
          gap: 13px;
        }

        .no-match-illustration {
          width: 94px;
          height: 94px;
          border-radius: 28px;
          background:
            radial-gradient(circle at 50% 45%, rgba(232, 132, 26, 0.24), transparent 38%),
            #1a1a1a;
          border: 1px solid rgba(232, 132, 26, 0.2);
          display: grid;
          place-items: center;
        }

        .no-match-illustration span {
          width: 52px;
          height: 28px;
          border-bottom: 5px solid #e8841a;
          border-radius: 50%;
          position: relative;
        }

        .no-match-illustration span::before,
        .no-match-illustration span::after {
          content: '';
          position: absolute;
          bottom: -12px;
          width: 18px;
          height: 18px;
          border: 4px solid #b8afa6;
          border-radius: 50%;
        }

        .no-match-illustration span::before {
          left: -5px;
        }

        .no-match-illustration span::after {
          right: -5px;
        }

        .no-match-card h2 {
          font-size: 1.35rem;
        }

        .no-match-card p:not(.eyebrow) {
          color: #b8afa6;
          max-width: 440px;
          line-height: 1.5;
        }

        .active-filter-summary {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }

        .active-filter-summary span {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #1a1a1a;
          color: #b8afa6;
          border-radius: 999px;
          padding: 8px 10px;
          font-size: 0.78rem;
        }

        .empty-actions {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          max-width: 380px;
        }

        .empty-actions button:last-child,
        .signin-modal button:last-child {
          background: #1a1a1a;
          color: #f5f3ee;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: rgba(0, 0, 0, 0.72);
          display: grid;
          place-items: end center;
          padding: 16px;
        }

        .signin-modal {
          width: min(440px, 100%);
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          padding: 18px;
          display: grid;
          gap: 12px;
        }

        .signin-modal p {
          color: #b8afa6;
        }

        .signin-modal div {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        @media (min-width: 760px) {
          .expert-shell {
            padding: 28px 24px 48px;
          }

          .controls-panel {
            grid-template-columns: 1fr 260px;
            align-items: end;
          }

          .classification-chips,
          .sort-note {
            grid-column: 1 / -1;
          }

          .build-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .bike-context {
            grid-template-columns: 52px 1fr;
          }

          .change-bike {
            grid-column: 1 / -1;
            width: 100%;
          }

          .empty-actions,
          .signin-modal div {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
