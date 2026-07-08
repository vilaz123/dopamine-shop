import type { ProductCategory } from "@/types/product";

export const categories: Array<{ id: "all" | ProductCategory; label: string; description: string; accent: string }> = [
  { id: "all", label: "全部仓位", description: "所有让大脑亮起来的虚拟好物。", accent: "#ff4d6d" },
  { id: "beauty", label: "虚拟美妆", description: "口红、香氛、底妆，全部只扣多巴胺。", accent: "#ff4d6d" },
  { id: "designer-toys", label: "潮玩盲盒", description: "抽中快乐，不抽走余额。", accent: "#ff8a00" },
  { id: "clothing", label: "服饰穿搭", description: "今日穿搭灵感已拥有。", accent: "#a855f7" },
  { id: "snacks", label: "零食囤货", description: "囤满货架，不占柜子。", accent: "#22c55e" },
  { id: "tech", label: "数码装备", description: "参数拉满，扣款归零。", accent: "#06b6d4" },
  { id: "light-luxury", label: "轻奢好物", description: "仪式感到位，账单不到位。", accent: "#eab308" },
];
