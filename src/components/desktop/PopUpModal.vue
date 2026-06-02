<script setup lang="ts">
import Btn from '@/models/popup_button';
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  text: string | null,
  btns: Btn[] | null
}>()

const emit = defineEmits<{
  (e: 'popup_close', value: string): void,
}>()

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {      
    case 'Escape':
      event.preventDefault();
      emit('popup_close', 'cancel');
      break;
  }
};

</script>


<template>

  <div class="wrapper">
    <p class="text" v-html="props.text"></p>
    <div class="buttons-wrapper">

      <button v-for="btn in props.btns"
        type="button"
        class="btn"
        :style="{ backgroundColor: btn.color }"
        @click="emit('popup_close', btn.type)" 
      >
        <p class="label">{{ btn.label }}</p>
      </button>
    </div>
  </div>

</template>


<style scoped>

.buttons-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10px;
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  width: 95%;
  height: 50px;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  color: white;
  transition: all .3s ease;
  font-size: 16px;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.text {
  font-size: 18px;
  max-width: 300px;
  line-height: 1.5;
}

.wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: var(--border-radius);
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 50px;
  padding: 50px 50px 20px 50px;
  z-index: 11;
}

</style>