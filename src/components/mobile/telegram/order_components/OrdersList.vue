<script setup lang="ts">
import OrdersListItem from '@/components/mobile/telegram/order_components/OrdersListItem.vue';
import Order from '@/models/order';
import Point from '@/models/point';

const props = defineProps<{ 
  order: Order,
  isLast: boolean,
  isFirst: boolean,
  isHistory: boolean,
  point?: Point,
  isAdmin: boolean
}>();

</script>

<template>
  <div :class="{ 'orders-items': true, 'border-top': props.isFirst, 'border-bottom': props.isLast }" > 
    <OrdersListItem
      :order="order"
      :isLast="isLast"
      :isFirst="isFirst"
      :isHistory="isHistory"
      :point="point"
      :isAdmin="isAdmin"  
    />
  </div>

</template>

<style scoped>

.border-top{
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.border-bottom{
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}

.orders-items{
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--grey-color);
}

</style>
