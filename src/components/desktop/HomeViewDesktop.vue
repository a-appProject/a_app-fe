<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import store from '@/store';
import PointsAndButtons from '@/components/desktop/PointsAndButtons.vue';
import SecondComponent from '@/components/desktop/SecondComponent.vue';
import ThirdComponent from '@/components/desktop/ThirdComponent.vue';
import FourthComponent from '@/components/desktop/FourthComponent.vue';
import OrderScanComponent from '@/components/desktop/OrderScanComponent.vue';
import ReceivingComponent from '@/components/desktop/ReceivingComponent.vue';
import Order from '@/models/order';
import Product from '@/models/product';
import { ProductWithPackaging } from '@/models/product';
import Point from '@/models/point'
import PointsAndOrders from '@/models/points&orders'
import User from '@/models/user';
import Status from '@/models/status'
import btn from '@/models/popup_button';
import { ProductForReceiving } from '@/models/receiving/productForReceiving'
import Supplier from '@/models/receiving/supplier'
import Receipt from '@/models/receiving/receipt';
import { Item } from '@/models/order_scan_models/orderScan'
import { OrderForScan } from '@/models/order_scan_models/orderScan';
import ProductForComplete from '@/models/receiving/productForComplete';
import Resp from '@/models/responseProductsFromiiko';
import CartView from '@/components/desktop/CartView.vue';
import PopUpModal from '@/components/desktop/PopUpModal.vue';
import NotificationModal from '@/components/desktop/NotificationModal.vue';
//Workers
import { getUsers } from '@/composables/userWorker' 
import { 
  getAllPoints, 
  getProductsByPoint,
  syncAllItemsFromIiko,
  syncAllPointsFromIiko,
  syncAllSuppliersFromIiko } from '@/composables/itemWorker';
import { 
  getOrdersByPoint, 
  fetchOrdersForStatistic, 
  addOrder, 
  editOrderStatus, 
  getOrderById, 
  completeOrderById, 
  saveProgressOrderById } from '@/composables/orderWorkerk';
import { 
  getAllProductsForReceiving, 
  getAllSuppliers, 
  getAllReceipts, 
  getReceiptById, 
  createNewReceipt, 
  saveReceiptProgress, 
  completeReceipt } from '@/composables/receivingWorker'

const points = ref<Point[]>([]);
const orders = ref<Order[]>([]); 
const openSecondComponent = ref(false);
const openThirdComponent = ref(false);
const openFourthComponent = ref(false);
const fourComponent = ref< {label: string, point_id: number | null, order_id: number | null} | null>(null)
const select_point_id_for_stats = ref()
const openCart = ref(false);
const is_settings = ref(false);
const selectedPoint = ref<Point | null>(null);
const products = ref<Product[] | null>(null);
const statisticByPoints = ref<PointsAndOrders[]>([]);
const statisticOrderByPoint = ref<Order[]>([]);
const users = ref<User[]>([]);
const filterProductsForOrder = ref<Order>();
const isEditCart = ref(false);
const openPop = ref<{open: boolean, text: string | null, buttons: btn[] | null}>({open: false, text: null, buttons: null});
const showNotification = ref<{ open: boolean, status: Status, message: string | null}>({ open: false, status: null, message: null});

onMounted(async() => {
  await getPoints();
  await getAndSetStylesToApp();
})

watch(() => store.state.popUp, (newVal) => {
  console.log('Изменилось значение стора попап. newVal=', newVal)
  openPopup(store.getters.getStatusPopUp.text);
})

async function getAndSetStylesToApp() {
  const appElement = document.getElementById('app');
  const allWrapperElement = document.getElementById('all-wrapper');
  document.documentElement.style.overflowY = 'hidden';
  if (appElement) {
    appElement.style.width = '100vw';
    appElement.style.padding = '14px';
    appElement.style.maxWidth = 'none';
    appElement.style.backgroundColor = '#F2F2F2';
  }
  if (allWrapperElement) {
    allWrapperElement.style.height = '100%'
    allWrapperElement.style.width = '100%'
    allWrapperElement.style.display = 'flex'
    allWrapperElement.style.flexDirection = 'row';
    allWrapperElement.style.alignItems = 'center';
    allWrapperElement.style.justifyContent = 'flex-start';
    allWrapperElement.style.gap = '15px';
  }
}

