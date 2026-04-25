'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { demoExpertBuildCatalog } from '@/lib/demo-content/expert-builds';
import { demoGarageProducts } from '@/lib/demo-content/products';
import { demoGarageBikes } from '@/lib/demo-content/bikes';
import { loadGarageFromSupabase, replaceGarageBuildItems } from '@/lib/garage/persistence';
import { supabase } from '@/lib/supabase';
import type { GarageBikeRecord, GarageBuildRecord, Product } from '@/types/garage';
import { garageCategories } from '@/types/garage';

type SelectedBike = {
  make: string;
  model: string;
  variant?: string;
  year?: string;
};

type RowStatus = 'Matched' | 'In my build' | 'Not in my build';

type CompareRow = {
  key: string;
  categoryId: string;
  title: string;
  brand: string;
  product: Product | null;
  status: RowStatus;
};

type CompareGroup = {
  id: string;
  label: string;
  rows: CompareRow[];
};

type CompareReturnContext = {
  expertBuildId: string;
  showAllCategories: boolean;
  collapsedCategoryIds: string[];
  selectedItemId: string;
  scrollY: number;
};

const BROWSE_BIKE_KEY = 'browse_bike_selection_v2';
const COMPARE_RETURN_KEY = 'expert_compare_return_v1';

const productById = new Map(demoGarageProducts.map((product) => [product.id, product]));

