import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import {
  showNavbar,
  hideNavbar,
  keepNavbarVisibleInHome,
  hasNavbarVisibilityMemoryInHome,
} from '@/stores/navbarVisibility'

const routes = [
  { path: '/', name: 'Home', component: HomePage, alias: '/home' },
  { path: '/ricevimento', name: 'Ricevimento', component: () => import('@/views/RicevimentoPage.vue') },
  { path: '/rsvp', name: 'Rsvp', component: () => import('@/views/RSVP.vue') },
  { path: '/amazon', name: 'Amazon', component: () => import('@/views/Amazon.vue') },
  { path: '/amazon/viaggio-di-nozze', name: 'ViaggioDiNozze', component: () => import('@/views/ViaggioDiNozze.vue') },

  // area-riservata
  { path: '/area-riservata', component: () => import('@/views/area-riservata/Dashboard.vue') },
  { path: '/area-riservata/amazon', component: () => import('@/views/area-riservata/AmazonManager.vue') },
  { path: '/area-riservata/login', component: () => import('@/views/area-riservata/Login.vue') },

  // page not found
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'auto' }
    }
    return { top: 0 }
  }
})

let showNavbarOnNextHome = false

router.beforeEach(async (to, from, next) => {
  const isFirstNavigation = from.matched.length === 0

  // Primo accesso diretto a /ricevimento: apri Home ma con navbar attiva in sessione.
  if (isFirstNavigation && to.name === 'Ricevimento') {
    showNavbarOnNextHome = true
    return next({ name: 'Home', replace: true })
  }

  // Gestisci la visibilità della navbar
  if (to.name === 'Ricevimento') {
    showNavbar()
  } else if (to.name === 'Amazon' || to.name === 'ViaggioDiNozze') {
    // In Amazon e nella pagina viaggio di nozze la navbar rosa deve restare nascosta.
    hideNavbar()
  } else if (to.name === 'Home') {
    // In Home la navbar e' visibile solo se arrivi da Ricevimento
    // o dal redirect iniziale del link diretto /ricevimento.
    if (from.name === 'Ricevimento' || showNavbarOnNextHome || hasNavbarVisibilityMemoryInHome()) {
      keepNavbarVisibleInHome()
      showNavbarOnNextHome = false
    } else {
      // Accesso diretto a / o /home: navbar nascosta
      hideNavbar()
    }
  }

  const isProtected = to.path.startsWith('/area-riservata') && to.path !== '/area-riservata/login'
  if (isProtected) {
    const { checkAuth } = await import('@/lib/authGuard')
    const loggedIn = await checkAuth()
    if (!loggedIn) return next('/area-riservata/login')
  }
  next()
})

export default router
