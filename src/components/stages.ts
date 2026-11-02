import { all, el } from '../lib/dom'
import { icon, type IconName } from '../lib/icons'
import { detectOs, osDisplayName, type OsKey } from '../lib/platform'
import { INSTALL_TARGETS, shQuoteIfNeeded, type InstallTarget } from '../data/install'
import { LINKS } from '../data/content'
import { copyButton, nextStageButton, stageHeading } from './ui'

/**
 * The three-stage orchestration dashboard, following the structure of the
 * original design: a stage switcher bar, then one card per stage.
 *
 *   Stage 01  Deploy the beacon on the target machine
 *   Stage 02  Equip the operator workstation
 *   Stage 03  Attach and open the encrypted link
 *
 * The stage bar and the "Next" buttons both scroll to the target stage and
 * mark it active, so the page can be read straight through or jumped around.
 */

const PLATFORM_ICONS: Readonly<Record<OsKey, IconName>> = {
  unix: 'terminal',
  windows: 'windows',
  android: 'android',
}

const STAGE_TABS = [
  { n: 1, title: 'Stage 1: Deploy Beacon', sub: 'One-liner on the target host' },
  { n: 2, title: 'Stage 2: Install Toolkit', sub: 'Client workstation binary' },
  { n: 3, title: 'Stage 3: Access & Connect', sub: 'Terminal or tunnel bridging' },
] as const

export function createStages(): HTMLElement {
  const secret: SecretState = { value: '', enabled: false }

  const stage1 = createStage1(secret)
  const stage3 = createStage3(secret)
  secret.onChange = () => stage3.refresh()

  const section = el(
    'section',
    { class: 'shell scroll-mt-24 space-y-8 py-12 sm:py-16', id: 'install' },
    createStageBar(),
    stage1.node,
    createStage2(),
    stage3.node,
  )

  mountStageNavigation(section)
  return section
}

/* -------------------------------------------------------------------------- */
/* Stage switcher bar                                                          */
/* -------------------------------------------------------------------------- */

function createStageBar(): HTMLElement {
  return el(
    'div',
    { class: 'grid grid-cols-1 gap-4 md:grid-cols-3', id: 'stageTabsBar' },
    ...STAGE_TABS.map((tab) =>
      el(
        'button',
        {
          type: 'button',
          class:
            'stage-nav group flex w-full items-center gap-3 rounded-md border p-4 text-left ' +
            'transition-colors duration-200 ' +
            'border-transparent bg-surface-container-low hover:border-surface-variant ' +
            'hover:bg-surface-container ' +
            'data-[active=true]:border-primary/30 data-[active=true]:bg-surface-container-high',
          dataset: { gotoStage: String(tab.n) },
          'data-active': String(tab.n === 1),
        },
        el(
          'span',
          {
            class:
              'stage-nav-badge flex size-8 shrink-0 items-center justify-center rounded ' +
              'font-semibold transition-colors ' +
              'bg-surface-container-highest text-on-surface-variant ' +
              'group-data-[active=true]:bg-primary-container ' +
              'group-data-[active=true]:text-on-primary-container',
          },
          String(tab.n),
        ),
        el(
          'span',
          { class: 'min-w-0' },
          el('span', { class: 'block text-sm font-medium text-on-surface' }, tab.title),
          el('span', { class: 'block text-xs text-outline' }, tab.sub),
        ),
      ),
    ),
  )
}

const stageCardClass =
  'stage-card scroll-mt-24 space-y-6 rounded-md border border-surface-container ' +
  'bg-surface-container-low p-6 shadow-md transition-shadow sm:p-8'

/* -------------------------------------------------------------------------- */
/* Stage 1 — deploy the beacon                                                 */
/* -------------------------------------------------------------------------- */

interface SecretState {
  value: string
  enabled: boolean
  onChange?: () => void
}