async function handleSelectTab(tabId: string) {
  console.log('tab=', tabId)
  claerAll();
  switch (tabId) {
    case 'orders': 
      await getOrderByPoint(selectedPoint.value!.id);
      break;
    case 'products': 
      await getAllProducts(); 
      break
    case 'stats': 
      await getPointForStatistic();
      break
    case 'staff': 
      await getAllUsers();
      break;
    case 'receiving':
      //Получить существующие приёмки
      getReceipts();
      getAllProductsReceiving();
      getAllSuppliersForReceiving();
      break;
    default:
      break;
  }
}

//API WORKS

//Получить все точки
async function getPoints() {
  points.value = await getAllPoints();
}

//Поулчить все заказы на точке
async function getOrderByPoint(point_id: number | null) {
  orders.value = await getOrdersByPoint(point_id); 
  openSecondComponent.value = true; 
  is_settings.value = false;
}

//Получить все товары для конкретной точки
async function getAllProducts() {
  products.value = await getProductsByPoint(selectedPoint.value!.uuid)
  console.log('products.value=', products.value)
  store.dispatch("clearProducts")
  store.dispatch("setProducts", products.value)
}

//Получить точки для статистики по заказам, и получить в них сами заказы
async function getPointForStatistic() {
  if (!points.value?.length) return

  statisticByPoints.value = await Promise.all(
    points.value.map(async (point) => ({
      pointId: point.id,
      pointName: point.name,
      orders: await fetchOrdersForStatistic(point.id),
    }))
  )
}

//Получить всех пользователей
async function getAllUsers() {
  users.value = await getUsers();
}

//Создать новый заказ
async function createOrder(comment?: string) {
  const cartItems = computed(() => store.getters.getCartItemsByPoint(selectedPoint.value!.id) ?? []);
  console.log('cartItems=', cartItems.value)
  const formattedCartItems = computed<{ name: string; quantity: number, containerId: string }[]>(() =>
    cartItems.value.map((item: ProductWithPackaging) => ({
      name: item.name as string,
      quantity: item.quantity as number,
      containerId: item.packaging.id as string
    }))
  );

  const result = await addOrder(selectedPoint.value!.id, comment!, formattedCartItems.value);
  if (result === null || result === undefined) {
    openPopup('Ошибка при создании заказа');
    return;
  }
  store.dispatch('clearPointCart', selectedPoint.value!.id);
  openPopup('Заказ успешно создан');
  selectPoint(selectedPoint.value)
}

//Изменить статус заказа
async function editStatusOrder(params: { order_id: number, status: string }) {
  const result = await editOrderStatus(selectedPoint.value!.id, params);
  if (result === null || result === undefined) {
    openPopup('Ошибка при создании заказа');
    return;
  }
  orders.value = orders.value.map(order => order.id === result.order.id ? {...order, status: result.order.status} : order)
  filterOrders(params.order_id);
  showNotificationComponent('done', `Статус заказа изменён на ${result.order.status}`)
  if (result.order.status === 'В сборке') {
    openOrderScanComponent(selectedPoint.value!.id, result.order.id)
  }
}

//API WORKS


//Выбор точки
async function selectPoint(point: Point | null) {
  claerAll();
  selectedPoint.value = point;
  openSecondComponent.value = false; 
  if (point) await getOrderByPoint(point.id);
}

async function openSettingsComponent() {
  getPointForStatistic();
  openSecondComponent.value = true; 
  is_settings.value = true;
  claerAll();
}

function claerAll() {
  orders.value = [];
  products.value = null;
  users.value = [];
  statisticByPoints.value = [];
  openThirdComponent.value = false;
  openFourthComponent.value = false;
  statisticOrderByPoint.value = [];
  filterProductsForOrder.value = undefined;
  suppliers.value = undefined;
  allReceipts.value = null;
}

const selectedCategory = ref<string>('Мороженое'); 
const searchQuery = ref('');

const filteredProducts = computed<Product[] | null>(() => {
  if (!products.value) return null;
  openThirdComponent.value = true;
  openFourthComponent.value = true;
  fourComponent.value = { label: 'cart', point_id: null , order_id: null}
  return products.value.filter(p => {
    const searchText = searchQuery.value?.toLowerCase() || '';
    const forLog = p.description.split(';').map(item => item.trim());
    console.log('forLog=', forLog)
    const matchesCategory = forLog.find(item => item === selectedCategory.value)
    console.log('matchesCategory=', matchesCategory)
    const matchesSearch =
    (p.name?.toLowerCase().includes(searchText) ?? false) ||
    (p.description?.toLowerCase().includes(searchText) ?? false);
    return matchesCategory && matchesSearch;
  });
});

function editSearchQuery(value: string) {
  searchQuery.value = value;
}

