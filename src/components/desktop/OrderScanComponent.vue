<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { Item, OrderForScan } from '@/models/order_scan_models/orderScan'
import ButtonItem from '@/components/desktop/models_fourth_component/ButtonItem.vue';
import OrderItem from './models_order_scan_component/OrderItem.vue';
import Btn from '@/models/popup_button';
import PopUpModal from '@/components/desktop/PopUpModal.vue';
import PopupModalInput from '@/components/desktop/models_order_scan_component/PopupModalInput.vue';
import { playSucces, playError } from '@/tools/soundManager';
import NotificationBorder from '@/components/NotificationBorder.vue';

const props = defineProps<{
  pointId: number,
  order: OrderForScan,
  isEdit: boolean
}>();

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'edit'): void,
  (e: 'edit_end'): void,
  (e: 'order_complete', order_id: number, items: Item[]): void,
  (e: 'save_progress_order', order_id: number, items: Item[]): void
}>()

const orderForScan = ref<OrderForScan>(null);
const openPop = ref<{open: boolean, text: string | null, buttons: Btn[] | null}>({open: false, text: null, buttons: null});
const isOpenPopInput = ref<boolean>(false)
const productToEdit = ref<string | null>(null);
const isClosingBecCompleated = ref<boolean>(false);

onMounted(() => {
  orderForScan.value = props.order;
  console.log('orderForScan.value=', orderForScan.value)
  window.addEventListener('keydown', handleKeyDown);
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  if (isClosingBecCompleated.value === false) {
    emit('save_progress_order', orderForScan.value!.order_id, orderForScan.value!.items)
  }
})

function clickClose() {
  isClosingBecCompleated.value = false;
  emit('close')
}

const actionButtons = computed(() => {

  if (props.isEdit) {
    return [
      { id: 'edit_end', label: 'Готово', color: 'var(--orange-color)', text_color: 'white', icon: null }
    ];
  } 
  
  if (!props.isEdit) {
    const allItemsScanned = orderForScan.value?.items?.some(item => 
      item.scannedQuantity >= 1
    );
    
    if (allItemsScanned) {
      return [
        { id: 'edit', label: 'Редактировать', color: 'var(--orange-color)', text_color: 'white', icon: null },
        { id: 'order', label: 'Готово', color: 'var(--green-color)', text_color: 'white', icon: null }
      ];
    } else {
      return [
        { id: 'edit', label: 'Редактировать', color: 'var(--orange-color)', text_color: 'white', icon: null }
      ];
    }
  }
});

function buttonClick(value: string | null) {
  console.log('btnClick value=', value)
  switch (value) {
    case 'close':
      break;
    case 'edit_end':
      emit('edit_end')
      break;
    case 'edit':
      emit('edit')
      break;
    case 'order':
      isClosingBecCompleated.value = true;
      emit('order_complete', orderForScan.value!.order_id, orderForScan.value!.items)
      break;
    default: 
      break;
  }
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
    const productName = productToEdit.value;
    
    if (orderForScan.value?.items) {
      const index = orderForScan.value.items.findIndex(
        item => item.name === productName
      );
      
      if (index !== -1) {
        orderForScan.value.items.splice(index, 1);
      }
    }
  }
  if (btn_id === 'continue' && productToEdit.value) {
    const productName = productToEdit.value;
    if (orderForScan.value?.items) {
      const targetItem = orderForScan.value.items.find(item => item.name === productName);
      if (targetItem) {
        targetItem.scannedQuantity++
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
function editOrderQuantityItem(value: string, name: string, barcode: string) {
  if (props.isEdit !== true) return
  
  if (!orderForScan.value?.items?.length) return
  
  const targetItem = orderForScan.value.items.find(item => item.barcode === barcode);
  
  if (targetItem) {
    if (value === 'add') targetItem.scannedQuantity++

    if (value === 'del')  {
      if (targetItem.scannedQuantity > 0) {
        targetItem.scannedQuantity--
      }
      else {
        // openPopup(name, 1);
        productToEdit.value = name;
      }
    }
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
  
  // Основное исправление - обрабатываем первый символ
  if (timeSinceLastKey < SCANNER_THRESHOLD || lastKeyTime === 0) {
    buffer += event.key;
  } else {
    // Медленный ввод - начинаем новое сканирование
    buffer = event.key;
  }
  
  lastKeyTime = currentTime;
};

function findProductForBarcode(barcode: string){
  const targetItem = orderForScan.value?.items.find(product => product.barcode === barcode);
  
  if(targetItem) {
    openNotifBorder('succes', 'var(--green-color)', 10)
    if (targetItem.scannedQuantity < targetItem.orderQuantity) {
      targetItem.scannedQuantity++;
    }
    else {
      window.removeEventListener('keydown', handleKeyDown);
      const text = 'Отсканировано больше, чем в заказе. Продолжить?'
      openPopup(text, 2);
      productToEdit.value = targetItem.name;
    }
  } else {
    openNotifBorder('error', 'var(--red-color)', 10)
    window.removeEventListener('keydown', handleKeyDown);
    const text = 'Такой товар в заказе не найден или штрих-код не распознан'
    openPopup(text, 3);
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
          <p class="order-label">Заказ № </p>
          <p class="order-id">{{ orderForScan?.order_id }}</p>
        </div>
        <button type="button" class="btn">
          <img src="@/assets/desktop/close_cart.svg" class="close-img" @click="clickClose()">
        </button>
      </div>
      <div class="items-wrapper">
        <OrderItem v-for="(order, index) in orderForScan?.items"
          :item="order"
          :index="Number(index)"
          :is-last="index === orderForScan!.items.length - 1"
          :is-edit="props.isEdit"
          @edit_product="editOrderQuantityItem"
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
          @btn_click="(value) => buttonClick(value)"
        />
      </TransitionGroup>
    </div>

</template>


<style scoped>

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

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  background: 0;
}

.btn:active {
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
  color: black;
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