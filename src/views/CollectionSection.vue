<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue'

const collectionSlides = [
  {
    src: new URL('../assets/images/collection/1.webp', import.meta.url).href,
    alt: 'Foto collection 1',
    className: 'is-right is-portrait',
  },
  {
    src: new URL('../assets/images/collection/3.webp', import.meta.url).href,
    alt: 'Foto collection 2',
    className: 'is-left is-landscape',
  },
  {
    src: new URL('../assets/images/collection/4.webp', import.meta.url).href,
    alt: 'Foto collection 3',
    className: 'is-center is-landscape',
  },
  {
    src: new URL('../assets/images/collection/5.webp', import.meta.url).href,
    alt: 'Foto collection 4',
    className: 'is-right is-landscape',
  },
  {
    src: new URL('../assets/images/collection/7.webp', import.meta.url).href,
    alt: 'Foto collection 5',
    className: 'is-left is-landscape',
  },
  {
    src: new URL('../assets/images/collection/8.webp', import.meta.url).href,
    alt: 'Foto collection 6',
    className: 'is-right is-portrait',
  },
  {
    src: new URL('../assets/images/collection/9.webp', import.meta.url).href,
    alt: 'Foto collection 7',
    className: 'is-center is-landscape',
  },
  {
    src: new URL('../assets/images/collection/10.webp', import.meta.url).href,
    alt: 'Foto collection 8',
    className: 'is-left is-landscape',
  },
  {
    src: new URL('../assets/images/collection/12.webp', import.meta.url).href,
    alt: 'Foto collection 9',
    className: 'is-right is-landscape',
  },
  {
    src: new URL('../assets/images/collection/13.webp', import.meta.url).href,
    alt: 'Foto collection 10',
    className: 'is-left is-portrait',
  },
  {
    src: new URL('../assets/images/collection/14.webp', import.meta.url).href,
    alt: 'Foto collection 11',
    className: 'is-center is-portrait',
  },
  {
    src: new URL('../assets/images/collection/15.webp', import.meta.url).href,
    alt: 'Foto collection 12',
    className: 'is-right is-landscape',
  },
  {
    src: new URL('../assets/images/collection/16.webp', import.meta.url).href,
    alt: 'Foto collection 13',
    className: 'is-left is-landscape',
  },
  {
    src: new URL('../assets/images/collection/17.webp', import.meta.url).href,
    alt: 'Foto collection 14',
    className: 'is-center is-portrait',
  },
  {
    src: new URL('../assets/images/collection/19.webp', import.meta.url).href,
    alt: 'Foto collection 15',
    className: 'is-right is-portrait',
  },
  {
    src: new URL('../assets/images/collection/20.webp', import.meta.url).href,
    alt: 'Foto collection 16',
    className: 'is-left is-portrait',
  },
] as const

const TOTAL_SECTIONS = collectionSlides.length + 1
const LINE_VIEWBOX_WIDTH = 1000
const LINE_VIEWBOX_HEIGHT = TOTAL_SECTIONS * 100
const BACK_TO_HOME_SECTION_INDEX = 3

type DesktopControlPoint = {
  x: number
  y: number
}

type DesktopControlSection = {
  sectionIndex: number
  points: DesktopControlPoint[]
}

type MarkerControlSection = {
  sectionIndex: number
  point: DesktopControlPoint
}

