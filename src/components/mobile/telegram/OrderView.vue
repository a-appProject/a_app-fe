<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import router from "@/router";
import { useStore } from "vuex";
import {useRoute} from "vue-router";
import { setHaptic } from "@/tools/setTelegramHaptick";
import { setBackButton, hideBackButton, setBottomButton, hideBottomButton } from '@/tools/setTelegramButtons';
import { getOrderById, editOrderStatus, getStatisticByOrder, editOrderById } from '@/composables/orderWorkerk';
import {formatDate, getTimeDifference} from '@/tools/tools'
import { createPopupManager } from '@/tools/setTelegramPopUp'
import Order from '@/models/order';
import OrderViewItem from "@/components/mobile/telegram/order_components/OrderViewItem.vue";

const point_uuid = ref();
const point_id = ref();
const id = ref();
const isAdmin = ref();
const date_create = ref();
const date_assembl = ref();
const date_completed = ref();
const date_delivered = ref();
const date_on_way = ref();
const store = useStore();
const editOrder = ref(false);
const order = ref<Order | null>(null); 
let mainButtonListener: (() => void) | null = null;
const popupManager = createPopupManager();

const handleMainButton = async () => {
  console.log('Нажата основная кнопка');
  setHaptic();

  if (order.value?.status == 'Новый' && (store.getters.USER.role == 'warehouse' || store.getters.USER.role == 'admin' || store.getters.USER.role == 'warehouse_driver' || store.getters.USER.role == 'warehouse_driver_loader')) {
    await editOrderStatusById('В сборке');
    return;
  }
  else if(order.value?.status == 'В сборке' && (store.getters.USER.role == 'warehouse' || store.getters.USER.role == 'admin' || store.getters.USER.role == 'warehouse_driver' || store.getters.USER.role == 'warehouse_driver_loader')) {
    router.push(`/order_scan_component?point_id=${point_id.value}&order_id=${id.value}&context=warehouse`);
    return;
  }
  else if(order.value?.status == 'Собран' && (store.getters.USER.role == 'driver' || store.getters.USER.role == 'admin' || store.getters.USER.role == 'warehouse_driver' || store.getters.USER.role == 'warehouse_driver_loader')) {
    await editOrderStatusById('В пути');
    return;
  }
  else if(order.value?.status == 'В пути' && (store.getters.USER.role == 'loader' || store.getters.USER.role == 'admin' || store.getters.USER.role == 'warehouse_driver' || store.getters.USER.role == 'warehouse_driver_loader')) {
    router.push(`/order_scan_component?point_id=${point_id.value}&order_id=${id.value}&context=point`);
    return;
  }
  else {
    router.push('/')
  }

};


onMounted(async() => {
  setBackButton();
  //id заказа
  id.value = Number(useRoute().query.id);
  //id точки
  point_id.value = Number(useRoute().query.point_id);
  //uuid точки
  point_uuid.value = useRoute().query.point_uuid;
  //параметр для отображения статистики
  isAdmin.value = useRoute().query.isAdmin?.toString();

  if (isAdmin.value == 'true') {
    await getStatByOrderId(id.value);
  }
  
  if(id.value) {
    await getOrder(point_id.value, id.value);
  }
})

onUnmounted(() => {
  hideBackButton();
  hideBottomButton();
});

//Получение конкретного заказа по id
async function getOrder(point_id: number, order_id: number) {
  order.value = await getOrderById(point_id, order_id);
  console.log('order.value=', order.value)
  if (!order.value) {
    console.log('Заказ не найден')
    popupManager.openPopup(`Такой заказ не найден`,
      (buttonId) => {
        console.log("Нажата кнопка:", buttonId);
        if (buttonId === 'cancel') {
          router.push('/')
          popupManager.cleanup();
        }
      },
    );
    return null;
  }
  checkAndSetBtn();
}

const STATUS_CONFIG = {
  'Новый': {
    roles: ['warehouse', 'admin', 'warehouse_driver', 'warehouse_driver_loader'],
    label: 'В сборке',
  },
  'В сборке': {
    roles: ['warehouse', 'admin', 'warehouse_driver', 'warehouse_driver_loader'],
    label: 'Сканировать товары',
  },
  'Собран': {
    roles: ['driver', 'admin', 'warehouse_driver', 'warehouse_driver_loader'],
    label: 'Забрал заказ',
  },
  'В пути': {
    roles: ['loader', 'admin', 'warehouse_driver_loader'],
    label: 'Разгружаю',
  },  
};

