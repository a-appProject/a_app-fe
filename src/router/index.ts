import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SettingsView from '@/components/mobile/telegram/SettingsView.vue'
import ShopItemView from '@/components/mobile/telegram/ShopItemView.vue'
import CartView from '@/components/mobile/telegram/CartView.vue'
// import AddProduct from '@/components/mobile/telegram/admin_components/AddProduct.vue'
import HomeWrapper from '@/HomeWrapper.vue'
import OrderScanComponent from '@/components/mobile/telegram/OrderScanComponent.vue'
import ReceiptsList from '@/components/mobile/telegram/receiving/receipts/ReceiptsList.vue'
import ScannedItemsList from '@/components/mobile/telegram/receiving/scanning/ScannedItemsList.vue'
import OrderView from '@/components/mobile/telegram/OrderView.vue'
import WorkersView from '@/components/mobile/telegram/settings_components/setting_list/WorkersView.vue'
import StatisticView from '@/components/mobile/telegram/settings_components/setting_list/StatisticView.vue'
import WorkWithItemsView from '@/components/mobile/telegram/settings_components/setting_list/WorkWithItemsView.vue'
import WorkPiecesView from '@/components/mobile/telegram/work_pieces/WorkPiecesView.vue'
import CartPieces from '@/components/mobile/telegram/work_pieces/CartPieces.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeWrapper
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopItemView
  }, 
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView
  },
  // {
  //   path: '/add_product',
  //   name: 'add_product',
  //   component: AddProduct
  // },
  {
    path: '/order_scan_component',
    name: 'order_scan_component',
    component: OrderScanComponent
  },
  {
    path: '/receiving',
    name: 'receiving',
    component: ReceiptsList
  },
  {
    path: '/scanned_list',
    name: 'scaned',
    component: ScannedItemsList
  },
  {
    path: '/order',
    name: 'order',
    component: OrderView
  },
  {
    path: '/workers',
    name: 'workers',
    component: WorkersView
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatisticView
  },
  {
    path: '/work_items',
    name: 'work_items',
    component: WorkWithItemsView
  },
  {
    path: '/work_pieces',
    name: 'work_pieces',
    component: WorkPiecesView
  },
  {
    path: '/cart_pieces',
    name: 'cart_pieces',
    component: CartPieces
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router