function handleSelectCategory(categoryId: string) {
  selectedCategory.value = categoryId;
}

function filterStatistic(value: number) {
  // selectedPoint.value!.id
  console.log('value=', value)
  selectedPoint.value = points.value.find(p => p.id === value)
  select_point_id_for_stats.value = value;
  const selectedPointForStat = statisticByPoints.value.find(
    (point) => point.pointId === value
  )
  statisticOrderByPoint.value = selectedPointForStat?.orders ?? [];
  openThirdComponent.value = true;
  openFourthComponent.value = true;
  fourComponent.value = null;
}

function filterOrders(id: number) {
  filterProductsForOrder.value = orders.value.find(o => o.id === id)
  fourComponent.value = { label: 'order', point_id: selectedPoint.value!.id , order_id: id}
  openThirdComponent.value = true;
  openFourthComponent.value = true;
}

function btnClick(value: string | null, param?: any) {
  switch(value) {
    case 'edit':
      isEditCart.value = true;
      break;
    case 'edit_end': 
      isEditCart.value = false;
      break;
    case 'order':
      createOrder(param);
      break;
    case 'open_cart':
      openCart.value = true;
      break;
    case null:
      break;
    case 'assemble': 
      editStatusOrder(param)
      break;
    case 'edit_order':
      openOrderScanComponent(selectedPoint.value!.id, param.order_id);
      break;
    default:
      break;
  }
}

function closeCart() {
  openCart.value = false;
  isEditCart.value = false;
}

function selectOrderIdStat(order_id: number) {
  fourComponent.value = {
    label: 'stats',
    point_id: select_point_id_for_stats.value,
    order_id: order_id
  }
}

watch(filteredProducts, (newProducts) => {
  console.log('Отфильтрованные продукты:', newProducts)
}, { immediate: true });

function openPopup(text: string | null) {
  openPop.value.open = true;
  openPop.value.text = text;
  openPop.value.buttons = [ {
    label: 'Закрыть',
    color: 'var(--orange-color)',
    type: 'cancel'
   } as btn
  ];
}

function closePopup() {
  openPop.value.open = false;
  openPop.value.text = null;
}

function showNotificationComponent(status: Status, message: string | null) {
  showNotification.value.open = true;
  showNotification.value.status = status;
  showNotification.value.message = message;
}

function hideNotificationCOmponent() {
  showNotification.value.open = false;
  showNotification.value.status = null;
  showNotification.value.message = null;
}


//Логика работы склада с существующим заказом

const isOpenOrderScanComponent = ref<{isOpened: boolean, isEdit: boolean, order: OrderForScan}>({ isOpened: false, isEdit: false, order: null });

async function openOrderScanComponent(point_id: number | null, order_id: number) {
  isOpenOrderScanComponent.value.order = await getOrderForScanById(point_id, order_id);
  isOpenOrderScanComponent.value.isOpened = true;
}

function editOrderScanComponent() {
  isOpenOrderScanComponent.value.isEdit = true;
}

function editEndOrderScanComponent() {
  isOpenOrderScanComponent.value.isEdit = false;
}

function closeOrderScanComponent() {
  isOpenOrderScanComponent.value.isOpened = false;
  isOpenOrderScanComponent.value.order = null;
}

async function getOrderForScanById(point_id: number | null, order_id: number) {
  const data = await getOrderById(point_id, order_id, store.getters.USER.role);
  return data;
}

async function completeOrder(order_id: number, items: Item[]) {
  const data = await completeOrderById(order_id, store.getters.USER.role, items);
  showNotificationComponent('done', `Статус заказа изменён на ${data.status}`)
  selectPoint(selectedPoint.value)
  closeOrderScanComponent();
  openPopup('Заказ успешно собран');
}

async function saveProgressOrder(order_id: number, items: Item[]) {
  console.log('items in save progress:', items)
  const data = await saveProgressOrderById(selectedPoint.value!.id, order_id, store.getters.USER.role, items)
  if (data) {
    showNotificationComponent('done', `Прогресс по заказу №${order_id} сохранён`)
    console.log('Прогресс по заказу сохранён. data=', data);
    closeOrderScanComponent();
  }
}

//Логика работы приёмки
const productsForReceiving = ref<ProductForReceiving[]>();
const suppliers = ref<Supplier[]>();
const isOpenreceivingComponent = ref<{
  isOpened: boolean, 
  isEdit: boolean, 
  products?: ProductForReceiving[], 
  suppliers?: Supplier[], 
  receipts?: Receipt[],
  receipt?: Receipt
}>({ 
  isOpened: false, 
  isEdit: false, 
});
const allReceipts = ref<Receipt[] | null>(null)


