/** The install targets the site offers a one-liner for. */
export type OsKey = 'unix' | 'windows' | 'android'

/**
 * Best-effort guess at the visitor's platform, used only to preselect a tab.
 *
 * `navigator.userAgentData` is the non-deprecated path where it exists; the
 * user-agent string is the fallback. Order matters: an Android user-agent also
 * contains "linux", and a Windows one does not contain "win" in every casing,
 * so the checks run most-specific first against a lowercased string.
 */
export function detectOs(): OsKey {
  const platform = readPlatformHint().toLowerCase()

  if (platform.includes('android')) return 'android'
  if (platform.includes('win')) return 'windows'
  return 'unix'
}

function readPlatformHint(): string {
  const uaData = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData

  if (typeof uaData?.platform === 'string' && uaData.platform.length > 0) {
    return uaData.platform
  }

  return navigator.userAgent
}

/** A human-readable name for the detected platform. */
export function osDisplayName(os: OsKey): string {
  switch (os) {
    case 'windows':
      return 'Windows'
    case 'android':
      return 'Android'
    case 'unix':
      return 'Linux / macOS'
  }
}
