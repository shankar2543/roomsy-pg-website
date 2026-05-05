const STORAGE_KEY = "roomsy_wishlist";

type WishlistMap = Record<string, string[]>;

function read(): WishlistMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as WishlistMap;
  } catch {
    return {};
  }
}

function write(map: WishlistMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("roomsy:wishlist"));
}

export function getWishlist(userId: string): string[] {
  return read()[userId] || [];
}

export function isWishlisted(userId: string, pgId: string): boolean {
  return getWishlist(userId).includes(pgId);
}

export function toggleWishlist(userId: string, pgId: string): boolean {
  const map = read();
  const current = map[userId] || [];
  const exists = current.includes(pgId);
  map[userId] = exists ? current.filter((id) => id !== pgId) : [...current, pgId];
  write(map);
  return !exists;
}

export function removeFromWishlist(userId: string, pgId: string) {
  const map = read();
  map[userId] = (map[userId] || []).filter((id) => id !== pgId);
  write(map);
}