const desktopControlPointsDefaults: DesktopControlSection[] = [
  { sectionIndex: 1, points: [{ x: 30.35, y: 39.15 }, { x: 25.78, y: 48.07 }, { x: 24.88, y: 61.13 }, { x: 28.98, y: 72.71 }, { x: 37.87, y: 83.22 }, { x: 48.55, y: 91.59 }] },
  { sectionIndex: 2, points: [{ x: 64.02, y: 2.37 }, { x: 74.12, y: 9.33 }, { x: 81.38, y: 25.1 }, { x: 87.74, y: 38.88 }, { x: 88.21, y: 53.75 }, { x: 78.12, y: 63.41 }, { x: 72.86, y: 53.29 }, { x: 76.28, y: 46.33 }, { x: 81.27, y: 52.2 }, { x: 84.64, y: 66.13 }, { x: 83.06, y: 75.71 }, { x: 73.44, y: 89.74 }] },
  { sectionIndex: 3, points: [{ x: 47.45, y: 1 }, { x: 33.93, y: 4.43 }, { x: 20.78, y: 8.57 }, { x: 11.68, y: 17.17 }, { x: 7.89, y: 28.05 }, { x: 6.79, y: 41.97 }, { x: 8.15, y: 61.24 }, { x: 10.94, y: 73.86 }, { x: 16.31, y: 89.64 }] },
  { sectionIndex: 4, points: [{ x: 22.62, y: 1 }, { x: 28.56, y: 14.45 }, { x: 30.93, y: 31.09 }, { x: 29.62, y: 46.98 }, { x: 19.78, y: 55.79 }, { x: 14.2, y: 66.35 }, { x: 15.36, y: 82.56 }, { x: 27.09, y: 94.75 }] },
  { sectionIndex: 5, points: [{ x: 39.4, y: 1.28 }, { x: 59.39, y: 5.85 }, { x: 71.23, y: 12.6 }, { x: 80.38, y: 23.59 }, { x: 84.17, y: 38.49 }, { x: 85.17, y: 51.88 }, { x: 80.43, y: 65.26 }, { x: 78.54, y: 80.06 }, { x: 82.54, y: 91.7 }, { x: 89.64, y: 96.16 }, { x: 95, y: 89.63 }, { x: 93.52, y: 78.72 }, { x: 87.22, y: 76.94 }, { x: 80.27, y: 84.96 }, { x: 71.17, y: 92.79 }, { x: 57.92, y: 98.88 }] },
  { sectionIndex: 6, points: [{ x: 48.87, y: 6.28 }, { x: 35.51, y: 14.55 }, { x: 21.83, y: 22.28 }, { x: 11.05, y: 35.99 }, { x: 11.26, y: 51.55 }, { x: 18.94, y: 59.17 }, { x: 31.09, y: 50.46 }, { x: 42.87, y: 48.39 }, { x: 48.34, y: 59.39 }, { x: 48.87, y: 74.73 }, { x: 40.87, y: 87.79 }, { x: 28.72, y: 97.8 }] },
  { sectionIndex: 7, points: [{ x: 21.09, y: 8.79 }, { x: 14.17, y: 21.01 }, { x: 9.63, y: 29.6 }, { x: 6.39, y: 39.84 }, { x: 6.02, y: 53.21 }, { x: 8.52, y: 70.67 }, { x: 15.41, y: 87.57 }] },
  { sectionIndex: 8, points: [{ x: 38.56, y: 1 }, { x: 65.91, y: 7.15 }, { x: 81.48, y: 26.31 }, { x: 72.44, y: 47.96 }, { x: 74.7, y: 60.58 }, { x: 79.22, y: 73.86 }, { x: 82.48, y: 85.94 }, { x: 68.7, y: 99 }] },
  { sectionIndex: 9, points: [{ x: 51.18, y: 3.89 }, { x: 26.41, y: 8.68 }, { x: 13.47, y: 21.84 }, { x: 10.05, y: 40.78 }, { x: 12.15, y: 62.98 }, { x: 17.89, y: 85.39 }, { x: 27.93, y: 99 }] },
  { sectionIndex: 10, points: [{ x: 48.4, y: 8.03 }, { x: 65.75, y: 19.78 }, { x: 70.33, y: 33.92 }, { x: 57.65, y: 50.46 }, { x: 53.5, y: 68.2 }, { x: 55.18, y: 83.32 }, { x: 60.7, y: 92.14 }, { x: 67.49, y: 88.87 }, { x: 72.44, y: 77.67 }, { x: 78.12, y: 69.4 }, { x: 83.69, y: 67.44 }, { x: 88.22, y: 75.6 }, { x: 90.22, y: 86.04 }, { x: 91.22, y: 98.01 }] },
  { sectionIndex: 11, points: [{ x: 90.79, y: 9.66 }, { x: 89.79, y: 21.08 }, { x: 88.64, y: 31.2 }, { x: 86.53, y: 44.48 }, { x: 83.38, y: 62.65 }, { x: 80.48, y: 78.1 }, { x: 73.86, y: 90.61 }, { x: 59.65, y: 99 }] },
  { sectionIndex: 12, points: [{ x: 46.61, y: 4.87 }, { x: 34.25, y: 12.6 }, { x: 27.83, y: 20.21 }, { x: 25.62, y: 30.22 }, { x: 30.62, y: 42.08 }, { x: 31.25, y: 54.92 }, { x: 23.09, y: 67.22 }, { x: 16.78, y: 67.55 }, { x: 11.57, y: 62.65 }, { x: 11.15, y: 51.55 }, { x: 16.78, y: 49.59 }, { x: 20.88, y: 53.18 }, { x: 24.93, y: 58.95 }, { x: 27.83, y: 65.59 }, { x: 32.25, y: 77.67 }, { x: 38.56, y: 91.49 }, { x: 46.29, y: 99 }] },
  { sectionIndex: 13, points: [{ x: 56.18, y: 3.24 }, { x: 65.33, y: 9.87 }, { x: 71.59, y: 19.56 }, { x: 77.49, y: 27.94 }, { x: 84.32, y: 39.69 }, { x: 88.43, y: 53.51 }, { x: 88.27, y: 66.89 }, { x: 79.91, y: 78.86 }, { x: 68.96, y: 84.3 }, { x: 63.86, y: 95.73 }] },
  { sectionIndex: 14, points: [{ x: 66.33, y: 6.28 }, { x: 73.17, y: 11.94 }, { x: 80.69, y: 19.12 }, { x: 85.95, y: 27.72 }, { x: 89.79, y: 39.04 }, { x: 91, y: 51.77 }, { x: 87.69, y: 66.35 }, { x: 83.8, y: 76.8 }, { x: 78.7, y: 84.85 }, { x: 70.49, y: 93.55 }, { x: 59.34, y: 98.88 }, { x: 50.55, y: 98.01 }, { x: 42.61, y: 93.55 }, { x: 38.61, y: 89.85 }, { x: 30.3, y: 85.28 }, { x: 23.15, y: 85.94 }, { x: 17.15, y: 89.85 }, { x: 14.52, y: 99 }] },
  { sectionIndex: 15, points: [{ x: 17.15, y: 7.92 }, { x: 25.88, y: 19.12 }, { x: 32.51, y: 27.61 }, { x: 35.93, y: 40.02 }, { x: 32.67, y: 59.39 }, { x: 26.56, y: 71.14 }, { x: 19.94, y: 80.5 }, { x: 13.78, y: 88.33 }, { x: 9.1, y: 86.48 }, { x: 8.68, y: 76.03 }, { x: 11.73, y: 67.87 }, { x: 16.89, y: 66.57 }, { x: 22.04, y: 71.68 }, { x: 26.72, y: 79.73 }, { x: 32.46, y: 87.02 }, { x: 38.98, y: 91.7 }, { x: 44.87, y: 94.97 }] },
  { sectionIndex: 16, points: [{ x: 51.03, y: 3.78 }, { x: 57.65, y: 15.75 }, { x: 62.49, y: 27.39 }, { x: 69.28, y: 42.3 }, { x: 73.01, y: 61.45 }, { x: 67.7, y: 79.3 }, { x: 55.19, y: 94.27 }] },
  { sectionIndex: 17, points: [{ x: 40.59, y: 2.59 }, { x: 33.56, y: 8.24 }, { x: 34.77, y: 18.69 }, { x: 45.08, y: 24.35 }, { x: 52.5, y: 33.27 }, { x: 49.98, y: 45.39 }] },
]

