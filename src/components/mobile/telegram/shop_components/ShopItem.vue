<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import Product, { ProductWithPackaging } from '@/models/product';
import { setHaptic } from '@/tools/setTelegramHaptick';
import iconMapping from '@/models/iconmapping'
import icons from '@/models/icons'
import { Packaging } from '@/models/packaging';

const store = useStore();

const props = defineProps<{
  product: Product,
  pointId: number,
  description: string
}>()

const selectPackaging = ref<Packaging>(props.product.packaging[0]);

watch(() => props.product, (product) => {
  selectPackaging.value = product.packaging[0];
})

const productsInCart = computed(() => store.getters.getCartItemsByPoint(props.pointId) ?? []);

const productCount = computed(() => {
  const productInCart: ProductWithPackaging = productsInCart.value.find((item: ProductWithPackaging) => 
    (item.id === props.product.id) && (item.packaging.id === selectPackaging.value.id)
  );
  console.log('productInCart=', productInCart)
  return productInCart ? productInCart.quantity : 0;
});

const iconPath = computed(() => icons[iconMapping[props.product.description.split(';')[0].trim()]] || '');

const isAdded = ref(false)

watch(productCount, (count) => {
  isAdded.value = count > 0
}, { immediate: true })

function addProduct() {
  setHaptic();
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
  setHaptic();
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

  <div class="item-wrapper">
    <div class="item-img">
      <img v-if="iconPath" class="item-img-item" :src="iconPath">
      <div class="count-absolute" v-if="productCount > 0" >{{ productCount }}</div>
    </div>
    <div class="descr-item">
      <div class="label-packaging">
        <p class="label">{{props.product.name}}</p>
      </div>
      <p class="description">{{ props.description }}</p>
      <select 
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
<!--       
      <div class="btn-add" v-if="productCount == 0" @click="setHaptic(); addProduct()">
        ДОБАВИТЬ
      </div>
      <div class="btns-plus-minus" v-else>
        <div class="minus" @click="setHaptic(); delProduct()">
          <p class="minus-icon">-</p>
        </div>
        <div class="plus" @click="setHaptic(); addProduct()">
          <p class="plus-icon">+</p>
        </div>
      </div> -->
    </div>
  </div>

</template>

<style scoped>


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
  width: 157px;
  margin-top: 30px;
  justify-content: center;
  align-items: center;
}

.description{
  font-size: 14px;
  font-weight: 500;
  color: #8E8E92;
  text-align: start;
  max-width: 100px;
}

.packaging {
  font-size: 14px;
  font-weight: 500;
  color: #8E8E92;
}

.label {
  color: black;
  font-size: 16px;
  font-weight: 500;
  max-width: 100px;
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
  width: 90%;
}

.count-absolute {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--orange-color);
  color: white;
  font-size: 16px;
  padding: 3px 8px;
  border-radius: var(--border-radius);
}

.item-img-item{
  width: 30vw;
  max-width: 131px;
}

.item-img{
  display: flex;
  position: relative;
  width: 100%;
  justify-content: center;
}

.item-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: var(--grey-color);
  padding: 5px 4px;
  border-radius: var(--border-radius);
}

</style>
