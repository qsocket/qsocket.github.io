import wormholeUrl from '../assets/wormhole.png'

import type { IconName } from '../lib/icons'

/**
 * Static page content.
 *
 * Figures and claims here are the ones the repository actually documents, so
 * that the site and the README cannot drift apart silently.
 * https://github.com/qsocket/qsocket
 */

export const LINKS = {
  repo: 'https://github.com/qsocket/qsocket',
  releases: 'https://github.com/qsocket/qsocket/releases',
  issues: 'https://github.com/qsocket/qsocket/issues',
  license: 'https://github.com/qsocket/qsocket/blob/master/LICENSE',
  webCli: 'https://cli.qsocket.io',
  cloudShell:
    'https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/qsocket/qsocket&tutorial=README.md',
  dockerHub: 'https://hub.docker.com/r/qsocket/qsocket',
  srp: 'https://en.wikipedia.org/wiki/Secure_Remote_Password_protocol',
  forwardSecrecy: 'https://en.wikipedia.org/wiki/Forward_secrecy',
  abuseMail:
    'mailto:abuse@qsocket.io?subject=Abuse%20Request&body=IP%3A%20%3CIP%20address%20of%20the%20affected%20system%3E%0A%3CExplain%20the%20issue.%20Example%3A%20a%20QSocket%20instance%20was%20installed%20on%20one%20of%20my%20systems%20without%20my%20knowledge%20or%20consent...%3E',
  contactMail: 'mailto:contact@qsocket.io',
} as const

/** The three nodes of the connection architecture diagram. */
export interface TopologyNode {
  readonly id: string
  readonly badge: string
  readonly name: string
  readonly detail: string
  readonly icon: IconName
  /** Overrides `icon` with an image asset when set. */
  readonly image?: string
  readonly accent: 'primary' | 'secondary'
  readonly step: string
  readonly title: string
  readonly body: string
}

export const TOPOLOGY: readonly TopologyNode[] = [
  {
    id: 'peer-a',
    badge: 'Peer A',
    name: 'Listening peer',
    detail: 'behind NAT',
    icon: 'server',
    accent: 'primary',
    step: 'Step 01',
    title: 'It starts with a secret',
    body: 'A peer starts listening with a secret and dials out to the relay on port 443. Nothing listens on a public address, and no port is forwarded — the connection is outbound, like any HTTPS request.',
  },
  {
    id: 'qsrn',
    badge: 'QSRN',
    name: 'Relay network',
    detail: 'relay.qsocket.io:443',
    icon: 'hub',
    image: wormholeUrl,
    accent: 'primary',
    step: 'Step 02',
    title: 'A bridge, not a boundary',
    body: 'Both peers derive the same identifier from the same secret without exchanging anything: the first 16 bytes of its SHA-256 digest. The gate matches the two and relays ciphertext between them — it never holds the session key.',
  },
  {
    id: 'peer-b',
    badge: 'Peer B',
    name: 'Connecting peer',
    detail: 'behind NAT',
    icon: 'laptop',
    accent: 'secondary',
    step: 'Step 03',
    title: 'End to end, not end to relay',
    body: 'The second peer presents the same secret and the two sides complete an SRP handshake through the gate. The 256-bit session key is fresh for every session and never derived from the secret itself.',
  },
]

/** Headline figures, all drawn from the README support matrix. */
export interface Stat {
  readonly value: string
  readonly label: string
  readonly detail: string
  readonly accent: 'primary' | 'secondary'
}

export const STATS: readonly Stat[] = [
  {
    value: '12',
    label: 'Operating systems',
    detail: 'Linux, macOS, Windows, Android, FreeBSD, OpenBSD, NetBSD, Solaris, Illumos, Dragonfly, AIX',
    accent: 'primary',
  },
  {
    value: '13',
    label: 'CPU architectures',
    detail: 'AMD64, ARM64, 386, ARM32, RISCV64, LOONG64, MIPS and variants, PPC64, S390X',
    accent: 'secondary',
  },
  {
    value: '0',
    label: 'Ports to open',
    detail: 'Both peers dial out to the relay gate over TLS on 443, so neither needs a public address',
    accent: 'primary',
  },
  {
    value: 'SRP',
    label: 'Key exchange',
    detail: 'Secure Remote Password, with a random 256-bit session key for every session',
    accent: 'secondary',
  },
]

/** The security notes from the README, trimmed to the claims it actually makes. */
export const SECURITY_NOTES: readonly { title: string; body: string }[] = [
  {
    title: 'End to end, not end to relay',
    body: 'Connections are encrypted user to user. The relay network carries encrypted data between the two peers and nothing else.',
  },
  {
    title: 'Forward secrecy through SRP',
    body: 'Session keys always differ, so recorded traffic cannot be decrypted later by a third party even if the secret itself becomes known.',
  },
  {
    title: 'Ephemeral session keys',
    body: 'The 256-bit session key is generated randomly for every session, and is not derived from the password.',
  },
  {
    title: 'Pick a strong secret',
    body: 'A brute-force attempt needs a new TCP connection per guess and the gate rate-limits those, but a guessable secret is still a guessable secret. Use qsock -g.',
  },
]
