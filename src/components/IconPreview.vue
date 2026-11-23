<script setup>
import { ref, watch, nextTick } from 'vue'
import { pixelsToImageData } from '../lib/colors.js'
import { activeIcon } from '../lib/iconStore.js'

const cv1 = ref(null)
const cv2 = ref(null)

function paint(el, scale) {
  const icon = activeIcon.value
  if (!el || !icon) return
  const { w, h, pixels } = icon
  el.width = w * scale
  el.height = h * scale
  const ctx = el.getContext('2d')
  ctx.imageSmoothingEnabled = false
  const tiny = document.createElement('canvas')
  tiny.width = w
  tiny.height = h
  tiny.getContext('2d').putImageData(pixelsToImageData(pixels, w, h, 1), 0, 0)
  ctx.clearRect(0, 0, el.width, el.height)
  // 棋盘底，便于看白像素
  const cell = Math.max(4, scale)
  for (let y = 0; y < el.height; y += cell) {
    for (let x = 0; x < el.width; x += cell) {
      ctx.fillStyle = ((x / cell + y / cell) & 1) === 0 ? '#eceae4' : '#f7f5f0'
      ctx.fillRect(x, y, cell, cell)
    }
  }
  ctx.drawImage(tiny, 0, 0, el.width, el.height)
}

function refresh() {
  nextTick(() => {
    paint(cv1.value, 1)
    paint(cv2.value, 2)
  })
}

watch(activeIcon, refresh, { deep: true, immediate: true })
</script>

<template>
  <div class="icon-preview-bar">
    <div class="prev-block">
      <span class="prev-lab">1:1</span>
      <div class="prev-frame">
        <canvas ref="cv1" />
      </div>
    </div>
    <div class="prev-block">
      <span class="prev-lab">2×</span>
      <div class="prev-frame">
        <canvas ref="cv2" />
      </div>
    </div>
  </div>
</template>
