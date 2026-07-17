/**
 * 骑手配送可视化：一张响应式 SVG “地图”——路网网格 + 街区色块 + 起点店铺/终点家 +
 * 弯曲配送路线，骑手 🛵 沿路线移动并永远差一栋楼（到不了终点又折返）。
 * 全部用 SVG user-unit 坐标，随 viewBox 等比缩放，任何尺寸都清晰；颜色跟随所在页面的 --page-* 主题变量。
 */
export function RiderMapMock({ etaMinutes, caption }: { etaMinutes?: number; caption?: string }) {
  const text = caption ?? (etaMinutes ? `预计 ${etaMinutes} 分钟后进入骑手配送中` : "骑手正在幻想路线中循环接近你");
  return (
    <div className="rider-map relative overflow-hidden rounded-3xl">
      <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" className="rider-map__svg" role="img" aria-label="骑手配送路线示意">
        <defs>
          <pattern id="rider-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>
        {/* 底图 + 路网 */}
        <rect x="0" y="0" width="100" height="60" className="rm-base" />
        <rect x="0" y="0" width="100" height="60" fill="url(#rider-grid)" className="rm-grid" />
        {/* 街区色块 */}
        <rect x="6"  y="8"  width="24" height="18" rx="3" className="rm-block" />
        <rect x="64" y="6"  width="30" height="16" rx="3" className="rm-block" />
        <rect x="10" y="40" width="26" height="16" rx="3" className="rm-block" />
        <rect x="66" y="40" width="26" height="16" rx="3" className="rm-block" />
        {/* 配送路线（弯曲虚线） */}
        <path d="M 12 46 C 24 30, 34 44, 44 30 S 64 14, 88 16" fill="none" className="rm-route" />
        {/* 起点：店铺 */}
        <g className="rm-pin rm-pin--start">
          <circle cx="12" cy="46" r="4.4" />
          <text x="12" y="46.4" font-size="4.4" text-anchor="middle" dominant-baseline="central">🏪</text>
        </g>
        {/* 终点：家 */}
        <g className="rm-pin rm-pin--end">
          <circle cx="88" cy="16" r="4.4" />
          <text x="88" y="16.4" font-size="4.4" text-anchor="middle" dominant-baseline="central">🏠</text>
        </g>
        {/* 骑手：沿路线移动，永远差一栋楼（到 88% 停一下再折返） */}
        <g>
          <circle r="4.6" className="rm-rider-glow" />
          <text font-size="6" text-anchor="middle" dominant-baseline="central">🛵</text>
          <animateMotion
            dur="7s"
            repeatCount="indefinite"
            calcMode="linear"
            keyTimes="0;0.62;0.82;1"
            keyPoints="0;0.88;0.88;0.02"
            path="M 12 46 C 24 30, 34 44, 44 30 S 64 14, 88 16"
          />
        </g>
      </svg>
      <p className="rider-map__caption">{text}</p>
    </div>
  );
}