const mobileControlPointsDefaults: DesktopControlSection[] = [
  { sectionIndex: 1, points: [{ x: 40.82, y: 95.05 }, { x: 12.78, y: 98.13 }] },
  { sectionIndex: 2, points: [{ x: 14.23, y: 17.67 }, { x: 93.4, y: 45.79 }, { x: 76.91, y: 73.28 }, { x: 53.61, y: 88.76 }, { x: 26.19, y: 92.24 }, { x: 22.06, y: 80.23 }, { x: 37.94, y: 76.44 }, { x: 69.69, y: 93.98 }] },
  { sectionIndex: 3, points: [{ x: 72.16, y: 9.93 }, { x: 26.6, y: 21.15 }, { x: 4.74, y: 48.01 }, { x: 60, y: 76.92 }, { x: 15.88, y: 99 }] },
  { sectionIndex: 4, points: [{ x: 6.19, y: 44.06 }, { x: 22.89, y: 76.76 }, { x: 9.28, y: 99 }] },
  { sectionIndex: 5, points: [{ x: 23.71, y: 18.94 }, { x: 67.22, y: 22.57 }, { x: 73.61, y: 1 }, { x: 36.49, y: 1.88 }, { x: 27.22, y: 87.5 }, { x: 88.87, y: 99 }] },
  { sectionIndex: 6, points: [{ x: 90.1, y: 79.63 }] },
  { sectionIndex: 7, points: [{ x: 19.18, y: 8.49 }, { x: 5.57, y: 54.62 }, { x: 42.06, y: 81.79 }, { x: 85.36, y: 78.63 }, { x: 95.46, y: 24.61 }, { x: 40, y: 17.5 }] },
  { sectionIndex: 8, points: [{ x: 12.99, y: 16.39 }, { x: 21.86, y: 97.43 }, { x: 71.75, y: 80.85 }] },
  { sectionIndex: 9, points: [{ x: 73.4, y: 26.34 }] },
  { sectionIndex: 10, points: [{ x: 10.72, y: 1.04 }] },
  { sectionIndex: 11, points: [{ x: 10.1, y: 5.03 }] },
  { sectionIndex: 12, points: [{ x: 91.96, y: 1 }, { x: 70.72, y: 22.99 }, { x: 7.63, y: 1 }, { x: 11.13, y: 82.23 }] },
  { sectionIndex: 13, points: [{ x: 87.42, y: 1 }, { x: 88.25, y: 14.61 }, { x: 15.26, y: 1 }, { x: 17.73, y: 19.83 }, { x: 93.61, y: 24.72 }, { x: 37.94, y: 83.97 }] },
  { sectionIndex: 14, points: [{ x: 94.64, y: 31.81 }] },
  { sectionIndex: 15, points: [{ x: 89.28, y: 69.69 }] },
  { sectionIndex: 16, points: [{ x: 12.99, y: 1.12 }, { x: 2.89, y: 54.29 }, { x: 13.61, y: 99 }, { x: 84.12, y: 99 }, { x: 96.29, y: 33.94 }, { x: 78.56, y: 1 }, { x: 17.53, y: 16.84 }] },
  { sectionIndex: 17, points: [{ x: 32.16, y: 10.49 }, { x: 40.62, y: 35.61 }] },
]

