/**
 * Minimal typed DOM helpers.
 *
 * The page is small enough that a framework would cost more than it saves, but
 * the original markup paid for that by juggling long `className` strings from
 * JavaScript and re-querying the document on every interaction. These helpers
 * keep element construction declarative and type-checked instead.
 */

export type Child = Node | string | number | false | null | undefined

type EventMap = HTMLElementEventMap & SVGElementEventMap

export interface Attrs {
  class?: string
  /** Applied via `dataset`, so `{ node: 'peer-a' }` becomes `data-node="peer-a"`. */
  dataset?: Record<string, string>
  /** Applied verbatim; keys are expected to already be `aria-*`/`role` style. */
  [key: string]: unknown
}

const SVG_NS = 'http://www.w3.org/2000/svg'

function applyChildren(node: Element, children: readonly Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue
    node.append(child instanceof Node ? child : String(child))
  }
}

function applyAttrs(node: Element, attrs: Attrs): void {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue

    if (key === 'dataset') {
      for (const [dataKey, dataValue] of Object.entries(value as Record<string, string>)) {
        ;(node as HTMLElement).dataset[dataKey] = dataValue
      }
      continue
    }

    if (key === 'class') {
      node.setAttribute('class', String(value))
      continue
    }

    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value as EventListener)
      continue
    }

    node.setAttribute(key, value === true ? '' : String(value))
  }
}

/** Creates an HTML element. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  applyAttrs(node, attrs)
  applyChildren(node, children)
  return node
}

/** Creates an SVG element in the SVG namespace. */
export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag)
  applyAttrs(node, attrs)
  applyChildren(node, children)
  return node
}

/** A document fragment, for returning sibling nodes from one function. */
export function fragment(...children: Child[]): DocumentFragment {
  const node = document.createDocumentFragment()
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue
    node.append(child instanceof Node ? child : String(child))
  }
  return node
}

/**
 * Queries for a required element and throws when it is missing.
 *
 * The original code silently no-opped on every missing node (`if (!el) return`),
 * which turned a typo in an id into a feature that quietly did nothing. Failing
 * loudly during development is the point.
 */
export function must<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T {
  const node = root.querySelector<T>(selector)
  if (node === null) {
    throw new Error(`Required element not found: ${selector}`)
  }
  return node
}

/** Queries for all matching elements as a real array. */
export function all<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T[] {
  return Array.from(root.querySelectorAll<T>(selector))
}

/** `addEventListener` with inferred event types and a disposer. */
export function on<K extends keyof EventMap>(
  target: Element | Window | Document,
  type: K,
  handler: (event: EventMap[K]) => void,
  options?: AddEventListenerOptions,
): () => void {
  const listener = handler as EventListener
  target.addEventListener(type, listener, options)
  return () => target.removeEventListener(type, listener, options)
}
