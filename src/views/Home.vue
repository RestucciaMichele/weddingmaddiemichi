<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLoadingScreen } from '@/stores/loadingScreen'
import '../assets/styles/home.css'
import heroImage from '../assets/images/homehero_desktop.webp'
import heroImageMobile from '../assets/images/homehero_mobile.webp'
import maddieMichiSvg from '../assets/SVG/MaddieMichi.svg'

// Preload the hero image at module level so the browser keeps it
// in memory cache — it won't need to re-fetch it when scrolling back.
const _preload = new Image()
_preload.src = window.matchMedia('(max-width: 960px)').matches ? heroImageMobile : heroImage

const { isLoading } = useLoadingScreen()
const showSvgAnimation = ref(false)

// Avvia l'animazione dopo che il loading screen scompare
watch(
  isLoading,
  (loading) => {
    if (!loading) {
      // Piccolo delay per assicurare che la transizione fade sia completata
      setTimeout(() => {
        showSvgAnimation.value = true
      }, 1000)
    }
  },
  { immediate: true }
)
</script>

<template>
    <div class="home">
        <img :src="maddieMichiSvg" alt="Maddi e Michi" width="400" height="150" class="maddi-michi-svg" :class="{ 'animate': showSvgAnimation }" />
    </div>
</template>
