import type { CartItem } from "./cart";

export type CheckoutProfile = {
  name: string;
  address: string;
  paymentMethod: string;
  impulseBefore: number;
  moodAfter: string;
  note?: string;
};

export type OrderItemSnapshot = CartItem & {
  name: string;
  subtitle: string;
  price: number;
  accent: string;
  monogram: string;
};

export type Order = {
  id: string;
  createdAt: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  total: number;
  profile: CheckoutProfile;
};
