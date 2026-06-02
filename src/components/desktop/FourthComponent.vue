<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import store from '@/store';
import Order from '@/models/order';
import ButtonItem from '@/components/desktop/models_fourth_component/ButtonItem.vue';
import CartItemMini from '@/components/desktop/models_fourth_component/CartItemMini.vue';
import StatsOrder from '@/components/desktop/models_fourth_component/StatsOrder.vue'

const props = defineProps<{
  fourComponent: {label: string, point_id: number | null, order_id: number | null} | null,
  filterProductsForOrder?: Order,
  statisticOrderByPoint: Order[],
  pointId: number
}>();

const emit = defineEmits<{
  (e: 'btn_click', value: string | null, param?: { order_id?: number, status?: string }): void
}>()

const cartItems = computed(() => store.getters.getCartItemsByPoint(props.pointId) ?? []);

const buttonData = computed(() => {
  if (props.fourComponent?.label === 'cart') {
    if (cartItems.value.length === 0) {
      return {
        id: null,
        label: 'Пусто',
        icon: null,
        color: '#F2F2F2',
        text_color: 'black',
        opacity: '1'
      };
    } else {
      return {
        id: 'open_cart',
        label: 'Корзина',
        icon: new URL('@/assets/desktop/cart_icon.svg', import.meta.url).href,
        color: 'var(--green-color)',
        text_color: 'white',
        opacity: '1'
      };
    }
  } else if (props.fourComponent?.label === 'order') {
    if (store.getters.USER.role === 'warehouse' || store.getters.USER.role === 'admin' || store.getters.USER.role === 'warehouse_driver' || store.getters.USER.role === "warehouse_driver_loader") {
      if (props.filterProductsForOrder?.status === 'Новый') {
        return {
          id: 'assemble',
          label: 'Собираю',
          icon: null,
          color: 'var(--orange-color)',
          text_color: 'white',
          opacity: '1'
        };
      }
      if (props.filterProductsForOrder?.status === 'В сборке') {
        return {
          id: 'edit_order',
          label: 'Сканировать товары',
          icon: null,
          color: 'var(--orange-color)',
          text_color: 'white',
          opacity: '1'
        };
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
});

const contentWrapper = ref<any>(null);


watch(
  () => cartItems.value.length,
  async (n, o) => {
    if (n > o) {
      await nextTick();
      const el = contentWrapper.value?.$el;
      el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }
);

function buttonClick(btn_id: string | null) {
  switch (btn_id){
    case 'assemble': 
      emit('btn_click', btn_id, { order_id: props.filterProductsForOrder?.id, status: 'В сборке' })
      break;
    case 'open_cart': 
      emit('btn_click', btn_id)
      break;
    case 'edit_order': 
      emit('btn_click', btn_id, { order_id: props.filterProductsForOrder?.id})
    default: 
      break;
  }
}


</script>


<template>

  <div class="wrapper">
    <TransitionGroup 
      class="content-wrapper" 
      ref="contentWrapper" 
      name="group" 
      tag="div"
    >
      <!-- Статистика -->
       <div class="stats-wrapper" v-if="props.fourComponent?.label === 'stats'">
        <StatsOrder
          :point_id="props.fourComponent.point_id"
          :order_id="props.fourComponent.order_id"
        />
       </div>
      <!-- Статус заказа и комментарий -->
      <div class="order-info-wrapper" v-if="props.filterProductsForOrder">
        <div class="number-status">
          <p class="number">Заказ #{{ props.filterProductsForOrder?.id }}</p>
          <p class="status" :style="{ color: props.filterProductsForOrder?.status === 'Доставлен' ? 'var(--green-color)' : 'var(--orange-color)' }" >{{ props.filterProductsForOrder?.status }}</p>
        </div>
        <p class="comment-label">Комментарий к заказу</p>
        <div class="comment-wrapper">
          <p class="comment">{{ props.filterProductsForOrder?.comment ? props.filterProductsForOrder.comment : 'Нет комментария' }}</p>
        </div>
      </div>
      <!-- Мини-итемы в корзине -->
      <CartItemMini v-for="(item, index) in cartItems"
        :key="item.id"
        :item="item"
        :index="Number(index)"
        :is-last="index === cartItems.length - 1"
      />
    </TransitionGroup>
    <div class="buttons-wrapper" v-if="buttonData !== null">
      <ButtonItem v-if="buttonData"
        :key="String(buttonData.id)"
        :id="buttonData.id"
        :label="buttonData.label" 
        :icon="buttonData.icon" 
        :color="buttonData.color" 
        :text_color="buttonData.text_color"
        :opacity="buttonData.opacity"
        @btn_click="(value) => buttonClick(value)"
      />
    </div>
  </div>

</template>


<style scoped>

.stats-wrapper {
  margin-top: 10px;
  width: 95%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.comment-wrapper {
  width: 100%;
  padding: 15px 0;
  color: #949494;
  background-color: #F2F2F2;
  border-radius: var(--border-radius);
  display: flex;
  align-items: start;
}

.comment {
  font-size: 20px;
  margin-left: 15px;
}

.comment-label {
  font-size: 18px;
  width: 100%;
  text-align: start;
}

.status {
  font-size: 15px;
}

.number {
  font-size: 18px;
  font-weight: 700;
}

.number-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.order-info-wrapper {
  margin-top: 10px;
  width: 95%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.group-move,
.group-enter-active,
.group-leave-active {
  transition: all 0.5s ease;
}

.group-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.group-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.group-leave-active {
  position: absolute;
}


.content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  overflow-y: auto;
  gap: 10px;
}

.buttons-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: end;
  width: 100%;
  margin-bottom: 20px;
}

.wrapper {
  border-radius: var(--border-radius-desktop);
  box-shadow: var(--drop-shadow-2);
  background-color: white;
  height: 100%;
  width: 100%;
  max-width: 22.70833vw;
  min-width: 302px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  overflow: hidden;
}

</style>