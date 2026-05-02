<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import HomeSection from '@/views/Home.vue'
import CerimoniaSection from '@/views/Cerimonia.vue'
import CollectionSection from '@/views/CollectionSection.vue'

const scrollMultiplier = 0.45

const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey) return

  const isPageScroll = event.deltaMode === WheelEvent.DOM_DELTA_PAGE
  const isLineScroll = event.deltaMode === WheelEvent.DOM_DELTA_LINE
  const lineHeight = 16

  const deltaY = event.deltaY * (isPageScroll ? window.innerHeight : isLineScroll ? lineHeight : 1)
  const deltaX = event.deltaX * (isPageScroll ? window.innerHeight : isLineScroll ? lineHeight : 1)

  event.preventDefault()
  window.scrollBy({
    top: deltaY * scrollMultiplier,
    left: deltaX * scrollMultiplier,
    behavior: 'auto',
  })
}

onMounted(() => {
  window.addEventListener('wheel', handleWheel, { passive: false })
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleWheel)
})
</script>

<template>
  <div>
    <HomeSection />
    <CerimoniaSection />
    <CollectionSection />
  </div>
</template>