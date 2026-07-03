export type CartItem = {
  slug: string;
  quantity: number;
  options: Record<string, string>;
  giftWrap?: boolean;
};
