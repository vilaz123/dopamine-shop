export type ShippingProfile = {
  receiverName: string;
  phone: string;
  address: string;
  deliveryPreference: string;
};

export type MockUser = {
  id: string;
  phone: string;
  username: string;
  avatarColor: string;
  shipping?: ShippingProfile;
  createdAt: string;
  onboarded: boolean;
};

export type AccountSnapshot = {
  user: MockUser;
  updatedAt: string;
  orders: unknown[];
  assets: unknown;
  cart: unknown[];
  shares: unknown[];
};
