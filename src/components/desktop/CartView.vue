<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import store from '@/store';
import ButtonItem from '@/components/desktop/models_fourth_component/ButtonItem.vue';
import CartItem from '@/components/desktop/models_cart_component/CartItem.vue';

const props = defineProps<{
  isEditCart: boolean,
  pointName: string,
  pointId: number
}>()

const emit = defineEmits<{
  (e: 'close_cart'):void,
  (e: 'btn_click', value: string | null, comment?: string): void
}>();

const cartItems = computed(() => store.getters.getCartItemsByPoint(props.pointId) ?? []);

const actionButtons = computed(() => {

  if (cartItems.value.length === 0) {
    return [
      { id: 'close_cart', label: 'К товарам', color: 'var(--orange-color)', text_color: 'white', icon: null }
    ];
  }

  if (props.isEditCart) {
    return [
      { id: 'edit_end', label: 'Готово', color: 'var(--orange-color)', text_color: 'white', icon: null }
    ];
  } 
  
  if (!props.isEditCart) {
    return [
      { id: 'edit', label: 'Редактировать', color: 'var(--orange-color)', text_color: 'white', icon: null },
      { id: 'order', label: 'Заказать', color: 'var(--green-color)', text_color: 'white', icon: null }
    ];
  }  
});

watch(cartItems, (newVal) => {
  if (newVal.length === 0) {
    emit('close_cart')
  }
},{immediate: true})

const searchQuery = ref<string>('');

watch(searchQuery, (newVal) => {
  console.log('searchQuery=', newVal)
},{immediate: true})

// function createOrder() {
//   emit('btn_click', )
// }

function buttonClick(value: string | null) {
  console.log('btnClick value=', value)
  switch (value) {
    case 'close_cart':
      emit('btn_click', value);
      break;
    case 'edit_end':
      emit('btn_click', value);
      break;
    case 'edit':
      emit('btn_click', value);
      break;
    case 'order':
      emit('btn_click', value, searchQuery.value);
      break;
    default: 
      break;
  }
}

</script>


<template>

    <div class="cart-wrapper" :style="{ width: props.isEditCart ? '1000px' : '806px' }">
      <div class="close-wrapper">
        <div class="point-wrapper">
          <p class="point-label">Корзина для </p>
          <p class="point-id">{{ props.pointName }}</p>
        </div>
        <button type="button" class="btn">
          <img src="@/assets/desktop/close_cart.svg" class="close-img" @click="emit('close_cart')">
        </button>
      </div>
      <div class="items-wrapper">
        <CartItem v-for="(item, index) in cartItems"
          :point-id="props.pointId"
          :item="item"
          :index="Number(index)"
          :is-last="index === cartItems.length - 1"
          :is-edit="props.isEditCart"
        />
      </div>
      <Transition 
        name="fade"
      >
        <div class="search-wrapper" v-if="!props.isEditCart">
          <img class="search-icon" src="@/assets/desktop/search_icon.svg">
          <input v-model="searchQuery"
            ref="inputRef"
            class="search"
            id="msg"
            type="text"
            placeholder="Введите комментарий..."
          />
        </div>
      </Transition>
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

.point-id {
  font-size: 24px;
  font-weight: 700;
  color: var(--orange-color);
}

.point-label {
  font-size: 20px;
  color: black;
}

.point-wrapper {
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

.cart-wrapper {
  position: absolute;
  top: 14px;
  right: 14px;
  bottom: 14px;
  width: 806px;
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