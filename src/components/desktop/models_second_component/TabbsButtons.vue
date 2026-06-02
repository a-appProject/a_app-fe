<script setup lang="ts">
import Tab from '@/models/tab';

defineProps<{
  tabs: Tab[]
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <button
    v-for="tab in tabs"
    :key="tab.id"
    type="button"
    class="tab-btn"
    :class="{ active: modelValue === tab.id }"
    @click="emit('update:modelValue', tab.id)"
  >
    {{ tab.label }}
  </button>
</template>


<style scoped>

.tab-btn {
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  font-size: 20px;
  width: 50%;
  height: 100%;
  background-color: #EFEFF3;
  color: #8E8E92;
  transition-duration: 0.3s;
}

.tab-btn.active {
  background-color: white;
  color: black;
}
</style>