function createStage1(secret: SecretState): { node: HTMLElement } {
  const detected = detectOs()
  let currentOs: OsKey = detected
  let currentTransportId =
    INSTALL_TARGETS.find((t) => t.id === detected)?.transports[0]?.id ?? 'curl'

  const target = (): InstallTarget =>
    INSTALL_TARGETS.find((entry) => entry.id === currentOs) ?? INSTALL_TARGETS[0]!

  const command = (): string => {
    const current = target()
    const transport =
      current.transports.find((entry) => entry.id === currentTransportId) ??
      current.transports[0]!
    return transport.command(secret.enabled ? secret.value.trim() : '')
  }

  const promptEl = el(
    'span',
    { class: 'shrink-0 select-none font-mono font-bold text-primary' },
    '$',
  )
  const commandEl = el('code', { class: 'whitespace-pre font-mono text-sm text-primary' }, '')
  const noteEl = el('span', {}, '')

  /* --- OS switcher, with a platform mark on each button ------------------ */

  const osButtons = INSTALL_TARGETS.map((entry) =>
    el(
      'button',
      {
        type: 'button',
        class:
          'inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-sm ' +
          'transition-colors duration-200 text-on-surface-variant hover:text-on-surface ' +
          'data-[active=true]:bg-surface-container-high data-[active=true]:text-on-surface ' +
          'data-[active=true]:shadow-sm sm:flex-none',
        dataset: { os: entry.id },
        'data-active': String(entry.id === currentOs),
        'aria-pressed': String(entry.id === currentOs),
      },
      icon(PLATFORM_ICONS[entry.id], 'opacity-80', 14),
      el('span', {}, entry.label),
    ),
  )

  const transportGroup = el('div', {
    class: 'inline-flex gap-0.5 rounded bg-surface-container-highest p-0.5',
    role: 'group',
    'aria-label': 'Download utility',
  })

  /* --- custom secret ------------------------------------------------------ */

  const secretInput = el('input', {
    type: 'text',
    class:
      'w-full min-w-0 border-0 bg-transparent font-mono text-sm text-on-surface ' +
      'placeholder:text-outline focus:outline-none',
    placeholder: 'my-strong-secret',
    'aria-label': 'Custom secret',
    autocapitalize: 'off',
    autocomplete: 'off',
    spellcheck: 'false',
  })

  const secretWrapper = el(
    'div',
    {
      class:
        'flex w-full items-center gap-2 rounded border border-transparent ' +
        'bg-surface-container-high px-3 py-2 transition-colors focus-within:border-primary/50 ' +
        'sm:flex-1',
      hidden: true,
    },
    el('span', { class: 'shrink-0 font-mono text-[13px] text-primary' }, 'S='),
    secretInput,
    el(
      'button',
      {
        type: 'button',
        class: 'flex shrink-0 items-center p-0.5 text-outline hover:text-on-surface',
        'aria-label': 'Clear secret',
        onclick: () => {
          secret.value = ''
          secretInput.value = ''
          secretInput.focus()
          render()
        },
      },
      icon('close', '', 16),
    ),
  )

  const secretToggle = el(
    'button',
    {
      type: 'button',
      class:
        'flex w-full shrink-0 items-center justify-center gap-1.5 rounded border ' +
        'border-transparent bg-surface-container-high px-3.5 py-2 text-sm ' +
        'text-on-surface-variant transition-colors hover:border-surface-variant ' +
        'hover:bg-surface-container-highest hover:text-on-surface active:scale-95 ' +
        'data-[active=true]:border-primary/40 data-[active=true]:bg-primary/20 ' +
        'data-[active=true]:text-primary sm:w-auto',
      'aria-expanded': 'false',
      'data-active': 'false',
    },
    icon('key', 'text-primary', 16),
    'Custom secret',
  )

  secretToggle.addEventListener('click', () => {
    secret.enabled = !secret.enabled
    secretWrapper.hidden = !secret.enabled
    secretToggle.dataset['active'] = String(secret.enabled)
    secretToggle.setAttribute('aria-expanded', String(secret.enabled))
    if (secret.enabled) secretInput.focus()
    render()
  })

  secretInput.addEventListener('input', () => {
    secret.value = secretInput.value
    render()
  })

  /* --- rendering ---------------------------------------------------------- */

  function renderTransports(): void {
    const current = target()
    transportGroup.hidden = current.transports.length < 2
    transportGroup.replaceChildren(
      ...current.transports.map((transport) =>
        el(
          'button',
          {
            type: 'button',
            class:
              'rounded px-2.5 py-1 font-mono text-[13px] transition-colors duration-200 ' +
              'text-on-surface-variant hover:text-on-surface ' +
              'data-[active=true]:bg-primary data-[active=true]:font-medium ' +
              'data-[active=true]:text-on-primary data-[active=true]:shadow-sm',
            'data-active': String(transport.id === currentTransportId),
            'aria-pressed': String(transport.id === currentTransportId),
            onclick: () => {
              currentTransportId = transport.id
              render()
            },
          },
          transport.label,
        ),
      ),
    )
  }

  function render(): void {
    const current = target()
    if (!current.transports.some((entry) => entry.id === currentTransportId)) {
      currentTransportId = current.transports[0]!.id
    }

    for (const button of osButtons) {
      const active = button.dataset['os'] === currentOs
      button.dataset['active'] = String(active)
      button.setAttribute('aria-pressed', String(active))
    }

    renderTransports()
    promptEl.textContent = current.prompt
    commandEl.textContent = command()
    noteEl.textContent = current.note
    secret.onChange?.()
  }

  for (const button of osButtons) {
    button.addEventListener('click', () => {
      currentOs = (button.dataset['os'] ?? 'unix') as OsKey
      render()
    })
  }

  render()

  const node = el(
    'div',
    { class: stageCardClass, id: 'stage1Card', dataset: { stage: '1' } },

    el(
      'div',
      { class: 'flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between' },
      el(
        'div',
        {},
        stageHeading('01', 'Deploy Live Beacon'),
        el(
          'span',
          {
            class:
              'mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border ' +
              'border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs text-primary',
          },
          el('span', { class: 'size-1.5 rounded-full bg-primary', 'aria-hidden': 'true' }),
          'Auto-detected host: ',
          el('strong', { class: 'font-semibold' }, osDisplayName(detected)),
        ),
      ),
      el(
        'div',
        {
          class: 'inline-flex w-full gap-1 rounded-md bg-surface-container-highest p-1 sm:w-auto',
          role: 'group',
          'aria-label': 'Target operating system',
        },
        ...osButtons,
      ),
    ),

    el(
      'p',
      { class: 'text-base leading-relaxed text-on-surface-variant' },
      'The installer detects the platform, drops a static binary in the first writable ' +
        'location it finds and starts a listener with a random secret. Set ',
      el('code', { class: 'font-mono text-primary' }, 'S'),
      ' to choose the secret yourself.',
    ),

    el(
      'div',
      {
        class:
          'flex flex-col gap-4 rounded border border-surface-container-high/40 ' +
          'bg-surface-container p-4 lg:flex-row lg:items-center',
      },
      el(
        'div',
        { class: 'flex items-center gap-3' },
        el('span', { class: 'text-sm text-on-surface-variant' }, 'Transport utility:'),
        transportGroup,
      ),
      el(
        'div',
        {
          class:
            'flex flex-col gap-3 sm:flex-row sm:items-center lg:ml-auto lg:flex-1 lg:justify-end',
        },
        secretWrapper,
        secretToggle,
      ),
    ),

    el(
      'div',
      {
        class:
          'flex items-center justify-between gap-3 rounded border border-surface-container/60 ' +
          'bg-surface-container-lowest p-4 transition-colors hover:border-primary/30',
      },
      el(
        'div',
        { class: 'cmd-scroll flex min-w-0 flex-1 items-center gap-2.5' },
        promptEl,
        commandEl,
      ),
      copyButton(() => command()),
    ),

    el(
      'div',
      { class: 'flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row' },
      el(
        'p',
        { class: 'flex items-start gap-1.5 text-[13px] text-outline' },
        icon('info', 'shrink-0 text-primary mt-px', 16),
        noteEl,
      ),
      nextStageButton('Next: Stage 2 (Install Toolkit)', 2),
    ),
  )

  return { node }
}

