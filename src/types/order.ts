import type { CartItem } from "./cart";
import type { DeliveryFlavor } from "./product";

export type CheckoutProfile = {
  virtualAddress: string;
  giftWrap: boolean;
  deliveryCompletion: "never" | "signed";
  signedAt?: string;
  couponCode?: string;
  couponLabel?: string;
  note?: string;
};

export type OrderItemSnapshot = CartItem & {
  name: string;
  subtitle: string;
  price: number;
  accent: string;
  saturation: string;
  monogram: string;
  rewardCoins: number;
  deliveryFlavor: DeliveryFlavor;
};

export type Order = {
  id: string;
  createdAt: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  total: number;
  coinsEarned: number;
  xpEarned: number;
  badges: string[];
  deliveryFlavor: DeliveryFlavor;
  profile: CheckoutProfile;
};
