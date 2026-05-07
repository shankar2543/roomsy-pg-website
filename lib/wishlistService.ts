import Parse from "@/lib/parseConfig";

// Per-tab cache of the current user's wishlist. Pages should call
// loadWishlist(userId) on mount to hydrate, then the synchronous
// isWishlisted / getWishlist helpers read from this cache.
let cache: Set<string> | null = null;
let cacheUserId: string | null = null;

const SYNC_EVENT = "roomsy:wishlist";

async function fetchAndCache(userId: string): Promise<Set<string>> {
  const res = (await Parse.Cloud.run("getMyWishlist")) as { pgIds: string[] };
  cacheUserId = userId;
  cache = new Set(res.pgIds || []);
  return cache;
}

export async function loadWishlist(userId: string): Promise<string[]> {
  if (cache && cacheUserId === userId) return Array.from(cache);
  const set = await fetchAndCache(userId);
  return Array.from(set);
}

export function getWishlist(userId: string): string[] {
  if (cacheUserId !== userId) return [];
  return cache ? Array.from(cache) : [];
}

export function isWishlisted(userId: string, pgId: string): boolean {
  if (cacheUserId !== userId) return false;
  return cache?.has(pgId) ?? false;
}

export async function toggleWishlist(userId: string, pgId: string): Promise<boolean> {
  const res = (await Parse.Cloud.run("toggleWishlist", { pgId })) as {
    pgIds: string[];
    added: boolean;
  };
  cacheUserId = userId;
  cache = new Set(res.pgIds || []);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SYNC_EVENT));
  }
  return res.added;
}

export function clearWishlistCache() {
  cache = null;
  cacheUserId = null;
}
