<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import amazonLogo from '@/assets/images/Amazon-Logo-White-Transparent.webp'
import { keepNavbarVisibleInHome } from '@/stores/navbarVisibility'

const props = defineProps({
  searchQuery: { type: String, required: true },
  showSoldProducts: { type: Boolean, required: true },
  showAvailableProducts: { type: Boolean, required: true },
})

const emit = defineEmits(['update:searchQuery', 'update:showSoldProducts', 'update:showAvailableProducts'])

const showNavMenu = ref(false)
const showFilterMenu = ref(false)

const searchText = computed({
  get: () => props.searchQuery,
  set: (value: string) => emit('update:searchQuery', value),
})

const soldProducts = computed({
  get: () => props.showSoldProducts,
  set: (value: boolean) => emit('update:showSoldProducts', value),
})

const availableProducts = computed({
  get: () => props.showAvailableProducts,
  set: (value: boolean) => emit('update:showAvailableProducts', value),
})

const router = useRouter()

const resetSearch = () => {
  emit('update:searchQuery', '')
}

const handleClickOutsideNavMenu = (event: MouseEvent) => {
  if (!showNavMenu.value) return
  const target = event.target
  if (target instanceof Element && target.closest('.amazon-nav-menu-container')) return
  showNavMenu.value = false
}

const handleClickOutsideFilterMenu = (event: MouseEvent) => {
  if (!showFilterMenu.value) return
  const target = event.target
  if (target instanceof Element && target.closest('.amazon-filter-menu-container')) return
  showFilterMenu.value = false
}

const toggleNavMenu = () => {
  showNavMenu.value = !showNavMenu.value
}

const toggleFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value
}

const navigateFromAmazonMenu = (target: 'Home' | 'Ricevimento' | 'Rsvp' | 'Viaggio') => {
  showNavMenu.value = false
  if (target === 'Home') keepNavbarVisibleInHome()
  if (target === 'Rsvp') {
    router.push({ name: 'Ricevimento', hash: '#rsvp-section' })
    return
  }
  if (target === 'Viaggio') {
    router.push({ name: 'ViaggioDiNozze' })
    return
  }
  router.push({ name: target })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideNavMenu)
  document.addEventListener('click', handleClickOutsideFilterMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideNavMenu)
  document.removeEventListener('click', handleClickOutsideFilterMenu)
})
</script>

