import type { IconName } from '../lib/icons'

/**
 * Usage examples, taken from the qsocket repository README.
 *
 * https://github.com/qsocket/qsocket#examples
 *
 * The CLI is subcommand based (`ssh`, `scp`, `netcat`); global flags go
 * *before* the subcommand and each subcommand takes its own options after it.
 * Secrets are `qs://` URIs carrying a UUID; a secret that is not a UUID is
 * hashed into one, and the scheme itself is optional.
 */

/** Which machine a command runs on, rendered as a badge beside it. */
export type Peer = 'a' | 'b'

export interface Step {
  readonly peer: Peer
  readonly command: string
  /** Shown under the command when the step needs a word of explanation. */
  readonly note?: string
}

export interface Example {
  readonly id: string
  readonly label: string
  readonly icon: IconName
  readonly title: string
  readonly summary: string
  readonly steps: readonly Step[]
  /** Rendered as a caveat callout under the steps. */
  readonly caveat?: string
}

export const PEER_LABELS: Readonly<Record<Peer, string>> = {
  a: 'Workstation A',
  b: 'Workstation B',
}

export const EXAMPLES: readonly Example[] = [
  {
    id: 'shell',
    label: 'Remote shell',
    icon: 'terminal',
    title: 'Interactive session through any firewall or NAT',
    summary:
      'The listening peer serves whichever session the connecting peer asks for, so it needs nothing but the secret. `ssh` opens an interactive PTY, exactly like a regular ssh client.',
    steps: [
      { peer: 'a', command: 'qsock -l qs://<secret>' },
      { peer: 'b', command: 'qsock ssh qs://<secret>' },
      {
        peer: 'b',
        command: 'qsock ssh qs://<secret> "uname -a; id"',
        note: 'A command after the secret runs in the remote shell instead of starting one.',
      },
    ],
  },
  {
    id: 'forward',
    label: 'Port forwarding',
    icon: 'swap-horiz',
    title: 'Local port forwarding with -L',
    summary:
      'Forwarding is configured exactly as with a normal ssh client. A forwarding session never starts a shell, it only tunnels TCP traffic until it is interrupted. `-L` is repeatable, so one session can carry as many ports as needed.',
    steps: [
      { peer: 'a', command: 'qsock -l qs://<secret>' },
      { peer: 'b', command: 'qsock ssh -N -L 2222:localhost:22 qs://<secret>' },
      { peer: 'b', command: 'ssh -p 2222 user@localhost' },
    ],
    caveat:
      'By default anyone on the network can reach the forwarded port. Prefix a bind address — -L 127.0.0.1:2222:localhost:22 — to restrict it to the local host.',
  },
  {
    id: 'lan',
    label: 'Private LAN',
    icon: 'lan',
    title: 'Reach a host on the remote private network',
    summary:
      'The forward target is resolved from the remote peer, so any address that peer can reach becomes reachable locally — intranet apps, admin panels, databases.',
    steps: [
      { peer: 'a', command: 'qsock -l qs://<secret>' },
      { peer: 'b', command: 'qsock ssh -N -L 8080:192.168.6.7:80 qs://<secret>' },
      { peer: 'b', command: 'curl http://127.0.0.1:8080' },
    ],
  },
  {
    id: 'scp',
    label: 'File transfer',
    icon: 'folder',
    title: 'Copy files and folders with scp',
    summary:
      'Exactly one of the two operands carries a `qs://<secret>:/path` target, and that is what picks the direction of the transfer. The scheme stays mandatory here — it is what tells the remote end apart from the local path.',
    steps: [
      { peer: 'a', command: 'qsock -l qs://<secret>' },
      {
        peer: 'b',
        command: 'qsock scp local.txt qs://<secret>:/target/',
        note: 'Local file to the remote peer.',
      },
      {
        peer: 'b',
        command: 'qsock scp -r qs://<secret>:/etc/nginx .',
        note: 'Remote folder to the current directory. Folders need -r.',
      },
    ],
  },
  {
    id: 'netcat',
    label: 'Pipes',
    icon: 'cable',
    title: 'Raw data channel for shell pipelines',
    summary:
      '`netcat` is the same as `ssh` except that it provides a raw data channel instead of an interactive PTY, which makes it usable on either end of a pipe.',
    steps: [
      { peer: 'a', command: 'qsock -l qs://<secret> > warez.tar.gz' },
      { peer: 'b', command: 'qsock netcat qs://<secret> < warez.tar.gz' },
      {
        peer: 'b',
        command: 'qsock netcat qs://<secret> "echo hello_world; id"',
        note: 'Execute a command and read its raw output, nc -e style.',
      },
    ],
  },
  {
    id: 'socks',
    label: 'SOCKS proxy',
    icon: 'globe-lock',
    title: 'Proxy through the remote private network',
    summary:
      "Forward the remote SSH port, then let the remote system's own ssh daemon provide the dynamic proxy. Everything sent through port 9090 then egresses from Workstation A.",
    steps: [
      { peer: 'a', command: 'qsock -l qs://<secret>' },
      { peer: 'b', command: 'qsock ssh -N -L 2222:localhost:22 qs://<secret>' },
      { peer: 'b', command: 'ssh -p 2222 -D 9090 root@localhost' },
      { peer: 'b', command: 'curl --socks4a 127.1:9090 http://www.google.com' },
    ],
    caveat:
      "qsock's own -D flag is parsed but not implemented yet, so the proxy comes from the remote ssh daemon rather than from qsock itself.",
  },
  {
    id: 'sshfs',
    label: 'Mount',
    icon: 'hard-drive',
    title: 'Mount a remote folder with sshfs',
    summary:
      'Because the forward is an ordinary TCP port, anything that speaks SSH works over it unchanged — including sshfs.',
    steps: [
      { peer: 'a', command: 'qsock -l qs://<secret>' },
      { peer: 'b', command: 'qsock ssh -N -L 2222:localhost:22 qs://<secret>' },
      {
        peer: 'b',
        command:
          'sudo sshfs -p 2222 -o allow_other,default_permissions root@localhost:/remote_dir /mnt/local_dir',
      },
    ],
  },
  {
    id: 'relay',
    label: 'Private gate',
    icon: 'server',
    title: 'Run the session through a gate of your own',
    summary:
      'Both peers reach each other through the public QSRN gate on port 443. `--relay-server` dials a gate of your own, and `--relay-sni` puts an arbitrary server name on the wire during the TLS handshake — the one part of it that travels in the clear.',
    steps: [
      {
        peer: 'a',
        command:
          'qsock --relay-server gate.example.com --relay-sni www.google.com -l qs://<secret>',
      },
      {
        peer: 'b',
        command:
          'qsock --relay-server gate.example.com --relay-sni www.google.com ssh qs://<secret>',
      },
    ],
    caveat:
      'The certificate presented by the gate still has to be valid for the name indicated, so a spoofed name must be one the gate — or the CDN in front of it — can answer for. Both peers must be on the same gate to find each other.',
  },
]

/** The `qsock -g` secret generation snippet shown beside the examples. */
export const SECRET_SNIPPET = {
  command: 'qsock -g',
  output: 'qs://f81d4fae-7dec-41d0-a765-00a0c91e6bf6',
} as const
