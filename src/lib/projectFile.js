/**
 * 作品文件 .pixelicon.json
 * 色索引 0黑 1白 2黄 3红；模板可选 base64 嵌入
 */

import { normalizeTemplateViewExport } from './iconStore.js'
// normalizeTemplateViewExport 与 store 内 normalize 一致
import {
  templateUid,
  putTemplateBlob,
  getTemplateBlob,
} from './templateDb.js'

export const PROJECT_FORMAT = 'pixel-icon-editor'
export const PROJECT_VERSION = 1
export const PROJECT_EXT = '.pixelicon.json'

function uid() {
  return `i_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

async function blobToBase64(blob) {
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToBlob(b64, mime) {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime || 'application/octet-stream' })
}

/**
 * @param {object[]} icons
 * @param {{ includeTemplates?: boolean, onlyActiveId?: string|null }} opts
 */
export async function buildProjectFile(icons, opts = {}) {
  const includeTemplates = opts.includeTemplates !== false
  const list = opts.onlyActiveId
    ? icons.filter((i) => i.id === opts.onlyActiveId)
    : icons

  // templateId → 嵌入块（多图标共用同一模板只嵌一次）
  const embedded = new Map()
  if (includeTemplates) {
    for (const icon of list) {
      if (!icon.templateId || embedded.has(icon.templateId)) continue
      const blob = await getTemplateBlob(icon.templateId)
      if (!blob) continue
      const dataBase64 = await blobToBase64(blob)
      embedded.set(icon.templateId, {
        id: icon.templateId,
        mime: blob.type || 'image/png',
        dataBase64,
      })
    }
  }

  const outIcons = list.map((icon) => {
    const entry = {
      name: icon.name,
      w: icon.w,
      h: icon.h,
      pixels: Array.from(icon.pixels),
      templateView: normalizeTemplateViewExport(icon.templateView),
    }
    if (includeTemplates && icon.templateId && embedded.has(icon.templateId)) {
      entry.templateRef = icon.templateId
    }
    return entry
  })

  return {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    exportedAt: new Date().toISOString(),
    templates: includeTemplates ? [...embedded.values()] : [],
    icons: outIcons,
  }
}

export function downloadProjectJson(filename, project) {
  const text = JSON.stringify(project, null, 2)
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename.endsWith('.json') ? filename : `${filename}${PROJECT_EXT}`
  a.click()
  URL.revokeObjectURL(a.href)
}

/**
 * 解析并导入作品 → 可写入 store 的图标列表
 * @returns {Promise<{ icons: object[], warnings: string[] }>}
 */
export async function parseProjectFile(text) {
  const warnings = []
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('不是有效的 JSON')
  }
  if (data.format && data.format !== PROJECT_FORMAT) {
    warnings.push(`未知 format: ${data.format}，仍尝试导入`)
  }
  if (!Array.isArray(data.icons) || !data.icons.length) {
    throw new Error('文件中没有 icons')
  }

  // 嵌入模板写入 IDB，旧 id → 新 id
  const idMap = new Map()
  const templates = Array.isArray(data.templates) ? data.templates : []
  for (const t of templates) {
    if (!t?.dataBase64) continue
    const newId = templateUid()
    const blob = base64ToBlob(t.dataBase64, t.mime || 'image/png')
    await putTemplateBlob(newId, blob)
    if (t.id) idMap.set(t.id, newId)
  }

  // 兼容：模板直接挂在 icon.template 上
  const icons = []
  for (const raw of data.icons) {
    const w = Math.max(1, Math.min(256, Number(raw.w) || 0))
    const h = Math.max(1, Math.min(256, Number(raw.h) || 0))
    if (!w || !h || !Array.isArray(raw.pixels)) {
      warnings.push(`跳过无效图标: ${raw.name || '?'}`)
      continue
    }
    const need = w * h
    const pixels = new Uint8Array(need)
    for (let i = 0; i < need; i++) {
      pixels[i] = (raw.pixels[i] ?? 1) & 3
    }

    let templateId = null
    if (raw.templateRef && idMap.has(raw.templateRef)) {
      templateId = idMap.get(raw.templateRef)
    } else if (raw.template?.dataBase64) {
      templateId = templateUid()
      const blob = base64ToBlob(
        raw.template.dataBase64,
        raw.template.mime || 'image/png',
      )
      await putTemplateBlob(templateId, blob)
    }

    icons.push({
      id: uid(),
      name: String(raw.name || 'imported').slice(0, 64),
      w,
      h,
      pixels,
      templateId,
      templateView: normalizeTemplateViewExport(raw.templateView),
    })
  }

  if (!icons.length) throw new Error('没有可导入的图标')
  return { icons, warnings }
}
