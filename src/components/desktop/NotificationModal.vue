<script setup lang="ts">
import { computed, onMounted } from 'vue';
import Status from '@/models/status'

const props = defineProps<{
  status: Status,
  message: string | null
}>();

const emit = defineEmits<{
  (e: 'hide_notif'): void
}>()

const statusColor = computed(() => {
  switch (props.status) {
    case 'done':
      return 'var(--green-color)';
    case 'error':
      return 'var(--red-color)'
    default:
      return 'var(--orange-color)'
  }
})

onMounted(() => {
  setTimeout(() => {
    emit('hide_notif')
  }, 3000)
})

</script>


<template>

  <div class="wrapper" :style="{ borderColor: statusColor }">
    <svg class="svg" width="43" height="35" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5607 21.4393C14.9749 20.8536 14.0251 20.8536 13.4393 21.4393C12.8536 22.0251 12.8536 22.9749 13.4393 23.5607L14.5 22.5L15.5607 21.4393ZM18.5 26.5L17.4393 27.5607C18.0251 28.1464 18.9749 28.1464 19.5607 27.5607L18.5 26.5ZM29.5607 17.5607C30.1464 16.9749 30.1464 16.0251 29.5607 15.4393C28.9749 14.8536 28.0251 14.8536 27.4393 15.4393L28.5 16.5L29.5607 17.5607ZM10.7489 2.87723C10.0318 3.29204 9.78678 4.20964 10.2016 4.92673C10.6164 5.64382 11.534 5.88886 12.2511 5.47405L11.5 4.17564L10.7489 2.87723ZM5.47405 12.2511C5.88886 11.534 5.64382 10.6164 4.92673 10.2016C4.20964 9.78678 3.29204 10.0318 2.87723 10.7489L4.17564 11.5L5.47405 12.2511ZM14.5 22.5L13.4393 23.5607L17.4393 27.5607L18.5 26.5L19.5607 25.4393L15.5607 21.4393L14.5 22.5ZM18.5 26.5L19.5607 27.5607L29.5607 17.5607L28.5 16.5L27.4393 15.4393L17.4393 25.4393L18.5 26.5ZM11.5 4.17564L12.2511 5.47405C14.9707 3.90086 18.1279 3 21.5 3V1.5V0C17.5865 0 13.9128 1.04702 10.7489 2.87723L11.5 4.17564ZM21.5 1.5V3C31.7172 3 40 11.2827 40 21.5H41.5H43C43 9.62587 33.374 0 21.5 0V1.5ZM41.5 21.5H40C40 31.7172 31.7172 40 21.5 40V41.5V43C33.374 43 43 33.374 43 21.5H41.5ZM21.5 41.5V40C11.2827 40 3 31.7172 3 21.5H1.5H0C0 33.374 9.62587 43 21.5 43V41.5ZM1.5 21.5H3C3 18.1279 3.90086 14.9707 5.47405 12.2511L4.17564 11.5L2.87723 10.7489C1.04702 13.9128 0 17.5865 0 21.5H1.5Z" :fill="statusColor"/>
    </svg>
    <p v-if="props.status !== null" class="message">{{ props.message }}</p>
  </div>

</template>


<style scoped>

.svg {
  width: 35px;
}

.message {
  font-size: 13px;
}

.wrapper {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 9px 25px;
  background-color: white;
  border-radius: 50px;
  border-width: 1px;
  border-style: solid;
  box-shadow: var(--drop-shadow-2);
  z-index: 11;
}

</style>