import {el, on} from '../lib/dom'
import { icon } from '../lib/icons'
import { LINKS } from '../data/content'

interface NavItem {
  readonly label: string
  readonly href: string
  readonly external?: boolean
}

const NAV: readonly NavItem[] = [
  { label: 'How it works', href: '#architecture' },
  { label: 'Install', href: '#install' },
  { label: 'Examples', href: '#examples' },
  { label: 'Security', href: '#security' },
  { label: 'Report abuse', href: LINKS.abuseMail },
]

const navLinkClass =
  'rounded px-2 py-1 text-sm text-on-surface-variant transition-colors duration-200 ' +
  'hover:bg-surface-container-low hover:text-on-surface'

/**
 * Site header.
 *
 * The original markup hid the navigation entirely below the `md` breakpoint
 * (`hidden md:flex`) and offered nothing in its place, so a phone got a logo
 * and two buttons. This version keeps the same desktop bar and adds a real
 * disclosure menu for narrow viewports.
 */
export function createHeader(): HTMLElement {
  const menu = el(
    'div',
    {
      class:
        'border-t border-surface-container/60 bg-surface/95 backdrop-blur-xl md:hidden',
      id: 'mobile-nav',
      hidden: true,
    },
    el(
      'nav',
      { class: 'shell flex flex-col gap-1 py-3', 'aria-label': 'Mobile' },
      ...NAV.map((item) =>
        el('a', { class: `${navLinkClass} py-2.5 text-base`, href: item.href }, item.label),
      ),
      el(
        'a',
        {
          class: `${navLinkClass} py-2.5 text-base`,
          href: LINKS.repo,
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        'GitHub',
      ),
    ),
  )

  const toggle = el(
    'button',
    {
      type: 'button',
      class:
        'flex size-10 items-center justify-center rounded text-on-surface-variant ' +
        'transition-colors hover:bg-surface-container-low hover:text-on-surface md:hidden',
      'aria-expanded': 'false',
      'aria-controls': 'mobile-nav',
      'aria-label': 'Open navigation menu',
    },
    icon('menu', 'size-[22px]'),
  )

  const setOpen = (open: boolean): void => {
    menu.hidden = !open
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu')
    toggle.replaceChildren(icon(open ? 'close' : 'menu', 'size-[22px]'))
  }

  toggle.addEventListener('click', () => setOpen(menu.hidden))

  // Dismiss on navigation, on Escape, and whenever the desktop bar takes over.
  menu.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false)
  })

  on(document, 'keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false)
      toggle.focus()
    }
  })

  const desktop = window.matchMedia('(min-width: 768px)')
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false)
  })

  return el(
    'header',
    {
      class:
        'fixed top-0 z-50 w-full border-b border-surface-container/40 bg-surface/80 backdrop-blur-xl',
    },
    el(
      'div',
      { class: 'shell flex h-16 items-center justify-between gap-4' },
      el(
        'div',
        { class: 'flex min-w-0 items-center gap-6' },
        el(
          'a',
          { class: 'group flex shrink-0 items-center gap-2', href: '#top' },
          el(
            'span',
            { class: 'relative flex items-center justify-center', 'aria-hidden': 'true' },
            el('span', { class: 'size-2.5 animate-pulse rounded-full bg-primary' }),
            el('span', {
              class:
                'absolute size-5 rounded-full bg-primary/20 blur-[2px] transition-transform ' +
                'group-hover:scale-150',
            }),
          ),
          el(
            'span',
            {
              class:
                'text-base font-semibold uppercase tracking-wider text-on-surface ' +
                'transition-colors group-hover:text-primary',
            },
            'QSocket',
          ),
        ),
        el(
          'nav',
          { class: 'hidden items-center gap-1 md:flex', 'aria-label': 'Primary' },
          ...NAV.map((item) => el('a', { class: navLinkClass, href: item.href }, item.label)),
        ),
      ),
      el(
        'div',
        { class: 'flex items-center gap-2' },
        el(
          'a',
          {
            class: `${navLinkClass} hidden items-center gap-1.5 sm:flex`,
            href: LINKS.repo,
            rel: 'noopener noreferrer',
            target: '_blank',
          },
          icon('code', 'size-[18px]'),
          'GitHub',
        ),
        el(
          'a',
          {
            class:
              'flex items-center gap-1.5 rounded bg-primary-container px-3 py-1.5 text-sm ' +
              'font-medium text-on-primary-container shadow-sm transition-colors duration-200 ' +
              'hover:bg-primary hover:text-on-primary active:scale-95',
            href: LINKS.webCli,
            rel: 'noopener noreferrer',
            target: '_blank',
          },
          icon('terminal', 'size-[16px]'),
          el('span', {}, 'Web CLI'),
        ),
        toggle,
      ),
    ),
    menu,
  )
}
