<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import store from '@/store'
import icons from '@/models/icons'
import iconMapping from '@/models/iconmapping'
import packagingMap from '@/models/packaging'
import { Item } from '@/models/order_scan_models/orderScan'

const props = defineProps<{
  item: Item,
  index: number,
  isLast: boolean,
  isEdit: boolean,
}>();

const emit = defineEmits<{
  (e: 'edit_product', value: string, name: string, barcode: string): void
}>()

const iconPath = computed(() => icons[iconMapping[props.item.description.split(';')[0].trim()]] || '');
const packaging = computed(() => packagingMap[props.item.packaging] || props.item.packaging);
const statusrColor = computed(() => {
  if (props.item.orderQuantity === props.item.scannedQuantity) {
    return 'var(--green-color)'
  }
  if (props.item.scannedQuantity !== 0) {
    return 'var(--orange-color)'
  }
  else {
    return 'var(--blue-color)'
  }
})

function editProduct(value: string) {
  emit('edit_product', value, props.item.name, props.item.barcode)
}

</script>


<template>

  <div class="item-wrapper" 
    :style="{ 
      marginTop: props.index === 0 ? '10px' : 0, marginBottom: props.isLast ? '10px' : '0',
      border: `1px solid ${statusrColor}`
    }">
    <svg class="scan-progress" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H40L0 40V0Z" :fill="statusrColor"/>
    </svg>
    <div class="left">
      <img class="img" :src="iconPath">
      <div class="description-wrapper">
        <p class="label" :style="{ maxWidth: props.isEdit ? '192px' : '270px' }">{{ props.item.name }}</p>
        <p class="description">{{ props.item.description }}</p>
      </div>
    </div>
    <div class="right">
      <p class="quantity" :style="{ color: statusrColor }">{{ props.item.scannedQuantity }}/{{ props.item.orderQuantity }}</p>
      <p class="packaging">{{ packaging }}</p>
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