function normalize(value?: string | null) {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function sameBike(makeA?: string | null, modelA?: string | null, makeB?: string | null, modelB?: string | null) {
  return normalize(makeA) === normalize(makeB) && normalize(modelA) === normalize(modelB);
}

function categoryLabel(categoryId: string) {
  return garageCategories.find((category) => category.id === categoryId)?.label ?? categoryId;
}

function categoryIcon(categoryId: string) {
  if (categoryId.includes('luggage')) return 'LG';
  if (categoryId.includes('protection')) return 'PR';
  if (categoryId.includes('navigation') || categoryId.includes('connectivity')) return 'NV';
  if (categoryId.includes('lighting') || categoryId.includes('visibility')) return 'LT';
  if (categoryId.includes('electrical') || categoryId.includes('power')) return 'EL';
  return 'IT';
}

function formatBikeTitle(bike: SelectedBike | null, fallback: string) {
  if (!bike) return fallback;
  return [bike.year, bike.make, bike.model, bike.variant].filter(Boolean).join(' ');
}

function findComparisonBuild(bikes: GarageBikeRecord[], selectedBike: SelectedBike | null) {
  const bike =
    (selectedBike
      ? bikes.find((candidate) => sameBike(candidate.make, candidate.model, selectedBike.make, selectedBike.model))
      : null) ?? bikes[0];

  if (!bike) return { bike: null, build: null };

  const build = bike.builds.find((candidate) => candidate.isPrimary) ?? bike.builds[0] ?? null;
  return { bike, build };
}

export default function ExpertBuildComparePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const buildId = Array.isArray(params.id) ? params.id[0] : params.id;

  const expertBuild =
    demoExpertBuildCatalog.find((build) => build.id === buildId || build.slug === buildId) ?? null;

  const [selectedBike, setSelectedBike] = useState<SelectedBike | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [garageBike, setGarageBike] = useState<GarageBikeRecord | null>(null);
  const [garageBuild, setGarageBuild] = useState<GarageBuildRecord | null>(null);
  const [myBuildProducts, setMyBuildProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isAddingId, setIsAddingId] = useState<number | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<string[]>([]);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(null);
  const [pendingScrollY, setPendingScrollY] = useState<number | null>(null);

  useEffect(() => {
    const rawBike = sessionStorage.getItem(BROWSE_BIKE_KEY);
    if (rawBike) {
      try {
        setSelectedBike(JSON.parse(rawBike));
      } catch {
        sessionStorage.removeItem(BROWSE_BIKE_KEY);
      }
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const signedIn = Boolean(data.session);
      setIsLoggedIn(signedIn);

      if (!signedIn) return;

      const snapshot = await loadGarageFromSupabase(demoGarageBikes);
      if (!snapshot?.bikes?.length) return;

      let bikeForContext: SelectedBike | null = null;
      if (rawBike) {
        try {
          bikeForContext = JSON.parse(rawBike) as SelectedBike;
        } catch {
          bikeForContext = null;
        }
      }
      const { bike, build } = findComparisonBuild(snapshot.bikes, bikeForContext);
      setGarageBike(bike);
      setGarageBuild(build);
      setMyBuildProducts(build?.buildItems.map((item) => item.product) ?? []);
    });
  }, []);

  useEffect(() => {
    if (!expertBuild || searchParams.get('restoreCompare') !== '1') return;

    const rawContext = sessionStorage.getItem(COMPARE_RETURN_KEY);
    if (!rawContext) return;

    try {
      const context = JSON.parse(rawContext) as CompareReturnContext;
      if (context.expertBuildId !== expertBuild.id) return;
      setShowAllCategories(context.showAllCategories);
      setCollapsedCategoryIds(context.collapsedCategoryIds);
      setPendingScrollTarget(context.selectedItemId);
      setPendingScrollY(context.scrollY);
      router.replace(`/expert/${expertBuild.id}`, { scroll: false });
    } catch {
      sessionStorage.removeItem(COMPARE_RETURN_KEY);
    }
  }, [expertBuild, router, searchParams]);

  const myBuildProductIds = useMemo(() => new Set(myBuildProducts.map((product) => product.id)), [myBuildProducts]);

  const groups = useMemo<CompareGroup[]>(() => {
    if (!expertBuild) return [];

    const grouped = new Map<string, CompareRow[]>();
    const expertProductIds = new Set<number>();

    function pushRow(row: CompareRow) {
      const rows = grouped.get(row.categoryId) ?? [];
      rows.push(row);
      grouped.set(row.categoryId, rows);
    }

    expertBuild.accessories.forEach((accessory) => {
      const product = accessory.productId ? productById.get(accessory.productId) ?? null : null;
      if (product) expertProductIds.add(product.id);
      const matched = Boolean(product && myBuildProductIds.has(product.id));
      pushRow({
        key: accessory.productId ? String(accessory.productId) : accessory.id,
        categoryId: accessory.categoryId,
        title: product?.name ?? accessory.title,
        brand: product?.brand ?? accessory.brand,
        product,
        status: matched ? 'Matched' : 'Not in my build',
      });
    });

    myBuildProducts
      .filter((product) => !expertProductIds.has(product.id))
      .forEach((product) => {
        pushRow({
          key: `mine-${product.id}`,
          categoryId: product.categoryId,
          title: product.name,
          brand: product.brand,
          product,
          status: 'In my build',
        });
    });

    return Array.from(grouped.entries()).map(([id, rows]) => ({
      id,
      label: categoryLabel(id),
      rows,
    }));
  }, [expertBuild, myBuildProductIds, myBuildProducts]);

  useEffect(() => {
    if (!pendingScrollTarget) return;

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(`compare-row-${pendingScrollTarget}`);
      if (target) {
        target.scrollIntoView({ block: 'center' });
      } else if (pendingScrollY !== null) {
        window.scrollTo({ top: pendingScrollY });
      }

      setPendingScrollTarget(null);
      setPendingScrollY(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [groups, pendingScrollTarget, pendingScrollY]);

  const summary = useMemo(() => {
    const rows = groups.flatMap((group) => group.rows);
    return {
      expertItems: rows.length,
      matched: rows.filter((row) => row.status === 'Matched').length,
      inMyBuild: rows.filter((row) => row.status === 'In my build').length,
      missing: rows.filter((row) => row.status === 'Not in my build').length,
    };
  }, [groups]);

  const visibleGroups = showAllCategories ? groups : groups.slice(0, 3);

  function toggleCategory(categoryId: string) {
    setCollapsedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  function openItem(row: CompareRow) {
    if (!row.product) {
      setMessage('Product detail is not available until this expert item is linked to a catalogue product.');
      return;
    }

    const context: CompareReturnContext = {
      expertBuildId: expertBuild?.id ?? buildId,
      showAllCategories,
      collapsedCategoryIds,
      selectedItemId: row.key,
      scrollY: window.scrollY,
    };

    sessionStorage.setItem(COMPARE_RETURN_KEY, JSON.stringify(context));
    router.push(`/shop/${row.product.id}?from=compare&buildId=${expertBuild?.id ?? buildId}`);
  }

  async function addToBuild(row: CompareRow) {
    if (!row.product) {
      setMessage('This expert item is not linked to a catalogue product yet.');
      return;
    }

    if (!isLoggedIn) {
      setMessage('Sign in to add expert items to your saved build.');
      return;
    }

    if (!garageBuild) {
      setMessage('Create or select a saved Garage build before adding comparison items.');
      return;
    }

    if (myBuildProductIds.has(row.product.id)) return;

    const previousProducts = myBuildProducts;
    const nextProducts = [...previousProducts, row.product];
    setIsAddingId(row.product.id);
    setMyBuildProducts(nextProducts);
    setMessage(null);

    try {
      await replaceGarageBuildItems(
        garageBuild.id,
        nextProducts.map((product, index) => ({ product, sortOrder: index })),
      );
      setMessage(`Added ${row.product.name} to ${garageBuild.name}.`);
    } catch (error) {
      setMyBuildProducts(previousProducts);
      setMessage(error instanceof Error ? error.message : 'Could not update your saved build.');
    } finally {
      setIsAddingId(null);
    }
  }

  if (!expertBuild) {
    return (
      <main className="compare-page">
        <section className="not-found">
          <h1>Expert build not found</h1>
          <button type="button" onClick={() => router.push('/expert')}>
            Back to builds
          </button>
        </section>
        <style jsx>{`
          .compare-page {
            min-height: 100vh;
            background: #0d0d0d;
            color: #f5f3ee;
          }
          .not-found {
            padding: 32px 16px;
            display: grid;
            gap: 16px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="compare-page">
      <section className="compare-shell">
        <button type="button" className="back-button" onClick={() => router.push('/expert')}>
          Back to builds
        </button>

        <section className="compare-header">
          <div>
            <p className="eyebrow">Compare builds</p>
            <h1>{expertBuild.title}</h1>
            <p>See how this expert build compares to your current build.</p>
          </div>
          <div className="comparison-card">
            <span>Expert build</span>
            <strong>{expertBuild.builderName}</strong>
            <em>vs</em>
            <span>My build</span>
            <strong>{garageBuild?.name ?? 'No saved build selected'}</strong>
          </div>
        </section>

        <section className="bike-strip">
          <div>
            <span>Expert bike</span>
            <strong>
              {[
                expertBuild.bikeFitment.yearStart === expertBuild.bikeFitment.yearEnd
                  ? String(expertBuild.bikeFitment.yearStart)
                  : `${expertBuild.bikeFitment.yearStart}-${expertBuild.bikeFitment.yearEnd}`,
                expertBuild.bikeFitment.make,
                expertBuild.bikeFitment.model,
              ]
                .filter(Boolean)
                .join(' ')}
            </strong>
          </div>
          <div>
            <span>My Garage</span>
            <strong>{garageBike ? `${garageBike.year} ${garageBike.make} ${garageBike.model}` : formatBikeTitle(selectedBike, 'No saved Garage build')}</strong>
          </div>
        </section>

        <section className="summary-grid" aria-label="Comparison summary">
          <article className="expert">
            <strong>{summary.expertItems}</strong>
            <span>Expert items</span>
          </article>
          <article className="matched">
            <strong>{summary.matched}</strong>
            <span>Matched</span>
          </article>
          <article className="mine">
            <strong>{summary.inMyBuild}</strong>
            <span>In my build</span>
          </article>
          <article className="missing">
            <strong>{summary.missing}</strong>
            <span>Not in my build</span>
          </article>
        </section>

        {message ? (
          <section className="message-card">
            <p>{message}</p>
            {message.includes('Sign in') ? (
              <button type="button" onClick={() => router.push(`/login?returnTo=/expert/${expertBuild.id}`)}>
                Sign in
              </button>
            ) : null}
            {message.includes('Garage build') ? (
              <button type="button" onClick={() => router.push('/garage/build')}>
                Open Garage builder
              </button>
            ) : null}
          </section>
        ) : null}

        <section className="category-list">
          {visibleGroups.map((group) => {
            const collapsed = collapsedCategoryIds.includes(group.id);

            return (
              <article key={group.id} className="category-group">
                <button type="button" className="category-header" onClick={() => toggleCategory(group.id)}>
                  <span className="category-icon" aria-hidden="true">
                    {categoryIcon(group.id)}
                  </span>
                  <span>
                    <strong>{group.label}</strong>
                    <small>{group.rows.length} {group.rows.length === 1 ? 'item' : 'items'}</small>
                  </span>
                  <em>{collapsed ? '+' : '-'}</em>
                </button>

                {!collapsed ? (
                  <div className="comparison-rows">
                    {group.rows.map((row) => (
                      <article key={row.key} id={`compare-row-${row.key}`} className="comparison-row">
                        <img src={row.product?.image ?? expertBuild.primaryPhoto.imageUrl} alt="" />
                        <div className="item-copy">
                          <strong>{row.title}</strong>
                          <p>
                            {row.brand}
                            <button type="button" onClick={() => openItem(row)}>
                              View item -&gt;
                            </button>
                          </p>
                        </div>
                        <span className={`status-pill ${row.status.toLowerCase().replaceAll(' ', '-')}`}>
                          {row.status}
                        </span>
                        {row.status === 'Not in my build' ? (
                          <button
                            type="button"
                            className="add-button"
                            onClick={() => addToBuild(row)}
                            disabled={isAddingId === row.product?.id}
                            aria-label={`Add ${row.product?.name ?? row.title} to build`}
                          >
                            +
                          </button>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>

        {groups.length > 3 ? (
          <button type="button" className="view-all-button" onClick={() => setShowAllCategories((value) => !value)}>
            {showAllCategories ? 'Show fewer categories' : 'View all categories'}
          </button>
        ) : null}
      </section>

      <style jsx>{`
        .compare-page {
          min-height: 100vh;
          background: #0d0d0d;
          color: #f5f3ee;
          padding-bottom: 48px;
        }

        .compare-shell {
          width: min(980px, 100%);
          margin: 0 auto;
          padding: 18px 16px 32px;
          display: grid;
          gap: 14px;
        }

        .back-button {
          justify-self: start;
          border: 0;
          background: transparent;
          color: #b8afa6;
          font-weight: 900;
          cursor: pointer;
          padding: 8px 0;
        }

        .compare-header,
        .bike-strip,
        .summary-grid article,
        .message-card,
        .category-group {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
        }

        .compare-header {
          padding: 17px;
          display: grid;
          gap: 14px;
        }

        .eyebrow {
          margin: 0 0 6px;
          color: #e8841a;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        h1,
        p {
          margin: 0;
        }

        h1 {
          font-size: clamp(1.45rem, 6vw, 2.2rem);
          line-height: 1.04;
        }

        .compare-header p {
          margin-top: 8px;
          color: #b8afa6;
          line-height: 1.45;
        }

        .comparison-card {
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 13px;
          display: grid;
          gap: 4px;
        }

        .comparison-card span {
          color: #7a7268;
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .comparison-card strong {
          color: #f5f3ee;
        }

        .comparison-card em {
          color: #e8841a;
          font-style: normal;
          font-weight: 900;
        }

        .bike-strip {
          padding: 14px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .bike-strip div {
          display: grid;
          gap: 4px;
        }

        .bike-strip span {
          color: #7a7268;
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .summary-grid article {
          padding: 14px;
          display: grid;
          gap: 5px;
        }

        .summary-grid strong {
          font-size: 1.55rem;
        }

        .summary-grid span {
          color: #b8afa6;
          font-size: 0.8rem;
          font-weight: 850;
        }

        .summary-grid .expert strong {
          color: #e8841a;
        }

        .summary-grid .matched strong {
          color: #72d69a;
        }

        .summary-grid .mine strong {
          color: #9bb8d8;
        }

        .summary-grid .missing strong {
          color: #f28b82;
        }

        .message-card {
          padding: 14px;
          display: grid;
          gap: 10px;
        }

        .message-card p {
          color: #d9d0c6;
        }

        .message-card button,
        .view-all-button,
        .add-button {
          border: 0;
          background: #e8841a;
          color: #17110b;
          font-weight: 950;
          cursor: pointer;
        }

        .message-card button,
        .view-all-button {
          min-height: 46px;
          border-radius: 15px;
        }

        .category-list {
          display: grid;
          gap: 12px;
        }

        .category-group {
          overflow: hidden;
        }

        .category-header {
          width: 100%;
          min-height: 62px;
          border: 0;
          background: #141414;
          color: #f5f3ee;
          display: grid;
          grid-template-columns: 42px 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
        }

        .category-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(232, 132, 26, 0.13);
          border: 1px solid rgba(232, 132, 26, 0.24);
          color: #e8841a;
          font-weight: 950;
        }

        .category-header small {
          display: block;
          margin-top: 3px;
          color: #7a7268;
          font-weight: 800;
        }

        .category-header em {
          color: #b8afa6;
          font-style: normal;
          font-weight: 950;
          font-size: 1.2rem;
        }

        .comparison-rows {
          display: grid;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .comparison-row {
          min-height: 86px;
          display: grid;
          grid-template-columns: 56px 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 12px 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .comparison-row:first-child {
          border-top: 0;
        }

        .comparison-row img {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          object-fit: cover;
          background: #1a1a1a;
        }

        .item-copy {
          min-width: 0;
        }

        .item-copy strong {
          display: block;
          line-height: 1.2;
        }

        .item-copy p {
          margin-top: 5px;
          color: #b8afa6;
          font-size: 0.82rem;
        }

        .item-copy button {
          border: 0;
          background: transparent;
          color: #e8841a;
          font-weight: 900;
          cursor: pointer;
          padding: 0 0 0 6px;
        }

        .status-pill {
          justify-self: end;
          border-radius: 999px;
          padding: 7px 9px;
          font-size: 0.72rem;
          font-weight: 950;
          white-space: nowrap;
        }

        .status-pill.matched {
          color: #d9ffe5;
          background: rgba(114, 214, 154, 0.16);
          border: 1px solid rgba(114, 214, 154, 0.28);
        }

        .status-pill.in-my-build {
          color: #d8e9ff;
          background: rgba(155, 184, 216, 0.14);
          border: 1px solid rgba(155, 184, 216, 0.24);
        }

        .status-pill.not-in-my-build {
          color: #ffe2de;
          background: rgba(242, 139, 130, 0.14);
          border: 1px solid rgba(242, 139, 130, 0.24);
        }

        .add-button {
          grid-column: 3;
          justify-self: end;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          font-size: 1.25rem;
          line-height: 1;
        }

        .add-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .view-all-button {
          width: 100%;
        }

        @media (min-width: 760px) {
          .compare-shell {
            padding: 28px 24px 48px;
          }

          .compare-header {
            grid-template-columns: 1fr 280px;
            align-items: start;
          }

          .bike-strip {
            grid-template-columns: 1fr 1fr;
          }

          .summary-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 540px) {
          .comparison-row {
            grid-template-columns: 52px 1fr auto;
          }

          .comparison-row img {
            width: 52px;
            height: 52px;
          }

          .status-pill {
            grid-column: 2 / 4;
            justify-self: start;
          }

          .add-button {
            grid-column: 3;
            grid-row: 1;
          }
        }
      `}</style>
    </main>
  );
}
