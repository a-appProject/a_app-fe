<script setup lang="ts">
import PointsAndOrders from '@/models/points&orders'

const props = defineProps<{
  point: PointsAndOrders,
  index: number,
  isSelected: boolean
}>();

const emit = defineEmits<{
  (e: 'select_point', value: number): void,
}>()

</script>

<template>

  <button
    type="button"
    class="statistic"
    :class="{ active: props.isSelected }"
    :style="{marginTop: props.index === 0 ? '10px' : '0'}"
    @click="emit('select_point', props.point.pointId)"
  >
    <div class="left">
      <p class="point-label">
        {{ props.point.pointName }}
      </p>
      <p class="point-length-orders">
        Заказов: {{ props.point.orders.length }}
      </p>
    </div>
    <img src="@/assets/desktop/arrow.svg">
  </button>

</template>


<style scoped>

.point-length-orders {
  font-size: 16px;
  color: #949494;
}

.point-label {
  font-size: 20px;
}

.left {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 10px;
}

.statistic {
  border: none;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: inherit;
  width: 95%;
  padding: 10px 15px 10px 30px;
  border-radius: var(--border-radius);
  background-color: #F2F2F2;
  box-shadow: var(--drop-shadow-item);
}

.statistic.active {
  background-color: white;
}

.statistic:hover {
  background-color: white;
}

.statistic:active {
  transform: var(--transform-scale-active);
}

</style>
