<script setup lang="ts">
import { onMounted, onBeforeUnmount, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';
import { on, off, postEvent, type PopupButton } from '@tma.js/sdk-vue'
import { 
  setBackButton, hideBackButton, 
  setBottomButton, hideBottomButton, 
  setBottomSecondaryButton, hideBottomSecondaryButton } from '@/tools/setTelegramButtons';
import { getReceiptById, saveReceiptProgress, getAllProductsForReceiving, completeReceipt } from '@/composables/receivingWorker';
import BarCode from '@/components/mobile/telegram/BarCode.vue';
import { ProductForReceiving, ProductInReceiving } from '@/models/receiving/productForReceiving';
import Receipt from '@/models/receiving/receipt';
import ProductForComplete from '@/models/receiving/productForComplete';
import ScannedItem from '@/components/mobile/telegram/receiving/scanning/ScannedItem.vue';
import { createPopupManager } from '@/tools/setTelegramPopUp';
import PopUpModal from '@/components/mobile/telegram/order_scan_components/PopUpModal.vue';
import PopUpModalInfoScanner from '@/components/mobile/telegram/PopUpModalInfoScanner.vue';
import { Packaging } from '@/models/packaging';
import { Barcode } from "@/models/order_scan_models/orderScan"
import { playSucces, playError } from '@/tools/soundManager';
import NotificationBorder from '@/components/NotificationBorder.vue';

const popupManager = createPopupManager();
const isOpenScanComponent = ref<boolean>(false);
const allProductsFromIiko = ref<ProductForReceiving[]>();
const receipt = ref<Receipt>();
const scanedProducts = ref<ProductInReceiving[]>([])
const isClosingBecCompleated = ref<boolean>(false);
const isEdit = ref<boolean>(false);
const isActiveToogle = ref<boolean>(false)
const styletoogle = ref<{left: string, right: string}>({left: '6px', right: ''})
const popUpModal = ref<boolean>(false);
const productsForComplete = ref<ProductForComplete[]>([]);
const openIfoScaner = ref<boolean>(false)

async function getAllProductsFromIiko() {
  allProductsFromIiko.value = await getAllProductsForReceiving();
}

async function getReceipt(id: number) {
  receipt.value = await getReceiptById(id);
  if (receipt.value) {
    scanedProducts.value = receipt.value?.items
  }
  if (receipt.value?.status !== 'Завершена') {
    setBottomButton('Сканировать товары', '007AFF', 'FFFFFF', mainButtonPress, true);
  }
}

async function saveProgress() {
  const data = await saveReceiptProgress(receipt.value!.id, productsForComplete.value);
  if (data) {
    popupManager.openPopup(`Прогресс по Приёмке №${receipt.value!.id} сохранён`,() => {},);
  }
}

async function completeReceiptById() {
  const data = await completeReceipt(receipt.value!.id, productsForComplete.value);
  if (data) {
    popupManager.openPopup(`Приёмке №${receipt.value!.id} переведена в статус "Готово"`,() => {},);
    router.go(-1)
  }
}

function mainButtonPress() {
  isOpenScanComponent.value = true;
  hideBottomButton();
  hideBottomSecondaryButton();
}

function handleSecondaryButton() {
  isClosingBecCompleated.value = true;
  collectProducts();
  completeReceiptById();
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
    router.go(-1);
  }
}

function closeScan() {
  isOpenScanComponent.value = false;
  postEvent('web_app_setup_back_button', { is_visible: true });
  if (isActiveToogle.value !== true && receipt.value?.status !== 'Завершена') {
    setBottomButton('Сканировать товары', '007AFF', 'FFFFFF', mainButtonPress, true)
  }
}

onMounted(async () => {
  let id = Number(useRoute().query.receipt_id);
  await getReceipt(id);
  await getAllProductsFromIiko();
  postEvent('web_app_setup_back_button', { is_visible: true });
  on('back_button_pressed', backButtonPressed);
})

onBeforeUnmount(async() => {
  if (isClosingBecCompleated.value === false && receipt.value?.status !== 'Завершена') {
    collectProducts();
    await saveProgress();
  }
})

onUnmounted(() => {
  if (isActiveToogle.value === true) {
    window.removeEventListener('keydown', handleKeyDown);
  }
  hideBottomSecondaryButton();
  hideBottomButton();
  off('back_button_pressed', backButtonPressed);
})

function collectProducts() {
  productsForComplete.value = scanedProducts.value.map(product => ({
    name: product.name,
    quantity: product.receivedQuantity,
    barcode: product.barcode[0].barcode
  }));
}

watch(() => scanedProducts.value?.length, (newVal) => {
  console.log('newVal:', newVal)
  if (newVal !== 0 && receipt.value?.status !== 'Завершена') {
    setBottomSecondaryButton('Завершить', '31B545', 'FFFFFF', 'left', handleSecondaryButton);
  }
  else {
    hideBottomSecondaryButton();
  }
}, {immediate: true})

watch(() => isActiveToogle.value, (newVal, oldVal) => {

  if (newVal === true && oldVal === false && receipt.value?.status !== 'Завершена') {
    window.addEventListener('keydown', handleKeyDown)
    hideBottomButton();
  }

  else if (newVal === false && oldVal === true && receipt.value?.status !== 'Завершена') {
    window.removeEventListener('keydown', handleKeyDown)
    setBottomButton('Сканировать товары', '007AFF', 'FFFFFF', mainButtonPress, true);
  }
}, { immediate: true })

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

function editReceipt(){
  isEdit.value = !isEdit.value;
}

