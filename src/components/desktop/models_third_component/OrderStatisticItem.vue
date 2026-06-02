<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Order from '@/models/order';
import ProductInOrder from '@/models/productInOrder';
import ProductItemForStatistic from '@/components/desktop/models_third_component/ProductItemForStatistic.vue';


const props = defineProps<{
  order: Order,
  index: number,
  isLast: boolean,
  selectOrderId?: boolean
}>();

const emit = defineEmits<{
  (e: 'select_order', value: number): void,
}>()

function selectOrder(id: number) {
  emit('select_order', id);
}

const productsInOrder = ref<ProductInOrder[]>()

watch(() => props.selectOrderId,(newVal) => {
  if (newVal === true) {
    productsInOrder.value = props.order.products
  }
},{ immediate: true })

</script>


<template>

  <button
    type="button"
    class="btn order-wrapper"
    :class="{ active: props.selectOrderId }"
    :style="{marginTop: props.index === 0 ? '10px' : '0', marginBottom: props.isLast ? '20px' : '0'}"
    @click="selectOrder(props.order.id)"
  >
    <div class="order-up-wrapper">
      <div class="left">
        <img class="order-img" src="@/assets/desktop/order_icon.svg">
        <div class="label-descr-order">
          <p class="order-label">{{ props.order.id }}</p>
          <div class="order-description-wrapper">
            <p class="order-description">{{ props.order.status }}</p>
            <svg width="7" height="7" viewBox="0 0 7 7" :style="{ fill: props.order.status == 'Доставлен' ? 'var(--green-color)' : 'var(--orange-color)' }" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3.5C7 5.433 5.433 7 3.5 7C1.567 7 0 5.433 0 3.5C0 1.567 1.567 0 3.5 0C5.433 0 7 1.567 7 3.5Z"/>
            </svg>
          </div>
        </div>
      </div>
      <img class="arrow" :style="{transform: props.selectOrderId ? 'rotate(90deg)' : 'rotate(0)' }" src="@/assets/desktop/arrow.svg">
    </div>
    <div class="order-down-wrapper" v-if="props.selectOrderId">
      <div class="products-wrapper" v-for="product in productsInOrder">
        <ProductItemForStatistic
          :product="product.product"
          :quantity="product.quantity"
        />
      </div>
    </div>
  </button>

</template>


<style scoped>

.order-description-wrapper{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.products-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.order-down-wrapper{
  width: 85%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 10px;
  margin-bottom: 20px;
}

.arrow {
  transition: all .3s ease;
  margin-right: 30px;
}

.order-description {
  font-size: 14px;
  color: #8E8E92;
}

.order-label {
  font-size: 18px;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
  white-space: nowrap;
  max-width: 250px;
}

.label-descr-order{
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 3px;  
}

.order-img {
  width: 50px;
  margin-left: 30px;
}

.left {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.order-up-wrapper {
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  width: 95%;
}

.btn{
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  background-color: #F2F2F2;
  flex-shrink: 0;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
}

.btn:hover {
  background-color: white;
}

.btn.active {
  background-color: white;
}

</style>