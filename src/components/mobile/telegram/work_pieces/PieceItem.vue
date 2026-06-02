<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import store from '@/store';
import Product from '@/models/product';
import { setHaptic } from '@/tools/setTelegramHaptick';
import { ProductWithPackaging } from "@/models/product";

const props = defineProps<{
  product: Product,
}>()

const isAdded = ref(false)
const inputValue = ref<string | number | null>(null)
const inputRef = ref<HTMLInputElement | null>(null);

const productsInCart = computed(() => store.getters.getCartItemsByPoint('store_warehouse') ?? []);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const productCount = computed(() => {
  const productInCart: ProductWithPackaging = productsInCart.value.find((item: ProductWithPackaging) => (item.id === props.product.id));
  return productInCart ? productInCart.quantity : 0;
});

watch(productCount, (count) => {
  isAdded.value = count > 0
  if (count > 0) {
    inputValue.value = count
  } else if (count === 0) {
    inputValue.value = null
  }
}, { immediate: true })

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  let value = target.value;

  const numericValue = parseFloat(value.replace(',', '.'));
  
  if (value.startsWith('0') && !value.startsWith('0,') && value.length > 1 && !value.includes(',')) {
    value = value.replace(/^0+/, '');
    if (value === '') value = '0';
    target.value = value;
  }
  
  if (!isNaN(numericValue) && numericValue > 0) {
    inputValue.value = value;
    store.dispatch("updateProductQuantity", {
      id: props.product.id,
      quantity: numericValue,
      packaging: props.product.packaging,
      pointId: 'store_warehouse'
    });
  } 
}

function addProduct() {
  setHaptic();
  if (productCount.value === 0) {
    store.dispatch("addProductToCart", {
      product: {
        ...props.product,
        packaging: props.product.packaging,
        quantity: 1
      },
      pointId: 'store_warehouse'
    })
  } else {
    store.dispatch("updateProductQuantity", {
      id: props.product.id,
      quantity: productCount.value + 1,
      packaging: props.product.packaging,
      pointId: 'store_warehouse'
    })
  }
}

function delProduct() {
  setHaptic();
  if (productCount.value > 1) {
    store.dispatch("updateProductQuantity", {
      id: props.product.id,
      quantity: productCount.value - 1,
      packaging: props.product.packaging,
      pointId: 'store_warehouse'
    })
  } else {
    store.dispatch("removeProductFromCart", {
      productId: props.product.id,
      packaging: props.product.packaging,
      pointId: 'store_warehouse'
    })
  }
}

function editProductQuantity() {
  setHaptic();
  if (productCount.value === 0) {
    inputValue.value = 1
    store.dispatch("addProductToCart", {
      product: {
        ...props.product,
        packaging: props.product.packaging,
        quantity: 1
      },
      pointId: 'store_warehouse'
    })
  } else {
    inputValue.value = null
    store.dispatch("removeProductFromCart", {
      productId: props.product.id,
      packaging: props.product.packaging,
      pointId: 'store_warehouse'
    })
  }
}

function handleClickOutside(event: MouseEvent) {
  if (inputRef.value && !inputRef.value.contains(event.target as Node)) {
    inputRef.value.blur();
  }
}

</script>

<template>
  <div class="item-wrapper">
    <div class="up">
      <div class="item-img">
        <img class="item-img-item" src="@/assets/zagotovka.svg">
      </div>
      <div class="descr-item">
        <div class="label-packaging">
          <p class="label">{{props.product.name}}</p>
        </div>
        <div class="packaging">
          {{ props.product.packaging[0].name}}
        </div>
      </div>
    </div>

    <div class="input-wrapper" v-if="isAdded">
      <input
        ref="inputRef"
        class="text"
        id="msg"
        type="text"
        inputmode="decimal"
        pattern="[0-9,]*"
        v-model="inputValue"
        @input="handleInput"
      />
    </div>

    <div class="btns" :style="{gap: isAdded ? '10px' : '0'}">
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
      <button
          type="button"
          class="btn btn-deleted-cart"
          :class="{ 'is-added': isAdded }"
          :style="{backgroundColor : 'var(--red-color)'}"
          @click="editProductQuantity()"
        >
        <span class="add-to-cart-text">УДАЛИТЬ</span>
      </button>
    </div>
  </div>
</template>

<style scoped>

input.text {
  background-color: inherit;
  font-size: 30px;
  padding: 0px;
  font-family: inherit;
  margin: 0;
  border: none;
  outline: none;
  width: 100%;
  text-align: center;
  border-radius: var(--border-radius);
}

.input-wrapper {
  width: 100%;
  height: 40px;
  background-color: white;
  border-radius: var(--border-radius);
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  background: none;
  font-family: inherit;
  height: 40px;
  font-size: 14px;
  color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  line-height: 18px;
  transition: all .3s ease;
  position: relative;
  overflow: hidden;
}

.btn-deleted-cart {
  width: 0;
}

.btn-deleted-cart.is-added {
  width: 50%;
}

.btn-add-to-cart {
  background-color: var(--orange-color);
  width: 100%;
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
  width: 50%;
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
  width: 50%;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.select-packaging {
  background-color: inherit;
  border: 1px solid black;
  border-radius: 5px;
  width: 100%;
  font-family: inherit;
  font-size: 15px;
  padding-left: 10px;
  padding-right: 10px;
}

.select-packaging:disabled {
  cursor: not-allowed;
}

.btns {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  transition: all .3s ease;
}

.packaging {
  font-size: 14px;
  font-weight: 500;
  color: #8E8E92;
  width: 100%;
  text-align: start;
}

.label {
  color: black;
  font-size: 16px;
  font-weight: 500;
  text-align: start;
}

.label-packaging {
  display: flex;
  width: 100%;
  align-items: start;
  justify-content: space-between;
}

.descr-item {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.count-absolute {
  color: black;
  font-size: 30px;
  padding: 3px 8px;
  border-radius: var(--border-radius);
}

.item-img-item{
  width: 50px;
  max-width: 131px;
}

.item-img{
  display: flex;
  position: relative;
  justify-content: center;
}

.up {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;
  position: relative;
}

.item-wrapper{
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: var(--grey-color);
  padding: 10px 17px;
  gap: 10px;
  border-radius: var(--border-radius);
  transition: all .3s ease;
}

</style>
