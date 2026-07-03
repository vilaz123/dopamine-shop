# Dopahub 多巴胺仓

Dopahub 多巴胺仓是一个“虚拟消费代偿”网站：复刻真实电商的浏览、推荐、加购、满减、下单、物流、晒单和资产体系，但完全移除真实扣款与真实配送。

## 第一阶段特性

- Next.js App Router + TypeScript + Tailwind CSS
- 静态导出，适合 GitHub Pages
- 商品、优惠券、勋章、物流全为本地数据
- 购物车、订单、晒单、虚拟资产保存在浏览器 LocalStorage
- 首页推荐信息流、虚拟爆款、虚拟外卖专区
- 高饱和商品卡、TOP/库存/已下单标签
- 多巴胺币、XP、等级、勋章、虚拟囤货库存
- 一键虚拟下单，实际扣款永远 ¥0
- 物流永远停在“派送中 / 骑手配送中”

## 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 构建静态站

```bash
npm run build
```

构建完成后会生成：

```text
out/
```

可以直接部署这个目录。

## 本地预览静态产物

```bash
npm run preview
```

或使用任意静态服务器：

```bash
npx serve out -l 4321
```

## GitHub Pages

仓库路径部署保持：

```text
https://vilaz123.github.io/dopamine-shop/
```

GitHub Actions 会在 push 到 `main` 时自动构建并发布。

## 产品边界

Dopahub 多巴胺仓：

- 不销售真实商品
- 不接入真实支付
- 不提供真实配送
- 不收集真实地址
- 所有订单都是虚拟记录
- 第一阶段数据只存在访问者自己的浏览器中

## 初版备份

改版前的初版高级配色版本已复制到：

```text
/Users/vz/dopamine-shop-original
```

该目录不会干涉当前改版项目。
