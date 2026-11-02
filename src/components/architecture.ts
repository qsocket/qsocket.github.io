import {all, el, on, svg} from '../lib/dom'
import { icon } from '../lib/icons'
import { TOPOLOGY, type TopologyNode } from '../data/content'

/**
 * The "Connection Architecture" diagram.
 *
 * The original version was broken in three separate ways:
 *
 *  1. The connector SVG was absolutely positioned over the node row with hard
 *     coded offsets (`px-20 top-14`), so it only lined up at one viewport
 *     width.
 *  2. It used `viewBox="0 0 600 48"` with `preserveAspectRatio="none"`, which
 *     scales x and y by different factors. The packets were animated with a
 *     CSS `translateX(180px)`, which is resolved in *user units*, while the
 *     lines they were meant to travel are 150 user units long — so the dots
 *     overshot the nodes, by a margin that changed with the window width.
 *  3. The whole thing was `hidden md:block`, so the diagram simply did not
 *     exist on a phone.
 *
 * This version measures where the node buttons actually ended up and draws the
 * connectors between those measured points, so the geometry is correct at
 * every width and in both the horizontal (wide) and stacked (narrow) layouts.
 * Packets ride the measured path with `offset-path`, which means the motion is
 * defined by the same path that is drawn rather than by a magic number.
 */

/** How far short of a node's edge a connector stops, in pixels. */
const NODE_GAP = 8

interface Flow {
  readonly from: number
  readonly to: number
  /** Seconds. */
  readonly duration: number
  readonly delay: number
  readonly reverse: boolean
}

const FLOWS: readonly Flow[] = [
  { from: 0, to: 1, duration: 2.4, delay: 0, reverse: false },
  { from: 0, to: 1, duration: 2.8, delay: 0.7, reverse: true },
  { from: 1, to: 2, duration: 2.4, delay: 0.4, reverse: false },
  { from: 1, to: 2, duration: 2.8, delay: 1.1, reverse: true },
]

const supportsOffsetPath = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('offset-path', 'path("M 0 0 L 1 1")')

function nodeButton(node: TopologyNode, index: number): HTMLButtonElement {
  const accent = node.accent === 'primary' ? 'text-primary' : 'text-secondary'

  return el(
    'button',
    {
      type: 'button',
      class:
        'topo-node group flex size-14 items-center justify-center rounded-md border ' +
        'border-surface-container-high/60 bg-surface-container shadow-sm transition-all ' +
        'duration-200 hover:border-primary/40 sm:size-16 ' +
        'data-[active=true]:border-primary data-[active=true]:bg-surface-container-high ' +
        'data-[active=true]:shadow-[0_0_24px_-4px_rgb(164_210_166/0.35)]',
      role: 'tab',
      id: `topo-tab-${node.id}`,
      'aria-controls': 'topo-detail',
      'aria-selected': String(index === 0),
      'data-active': String(index === 0),
      dataset: { node: node.id, index: String(index) },
      tabindex: index === 0 ? '0' : '-1',
    },
    node.image
      ? el('img', {
          src: node.image,
          alt: '',
          width: '30',
          height: '30',
          decoding: 'async',
          class:
            'size-[26px] object-contain opacity-90 transition-all ' +
            'group-hover:scale-110 group-hover:opacity-100 sm:size-[30px]',
        })
      : icon(
          node.icon,
          `${accent} transition-transform group-hover:scale-110`,
          28,
        ),
    el('span', { class: 'sr-only' }, `${node.badge}: ${node.name}`),
  )
}