function checkAndSetBtn() {
  const role = store.getters.USER.role;
  const status = order.value!.status;

  if (!status) {
    mainButtonListener = handleMainButton;
    setBottomButton('На главную', '31B545', 'FFFFFF', handleMainButton)
    return;
  }

  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  if (config && config.roles.includes(role)) {
    mainButtonListener = handleMainButton;
    setBottomButton(config.label, '31B545', 'FFFFFF', handleMainButton)
  } else {
    mainButtonListener = handleMainButton;
    setBottomButton('На главную', '31B545', 'FFFFFF', handleMainButton)
  }
}

//Редактирования заказа
const functEditOrder = () => {
  if (order.value?.status == 'Новый' || order.value?.status == 'В сборке') {
    hideBottomButton();
    editOrder.value = !editOrder.value;
    if (editOrder.value == false) {
      edtitOrder();
    } 
  }
}

function addQuantityProductInOrder(product_id: number) {
  if (!order.value) return;
  
  const targetItem = order.value.products.find(
    (product) => product.product.id === product_id
  );
  
  if (targetItem) {
    targetItem.quantity++;
  }
}

async function delQuantityProductInOrder(product_id: number) {
  if (!order.value) return;
  
  const targetItem = order.value.products.find(
    (product) => product.product.id === product_id
  );
  
  if (targetItem && targetItem.quantity > 0) {
    targetItem.quantity--;
    
    if (targetItem.quantity === 0) {
      removeProductInOrder(product_id);
    }
  }
}

function removeProductInOrder(product_id: number) {
  if (!order.value) return;
  
  order.value.products = order.value.products.filter(
    (product) => product.product.id !== product_id
  );
}

//Форматированные товары в заказе для запроса
const formattedOrderItems = () => {
  return order.value!.products.map((product) => ({
    name: product.product.name,
    quantity: product.quantity,
    containerId: product.product.packaging.id
  }))
}

//Функция редактирования заказа 
async function edtitOrder() {

  hideBottomButton();

  try{
    const formatItmes = formattedOrderItems();
    const params = { order_id: id.value, comment: order.value!.comment, products: formatItmes}
    const result = await editOrderById(point_id.value, params);

    if(result) {
      console.log('Успешно изменили заказ:', result)
      setTimeout(() => {
        popupManager.openPopup(`Успешно изменили заказ`,
          (buttonId) => {
            console.log("Нажата кнопка:", buttonId);
          },
        );
      },100);
      checkAndSetBtn();
    }
  }
  catch(error) {
    hideBottomButton();
    popupManager.openPopup(`Не удалось изменить заказ. Попробуйте ещё раз.`,
      (buttonId) => {
        console.log("Нажата кнопка:", buttonId);
      },
    );
    console.error('Ошибка создания заказа:', error);

  }
}

//Получение статистики по заказу
async function getStatByOrderId(order_id: number | null) {
  const data = await getStatisticByOrder(point_id.value, order_id)
  if (data)  {
    date_create.value = data[0].date_create;
    date_assembl.value = data[0].date_assembl;
    date_completed.value = data[0].date_completed;
    date_delivered.value = data[0].date_delivered;
    date_on_way.value = data[0].date_on_way;
  }
}

//Изменить статус заказа
async function editOrderStatusById(status: string){

  hideBottomButton();
  const params = {order_id: order.value!.id, status}
  const data = await editOrderStatus(point_id.value, params)
  if (data) {
    setTimeout(() => {
      popupManager.openPopup(`Статус заказа изменён на ${status}`,
        (buttonId) => {
          console.log("Нажата кнопка:", buttonId);
        },
      );
    },100);
    hideBottomButton();
    getOrder(point_id.value, id.value);
  }
}


const editOrderReact = computed(() => {
  if (id.value) {
    if (store.getters.USER.role == 'warehouse' || store.getters.USER.role == 'admin' || store.getters.USER.role == 'warehouse_driver') {
      if (order.value?.status == 'Новый' || order.value?.status == 'В сборке') {
        return true;
      }
      else {
        return false;
      }
    }
    else {
        return false;
      }
  }
  else {
    return false;
  }
});


</script>

