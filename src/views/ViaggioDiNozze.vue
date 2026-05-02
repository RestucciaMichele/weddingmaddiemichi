
<script setup lang="ts">
import { ref } from 'vue';
import NavbarAmazon from '@/components/NavbarAmazon.vue';

const searchQuery = ref('');
const showSoldProducts = ref(false);
const showAvailableProducts = ref(true);
</script>

<template>
  <div class="amazon-page min-h-screen pb-10">
    <NavbarAmazon
      v-model:searchQuery="searchQuery"
      v-model:showSoldProducts="showSoldProducts"
      v-model:showAvailableProducts="showAvailableProducts"
    />
    <!-- Qui andra' il contenuto della pagina Viaggio di Nozze -->
  </div>
</template>

<style scoped>
.amazon-page {
  font-family: Arial, Helvetica, sans-serif;
  background-color: #eaeded;
}
</style>
