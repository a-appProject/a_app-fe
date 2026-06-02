<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import store from '@/store'
import icons from '@/models/icons'
import iconMapping from '@/models/iconmapping'
import { ProductWithPackaging } from '@/models/product';

const props = defineProps<{
  item: ProductWithPackaging,
  index: number,
  isLast: boolean,
  isEdit: boolean,
  pointId: number
}>();

const iconPath = computed(() => icons[iconMapping[props.item.description.split(';')[0].trim()]] || '');

const isAdded = ref(false);

const productsInCart = computed(() => {
  return store.getters.getCartItemsByPoint(props.pointId) || [];
});

const productCount = computed(() => {
  const productInCart: ProductWithPackaging = productsInCart.value.find((item: ProductWithPackaging) => 
    (item.id === props.item.id) && (item.packaging.id === props.item.packaging.id)
  );
  return productInCart ? productInCart.quantity : 0;
});

watch(productCount, (count) => {
  isAdded.value = count > 0
}, { immediate: true })

function addProduct() {
  if (productCount.value === 0) {
    store.dispatch("addProductToCart", {
      product: {
        ...props.item,
        packaging: props.item.packaging,
        quantity: 1
      },
      pointId: props.pointId
    })
  } else {
    store.dispatch("updateProductQuantity", {
      id: props.item.id,
      quantity: productCount.value + 1,
      packaging: props.item.packaging,
      pointId: props.pointId
    })
  }
}

function delProduct() {
  if (productCount.value > 1) {
    store.dispatch("updateProductQuantity", {
      id: props.item.id,
      quantity: productCount.value - 1,
      packaging: props.item.packaging,
      pointId: props.pointId
    })
  } else {
    store.dispatch("removeProductFromCart", {
      productId: props.item.id,
      packaging: props.item.packaging,
      pointId: props.pointId
    })
  }
}

</script>


<template>

  <div class="item-wrapper" :style="{ marginTop: props.index === 0 ? '10px' : 0, marginBottom: props.isLast ? '10px' : '0'}">
    <div class="left">
      <img class="img" :src="iconPath">
      <div class="description-wrapper">
        <p class="label">{{ props.item.name }}</p>
        <p class="description">{{ props.item.description }}</p>
      </div>
    </div>
    <div class="right">
      <Transition
        name="fade"
      >
        <div class="buttons-wrapper" v-if="props.isEdit">
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
      </Transition>
      <p class="packaging">{{ props.item.packaging.name }}</p>
      <p class="quantity">x{{ props.item.quantity }}</p>
    </div>
  </div>

</template>


<style scoped>

.select-packaging {
  background-color: inherit;
  border: 1px solid black;
  border-radius: 5px;
  width: 150px;
  font-family: inherit;
  font-size: 18px;
}

.select-packaging:disabled {
  cursor: not-allowed;
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

.right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  margin-right: 30px;
}

.left {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-left: 30px;
}

.packaging {
  font-size: 18px;
}

.description {
  font-size: 13px;
  color: #8E8E92;
}

.description-wrapper {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  gap: 5px;
}

.quantity {
  font-size: 20px;
  color: var(--orange-color);
}

.label {
  color: black;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
  white-space: nowrap;
  max-width: 192px;
}

.img {
  width: 50px;
}

.item-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  width: 95%;
  height: 90px;
  background-color: #F2F2F2;
  flex-shrink: 0;
  transition: all .3s ease;
}

</style>