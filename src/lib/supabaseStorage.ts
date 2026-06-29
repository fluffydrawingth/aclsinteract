import { supabase, BUCKET } from './supabase'

/**
 * Upload a File to Supabase Storage and return the public URL.
 * Returns null if Supabase is not configured or upload fails.
 */
export async function uploadAssetToSupabase(
  assetId: string,
  file: File,
): Promise<string | null> {
  if (!supabase) return null

  const ext  = file.name.split('.').pop() ?? 'png'
  const path = `assets/${assetId}-${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    console.error('[SupabaseStorage] Upload failed:', error.message)
    return null
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Upload a base64 dataUrl to Supabase Storage (for migrate-to-cloud flow).
 * Returns the public URL or null on failure.
 */
export async function uploadDataUrlToSupabase(
  assetId: string,
  dataUrl: string,
): Promise<string | null> {
  if (!supabase) return null

  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const ext  = mime.split('/')[1] ?? 'png'
  const binary = atob(base64)
  const bytes  = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const file = new File([bytes], `${assetId}.${ext}`, { type: mime })

  return uploadAssetToSupabase(assetId, file)
}
