<script setup lang="ts">
const props = defineProps<{
  color: string,
  borderheight: number
}>()
</script>

<template>
  <div 
    :style="{ 
      outline: `${props.borderheight}px solid ${props.color}`,
      outlineOffset: `-${props.borderheight}px`
    }" 
    class="border-wrapper"
  ></div>
</template>

<style scoped>
.border-wrapper {
  position: absolute;
  z-index: 99999999;
  width: 100vw;
  height: 100vh;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: var(--border-radius);
}
</style>