<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  isAdmin?: boolean
}>()

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="color-footer py-6">
    <div class="max-w-screen-xl mx-auto px-4 md:px-12 lg:px-24">
      <div class="text-center">
        <p class="text-sm">
          Con amore, <span class="font-semibold">Maddi & Michi</span> 💍
        </p>
        <p class="text-xs mt-1">
          © {{ currentYear }} Tutti i diritti riservati
        </p>
      </div>

      <div class="flex justify-end">
        <RouterLink
          :to="isAdmin ? '/' : '/area-riservata'"
          class="text-xs hover:underline"
        >
          ↗ {{ isAdmin ? 'Sito matrimonio' : 'Area riservata' }}
        </RouterLink>
      </div>
    </div>
  </footer>
</template>
