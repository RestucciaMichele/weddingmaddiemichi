<template>
  <transition name="fade" appear>
    <div v-if="isLoading" class="loading-screen" role="status" aria-live="polite">
      <div class="loading-stage">
        <div class="loading-content">
          <img src="/logo.svg" alt="logo" class="logo" />
          <div class="loading-dots" aria-hidden="true">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { useLoadingScreen } from '@/stores/loadingScreen'

const { isLoading } = useLoadingScreen()

let previousHtmlOverflow = ''
let previousBodyOverflow = ''

function lockScroll() {
  previousHtmlOverflow = document.documentElement.style.overflow
  previousBodyOverflow = document.body.style.overflow
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

function unlockScroll() {
  document.documentElement.style.overflow = previousHtmlOverflow
  document.body.style.overflow = previousBodyOverflow
}

watch(
  isLoading,
  (active) => {
    if (active) {
      lockScroll()
      return
    }
    unlockScroll()
  },
  { immediate: true }
)

onUnmounted(() => {
  unlockScroll()
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: #7a5240;
  overflow: hidden;
}

.loading-stage {
  width: 100%;
  height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 24px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.logo {
  display: block;
  width: 100%;
  max-width: 500px;
  max-height: 500px;
}

.loading-dots {
  display: flex;
  gap: 16px;
}

.dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.95);
  animation: dotPulse 1.35s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0.55);
    opacity: 0.35;
  }
  40% {
    transform: scale(1.35);
    opacity: 1;
  }
}

@media (max-width: 767px) {
  .logo {
    max-width: 300px;
    max-height: 300px;
  }
}

/* Fade: no enter animation (instant), but smooth leave (fade-out) */
.fade-enter-active {
  transition: none;
}
.fade-enter-from, .fade-enter-to {
  opacity: 1;
}
.fade-leave-active {
  transition: opacity .5s ease;
}
.fade-leave-to {
  opacity: 0;
}
</style>
