/**
 * Clipboard access with a fallback and real failure handling.
 *
 * `navigator.clipboard` is undefined outside secure contexts and its promise
 * rejects when the permission is denied. The original code called
 * `.writeText(...).then(...)` with no `catch`, so a denial produced an
 * unhandled rejection and a button that silently never acknowledged the click.
 */
export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to the legacy path below.
    }
  }

  return copyViaTextarea(text)
}

function copyViaTextarea(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.setAttribute('aria-hidden', 'true')
  textarea.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;'
  document.body.append(textarea)

  const selection = document.getSelection()
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

  try {
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    // Deprecated, but it is still the only option in an insecure context.
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
    if (previousRange && selection) {
      selection.removeAllRanges()
      selection.addRange(previousRange)
    }
  }
}

const RESET_DELAY_MS = 2000

/**
 * Wires a copy button to a source of text, handling the transient "Copied!"
 * state, the failure state, and announcing both to assistive technology.
 *
 * The button is expected to contain a `[data-copy-icon]` slot and a
 * `[data-copy-label]` slot; both are swapped and then restored.
 */
export function attachCopyButton(
  button: HTMLButtonElement,
  getText: () => string,
  renderIcon: (state: 'idle' | 'done' | 'failed') => SVGElement,
): void {
  const label = button.querySelector<HTMLElement>('[data-copy-label]')
  const iconSlot = button.querySelector<HTMLElement>('[data-copy-icon]')
  const idleLabel = label?.textContent ?? 'Copy'

  let resetTimer: number | undefined

  const paint = (state: 'idle' | 'done' | 'failed'): void => {
    if (label) {
      label.textContent =
        state === 'idle' ? idleLabel : state === 'done' ? 'Copied!' : 'Press Ctrl+C'
    }
    iconSlot?.replaceChildren(renderIcon(state))
    button.classList.toggle('text-primary', state === 'done')
    button.classList.toggle('text-error', state === 'failed')
  }

  button.addEventListener('click', (event) => {
    event.stopPropagation()
    event.preventDefault()

    void copyText(getText()).then((ok) => {
      window.clearTimeout(resetTimer)
      paint(ok ? 'done' : 'failed')
      resetTimer = window.setTimeout(() => paint('idle'), RESET_DELAY_MS)
    })
  })
}
