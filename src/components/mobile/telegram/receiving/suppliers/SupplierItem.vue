<script setup lang="ts">
import Supplier from '@/models/receiving/supplier'

const emit = defineEmits<{
  (e: 'select_supplier', value: string): void
}>()

const props = defineProps<{
  supplier: Supplier,
  isSelected: boolean
}>()

function btnClick() {
  if (props.supplier) {
    emit('select_supplier', props.supplier.uuid)
  }
}

</script>

<template>

  <button
    type="button"
    class="btn"
    :class="{active: props.isSelected}"
    @click="btnClick"
  >
    <div class="left">
      <svg class="order-img" width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M51.875 21.875C51.7822 18.5973 51.4702 16.5076 50.4194 14.7243C48.9247 12.1881 46.2331 10.7767 40.8496 7.9538L35.8457 5.32992C31.4533 3.02665 29.2571 1.875 26.8945 1.875C24.5319 1.875 22.3357 3.02665 17.9433 5.32992L12.9394 7.9538C7.55601 10.7767 4.86431 12.1881 3.36967 14.7243C1.875 17.2606 1.875 20.4167 1.875 26.7287V27.0213C1.875 33.3333 1.875 36.4895 3.36967 39.0258C4.86431 41.562 7.55601 42.9733 12.9394 45.7963L17.9433 48.42C22.3357 50.7233 24.5319 51.875 26.8945 51.875C29.2571 51.875 31.4533 50.7233 35.8457 48.42L40.8496 45.7963C46.2331 42.9733 48.9247 41.562 50.4194 39.0258C51.4702 37.2423 51.7822 35.1528 51.875 31.875M49.4121 15.625L39.4043 20.625M39.4043 20.625C39.4043 20.625 38.6419 21.0059 38.1533 21.25C33.7564 23.4468 26.8945 26.875 26.8945 26.875M39.4043 20.625V29.375M39.4043 20.625L15.6357 8.125M26.8945 26.875L4.37695 15.625M26.8945 26.875V50.625" stroke="#8E8E92" stroke-width="3.75" stroke-linecap="round"/>
      </svg>

      <div class="text-block">
        <p>{{props.supplier.name}}</p>
      </div>
    </div>
    <p class="select-text">{{ props.isSelected ? 'Выбрано' : 'Выбрать'}}</p>
  </button>

</template>

<style scoped>

.select-text {
  font-size: 18px;
}

.arrow {
  transition: all .3s ease;
  margin-right: 30px;
}

.text-block{
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 5px;
  font-size: 16px;
  color: black;
}

.order-img{
  width: 30px;
  height: 30px;
}

.left {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.btn.active {
  background-color: white;
}

.btn:hover {
  background-color: white;
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  background-color: #F2F2F2;
  box-shadow: var(--drop-shadow-2);
  flex-shrink: 0;
  width: 100%;
  height: 71px; 
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px 10px 30px;
}

</style>