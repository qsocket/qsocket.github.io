import {el} from '../lib/dom'
import { icon } from '../lib/icons'
import { LINKS, SECURITY_NOTES, STATS } from '../data/content'

/** Headline figures, drawn from the README support matrix. */
export function createStats(): HTMLElement {
  return el(
    'section',
    { class: 'shell pb-4' },
    el(
      'div',
      { class: 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4' },
      ...STATS.map((stat) =>
        el(
          'div',
          {
            class:
              'card-hover flex flex-col justify-between rounded-md border ' +
              'border-surface-container-high/30 bg-surface-container-low p-5 shadow-sm',
          },
          el(
            'span',
            { class: 'text-xs uppercase tracking-wider text-outline' },
            stat.label,
          ),
          el(
            'div',
            { class: 'my-4' },
            el(
              'span',
              {
                class: `text-4xl font-semibold ${
                  stat.accent === 'primary' ? 'text-primary' : 'text-secondary'
                }`,
              },
              stat.value,
            ),
            el(
              'p',
              { class: 'mt-1.5 text-[13px] leading-relaxed text-on-surface-variant' },
              stat.detail,
            ),
          ),
          el(
            'div',
            { class: 'h-1.5 w-full overflow-hidden rounded-full bg-surface-container' },
            el('div', {
              class: `h-full w-full ${
                stat.accent === 'primary' ? 'bg-primary' : 'bg-secondary'
              }`,
            }),
          ),
        ),
      ),
    ),
  )
}

/** The security notes and the abuse policy. */
export function createSecurity(): HTMLElement {
  return el(
    'section',
    { class: 'shell scroll-mt-24 py-12 sm:py-16', id: 'security' },

    el(
      'div',
      { class: 'max-w-3xl' },
      el(
        'span',
        { class: 'text-sm font-semibold uppercase tracking-wider text-primary' },
        'Security',
      ),
      el(
        'h2',
        { class: 'mt-1 text-2xl font-semibold text-on-surface sm:text-[32px] sm:leading-10' },
        'What the relay can and cannot see',
      ),
      el(
        'p',
        { class: 'mt-3 text-base leading-relaxed text-on-surface-variant' },
        'QSocket uses ',
        el(
          'a',
          {
            class: 'text-primary underline underline-offset-2 hover:no-underline',
            href: LINKS.srp,
            rel: 'noopener noreferrer',
            target: '_blank',
          },
          'SRP',
        ),
        ' to establish ',
        el(
          'a',
          {
            class: 'text-primary underline underline-offset-2 hover:no-underline',
            href: LINKS.forwardSecrecy,
            rel: 'noopener noreferrer',
            target: '_blank',
          },
          'forward secrecy',
        ),
        '. SRP is a well-known, well-analysed protocol — QSocket does not invent its own.',
      ),
    ),

    el(
      'div',
      { class: 'mt-8 grid grid-cols-1 gap-4 md:grid-cols-2' },
      ...SECURITY_NOTES.map((note) =>
        el(
          'div',
          {
            class:
              'rounded-md border border-surface-container-high/40 bg-surface-container p-5 ' +
              'transition-colors hover:border-primary/30',
          },
          el(
            'h3',
            { class: 'flex items-center gap-2 font-semibold text-on-surface' },
            icon('shield', 'size-[18px] text-primary'),
            note.title,
          ),
          el(
            'p',
            { class: 'mt-2 text-sm leading-relaxed text-on-surface-variant' },
            note.body,
          ),
        ),
      ),
    ),

    el(
      'div',
      {
        class:
          'mt-8 flex flex-col items-start gap-6 rounded-md border ' +
          'border-surface-container-highest bg-surface-container-high/60 p-6 shadow-md ' +
          'lg:flex-row lg:items-center lg:justify-between sm:p-8',
      },
      el(
        'div',
        { class: 'max-w-3xl space-y-2' },
        el(
          'div',
          { class: 'flex items-center gap-2' },
          icon('gavel', 'size-[20px] text-error'),
          el(
            'span',
            { class: 'text-sm font-semibold uppercase tracking-wider text-error' },
            'Abuse policy',
          ),
        ),
        el(
          'h3',
          { class: 'font-semibold text-on-surface' },
          'Use it on systems you are authorised to access',
        ),
        el(
          'p',
          { class: 'text-sm leading-relaxed text-on-surface-variant' },
          'QSocket is meant for administering your own machines and for authorised security ' +
            'testing. If a QSocket instance was installed on a system of yours without your ' +
            'knowledge or consent, send the affected IP address and a short description and the ' +
            'relevant relay sessions will be terminated.',
        ),
      ),
      el(
        'a',
        {
          class:
            'group flex shrink-0 items-center gap-2 rounded border border-transparent ' +
            'bg-surface-container-highest px-5 py-3 text-sm text-error shadow-sm ' +
            'transition-colors duration-200 hover:border-error/40 hover:bg-error ' +
            'hover:text-on-error active:scale-95',
          href: LINKS.abuseMail,
        },
        icon('alert', 'size-[18px]'),
        'Report abuse',
      ),
    ),
  )
}
