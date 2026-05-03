<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import NavbarAdmin from './components/NavbarAdmin.vue'
import { RouterView, useRoute } from 'vue-router'
import { useNavbarVisibility } from '@/stores/navbarVisibility'
import LoadingScreen from './components/LoadingScreen.vue'

const route = useRoute()
const { isVisible: navbarVisible } = useNavbarVisibility()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <LoadingScreen />
    <component
      v-if="route.path.startsWith('/area-riservata') || navbarVisible"
      :is="route.path.startsWith('/area-riservata') ? NavbarAdmin : Navbar"
    />
    <main>
      <RouterView />
    </main>
  </div>
</template>
