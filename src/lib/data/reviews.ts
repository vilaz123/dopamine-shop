import type { Review } from "@/types/review";

export const seededReviews: Review[] = [
  {
    id: "seed-1",
    productSlug: "noir-velvet-parfum",
    rating: 5,
    title: "闻不到，但很高级",
    body: "下单之后我冷静了，感觉自己像省了九百块。",
    author: "Mira",
    createdAt: "2026-06-18T20:31:00.000Z",
  },
  {
    id: "seed-2",
    productSlug: "silver-mist-headphones",
    rating: 5,
    title: "旧耳机突然又能用了",
    body: "物流永远不到，但我的钱包保住了。五星。",
    author: "V",
    createdAt: "2026-06-21T12:08:00.000Z",
  },
  {
    id: "seed-3",
    productSlug: "moon-archive-tote",
    rating: 4,
    title: "很好地装下了冲动",
    body: "包没有收到，理智收到了。",
    author: "Luna",
    createdAt: "2026-06-24T22:44:00.000Z",
  },
  {
    id: "seed-4",
    productSlug: "midnight-tactile-keyboard",
    rating: 5,
    title: "虚拟 thock 很治愈",
    body: "差点真实买键盘，先在这里下了一单，十分钟后恢复清醒。",
    author: "Noah",
    createdAt: "2026-06-26T15:10:00.000Z",
  },
  {
    id: "seed-5",
    productSlug: "silent-luxury-chair",
    rating: 5,
    title: "不占地的椅子就是好椅子",
    body: "客厅没有变挤，余额没有变少，心情变好了。",
    author: "Iris",
    createdAt: "2026-06-29T09:20:00.000Z",
  },
];
