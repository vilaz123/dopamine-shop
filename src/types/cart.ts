export type CartItem = {
  slug: string;
  quantity: number;
  options: Record<string, string>;
  optionPriceDelta?: number;
  giftWrap?: boolean;
  addedAt?: string;
};
