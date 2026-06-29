// IndexedDB-backed image store.
// Stores image data URLs (base64) in IndexedDB which supports hundreds of MB,
// unlike localStorage which is limited to ~5 MB total and fails silently.
//
// Usage pattern:
//   - Call initImageStore() once at app startup (await it or fire-and-forget).
//   - Use getImage(key) synchronously after init (returns from memory cache).
//   - Use setImage(key, dataUrl) / deleteImage(key) to write.

const DB_NAME    = 'acls-image-store'
const STORE_NAME = 'images'
const DB_VERSION = 1

// In-memory cache — makes reads synchronous after init
const cache = new Map<string, string>()

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE_NAME)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror   = () => {
        dbPromise = null
        reject(req.error)
      }
    })
  }
  return dbPromise
}

// Called once at app startup to warm the memory cache from IndexedDB.
// Components that read synchronously via getImage() will see correct data
// only after this resolves. The app should await this before first render.
export async function initImageStore(): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, 'readonly')
      const st  = tx.objectStore(STORE_NAME)
      const req = st.openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          cache.set(cursor.key as string, cursor.value as string)
          cursor.continue()
        }
      }
      tx.oncomplete = () => resolve()
      tx.onerror    = () => reject(tx.error)
    })
  } catch (err) {
    // IndexedDB unavailable (private browsing on some browsers) — fall back to
    // reading any legacy localStorage keys so existing data isn't lost.
    console.warn('[ImageStore] IndexedDB unavailable, using localStorage fallback:', err)
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('acls-img::')) {
        const v = localStorage.getItem(k)
        if (v) cache.set(k.slice('acls-img::'.length), v)
      }
    }
  }
}

// Synchronous read — returns undefined if key not in cache.
export function getImage(key: string): string | undefined {
  return cache.get(key)
}

// Write — updates cache immediately, persists to IndexedDB async.
export function setImage(key: string, dataUrl: string): void {
  cache.set(key, dataUrl)
  openDB().then(db => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(dataUrl, key)
    tx.onerror = () => {
      // IDB failed — try localStorage as last resort
      try { localStorage.setItem('acls-img::' + key, dataUrl) } catch {}
    }
  }).catch(() => {
    try { localStorage.setItem('acls-img::' + key, dataUrl) } catch {}
  })
}

// Delete — removes from cache immediately, async from IDB.
export function deleteImage(key: string): void {
  cache.delete(key)
  openDB().then(db => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
  }).catch(() => {
    localStorage.removeItem('acls-img::' + key)
  })
}

// Check if a key exists in cache (after init).
export function hasImage(key: string): boolean {
  return cache.has(key)
}

// Return all keys currently in cache.
export function allImageKeys(): string[] {
  return [...cache.keys()]
}
