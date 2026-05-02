<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRoute, useRouter } from 'vue-router'

const isLoggedIn = ref(false)
const router = useRouter()
const route = useRoute()

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user
  })
})

const logout = async () => {
  await signOut(auth)
  router.push('/area-riservata/login')
}
</script>

<template>
 <div class="navbar color-navbar shadow-md fixed top-0 left-0 w-full z-50">
    <div class="w-full px-4 md:px-12 lg:px-24 flex justify-between items-center">
      <!-- SINISTRA -->
      <div class="navbar-start">
        <div class="font-bold text-xl normal-case">Area Riservata</div>
        <div v-if="isLoggedIn" class="hidden md:flex items-center gap-2 ml-6">
          <RouterLink
            to="/area-riservata"
            class="px-3 py-1 rounded-lg text-sm font-semibold transition"
            :class="route.path === '/area-riservata' ? 'bg-white text-[#86343c]' : 'hover:bg-white/50'"
          >
            RSVP
          </RouterLink>
          <RouterLink
            to="/area-riservata/amazon"
            class="px-3 py-1 rounded-lg text-sm font-semibold transition"
            :class="route.path === '/area-riservata/amazon' ? 'bg-white text-[#86343c]' : 'hover:bg-white/50'"
          >
            Lista Amazon
          </RouterLink>
        </div>
      </div>
  
      <!-- DESTRA -->
      <div class="navbar-end">
        <div v-if="isLoggedIn">
          <div class="flex md:hidden items-center gap-2 mr-2">
            <RouterLink
              to="/area-riservata"
              class="px-2 py-1 rounded text-xs font-semibold transition"
              :class="route.path === '/area-riservata' ? 'bg-white text-[#86343c]' : 'hover:bg-white/50'"
            >
              RSVP
            </RouterLink>
            <RouterLink
              to="/area-riservata/amazon"
              class="px-2 py-1 rounded text-xs font-semibold transition"
              :class="route.path === '/area-riservata/amazon' ? 'bg-white text-[#86343c]' : 'hover:bg-white/50'"
            >
              Amazon
            </RouterLink>
          </div>
          <button
            @click="logout"
            class="btn btn-ghost border border-white text-white px-4 py-1 rounded hover:bg-white hover:text-black transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
