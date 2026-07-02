export const storageKeys = {
  cart: "dopamine-shop.cart.v1",
  orders: "dopamine-shop.orders.v1",
  reviews: "dopamine-shop.reviews.v1",
  ui: "dopamine-shop.ui.v1",
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