const desktopMarkerPointsDefaults: MarkerControlSection[] = [
  { sectionIndex: 1, point: { x: 30.35, y: 39.15 } },
  { sectionIndex: 2, point: { x: 72.86, y: 53.29 } },
  { sectionIndex: 3, point: { x: 6.79, y: 41.97 } },
  { sectionIndex: 4, point: { x: 19.78, y: 55.79 } },
  { sectionIndex: 5, point: { x: 87.22, y: 76.94 } },
  { sectionIndex: 6, point: { x: 11.67, y: 51.96 } },
  { sectionIndex: 7, point: { x: 6.39, y: 39.84 } },
  { sectionIndex: 8, point: { x: 74.7, y: 60.58 } },
  { sectionIndex: 9, point: { x: 10.05, y: 40.78 } },
  { sectionIndex: 10, point: { x: 70.33, y: 33.92 } },
  { sectionIndex: 11, point: { x: 86.99, y: 41.58 } },
  { sectionIndex: 12, point: { x: 11.57, y: 62.65 } },
  { sectionIndex: 13, point: { x: 88.43, y: 53.51 } },
  { sectionIndex: 14, point: { x: 50.55, y: 98.01 } },
  { sectionIndex: 15, point: { x: 35.93, y: 40.02 } },
  { sectionIndex: 16, point: { x: 69.28, y: 42.3 } },
  { sectionIndex: 17, point: { x: 49.98, y: 45.39 } },
]

const mobileMarkerPointsDefaults: MarkerControlSection[] = [
  { sectionIndex: 1, point: { x: 40.82, y: 95.05 } },
  { sectionIndex: 2, point: { x: 26.19, y: 92.24 } },
  { sectionIndex: 3, point: { x: 60, y: 76.92 } },
  { sectionIndex: 4, point: { x: 9.28, y: 99 } },
  { sectionIndex: 5, point: { x: 27.22, y: 87.5 } },
  { sectionIndex: 6, point: { x: 40, y: 100 } },
  { sectionIndex: 7, point: { x: 85.36, y: 78.63 } },
  { sectionIndex: 8, point: { x: 21.86, y: 97.43 } },
  { sectionIndex: 9, point: { x: 73.4, y: 26.34 } },
  { sectionIndex: 10, point: { x: 10.72, y: 1.04 } },
  { sectionIndex: 11, point: { x: 10.1, y: 5.03 } },
  { sectionIndex: 12, point: { x: 7.63, y: 1 } },
  { sectionIndex: 13, point: { x: 17.73, y: 19.83 } },
  { sectionIndex: 14, point: { x: 56.72, y: 0 } },
  { sectionIndex: 15, point: { x: 13.98, y: 100 } },
  { sectionIndex: 16, point: { x: 84.12, y: 99 } },
  { sectionIndex: 17, point: { x: 40.62, y: 35.61 } },
]

