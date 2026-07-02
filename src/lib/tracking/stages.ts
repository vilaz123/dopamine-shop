export type TrackingDefinition = {
  key: string;
  label: string;
  offsetMinutes: number;
  note: string;
};

export const trackingDefinitions: TrackingDefinition[] = [
  { key: "confirmed", label: "虚拟订单已创建", offsetMinutes: 0, note: "购买冲动已被温柔收纳。" },
  { key: "packed", label: "幻想仓库打包中", offsetMinutes: 3, note: "商品被不存在的丝纸包裹。" },
  { key: "picked", label: "幻象快递员已揽收", offsetMinutes: 10, note: "他骑着一辆只在脑海里出现的银色单车。" },
  { key: "transit", label: "正在穿越平行街区", offsetMinutes: 45, note: "路径优雅，但目的地并不存在。" },
  { key: "delayed", label: "包裹因不存在而延迟", offsetMinutes: 180, note: "这是一个好消息：你的钱包没有受伤。" },
  { key: "signed", label: "已由理智签收", offsetMinutes: 1440, note: "如果明天还想买，再认真考虑。" },
];

export function getTrackingProgress(createdAt: string, now = new Date()) {
  const created = new Date(createdAt).getTime();
  const current = now.getTime();
  return trackingDefinitions.map((stage) => {
    const at = new Date(created + stage.offsetMinutes * 60_000);
    return {
      ...stage,
      at: at.toISOString(),
      reached: current >= at.getTime(),
    };
  });
}
