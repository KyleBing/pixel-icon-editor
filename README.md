# 像素图标编辑器

面向 **NOTE4C** 四色墨水屏（黑 / 白 / 黄 / 红）的像素图标绘制工具。

## 线上

https://kylebing.cn/tools/pixel-icon-editor/

## 本地

```bash
npm install
npm run dev
```

## 部署

```bash
npm run deploy
# → rsync dist/ 到 kylebing.cn:/var/www/html/tools/pixel-icon-editor/
```

## 功能概要

- 自定义尺寸、四色笔刷、2×2 合成色
- 多图标暂存（localStorage）+ 侧栏缩略图 / 图库
- 背景模板描摹（IndexedDB 持久化，复制图标共用模板）
- 对称 / 旋转辅助绘制
- 导出 PNG 与固件可用的 2bpp `.h`
