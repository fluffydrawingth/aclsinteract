export type RhythmType =
  // Cardiac arrest
  | 'VF' | 'PVT' | 'PEA' | 'ASYSTOLE' | 'SINUS'
  // Bradycardia
  | 'SINUS_BRADY' | 'AV_BLOCK' | 'CHB'
  // Tachycardia
  | 'SVT' | 'AF_RVR' | 'VT_PULSE'

export type RhythmInfo = {
  id: RhythmType
  nameThai: string
  nameEn: string
  isShockable: boolean
  descriptionThai: string
  color: string
}

export type RhythmOption = {
  type: RhythmType
  label: string
}
