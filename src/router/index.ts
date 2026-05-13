import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordNormalized } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import {
  showNavbar,
  hideNavbar,
  keepNavbarVisibleInHome,
  hasNavbarVisibilityMemoryInHome,
} from '@/stores/navbarVisibility'
import { beginLoading, requestLoadingHide } from '@/stores/loadingScreen'
import { waitForImages, waitForVideos } from '@/lib/waitForMedia'
import { cachePageAssets } from '@/lib/pageAssetCache'

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
const firstLoadOnlyRouteNames = new Set(['Home', 'Ricevimento'])
const loadedHeavyRoutes = new Set<string>()
let pendingLoadingRouteKey: string | null = null

function getRouteKey(to: RouteLocationNormalizedLoaded) {
  return String(to.name ?? to.path)
}

function preloadRouteComponents(to: RouteLocationNormalizedLoaded) {
  to.matched.forEach((record: RouteRecordNormalized) => {
    Object.values(record.components || {}).forEach((component) => {
      if (typeof component === 'function') {
        void (component as () => unknown)()
      }
    })
  })
}

router.beforeEach(async (to, from, next) => {
  // Pre-carichiamo subito i chunk della pagina di destinazione.
  preloadRouteComponents(to)

  const routeKey = getRouteKey(to)
  const mustShowLoading =
    firstLoadOnlyRouteNames.has(routeKey) && !loadedHeavyRoutes.has(routeKey)

  if (mustShowLoading) {
    beginLoading()
    pendingLoadingRouteKey = routeKey
  } else {
    pendingLoadingRouteKey = null
    requestLoadingHide()
  }

  const isFirstNavigation = from.matched.length === 0

  // Primo accesso diretto a /ricevimento: apri Home ma con navbar attiva in sessione.
  // Tuttavia, se l'URL contiene un hash (ancora) vogliamo permettere la navigazione
  // diretta verso /ricevimento in modo che il browser possa fare lo scroll alla sezione.
  if (isFirstNavigation && to.name === 'Ricevimento') {
    if (to.hash) {
      // Lascia proseguire la navigazione verso /ricevimento (niente redirect)
    } else {
      showNavbarOnNextHome = true
      return next({ name: 'Home', replace: true })
    }
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

router.afterEach((to) => {
  const routeKey = getRouteKey(to)

  if (pendingLoadingRouteKey !== routeKey) {
    requestLoadingHide()
    return
  }

  // Piccolo ritardo per permettere il mount del componente, poi
  // se nella pagina ci sono video aspettiamo che siano caricati (o timeout) prima di nascondere lo splash
  setTimeout(async () => {
    const main = document.querySelector('main')
    if (!main) {
      if (firstLoadOnlyRouteNames.has(routeKey)) {
        loadedHeavyRoutes.add(routeKey)
      }
      requestLoadingHide()
      return
    }

    const videos = Array.from(main.querySelectorAll('video')) as HTMLVideoElement[]
    const images = Array.from(main.querySelectorAll('img')) as HTMLImageElement[]

    try {
      await Promise.all([
        // aspetta fino a 12s per tutti i video
        waitForVideos(videos, 12000),
        // aspetta fino a 12s per tutte le immagini
        waitForImages(images, 12000),
        // include anche background-image CSS e source media
        cachePageAssets(main),
      ])

      if (firstLoadOnlyRouteNames.has(routeKey)) {
        loadedHeavyRoutes.add(routeKey)
      }
    } catch (e) {
      // ignore
    } finally {
      requestLoadingHide()
      if (pendingLoadingRouteKey === routeKey) {
        pendingLoadingRouteKey = null
      }
    }
  }, 50)
})

export default router
