# Deploy & Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com → **New project**
2. Choose a name (e.g. `acls-interactive`) and a strong database password
3. Wait ~2 minutes for provisioning

## 2. Create the Storage Bucket

1. In your Supabase dashboard → **Storage** → **New bucket**
2. Name: `scene-assets`
3. **Public bucket: YES** (assets must be publicly readable so any browser can load the images)
4. Click **Save**

## 3. Set Bucket Policy (allow uploads from the app)

In Storage → `scene-assets` → **Policies** → **New policy** → "For full customization":

```sql
-- Allow anyone to read (SELECT)
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'scene-assets');

-- Allow authenticated or anon insert (the app uses the anon key)
CREATE POLICY "Anon upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'scene-assets');

-- Allow delete (for clearing images)
CREATE POLICY "Anon delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'scene-assets');
```

Or simply click **"Give users access to all operations"** if this is a private teaching tool.

## 4. Get Your Keys

Dashboard → **Project Settings** → **API**:
- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` key → `VITE_SUPABASE_ANON_KEY`

## 5. Local Development

Create `.env.local` (already in `.gitignore`):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_SUPABASE_STORAGE_BUCKET=scene-assets
```

Then: `npm run dev`

## 6. Deploy to Vercel

### One-time setup
1. Push this repo to GitHub
2. Go to https://vercel.com → **New Project** → Import your GitHub repo
3. Framework: **Vite** (auto-detected)
4. Add Environment Variables (Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_STORAGE_BUCKET` = `scene-assets`
5. Click **Deploy**

### Subsequent deploys
Push to `main` branch → Vercel auto-deploys.

## 7. Migrate Existing Local Assets (optional)

If you already uploaded images locally before adding Supabase:
1. Open the deployed app on the device that has the images
2. Go to **Admin → Scene Assets → Asset Library**
3. Click **"☁ Migrate local → Supabase"**
4. All local assets will be uploaded and the scene will work cross-device

## Architecture Notes

| Storage | When used |
|---|---|
| Supabase Storage | When `VITE_SUPABASE_*` env vars are set — images stored in cloud, accessible from any device |
| IndexedDB (local) | Fallback when Supabase is not configured — images stored in-browser only |

All other app data (drug overrides, H&T edits, scenario settings, action mappings) remains in `localStorage` — no database migration needed.
