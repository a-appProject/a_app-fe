<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import router from "@/router";
import { useStore } from "vuex";
import {useRoute} from "vue-router";
import { setHaptic } from "@/tools/setTelegramHaptick";
import { setBackButton, hideBackButton, setBottomButton, hideBottomButton } from '@/tools/setTelegramButtons';
import { addOrder } from '@/composables/orderWorkerk';
import { createPopupManager } from '@/tools/setTelegramPopUp'
import CartItem from '@/components/mobile/telegram/cart_components/CartItem.vue';
import { ProductWithPackaging } from "@/models/product";

const point_uuid = ref();
const point_id = ref();
const store = useStore();
const editRef = ref(false);
const inputRefComment = ref<HTMLInputElement | null>(null);
let mainButtonListener: (() => void) | null = null;
const popupManager = createPopupManager();

const handleMainButton = async () => {
  setHaptic();
  if (cartItems.value.length !== 0){
    await createOrder();
  }
  else {
    router.push('/')
  }
};

onMounted(async() => {
  setBackButton();
  point_uuid.value = useRoute().query.point_uuid;
  point_id.value = Number(useRoute().query.point_id);
  console.log('point_id.value=', point_id.value)

  mainButtonListener = handleMainButton;
  if(cartItems.value.length > 0) {
    setBottomButton('Заказать', '31B545', 'FFFFFF', handleMainButton)
  }
  else {
    setBottomButton('На главную', '31B545', 'FFFFFF', handleMainButton)
  }
})

onUnmounted(() => {
  hideBackButton();
  hideBottomButton();
});

//Функция редактирования корзины
const editCart = () => {
  editRef.value = !editRef.value;
}

//Создать заказ
async function createOrder() {
  hideBottomButton();

  const data = await addOrder(point_id.value, inputRefComment.value!.value, formattedCartItems.value)
  if (data) {
    popupManager.openPopup(`Ваш заказ успешно добавлен`,
      (buttonId) => {
        console.log("Нажата кнопка:", buttonId);
      },
    );
    router.push('/');
    store.dispatch('clearPointCart', point_id.value);
  }
}

//Логика рендера товаров корзины
const cartItems = computed(() => {
  return store.getters.getCartItemsByPoint(point_id.value);
}) 

const isCatrIsEmpty = ref<boolean>(true)

watch(() => cartItems.value, (newVal) => {
  console.log('newVal=', newVal.length)
  if (newVal.length !== 0) {
    isCatrIsEmpty.value = false
  }
}, {immediate:true})

const formattedCartItems = computed<{ name: string; quantity: number, containerId: string }[]>(() =>
  cartItems.value.map((item: ProductWithPackaging) => ({
    name: item.name as string,
    quantity: item.quantity as number,
    containerId: item.packaging.id as string
  }))
);

</script>

<template>
  <div class="card-back">
    <div class="cart-wrapper">
      <div v-if="isCatrIsEmpty" class="btn-toshop">
        КОРЗИНА ПУСТА
      </div>
      <div class="cart-header" v-else>
        <p class="name-cart">{{ !isCatrIsEmpty ? 'Корзина' : 'Корзина пуста' }}</p>
        <p class="edit-cart" :style="{ color: editRef ? 'var(--orange-color)' : 'var(--green-color)' }" @click="editCart()">{{ editRef ? 'Подтвердить' : 'Редактировать' }}</p>
      </div>
      <div v-if="!isCatrIsEmpty" class="cart-items">
        <CartItem v-for="item in cartItems"
          :item="item"
          :point_id="point_id"
          :editRef="editRef"
        />
      </div>
      <div class="input-wrapper" v-if="!isCatrIsEmpty">
        <input
          ref="inputRefComment"
          class="text"
          id="msg"
          type="text"
          placeholder="Добавить комментарий"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

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

.cart-items{
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  width: 100%;
  gap: 15px;
}

.edit-cart{
  font-size: 15px;
  color: var(--green-color);
  font-weight: 600;
}

.name-cart{
  font-size: 18px;
  color: black;
  font-weight: 600;
}

.cart-header{
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.cart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
}

.card-back {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>