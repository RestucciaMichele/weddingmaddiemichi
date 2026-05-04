<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

import { onBeforeUnmount, ref, watch } from 'vue'

const isMobileMenuOpen = ref(false)
const router = useRouter()
const route = useRoute()

let navigationTimer: number | null = null

const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

function blockScrollEvent(event: Event) {
  if (!isMobileMenuOpen.value) return
  event.preventDefault()
  event.stopPropagation()
  if ('stopImmediatePropagation' in event) {
    event.stopImmediatePropagation()
  }
}

function blockScrollKeyEvent(event: Event) {
  if (!isMobileMenuOpen.value) return
  if (!(event instanceof KeyboardEvent)) return
  if (!scrollKeys.has(event.key)) return
  event.preventDefault()
  event.stopPropagation()
}

function setScrollGuards(isEnabled: boolean) {
  const method = isEnabled ? 'addEventListener' : 'removeEventListener'
  window[method]('wheel', blockScrollEvent, { passive: false, capture: true })
  window[method]('touchmove', blockScrollEvent, { passive: false, capture: true })
  window[method]('keydown', blockScrollKeyEvent, { capture: true })
}

function setPageScrollLock(isLocked: boolean) {
  const overflowValue = isLocked ? 'hidden' : ''
  document.documentElement.style.overflow = overflowValue
  document.body.style.overflow = overflowValue
  setScrollGuards(isLocked)
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function navigateFromMobileMenu(target: { name: 'Home' | 'Ricevimento' | 'Amazon'; hash?: string }) {
  closeMobileMenu()

  if (route.name === target.name && route.hash === (target.hash ?? '')) return

  if (navigationTimer) {
    window.clearTimeout(navigationTimer)
  }

  // Lascia terminare la transizione di chiusura prima della navigazione
  navigationTimer = window.setTimeout(() => {
    router.push(target)
  }, 200)
}

watch(
  isMobileMenuOpen,
  (isOpen) => {
    setPageScrollLock(isOpen)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  setPageScrollLock(false)
})
</script>

<template>
  <div class="navbar glass-navbar fixed top-4 right-4 left-auto w-auto z-[120]">
    <button class="menu-trigger" :class="{ 'is-open': isMobileMenuOpen }" aria-label="Apri menu" @click="toggleMobileMenu">
      <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M18 6l-12 12" />
      </svg>
    </button>

    <Transition name="menu-panel">
      <div v-if="isMobileMenuOpen" class="menu-overlay" @click.self="closeMobileMenu">
        <ul class="menu-panel-fullscreen">
          <li><button type="button" @click="navigateFromMobileMenu({ name: 'Home' })">Home</button></li>
          <li><button type="button" @click="navigateFromMobileMenu({ name: 'Home', hash: '#cerimonia' })">Cerimonia</button></li>
          <li><button type="button" @click="navigateFromMobileMenu({ name: 'Ricevimento' })">Ricevimento</button></li>
          <li><button type="button" @click="navigateFromMobileMenu({ name: 'Ricevimento', hash: '#rsvp-section' })">RSVP</button></li>
          <li><button type="button" @click="navigateFromMobileMenu({ name: 'Amazon' })">Lista nozze</button></li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.glass-navbar {
  background: transparent;
}

.menu-trigger {
  position: relative;
  z-index: 2;
  cursor: pointer;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.26);
  color: #4a2f24;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 22px rgba(28, 16, 12, 0.2);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.menu-trigger.is-open {
  color: #4a2f24;
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.menu-trigger:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.32);
}

.menu-trigger.is-open:hover {
  background: transparent;
}


.menu-overlay {
  position: fixed;
  inset: 1.35rem;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 33px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 20px 42px rgba(28, 16, 12, 0.18);
  transform-origin: top right;
}

@media (min-width: 900px) {
  .menu-overlay {
    left: auto;
    right: 1.35rem;
    top: 1.35rem;
    bottom: 1.35rem;
    width: 25vw;
    max-width: 600px;
    min-width: 340px;
    justify-content: flex-end;
    padding: 0;
    /* The panel will be at the right, not centered */
  }
  .menu-panel-fullscreen {
    align-items: flex-end;
    text-align: right;
    width: 100%;
    padding-right: 3vw;
  }
}

.menu-panel-fullscreen {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vh, 1.5rem);
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: center;
}

.menu-panel-fullscreen button {
  position: relative;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #4a2f24;
  font-size: clamp(2rem, 3vw, 3.6rem);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.08;
  padding: 0.12em 0.28em;
  transition: transform 0.18s ease, color 0.2s ease;
}

.menu-panel-fullscreen button::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -0.08em;
  width: 82%;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  opacity: 0;
  transition: transform 0.22s ease, opacity 0.22s ease;
}


.menu-panel-fullscreen button:hover,
.menu-panel-fullscreen button:focus-visible,
.menu-panel-fullscreen button:active {
  background: transparent;
  color: #4a2f24;
  transform: translateY(-1px);
  outline: none;
}

.menu-panel-fullscreen button:hover::after,
.menu-panel-fullscreen button:focus-visible::after,
.menu-panel-fullscreen button:active::after {
  opacity: 1;
  transform: translateX(-50%) scaleX(1);
}

.menu-panel-enter-active,
.menu-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-panel-enter-from,
.menu-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>

