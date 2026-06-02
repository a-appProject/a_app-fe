<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useStore } from 'vuex';
import { setHaptic } from "@/tools/setTelegramHaptick";
import icons from '@/models/icons'
import iconMapping from '@/models/iconmapping'
import { ProductWithPackaging } from '@/models/product';

const store = useStore();

const props = defineProps<{ 
  item: any
  editOrder: boolean,
}>();

const emit = defineEmits<{
  (e: 'addQuantityProductInOrder', value: number): void,
  (e: 'delQuantityProductInOrder', value: number): void,
  (e: 'removeProductInOrder', value: number): void,
}>()

const iconPath = computed(() => icons[iconMapping[props.item.product.description.split(';')[0].trim()]] || '');

//Логика редактирования товара в заказе
function addProductOrder() {
  emit('addQuantityProductInOrder', props.item.product.id)
}

function minProductOrder() {
  emit('delQuantityProductInOrder', props.item.product.id)
}

function delProductOrder() {
  emit('removeProductInOrder', props.item.product.id)
}


</script>

<template>
  <Transition name="fade">
    <div class="cart-item">
      <div class="cart-item-wrapper-up">
        <div class="cart-left">
          <div class="icon-item">
            <p class="item-quantity">{{ props.item.quantity }}x</p>
            <img v-if="iconPath" class="item-img-item" :src="iconPath">
          </div>
          <div class="descr-item">
            <div class="cart-item-up">
              <p class="item-name">{{ props.item.product.name }}</p>
            </div>
            <p class="item-description">{{ props.item.product.description }}</p>
          </div>
        </div>
        <div class="package-item">
          <p class="item-packaging">{{ props.item.product.packaging }}</p>
        </div>
      </div>
      <Transition name="fade">
        <div class="edit-btn-wrapper" v-if="props.editOrder">
          <button type="button" class="btn min" @click="setHaptic(); minProductOrder()">
          </button>
          <button type="button" class="btn plus" @click="setHaptic(); addProductOrder()">
          </button>
          <button type="button" class="btn del" @click="setHaptic(); delProductOrder()">
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>

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
  right: -15px;
  transform: translateY(-50%);
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
  white-space: nowrap;
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