export function createArchitecture(): HTMLElement {
  const connectorLayer = svg('svg', {
    class: 'pointer-events-none absolute inset-0 size-full overflow-visible',
    'aria-hidden': 'true',
    fill: 'none',
    preserveAspectRatio: 'none',
  })

  const nodes = TOPOLOGY.map((node, index) =>
    el(
      'div',
      {
        class:
          'relative z-10 flex items-center gap-4 text-left ' +
          'sm:flex-col sm:gap-3 sm:text-center',
        role: 'presentation',
      },
      nodeButton(node, index),
      el(
        'div',
        { class: 'space-y-0.5' },
        el(
          'span',
          { class: 'block text-[11px] font-semibold uppercase tracking-wider text-outline' },
          node.badge,
        ),
        el('p', { class: 'text-sm font-semibold text-on-surface' }, node.name),
        el('p', { class: 'font-mono text-xs text-outline' }, node.detail),
      ),
    ),
  )

  const nodeGrid = el(
    'div',
    {
      class: 'relative grid grid-cols-1 gap-14 sm:grid-cols-3 sm:gap-6',
      role: 'tablist',
      'aria-label': 'Connection architecture steps',
    },
    ...nodes,
  )

  const stage = el(
    'div',
    { class: 'relative py-4' },
    connectorLayer,
    nodeGrid,
  )

  const stepChip = el(
    'span',
    {
      class:
        'inline-flex items-center rounded border border-primary/20 bg-primary/15 px-2 py-0.5 ' +
        'text-[11px] font-semibold uppercase tracking-wider text-primary',
    },
    TOPOLOGY[0]!.step,
  )
  const detailTitle = el('h3', { class: 'text-base font-semibold text-on-surface' }, TOPOLOGY[0]!.title)
  const detailBody = el(
    'p',
    { class: 'text-sm leading-relaxed text-on-surface-variant' },
    TOPOLOGY[0]!.body,
  )

  const detail = el(
    'div',
    {
      class:
        'mt-2 space-y-2 rounded-md border border-surface-container-high bg-surface-container-high/50 p-5 ' +
        'transition-opacity duration-200',
      id: 'topo-detail',
      role: 'tabpanel',
      'aria-live': 'polite',
      tabindex: '0',
    },
    stepChip,
    detailTitle,
    detailBody,
  )

  const section = el(
    'div',
    {
      id: 'architecture',
      class:
        'entrance mx-auto mt-12 w-full max-w-4xl scroll-mt-24 rounded-md border ' +
        'border-surface-container-high/50 bg-surface-container-low p-5 text-left shadow-sm ' +
        'transition-colors duration-300 hover:border-primary/20 sm:p-7',
      style: 'animation-delay:0.32s',
    },
    el(
      'div',
      {
        class:
          'flex flex-col items-start justify-between gap-3 border-b border-surface-container-high/60 ' +
          'pb-4 sm:flex-row sm:items-center',
      },
      el(
        'div',
        { class: 'flex items-center gap-2' },
        el(
          'span',
          { class: 'relative flex size-2.5', 'aria-hidden': 'true' },
          el('span', {
            class: 'absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75',
          }),
          el('span', { class: 'relative inline-flex size-2.5 rounded-full bg-primary' }),
        ),
        el('h2', { class: 'text-sm font-medium text-on-surface' }, 'Connection Architecture'),
      ),
      el(
        'div',
        {
          class:
            'inline-flex items-center gap-1.5 rounded-full border border-primary/20 ' +
            'bg-surface-container-high px-2.5 py-0.5 font-mono text-[11px] text-primary',
        },
        el('span', { class: 'size-1.5 rounded-full bg-primary', 'aria-hidden': 'true' }),
        'Encrypted end to end',
      ),
    ),
    stage,
    detail,
  )

  mountConnectors(stage, connectorLayer, nodeGrid)
  mountNodeSelection(nodeGrid, { stepChip, detailTitle, detailBody, detail })

  return section
}

/* -------------------------------------------------------------------------- */
/* Connectors                                                                  */
/* -------------------------------------------------------------------------- */