/* -------------------------------------------------------------------------- */
/* Stage 2 — equip the operator workstation                                    */
/* -------------------------------------------------------------------------- */

interface Pathway {
  readonly title: string
  readonly body: string
  readonly icon: IconName
  readonly chip: string
  readonly href?: string
  readonly linkLabel?: string
  readonly linkIcon?: IconName
  readonly accent: 'primary' | 'secondary' | 'tertiary' | 'neutral'
}

const PATHWAYS: readonly Pathway[] = [
  {
    title: 'Instant Web Client',
    body: 'Connect straight from the browser via WebAssembly. Zero download.',
    icon: 'globe',
    chip: 'bg-primary/20 text-primary',
    href: LINKS.webCli,
    linkLabel: 'Launch cli.qsocket.io',
    linkIcon: 'open-in-new',
    accent: 'primary',
  },
  {
    title: 'Static Binaries',
    body: 'Statically compiled for Linux, macOS, BSD, Windows & ARM targets.',
    icon: 'download',
    chip: 'bg-secondary-container text-on-secondary-container',
    href: LINKS.releases,
    linkLabel: 'GitHub Releases',
    linkIcon: 'arrow-out',
    accent: 'secondary',
  },
  {
    title: 'Docker Image',
    body: 'Pull the published image and run the client without installing it on the host.',
    icon: 'docker',
    chip: 'bg-primary/20 text-primary',
    href: LINKS.dockerHub,
    linkLabel: 'Docker Hub',
    linkIcon: 'open-in-new',
    accent: 'primary',
  },
  {
    title: 'Compile from Source',
    body: 'Direct compilation using the official Go toolchain.',
    icon: 'terminal',
    chip: 'bg-surface-container-highest text-on-surface',
    accent: 'neutral',
  },
  {
    title: 'Cloud Shell One-Click',
    body: 'Spawns an isolated ephemeral cloud workstation instantly.',
    icon: 'cloud',
    chip: 'bg-tertiary-container text-on-tertiary-container',
    href: LINKS.cloudShell,
    linkLabel: 'Open Sandbox',
    linkIcon: 'open-in-new',
    accent: 'tertiary',
  },
]

