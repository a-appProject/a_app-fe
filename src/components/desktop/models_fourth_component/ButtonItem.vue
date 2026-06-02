<script setup lang="ts">

const props = defineProps<{
  id: string | null,
  label: string,
  icon: string | null,
  color: string,
  text_color: string,
  opacity?: string,
}>();

const emit = defineEmits<{
  (e: 'btn_click', value: string | null): void
}>()

</script>

<template>
  <button 
    type="button"
    class="btn"
    :style="{ backgroundColor: props.color, opacity: props.opacity }"
    @click="emit('btn_click', props.id)" 
  >
    <Transition name="fade">
      <img class="img" v-if="props.icon" :src="props.icon"/>
    </Transition>
    <p class="label" :style="{ color: props.text_color }">
      {{ props.label }}
    </p>
  </button>
</template>

<style scoped>

.label {
  font-size: 19px;
}

.img {
  height: 20px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all .3s ease;
}

.btn:active {
  transform: var(--transform-scale-active);
}

</style>
