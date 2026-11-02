import { svg, type Child } from './dom'

/**
 * Inline SVG icon set.
 *
 * The original page pulled Material Symbols from Google Fonts and wrote icon
 * names as element text (`<span class="material-symbols-outlined">dns</span>`),
 * relying on a ligature to turn them into glyphs. That has two failure modes
 * that both show up in practice: until the stylesheet lands the browser has no
 * rule binding the class to the font, so every icon renders as its literal
 * English name ("dns", "laptop_mac") and reflows the layout around it; and if
 * the font is blocked outright, it stays that way.
 *
 * These are plain geometry on a 24x24 grid, inlined into the bundle. No extra
 * request, no flash of fallback text, no layout shift.
 */

type Draw = () => Child[]

const line = (x1: number, y1: number, x2: number, y2: number) =>
  svg('line', { x1, y1, x2, y2 })

const rect = (x: number, y: number, w: number, h: number, rx = 2) =>
  svg('rect', { x, y, width: w, height: h, rx })

const circle = (cx: number, cy: number, r: number) => svg('circle', { cx, cy, r })

const path = (d: string) => svg('path', { d })

/** Icons drawn as solid shapes rather than strokes (vendor marks). */
const FILLED = new Set<string>(['windows', 'android'])

const ICONS: Record<string, Draw> = {
  /* --- navigation & chrome ------------------------------------------- */
  menu: () => [line(3, 6, 21, 6), line(3, 12, 21, 12), line(3, 18, 21, 18)],
  close: () => [line(5, 5, 19, 19), line(19, 5, 5, 19)],
  check: () => [path('M4 12.5 L9 17.5 L20 6.5')],
  code: () => [path('M8.5 7 L3.5 12 L8.5 17'), path('M15.5 7 L20.5 12 L15.5 17')],
  'open-in-new': () => [
    path('M14 4h6v6'),
    line(20, 4, 11.5, 12.5),
    path('M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10'),
  ],
  terminal: () => [path('M4.5 7 L9 11.5 L4.5 16'), line(11.5, 17, 19.5, 17)],
  bolt: () => [path('M13.5 2.5 L5 13.5h6l-.5 8L19 10.5h-6z')],
  flask: () => [
    path('M9.5 3v6.2L4.6 18a2 2 0 0 0 1.75 3h11.3a2 2 0 0 0 1.75-3l-4.9-8.8V3'),
    line(8, 3, 16, 3),
    line(7.2, 14.5, 16.8, 14.5),
  ],

  /* --- topology ------------------------------------------------------- */
  server: () => [
    rect(3, 4, 18, 7),
    rect(3, 13, 18, 7),
    line(7, 7.5, 7.02, 7.5),
    line(7, 16.5, 7.02, 16.5),
  ],
  hub: () => [
    circle(12, 12, 3),
    circle(12, 3.6, 1.6),
    circle(12, 20.4, 1.6),
    circle(4.7, 7.8, 1.6),
    circle(19.3, 7.8, 1.6),
    circle(4.7, 16.2, 1.6),
    circle(19.3, 16.2, 1.6),
    line(12, 5.2, 12, 9),
    line(12, 15, 12, 18.8),
    line(6.1, 8.6, 9.4, 10.5),
    line(14.6, 13.5, 17.9, 15.4),
    line(6.1, 15.4, 9.4, 13.5),
    line(14.6, 10.5, 17.9, 8.6),
  ],
  laptop: () => [rect(4, 5, 16, 11, 2), line(2, 19, 22, 19)],

  /* --- feature badges -------------------------------------------------- */
  lan: () => [
    rect(8.5, 3, 7, 5),
    rect(2, 16, 6, 5),
    rect(16, 16, 6, 5),
    path('M12 8v3.5'),
    path('M5 16v-2.5h14V16'),
  ],
  lock: () => [rect(4.5, 10.5, 15, 10, 2.5), path('M8 10.5V7.5a4 4 0 0 1 8 0v3')],
  router: () => [
    rect(2.5, 13.5, 19, 7, 2),
    line(6, 17, 6.02, 17),
    line(9.5, 17, 9.5, 17),
    path('M8.5 9.5a5 5 0 0 1 7 0'),
    path('M6 6.8a8.8 8.8 0 0 1 12 0'),
  ],
  shield: () => [
    path('M12 2.6 4.5 5.7v5.6c0 4.6 3.1 8.6 7.5 10.1 4.4-1.5 7.5-5.5 7.5-10.1V5.7z'),
    path('M9.3 12.2 11.3 14.2 15 10.3'),
  ],
  key: () => [circle(8, 15, 3.6), line(10.6, 12.4, 20, 3), line(17.4, 5.6, 19.6, 7.8), line(14.8, 8.2, 17, 10.4)],
  info: () => [circle(12, 12, 9), line(12, 11, 12, 16.5), line(12, 7.8, 12.02, 7.8)],
  alert: () => [circle(12, 12, 9), line(12, 7.5, 12, 13), line(12, 16.5, 12.02, 16.5)],
  gavel: () => [
    line(4, 20, 12, 20),
    path('M7.6 9.6 14 3.2l3.5 3.5-6.4 6.4z'),
    line(13.2, 8.8, 17.5, 13.1),
    path('M15.6 11.2 19 7.8l2.2 2.2-3.4 3.4z'),
  ],
  balance: () => [
    line(12, 4, 12, 20),
    line(6, 20, 18, 20),
    line(5, 7.5, 19, 7.5),
    path('M5 7.5 2 14h6z'),
    path('M19 7.5 16 14h6z'),
  ],

  /* --- examples -------------------------------------------------------- */
  'swap-horiz': () => [path('M4 9h14l-3.5-3.5'), path('M20 15H6l3.5 3.5')],
  folder: () => [
    path('M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h7A1.5 1.5 0 0 1 19 10v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 18z'),
    path('M7 6V4.5A1.5 1.5 0 0 1 8.5 3h8A1.5 1.5 0 0 1 18 4.5V6'),
  ],
  cable: () => [
    path('M5 3v5a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V3'),
    line(5, 6, 11, 6),
    path('M19 21v-5a3 3 0 0 0-3-3h0a3 3 0 0 0-3 3v5'),
    line(13, 18, 19, 18),
  ],
  'globe-lock': () => [
    circle(12, 12, 9),
    path('M3 12h18'),
    path('M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z'),
  ],
  'hard-drive': () => [
    rect(2.5, 13, 19, 6.5, 2),
    path('M5.2 13 7.6 5.6A1.5 1.5 0 0 1 9 4.5h6a1.5 1.5 0 0 1 1.4 1.1L18.8 13'),
    line(17.5, 16.2, 17.52, 16.2),
  ],
  copy: () => [rect(8.5, 8.5, 12, 12, 2), path('M15.5 5.5H5.5A1.5 1.5 0 0 0 4 7v10')],

  /* --- install paths ---------------------------------------------------- */
  download: () => [line(12, 3.5, 12, 14.5), path('M7.5 10.5 12 15l4.5-4.5'), path('M4 18.5h16')],
  box: () => [
    path('M20.5 7.5 12 3 3.5 7.5v9L12 21l8.5-4.5z'),
    path('M3.5 7.5 12 12l8.5-4.5'),
    line(12, 12, 12, 21),
  ],
  cloud: () => [path('M7 18.5h10.2a4 4 0 0 0 .55-7.96A6 6 0 0 0 6.1 10.6 4 4 0 0 0 7 18.5z')],
  docker: () => [
    rect(3, 11, 2.6, 2.6, 0.3),
    rect(6.3, 11, 2.6, 2.6, 0.3),
    rect(9.6, 11, 2.6, 2.6, 0.3),
    rect(6.3, 7.9, 2.6, 2.6, 0.3),
    rect(9.6, 7.9, 2.6, 2.6, 0.3),
    rect(9.6, 4.8, 2.6, 2.6, 0.3),
    path('M2 14.6c0 3.5 2.4 5.9 6.6 5.9 5 0 9-2.6 10.6-7.5 1.6.5 3.1-.3 3.6-1.6-1.3-.8-2.8-.6-3.6 0-.3-1.3-1.1-2.3-2.2-2.8-.8 1.1-1 2.6-.4 3.9'),
  ],
  globe: () => [
    circle(12, 12, 9),
    line(3, 12, 21, 12),
    path('M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18z'),
  ],
  chevron: () => [path('M7 10 L12 15 L17 10')],
  'arrow-right': () => [line(4, 12, 19, 12), path('M13.5 6.5 19 12l-5.5 5.5')],
  'arrow-out': () => [path('M7 17 17 7'), path('M8.5 7H17v8.5')],

  /* --- platform marks (solid) ------------------------------------------- */
  windows: () => [
    path(
      'M0 3.449 9.75 2.1v9.451H0zm10.949-1.56L24 0v11.551H10.949zM0 12.652h9.75' +
        'v9.451L0 20.75zm10.949 0H24V24l-13.051-1.889z',
    ),
  ],
  android: () => [
    path(
      'M17.523 15.341a1 1 0 1 1 0-1.999 1 1 0 0 1 0 1.999m-11.046 0a1 1 0 1 1 0' +
        '-1.999 1 1 0 0 1 0 1.999m11.405-6.02 1.997-3.459a.416.416 0 0 0-.72-.416' +
        'l-2.022 3.503A12.1 12.1 0 0 0 12 8.083c-1.853 0-3.59.329-5.137.867L4.841' +
        ' 5.447a.416.416 0 0 0-.72.416L6.118 9.32C2.689 11.187.343 14.659 0 18.761' +
        'h24c-.343-4.102-2.689-7.574-6.118-9.44',
    ),
  ],
}

export type IconName = keyof typeof ICONS

/**
 * Renders an icon. `size` is a Tailwind-free pixel value because these appear
 * inline with text of several sizes.
 */
export function icon(name: IconName, className = '', size = 20): SVGSVGElement {
  const draw = ICONS[name]
  if (!draw) throw new Error(`Unknown icon: ${String(name)}`)

  const filled = FILLED.has(name as string)

  return svg(
    'svg',
    {
      class: `shrink-0 ${className}`.trim(),
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: filled ? 'currentColor' : 'none',
      stroke: filled ? 'none' : 'currentColor',
      ...(filled
        ? {}
        : {
            'stroke-width': '1.7',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
      'aria-hidden': 'true',
      focusable: 'false',
    },
    ...draw(),
  )
}