const COMPILE_COMMAND = 'go install github.com/qsocket/qsocket@master'

const accentText = {
  primary: 'group-hover:text-primary',
  secondary: 'group-hover:text-secondary',
  tertiary: 'group-hover:text-tertiary',
  neutral: '',
} as const

function createStage2(): HTMLElement {
  /* The compile command stays hidden until the Compile button is pressed. */
  const drawer = el(
    'div',
    {
      class:
        'overflow-hidden rounded-md border border-surface-container/60 ' +
        'bg-surface-container-lowest shadow-inner transition-colors hover:border-primary/30',
      id: 'compileDrawer',
      hidden: true,
    },
    el(
      'div',
      { class: 'space-y-2 p-4' },
      el(
        'div',
        { class: 'flex items-center justify-between gap-3' },
        el(
          'div',
          { class: 'cmd-scroll flex min-w-0 flex-1 items-center gap-2.5' },
          el('span', { class: 'shrink-0 select-none font-mono font-bold text-primary' }, '$'),
          el(
            'code',
            { class: 'whitespace-pre font-mono text-[13px] text-primary select-all' },
            COMPILE_COMMAND,
          ),
        ),
        copyButton(() => COMPILE_COMMAND),
      ),
      el(
        'p',
        {
          class:
            'flex items-center gap-2 border-t border-surface-container-high/30 pt-2 ' +
            'text-xs text-outline',
        },
        icon('info', 'text-primary', 14),
        'Requires a Go 1.22+ toolchain on the operator workstation.',
      ),
    ),
  )

  const chevron = icon('chevron', 'ml-auto transition-transform', 14)

  const compileToggle = el(
    'button',
    {
      type: 'button',
      class:
        'group/btn flex w-full items-center justify-center gap-1.5 rounded border ' +
        'border-transparent bg-surface-container-high px-3 py-1.5 text-sm text-primary ' +
        'transition-colors hover:border-primary/30 hover:bg-surface-container-highest ' +
        'active:scale-95 data-[open=true]:border-primary/40 data-[open=true]:bg-primary/20',
      'aria-expanded': 'false',
      'aria-controls': 'compileDrawer',
      'data-open': 'false',
    },
    icon('terminal', 'text-primary transition-transform group-hover/btn:rotate-90', 16),
    el('span', {}, 'Compile'),
    chevron,
  )

  compileToggle.addEventListener('click', () => {
    const open = drawer.hidden
    drawer.hidden = !open
    compileToggle.dataset['open'] = String(open)
    compileToggle.setAttribute('aria-expanded', String(open))
    chevron.classList.toggle('rotate-180', open)
    if (open) drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  const cards = PATHWAYS.map((pathway) => {
    const body = el(
      'div',
      {},
      el(
        'div',
        {
          class:
            `mb-4 flex size-10 items-center justify-center rounded ${pathway.chip} ` +
            'transition-transform group-hover:scale-110',
        },
        icon(pathway.icon),
      ),
      el(
        'h3',
        {
          class: `font-semibold text-on-surface transition-colors ${accentText[pathway.accent]}`,
        },
        pathway.title,
      ),
      el(
        'p',
        { class: 'mt-2 text-[13px] leading-relaxed text-on-surface-variant' },
        pathway.body,
      ),
    )

    const cardClass =
      'card-hover group flex flex-col justify-between rounded-md border ' +
      'border-surface-container-high/40 bg-surface-container p-5 transition-colors ' +
      'hover:bg-surface-container-high'

    if (pathway.href) {
      return el(
        'a',
        { class: cardClass, href: pathway.href, rel: 'noopener noreferrer', target: '_blank' },
        body,
        el(
          'span',
          {
            class: `mt-6 flex items-center gap-1 text-sm ${
              pathway.accent === 'secondary'
                ? 'text-secondary'
                : pathway.accent === 'tertiary'
                  ? 'text-on-surface-variant group-hover:text-on-surface'
                  : 'text-primary'
            }`,
          },
          pathway.linkLabel ?? 'Open',
          icon(pathway.linkIcon ?? 'open-in-new', '', 14),
        ),
      )
    }

    return el(
      'div',
      { class: cardClass },
      body,
      el(
        'div',
        { class: 'mt-6 border-t border-surface-container-high/40 pt-2' },
        compileToggle,
      ),
    )
  })

  return el(
    'div',
    { class: stageCardClass, id: 'stage2Card', dataset: { stage: '2' } },

    el(
      'div',
      { class: 'flex items-start justify-between gap-4' },
      stageHeading('02', 'Install QSocket Toolkit', 'secondary'),
      el(
        'span',
        {
          class:
            'hidden shrink-0 rounded border border-surface-container-highest ' +
            'bg-surface-container-high px-3 py-1 text-sm text-on-surface-variant sm:inline-block',
        },
        'Toolchain Ready',
      ),
    ),

    el(
      'p',
      { class: 'text-base leading-relaxed text-on-surface-variant' },
      'Select your preferred method to interact with the active beacon. No installation is ' +
        'needed when using the in-browser web client.',
    ),

    el(
      'div',
      { class: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' },
      ...cards,
    ),

    drawer,

    el(
      'div',
      { class: 'flex justify-end pt-2' },
      nextStageButton('Next: Stage 3 (Access & Connect)', 3, 'secondary'),
    ),
  )
}

/* -------------------------------------------------------------------------- */
/* Stage 3 — attach and connect                                                */
/* -------------------------------------------------------------------------- */

function createStage3(secret: SecretState): { node: HTMLElement; refresh: () => void } {
  // A secret carrying a space or a quote has to survive the shell, so the whole
  // qs:// operand is quoted as one word when it needs it.
  const placeholder = (): string => {
    const value = secret.enabled ? secret.value.trim() : ''
    return value ? shQuoteIfNeeded(`qs://${value}`) : 'qs://<secret>'
  }

  const shellCode = el('code', { class: 'whitespace-pre font-mono text-[13px] text-primary' }, '')
  const forwardCode = el(
    'code',
    { class: 'whitespace-pre font-mono text-[13px] text-secondary' },
    '',
  )

  const shellCmd = (): string => `qsock ssh ${placeholder()}`
  const forwardCmd = (): string => `qsock ssh -N -L 2222:localhost:22 ${placeholder()}`

  const card = (
    title: string,
    tag: string,
    body: string,
    code: HTMLElement,
    getText: () => string,
    hover: string,
  ): HTMLElement =>
    el(
      'div',
      {
        class:
          'space-y-3 rounded-md border border-surface-container-high/40 bg-surface-container ' +
          `p-5 transition-colors ${hover}`,
      },
      el(
        'div',
        { class: 'flex items-center justify-between gap-2' },
        el('span', { class: 'text-sm font-semibold text-on-surface' }, title),
        el('span', { class: 'text-xs text-outline' }, tag),
      ),
      el('p', { class: 'text-[13px] text-on-surface-variant' }, body),
      el(
        'div',
        {
          class:
            'flex items-center justify-between gap-2 rounded border border-surface-container/40 ' +
            'bg-surface-container-lowest p-3',
        },
        el('div', { class: 'cmd-scroll min-w-0 flex-1' }, code),
        copyButton(getText, true),
      ),
    )

  const node = el(
    'div',
    { class: stageCardClass, id: 'stage3Card', dataset: { stage: '3' } },

    el(
      'div',
      { class: 'flex items-start justify-between gap-4' },
      stageHeading('03', 'Attach & Initiate Encrypted Link'),
      el(
        'span',
        {
          class:
            'hidden shrink-0 rounded border border-primary/20 bg-primary/10 px-3 py-1 ' +
            'text-sm text-primary sm:inline-block',
        },
        'Ready to Tunnel',
      ),
    ),

    el(
      'p',
      { class: 'text-base leading-relaxed text-on-surface-variant' },
      'Run the client attachment command with the secret established during deployment. ' +
        'Global flags go before the subcommand; each subcommand takes its own options after it.',
    ),

    el(
      'div',
      { class: 'grid grid-cols-1 gap-4 md:grid-cols-2' },
      card(
        'Interactive TTY Terminal',
        'Direct shell',
        'Opens an interactive PTY session on the remote peer, exactly like a regular ssh client.',
        shellCode,
        shellCmd,
        'hover:border-primary/30',
      ),
      card(
        'Local Port Forward Tunnel',
        'SSH / RDP / HTTP',
        'Binds local port 2222 through the tunnel to port 22 on the remote peer. -L is repeatable.',
        forwardCode,
        forwardCmd,
        'hover:border-secondary/30',
      ),
    ),

    el(
      'p',
      { class: 'flex items-start gap-1.5 text-[13px] text-outline' },
      icon('info', 'shrink-0 text-primary mt-px', 16),
      'A secret that is not a UUID is hashed into one, so the qs:// scheme is optional and a ' +
        'plain string works just as well. Use qsock -g to generate a strong one.',
    ),
  )

  const refresh = (): void => {
    shellCode.textContent = shellCmd()
    forwardCode.textContent = forwardCmd()
  }
  refresh()

  return { node, refresh }
}

/* -------------------------------------------------------------------------- */
/* Stage navigation                                                            */
/* -------------------------------------------------------------------------- */

function mountStageNavigation(root: HTMLElement): void {
  const navs = all<HTMLElement>('.stage-nav', root)
  const cards = all<HTMLElement>('.stage-card', root)

  const activate = (stage: number): void => {
    for (const nav of navs) {
      nav.dataset['active'] = String(nav.dataset['gotoStage'] === String(stage))
    }

    const card = cards.find((entry) => entry.dataset['stage'] === String(stage))
    if (!card) return

    card.scrollIntoView({ behavior: 'smooth', block: 'start' })
    card.classList.add('ring-1', 'ring-primary/40')
    window.setTimeout(() => card.classList.remove('ring-1', 'ring-primary/40'), 1200)
  }

  root.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-goto-stage]')
    if (!trigger) return
    const stage = Number(trigger.dataset['gotoStage'])
    if (Number.isFinite(stage)) activate(stage)
  })

  // Keep the stage bar in step with whichever card is actually on screen.
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return

      const stage = (visible.target as HTMLElement).dataset['stage']
      for (const nav of navs) {
        nav.dataset['active'] = String(nav.dataset['gotoStage'] === stage)
      }
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  )

  for (const card of cards) observer.observe(card)
}
