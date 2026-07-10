export type ShippingProfile = {
  receiverName: string;
  phone: string;
  address: string;
  deliveryPreference: string;
  deliveryCompletion: "never" | "signed";
};

/**
 * 应用统一账号形状。id 在云端为 Supabase auth.users 的 uuid；
 * 未配置 Supabase 的本地降级模式下为 `mock-<email>`。
 */
export type MockUser = {
  id: string;
  email?: string;
  phone?: string;
  username: string;
  avatarColor: string;
  shipping?: ShippingProfile;
  createdAt: string;
  onboarded: boolean;
  /** 来自 Supabase 匿名登录的游客（可浏览/攒进度，但不能下单/进账号页）。 */
  isAnonymous?: boolean;
};

export type AccountSnapshot = {
  user: MockUser;
  updatedAt: string;
  orders: unknown[];
  assets: unknown;
  cart: unknown[];
  shares: unknown[];
};