<template>
  <header class="amazon-topbar px-4 py-3">
    <div class="max-w-7xl mx-auto">
      <div class="hidden items-center gap-6 md:grid md:grid-cols-[auto_1fr_auto_auto]">
        <RouterLink to="/amazon" class="flex min-w-0 items-center gap-3" aria-label="Vai alla pagina Amazon" @click="resetSearch">
          <img :src="amazonLogo" alt="Amazon" class="h-10 object-contain" />
        </RouterLink>
        <div class="mx-auto w-full max-w-4xl">
          <label for="amazon-search-desktop" class="sr-only">Cerca prodotto</label>
          <div class="flex h-12 overflow-hidden rounded-lg border border-[#1f2f46] bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#ff9900]/40">
            <input
              id="amazon-search-desktop"
              v-model="searchText"
              type="text"
              placeholder="Cerca un prodotto nella lista nozze!"
              class="w-full px-4 text-[15px] text-slate-800 placeholder:text-slate-500 focus:outline-none"
            />
            <button type="button" class="inline-flex w-14 items-center justify-center bg-[#f2941b] text-slate-800 hover:bg-[#f0c14b]" aria-label="Cerca">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="h-5 w-5">
                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 text-slate-200" aria-hidden="true">
          <span class="inline-flex h-4 w-6 overflow-hidden rounded-sm border border-slate-500/60">
            <span class="h-full w-1/3 bg-[#009246]"></span>
            <span class="h-full w-1/3 bg-[#f1f2f1]"></span>
            <span class="h-full w-1/3 bg-[#ce2b37]"></span>
          </span>
          <span class="text-sm font-semibold leading-none">IT</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" class="h-3 w-3 text-slate-300">
            <path d="M137.4 374.6L9.4 246.6C-3.1 234.1-3.1 213.8 9.4 201.3s32.8-12.5 45.3 0L160 306.7 265.4 201.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-128 128c-12.5 12.4-32.8 12.4-45.3-.1z"/>
          </svg>
        </div>

        <div class="amazon-nav-menu-container relative mr-4">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-transparent text-slate-200 transition hover:text-[#ff9900]"
            @click="toggleNavMenu"
            aria-label="Apri menu navigazione"
            title="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="h-5 w-5">
              <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
            </svg>
          </button>

          <div v-if="showNavMenu" class="absolute right-0 top-11 z-50 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
            <button type="button" class="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" @click="navigateFromAmazonMenu('Viaggio')">Viaggio di nozze</button>
            <button type="button" class="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" @click="navigateFromAmazonMenu('Home')">Esci da Amazon</button>
          </div>
        </div>
      </div>

      <div class="md:hidden">
        <div class="flex items-center justify-between gap-3">
          <RouterLink to="/amazon" class="flex min-w-0 items-center gap-3" aria-label="Vai alla pagina Amazon" @click="resetSearch">
            <img :src="amazonLogo" alt="Amazon" class="h-7 object-contain" />
          </RouterLink>
          <div class="flex items-center gap-2">
            <div class="flex items-center justify-center gap-2 text-slate-200" aria-hidden="true">
              <span class="inline-flex h-4 w-6 overflow-hidden rounded-sm border border-slate-500/60">
                <span class="h-full w-1/3 bg-[#009246]"></span>
                <span class="h-full w-1/3 bg-[#f1f2f1]"></span>
                <span class="h-full w-1/3 bg-[#ce2b37]"></span>
              </span>
              <span class="text-sm font-semibold leading-none">IT</span>
            </div>

            <div class="amazon-nav-menu-container relative mr-4">
              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-transparent text-slate-200 transition hover:text-[#ff9900]"
                @click="toggleNavMenu"
                aria-label="Apri menu navigazione"
                title="Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="h-5 w-5">
                  <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
                </svg>
              </button>

              <div v-if="showNavMenu" class="absolute right-0 top-11 z-50 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                <button type="button" class="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" @click="navigateFromAmazonMenu('Home')">Home</button>
                <button type="button" class="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" @click="navigateFromAmazonMenu('Ricevimento')">Ricevimento</button>
                <button type="button" class="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" @click="navigateFromAmazonMenu('Rsvp')">RSVP</button>
                <button type="button" class="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" @click="navigateFromAmazonMenu('Viaggio')">Viaggio di nozze</button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 w-full">
          <label for="amazon-search-mobile" class="sr-only">Cerca prodotto</label>
          <div class="flex h-12 overflow-hidden rounded-2xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#ff9900]/40">
            <input
              id="amazon-search-mobile"
              v-model="searchText"
              type="text"
              placeholder="Cerca un prodotto nella lista nozze!"
              class="w-full px-4 text-[15px] text-slate-800 placeholder:text-slate-500 focus:outline-none"
            />
            <button type="button" class="inline-flex w-16 items-center justify-center bg-[#f0c271] text-black hover:bg-[#ecb959]" aria-label="Cerca">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="h-6 w-6">
                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352 a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="amazon-subbar px-4 py-2 text-sm">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex min-w-0 items-center gap-2 px-2 py-1 text-slate-100">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" class="h-4 w-4 shrink-0 text-slate-200">
          <path d="M215.7 499.2C267 435 384 282.4 384 192C384 86 298 0 192 0S0 86 0 192c0 90.4 117 243 168.3 307.2 12.3 15.4 35.1 15.4 47.4 0zM192 256a64 64 0 1 1 0-128 64 64 0 1 1 0 128z"/>
        </svg>
        <div class="min-w-0 leading-tight">
          <p class="truncate text-[11px] text-slate-300 sm:text-xs">Invia a Michele e Maddalena</p>
          <div class="flex items-center gap-1">
            <p class="truncate text-sm font-bold text-white">Melegnano 20077</p>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" class="h-3 w-3 shrink-0 text-slate-300">
              <path d="M137.4 374.6L9.4 246.6C-3.1 234.1-3.1 213.8 9.4 201.3s32.8-12.5 45.3 0L160 306.7 265.4 201.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-128 128c-12.5 12.4-32.8 12.4-45.3-.1z"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="amazon-filter-menu-container relative mr-4">
        <button
          type="button"
          class="amazon-filter-btn inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent text-slate-200 transition hover:text-[#ff9900]"
          @click="toggleFilterMenu"
          aria-label="Filtri prodotti"
          title="Filtri prodotti"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="h-4 w-4">
            <path d="M3.9 54.6C10.8 40.6 25.1 32 40.6 32H471.4c15.5 0 29.8 8.6 36.7 22.6 6.9 14 5.3 30.7-4 43.1L320 320.9V432c0 11.5-6.2 22.1-16.2 27.7l-64 36c-10.1 5.7-22.5 5.6-32.5-.2S192 478.4 192 466.7V320.9L7.9 97.7c-9.3-12.4-10.9-29.1-4-43.1z"/>
          </svg>
        </button>

        <div
          v-if="showFilterMenu"
          class="absolute right-0 top-11 z-50 w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-xl"
        >
          <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
            <input v-model="soldProducts" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-[#ff9900] focus:ring-[#ff9900]" />
            <span class="font-medium">Regali esauriti</span>
          </label>
          <label class="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
            <input v-model="availableProducts" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-[#ff9900] focus:ring-[#ff9900]" />
            <span class="font-medium">Regali attivi</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.amazon-topbar {
  background-color: #131921;
}
.amazon-subbar {
  background-color: #232f3e;
  color: #f3f4f6;
}
</style>
