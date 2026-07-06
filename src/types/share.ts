export type ShareItem = {
  code: string;
  userId: string;
  type: "invite" | "product" | "order" | "asset_summary" | "community_post" | "profile";
  title: string;
  text: string;
  url: string;
  imageDataUrl?: string;
  createdAt: string;
  openedCount: number;
};
