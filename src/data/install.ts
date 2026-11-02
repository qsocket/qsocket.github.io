import type { IconName } from '../lib/icons'
import type { OsKey } from '../lib/platform'

/**
 * Install one-liners.
 *
 * `qsocket.io` serves a different installer depending on the requesting
 * user-agent: a bash script for curl/wget, a PowerShell script for
 * `iwr`/`irm`. Both read the secret from an `S` environment variable, so the
 * custom-secret form of each command just sets it before the pipe.
 */
export interface Transport {
  readonly id: string
  readonly label: string
  /** Builds the command, optionally pre-setting a secret. */
  readonly command: (secret: string) => string
}

export interface InstallTarget {
  readonly id: OsKey
  readonly label: string
  /** Shell prompt character shown to the left of the command. */
  readonly prompt: string
  readonly note: string
  readonly transports: readonly Transport[]
}

/** Quotes a value for a POSIX shell, escaping anything that would break out. */
export function shQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`
}

/** Characters a POSIX shell passes through untouched. */
const SHELL_SAFE = /^[A-Za-z0-9_@%+=:,./-]+$/

/** Quotes only when the value would otherwise be re-split or expanded. */
export function shQuoteIfNeeded(value: string): string {
  return SHELL_SAFE.test(value) ? value : shQuote(value)
}

/** Quotes a secret for a PowerShell double-quoted string. */
function psQuote(value: string): string {
  return `"${value.replaceAll('`', '``').replaceAll('"', '`"').replaceAll('$', '`$')}"`
}

export const INSTALL_TARGETS: readonly InstallTarget[] = [
  {
    id: 'unix',
    label: 'Linux / macOS',
    prompt: '$',
    note: 'Installs under /usr/bin when run as root, otherwise under ~/.config.',
    transports: [
      {
        id: 'curl',
        label: 'curl',
        command: (secret) =>
          secret
            ? `S=${shQuote(secret)} bash -c "$(curl -fsSL qsocket.io)"`
            : 'curl -fsSL qsocket.io | bash',
      },
      {
        id: 'wget',
        label: 'wget',
        command: (secret) =>
          secret
            ? `S=${shQuote(secret)} bash -c "$(wget -q -O- qsocket.io)"`
            : 'wget -q -O- qsocket.io | bash',
      },
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    prompt: 'PS>',
    note: 'The relay endpoint is reached over TLS on port 443, like any HTTPS request.',
    transports: [
      {
        id: 'irm',
        label: 'irm',
        command: (secret) =>
          secret ? `$Env:S=${psQuote(secret)}; irm qsocket.io/1 | iex` : 'irm qsocket.io/1 | iex',
      },
      {
        id: 'iwr',
        label: 'iwr',
        command: (secret) =>
          secret
            ? `$Env:S=${psQuote(secret)}; iwr -useb qsocket.io/1 | iex`
            : 'iwr -useb qsocket.io/1 | iex',
      },
    ],
  },
  {
    id: 'android',
    label: 'Android',
    prompt: '$',
    note: 'Run inside Termux, or over an ADB shell on a device you control.',
    transports: [
      {
        id: 'curl',
        label: 'curl',
        command: (secret) =>
          secret
            ? `S=${shQuote(secret)} bash -c "$(curl -fsSL qsocket.io/2)"`
            : 'bash -c "$(curl -fsSL qsocket.io/2)"',
      },
    ],
  },
]

/** Other ways to get the binary, all documented in the repository README. */
export interface InstallPath {
  readonly title: string
  readonly body: string
  readonly icon: IconName
  readonly accent: 'primary' | 'secondary' | 'tertiary' | 'neutral'
  readonly href?: string
  readonly linkLabel?: string
  readonly command?: string
}

export const INSTALL_PATHS: readonly InstallPath[] = [
  {
    title: 'Binary release',
    body: 'Static, stripped builds for every supported operating system and architecture.',
    icon: 'download',
    accent: 'primary',
    href: 'https://github.com/qsocket/qsocket/releases',
    linkLabel: 'GitHub Releases',
  },
  {
    title: 'Docker image',
    body: 'Pull the published image and run the client without installing anything on the host.',
    icon: 'box',
    accent: 'secondary',
    command: 'docker run -it qsocket/qsocket --help',
  },
  {
    title: 'Build from source',
    body: 'Needs nothing but the Go toolchain. The default goal builds the host binary into ./build.',
    icon: 'terminal',
    accent: 'neutral',
    command: 'git clone https://github.com/qsocket/qsocket\ncd qsocket && make',
  },
  {
    title: 'Cloud Shell',
    body: 'Open the repository in an ephemeral Google Cloud Shell workspace, already checked out.',
    icon: 'cloud',
    accent: 'tertiary',
    href: 'https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/qsocket/qsocket&tutorial=README.md',
    linkLabel: 'Open in Cloud Shell',
  },
]
