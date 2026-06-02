<script setup lang="ts">
import {ProductInReceiving} from '@/models/receiving/productForReceiving';

const props = defineProps<{
  product: ProductInReceiving,
  index: number,
  isLast: boolean,
  isEdit: boolean,
}>();

const emit = defineEmits<{
  (e: 'edit_product', value: {value: string, name: string, id: string}): void
}>()

function editProduct(value: string) {
  emit('edit_product', {value: value, name: props.product.name, id: props.product.packaging.id})
}

</script>


<template>

  <div class="item-wrapper" :style="{ marginTop: props.index === 0 ? '10px' : '0' }">
    <div class="left">
      <svg class="img" width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M51.875 21.875C51.7822 18.5973 51.4702 16.5076 50.4194 14.7243C48.9247 12.1881 46.2331 10.7767 40.8496 7.9538L35.8457 5.32992C31.4533 3.02665 29.2571 1.875 26.8945 1.875C24.5319 1.875 22.3357 3.02665 17.9433 5.32992L12.9394 7.9538C7.55601 10.7767 4.86431 12.1881 3.36967 14.7243C1.875 17.2606 1.875 20.4167 1.875 26.7287V27.0213C1.875 33.3333 1.875 36.4895 3.36967 39.0258C4.86431 41.562 7.55601 42.9733 12.9394 45.7963L17.9433 48.42C22.3357 50.7233 24.5319 51.875 26.8945 51.875C29.2571 51.875 31.4533 50.7233 35.8457 48.42L40.8496 45.7963C46.2331 42.9733 48.9247 41.562 50.4194 39.0258C51.4702 37.2423 51.7822 35.1528 51.875 31.875M49.4121 15.625L39.4043 20.625M39.4043 20.625C39.4043 20.625 38.6419 21.0059 38.1533 21.25C33.7564 23.4468 26.8945 26.875 26.8945 26.875M39.4043 20.625V29.375M39.4043 20.625L15.6357 8.125M26.8945 26.875L4.37695 15.625M26.8945 26.875V50.625" stroke="black" stroke-width="3.75" stroke-linecap="round"/>
      </svg>
      <div class="description-wrapper">
        <p class="label" :style="{ maxWidth: props.isEdit ? '192px' : '270px' }">{{ props.product.name }}</p>
        <p class="description">{{ props.product.description }}</p>
      </div>
    </div>
    <div class="right">
      <p class="packaging">{{ props.product.packaging.name }}</p>
      <p class="quantity">{{ props.product.receivedQuantity}}</p>
      <Transition
        name="fade"
      >
        <div class="buttons-wrapper" v-if="props.isEdit">
          <button
            type="button"
            class="btn btn-del"
            :class="{ 'is-added': true }"
            @click="editProduct('del')"
          >
          </button>
          <button
            type="button"
            class="btn btn-add-to-cart"
            :class="{ 'is-added': true }"
            @click="editProduct('add')"
          >
          <span class="add-to-cart-text">ДОБАВИТЬ</span>
          </button>
        </div>
      </Transition>
    </div>
  </div>

</template>


<style scoped>


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
  transition: all .7s ease;
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
  font-size: 30px;
  font-weight: 500;
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
  transition: all .7s ease;
}

.img {
  width: 50px;
}

.scan-progress {
  position: absolute;
  top: 0;
  left: 0;
}

.item-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  width: 95%;
  height: 80px;
  background-color: #F2F2F2;
  flex-shrink: 0;
  transition: all .3s ease;
  overflow: hidden;
}

</style>