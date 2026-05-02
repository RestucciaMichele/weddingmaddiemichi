<script setup lang="ts">
import '../assets/styles/home.css'
import heroImage from '../assets/images/20260107_134241.webp'

// Preload the hero image at module level so the browser keeps it
// in memory cache — it won't need to re-fetch it when scrolling back.
const _preload = new Image()
_preload.src = heroImage
</script>

<template>
    <div class="home">
        
    </div>
</template>
