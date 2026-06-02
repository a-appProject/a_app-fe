<script setup lang="ts">

const props = defineProps<{ 
  id: number,
  status: string,
  index: number,
  isSelected: boolean
}>();

const emit = defineEmits<{
  (e: 'select_order', value: number): void,
}>()


</script>


<template>

  <button
    type="button"
    class="btn"
    :class="{active: props.isSelected}"
    :style="{marginTop: props.index === 0 ? '10px' : '0'}"
    @click="emit('select_order', props.id)"
  >
    <div class="left">
      <img class="order-img" src="@/assets/desktop/order_icon.svg">
      <div class="text-block">
        <p>Заказ #{{ props.id }}</p>
        <div class="status">
          <p class="status-text">{{ props.status }}</p>
          <svg width="7" height="7" viewBox="0 0 7 7" :style="{ fill: props.status == 'Доставлен' ? 'var(--green-color)' : 'var(--orange-color)' }" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3.5C7 5.433 5.433 7 3.5 7C1.567 7 0 5.433 0 3.5C0 1.567 1.567 0 3.5 0C5.433 0 7 1.567 7 3.5Z"/>
          </svg>
        </div>
      </div>
    </div>
    <img src="@/assets/desktop/arrow.svg">
  </button>

</template>


<style scoped>

.arrow {
  transition: all .3s ease;
  margin-right: 30px;
}

.status-text{
  font-size: 14px;
  color: #949494;
}

.status{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px; 
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
  width: 25px;
  height: 25px;
}

.left {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
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
  width: 95%;
  height: 71px; 
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px 10px 30px;
}

.btn.active {
  background-color: white;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.btn:hover {
  background-color: white;
}

</style>