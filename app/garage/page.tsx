'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { loadGarageFromSupabase } from '@/lib/garage/persistence'
import { getPreferredGarageBuildForBike } from '@/lib/garage/working-context'
import { demoGarageBikes } from '@/lib/demo-content/bikes'
import { GarageScreen } from '@/components/garage/GarageScreen'
import type { GarageBikeRecord, GarageBuildRecord } from '@/types/garage'

type GarageState =
  | { status: 'loading' }
  | { status: 'loaded'; bikes: GarageBikeRecord[]; selectedBike: GarageBikeRecord | null; selectedBuild: GarageBuildRecord | null }

export default function GaragePage() {
  const router = useRouter()
  const [state, setState] = useState<GarageState>({ status: 'loading' })

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
        const selectedBike = bikes[0] ?? null
        const selectedBuild = selectedBike
          ? (getPreferredGarageBuildForBike({ garageBikes: bikes, selectedBikeId: selectedBike.id }) ?? selectedBike.builds[0] ?? null)
          : null

        setState({ status: 'loaded', bikes, selectedBike, selectedBuild })
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

  return (
    <GarageScreen
      bikes={state.bikes}
      selectedBike={state.selectedBike}
      selectedBuild={state.selectedBuild}
      onSwitchBike={() => router.push('/garage/build')}
    />
  )
}
