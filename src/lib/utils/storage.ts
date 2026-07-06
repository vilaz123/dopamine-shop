export const storageKeys = {
  cart: "dopahub.cart.v1",
  orders: "dopahub.orders.v1",
  reviews: "dopahub.reviews.v1",
  ui: "dopahub.ui.v1",
  assets: "dopahub.assets.v1",
  community: "dopahub.community.v1",
  auth: "dopahub.auth.v1",
  accounts: "dopahub.accounts.v1",
  shares: "dopahub.shares.v1",
};

export function safeLocalStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const storage = safeLocalStorage();
  if (!storage) return fallback;
  const raw = storage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  const storage = safeLocalStorage();
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
}
