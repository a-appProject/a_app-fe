<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import store from '@/store';
import icons from '@/models/icons'
import Product from '@/models/product';
import { ProductWithPackaging } from '@/models/product';
import iconMapping from '@/models/iconmapping'
import { Packaging } from '@/models/packaging';

const props = defineProps<{
  product: Product,
  index: number,
  isLast: boolean,
  quantity?: number,
  pointId?: number,
  isOrder: boolean
}>();

const selectPackaging = ref<Packaging>(props.product.packaging[0]);

const productsInCart = computed(() => {
  return store.getters.getCartItemsByPoint(props.pointId) || []; 
});

const iconPath = computed(() => icons[iconMapping[props.product.description.split(';')[0].trim()]] || '');

const productCount = computed(() => {
  const productInCart: ProductWithPackaging = productsInCart.value.find((item: ProductWithPackaging) => 
    (item.id === props.product.id) && (item.packaging.id === selectPackaging.value.id)
  );
  return productInCart ? productInCart.quantity : 0;
});

const isAdded = ref(false)

watch(productCount, (count) => {
  isAdded.value = count > 0
}, { immediate: true })


function addProduct() {
  if (productCount.value === 0) {
    store.dispatch("addProductToCart", {
      product: {
        ...props.product,
        packaging: selectPackaging.value,
        quantity: 1
      },
      pointId: props.pointId
    })
  } else {
    store.dispatch("updateProductQuantity", {
      id: props.product.id,
      quantity: productCount.value + 1,
      packaging: selectPackaging.value,
      pointId: props.pointId
    })
  }
}

function delProduct() {
  if (productCount.value > 1) {
    store.dispatch("updateProductQuantity", {
      id: props.product.id,
      quantity: productCount.value - 1,
      packaging: selectPackaging.value,
      pointId: props.pointId
    })
  } else {
    store.dispatch("removeProductFromCart", {
      productId: props.product.id,
      packaging: selectPackaging.value,
      pointId: props.pointId
    })
  }
}

</script>


<template>

  <div class="product-wrapper" 
    :style="{marginTop: props.index === 0 ? '10px' : '0', marginBottom: props.isLast ? '20px' : '0'}"
  >
    <div class="left">
      <img class="product-img" :src="iconPath">
      <div class="label-descr-product">
        <p class="product-label">{{ props.product.name }}</p>
        <p class="product-description">{{ props.product.description }}</p>
        <select 
          v-if="!props.isOrder"
          v-model="selectPackaging"
          :disabled="props.product.packaging.length === 1" 
          class="select-packaging" 
          name="packaging" 
          id="packaging-select"
        >
          <option v-for="packaging in props.product.packaging"
            :value="packaging"
          >
          {{ packaging.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="right">
      <p v-if="props.isOrder" class="packaging-product">{{ props.product.packaging }}</p>
      <p v-if="productCount > 0" class="quantity-product">x{{ productCount }}</p>
      <p v-if="props.quantity !== undefined" class="quantity-product order">x{{ props.quantity }}</p>
      <div class="buttons-wrapper" v-if="props.quantity === undefined">
        <button
          type="button"
          class="btn btn-del"
          :class="{ 'is-added': isAdded }"
          @click="delProduct()"
        >
        </button>
        <button
          type="button"
          class="btn btn-add-to-cart"
          :class="{ 'is-added': isAdded }"
          @click="addProduct()"
        >
        <span class="add-to-cart-text">ДОБАВИТЬ</span>
        </button>
      </div>
    </div>
  </div>

</template>


<style scoped>

.select-packaging {
  background-color: inherit;
  border: 1px solid black;
  border-radius: 5px;
  width: 100%;
  font-family: inherit;
  font-size: 15px;
}

.select-packaging:disabled {
  cursor: not-allowed;
}

.order {
  margin-right: 30px;
}

.add-to-cart-text{
  display: inline-block;
  transform-origin: center;
  transition: transform .3s ease;
  font-size: 18px;
  color: white;
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  background: none;
  font-family: inherit;
  height: 40px;
  font-size: 20px;
  color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  line-height: 18px;
  transition: all .3s ease;
  position: relative;
  overflow: hidden;
}

.btn-add-to-cart {
  background-color: var(--orange-color);
  width: 150px;
}

.btn-add-to-cart::before,
.btn-add-to-cart::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  width: 14px;
  height: 3px;
  background-color: #fff;
  border-radius: 1px;
  z-index: 1;
  transform: scaleX(0);
  transition: all .3s ease;
}

.btn-add-to-cart.is-added {
  width: 70px;
}

.btn-add-to-cart.is-added::before {
  transform: scaleX(1);
}

.btn-add-to-cart.is-added::after {
  transform: scaleX(1) rotate(90deg);
}

.btn-add-to-cart.is-added .add-to-cart-text {
  transform: scale3d(0.4, 0, 1);
  opacity: 0;
}

.btn-del::before {
  display: inline-block;
  position: absolute;
  content: '';
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  width: 14px;
  height: 4px;
  background-color: #fff;
  border-radius: 1px;
  z-index: 1;
}

.btn-del {
  background-color: var(--red-color);
  width: 0px;
}

.btn-del.is-added {
  width: 70px;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.buttons-wrapper{
  position: relative;
  display: flex;
  align-items: start;
  justify-content: center;
  width: 100%;
  max-width: 150px;
  margin-right: 30px;
  gap: 10px;
}

.quantity-product {
  font-size: 30px;
  color: var(--orange-color);
}

.packaging-product {
  font-size: 18px;
}

.right {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 30px;
}

.product-description{
  font-size: 13px;
  color: #8E8E92;
}

.product-label {
  font-size: 15px;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
  white-space: nowrap;
  max-width: 180px;
}

.label-descr-product{
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 3px;
}

.product-img {
  max-width: 50px;
  margin-left: 30px;
}

.left {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.product-wrapper {
  width: 95%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #F2F2F2;
  flex-shrink: 0;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
}

</style>