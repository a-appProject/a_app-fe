<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import ButtonItem from '@/components/desktop/models_fourth_component/ButtonItem.vue';
import PopUpModal from '@/components/desktop/PopUpModal.vue';
import PopupModalInput from '@/components/desktop/models_order_scan_component/PopupModalInput.vue';
import SupplierReceiptViewComponent from '@/components/desktop/models_second_component/SupplierReceiptViewComponent.vue';
import ReceivingProductItem from '@/components/desktop/models_receiving_component/ReceivingProductItem.vue'
import Btn from '@/models/popup_button';
import Receipt from '@/models/receiving/receipt';
import Supplier from '@/models/receiving/supplier';
import { ProductForReceiving, ProductInReceiving } from '@/models/receiving/productForReceiving';
import ProductForComplete from '@/models/receiving/productForComplete';
import PopUpModalInfoScanner from '@/components/mobile/telegram/PopUpModalInfoScanner.vue';
import { Packaging } from '@/models/packaging';
import { Barcode } from "@/models/order_scan_models/orderScan"
import { playSucces, playError } from '@/tools/soundManager';
import NotificationBorder from '@/components/NotificationBorder.vue';

const props = defineProps<{
  products?: ProductForReceiving[],
  suppliers?: Supplier[],
  receipts?: Receipt[],
  receipt?: Receipt,
  isEdit: boolean
}>();

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'edit_receipt'): void,
  (e: 'edit_end'): void,
  (e: 'receipt_complete', receipt_id: number): void,
  (e: 'save_progress_receipt', receipt_id: number, products: ProductForComplete[]): void,
  (e: 'confirm_supplier', supplier_id: string | null): void,
  (e: 'confirm_receipt', receipt_id: number | null): void,
  (e: 'complete_receipt', receipt_id: number, products: ProductForComplete[]): void
}>()

const openPop = ref<{open: boolean, text: string | null, buttons: Btn[] | null}>({open: false, text: null, buttons: null});
const isOpenPopInput = ref<boolean>(false)
const isSelectSupplier = ref<string | null>(null)
const isSelectreceipt = ref<number | null>(null)
const isSelected = ref<number | string | null>(null);
const scanedProducts = ref<ProductInReceiving[]>([])
const productsForComplete = ref<ProductForComplete[]>([]);
const productToEdit = ref<string | null>(null);
const isClosingBecCompleated = ref<boolean>(false);
const suppliers = ref<Supplier[]>([])

