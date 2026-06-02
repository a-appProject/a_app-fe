<script setup lang="ts">
import { computed } from 'vue';
import { Item } from '@/models/order_scan_models/orderScan'
import iconMapping from '@/models/iconmapping'
import packagingMap from '@/models/packaging'
import icons from '@/models/icons'
import { setHaptic } from '@/tools/setTelegramHaptick';

const props = defineProps<{
  item: Item,
  index: number,
  isEdit: boolean
}>();

const emit = defineEmits<{
  (e: 'editProduct', barcode: string, value: string): void,
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

function minProduct() {
  emit('editProduct', props.item.barcode, 'minProduct')
}

function addProduct() {
  emit('editProduct', props.item.barcode, 'addProduct')
}

const isEditItem = computed(() => {
  if (props.isEdit && props.item.scannedQuantity !== 0) {
    return true
  }
  else {
    return false
  }
})

</script>

<template>

  <div class="item-wrapper" :style="{ border: `1px solid ${statusrColor}` }" >
    <div class="quantity-wrapper" :style="{ backgroundColor: statusrColor }">
      <p class="item-quantity-scan">{{ props.item.scannedQuantity }}/</p>
      <p class="item-quantity-order">{{ props.item.orderQuantity }}</p>
    </div>
    <div class="item-wrapper-up">
      <div class="item-left">
        <img v-if="iconPath" class="item-img" :src="iconPath">
        <div class="item-descr">
          <div class="item-descr-up">
            <p class="item-descr-name">{{ props.item.name }}</p>
          </div>
          <p class="item-descr-description">{{ props.item.description }}</p>
        </div>
      </div>
      <p class="item-packaging-label">{{ packaging }}</p>
    </div>
    <div class="edit-btn-wrapper" v-if="isEditItem">
      <button type="button" class="btn min" @click="setHaptic(); minProduct()">
      </button>
      <button type="button" class="btn plus" @click="setHaptic(); addProduct()">
      </button>
    </div>
  </div>

</template>

<style scoped>

.item-packaging-label {
  font-size: 14px;
  color: black;
  margin-right: 5px;
}

.item-descr-description {
  font-size: 11px;
  color: #8E8E92;
}

.item-descr-name {
  font-size: 14px;
  color: black;
  font-weight: 600;
  text-align: start;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
  white-space: nowrap;
  max-width: 182px;
}

.item-descr-up {
  height: 100%;
}

.item-descr {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  gap: 5px;
}

.quantity-wrapper {
  position: absolute;
  bottom: -10px;
  left: -10px;
  z-index: 1;
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 3px 8px;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-left {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.item-wrapper-up {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: var(--border-radius-desktop);
  gap: 10px;
}

.item-img {
  width: 47px;
}

.edit-btn-wrapper{
  display: flex;
  width: 100%;
  gap: 10px;
  align-items: center;
  justify-content: space-around;
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  height: 40px;
  width: 100%;
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


</style>
