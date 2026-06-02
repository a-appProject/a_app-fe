<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const labelText = ref('Загрузка')
let intervalId: number | null = null
let dotCount = 0

onMounted(() => {
  intervalId = setInterval(() => {
    dotCount = (dotCount + 1) % 4 
    labelText.value = 'Загрузка' + '.'.repeat(dotCount)
  }, 700)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>

  <div class="loader-wrapper">
      <span class="loader"></span>
      <p class="label">{{ labelText }}</p>
  </div>
</template>

<style scoped>

.loader-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.label {
  font-size: 18px;
  color: #000000;
}

.loader {
  width: 50vw;
  height: 50vw;
  max-width: 150px;
  max-height: 150px;
  display: inline-block;
  position: relative;
}
.loader::after,
.loader::before {
  content: '';  
  box-sizing: border-box;
  width: 50vw;
  height: 50vw;
  max-width: 150px;
  max-height: 150px;
  border-radius: 50%;
  background:  #e6e7e8;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  animation: animloader 2s linear infinite;
}
.loader::after {
  animation-delay: 1s;
}

@keyframes animloader {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
    
</style>