const collectionSectionRef = ref<HTMLElement | null>(null)
const slideRefs = ref<HTMLElement[]>([])
const isMobileViewport = ref(false)
const layoutVersion = ref(0)
const scrollProgress = ref(0)
const targetScrollProgress = ref(0)
const sectionScrollMetrics = ref({ top: 0, travel: 1 })
let mediaQuery: MediaQueryList | null = null
let resizeObserver: ResizeObserver | null = null
let progressAnimationFrame: number | null = null
let layoutRefreshAnimationFrame: number | null = null
let scrollTicking = false

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const refreshLineLayout = () => {
  layoutVersion.value += 1

  const sectionEl = collectionSectionRef.value
  if (sectionEl) {
    const sectionTop = sectionEl.offsetTop
    const sectionHeight = sectionEl.offsetHeight
    const viewportHeight = window.innerHeight
    sectionScrollMetrics.value = {
      top: sectionTop,
      travel: Math.max(sectionHeight - viewportHeight, 1),
    }
  }

  updateScrollProgress()
}

const scheduleLayoutRefresh = () => {
  if (layoutRefreshAnimationFrame !== null) return

  layoutRefreshAnimationFrame = window.requestAnimationFrame(() => {
    layoutRefreshAnimationFrame = null
    refreshLineLayout()
  })
}

const animateScrollProgress = () => {
  const delta = targetScrollProgress.value - scrollProgress.value
  if (Math.abs(delta) < 0.001) {
    scrollProgress.value = targetScrollProgress.value
    progressAnimationFrame = null
    return
  }

  scrollProgress.value += delta * 0.4
  progressAnimationFrame = window.requestAnimationFrame(animateScrollProgress)
}

const ensureProgressAnimation = () => {
  if (progressAnimationFrame !== null) return
  progressAnimationFrame = window.requestAnimationFrame(animateScrollProgress)
}

const updateScrollProgress = () => {
  if (!collectionSectionRef.value) {
    targetScrollProgress.value = 0
    scrollProgress.value = 0
    return
  }

  const raw = (window.scrollY - sectionScrollMetrics.value.top) / sectionScrollMetrics.value.travel
  targetScrollProgress.value = clamp(raw, 0, 1)
  ensureProgressAnimation()
}

const onWindowScroll = () => {
  if (scrollTicking) return
  scrollTicking = true
  window.requestAnimationFrame(() => {
    updateScrollProgress()
    scrollTicking = false
  })
}

const showBackToHomeButton = computed(
  () => targetScrollProgress.value >= (BACK_TO_HOME_SECTION_INDEX - 1) / (TOTAL_SECTIONS - 1),
)

