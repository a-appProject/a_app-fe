<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits<{
  (e: 'popup_input_close', value: {type: string, value?: string}): void,
}>()

const searchQuery = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// Фокус на инпуте при монтировании компонента
onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus();
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});


const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      emit('popup_input_close', {type: 'enter', value: searchQuery.value});
      break;
      
    case 'Escape':
      event.preventDefault();
      emit('popup_input_close', {type: 'close'});
      break;
  }
};

const handleConfirm = () => {
  emit('popup_input_close', {type: 'enter', value: searchQuery.value});
};

const handleClose = () => {
  emit('popup_input_close', {type: 'close'});
};
</script>

<template>
  <div class="wrapper">
    <p class="text">Введите цифры с штрих-кода</p>
    <div class="search-wrapper">
      <input 
        v-model="searchQuery"
        ref="inputRef"
        class="search"
        id="msg"
        type="number"
        placeholder="Ввод..."
        @keydown.enter="handleConfirm"
        @keydown.esc="handleClose"
      />
    </div>
    <div class="buttons-wrapper">
      <button
        type="button"
        class="btn"
        :style="{ backgroundColor: 'var(--green-color)' }"
        @click="handleConfirm"
      >
        <p class="label">Подтвердить</p>
      </button>
      <button 
        type="button"
        class="btn"
        :style="{ backgroundColor: 'var(--orange-color)' }"
        @click="handleClose"
      >
        <p class="label">Закрыть</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
input.search::placeholder {
  color: #B9B9B9;
}

input.search {
  background-color: inherit;
  font-size: 20px;
  padding: 0px;
  font-family: inherit;
  margin: 0;
  border: none;
  outline: none;
  width: 100%;
  margin-left: 5px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  justify-content: start;
  width: 95%;
  height: 20px;
  padding: 10px 0;
  background-color: #F6F6F6;
  border-radius: var(--border-radius);
  margin-top: 10px;
}

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