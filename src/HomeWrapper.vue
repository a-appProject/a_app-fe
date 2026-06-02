<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { retrieveRawInitData } from '@tma.js/sdk-vue';
  import HomeViewTelegram from '@/components/mobile/telegram/HomeViewTelegram.vue'
  import HomeViewDesktop from '@/components/desktop/HomeViewDesktop.vue'

  const initDataRowFromTelegram = ref<string>();

  try {
    const initDataRaw = retrieveRawInitData();
    initDataRowFromTelegram.value = initDataRaw;
  } catch(error) {
    console.log(error)
  }
  
  const componentToRender = computed(() => {
    return initDataRowFromTelegram.value === undefined ? HomeViewDesktop : HomeViewTelegram  
  })
</script>

<template>
  <component :is="componentToRender" />
</template>