onMounted(() => {
  if (props.receipt) {
    scanedProducts.value = props.receipt?.items
    // console.log('scanedProducts.value=', scanedProducts.value)
    // console.log('props.products=', props.products)
    window.addEventListener('keydown', handleKeyDown);
  }
  if(props.suppliers) {
    suppliers.value = props.suppliers
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  if (isClosingBecCompleated.value === false && props.receipt && props.receipt?.status !== 'Завершена') {
    collectProducts();
    emit('save_progress_receipt', props.receipt!.id, productsForComplete.value)
  }
})

//Логика работы сканера
let buffer = '';
let lastKeyTime = 0;
const SCANNER_THRESHOLD = 100;

const handleKeyDown = (event: KeyboardEvent) => {
  const currentTime = Date.now();
  const timeSinceLastKey = currentTime - lastKeyTime;
  
  if (event.key === 'Enter') {
    event.preventDefault();
    if (buffer.length > 0) {
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
  
  // Основное исправление - обрабатываем первый символ
  if (timeSinceLastKey < SCANNER_THRESHOLD || lastKeyTime === 0) {
    buffer += event.key;
  } else {
    // Медленный ввод - начинаем новое сканирование
    buffer = event.key;
  }
  
  lastKeyTime = currentTime;
};

function findProductForBarcode(barcode: string) {
  
  const item = props.products?.find(product => 
    product.barcode?.some(bc => bc.barcode === barcode)
  );

  const barcodeInfo = item?.barcode?.find(bc => bc.barcode === barcode);

  const packagingInfo = item?.packaging.find(packaging => packaging.id === barcodeInfo?.containerId)

  if (item && barcodeInfo && packagingInfo) {
    openNotifBorder('succes', 'var(--green-color)', 10)
    const containerId = barcodeInfo.containerId;
    console.log('containerId=', containerId)
    const existingProductIndex = scanedProducts.value.findIndex(
      p => p.id === item.id && p.packaging.id === containerId
    );
    
    if (existingProductIndex !== -1) {
      scanedProducts.value[existingProductIndex].receivedQuantity += 1;
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
    }
    console.log('after scanedProducts.value:', scanedProducts.value)
  } else {
    openNotifBorder('error', 'var(--red-color)', 10)
    window.removeEventListener('keydown', handleKeyDown);
    openPopup('Такой товар не найден или штрих-код не распознан', 3);
  }
}

const actionButtons = computed(() => {

  if (props.isEdit) {
    return [
      { id: 'edit_end', label: 'Готово', color: 'var(--orange-color)', text_color: 'white', icon: null }
    ];
  } 
  
  if (!props.isEdit) {
    if (isSelected.value !== null) {
      if (props.suppliers) {
        return [
          { id: 'confirm_supplire', label: 'Подтвердить', color: 'var(--green-color)', text_color: 'white', icon: null }
        ];  
      }
      if (props.receipts && props.receipt?.status !== 'Завершена') {
        return [
          { id: 'confirm_receipt', label: 'Подтвердить', color: 'var(--green-color)', text_color: 'white', icon: null }
        ];
      }
    }
    else {
      if (scanedProducts.value.length > 0 && props.receipt?.status !== 'Завершена') {
        return [
          { id: 'edit_receipt', label: 'Редактировать', color: 'var(--orange-color)', text_color: 'white', icon: null },
          { id: 'complete_receipt', label: 'Готово', color: 'var(--green-color)', text_color: 'white', icon: null }
        ];
      }
      else if (props.receipt?.status !== 'Завершена') {
        return [
          { id: '', label: 'Подтвердить', color: '#CACACA', text_color: 'white', icon: null }
        ];
      }
    }
  }
});

function clickSupRecComponetn(value: string | number) {
  if (typeof value === 'string') {
    isSelectSupplier.value = value;
  }
  else {
    isSelectreceipt.value = value;
  }
  isSelected.value = value;
}

//Функция обработки нажатия на кнопку в этом компоненте
function buttonClick(value: string | null) {
  switch (value) {
    case 'confirm_supplire':
      emit('confirm_supplier', isSelectSupplier.value)
      break;
    case 'confirm_receipt':
      emit('confirm_receipt', isSelectreceipt.value)
      break;
    case 'complete_receipt': 
      collectProducts();
      completeReceipt();
      break;
    case 'edit_receipt':
      emit('edit_receipt')
      break;
    case 'edit_end':
      emit('edit_end');
      break;
    default: 
      break;
  }
}

function collectProducts() {
  productsForComplete.value = scanedProducts.value.map(product => ({
    name: product.name,
    quantity: product.receivedQuantity,
    barcode: product.barcode[0].barcode
  }));
}

function completeReceipt() {
  if (props.receipt) {
    emit('complete_receipt', props.receipt?.id, productsForComplete.value)
  }
}

function clickClose() {
  isClosingBecCompleated.value = false;
  emit('close')
}

//Функция открытия попапа
function openPopup(text: string, option: number) {
  const buttonsMap: Record<number, Btn[]> = {
    1: [
      { label: 'Удалить', color: 'var(--red-color)', type: 'del' },
      { label: 'Отмена', color: 'var(--orange-color)', type: 'cancel' }
    ],
    2: [
      { label: 'Продолжить', color: 'var(--green-color)', type: 'continue' },
      { label: 'Отмена', color: 'var(--orange-color)', type: 'cancel' }
    ],
    3: [
      { label: 'Ввести вручную', color: 'var(--green-color)', type: 'open_input' },
      { label: 'Закрыть', color: 'var(--orange-color)', type: 'cancel' }
    ]
  };
  
  openPop.value = {
    open: true,
    text,
    buttons: buttonsMap[option] || []
  };
}

//Функция закрытия попапп с обработкой удаления товара
function closePopup(btn_id: string) {
  window.addEventListener('keydown', handleKeyDown);
  if (btn_id === 'del' && productToEdit.value) {
    const productId = productToEdit.value;
    
    if (scanedProducts.value) {
      const index = scanedProducts.value.findIndex(
        product => product.packaging.id === productId
      );
      
      if (index !== -1) {
        scanedProducts.value.splice(index, 1);
      }
    }
  }
  if (btn_id === 'continue' && productToEdit.value) {
    const productId = productToEdit.value;
    if (scanedProducts.value) {
      const targetItem = scanedProducts.value.find(product => product.packaging.id === productId);
      if (targetItem) {
        targetItem.receivedQuantity++
      }
    }    
  }
  if (btn_id === 'open_input') {
    popInput({type: 'open'})
  }
  openPop.value.open = false;
  openPop.value.text = null;
  openPop.value.buttons = null;
  productToEdit.value = null;
}

function popInput(value: {type: string, value?: string}) {
  window.removeEventListener('keydown', handleKeyDown);
  if (value.type === 'open') {
    isOpenPopInput.value = true;
  }
  if (value.type === 'close') {
    isOpenPopInput.value = false;
  }
  if (value.type === 'enter') {
    if (value.value) findProductForBarcode(String(value.value));
    window.addEventListener('keydown', handleKeyDown);
    isOpenPopInput.value = false;
  }
}

//Функция для изменения ИТОГОВОГО кол-ва в заказе (функция доступна только при редактировании)
function editReceiptQuantityItem(value: {value: string, name: string, id: string}) {
  if (props.isEdit !== true) return
  
  if (!scanedProducts.value.length) return
  
  const targetItem = scanedProducts.value.find(product => product.packaging.id === value.id);
  
  if (targetItem) {
    if (value.value === 'add') targetItem.receivedQuantity++

    if (value.value === 'del')  {
      if (targetItem.receivedQuantity > 1) {
        targetItem.receivedQuantity--
      }
      else {
        openPopup(`Удалить из приёмки ${value.name} фасовка: ${targetItem.packaging.name}`, 1);
        productToEdit.value = value.id;
      }
    }
  }
}

const openIfoScaner = ref<boolean>(false)

function openPopInfo() {
  openIfoScaner.value = true;
}

function closePopInfo() {
  openIfoScaner.value = false;
}

const isShowSearch = ref<boolean>(false);
const searchQuery = ref<string>('');

function showHideSearch() {
  isShowSearch.value = !isShowSearch.value
}

const suppliersToRender = computed<Supplier[] | []>(() => {
  if (!searchQuery.value) {
    return suppliers.value
  }
  
  const searchText = searchQuery.value.toLowerCase()
  
  return suppliers.value.filter(sup => {
    const nameForSearch = sup.name
      .replace(/\\"/g, '"')
      .toLowerCase()
    
    return nameForSearch.includes(searchText)
  })
})

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

    <div class="order-wrapper" :style="{ width: props.isEdit ? '1000px' : '798px' }">
        <Transition name="fade">
          <div class="background-blur" v-if="openIfoScaner"></div>
        </Transition>
        <Transition name="fade">
          <PopUpModalInfoScanner v-if="openIfoScaner"
            @close="closePopInfo
          "/>
        </Transition>
      <Transition name="fade">
        <div class="background-blur" v-if="isOpenPopInput === true"></div>
      </Transition>
      <Transition name="fade">
        <PopupModalInput v-if="isOpenPopInput === true"
          @popup_input_close="popInput"
        />
      </Transition>
      <Transition name="fade">
        <div class="background-blur" v-if="openPop?.open === true"></div>
      </Transition>
      <Transition name="fade">
        <PopUpModal v-if="openPop?.open === true"
          :text="openPop.text"
          :btns="openPop.buttons"
          @popup_close="closePopup"
        />
      </Transition>
      <div class="close-wrapper">
        <div class="order-number-wrapper">
          <p class="order-label" :style="{ color: props.receipt?.status === 'Завершена' ? 'var(--green-color)' : 'black' }">
            <span v-if="props.suppliers">Выберите поставщика</span>
            <span v-else-if="props.products && scanedProducts.length > 0 && props.receipt?.status !== 'Завершена'">Отсканированные товары</span>
            <span v-else-if="props.products && scanedProducts.length === 0">Отсканируйте товар</span>
            <span v-else-if="props.receipt?.status !== 'Завершена'">Ничего не найдено</span>
            <span v-else>Завершена</span>
          </p>
        </div>
        <button type="button" v-if="props.receipt?.status !== 'Завершена'" class="btn-info" @click="showHideSearch()">
          <svg width="30" height="30" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1_4764_731" fill="white">
            <path d="M17.1431 8.57134C17.1431 13.3052 13.3055 17.1427 8.57154 17.1427C3.83761 17.1427 0 13.3052 0 8.57134C0 3.83752 3.83761 0 8.57154 0C13.3055 0 17.1431 3.83752 17.1431 8.57134ZM1.80601 8.57134C1.80601 12.3078 4.83504 15.3367 8.57154 15.3367C12.308 15.3367 15.3371 12.3078 15.3371 8.57134C15.3371 4.83493 12.308 1.80597 8.57154 1.80597C4.83504 1.80597 1.80601 4.83493 1.80601 8.57134Z"/>
            </mask>
            <path d="M17.1431 8.57134C17.1431 13.3052 13.3055 17.1427 8.57154 17.1427C3.83761 17.1427 0 13.3052 0 8.57134C0 3.83752 3.83761 0 8.57154 0C13.3055 0 17.1431 3.83752 17.1431 8.57134ZM1.80601 8.57134C1.80601 12.3078 4.83504 15.3367 8.57154 15.3367C12.308 15.3367 15.3371 12.3078 15.3371 8.57134C15.3371 4.83493 12.308 1.80597 8.57154 1.80597C4.83504 1.80597 1.80601 4.83493 1.80601 8.57134Z" fill="black" stroke="black" stroke-width="1.6667" mask="url(#path-1-inside-1_4764_731)"/>
            <path d="M19.205 20.7958C19.6443 21.2352 20.3566 21.2352 20.796 20.7958C21.2353 20.3565 21.2353 19.6441 20.796 19.2048L20.0005 20.0003L19.205 20.7958ZM13.8779 13.8779L13.0824 14.6734L19.205 20.7958L20.0005 20.0003L20.796 19.2048L14.6734 13.0824L13.8779 13.8779Z" fill="black"/>
          </svg>
        </button>
        <button type="button" class="btn-info" @click="openPopInfo" v-if="props.receipt?.status !== 'Завершена'">
          <svg width="30" height="30" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.75 5.75V11.75" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M10.75 15.75C11.3023 15.75 11.75 15.3023 11.75 14.75C11.75 14.1977 11.3023 13.75 10.75 13.75C10.1977 13.75 9.75 14.1977 9.75 14.75C9.75 15.3023 10.1977 15.75 10.75 15.75Z" fill="black"/>
            <path d="M5.75 2.08782C7.22087 1.23697 8.9286 0.75 10.75 0.75C16.2728 0.75 20.75 5.22715 20.75 10.75C20.75 16.2728 16.2728 20.75 10.75 20.75C5.22715 20.75 0.75 16.2728 0.75 10.75C0.75 8.9286 1.23697 7.22087 2.08782 5.75" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <button type="button" class="btn-close">
          <img src="@/assets/desktop/close_cart.svg" class="close-img" @click="clickClose()">
        </button>
      </div>
      <div v-if="isShowSearch"  class="search-wrapper">
        <input v-model="searchQuery"
          ref="inputRef"
          class="search"
          id="msg"
          type="text"
          placeholder="Поиск..."
        />
        <div class="close-search-icon-wrapper" @click="showHideSearch()">
          <img class="icon-close-search" src="@/assets/close_search.svg">
        </div>
      </div>
      <div class="items-wrapper">
        <SupplierReceiptViewComponent v-if="suppliersToRender" v-for="(supplier, index) in suppliersToRender"
          :supplier="supplier"
          :index="index"
          :is-selected="isSelected === supplier.uuid"
          @select_supplier="clickSupRecComponetn"
        />
        <SupplierReceiptViewComponent v-if="props.receipts" v-for="(receipt, index) in props.receipts"
          :receipt="receipt"
          :index="index"
          :is-selected="isSelected === receipt.id"
          @select_receipt="clickSupRecComponetn"
        />
        <ReceivingProductItem v-if="scanedProducts" v-for="(product, index) in scanedProducts"
          :product="product"
          :index="index"
          :is-last="index === scanedProducts.length - 1"
          :is-edit="props.isEdit"
          @edit_product="editReceiptQuantityItem"
        />
      </div>
      <TransitionGroup 
        class="buttons-wrapper" 
        name="buttons-transition" 
        tag="div"
      >
        <ButtonItem v-for="btn in actionButtons" 
          :key="btn.id"
          :id="btn.id"
          :label="btn.label"
          :color="btn.color"
          :text_color="btn.text_color"
          :icon="btn.icon" 
          @btn_click="buttonClick"
        />
      </TransitionGroup>
    </div>

</template>


<style scoped>

.icon-close-search{
  max-width: 14px;
}

.close-search-icon-wrapper{
  margin-right: 20px;
}

input.search::placeholder {
  color: #B9B9B9;
}

input.search {
  background-color: inherit;
  font-size: 20px;
  padding: 0px;
  font-family: inherit;
  margin: 0;
  border: none;
  outline: none;
  width: 100%;
  margin-left: 30px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  justify-content: start;
  width: 95%;
  height: 40px;
  padding: 10px 0;
  background-color: #F6F6F6;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
}

.btn-info {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  background: 0;
  margin-right: 10px;
}

.background-blur {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0; 
  background-color: #8E8E9290;
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-desktop);
}

.buttons-transition-move,
.buttons-transition-enter-active,
.buttons-transition-leave-active {
  transition: all 0.3s ease;
}

.buttons-transition-enter-from {
  transform: scale3d(0.1, 0.1, 0.1);
  opacity: 0;
}

.buttons-transition-leave-to {
  transform: scale3d(0.1, 0.1, 0.1);
  opacity: 0;
}

.buttons-transition-leave-active {
  position: absolute;
}

.btn-close {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  background: 0;
}

.btn-close:active {
  transform: var(--transform-scale-active);
}

.btn-info:active {
  transform: var(--transform-scale-active);
}

.buttons-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  position: relative;
}

.items-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 10px;
  overflow-y: scroll;
}

.order-id {
  font-size: 24px;
  font-weight: 700;
  color: var(--orange-color);
}

.order-label {
  font-size: 20px;
}

.order-number-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
  width: 100%;
}

.close-img{
  width: 30px;
}

.close-wrapper{
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.order-wrapper {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 798px;
  background-color: white;
  box-shadow: var(--drop-shadow-2);
  border-radius: var(--border-radius-desktop);
  z-index: 20;
  padding: 15px;
  gap: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all .7s ease;
}

</style>