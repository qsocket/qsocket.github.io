import {el} from '../lib/dom'
import { icon } from '../lib/icons'
import { LINKS } from '../data/content'

export function createFooter(): HTMLElement {
  const chip = (iconName: string, text: string, accent: string): HTMLElement =>
    el(
      'span',
      {
        class:
          'flex items-center gap-1.5 rounded border border-transparent bg-surface-container ' +
          'px-2.5 py-1 text-sm text-on-surface-variant transition-colors hover:border-primary/20',
      },
      icon(iconName, `text-[16px] ${accent}`),
      text,
    )

  const link = (label: string, href: string, external = false): HTMLElement =>
    el(
      'a',
      {
        class:
          'text-sm text-on-surface-variant transition-colors hover:text-on-surface hover:underline',
        href,
        ...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {}),
      },
      label,
    )

  return el(
    'footer',
    { class: 'w-full border-t border-surface-container/30 bg-surface-container-lowest' },
    el(
      'div',
      { class: 'shell flex flex-col items-center justify-between gap-6 py-8 lg:flex-row' },
      el(
        'div',
        { class: 'flex flex-wrap items-center justify-center gap-3' },
        chip('lock', 'End-to-end encrypted', 'text-primary'),
        chip('balance', 'MIT licensed', 'text-secondary'),
      ),
      el(
        'nav',
        {
          class: 'flex flex-wrap items-center justify-center gap-x-6 gap-y-2',
          'aria-label': 'Footer',
        },
        link('GitHub', LINKS.repo, true),
        link('Releases', LINKS.releases, true),
        link('Issues', LINKS.issues, true),
        link('License', LINKS.license, true),
        link('contact@qsocket.io', LINKS.contactMail),
      ),
      el(
        'span',
        { class: 'text-sm text-outline' },
        `© ${new Date().getFullYear()} QSocket`,
      ),
    ),
  )
}
