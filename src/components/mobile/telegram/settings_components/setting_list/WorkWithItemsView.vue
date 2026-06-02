<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { setBackButton, hideBackButton } from '@/tools/setTelegramButtons';
import { 
  syncAllItemsFromIiko,
  syncAllPointsFromIiko,
  syncAllSuppliersFromIiko } from '@/composables/itemWorker';
import Resp from '@/models/responseProductsFromiiko';
import { createPopupManager } from '@/tools/setTelegramPopUp'
import AnimatePlaceHolder from '@/components/AnimatePlaceHolder.vue';

const popupManager = createPopupManager();

onMounted(async () => {
  setBackButton();
})

onUnmounted(() => {
  hideBackButton();
});

function btnClick(value: string) {
  switch(value) {
    case 'unload_goods':
      syncProductsFromIiko();
      break;
    case 'unload_points':
      syncPointsFromIiko();
      break;
    case 'unload_suppliers':
      syncSuppliersFromIiko();
      break;
    default: 
      break;
  }
}

const responseItems = ref<boolean>(true)
const responsePoints = ref<boolean>(true)
const responseSuppliers = ref<boolean>(true)

async function syncProductsFromIiko() {
  responseItems.value = false;
  const res: Resp = await syncAllItemsFromIiko();
  if (res) {
    responseItems.value = true;
    popupManager.openPopup(`${res.message}`,
      (buttonId) => {
        if (buttonId === 'cancel') {
          popupManager.cleanup();
        }
      }
    );
  }
}

async function syncPointsFromIiko() {
  responsePoints.value = false;
  const res: Resp = await syncAllPointsFromIiko();
  if (res) {
    responsePoints.value = true;
    popupManager.openPopup(`${res.message}`,
      (buttonId) => {
        if (buttonId === 'cancel') {
          popupManager.cleanup();
        }
      }
    );
  }
}

async function syncSuppliersFromIiko() {
  responseSuppliers.value = false;
  const res: Resp = await syncAllSuppliersFromIiko();
  if (res) {
    responseSuppliers.value = true;
    popupManager.openPopup(`${res.message}`,
      (buttonId) => {
        if (buttonId === 'cancel') {
          popupManager.cleanup();
        }
      }
    );
  }
}

</script>

<template>
  <div class="label-section">
    <p class="label-settings">Работа с товарами </p>
  </div>
  <div class="admin-section">
    <button 
      type="button" 
      class="btn"
      :style="{ padding: responseItems ? '20px' : '0' }"
      @click="btnClick('unload_goods')"
    >
      <AnimatePlaceHolder v-if="!responseItems" />
      <p class="btn-label" v-else>
        Синхронизировать товары из айки
      </p>
    </button>
    <button 
      type="button" 
      class="btn"
      :style="{ padding: responsePoints ? '20px' : '0' }"
      @click="btnClick('unload_points')"
    >
      <AnimatePlaceHolder v-if="!responsePoints" />
      <p class="btn-label" v-else>
        Синхронизировать точки из айки
      </p>
    </button>
     <button 
      type="button" 
      class="btn"
      :style="{ padding: responseSuppliers ? '20px' : '0' }"
      @click="btnClick('unload_suppliers')"
    >
      <AnimatePlaceHolder v-if="!responseSuppliers" />
      <p class="btn-label" v-else>
        Синхронизировать поставщиков из айки
      </p>
    </button>
  </div>
</template>

<style scoped>

.btn:active {
  transform: var(--transform-scale-active);
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  background-color: var(--blue-color);
  font-size: 18px;
  color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  flex-shrink: 0;
  width: 100%;
  height: 60px;
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 20px;
  transition: all .3s ease;
}

.label-section{
  font-size: 18px;
  font-weight: 500;
  text-align: start;
}

.admin-section{
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

</style>
