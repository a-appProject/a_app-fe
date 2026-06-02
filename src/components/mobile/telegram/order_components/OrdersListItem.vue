<script setup lang="ts">
import Order from '@/models/order';
import router from '@/router';
import Point from '@/models/point';
import { setHaptic } from '@/tools/setTelegramHaptick';

const props = defineProps<{ 
  order: Order,
  isLast: boolean,
  isFirst: boolean,
  point?: Point,
  isAdmin: boolean
}>();

</script>

<template>
  <div class="item" :style="{ 'box-shadow': !isLast ? '0 0.5px 0 #C8C7CB' : '' }" @click="setHaptic(); props.isAdmin == true ? router.push(`/order?id=${props.order.id}&point_id=${props.point?.id}&point_uuid=${props.point?.uuid}&isAdmin=${props.isAdmin}`) : router.push(`/order?id=${props.order.id}&point_id=${props.point?.id}&point_uuid=${props.point?.uuid}`)">
    <div class="left-item">
      <div class="icon-item">
        <img src="@/assets/cart-icon.svg">
      </div>
      <div class="text-item">
        <div class="icon-item">
          <p class="label-item">Заказ {{ props.order.id}}</p>
          <svg width="4" height="4" viewBox="0 0 4 4" fill="none" :style="{ fill: props.order.status == 'Доставлен' ? 'var(--green-color)' : 'var(--orange-color)' }" xmlns="http://www.w3.org/2000/svg">
            <circle cx="1.83761" cy="1.86495" r="1.83761"/>
          </svg>
        </div>
        <p class="status-item">
          {{ props.order.status }}
        </p>
      </div>
    </div>
    <div class="rightn-item">
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.67578 12.1982C1.67578 12.1982 7.1886 7.05294 7.1886 6.68542C7.1886 6.3179 1.67578 1.1726 1.67578 1.1726" stroke="#BAB9BD" stroke-width="2.20513" stroke-linecap="round"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>

.status-item{
  font-size: 11px;
  color: #8E8E92;
  text-align: start;
}

.label-item{
  font-size: 12px;
  font-weight: 500;
}

.icon-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.text-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.icon-item{
  display: flex;
}

.left-item{
  display: flex;
  align-items: center;
  gap: 16px;
}

.item{
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: black;
  padding: 8px 21px;
}

</style>
