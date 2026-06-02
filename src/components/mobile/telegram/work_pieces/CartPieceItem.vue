<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from 'vuex';
import Product from '@/models/product';
import { setHaptic } from "@/tools/setTelegramHaptick";

const store = useStore();

const props = defineProps<{ 
  item: Product
  editRef: boolean,
  point_id: string
}>();

const inputValue = ref<string | number | null>(props.item.quantity)
const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function handleClickOutside(event: MouseEvent) {
  if (inputRef.value && !inputRef.value.contains(event.target as Node)) {
    inputRef.value.blur();
  }
}

watch(() => props.item.quantity, (count: number | null) => {
  if (count) {
    if (count > 0) {
      inputValue.value = count
    } else if (count === 0) {
      inputValue.value = null
    }
  } 
}, { immediate: true })

function addProduct() {
  setHaptic();
  if (props.item.quantity === 0) {
    store.dispatch("addProductToCart", {
      product: {
        ...props.item,
        packaging: props.item.packaging,
        quantity: 1
      },
      pointId: props.point_id
    })
  } else {
    store.dispatch("updateProductQuantity", {
      id: props.item.id,
      quantity: props.item.quantity + 1,
      packaging: props.item.packaging,
      pointId: props.point_id
    })
  }
}

function minProduct() {
  setHaptic();
  if (props.item.quantity > 1) {
    store.dispatch("updateProductQuantity", {
      id: props.item.id,
      quantity: props.item.quantity - 1,
      packaging: props.item.packaging,
      pointId: props.point_id
    })
  } else {
    store.dispatch("removeProductFromCart", {
      productId: props.item.id,
      packaging: props.item.packaging,
      pointId: props.point_id
    })
  }
}

function delProduct() {
  setHaptic();
  store.dispatch("removeProductFromCart", {
    productId: props.item.id,
    packaging: props.item.packaging,
    pointId: props.point_id
  })
}

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
      id: props.item.id,
      quantity: numericValue,
      packaging: props.item.packaging,
      pointId: 'store_warehouse'
    });
  } 
}


</script>

<template>
  <Transition name="fade">
    <div class="cart-item">
      <div class="cart-item-wrapper-up">
        <div class="cart-left">
          <div class="icon-item">
            <p class="item-quantity">{{ props.item.quantity }}x</p>
            <img class="item-img-item" src="@/assets/zagotovka.svg">
          </div>
          <div class="descr-item">
            <div class="cart-item-up">
              <p class="item-name">{{ props.item.name }}</p>
            </div>
          </div>
        </div>
        <div class="package-item">
          <p class="item-packaging">{{ props.item.packaging[0].name }}</p>
        </div>
      </div>

      <Transition name="fade">
        <div class="input-wrapper" v-if="props.editRef">
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
      </Transition>

      <Transition name="fade">
        <div class="edit-btn-wrapper" v-if="props.editRef">
          <button type="button" class="btn min" @click="minProduct()">
          </button>
          <button type="button" class="btn plus" @click="addProduct()">
          </button>
          <button type="button" class="btn del" @click="delProduct()">
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>

input.text::placeholder {
  color: #B9B9B9;
}

input.text {
  background-color: inherit;
  font-size: 30px;
  padding: 0px;
  font-family: inherit;
  margin: 0;
  border: none;
  outline: none;
  width: 100%;
  margin-left: 10px;
  border-radius: var(--border-radius);
  text-align: center;
}

.input-wrapper {
  width: 100%;
  height: 40px;
  background-color: #EFEFF3;
  border-radius: var(--border-radius);
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-btn-wrapper{
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  height: 40px;
  width: 30%;
  font-size: 20px;
  color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  line-height: 18px;
  transition: all .3s ease;
  position: relative;
  overflow: hidden;
}

.del{
  background-color: var(--red-color);
}

.plus{
  background-color: var(--green-color);
}

.min{
  background-color: var(--orange-color);
}

.del::after {
  display: inline-block;
  position: absolute;
  content: '';
  background-image: url('@/assets/delet.svg');
  background-repeat: no-repeat;
  background-position: center center ;
  top: 0;
  left: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  transition: all .3s ease;
  z-index: 1;
}

.min::before,
.plus::after,
.plus::before{
  display: inline-block;
  position: absolute;
  content: '';
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  width: 14px;
  height: 3px;
  background-color: #fff;
  border-radius: 1px;
  transition: all .3s ease;
  z-index: 1;
}

.plus::after {
  transform: rotate(90deg);
}

.btn:active {
  transform: var(--transform-scale-active);
}

.package-item{
  display: flex;
  align-items: center;
}

.cart-left{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.cart-item-up {
  display: flex;
  gap: 5px;
  align-items: start;
  height: 100%;
}

.descr-item{
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.item-quantity{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--orange-color);
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 3px 8px;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
}

.item-packaging  {
  font-size: 14px;
  color: black;
  margin-right: 5px;
}

.item-description {
  font-size: 11px;
  color: #8E8E92;
  text-align: start;
}

.item-name {
  font-size: 14px;
  color: black;
  font-weight: 600;
  text-align: start;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
  max-width: 182px;
}

.item-img-item{
  width: 47px;
}

.icon-item{
  position: relative;
  max-width: 47px;
  max-height: 47px;
}

.cart-item-wrapper-up {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.cart-item {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 10px;
}

</style>