const scrollToHomeSection = () => {
  const homeSection = document.querySelector('.home')

  if (homeSection instanceof HTMLElement) {
    homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const activeControlPoints = computed(() =>
  isMobileViewport.value ? mobileControlPointsDefaults : desktopControlPointsDefaults,
)

const activeControlSections = computed(() =>
  [...activeControlPoints.value].sort((a, b) => a.sectionIndex - b.sectionIndex),
)

const activeMarkerSections = computed(() =>
  [...(isMobileViewport.value ? mobileMarkerPointsDefaults : desktopMarkerPointsDefaults)].sort(
    (a, b) => a.sectionIndex - b.sectionIndex,
  ),
)

const setSlideRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (!(el instanceof HTMLElement)) return

  if (slideRefs.value[index] === el) return

  const previousEl = slideRefs.value[index]
  if (resizeObserver && previousEl) {
    resizeObserver.unobserve(previousEl)
  }

  slideRefs.value[index] = el
  if (resizeObserver) {
    resizeObserver.observe(el)
  }
  scheduleLayoutRefresh()
}

const lineViewBox = computed(() => {
  layoutVersion.value

  const sectionEl = collectionSectionRef.value
  if (!sectionEl) {
    return {
      width: LINE_VIEWBOX_WIDTH,
      height: LINE_VIEWBOX_HEIGHT,
    }
  }

  const sectionRect = sectionEl.getBoundingClientRect()
  return {
    width: Math.max(1, sectionRect.width),
    height: Math.max(1, sectionRect.height),
  }
})

const pathPoints = computed(() => {
  layoutVersion.value

  const sectionEl = collectionSectionRef.value
  const sections = activeControlSections.value
  if (!sectionEl) {
    return sections.flatMap((section) =>
      section.points.map((point) => ({
        x: (point.x / 100) * lineViewBox.value.width,
        y: (section.sectionIndex - 1 + point.y / 100) * (lineViewBox.value.height / TOTAL_SECTIONS),
      })),
    )
  }

  const sectionRect = sectionEl.getBoundingClientRect()

  return sections.flatMap((section) => {
    const slideEl = slideRefs.value[section.sectionIndex - 1]
    if (!slideEl) return []

    const slideRect = slideEl.getBoundingClientRect()
    const offsetX = slideRect.left - sectionRect.left
    const offsetY = slideRect.top - sectionRect.top

    return section.points.map((point) => ({
      x: offsetX + (point.x / 100) * slideRect.width,
      y: offsetY + (point.y / 100) * slideRect.height,
    }))
  })
})

const markerCoordinates = computed(() => {
  layoutVersion.value

  const markerSections = activeMarkerSections.value
  const sectionEl = collectionSectionRef.value

  if (!sectionEl) {
    return markerSections.map((section) => {
      const markerPoint = section.point
      return {
        sectionIndex: section.sectionIndex,
        x: (markerPoint.x / 100) * lineViewBox.value.width,
        y: (section.sectionIndex - 1 + markerPoint.y / 100) * (lineViewBox.value.height / TOTAL_SECTIONS),
      }
    })
  }

  const sectionRect = sectionEl.getBoundingClientRect()

  return markerSections.flatMap((section) => {
    const slideEl = slideRefs.value[section.sectionIndex - 1]
    if (!slideEl) return []

    const markerPoint = section.point
    const slideRect = slideEl.getBoundingClientRect()
    const offsetX = slideRect.left - sectionRect.left
    const offsetY = slideRect.top - sectionRect.top

    return {
      sectionIndex: section.sectionIndex,
      x: offsetX + (markerPoint.x / 100) * slideRect.width,
      y: offsetY + (markerPoint.y / 100) * slideRect.height,
    }
  })
})

const markerPoints = computed(() => {
  const path = pathPoints.value

  if (path.length < 2) {
    return markerCoordinates.value.map((marker) => ({
      ...marker,
      isActive: false,
    }))
  }

  const cumulativeLengths: number[] = [0]
  for (let index = 1; index < path.length; index += 1) {
    const previous = path[index - 1]
    const current = path[index]
    const segmentLength = Math.hypot(current.x - previous.x, current.y - previous.y)
    cumulativeLengths[index] = cumulativeLengths[index - 1] + segmentLength
  }

  const totalPathLength = cumulativeLengths[cumulativeLengths.length - 1] || 1

  return markerCoordinates.value.map((marker) => ({
    ...marker,
    isActive:
      scrollProgress.value >=
      (() => {
        let closestIndex = 0
        let closestDistance = Number.POSITIVE_INFINITY

        for (let index = 0; index < path.length; index += 1) {
          const point = path[index]
          const distance = (point.x - marker.x) ** 2 + (point.y - marker.y) ** 2
          if (distance < closestDistance) {
            closestDistance = distance
            closestIndex = index
          }
        }

        return cumulativeLengths[closestIndex] / totalPathLength
      })(),
  }))
})

const buildSmoothPath = (points: Array<{ x: number; y: number }>) => {
  if (points.length < 2) return ''

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = points[Math.min(points.length - 1, index + 2)]

    const cp1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    }
    const cp2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    }

    path += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)}, ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }

  return path
}

const dashedLinePath = computed(() => buildSmoothPath(pathPoints.value))

const lineStart = computed(() => pathPoints.value[0] ?? { x: 120, y: 120 })
const lineEnd = computed(() =>
  pathPoints.value[pathPoints.value.length - 1] ?? {
    x: 880,
    y: lineViewBox.value.height - 120,
  },
)

const toPercent = (value: number, max: number) => `${(value / max) * 100}%`

const labelOffsets = {
  desktop: {
    start: { x: 100, y: -50 },
    end: { x: 0, y: 70 },
  },
  mobile: {
    start: { x: 80, y: 40 },
    end: { x: 40, y: 70 },
  },
} as const

