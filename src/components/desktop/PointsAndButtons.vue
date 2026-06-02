<script setup lang="ts">
import { ref } from 'vue';
import store from '@/store';
import Point from '@/models/point'

const props = defineProps<{ 
  points: Point[];
}>();

const emit = defineEmits<{
  (e: 'selectPoint', point: Point): void,
  (e: 'openSettings'): void
}>()

const selectedPoint = ref<number | null>(null);
const settingsIsActive = ref(false);

async function selectPoint(point: Point) {
  selectedPoint.value = point.id;
  settingsIsActive.value = false;
  emit('selectPoint', point)
}

function clickOpenSettings() {
  emit('openSettings');
  selectedPoint.value = null;
  settingsIsActive.value = true
}
</script>

<template>

  <div class="buttons-wrapper">
    <div class="point-buttons">
      <button
        v-for="point in props.points"
        :key="point.id"
        class="btn"
        type="button"
        :class="{ active: selectedPoint === point.id }"
        @click="selectPoint(point)"
      >
        {{ point.name }}
      </button>
    </div>

    <button
      v-if="store.getters.USER.role === 'admin'"
      class="settings-button"
      :class="{ active : settingsIsActive === true}"
      type="button"
      @click="clickOpenSettings()"
    >
      <img class="settings-icon" src="@/assets/desktop/settings_button.svg">
    </button>
  </div>

</template>

<style scoped>

.btn, .settings-button {
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
}

.settings-icon{
  width: 20px;
  height: 20px;
}
  
.settings-button{
  background-color: #B57600;
  border-radius: var(--border-radius);
  width: 88%;
  height: 40px;
  box-shadow: var(--drop-shadow-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.settings-button.active {
  background-color: var(--green-color);
}

.settings-button:active {
  transform: var(--transform-scale-active);
}
  
.btn{
  background-color: var(--orange-color);
  font-size: 18px;
  font-weight: 600;
  color: white;
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 144px;
  box-shadow: var(--drop-shadow-2);
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: normal;
  overflow-wrap: break-word;
  hyphens: auto;
  padding: 10px 5px;
}

.btn.active {
  background-color: var(--green-color);
}

.btn:hover {
  background-color: var(--green-color);
}

.btn:active {
  transform: var(--transform-scale-active);
}

.point-buttons{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 10px;
  width: 86%;
  margin-top: 15px;
  height: 90%;
  overflow: scroll;
  border-radius: var(--border-radius);
}

.point-buttons::-webkit-scrollbar {
  display: none;
}

.buttons-wrapper{
  border-radius: var(--border-radius-desktop);
  box-shadow: var(--drop-shadow-2);
  background-color: white;
  height: 100%;
  width: 100%;
  max-width: 7.5vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-width: 126px;
}

</style>