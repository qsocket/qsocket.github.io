#!/usr/bin/env bash
#
# Build the static QSocket site into dist/.
#
# The output is plain HTML, CSS, JS and images with no backend component, ready
# to be served by GitHub Pages (or any static host).
#
# Usage:
#   ./build.sh                 Build into dist/
#   ./build.sh --clean         Remove dist/ and node_modules/ first
#   ./build.sh --reinstall     Reinstall dependencies even if they look current
#   ./build.sh --serve         Build, then preview the result locally
#
# Environment:
#   BASE_PATH=/repo/           Build for a project page served from a subpath
#   SKIP_INSTALL=1             Use the existing node_modules as-is
#   INSTALL_TIMEOUT=180        Seconds to allow for the dependency install
#
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

readonly OUT_DIR="dist"
BASE_PATH="${BASE_PATH:-/}"
clean=0
serve=0
reinstall=0

for arg in "$@"; do
  case "$arg" in
    --clean) clean=1 ;;
    --serve) serve=1 ;;
    --reinstall) reinstall=1 ;;
    -h | --help)
      awk 'NR > 1 { if ($0 !~ /^#/) exit; sub(/^# ?/, ""); print }' "${BASH_SOURCE[0]}"
      exit 0
      ;;
    *)
      echo "error: unknown option '$arg' (try --help)" >&2
      exit 2
      ;;
  esac
done

log() { printf '\033[32m==>\033[0m %s\n' "$*"; }
die() {
  printf '\033[31merror:\033[0m %s\n' "$*" >&2
  exit 1
}

command -v bun >/dev/null 2>&1 ||
  die "bun is not installed. See https://bun.sh for installation instructions."

if ((clean)); then
  log "Cleaning $OUT_DIR/ and node_modules/"
  rm -rf "$OUT_DIR" node_modules
fi

# Dependencies.
#
# `bun install` applies no deadline of its own. If the host resolves the
# registry to an address it cannot actually reach, bun sits at "Resolving
# dependencies" forever instead of failing. The usual cause is a stale IPv6
# default route: DNS answers with AAAA records first, the route blackholes, and
# bun — unlike curl and npm, which implement Happy Eyeballs — never falls back
# to IPv4. Bounding the step turns that indefinite hang into a diagnosis.
install_timeout="${INSTALL_TIMEOUT:-180}"

deps_look_current() {
  [[ -d node_modules ]] || return 1
  [[ node_modules -nt package.json ]] || return 1
  [[ ! -f bun.lock || node_modules -nt bun.lock ]]
}

diagnose_network() {
  printf '\n' >&2
  printf 'The dependency install did not finish within %ss.\n\n' "$install_timeout" >&2

  if command -v curl >/dev/null 2>&1 &&
    ! curl -s6 -o /dev/null -m 8 https://registry.npmjs.org/ 2>/dev/null &&
    curl -s4 -o /dev/null -m 8 https://registry.npmjs.org/ 2>/dev/null; then
    cat >&2 <<'DIAG'
This host can reach registry.npmjs.org over IPv4 but not over IPv6, and DNS
hands out the IPv6 address first. bun does not fall back to IPv4, so it waits
on a connection that will never open.

Check for a default IPv6 route that does not actually carry traffic:

    ip -6 route show default
    curl -6 -m 8 https://registry.npmjs.org/   # hangs if the route is dead

If a router advertisement installed that route, dropping it restores IPv4:

    sudo sysctl -w net.ipv6.conf.<interface>.accept_ra=0
    sudo ip -6 route del default dev <interface>

To get a build out in the meantime, install with npm (it does fall back to
IPv4) and let this script reuse the result:

    npm install --no-audit --no-fund
    SKIP_INSTALL=1 ./build.sh
DIAG
  else
    printf 'Check network access to the npm registry, then re-run.\n' >&2
  fi
}

install_deps() {
  if [[ -n "${SKIP_INSTALL:-}" ]]; then
    log "Skipping dependency install (SKIP_INSTALL is set)"
    [[ -d node_modules ]] ||
      die "SKIP_INSTALL is set but node_modules/ does not exist."
    return 0
  fi

  if ((!reinstall)) && deps_look_current; then
    log "Dependencies look current, skipping install (--reinstall to force)"
    return 0
  fi

  # --frozen-lockfile keeps CI honest: the build fails rather than silently
  # resolving a different dependency tree than the one that was committed.
  local flags=()
  [[ -f bun.lock && -n "${CI:-}" ]] && flags+=(--frozen-lockfile)

  log "Installing dependencies"
  local status=0
  timeout "$install_timeout" bun install "${flags[@]}" || status=$?
  ((status == 0)) && return 0

  ((status == 124)) && diagnose_network
  die "bun install failed (exit $status)."
}

install_deps

log "Type-checking"
bun run typecheck

log "Building (base path: $BASE_PATH)"
BASE_PATH="$BASE_PATH" bun run vite build

# GitHub Pages runs Jekyll over the published tree unless this file is present,
# which would drop any path beginning with an underscore.
touch "$OUT_DIR/.nojekyll"

# A custom domain needs a CNAME in the published tree. Keeping the canonical
# copy at the repository root means `emptyOutDir` cannot throw it away.
if [[ -f CNAME ]]; then
  cp CNAME "$OUT_DIR/CNAME"
  log "Copied CNAME ($(cat CNAME))"
fi

size="$(du -sh "$OUT_DIR" | cut -f1)"
files="$(find "$OUT_DIR" -type f | wc -l | tr -d ' ')"
log "Built $files files into $OUT_DIR/ ($size)"

if ((serve)); then
  log "Serving $OUT_DIR/ — press Ctrl+C to stop"
  bun run preview
fi
