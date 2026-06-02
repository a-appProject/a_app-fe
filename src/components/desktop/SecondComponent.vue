<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import store from '@/store';
import Tab from '@/models/tab';
import Order from '@/models/order';
import Button from '@/models/button';
import Product from '@/models/product';
import User from '@/models/user';
import PointsAndOrders from '@/models/points&orders';
import Receipt from '@/models/receiving/receipt';
import ButtonItem from './models_fourth_component/ButtonItem.vue';
import TabbsButtons from '@/components/desktop/models_second_component/TabbsButtons.vue';
import OrderViewComponent from '@/components/desktop/models_second_component/OrderViewComponent.vue';
import ProductsCategoryButtons from '@/components/desktop/models_second_component/ProductsCategoryButtons.vue';
import StatisticWrapper from '@/components/desktop/models_second_component/StatisticWrapper.vue';
import UserWrapper from '@/components/desktop/models_second_component/UserWrapper.vue';
import SupplierReceiptViewComponent from '@/components/desktop/models_second_component/SupplierReceiptViewComponent.vue';
import AnimatePlaceHolder from '@/components/AnimatePlaceHolder.vue';
import categories from '@/models/productsCategories';

const props = defineProps<{ 
  orders: Order[],
  products: Product[] | null,
  is_settings: boolean,
  statisticByPoints: PointsAndOrders[] | null,
  users: User[],
  receipts: Receipt[] | null,
  responseItems: boolean,
  responsePoints: boolean,
  responseSuppliers: boolean
}>();

console.log('second component props =', props)

const emit = defineEmits<{
  (e: 'select_tab', value: string): void,
  (e: 'upd_users'): void
  (e: 'select_category', value: string): void, 
  (e: 'select_point', value: number): void,
  (e: 'select_order', value: number): void,
  (e: 'receipt_work', value: { label: string, id?: number }): void
  (e: 'input_search', value: string): void,
  (e: 'upd_items_from_iiko'): void,
  (e: 'upd_points_from_iiko'): void,
  (e: 'upd_suppliers_from_iiko'): void,
}>()

const roleTabsMap: Record<string, { left: Tab; right: Tab }> = {
  warehouse: { 
    left: { id: '---', label: '---' }, 
    right: { id: 'orders', label: 'Заказы' } 
  },
  loader: { 
    left: { id: 'products', label: 'Товары' }, 
    right: { id: 'orders', label: 'Заказы' } 
  },
  warehouse_driver_loader: { 
    left: { id: 'products', label: 'Товары' }, 
    right: { id: 'orders', label: 'Заказы' } 
  },
  warehouse_driver: { 
    left: { id: 'products', label: 'Товары' }, 
    right: { id: 'orders', label: 'Заказы' } 
  },
  cass: {
    left: { id: 'products', label: 'Товары' }, 
    right: { id: 'orders', label: 'Заказы' } 
  },
  admin_settings: {
    left: { id: 'staff', label: 'Сотрудники' }, 
    right: { id: 'stats', label: 'Статистика' } 
  },
}

const tabsConfig = computed<{ left: Tab; right: Tab } | null>(() => {
  const role = store.getters.USER.role
  
  if (role === 'admin' && props.is_settings) {
    return roleTabsMap['admin_settings']
  }
  
  if (!props.is_settings && props.orders) {
    if (role === 'cass') return roleTabsMap['cass']
    if (role === 'loader') return roleTabsMap['loader']
    if (['warehouse', 'warehouse_driver', 'admin', 'warehouse_driver_loader'].includes(role)) {
      //Добавить обработку новой роли
      return roleTabsMap['warehouse']
    }
  }
  
  return null
})

const leftTabs = computed<Tab[]>(() =>
  tabsConfig.value ? [tabsConfig.value.left] : []
)

const rightTabs = computed<Tab[]>(() =>
  tabsConfig.value ? [tabsConfig.value.right] : []
)

const selectedTab = ref<string>('')

watch(tabsConfig,(config) => {
  if (!config) return
  selectedTab.value = config.right.id
},{ immediate: true })

watch(selectedTab, (newValue) => {
  emit('select_tab', newValue)
}, {immediate: true})

//Работа с товарами

const categoryButtons: Button[] = categories

const selectedCategoryButton = ref<number>(1)

watch(() => categoryButtons,() => {
  if (!selectedCategoryButton.value) {
    selectedCategoryButton.value = 1
  }
},{ immediate: true })

watch(selectedCategoryButton, (newCategory) => {
  const categoryObj = categoryButtons.find(c => c.id === newCategory);
  if (categoryObj) {
    emit('select_category', categoryObj.name)
  }
})

const searchQuery = ref('');

watch(searchQuery, (newVal) => {
  emit('input_search', newVal);
})

const openEditUserId = ref<number | null>(null);
const openDelUserId = ref<number | null>(null);
const selectOrder = ref<number | null>(null);
const selectOrderStat = ref<number | null>(null);
const selectedReceipt = ref<number | undefined>();

function selectOrderId(id: number) {
  selectOrder.value = id;
  emit('select_order', id)
}

function selectOrderIdForStat(id: number) {
  selectOrder.value = id;
  emit('select_point', id)
}

function createNewReceipt() {
  emit('receipt_work', {label: 'createNewReceiving'})
}

function selectReceipt(receipt: number | undefined) {
  selectedReceipt.value = receipt;
  emit('receipt_work', {label: 'openReceiveng', id: receipt})
}

function updItemsFromIiko() {
  emit('upd_items_from_iiko');
}