const startLabelStyle = computed(() => ({
  left: toPercent(
    lineStart.value.x + (isMobileViewport.value ? labelOffsets.mobile.start.x : labelOffsets.desktop.start.x),
    lineViewBox.value.width,
  ),
  top: toPercent(
    Math.max(24, lineStart.value.y + (isMobileViewport.value ? labelOffsets.mobile.start.y : labelOffsets.desktop.start.y)),
    lineViewBox.value.height,
  ),
}))

const endLabelStyle = computed(() => ({
  left: toPercent(
    lineEnd.value.x + (isMobileViewport.value ? labelOffsets.mobile.end.x : labelOffsets.desktop.end.x),
    lineViewBox.value.width,
  ),
  top: toPercent(
    Math.min(lineViewBox.value.height - 24, lineEnd.value.y + (isMobileViewport.value ? labelOffsets.mobile.end.y : labelOffsets.desktop.end.y)),
    lineViewBox.value.height,
  ),
}))

const updateViewportMode = () => {
  isMobileViewport.value = window.matchMedia('(max-width: 960px)').matches
  refreshLineLayout()
}

onMounted(() => {
  updateViewportMode()
  refreshLineLayout()
  updateScrollProgress()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      refreshLineLayout()
    })

    if (collectionSectionRef.value) {
      resizeObserver.observe(collectionSectionRef.value)
    }
    for (const slideEl of slideRefs.value) {
      if (slideEl) {
        resizeObserver.observe(slideEl)
      }
    }
  }

  mediaQuery = window.matchMedia('(max-width: 960px)')
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', updateViewportMode)
  } else {
    mediaQuery.addListener(updateViewportMode)
  }

  window.addEventListener('resize', refreshLineLayout)
  window.addEventListener('scroll', onWindowScroll, { passive: true })

  nextTick(() => {
    refreshLineLayout()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshLineLayout)
  window.removeEventListener('scroll', onWindowScroll)

  if (layoutRefreshAnimationFrame !== null) {
    window.cancelAnimationFrame(layoutRefreshAnimationFrame)
    layoutRefreshAnimationFrame = null
  }

  if (progressAnimationFrame !== null) {
    window.cancelAnimationFrame(progressAnimationFrame)
    progressAnimationFrame = null
  }

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (mediaQuery) {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', updateViewportMode)
    } else {
      mediaQuery.removeListener(updateViewportMode)
    }
  }
})
</script>

<template>
  <section id="collection" ref="collectionSectionRef" class="collection-section">
    <div class="our-story-title">OUR STORY</div>
    
    <div class="collection-line-layer" aria-hidden="true">
      <svg
        class="collection-line-svg"
        :viewBox="`0 0 ${lineViewBox.width} ${lineViewBox.height}`"
        preserveAspectRatio="none"
      >
        <path
          :d="dashedLinePath"
          class="collection-line-path"
          fill="none"
          stroke-width="5.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="20 18"
          vector-effect="non-scaling-stroke"
        />
        <path
          :d="dashedLinePath"
          class="collection-line-progress"
          fill="none"
          stroke="#c35f2f"
          stroke-width="5.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
          pathLength="1"
          :stroke-dasharray="`${scrollProgress} 1`"
        />

        <circle
          v-for="marker in markerPoints"
          :key="`collection-marker-${marker.sectionIndex}`"
          :cx="marker.x"
          :cy="marker.y"
          r="12"
          :class="['collection-line-marker', { 'is-active': marker.isActive }]"
          vector-effect="non-scaling-stroke"
        />
      </svg>

      <div class="collection-line-label-overlay collection-line-label-start" :style="startLabelStyle">
        2016
      </div>
      <div class="collection-line-label-overlay collection-line-label-end" :style="endLabelStyle">
        24 Ottobre 2026
      </div>
    </div>

    <article
      v-for="(slide, index) in collectionSlides"
      :key="slide.alt"
      :class="['collection-slide', slide.className]"
      :ref="(el) => setSlideRef(el, index)"
    >
      <img
        :src="slide.src"
        :alt="slide.alt"
        class="collection-image"
        :loading="index < 2 ? 'eager' : 'lazy'"
        :fetchpriority="index === 0 ? 'high' : 'low'"
        decoding="async"
      />
    </article>

    <article
      class="collection-slide collection-slide-empty"
      aria-hidden="true"
      :ref="(el) => setSlideRef(el, collectionSlides.length)"
    >
    </article>

    <Transition name="back-home">
      <button
        v-if="showBackToHomeButton"
        type="button"
        class="collection-back-home"
        aria-label="Torna alla Home"
        @click="scrollToHomeSection"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 19V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M6 11L12 5L18 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </Transition>
  </section>
