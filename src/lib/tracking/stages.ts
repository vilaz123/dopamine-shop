import type { DeliveryFlavor } from "@/types/product";

export type TrackingDefinition = {
  key: string;
  label: string;
  offsetMinutes: number;
  note: string;
  terminal?: boolean;
};

export const parcelStages: TrackingDefinition[] = [
  { key: "placed", label: "下单成功", offsetMinutes: 0, note: "订单已提交，多巴胺仓已锁定虚拟库存。" },
  { key: "paid", label: "虚拟支付完成", offsetMinutes: 1, note: "实际扣款 ¥0，无需真实支付。" },
  { key: "accepted", label: "商家已接单", offsetMinutes: 3, note: "幻想商家确认订单，开始准备商品。" },
  { key: "packing", label: "商品开始打包", offsetMinutes: 5, note: "正在装入闪光包装袋与不存在的防撞气泡。" },
  { key: "assigned", label: "已分配虚拟快递员", offsetMinutes: 12, note: "快递员编号 DH-∞ 已接单。" },
  { key: "picked", label: "快递员已揽收", offsetMinutes: 20, note: "包裹离开多巴胺仓，进入幻想物流网络。" },
  { key: "hub", label: "到达幻想中转站", offsetMinutes: 35, note: "包裹在平行街区完成扫描。" },
  { key: "delivering", label: "派送中", offsetMinutes: 50, note: "永远在路上，永远不会真正签收。", terminal: true },
];

export const riderStages: TrackingDefinition[] = [
  { key: "placed", label: "下单成功", offsetMinutes: 0, note: "外卖订单已提交，热量不会落地。" },
  { key: "accepted", label: "商家已接单", offsetMinutes: 1, note: "门店已接单，开始不存在地备餐。" },
  { key: "cooking", label: "后厨开始制作", offsetMinutes: 3, note: "锅气、奶茶香和烧烤声都只在脑内发生。" },
  { key: "riderAssigned", label: "已分配骑手", offsetMinutes: 8, note: "骑手 DH-Rider 正在赶往商家。" },
  { key: "arrived", label: "骑手已到店", offsetMinutes: 12, note: "骑手在门口等一份永远不会冷掉的餐。" },
  { key: "pickedup", label: "骑手已取餐", offsetMinutes: 15, note: "餐品已放进虚拟保温箱。" },
  { key: "delivering", label: "骑手配送中", offsetMinutes: 20, note: "永远差一栋楼，永远不会真正送达。", terminal: true },
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
