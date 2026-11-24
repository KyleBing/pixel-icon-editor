# 像素图标编辑器

面向 **NOTE4C** 四色墨水屏（黑 / 白 / 黄 / 红）的像素图标绘制工具。

## 线上

https://kylebing.cn/tools/pixel-icon-editor/

仓库：https://github.com/KyleBing/pixel-icon-editor

## 本地

```bash
npm install
npm run dev      # http://localhost:5174/tools/pixel-icon-editor/
```

## 部署

```bash
npm run deploy
# build → rsync dist/ 到 kylebing.cn:/var/www/html/tools/pixel-icon-editor/
```

## 功能概要

- 自定义尺寸、四色笔刷、2×2 合成色
- 多图标暂存（localStorage）+ 侧栏缩略图 / 图库
- 背景模板描摹（IndexedDB 持久化；复制图标共用同一模板文件）
- 对称 / 旋转辅助绘制；滚轮缩放画布；空格拖动画布
- 导出 PNG、固件 2bpp `.h`
- **作品导入 / 导出**（`.pixelicon.json`）

## 快捷键

| 按键 | 说明 |
| --- | --- |
| `B` | 笔刷 |
| `E` | 橡皮 |
| 空格 + 拖动 | 平移画布 |
| 滚轮 | 缩放绘制区 |
| `Alt` + 滚轮 | 缩放背景模板 |
| `⌘/Ctrl` + `Z` | 撤销（最多 50 步） |
| `⌘/Ctrl` + `⇧Z` / `Y` | 重做 |

## 作品文件 `.pixelicon.json`

用于在浏览器之间备份、分享完整作品（像素 + 可选模板图）。

### 导出

- **导出作品**：当前图标 → 单个 `.pixelicon.json`（含模板原图 base64，若有）
- **导出全部**：侧栏全部图标打成一个包；相同模板只嵌入一份，图标用 `templateRef` 引用

### 导入

- **导入作品**：选择 `.pixelicon.json`，图标追加到侧栏（新 id）；模板写入本机 IndexedDB  
- 不会覆盖已有图标，可反复导入

### 格式说明（version 1）

```json
{
  "format": "pixel-icon-editor",
  "version": 1,
  "exportedAt": "2026-11-23T00:00:00.000Z",
  "templates": [
    {
      "id": "t_xxx",
      "mime": "image/png",
      "dataBase64": "..."
    }
  ],
  "icons": [
    {
      "name": "sunny",
      "w": 32,
      "h": 32,
      "pixels": [1, 0, 2, 3],
      "templateView": {
        "scale": 1,
        "opacity": 0.45,
        "x": 0,
        "y": 0,
        "drag": false,
        "whiteTransparent": true
      },
      "templateRef": "t_xxx"
    }
  ]
}
```

| 字段 | 说明 |
| --- | --- |
| `pixels` | 行优先色索引：`0` 黑 / `1` 白 / `2` 黄 / `3` 红 |
| `templates` | 可选；模板原图列表 |
| `templateRef` | 指向 `templates[].id` |
| `templateView` | 模板在画布上的缩放、透明度、偏移等 |

固件侧仍用顶栏 **固件 .h** 导出 2bpp `PROGMEM` 数组（与 `rasterize_icons.py` 打包一致）。
