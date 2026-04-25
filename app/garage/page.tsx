'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { loadGarageFromSupabase, deleteGarageBike, deleteGarageBuild } from '@/lib/garage/persistence'
import { getPreferredGarageBuildForBike } from '@/lib/garage/working-context'
import { demoGarageBikes } from '@/lib/demo-content/bikes'
import { GarageScreen } from '@/components/garage/GarageScreen'
import { MyBikesOverview } from '@/components/garage/MyBikesOverview'
import type { GarageBikeRecord, GarageBuildRecord } from '@/types/garage'

type View = 'overview' | 'detail'
const EXPERT_BIKE_CONTEXT_KEY = 'expert_bike_context_v1'
const GARAGE_RETURN_KEY = 'garage_return_context_v1'

type GarageReturnContext = {
  bikeId?: string
  buildId?: string | null
}

type GarageState =
  | { status: 'loading' }
  | { status: 'loaded'; bikes: GarageBikeRecord[]; selectedBike: GarageBikeRecord | null; selectedBuild: GarageBuildRecord | null }

export default function GaragePage() {
  const router = useRouter()
  const [state, setState] = useState<GarageState>({ status: 'loading' })
  const [view, setView] = useState<View>('overview')

  function writeExpertBikeContext(bike: GarageBikeRecord) {
    sessionStorage.setItem(
      EXPERT_BIKE_CONTEXT_KEY,
      JSON.stringify({
        make: bike.make,
        model: bike.model,
        variant: bike.variant ?? undefined,
        year: bike.year ? String(bike.year) : undefined,
        image: bike.image ?? bike.heroImageUrl ?? undefined,
      }),
    )
  }

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      try {
        const snapshot = await loadGarageFromSupabase(demoGarageBikes)
        const bikes = snapshot?.bikes ?? []
        const params = new URLSearchParams(window.location.search)
        const shouldRestoreGarage = params.get('restoreGarage') === '1'
        let restoredBike: GarageBikeRecord | null = null
        let restoredBuild: GarageBuildRecord | null = null

        if (shouldRestoreGarage) {
          try {
            const rawContext = sessionStorage.getItem(GARAGE_RETURN_KEY)
            const context = rawContext ? JSON.parse(rawContext) as GarageReturnContext : null
            restoredBike = bikes.find((bike) => bike.id === context?.bikeId) ?? null
            restoredBuild =
              restoredBike?.builds.find((build) => build.id === context?.buildId) ??
              (restoredBike
                ? getPreferredGarageBuildForBike({ garageBikes: bikes, selectedBikeId: restoredBike.id }) ??
                  restoredBike.builds[0] ??
                  null
                : null)
          } catch {
            sessionStorage.removeItem(GARAGE_RETURN_KEY)
          }
        }

        if (restoredBike) {
          writeExpertBikeContext(restoredBike)
          setState({ status: 'loaded', bikes, selectedBike: restoredBike, selectedBuild: restoredBuild })
          setView('detail')
          router.replace('/garage', { scroll: false })
        } else {
          setState({ status: 'loaded', bikes, selectedBike: null, selectedBuild: null })
        }
      } catch {
        setState({ status: 'loaded', bikes: [], selectedBike: null, selectedBuild: null })
      }
    }

    load()
  }, [router])

  if (state.status === 'loading') {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 min-h-[60vh]"
        style={{ color: '#6A6860' }}
      >
        <div
          className="rounded-full animate-pulse"
          style={{ width: 10, height: 10, backgroundColor: '#E8841A' }}
        />
        <span style={{ fontSize: 13 }}>Loading your garage…</span>
      </div>
    )
  }

  function handleDeleteBike() {
    if (state.status !== 'loaded' || !state.selectedBike) return
    const bikeId = state.selectedBike.id
    setState({
      status: 'loaded',
      bikes: state.bikes.filter(b => b.id !== bikeId),
      selectedBike: null,
      selectedBuild: null,
    })
    setView('overview')
    deleteGarageBike(bikeId).catch(err => console.error('Failed to delete bike:', err))
  }

  function handleDeleteBuild() {
    if (state.status !== 'loaded' || !state.selectedBike || !state.selectedBuild) return
    const buildId = state.selectedBuild.id
    const bikeId = state.selectedBike.id

    const updatedBikes = state.bikes.map(b => {
      if (b.id !== bikeId) return b
      return { ...b, builds: b.builds.filter(build => build.id !== buildId) }
    })

    const updatedBike = updatedBikes.find(b => b.id === bikeId) ?? null
    const nextBuild = updatedBike?.builds?.[0] ?? null

    if (!nextBuild) {
      setState({ status: 'loaded', bikes: updatedBikes, selectedBike: null, selectedBuild: null })
      setView('overview')
    } else {
      setState({ status: 'loaded', bikes: updatedBikes, selectedBike: updatedBike!, selectedBuild: nextBuild })
    }

    deleteGarageBuild(buildId).catch(err => console.error('Failed to delete build:', err))
  }

  function handleSwitchBikeTo(bike: GarageBikeRecord) {
    if (state.status !== 'loaded') return
    const build =
      getPreferredGarageBuildForBike({ garageBikes: state.bikes, selectedBikeId: bike.id }) ??
      bike.builds[0] ??
      null
    writeExpertBikeContext(bike)
    setState({ status: 'loaded', bikes: state.bikes, selectedBike: bike, selectedBuild: build })
  }

  function handleSelectBike(bike: GarageBikeRecord, build: GarageBuildRecord | null) {
    if (state.status !== 'loaded') return
    const resolvedBuild =
      build ??
      getPreferredGarageBuildForBike({ garageBikes: state.bikes, selectedBikeId: bike.id }) ??
      bike.builds[0] ??
      null
    writeExpertBikeContext(bike)
    setState({ status: 'loaded', bikes: state.bikes, selectedBike: bike, selectedBuild: resolvedBuild })
    setView('detail')
  }

  if (view === 'detail' && state.selectedBike) {
    return (
      <GarageScreen
        bikes={state.bikes}
        selectedBike={state.selectedBike}
        selectedBuild={state.selectedBuild}
        onSwitchBike={() => setView('overview')}
        onDeleteBike={handleDeleteBike}
        onDeleteBuild={handleDeleteBuild}
        onSwitchBikeTo={handleSwitchBikeTo}
      />
    )
  }

  return (
    <MyBikesOverview
      bikes={state.bikes}
      onSelectBike={handleSelectBike}
      activeBikeId={state.selectedBike?.id ?? null}
    />
  )
}
