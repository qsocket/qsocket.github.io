import { el } from '../lib/dom'
import { icon } from '../lib/icons'
import { attachCopyButton } from '../lib/clipboard'

/** A copy button with the icon and label slots `attachCopyButton` expects. */
export function copyButton(
  getText: () => string,
  compact = false,
  label = 'Copy',
): HTMLButtonElement {
  const size = compact ? 13 : 16
  const renderIcon = (state: 'idle' | 'done' | 'failed'): SVGElement =>
    icon(state === 'idle' ? 'copy' : state === 'done' ? 'check' : 'alert', '', size)

  const button = el(
    'button',
    {
      type: 'button',
      class:
        'flex shrink-0 items-center gap-1.5 rounded border border-transparent ' +
        'bg-surface-container-high text-on-surface transition-colors duration-200 ' +
        'hover:border-primary/30 hover:bg-surface-bright active:scale-95 ' +
        (compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-sm'),
    },
    el('span', { 'data-copy-icon': '', class: 'flex items-center' }, renderIcon('idle')),
    el('span', { 'data-copy-label': '' }, label),
  )

  attachCopyButton(button, getText, renderIcon)
  return button
}

/** A `$ command` block with a copy button, scrollable instead of page-widening. */
export function commandBlock(
  command: string,
  options: { prompt?: string; accent?: string; compact?: boolean } = {},
): HTMLElement {
  const { prompt = '$', accent = 'text-primary', compact = false } = options

  return el(
    'div',
    {
      class:
        'flex items-center justify-between gap-3 rounded border border-surface-container/60 ' +
        'bg-surface-container-lowest ' +
        (compact ? 'p-3' : 'p-4'),
    },
    el(
      'div',
      { class: 'cmd-scroll flex min-w-0 flex-1 items-center gap-2.5' },
      el('span', { class: 'shrink-0 select-none font-mono font-bold text-primary' }, prompt),
      el(
        'code',
        { class: `whitespace-pre font-mono ${accent} ${compact ? 'text-xs' : 'text-sm'}` },
        command,
      ),
    ),
    copyButton(() => command, compact),
  )
}

/** The "Stage NN" eyebrow + heading pair used at the top of each stage card. */
export function stageHeading(
  stageNumber: string,
  title: string,
  accent: 'primary' | 'secondary' = 'primary',
): HTMLElement {
  return el(
    'div',
    {},
    el(
      'span',
      {
        class: `text-sm font-semibold uppercase tracking-wider ${
          accent === 'primary' ? 'text-primary' : 'text-secondary'
        }`,
      },
      `Stage ${stageNumber}`,
    ),
    el(
      'h2',
      { class: 'mt-1 text-2xl font-semibold text-on-surface sm:text-[32px] sm:leading-10' },
      title,
    ),
  )
}

/** The "Next: Stage N" button that scrolls the page to the following stage. */
export function nextStageButton(
  label: string,
  targetStage: number,
  accent: 'primary' | 'secondary' = 'primary',
): HTMLButtonElement {
  return el(
    'button',
    {
      type: 'button',
      class:
        'group flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm ' +
        'font-medium shadow-sm transition-colors duration-200 active:scale-95 sm:w-auto ' +
        (accent === 'primary'
          ? 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
          : 'bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary'),
      dataset: { gotoStage: String(targetStage) },
    },
    el('span', {}, label),
    icon('arrow-right', 'transition-transform group-hover:translate-x-1', 16),
  )
}