<template>
  <div class="order-back">
    <div class="order-wrapper">
      <div class="order-header">
        <p class="name-order">Заказ #{{ id }}</p>
        <p class="edit-order" :style="{ color: order?.status === 'Доставлен' ? 'var(--green-color)' : 'var(--orange-color)' }">{{ order?.status }}</p>
        <p v-if="editOrderReact" class="edit-order" :style="{ color: editOrder ? 'var(--orange-color)' : 'var(--green-color)' }" @click="functEditOrder()">{{ editOrder ? 'Подтвердить' : 'Редактировать' }}</p>
      </div>
      <div class="order-items">
        <!-- Комопннет заказа -->
        <OrderViewItem v-for="item in order?.products"
          :item="item"
          :edit-order="editOrder"
          @addQuantityProductInOrder="addQuantityProductInOrder"
          @delQuantityProductInOrder="delQuantityProductInOrder"
          @removeProductInOrder="removeProductInOrder"
        />
      </div>
      <div class="input-wrapper" v-if="order?.comment">
       <p class="comment">{{ order?.comment }}</p>
      </div>
      <div class="statistic-wrapper" v-if="isAdmin">
        <div class="first-section">
          <div class="left">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" :style="{ fill: 'var(--orange-color)', 'margin-top': '7px' }" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="5"/>
            </svg>
            <img src="@/assets/line.svg">
          </div>
          <div class="right">
            <p class="date-create">Создан : {{ formatDate(date_create) }}</p>
          </div>
        </div>
        <div class="between" v-if="date_assembl">
          {{ getTimeDifference(date_create, date_assembl) }}
        </div>
        <div class="second-section" :style="{'align-items': 'center'}" v-if="date_assembl">
          <div class="left">
            <img src="@/assets/line.svg">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" :style="{ fill: 'var(--orange-color)'}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="5"/>
            </svg>
            <img src="@/assets/line.svg">
          </div>
          <div class="right">
            <p class="date-create">Начали собирать : {{ formatDate(date_assembl) }}</p>
          </div>
        </div>
        <div class="between" v-if="date_completed">
          {{ getTimeDifference(date_assembl, date_completed) }}
        </div>
        <div class="second-section" :style="{'align-items': 'center'}" v-if="date_completed">
          <div class="left">
            <img src="@/assets/line.svg">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" :style="{ fill: 'var(--orange-color)'}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="5"/>
            </svg>
            <img src="@/assets/line.svg">
          </div>
          <div class="right">
            <p class="date-create">Собрали : {{ formatDate(date_completed) }}</p>
          </div>
        </div>
        <div class="between" v-if="date_on_way">
          {{ getTimeDifference(date_completed, date_on_way) }}
        </div>
        <div class="second-section" :style="{'align-items': 'center'}" v-if="date_on_way">
          <div class="left">
            <img src="@/assets/line.svg">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" :style="{ fill: 'var(--orange-color)'}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="5"/>
            </svg>
            <img src="@/assets/line.svg">
          </div>
          <div class="right">
            <p class="date-create">Поехал : {{ formatDate(date_on_way) }}</p>
          </div>
        </div>
        <div class="between" v-if="date_delivered">
          {{ getTimeDifference(date_on_way, date_delivered) }}
        </div>
        <div class="second-section" :style="{'align-items': 'center'}" v-if="date_delivered">
          <div class="left">
            <img src="@/assets/line.svg">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" :style="{ fill: 'var(--green-color)'}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="5"/>
            </svg>
          </div>
          <div class="right">
            <p class="date-create">Доставили : {{ formatDate(date_delivered) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.between{
  background-color: var(--grey-color);
  font-size: 18px;
  font-weight: 500;
  padding: 5px 10px;
  margin-top: 10px;
  border-radius: var(--border-radius);
  width: 95px;
}

.date-create{
  font-size: 18px;
  font-weight: 500;
}

.right{
  display: flex;
}

.left{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-left: 20px;
}

.first-section, .second-section{
  display: flex;
  align-items: start;
  width: 100%;
  justify-content: space-between;
  margin-top: 10px;
}

.statistic-wrapper{
  color: black;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-self: start;
  justify-content: center;
  width: 100%;
  margin-bottom: 50px;
}

.btn-edit-order{
  margin-top: 30px;
  background-color: var(--orange-color);
  border-radius: var(--border-radius);
  padding: 15px 100px;
  font-weight: 400;
}

.comment {
  background-color: inherit;
  font-size: 16px;
  padding: 0px;
  font-family: inherit;
  margin: 0;
  border: none;
  outline: none;
  width: 100%;
  margin-left: 10px;
  color: #B9B9B9;
  text-align: start;
}

.btn-toshop{
  margin-top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 20px;
  color: black;
}

input.text::placeholder {
  color: #B9B9B9;
}

input.text {
  background-color: inherit;
  font-size: 16px;
  padding: 0px;
  font-family: inherit;
  margin: 0;
  border: none;
  outline: none;
  width: 100%;
  margin-left: 10px;
}

.input-wrapper{
  margin-top: 30px;
  width: 100%;
  height: 50px;
  background-color: #EFEFF3;
  border-radius: var(--border-radius);
  display: flex;
  justify-content: center;
  align-items: center;
}

.order-items{
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  width: 100%;
  gap: 15px;
}

.edit-order{
  font-size: 15px;
  color: var(--green-color);
  font-weight: 600;
}

.name-order{
  font-size: 18px;
  color: black;
  font-weight: 600;
}

.order-header{
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.order-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
}

.order-back {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>