function mountConnectors(
  stage: HTMLElement,
  layer: SVGSVGElement,
  grid: HTMLElement,
): void {
  const canAnimate = supportsOffsetPath()

  const draw = (): void => {
    const stageBox = stage.getBoundingClientRect()
    if (stageBox.width === 0 || stageBox.height === 0) return

    const buttons = all<HTMLElement>('.topo-node', grid)
    if (buttons.length < 2) return

    // The SVG shares the stage's coordinate system 1:1, so a `viewBox` in CSS
    // pixels keeps `stroke-width` and the packet radius visually constant
    // instead of stretching with the container.
    layer.setAttribute('viewBox', `0 0 ${stageBox.width} ${stageBox.height}`)
    layer.replaceChildren()

    const centres = buttons.map((button) => {
      const box = button.getBoundingClientRect()
      return {
        x: box.left - stageBox.left + box.width / 2,
        y: box.top - stageBox.top + box.height / 2,
        radius: Math.max(box.width, box.height) / 2,
      }
    })

    for (const [flowIndex, flow] of FLOWS.entries()) {
      const from = centres[flow.from]
      const to = centres[flow.to]
      if (!from || !to) continue

      const d = connectorPath(from, to)
      if (d === null) continue

      // One base line per pair; the second flow of a pair reuses it.
      if (!flow.reverse) {
        layer.append(
          svg('path', {
            d,
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-dasharray': '4 4',
            'stroke-opacity': '0.35',
            class: 'text-primary',
          }),
        )
      }

      if (!canAnimate) continue

      const packet = svg('circle', {
        r: flow.reverse ? '2.5' : '3.5',
        cx: '0',
        cy: '0',
        fill: flow.reverse ? 'var(--color-secondary)' : 'var(--color-primary)',
        opacity: flow.reverse ? '0.8' : '1',
      })

      packet.style.offsetPath = `path("${d}")`
      packet.style.offsetRotate = '0deg'
      packet.style.animation = `qs-packet ${flow.duration}s cubic-bezier(0.4, 0, 0.2, 1) ${flow.delay}s infinite`
      if (flow.reverse) packet.style.animationDirection = 'reverse'
      packet.dataset['flow'] = String(flowIndex)

      layer.append(packet)
    }
  }

  // Measure after layout settles, and again whenever it changes.
  requestAnimationFrame(draw)

  const observer = new ResizeObserver(() => draw())
  observer.observe(stage)

  // Web fonts change the node row's metrics once they land.
  if ('fonts' in document) {
    void document.fonts.ready.then(() => draw())
  }

  on(window, 'resize', () => draw(), { passive: true })
}

interface Centre {
  readonly x: number
  readonly y: number
  readonly radius: number
}

/**
 * A straight connector between two node centres, trimmed back to each node's
 * edge so the line never runs underneath the button.
 *
 * Returns `null` when the nodes overlap, which happens briefly during layout.
 */
function connectorPath(from: Centre, to: Centre): string | null {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy)

  const startOffset = from.radius + NODE_GAP
  const endOffset = to.radius + NODE_GAP
  if (length <= startOffset + endOffset) return null

  const ux = dx / length
  const uy = dy / length

  const x1 = round(from.x + ux * startOffset)
  const y1 = round(from.y + uy * startOffset)
  const x2 = round(to.x - ux * endOffset)
  const y2 = round(to.y - uy * endOffset)

  return `M ${x1} ${y1} L ${x2} ${y2}`
}

const round = (value: number): number => Math.round(value * 100) / 100

/* -------------------------------------------------------------------------- */
/* Node selection                                                              */
/* -------------------------------------------------------------------------- */

interface DetailRefs {
  stepChip: HTMLElement
  detailTitle: HTMLElement
  detailBody: HTMLElement
  detail: HTMLElement
}

function mountNodeSelection(grid: HTMLElement, refs: DetailRefs): void {
  const buttons = all<HTMLButtonElement>('.topo-node', grid)

  const select = (index: number, moveFocus: boolean): void => {
    const node = TOPOLOGY[index]
    const button = buttons[index]
    if (!node || !button) return

    for (const [i, candidate] of buttons.entries()) {
      const active = i === index
      candidate.dataset['active'] = String(active)
      candidate.setAttribute('aria-selected', String(active))
      candidate.tabIndex = active ? 0 : -1
    }

    refs.detail.setAttribute('aria-labelledby', `topo-tab-${node.id}`)
    refs.stepChip.textContent = node.step
    refs.detailTitle.textContent = node.title
    refs.detailBody.textContent = node.body

    if (moveFocus) button.focus()
  }

  for (const [index, button] of buttons.entries()) {
    button.addEventListener('click', () => select(index, false))
  }

  // Roving tabindex, per the WAI-ARIA tabs pattern.
  grid.addEventListener('keydown', (event) => {
    const current = buttons.findIndex((button) => button.dataset['active'] === 'true')
    if (current < 0) return

    const last = buttons.length - 1
    let next: number | null = null

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = current === last ? 0 : current + 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = current === 0 ? last : current - 1
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = last
        break
      default:
        return
    }

    event.preventDefault()
    select(next, true)
  })
}