function updPointFromIiko() {
  emit('upd_points_from_iiko');
}

function updSuppliersFromIiko() {
  emit('upd_suppliers_from_iiko');
}

</script>



<template>

  <div class="wrapper">
    <div class="head">
      <TabbsButtons v-if="leftTabs[0].id !== '---'"
        :tabs="leftTabs"
        v-model="selectedTab"
      />
      <TabbsButtons
        :tabs="rightTabs"
        v-model="selectedTab"
      />
    </div>
    <div class="items-wrapper">
      <!-- Заказы -->
      <OrderViewComponent v-if="props.orders" v-for="(order, index) in props.orders"
        :id="order.id"
        :status="order.status"
        :index="index"
        :is-selected="selectOrder === order.id"
        @select_order="selectOrderId"
      />
      <!-- Заказы -->

      <!-- Товары -->
      <Transition name="fade">
        <div class="search-wrapper" v-if="props.products !== null">
          <img class="search-icon" src="@/assets/desktop/search_icon.svg">
          <input v-model="searchQuery"
            ref="inputRef"
            class="search"
            id="msg"
            type="text"
            placeholder="Поиск..."
          />
        </div>
      </Transition>
      <TransitionGroup
        class="buttons-wrapper"
        name="fade"
        tag="div"
      >
        <ProductsCategoryButtons
          v-if="props.products !== null"
          v-for="button in categoryButtons"
          :key="button.id"
          :button="button"
          v-model="selectedCategoryButton"
        />
      </TransitionGroup>
      <!-- Товары -->

      <!-- Статистика -->
      <StatisticWrapper v-if="props.statisticByPoints !== null" v-for="(point, index) in props.statisticByPoints"
        :point="point"
        :index="index"
        :is-selected="selectOrderStat === point.pointId"
        @select_point="selectOrderIdForStat"
      />
      <!-- Статистика -->

      <!-- Сотрудники -->
      <button v-if="props.users.length !== 0"
        type="button"
        class="btn-sync"
        @click="updItemsFromIiko()" 
      >
        <AnimatePlaceHolder v-if="!props.responseItems"/>
        <p v-else class="label">Синхронизировать товары из Айки</p>
      </button>
      <button v-if="props.users.length !== 0"
        type="button"
        class="btn-sync"
        @click="updPointFromIiko()" 
      >
        <AnimatePlaceHolder v-if="!props.responsePoints"/>
        <p v-else class="label">Синхронизировать точки из айки</p>
      </button>
      <button v-if="props.users.length !== 0"
        type="button"
        class="btn-sync"
        @click="updSuppliersFromIiko()" 
      >
        <AnimatePlaceHolder v-if="!props.responseSuppliers"/>
        <p v-else class="label">Синхронизировать поставщиков из айки</p>
      </button>
      <UserWrapper v-if="props.users !== null" v-for="(user, index) in props.users"
        :key="user.id"
        :user="user"
        :index="index"
        :is-open-edit="openEditUserId === user.id"
        :is-open-del="openDelUserId === user.id"
        @open-edit="openEditUserId = user.id"
        @close-edit="openEditUserId = null"
        @open-del="openDelUserId = user.id"
        @close-del="openDelUserId = null"
        @upd_users="emit('upd_users'); openDelUserId = null; openEditUserId = null"
      />
      <!-- Сотрудники -->

      <!-- Приёмка -->
      <TransitionGroup 
        class="buttons-wrapper-receiving" 
        name="buttons-transition" 
        tag="div"
      >
        <ButtonItem v-if="props.receipts"
          :id="'create_new_receiving'"
          :label="'Создать новую приёмку'"
          :color="'var(--orange-color)'"
          :text_color="'white'"
          :icon="null" 
          @btn_click="createNewReceipt"
        />
      </TransitionGroup>
      <SupplierReceiptViewComponent v-if="props.receipts" v-for="(receipt, index) in props.receipts"
        :index="index"
        :key="receipt.id"
        :receipt="receipt"
        :is-selected="selectedReceipt === receipt.id"
        @select_receipt="selectReceipt"
      />
       <!-- Приёмка -->

    </div>
  </div>
  
</template>



<style scoped>

.btn-sync {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  width: 95%;
  height: 50px;
  border-radius: var(--border-radius);
  background-color: var(--orange-color);
  box-shadow: var(--drop-shadow-2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all .3s ease;
}

.btn-sync:active {
  transform: var(--transform-scale-active);
}

.label {
  font-size: 19px;
  color: white;
}

.text-null {
  font-size: 20px;
  color: black;
  margin-top: 20px;
}

.buttons-wrapper-receiving {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.buttons-wrapper{
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  row-gap: 15px;
  column-gap: 15px;
  width: 95%;
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
  margin-left: 5px;
}

.search-icon{
  max-width: 20px;
  margin-left: 20px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  justify-content: start;
  width: 95%;
  height: 20px;
  padding: 10px 0;
  background-color: #F6F6F6;
  border-radius: var(--border-radius);
  margin-top: 10px;
}

.items-wrapper{
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 15px;
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding-bottom: 10px;
  align-items: center;
  position: relative;
}

/* .items-wrapper::-webkit-scrollbar {
  display: none;
} */

.head {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 70px;
  flex-shrink: 0;
}

.wrapper {
  border-radius: var(--border-radius-desktop);
  box-shadow: var(--drop-shadow-2);
  background-color: white;
  height: 100%;
  width: 100%;
  max-width: 24vw;
  min-width: 461px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  overflow: hidden;
  overflow: hidden;
}

</style>