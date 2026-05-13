import { ref, computed } from 'vue'

const MIN_LOADING_MS = 2000
const MAX_LOADING_MS = 6000

const loadingVisible = ref(true)
let loadingStartedAt = 0
let minTimer: ReturnType<typeof setTimeout> | null = null
let maxTimer: ReturnType<typeof setTimeout> | null = null

function clearTimers() {
  if (minTimer) {
    clearTimeout(minTimer)
    minTimer = null
  }

  if (maxTimer) {
    clearTimeout(maxTimer)
    maxTimer = null
  }
}

export function beginLoading() {
  clearTimers()
  loadingStartedAt = performance.now()
  loadingVisible.value = true

  maxTimer = setTimeout(() => {
    loadingVisible.value = false
    clearTimers()
  }, MAX_LOADING_MS)
}

export function requestLoadingHide() {
  if (!loadingVisible.value) return

  const elapsed = performance.now() - loadingStartedAt
  const remaining = Math.max(0, MIN_LOADING_MS - elapsed)

  if (remaining === 0) {
    loadingVisible.value = false
    clearTimers()
    return
  }

  if (minTimer) return

  minTimer = setTimeout(() => {
    loadingVisible.value = false
    clearTimers()
  }, remaining)
}

export function setLoading(val: boolean) {
  if (val) {
    beginLoading()
  } else {
    requestLoadingHide()
  }
}

export function useLoadingScreen() {
  return {
    isLoading: computed(() => loadingVisible.value),
    beginLoading,
    requestLoadingHide,
    setLoading,
  }
}
