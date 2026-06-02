<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import OrdersList from '@/components/mobile/telegram/order_components/OrdersList.vue';
import Order from "@/models/order";
import Point from '@/models/point';
import { getOrdersByPoint } from '@/composables/orderWorkerk'; 
import { getAllPoints } from '@/composables/itemWorker';
import { setBackButton, hideBackButton } from '@/tools/setTelegramButtons';

const orders = ref<Order[]>([]); 
const points = ref<Point[]>([]);
const selectedPoint = ref<Point>();
//Логика статистики
const styleBtnAll = ref('');

async function getOrderByPoint(point_id: number) {
  orders.value = await getOrdersByPoint(point_id)
}

async function getPoints() {
  points.value = await getAllPoints();
}

onMounted(async () => {
  setBackButton();
  await getPoints();
})

onUnmounted(() => {
  hideBackButton();
});

function buttonStyle(point: string) {
  return selectedPoint.value?.uuid === point ? 'background-color: var(--green-color);' : '';
}

async function selectPoint(point: Point | undefined) {
  if (point) {
    selectedPoint.value = point;
    await getOrderByPoint(point.id);
    styleBtnAll.value = point ? 'background-color: var(--green-color);' : '';
  }
}

</script>

<template>
  <div class="admin-section">
    <div class="statistic-body">
      <p class="statistic-label">Статистика</p>
      <div class="three-btns">
        <button
          type="button"
          v-for="point in points"
          :key="point.id"
          class="btn"
          :style="buttonStyle(point.uuid)"
          @click="selectPoint(point)"
        >
          {{ point.name }}
        </button>
      </div>
      <div class="orders-by-point" v-if="selectedPoint">
        <div class="orders-list" v-if="orders.length > 0">
          <OrdersList v-for="(order, index) in orders"
            :key="order.id"
            :order="order"
            :isFirst="index === 0"
            :isLast="index === orders.length - 1"
            :isHistory="true"
            :point="selectedPoint"
            :isAdmin="true"
          />
        </div>
        <p v-else class="no-orders">На этой точке ещё нет заказов</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

.no-orders {
  font-size: 16px;
  margin-top: 20px;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.all-items-btn:active {
  transform: var(--transform-scale-active);
}

.btn-settings:active {
  transform: var(--transform-scale-active);
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  background-color: var(--grey-color);
  font-size: 18px;
  font-weight: 600;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  width: 100%;
  padding: 17px;
  align-items: center;
  display: flex;
  justify-content: center;
  transition: all .3s ease;
}

.head-bnt-first-line {
  font-size: 18px;
  font-weight: 600;
  color: black;
  margin-top: 20px;
  width: 100%;
  text-align: start;
}

.orders-by-point{
  width: 100%;
}

.orders-list{
  margin-top: 30px;
}

.btn1, .btn2, .btn3 {
  background-color: var(--orange-color);
  font-size: 14px;
  font-weight: 600;
  padding: 10px 8.3vw;
  color: white;
  border-radius: var(--border-radius);
}

.three-btns{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  width: 100%;
}

.statistic-body{
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;
}

.btn-body {
  background-color: var(--orange-color);
  width: 100%;
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: 500;
  padding-top: 20px;
  padding-bottom: 20px;
  border-radius: var(--border-radius);
  margin-top: 20px;
}

.items-body{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.add-admin-text{
  font-size: 16px;
  font-weight: 400;
}

.add-admin-wrapper{
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--grey-color);
  padding: 13px 21px;
  gap: 10px;
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}

.admins-body{
  width: 100%;
}

.label-section{
  font-size: 18px;
  font-weight: 500;
  text-align: start;
}

.admin-section{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.admin-label, .statistic-label, .items-label {
  width: 100%;
  font-size: 18px;
  font-weight: 500;
  text-align: start;
}

</style>
