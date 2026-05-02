import { ref, computed } from 'vue'

const navbarVisible = ref(false)

// Flag per tracciare se siamo tornati alla home da ricevimento nella stessa sessione
const SESSION_FLAG = 'navbarVisibleInHome'

// Inizalizza lo stato al caricamento della pagina
export function initializeNavbarVisibility() {
  const sessionFlag = sessionStorage.getItem(SESSION_FLAG)
  navbarVisible.value = sessionFlag === 'true'
}

export function setNavbarVisible(visible: boolean) {
  navbarVisible.value = visible
}

export function hideNavbar() {
  navbarVisible.value = false
  sessionStorage.removeItem(SESSION_FLAG)
}

export function showNavbar() {
  navbarVisible.value = true
}

export function keepNavbarVisibleInHome() {
  navbarVisible.value = true
  sessionStorage.setItem(SESSION_FLAG, 'true')
}

export function hasNavbarVisibilityMemoryInHome() {
  return sessionStorage.getItem(SESSION_FLAG) === 'true'
}

export function useNavbarVisibility() {
  return {
    isVisible: computed(() => navbarVisible.value),
    setVisible: setNavbarVisible,
    hide: hideNavbar,
    show: showNavbar,
    keepVisibleInHome: keepNavbarVisibleInHome,
  }
}
