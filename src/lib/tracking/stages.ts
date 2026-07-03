import type { DeliveryFlavor } from "@/types/product";

export type TrackingDefinition = {
  key: string;
  label: string;
  offsetMinutes: number;
  note: string;
  terminal?: boolean;
};

export const parcelStages: TrackingDefinition[] = [
  { key: "placed", label: "订单已提交", offsetMinutes: 0, note: "多巴胺仓已收到你的虚拟订单。" },
  { key: "paid", label: "虚拟支付完成", offsetMinutes: 1, note: "无需真实扣款，快乐已到账。" },
  { key: "preparing", label: "商家备货中", offsetMinutes: 5, note: "不存在的仓库开始忙碌。" },
  { key: "packed", label: "打包出库", offsetMinutes: 12, note: "包裹被闪光包装纸温柔包住。" },
  { key: "picked", label: "快递揽收", offsetMinutes: 24, note: "虚拟快递员已取走包裹。" },
  { key: "transit", label: "运输中转", offsetMinutes: 45, note: "正在穿越平行街区。" },
  { key: "delivering", label: "派送中", offsetMinutes: 60, note: "永远在路上，永远不会真正打扰你。", terminal: true },
];

export const riderStages: TrackingDefinition[] = [
  { key: "placed", label: "订单已提交", offsetMinutes: 0, note: "外卖冲动已被接住。" },
  { key: "accepted", label: "商家已接单", offsetMinutes: 1, note: "厨房开始不存在地备餐。" },
  { key: "cooking", label: "正在备餐", offsetMinutes: 5, note: "香气只在脑内扩散。" },
  { key: "pickedup", label: "骑手已取餐", offsetMinutes: 12, note: "骑手骑着银色单车出发。" },
  { key: "delivering", label: "骑手配送中", offsetMinutes: 20, note: "永远差一栋楼，热量永远不落地。", terminal: true },
];

export function getTrackingProgress(createdAt: string, flavor: DeliveryFlavor = "parcel", now = new Date()) {
  const stages = flavor === "rider" ? riderStages : parcelStages;
  const created = new Date(createdAt).getTime();
  const current = now.getTime();
  return stages.map((stage) => {
    const at = new Date(created + stage.offsetMinutes * 60_000);
    return {
      ...stage,
      at: at.toISOString(),
      reached: current >= at.getTime(),
    };
  });
}
