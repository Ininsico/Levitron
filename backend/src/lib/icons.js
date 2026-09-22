import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/**
 * The icons a slide may use, and the only names the model is allowed to pick.
 *
 * Deliberately a curated subset rather than all 2112 Lucide icons: it keeps the
 * model on icons that mean something on a slide, and every name here was
 * checked against lucide-react 1.47.0 before being listed.
 */

export const SLIDE_ICONS = [
  'activity',
  'archive',
  'at-sign',
  'award',
  'bar-chart-3',
  'blocks',
  'book-open',
  'bookmark',
  'bot',
  'box',
  'brain',
  'building-2',
  'calendar-check',
  'calendar-days',
  'check-square',
  'circle-check-big',
  'clipboard-check',
  'clipboard-list',
  'cloud-upload',
  'code-2',
  'compass',
  'component',
  'cpu',
  'crosshair',
  'database',
  'dollar-sign',
  'external-link',
  'factory',
  'file-text',
  'filter',
  'flag',
  'flame',
  'folder-open',
  'gauge',
  'git-branch',
  'globe',
  'graduation-cap',
  'handshake',
  'hash',
  'history',
  'hourglass',
  'image',
  'key-round',
  'layers',
  'layers-3',
  'layout-grid',
  'leaf',
  'lightbulb',
  'line-chart',
  'link-2',
  'list-checks',
  'lock-keyhole',
  'mail',
  'map',
  'map-pin',
  'message-square',
  'messages-square',
  'microscope',
  'minus',
  'monitor',
  'network',
  'newspaper',
  'orbit',
  'package-open',
  'palette',
  'percent',
  'pie-chart',
  'plus',
  'presentation',
  'puzzle',
  'radar',
  'refresh-cw',
  'rocket',
  'route',
  'scale',
  'search',
  'server-cog',
  'share-2',
  'shield-alert',
  'shield-check',
  'sliders-horizontal',
  'smartphone',
  'target',
  'terminal-square',
  'timer',
  'timer-reset',
  'trending-down',
  'trending-up',
  'trophy',
  'user-check',
  'user-round',
  'users',
  'watch',
  'workflow',
  'zap',
]

const iconCache = new Map()

export function isKnownIcon(name) {
  return SLIDE_ICONS.includes(String(name ?? '').trim().toLowerCase())
}

export function normalizeIcon(name) {
  const candidate = String(name ?? '').trim().toLowerCase()

  return isKnownIcon(candidate) ? candidate : ''
}

/**
 * Returns the icon as a standalone SVG string with the colour baked in —
 * `currentColor` means nothing inside a .pptx, so it has to be resolved here.
 * Cached because exports can reference the same icon many times.
 */
export async function iconSvg(name, color) {
  const key = `${name}:${color}`

  if (iconCache.has(key)) return iconCache.get(key)

  const svg = await readFile(require.resolve(`lucide-static/icons/${name}.svg`), 'utf8')
  const colored = svg.replaceAll('currentColor', `#${color}`)

  iconCache.set(key, colored)

  return colored
}

export function iconDataUri(svg) {
  return `image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}
