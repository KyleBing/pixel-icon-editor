import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 线上路径：https://kylebing.cn/tools/pixel-icon-editor/
  base: '/tools/pixel-icon-editor/',
  server: {
    port: 5174,
  },
})
