import { supabase } from '@/lib/supabase'

export type MotorcycleTyreSize = {
  tyre_size_id: string
  size_label: string
  normalized_size: string
  size_system: string | null
  section_width_mm: number | null
  section_width_in: number | null
  aspect_ratio: number | null
  construction: string | null
  rim_diameter_in: number | null
  overall_diameter_mm_est: number | null
  primary_category_hint: string | null
  alpha_code: string | null
  is_tubeless_specific: boolean | null
  is_front_common: boolean | null
  is_rear_common: boolean | null
  notes: string | null
}

export async function fetchMotorcycleTyreSizes(): Promise<MotorcycleTyreSize[]> {
  const { data, error } = await supabase
    .from('motorcycle_tyre_sizes')
    .select(
      'tyre_size_id, size_label, normalized_size, size_system, section_width_mm, section_width_in, aspect_ratio, construction, rim_diameter_in, overall_diameter_mm_est, primary_category_hint, alpha_code, is_tubeless_specific, is_front_common, is_rear_common, notes'
    )
    .order('rim_diameter_in', { ascending: true, nullsFirst: false })
    .order('section_width_mm', { ascending: true, nullsFirst: false })
    .order('size_label', { ascending: true })

  if (error) {
    console.warn('[fetchMotorcycleTyreSizes] Failed to load tyre sizes:', error.message)
    return []
  }

  return (data ?? []) as MotorcycleTyreSize[]
}
