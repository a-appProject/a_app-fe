<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { setHaptic } from '@/tools/setTelegramHaptick';
import OrdersList from '@/components/mobile/telegram/order_components/OrdersList.vue';
import { useStore } from 'vuex';
import router from "@/router";
import Order from "@/models/order";
import { getAllPoints } from '@/composables/itemWorker'
import { getOrdersByPoint } from '@/composables/orderWorkerk'

type Point = {
  id: number,
  name: string,
  counteragent_id: string,
  uuid: string
}

const store = useStore();
const styleBtnAll = ref('');
const orders = ref<Order[]>([]); 
const points = ref<Point[]>([]);
const selectedPoint = ref<Point | null>(null);

onMounted(async() => {
  await getPoints();
})

//Получить все точки
async function getPoints() {
  points.value = await getAllPoints();
}

//Получить заказы на точке
async function getOrderAllOrdersByPoint(point_id: number) {
  orders.value = await getOrdersByPoint(point_id); 
}

//Выбрать конкретную точку
async function selectPoint(point: Point | undefined) {
  if (point) {
    selectedPoint.value = point;
    await getOrderAllOrdersByPoint(point.id);
    styleBtnAll.value = point ? 'background-color: var(--green-color);' : '';
  }
}

//Управление стилями кнопок
function buttonStyle(point: string) {
  return selectedPoint.value?.uuid === point ? 'background-color: var(--green-color); color: white' : 'color: var(--blue-color)';
}


//Обработка нажатий на кнопки
function btnClick(btn_id: string, param?: Point) {
  setHaptic();
  switch(btn_id) {
    case 'selectPoint':
      selectPoint(param);
      break;
    case 'goToItems': 
      router.push(`/shop?point_uuid=${selectedPoint.value?.uuid}&point_id=${selectedPoint.value?.id}`);
      break;
    case 'goToSettings':
      router.push('/settings');
      break;
    case 'goToReceipts':
      router.push('/receiving');
      break;
    case 'goToWorkpieces': 
      router.push('/work_pieces')
      break;
    default: 
      break;
  }
}

const renderBtnsPoints = ref<Boolean>(false)
const styleArrow = ref<String>('transform: rotate(90deg)')

function choosePoint() {
  if (renderBtnsPoints.value == false) {
    styleArrow.value = 'transform: rotate(270deg)'
  } else {
    styleArrow.value = 'transform: rotate(90deg)'
  }
  renderBtnsPoints.value = !renderBtnsPoints.value
}

// const mainButtonPressed = () => {
//   console.log('btn pressed')
// }

// function setMainBtn() {
//   setBottomButton('Корзина', '31B545', 'FFFFFF', mainButtonPressed)
// }

</script>

<template>
  <div class="home-wrapper">

    <Transition name="fade">
      <div class="btn-choose-point" v-if="store.getters.USER.role !== 'zagotovshik'">
        <div class="buttonnn" @click="choosePoint()">
          <p >ВЫБРАТЬ ТОЧКУ</p>
          <img class="arrow" :style="styleArrow" src="@/assets/arrow.svg">
        </div>
        <Transition name="fade">
          <div class="three-btns" v-if="renderBtnsPoints">
            <button
              type="button"
              v-for="point in points"
              :key="point.id"
              class="btn"
              :style="buttonStyle(point.uuid)"
              @click="btnClick('selectPoint', point)"
            >
              {{ point.name }}
            </button>
          </div>
        </Transition>
      </div>
    </Transition>

    <div class="second-section">
      <div class="btn-and-history">
        <Transition name="fade">
          <button v-if="selectedPoint !== null && (store.getters.USER.role === 'admin' || store.getters.USER.role === 'cass')"
            type="button"
            class="all-items-btn" 
            :style="styleBtnAll" 
            @click="btnClick('goToItems')"
          >
            ВЫБРАТЬ ТОВАРЫ
          </button>
        </Transition>

        <Transition name="fade">
          <div class="label-orders-wrapper" v-if="selectedPoint">
            <div class="label-orders">
              <p v-if="orders.length > 0">Заказы на точке {{ selectedPoint.name }}</p>
              <p v-else>На этой точке пока нет заказов</p>
            </div>
          </div>
        </Transition>

        <Transition name="fade">
          <div class="orders-by-point" v-if="selectedPoint">
            <div class="orders-list">
              <OrdersList
                v-for="(order, index) in orders"
                :key="order.id"
                :order="order"
                :isFirst="index === 0"
                :isLast="index === orders.length - 1"
                :isHistory="false"
                :point="selectedPoint"
                :isAdmin="false"
              />
            </div>
          </div>
        </Transition>
        <Transition name="fade">
          <button 
            v-if="store.getters.USER.role === 'admin'" 
            type="button"
            class="btn-settings" 
            @click="btnClick('goToSettings')"
          >
            НАСТРОЙКИ
          </button>
        </Transition>
        <Transition name="fade">
          <button 
            v-if="store.getters.USER.role === 'admin' || store.getters.USER.role === 'warehouse' || store.getters.USER.role === 'zagotovshik'" 
            type="button"
            class="btn-settings" 
            @click="btnClick('goToWorkpieces')"
          >
            ЗАГОТОВКИ
          </button>
        </Transition>
<!-- 
        <Transition name="fade">
          <button 
            v-if="store.getters.USER.role === 'admin' || store.getters.USER.role === 'warehouse' || store.getters.USER.role === 'zagotovshik'" 
            type="button"
            class="btn-settings" 
            @click="setMainBtn()"
          >
            ТЕСТ MAIN BUTTON
          </button>
        </Transition> -->

      </div>
    </div>
  </div>
</template>


<style scoped>

.arrow {
  transition: transform .3s ease;
}

.buttonnn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.btn-choose-point {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  box-shadow: var(--drop-shadow-2);
  border-radius: var(--border-radius);
  padding: 17px 0 17px 0;
  gap: 15px;
}

.label-orders-wrapper{ 
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 30px;
}

.settings-item{
  display: flex;
}

.head-bnt-first-line {
  font-size: 18px;
  font-weight: 600;
  color: black;
  width: 100%;
  text-align: start;
}

.label-orders{
  font-size: 18px;
  font-weight: 600;
  color: black;
}

.header-orders{
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.orders-by-point{
  width: 100%;
}

.orders-list{
  margin-top: 30px;
}

.all-items-btn{
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  background-color: #CCCCCC;
  padding-top: 17px;
  padding-bottom: 17px;
  margin-top: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  font-size: 18px;
  font-weight: 500;
  color: white;
  transition: all .3s ease;
}

.btn-settings{
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  background-color: var(--orange-color);
  padding-top: 17px;
  padding-bottom: 17px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  font-size: 18px;
  font-weight: 500;
  color: white;
  margin-top: 30px;
  transition: all .3s ease;
}

.btn-and-history{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.second-section{
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
  border-radius: var(--border-radius);
}

.btn:active {
  transform: var(--transform-scale-active);
}

.all-items-btn:active {
  transform: var(--transform-scale-active);
}

.btn-settings:active {
  transform: var(--transform-scale-active);
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  background-color: var(--grey-color);
  font-size: 18px;
  font-weight: 600;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  width: 100%;
  padding: 17px;
  align-items: center;
  display: flex;
  justify-content: center;
  transition: all .3s ease;
}

.three-btns{
  /* display: grid;
  width: 100%;
  margin-top: 10px;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 20px;
  column-gap: 20px; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  width: 90%;
}

.home-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 430px;
}

</style>