//Получить все товары из айки (для приёмки)
async function getAllProductsReceiving() {
  productsForReceiving.value = await getAllProductsForReceiving();
}

//Получить всех поставщиков
async function getAllSuppliersForReceiving() {
  suppliers.value = await getAllSuppliers();
}

async function getReceipts() {
  allReceipts.value = await getAllReceipts();
}

async function createNewEmptyReceipt(supplier_uuid: string | null) {
  isOpenreceivingComponent.value.isEdit = false;
  isOpenreceivingComponent.value.isOpened = false;
  isOpenreceivingComponent.value.suppliers = undefined;
  const data = await createNewReceipt(supplier_uuid);
  openReceivingCompontent({label: 'openReceiveng', id: data.id})
  await getAllProductsReceiving();
  await getReceipts();
}

async function completeReceiptById(receipt_id: number, products: ProductForComplete[]) {
  isOpenreceivingComponent.value.isEdit = false;
  isOpenreceivingComponent.value.isOpened = false;
  isOpenreceivingComponent.value.suppliers = undefined;
  isOpenreceivingComponent.value.products = undefined;
  isOpenreceivingComponent.value.receipt = undefined; 
  isOpenreceivingComponent.value.receipts = undefined;
  const data = await completeReceipt(receipt_id, products);
  console.log('data=', data);
  if (data.status === 'Отправлена в ikko') {
    openPopup(data.message);
  }
  await getAllProductsReceiving();
  await getReceipts();
}

async function saveProgressReceiptById(receipt_id: number, products: ProductForComplete[]) {
  isOpenreceivingComponent.value.isEdit = false;
  isOpenreceivingComponent.value.isOpened = false;
  isOpenreceivingComponent.value.suppliers = undefined;
  isOpenreceivingComponent.value.products = undefined;
  isOpenreceivingComponent.value.receipt = undefined; 
  isOpenreceivingComponent.value.receipts = undefined;
  const data = await saveReceiptProgress(receipt_id, products);
  console.log('data=', data);
  showNotificationComponent('done', `Прогресс по Приёмке №${receipt_id} сохранён`)
  await getAllProductsReceiving();
  await getReceipts();
}


async function getreceiptById(receipt_id: number) {
  isOpenreceivingComponent.value.receipt = await getReceiptById(receipt_id);
  isOpenreceivingComponent.value.products = productsForReceiving.value;
}


async function openReceivingCompontent(value: {label: string, id?: number}) {
  console.log('openReceivingCompontent params=', value)
  //Новая приёмка
  if (value.label === 'createNewReceiving') {
    isOpenreceivingComponent.value.isOpened = true;
    isOpenreceivingComponent.value.suppliers = suppliers.value;
  }
  //Открыть существующую приёмку
  if (value.label === 'openReceiveng') {
    if (value.id) {
      await getreceiptById(value.id);
      isOpenreceivingComponent.value.isOpened = true;
    }
  }
}

function editReceivingCompontent() {
  isOpenreceivingComponent.value.isEdit = true;
}

function editEndReceivingCompontent() {
  isOpenreceivingComponent.value.isEdit = false;
}

async function closeReceivingCompontent() {
  isOpenreceivingComponent.value.isOpened = false;
  isOpenreceivingComponent.value.products = undefined;
  isOpenreceivingComponent.value.receipt = undefined;
  isOpenreceivingComponent.value.receipts = undefined;
  isOpenreceivingComponent.value.suppliers = undefined;
  await getAllProductsReceiving();
  await getReceipts();
}

const responseItems = ref<boolean>(true)
const responsePoints = ref<boolean>(true)
const responseSuppliers = ref<boolean>(true)

async function syncProductsFromIiko(){
  responseItems.value = false;
  const res: Resp = await syncAllItemsFromIiko();
  if (res) {
    openPopup(res.message)
    responseItems.value = true
  }
}

async function syncPointsFromIiko(){
  responsePoints.value = false;
  const res: Resp = await syncAllPointsFromIiko();
  if (res) {
    openPopup(res.message)
    responsePoints.value = true
  }
}

async function syncSuppliersFromIiko(){
  responseSuppliers.value = false;
  const res: Resp = await syncAllSuppliersFromIiko();
  if (res) {
    openPopup(res.message)
    responseSuppliers.value = true
  }
}

</script>


