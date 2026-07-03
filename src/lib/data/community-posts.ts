import type { CommunityPost } from "@/types/community";

export const communityTopics = ["今日虚拟战利品", "我省下的钱", "骑手还在路上", "晒单领币", "差点真实下单", "深夜外卖幻觉", "轻奢无痛拥有"];

export const seededCommunityPosts: CommunityPost[] = [
  {
    id: "seed-community-1",
    author: "Mira",
    title: "差点买唇釉，先在多巴胺仓下了一单",
    body: "规格选了草莓闪三支装，下单成功弹窗出现以后就没那么想真实买了。",
    topic: "我省下的钱",
    relatedProductSlugs: ["glow-lip-kit"],
    savedAmount: 299,
    likes: 128,
    comments: [],
    createdAt: "2026-07-01T12:00:00.000Z",
  },
  {
    id: "seed-community-2",
    author: "Noah",
    title: "骑手还在路上，但我已经不饿了",
    body: "深夜炸鸡套餐永远骑手配送中，这个设定真的救了我的宵夜冲动。",
    topic: "骑手还在路上",
    relatedProductSlugs: ["midnight-fried-chicken"],
    savedAmount: 88,
    likes: 256,
    comments: [],
    createdAt: "2026-07-01T23:30:00.000Z",
  },
];
