<script setup lang="ts">
import { computed } from 'vue'
import Product from '@/models/product';
import icons from '@/models/icons'
import packagingMap from '@/models/packaging'
import iconMapping from '@/models/iconmapping'

const props = defineProps<{
  product: Product,
  quantity: number
}>();

const iconPath = computed(() => icons[iconMapping[props.product.description.split(';')[0].trim()]] || '');
const packaging = computed(() => packagingMap[props.product.packaging] || props.product.packaging);

</script>


<template>

  <div class="left">
    <img class="icon" :src="iconPath">
    <div class="label-descr-product">
      <p class="product-label">{{ props.product.name }}</p>
      <p class="product-description">{{ props.product.description }}</p>
    </div>
  </div>

  <div class="right">
    <p class="quantity-product">x{{ props.quantity }}</p>
    <p class="packaging-product">{{ packaging }}</p>
  </div>

</template>


<style scoped>

.left, .right {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.quantity-product {
  font-size: 25px;
  color: var(--orange-color);
}

.packaging-product {
  font-size: 18px;
}

.product-description{
  font-size: 14px;
  color: #8E8E92;
}

.product-label {
  font-size: 18px;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
  white-space: nowrap;
  max-width: 305px;
}

.label-descr-product{
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 3px;
}

.icon{
  width: 50px;
}

</style>