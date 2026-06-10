<script setup lang="ts">
import { onMounted, onUnmounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router'; 
import store from '@/store';
import { postEvent, on, off, type PopupButton } from '@tma.js/sdk-vue';
import { getOrderById, completeOrderById, saveProgressOrderById } from '@/composables/orderWorkerk';
import { setHaptic } from '@/tools/setTelegramHaptick';
import { createPopupManager } from '@/tools/setTelegramPopUp';
import { setBottomButton, hideBottomButton, setBottomSecondaryButton, hideBottomSecondaryButton } from '@/tools/setTelegramButtons';
import { OrderForScan } from '@/models/order_scan_models/orderScan'
import OrderItem from '@/components/mobile/telegram/order_scan_components/OrderItem.vue';
import router from '@/router';
import BarCode from '@/components/mobile/telegram/BarCode.vue';
import PopUpModal from '@/components/mobile/telegram/order_scan_components/PopUpModal.vue';
import PopUpModalInfoScanner from '@/components/mobile/telegram/PopUpModalInfoScanner.vue';
import { playSucces, playError } from '@/tools/soundManager';
import NotificationBorder from '@/components/NotificationBorder.vue';

const popupManager = createPopupManager();
const myRole = ref<string>('');
const context = ref<string>('');
const order = ref<OrderForScan>();
const pointId = ref<number>()
const isEdit = ref<boolean>(false);
const isOpenScanComponent = ref<boolean>(false);
const popUpModal = ref<boolean>(false);
const isClosingBecCompleated = ref<boolean>(false);
const openIfoScaner = ref<boolean>(false)

function editOrder(){
  isEdit.value = !isEdit.value;
}


function backButtonPressed() {
  if (openIfoScaner.value === true) {
    closePopInfo();
    return;
  }
  if (isOpenScanComponent.value === true) {
    closeScan();
  }
  else {
    if (router.currentRoute.value.meta?.allowBack !== false && window.history.length > 1) {
      router.go(-1);
    } else {
      router.push('/');
    }
  }
}

function mainButtonPressed() {
  isOpenScanComponent.value = true;
  hideBottomButton();
  hideBottomSecondaryButton();
}

async function getMyOrderById(point_id: number | null, order_id: number, role: string, context: string) {
  order.value = await getOrderById(point_id, order_id, role, context);
  setBottomButton('Сканировать товары', '007AFF', 'FFFFFF', mainButtonPressed, true);
  const allItemsScanned = order.value?.items.some(item => 
    item.scannedQuantity >= 1
  );
  console.log('allItemsScanned=', allItemsScanned)
  if (allItemsScanned) {
    setBottomSecondaryButton('Завершить', '31B545', 'FFFFFF', 'left', handleSecondaryButton);
  }
}

onMounted(async () =>{
  let point_id = Number(useRoute().query.point_id);
  let order_id = Number(useRoute().query.order_id);
  context.value = String(useRoute().query.context);
  console.log('context=', context)
  pointId.value = point_id;
  myRole.value = store.getters.USER.role;
  hideBottomButton();
  hideBottomSecondaryButton();
  await getMyOrderById(point_id, order_id, myRole.value, context.value);
  postEvent('web_app_setup_back_button', { is_visible: true });
  on('back_button_pressed', backButtonPressed);
})

onBeforeUnmount(async() => {
  if (isActiveToogle.value === true) {
    window.removeEventListener('keydown', handleKeyDown);
  }
  if (isClosingBecCompleated.value === false) {
    console.log('items in save progress:', order.value!.items)
    const data = await saveProgressOrderById(pointId.value!, order.value!.order_id, context.value, order.value!.items)
    if (data) {
      popupManager.openPopup(`Прогресс по заказу №${order.value?.order_id} сохранён`,() => {});
    }
  }
})

onUnmounted(() => {
  if (isActiveToogle.value === true) {
    window.removeEventListener('keydown', handleKeyDown);
  }
  postEvent('web_app_setup_back_button', { is_visible: false });
  off('back_button_pressed', backButtonPressed);
  hideBottomSecondaryButton();
  hideBottomButton();
})

function noneClick() {
  console.log('click')
}

async function completeOrder() {
  hideBottomSecondaryButton();
  setBottomButton('Ожидаем ответ', '31B545', 'FFFFFF', noneClick, false, true);
  const data = await completeOrderById(order.value!.order_id, context.value, order.value!.items);
  if (data) {
    popupManager.openPopup(`Статус заказа изменён на ${data.status}`,(buttonId) => {
      if (buttonId === 'cancel') {
        if (router.currentRoute.value.meta?.allowBack !== false && window.history.length > 1) {
          router.go(-1);
        } else {
          router.push('/');
        }
      }
    });
  }
}

function editProduct(barcode: string, value: string) {
  const targetItem = order.value?.items.find(item => item.barcode === barcode)
  
  if (targetItem) {
    switch(value) {
      case 'minProduct': 
        if (targetItem.scannedQuantity > 0) {
          targetItem.scannedQuantity--;
        }
        break;
      case 'addProduct': 
        targetItem.scannedQuantity++;
        break;
      default:
        break;
    }
  }
}

const notifBorder = ref<{color: string, borderHeight: number}>({color: '', borderHeight: 0});
const openNotif = ref<boolean>(false)

function openNotifBorder(value: string, color: string, borderHeight: number) {
  openNotif.value = true;
  if (value === 'succes') {
    playSucces();
  } else {
    playError();
  }
  notifBorder.value = {
    color, 
    borderHeight
  }
  setTimeout(() => {
    openNotif.value = false
  }, 2000)
}

function findItemByBarcode(barcode: string) {
  console.log('barcode=', barcode)
  console.log('order=', order)
  const targetItem = order.value?.items.find((item) => item.barcode === barcode)
  if (targetItem) {
    if (targetItem.scannedQuantity < targetItem.orderQuantity) {
      setHaptic();
      targetItem.scannedQuantity++;
      playSucces();
      openNotifBorder('succes', 'var(--green-color)', 5)
      // popupManager.openPopup(`Добавили товар ${targetItem.name} в заказ`,() => {},);
      // closeScan();
    }
    else {
      closeScan();
      window.removeEventListener('keydown', handleKeyDown);
      let buttons: PopupButton[];
      buttons = [
        {
          id: 'continue',
          text: 'Продолжить',
          type: 'default'
        },
        {
          id: 'cancel',
          type: 'close'
        }
      ];
      popupManager.openPopup(`Отсканировано больше, чем нужно. Продолжить?`,
        (buttonId) => {
          console.log('buttonId=', buttonId)
          if (buttonId === 'continue') {
            targetItem.scannedQuantity++;
            if (isActiveToogle.value === true) {
              window.addEventListener('keydown', handleKeyDown)
            }
          }
          if (buttonId === 'cancel') {
            if (isActiveToogle.value === true) {
              window.addEventListener('keydown', handleKeyDown)
            }
          }
        }, buttons
      );
    }
  }
  else {
    closeScan();
    window.removeEventListener('keydown', handleKeyDown);
    postEvent('web_app_trigger_haptic_feedback', { type: 'notification', notification_type: 'error' });
    openNotifBorder('error', 'var(--red-color)', 5)
    let buttons: PopupButton[];
    buttons = [
      {
        id: 'enterManual',
        text: 'Ввести вручную',
        type: 'default'
      },
      {
        id: 'cancel',
        type: 'close'
      }
    ];
    popupManager.openPopup(`Такой товар (${barcode}) не найден`,
      (buttonId) => {
        console.log('buttonId=', buttonId)
        if (buttonId === 'enterManual') {
          showPopUpModal();
        }
        if (buttonId === 'cancel') {
          if (isActiveToogle.value === true) {
            window.addEventListener('keydown', handleKeyDown)
          }
        }
      }, buttons
    );
  }
  const allItemsScanned = order.value?.items.some(item => 
    item.scannedQuantity >= 1
  );
  if (allItemsScanned) {
    setBottomSecondaryButton('Завершить', '31B545', 'FFFFFF', 'left', handleSecondaryButton);
  }
}

function handleSecondaryButton() {
  isClosingBecCompleated.value = true;
  completeOrder();
}

function showPopUpModal() {
  popUpModal.value = true;
  hideBottomButton();
  hideBottomSecondaryButton();
}

function closeScan() {
  isOpenScanComponent.value = false;
  postEvent('web_app_setup_back_button', { is_visible: true });
  setBottomButton('Сканировать товары', '007AFF', 'FFFFFF', mainButtonPressed, true)
  const allItemsScanned = order.value?.items.some(item => 
    item.scannedQuantity >= 1
  );
  if (allItemsScanned) {
    setBottomSecondaryButton('Завершить', '31B545', 'FFFFFF', 'left', handleSecondaryButton);
  }
}

function closePopUpModal() {
  popUpModal.value = false;
}

function findItem(value: string) {
  popUpModal.value = false;
  findItemByBarcode(value);
}

const isActiveToogle = ref<boolean>(false)
const styletoogle = ref<{left: string, right: string}>({left: '6px', right: ''})

watch(() => isActiveToogle.value, (newVal, oldVal) => {
  if (newVal === true && oldVal === false) {
    window.addEventListener('keydown', handleKeyDown)
    hideBottomButton();
  }

  else if (newVal === false && oldVal === true) {
    window.removeEventListener('keydown', handleKeyDown)
    setBottomButton('Сканировать товары', '007AFF', 'FFFFFF', mainButtonPressed, true);
  }
}, { immediate: true })

//Логика работы сканера
let buffer = '';
let lastKeyTime = 0;
const SCANNER_THRESHOLD = 100;

const handleKeyDown = (event: KeyboardEvent) => {
  const currentTime = Date.now();
  const timeSinceLastKey = currentTime - lastKeyTime;
  console.log('bf=', buffer)
  if (event.key === 'Enter') {
    event.preventDefault();
    if (buffer.length > 0) {
      console.log('Штрих-код:', buffer);
      findItemByBarcode(buffer);
      buffer = '';
      lastKeyTime = 0;
    }
    return;
  }
  
  if (event.key.length !== 1 || 
      event.ctrlKey || 
      event.altKey || 
      event.metaKey ||
      (event.target as HTMLElement).tagName === 'INPUT' ||
      (event.target as HTMLElement).tagName === 'TEXTAREA') {
    return;
  }
  
  event.preventDefault();
  
  // Основное исправление - обрабатываем первый символ
  if (timeSinceLastKey < SCANNER_THRESHOLD || lastKeyTime === 0) {
    buffer += event.key;
  } else {
    // Медленный ввод - начинаем новое сканирование
    buffer = event.key;
  }
  
  lastKeyTime = currentTime;
};

function activeTogle() {
  isActiveToogle.value = !isActiveToogle.value
  if (isActiveToogle.value) {
    styletoogle.value.left = ''
    styletoogle.value.right = '4px'
  }
  else {
    styletoogle.value.left = '4px'
    styletoogle.value.right = ''
  }
}

function openPopInfo() {
  openIfoScaner.value = true;
}

function closePopInfo() {
  openIfoScaner.value = false;
}



</script>

<template>

  <Transition name="fade">
     <NotificationBorder v-if="openNotif"
        :color="notifBorder.color"
        :borderheight="notifBorder.borderHeight"
     />
   </Transition>

  <Transition name="fade">
    <div class="background-blur" v-if="openIfoScaner"></div>
  </Transition>
  <Transition name="fade">
    <PopUpModalInfoScanner v-if="openIfoScaner"
      @close="closePopInfo
    "/>
  </Transition>

  <Transition name="fade">
    <div class="background-blur" v-if="popUpModal"></div>
  </Transition>
  <Transition name="fade">
    <PopUpModal v-if="popUpModal"
      @confirm="findItem"
      @close="closePopUpModal"
    />
  </Transition>
  <BarCode v-if="isOpenScanComponent"
    @close="closeScan"
    @findItem="findItemByBarcode"
  />
  <div class="cart-wrapper">
    <div class="cart-wrapper-up">
      <p class="order-label">Заказ #{{ order?.order_id }}</p>
      <p class="order-status">{{ order?.status }}</p>
      <p class="edit-order" :style="{ color: isEdit ? 'var(--orange-color)' : 'var(--green-color)' }" @click="editOrder()">{{ isEdit ? 'Подтвердить' : 'Редактировать' }}</p>
    </div>
    <div class="toogle-wrapper">
      <button type="button" class="btn btn-info" @click="openPopInfo">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.75 5.75V11.75" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M10.75 15.75C11.3023 15.75 11.75 15.3023 11.75 14.75C11.75 14.1977 11.3023 13.75 10.75 13.75C10.1977 13.75 9.75 14.1977 9.75 14.75C9.75 15.3023 10.1977 15.75 10.75 15.75Z" fill="black"/>
          <path d="M5.75 2.08782C7.22087 1.23697 8.9286 0.75 10.75 0.75C16.2728 0.75 20.75 5.22715 20.75 10.75C20.75 16.2728 16.2728 20.75 10.75 20.75C5.22715 20.75 0.75 16.2728 0.75 10.75C0.75 8.9286 1.23697 7.22087 2.08782 5.75" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <button type="button" @click="activeTogle()" class="btn toogle-body" :class="{ 'active': isActiveToogle }">
        <div class="toogle" ></div>
      </button>
      <p class="label-toogle">{{ isActiveToogle ? 'Выключить внешний сканер' : 'Подключить внешний сканер' }}</p>
    </div>
    <p v-if="order?.comment" class="comment">{{ order?.comment }}</p>
    <div class="cart-wrapper-items">
      <OrderItem v-for="(item, index) in order?.items"
        :item="item"
        :index="index"
        :is-edit="isEdit"
        @edit-product="editProduct"
      />
    </div>
  </div>

</template>

<style scoped>

.btn-info{
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  background-color: inherit;
  width: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.toogle-body {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  width: 50px;
  height: 22px;
  background-color: #e5e7eb;
  border-radius: 50px;
  position: relative;
  transition: background-color 0.3s ease;
}

.toogle-body.active {
  background-color: #3b82f6;
}

.toogle {
  position: absolute;
  top: 50%;
  left: 4px;
  transform: translateY(-50%) translateX(0);
  background-color: white;
  width: 18px;
  height: 18px;
  border-radius: 50px;
  transition: all .5s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toogle-body.active .toogle {
  transform: translateY(-50%) translateX(24px);
}

.btn:active {
  transform: var(--transform-scale-active);
}

.label-toogle {
  font-size: 16px;
  font-weight: 500;
  transition: all .7s ease;
}

.toogle-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
}

.background-blur {
  position: absolute;
  z-index: 11;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0; 
  background-color: #8E8E92;
}

.cart-wrapper-items {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 15px;
}

.edit-order {
  font-size: 16px;
  font-weight: 600;
}

.order-status {
  font-size: 15px;
  color: var(--orange-color);
  font-weight: 600;
}

.order-label {
  font-size: 18px;
  color: black;
  font-weight: 600;
}

.cart-wrapper-up {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 15px;
}

.comment {
  width: 100%;
  background-color: inherit;
  font-size: 16px;
  font-family: inherit;
  margin: 0;
  border: none;
  outline: none;
  width: 100%;
  color: #B9B9B9;
  text-align: start;
  border-radius: var(--border-radius);
  background-color: #EFEFF3;
  padding: 15px 5px 15px 10px;
}

</style>