import './styles/main.css'

import { must } from './lib/dom'
import { createHeader } from './components/header'
import { createHero } from './components/hero'
import { createStages } from './components/stages'
import { createExamples } from './components/examples'
import { createSecurity, createStats } from './components/security'
import { createFooter } from './components/footer'

/**
 * Entry point.
 *
 * The page is composed from one tree built in order, which keeps a single
 * layout pass and avoids the original's pattern of shipping the full markup
 * and then rewriting it from several competing inline scripts.
 */
function mount(): void {
  const root = must('#app')

  const main = document.createElement('main')
  main.className = 'w-full pt-16'
  main.id = 'main'
  main.append(createHero(), createStages(), createExamples(), createStats(), createSecurity())

  root.replaceChildren(createHeader(), main, createFooter())
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true })
} else {
  mount()
}
