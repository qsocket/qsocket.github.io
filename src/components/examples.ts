import {el} from '../lib/dom'
import { icon } from '../lib/icons'
import { EXAMPLES, PEER_LABELS, type Example } from '../data/examples'
import { LINKS } from '../data/content'
import { commandBlock, copyButton } from './ui'

/**
 * The usage examples, rendered from `src/data/examples.ts`.
 *
 * Implemented as a real WAI-ARIA tab set: one tab stop for the whole list,
 * arrow keys to move between tabs, `aria-selected` and `aria-controls` wired
 * to the panels. The original markup used plain buttons with `focus:outline-none`
 * and toggled a `hidden` class, which gave assistive technology nothing to go on.
 */
export function createExamples(): HTMLElement {
  const tabs: HTMLButtonElement[] = []
  const panels: HTMLElement[] = []

  for (const [index, example] of EXAMPLES.entries()) {
    tabs.push(createTab(example, index))
    panels.push(createPanel(example, index))
  }

  const select = (index: number, moveFocus: boolean): void => {
    for (const [i, tab] of tabs.entries()) {
      const active = i === index
      tab.dataset['active'] = String(active)
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
    }
    for (const [i, panel] of panels.entries()) {
      panel.hidden = i !== index
    }
    if (moveFocus) tabs[index]?.focus()
  }

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => select(index, false))
  }

  const tablist = el(
    'div',
    {
      class: 'cmd-scroll -mx-1 flex gap-1 px-1 pb-1',
      role: 'tablist',
      'aria-label': 'Usage examples',
    },
    ...tabs,
  )

  tablist.addEventListener('keydown', (event) => {
    const current = tabs.findIndex((tab) => tab.dataset['active'] === 'true')
    if (current < 0) return

    const last = tabs.length - 1
    let next: number | null = null

    switch (event.key) {
      case 'ArrowRight':
        next = current === last ? 0 : current + 1
        break
      case 'ArrowLeft':
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

  select(0, false)

  return el(
    'section',
    { class: 'shell scroll-mt-24 py-12 sm:py-16', id: 'examples' },

    el(
      'div',
      { class: 'max-w-3xl' },
      el(
        'div',
        {},
        el(
          'span',
          { class: 'text-sm font-semibold uppercase tracking-wider text-primary' },
          'Usage',
        ),
        el(
          'h2',
          { class: 'mt-1 text-2xl font-semibold text-on-surface sm:text-[32px] sm:leading-10' },
          'One binary, three subcommands',
        ),
        el(
          'p',
          { class: 'mt-3 text-base leading-relaxed text-on-surface-variant' },
          'Global flags go before the subcommand, and each subcommand takes its own options ' +
            'after it. Every example below is taken from the ',
          el(
            'a',
            {
              class: 'text-primary underline underline-offset-2 hover:no-underline',
              href: `${LINKS.repo}#examples`,
              rel: 'noopener noreferrer',
              target: '_blank',
            },
            'repository README',
          ),
          '.',
        ),
      ),
    ),

    el('div', { class: 'mt-8' }, tablist),

    el(
      'div',
      {
        class:
          'mt-4 rounded-md border border-surface-container-high/40 bg-surface-container-low ' +
          'p-5 shadow-md sm:p-7',
      },
      ...panels,
    ),
  )
}

function createTab(example: Example, index: number): HTMLButtonElement {
  return el(
    'button',
    {
      type: 'button',
      role: 'tab',
      id: `example-tab-${example.id}`,
      'aria-controls': `example-panel-${example.id}`,
      'aria-selected': String(index === 0),
      'data-active': String(index === 0),
      tabindex: index === 0 ? '0' : '-1',
      class:
        'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded border border-transparent ' +
        'bg-surface-container px-3 py-2 text-sm text-on-surface-variant transition-colors ' +
        'duration-200 hover:text-on-surface ' +
        'data-[active=true]:border-primary/30 data-[active=true]:bg-surface-container-high ' +
        'data-[active=true]:text-on-surface data-[active=true]:shadow-sm',
    },
    icon(example.icon, 'size-[16px]'),
    example.label,
  )
}

function createPanel(example: Example, index: number): HTMLElement {
  const steps = example.steps.map((step) =>
    el(
      'li',
      { class: 'space-y-1.5' },
      el(
        'div',
        { class: 'flex flex-col gap-2 sm:flex-row sm:items-center' },
        el(
          'span',
          {
            class:
              'inline-flex w-fit shrink-0 items-center gap-1.5 rounded px-2 py-0.5 text-[11px] ' +
              'font-semibold uppercase tracking-wider ' +
              (step.peer === 'a'
                ? 'bg-primary/15 text-primary'
                : 'bg-secondary-container text-on-secondary-container'),
          },
          PEER_LABELS[step.peer],
        ),
        el(
          'div',
          { class: 'min-w-0 flex-1' },
          commandBlock(step.command, {
            accent: step.peer === 'a' ? 'text-primary' : 'text-secondary',
            compact: true,
          }),
        ),
      ),
      step.note
        ? el('p', { class: 'pl-0 text-xs text-outline sm:pl-[7.5rem]' }, step.note)
        : null,
    ),
  )

  const allCommands = example.steps.map((step) => step.command).join('\n')
  const copyAll = copyButton(() => allCommands, true, 'Copy all')

  return el(
    'div',
    {
      class: 'space-y-5',
      role: 'tabpanel',
      id: `example-panel-${example.id}`,
      'aria-labelledby': `example-tab-${example.id}`,
      tabindex: '0',
      hidden: index !== 0,
    },
    el(
      'div',
      { class: 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between' },
      el(
        'div',
        { class: 'flex items-start gap-3' },
        el(
          'div',
          {
            class:
              'flex size-9 shrink-0 items-center justify-center rounded bg-primary/20 text-primary',
          },
          icon(example.icon, 'size-[20px]'),
        ),
        el(
          'div',
          {},
          el('h3', { class: 'font-semibold text-on-surface' }, example.title),
          el(
            'p',
            { class: 'mt-1.5 max-w-2xl text-sm leading-relaxed text-on-surface-variant' },
            ...renderInlineCode(example.summary),
          ),
        ),
      ),
      copyAll,
    ),

    el('ol', { class: 'space-y-4' }, ...steps),

    example.caveat
      ? el(
          'p',
          {
            class:
              'flex items-start gap-2 rounded border border-surface-container-high ' +
              'bg-surface-container-high/40 p-3 text-xs leading-relaxed text-on-surface-variant',
          },
          icon('info', 'size-[15px] shrink-0 text-primary mt-px'),
          el('span', {}, example.caveat),
        )
      : null,
  )
}

/** Renders `backtick` spans in the summary text as inline code. */
function renderInlineCode(text: string): Node[] {
  return text.split(/`([^`]+)`/g).map((part, index) =>
    index % 2 === 1
      ? el('code', { class: 'rounded bg-surface-container px-1 font-mono text-primary' }, part)
      : document.createTextNode(part),
  )
}