<template>

  <Transition name="fade">
    <div class="background-blur" v-if="isOpenreceivingComponent.isOpened === true"></div>
  </Transition>
  <Transition name="fade">
    <ReceivingComponent v-if="isOpenreceivingComponent.isOpened === true"
      :is-edit="isOpenreceivingComponent.isEdit"
      :products="isOpenreceivingComponent.products"
      :suppliers="isOpenreceivingComponent.suppliers"
      :receipts="isOpenreceivingComponent.receipts"
      :receipt="isOpenreceivingComponent.receipt"
      @confirm_supplier="createNewEmptyReceipt"
      @close="closeReceivingCompontent"
      @edit_receipt="editReceivingCompontent"
      @edit_end="editEndReceivingCompontent"
      @complete_receipt="completeReceiptById"
      @save_progress_receipt="saveProgressReceiptById"
    />
  </Transition>

  <Transition name="fade">
    <div class="background-blur" v-if="isOpenOrderScanComponent.isOpened === true"></div>
  </Transition>
  <Transition name="fade">
    <OrderScanComponent v-if="isOpenOrderScanComponent.isOpened === true"
      :order="isOpenOrderScanComponent.order"
      :isEdit="isOpenOrderScanComponent.isEdit"
      :pointId="selectedPoint!.id"
      @close="closeOrderScanComponent"
      @edit="editOrderScanComponent"
      @edit_end="editEndOrderScanComponent"
      @order_complete="completeOrder"
      @save_progress_order="saveProgressOrder"
    />
  </Transition>

  <Transition name="fade">
    <NotificationModal v-if="showNotification.open === true"
      :status="showNotification.status"
      :message="showNotification.message"
      @hide_notif="hideNotificationCOmponent()"
    />
  </Transition>

  <Transition name="fade">
    <div class="background-blur" v-if="openPop?.open === true"></div>
  </Transition>
  <Transition name="fade">
    <PopUpModal v-if="openPop?.open === true"
      :btns="openPop.buttons"
      :text="openPop.text"
      @popup_close="closePopup()"
    />
  </Transition>

  <PointsAndButtons
    :points="points"
    @selectPoint="(point) => selectPoint(point)"
    @openSettings="openSettingsComponent()"
  />

  <Transition name="fade">
    <SecondComponent v-if="openSecondComponent"
      :orders="orders"
      :products="products"
      :is_settings="is_settings"
      :statisticByPoints="statisticByPoints"
      :users="users"
      :receipts="allReceipts"
      :responseItems="responseItems"
      :responsePoints="responsePoints"
      :responseSuppliers="responseSuppliers"
      @select_tab="handleSelectTab"
      @upd_users="getAllUsers"
      @select_category="handleSelectCategory"
      @select_point="filterStatistic"
      @select_order="filterOrders"
      @receipt_work="openReceivingCompontent"
      @input_search="editSearchQuery"
      @upd_items_from_iiko="syncProductsFromIiko"
      @upd_points_from_iiko="syncPointsFromIiko"
      @upd_suppliers_from_iiko="syncSuppliersFromIiko"
    />
  </Transition>

  <Transition name="fade">
    <ThirdComponent v-if="openThirdComponent"
      :products="filteredProducts"
      :pointId="selectedPoint!.id"
      :statisticOrderByPoint="statisticOrderByPoint"
      :filterProductsForOrder="filterProductsForOrder"
      @select_order_id="selectOrderIdStat"
    />
  </Transition>
  <Transition name="fade">
    <FourthComponent v-if="openFourthComponent"
      :fourComponent="fourComponent"
      :pointId="selectedPoint!.id"
      :filterProductsForOrder="filterProductsForOrder"
      :statisticOrderByPoint="statisticOrderByPoint"
      @btn_click="btnClick"
    />
  </Transition>

  
  <Transition name="fade">
    <div class="background-blur" v-if="openCart"></div>
  </Transition>
  <Transition name="translate">
    <CartView v-if="openCart"
      :point-id="selectedPoint!.id"
      :is-edit-cart="isEditCart"
      :point-name="selectedPoint!.name"
      @close_cart="closeCart"
      @btn_click="btnClick"
    />
  </Transition>

</template>


<style scoped>

.translate-move,
.translate-leave-active, 
.translate-enter-active {
  transition: all .4s ease-in-out;
}

.translate-leave-to {
  transform: translateX(100%);
}

.translate-enter-from {
  transform: translateX(100%);
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
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  background-color: var(--orange-color);
  color: white;
  font-size: 20px;
  padding: 20px 50px;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}


</style>