</template>

<style scoped>
.our-story-title {
  font-family: 'Amatic SC', cursive;
  font-size: 5rem;
  text-align: center;
  color: #7a5240;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
}

.collection-section {
  --section-bg-top: #ffecd3;
  --section-bg-mid: #ffecd3;
  --section-bg-bottom: #ffecd3;
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    var(--section-bg-top) 0%,
    var(--section-bg-mid) 45%,
    var(--section-bg-bottom) 100%
  );
  scroll-behavior: smooth;
}

.collection-line-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.collection-line-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.collection-line-path {
  fill: none;
  stroke: #c18468;
  stroke-width: 5.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20 18;
}

.collection-line-progress {
  fill: none;
  stroke: #7a5240;
  stroke-width: 7.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  will-change: stroke-dasharray;
}

.collection-line-marker {
  fill: #c18468;
  stroke: #ffecd3;
  stroke-width: 3;
  transition: fill 180ms ease;
}

.collection-line-marker.is-active {
  fill: #7a5240;
}

.collection-line-label-overlay {
  position: absolute;
  transform: translate(-50%, -50%);
  color: #7a5240;
  font-weight: 700;
  letter-spacing: 0.015em;
  line-height: 1;
}

/* Font Amatic SC per le date */
.collection-line-label-start,
.collection-line-label-end {
  font-family: 'Amatic SC', cursive;
  font-size: 80px;
}

.collection-section::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.2;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4), transparent 38%),
    radial-gradient(circle at 75% 65%, rgba(255, 255, 255, 0.3), transparent 42%),
    repeating-linear-gradient(
      -45deg,
      rgba(133, 77, 53, 0.04) 0 2px,
      rgba(133, 77, 53, 0) 2px 14px
    );
}

.collection-slide {
  min-height: 100svh;
  width: 100%;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding-top: clamp(2rem, 6.5vh, 5rem);
  padding-bottom: clamp(2rem, 6.5vh, 5rem);
  padding-left: clamp(1.1rem, 8vw, 8rem);
  padding-right: clamp(1.1rem, 8vw, 8rem);
  contain: layout style paint;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.collection-slide.is-left {
  justify-content: flex-start;
}

.collection-slide.is-center {
  justify-content: center;
}

.collection-slide.is-right {
  justify-content: flex-end;
}

.collection-slide.is-left.is-portrait .collection-image {
  margin-left: clamp(1.25rem, 6vw, 6rem);
}

.collection-slide.is-right.is-portrait .collection-image {
  margin-right: clamp(1.25rem, 6vw, 6rem);
}

.collection-image {
  width: auto;
  height: auto;
  max-width: min(100%, 88vw);
  max-height: 84svh;
  display: block;
  object-fit: unset;
  box-shadow: 0 20px 20px -14px rgba(15, 23, 42, 0.5);
  overflow: hidden;
  border-radius: 22px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.collection-slide-empty {
  justify-content: center;
}

.collection-back-home {
  position: fixed;
  right: 1.35rem;
  bottom: 1.35rem;
  z-index: 70;
  cursor: pointer;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.26);
  color: #4d2c20;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 22px rgba(28, 16, 12, 0.2);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.collection-back-home:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.35);
}

.collection-back-home svg {
  width: 23px;
  height: 23px;
}

.back-home-enter-active,
.back-home-leave-active {
  transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
}

.back-home-enter-from,
.back-home-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

@media screen and (max-width: 960px) {
  .collection-slide {
    min-height: 80svh;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    justify-content: center;
  }

  .collection-slide.is-left,
  .collection-slide.is-right,
  .collection-slide.is-center {
    justify-content: center;
  }

  .collection-image {
    width: auto;
    height: auto;
    max-height: 68svh;
    max-width: 94vw;
    margin-left: 0;
    margin-right: 0;
  }

  .collection-line-label-start {
    font-size: 70px;
  }

  .collection-line-label-end {
    font-size: 60px;
    white-space: nowrap;
  }

}
</style>
