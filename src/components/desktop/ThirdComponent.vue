<script setup lang="ts">
import { ref, watch } from 'vue'
import ProductItem from '@/components/desktop/models_third_component/ProductItem.vue';
import Product from '@/models/product';
import Order from '@/models/order';
import ProductInOrder from '@/models/productInOrder';
import OrderStatisticItem from '@/components/desktop/models_third_component/OrderStatisticItem.vue';

const props = defineProps<{
  products: Product[] | null,
  statisticOrderByPoint: Order[],
  filterProductsForOrder?: Order,
  pointId: number
}>();

console.log('props.statisticOrderByPoint=', props.statisticOrderByPoint)

const emit = defineEmits<{
  (e: 'select_order_id', value: number): void
}>();

const productsInOrder = ref<ProductInOrder[]>()
const products = ref<Product[] | null>(null)

watch(() => props.products,(newVal) => {
  products.value = null;
  products.value = newVal;
}, { immediate: true })

watch(() => props.filterProductsForOrder,(newVal) => {
  productsInOrder.value = newVal?.products
}, { immediate: true })

const selectOrderId = ref<number | null>(null);

function selectOrder(id: number) {
  selectOrderId.value = id;
  emit('select_order_id', id)
}

</script>


<template>


  <div class="wrapper">
    <p v-if="productsInOrder?.length === 0" class="text-null">Ничего не найдено</p>
    <p v-if="props.products?.length === 0" class="text-null">Ничего не найдено</p>

    <!-- Продукты -->
    <ProductItem v-if="products?.length !== 0" v-for="(product, index) in products"
      :product="product"
      :pointId="pointId"
      :index="index"
      :is-last="index === props.products!.length - 1"
      :is-order="false"
    />

    <!-- Существующий заказ -->
    <ProductItem v-for="(product, index) in productsInOrder"
      :product="product.product"
      :quantity="product.quantity"
      :index="index"
      :is-last="index === productsInOrder!.length - 1"
      :is-order="true"
    />
    <!-- Существующий заказ -->

    <OrderStatisticItem v-for="(order, index) in props.statisticOrderByPoint"
      :order="order"
      :index="index"
      :is-last="index === props.statisticOrderByPoint.length - 1"
      :select-order-id="selectOrderId === order.id"
      @select_order="selectOrder"
    />
  </div>


</template>


<style scoped>

.text-null {
  font-size: 20px;
  color: black;
  margin-top: 20px;
}

.wrapper {
  border-radius: var(--border-radius-desktop);
  box-shadow: var(--drop-shadow-2);
  background-color: white;
  height: 100%;
  width: 100%;
  max-width: 41.97916vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  overflow-y: auto;
  gap: 10px;
}

</style>