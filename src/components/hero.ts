import { el, on } from '../lib/dom'
import { icon } from '../lib/icons'
import { LINKS } from '../data/content'
import { createArchitecture } from './architecture'

const BADGES: readonly { icon: Parameters<typeof icon>[0]; text: string; accent: string }[] = [
  { icon: 'lan', text: 'Works through NAT and firewalls', accent: 'text-primary' },
  { icon: 'lock', text: 'End-to-end encrypted, SRP key exchange', accent: 'text-primary' },
  { icon: 'router', text: 'No public IP, no port forwarding', accent: 'text-secondary' },
]

/**
 * The deploy button, reproducing the original design's hover treatment: the
 * card lifts, the fill brightens, the bolt rotates a quarter turn and a
 * translucent gleam sweeps across the face on a loop.
 */
function deployButton(): HTMLElement {
  const button = el(
    'a',
    {
      class:
        'anim-glow group relative flex items-center gap-3 overflow-hidden rounded-xl ' +
        'bg-primary-container px-8 py-4 text-on-primary-container shadow-lg ' +
        'transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary ' +
        'hover:text-on-primary active:scale-[0.98]',
      href: '#install',
      id: 'deployBeaconBtn',
    },
    el('span', {
      class:
        'anim-gleam pointer-events-none absolute inset-0 h-full w-1/2 -translate-x-[150%] ' +
        'skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent',
      'aria-hidden': 'true',
    }),
    el(
      'span',
      { class: 'relative flex items-center justify-center' },
      icon('bolt', 'transition-transform duration-300 group-hover:rotate-90', 20),
    ),
    el('span', { class: 'text-sm font-semibold uppercase tracking-wider' }, 'Deploy Beacon'),
    el(
      'span',
      {
        class:
          'ml-2 rounded bg-black/20 px-2 py-0.5 text-[11px] font-normal tracking-normal ' +
          'text-on-primary-container transition-colors group-hover:text-on-primary',
      },
      'Press Enter or Click',
    ),
  )

  // The badge promises a keyboard shortcut, so honour it: Enter activates the
  // button whenever focus is still on the document body.
  on(document, 'keydown', (event) => {
    if (event.key !== 'Enter') return
    if (document.activeElement !== document.body) return
    event.preventDefault()
    button.click()
  })

  return button
}

/** The early-alpha caveat, shown under the architecture card. */
function alphaNotice(): HTMLElement {
  return el(
    'p',
    {
      class:
        'mx-auto mt-6 flex max-w-4xl items-start gap-2 rounded-md border ' +
        'border-surface-container-high/50 bg-surface-container-low/60 p-4 text-left ' +
        'text-xs leading-relaxed text-outline',
    },
    icon('flask', 'mt-px shrink-0 text-primary', 14),
    el(
      'span',
      {},
      'QSocket is in early alpha. Functionality is experimental and may break backwards ' +
        'compatibility — see the ',
      el(
        'a',
        {
          class: 'text-primary underline underline-offset-2 hover:no-underline',
          href: LINKS.repo,
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        'repository README',
      ),
      ' before relying on it in production.',
    ),
  )
}

export function createHero(): HTMLElement {
  return el(
    'section',
    { class: 'relative overflow-hidden', id: 'top' },
    el('div', {
      class: 'pointer-events-none absolute inset-0 grid-dots opacity-[0.035]',
      'aria-hidden': 'true',
    }),
    el(
      'div',
      { class: 'shell relative flex flex-col items-center pt-12 pb-16 text-center sm:pb-20' },

      el(
        'div',
        {
          class: 'entrance mb-8 flex flex-wrap items-center justify-center gap-2',
          style: 'animation-delay:0.08s',
        },
        ...BADGES.map((badge) =>
          el(
            'span',
            {
              class:
                'inline-flex items-center gap-2 rounded-full border border-transparent ' +
                'bg-surface-container-high/80 px-3 py-1 text-sm text-on-surface-variant ' +
                'shadow-sm backdrop-blur transition-colors hover:border-primary/30',
            },
            icon(badge.icon, badge.accent, 15),
            badge.text,
          ),
        ),
      ),

      el(
        'div',
        { class: 'entrance mx-auto max-w-4xl space-y-4', style: 'animation-delay:0.16s' },
        el(
          'p',
          {
            class:
              'flex items-center justify-center gap-2 text-sm uppercase tracking-widest ' +
              'text-primary',
          },
          el('span', { class: 'size-1.5 rounded-full bg-primary', 'aria-hidden': 'true' }),
          'Peer-to-Peer Encrypted Wormhole Through Firewalls & NAT',
          el('span', { class: 'size-1.5 rounded-full bg-primary', 'aria-hidden': 'true' }),
        ),
        el(
          'h1',
          {
            class:
              'text-3xl font-semibold tracking-tight text-balance text-on-surface ' +
              'sm:text-4xl lg:text-[44px] lg:leading-[1.15]',
          },
          'Quantum Socket // Zero-Trust P2P Relay',
        ),
        el(
          'p',
          {
            class:
              'mx-auto max-w-3xl text-base leading-relaxed text-pretty text-on-surface-variant',
          },
          'QSocket is a cross-platform networking utility that reads and writes end-to-end ' +
            'encrypted data across systems using the QSocket relay network. It redirects fully ' +
            'interactive PTY sessions over reverse connections, forwards TCP traffic and ' +
            'transfers files to and from machines behind NAT or a firewall,  without opening a ' +
            'port on either end.',
        ),
      ),

      el(
        'div',
        { class: 'entrance mt-10', style: 'animation-delay:0.24s' },
        deployButton(),
      ),

      createArchitecture(),
      alphaNotice(),
    ),
  )
}
