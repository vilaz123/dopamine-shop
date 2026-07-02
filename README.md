# VoidCart / Dopamine Shop

一个“假装消费”的虚拟购物网站：可以浏览商品、加入购物车、虚拟下单、阅读/发布本地评论、查看幻想物流，但不会真实付款，也不会真实发货。

## 第一阶段特性

- Next.js App Router + TypeScript + Tailwind CSS
- 静态导出，运行时不需要服务器
- 商品数据本地化，无外部 API
- 购物车、订单、用户评论保存在浏览器 LocalStorage
- 高级时尚视觉：暖白、墨黑、古金、杂志式排版
- 商品视觉使用 CSS/SVG 风格纹章，不依赖远程图片
- 可分享给他人：构建后的 `out/` 是纯静态站

## 本地开发

```bash
npm install
npm run dev
```
  你可以在当前会话里手动运行：

  ! cd /Users/vz/dopamine-shop && npm install

  然后继续运行：

  ! cd /Users/vz/dopamine-shop && npm run type-check
  ! cd /Users/vz/dopamine-shop && npm run build
  ! cd /Users/vz/dopamine-shop && npm run dev

  如果安装和构建过程中报错，把输出发我，我会继续修。
  如果顺利，访问：

  http://localhost:3000

  即可看到网站
  
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

## 分享给他人使用

### 方式 1：部署到静态托管

将 `out/` 上传到：

- Vercel
- Cloudflare Pages
- Netlify
- GitHub Pages
- 腾讯云 COS / 阿里云 OSS / S3
- 任意 Nginx 静态目录

### 方式 2：打包发送

```bash
zip -r voidcart-out.zip out
```

对方解压后用任意静态服务器打开即可。

注意：订单和评论是 LocalStorage，本地存储在每个访问者自己的浏览器中，不会互相同步。

## 产品边界

VoidCart 是虚拟购物体验工具：

- 不销售真实商品
- 不接入真实支付
- 不提供真实配送
- 不收集真实地址
- 所有订单都是虚拟记录

## 后续升级路线

当前 UI 已经通过 `src/lib/services/*` 预留数据服务接口。

后续可以增加：

1. `src/lib/services/remote/*`：远程 API 实现
2. Next.js API Routes 或独立后端
3. 数据库：Postgres / Supabase / Turso
4. 用户登录：Auth.js / Supabase Auth / Clerk
5. 后台商品管理
6. AI 生成虚拟商品
7. PWA 离线安装

升级时尽量保持页面组件继续调用 service 接口，避免整体重写。
