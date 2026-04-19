'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { loadGarageFromSupabase } from '@/lib/garage/persistence'
import { getPreferredGarageBuildForBike } from '@/lib/garage/working-context'
import { demoGarageBikes } from '@/lib/demo-content/bikes'
import { GarageScreen } from '@/components/garage/GarageScreen'
import { MyBikesOverview } from '@/components/garage/MyBikesOverview'
import type { GarageBikeRecord, GarageBuildRecord } from '@/types/garage'

type View = 'overview' | 'detail'

type GarageState =
  | { status: 'loading' }
  | { status: 'loaded'; bikes: GarageBikeRecord[]; selectedBike: GarageBikeRecord | null; selectedBuild: GarageBuildRecord | null }

export default function GaragePage() {
  const router = useRouter()
  const [state, setState] = useState<GarageState>({ status: 'loading' })
  const [view, setView] = useState<View>('overview')

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
        setState({ status: 'loaded', bikes, selectedBike: null, selectedBuild: null })
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
          style={{ width: 10, height: 10, backgroundColor: '#1C69D4' }}
        />
        <span style={{ fontSize: 13 }}>Loading your garage…</span>
      </div>
    )
  }

  function handleSelectBike(bike: GarageBikeRecord, build: GarageBuildRecord | null) {
    if (state.status !== 'loaded') return
    const resolvedBuild =
      build ??
      getPreferredGarageBuildForBike({ garageBikes: state.bikes, selectedBikeId: bike.id }) ??
      bike.builds[0] ??
      null
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
      />
    )
  }

  return (
    <MyBikesOverview
      bikes={state.bikes}
      onSelectBike={handleSelectBike}
    />
  )
}
