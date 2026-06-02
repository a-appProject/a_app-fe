<script setup lang="ts">
import Button from '@/models/button'

defineProps<{
  button: Button
  modelValue: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()
</script>

<template>
  <button
    type="button"
    class="btn"
    :class="{ active: modelValue === button.id }"
    @click="emit('update:modelValue', button.id)"
  >
    {{ button.name }}
  </button>
</template>


<style scoped>

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  height: 40px;
  font-size: 20px;
  background-color: var(--orange-color);
  color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
}

.btn.active {
  background-color: var(--green-color);
}

.btn:active {
  transform: var(--transform-scale-active);
}

</style>