//Продумать работу изменения кол-ва продукта в приёмке
function editReceiptQuantityItem(value: {value: string, name: string, id: string}) {
  if (isEdit.value !== true) return
  
  if (!scanedProducts.value?.length) return
  
  const targetItem = scanedProducts.value.find(product => product.packaging.id === value.id);
  
  if (targetItem) {
    if (value.value === 'add') targetItem.receivedQuantity++

    if (value.value === 'del')  {
      if (targetItem.receivedQuantity > 1) {
        targetItem.receivedQuantity--
      }
      else {
        postEvent('web_app_trigger_haptic_feedback', { type: 'notification', notification_type: 'error' });
        let buttons: PopupButton[];
        buttons = [
          {
            id: 'delete',
            text: 'Удалить',
            type: 'default'
          },
          {
            id: 'cancel',
            type: 'close'
          }
        ];
        popupManager.openPopup(`Удалить ${targetItem.name} фасовка: ${targetItem.packaging.name} из приёмки?`,
          (buttonId) => {
            console.log('buttonId=', buttonId)
            if (buttonId === 'delete') {
                const productid = targetItem.packaging.id;
                
                if (scanedProducts.value) {
                  const index = scanedProducts.value.findIndex(
                    product => product.packaging.id === productid
                  );
                  
                  if (index !== -1) {
                    scanedProducts.value.splice(index, 1);
                  }
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
  }
}

function showPopUpModal() {
  popUpModal.value = true;
  hideBottomButton();
  hideBottomSecondaryButton();
}

function closePopUpModal() {
  popUpModal.value = false;
}

function findItem(value: string) {
  popUpModal.value = false;
  findProductForBarcode(value);
}

function findProductForBarcode(barcode: string) {
  const item = allProductsFromIiko.value?.find(product => 
    product.barcode?.some(bc => bc.barcode === barcode)
  );

  const barcodeInfo = item?.barcode?.find(bc => bc.barcode === barcode);

  const packagingInfo = item?.packaging.find(packaging => packaging.id === barcodeInfo?.containerId)

  if (item  && scanedProducts.value && barcodeInfo && packagingInfo) {

    openNotifBorder('succes', 'var(--green-color)', 5)

    const productToAdd = { ...item };
    const containerId = barcodeInfo.containerId;
    const existingProductIndex = scanedProducts.value?.findIndex(
      product => product.id === item.id && product.packaging.id === containerId
    );
    if (existingProductIndex !== -1) {
      const existingProduct = scanedProducts.value[existingProductIndex];
      scanedProducts.value[existingProductIndex] = {
        ...existingProduct,
        receivedQuantity: (existingProduct.receivedQuantity || 0) + 1
      };
      popupManager.openPopup(`Добавили товар ${existingProduct.name} в приёмку`,() => {},);
    } else {
      scanedProducts.value.push({
        id: item.id,
        name: item.name,
        description: item.description,
        barcode: [barcodeInfo],
        amount: item.amount,
        icon: item.icon,
        packaging: packagingInfo,
        uuid: item.uuid,
        receivedQuantity: 1
      });
      popupManager.openPopup(`Добавили новый товар ${productToAdd.name} в приёмку`,() => {},);
    }
    
    console.log('Обновленный список:', scanedProducts.value);
    closeScan();
  } else {
    openNotifBorder('error', 'var(--red-color)', 5)
    window.removeEventListener('keydown', handleKeyDown);
    postEvent('web_app_trigger_haptic_feedback', { type: 'notification', notification_type: 'error' });
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


    popupManager.openPopup(`Такой товар не найден или штрих-код не распознан`,
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
}

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
      findProductForBarcode(buffer);
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

  if (timeSinceLastKey < SCANNER_THRESHOLD || lastKeyTime === 0) {
    buffer += event.key;
  } else {
    buffer = event.key;
  }
  
  lastKeyTime = currentTime;
};

function openPopInfo() {
  openIfoScaner.value = true;
}

function closePopInfo() {
  openIfoScaner.value = false;
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
    @findItem="findProductForBarcode"
  />

  <div class="receipt-wrapper">
    <div class="receipt-wrapper-up">
      <div class="label-wrapper">
        <p class="receipt-label">Приёмка #{{ receipt?.id }}</p>
        <p class="receipt-status" :style="{ color: receipt?.status === 'Завершена' ? 'var(--green-color)' : 'var(--orange-color)' }">{{ receipt?.status }}</p>
      </div>
      <p class="edit-receipt" v-if="scanedProducts?.length !== 0 && receipt?.status !== 'Завершена'" :style="{ color: isEdit ? 'var(--orange-color)' : 'var(--green-color)' }" @click="editReceipt()">{{ isEdit ? 'Подтвердить' : 'Редактировать' }}</p>
    </div>
    <div class="toogle-wrapper" v-if="receipt?.status !== 'Завершена'">
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
    <div class="receipt-wrapper-items">
      <ScannedItem v-for="(product, index) in scanedProducts"
        :product="product"
        :index="index"
        :is-last="index === scanedProducts.length - 1"
        :is-edit="isEdit"
        @edit_product="editReceiptQuantityItem"
      />
    </div>
  </div>

</template>

<style scoped>

.label-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 5px;
}

.background-blur {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0; 
  background-color: #8E8E9290;
  backdrop-filter: blur(10px);
}

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

.receipt-wrapper-items {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 15px;
}

.edit-receipt {
  font-size: 16px;
  font-weight: 600;
}

.receipt-status {
  font-size: 14px;
  color: black;
  font-weight: 600;
}

.receipt-label {
  font-size: 18px;
  color: black;
  font-weight: 600;
}

.receipt-wrapper-up {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.receipt-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 15px;
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

</style>