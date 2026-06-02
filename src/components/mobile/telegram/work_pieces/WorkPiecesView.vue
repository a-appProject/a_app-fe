<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import router from '@/router';
import Product from '@/models/product';
import { getProductForCooking } from '@/composables/itemWorker';
import { setBottomButton, hideBottomButton, setBackButton, hideBackButton } from '@/tools/setTelegramButtons';
import { setHaptic } from '@/tools/setTelegramHaptick';
import SpinLoader from '@/SpinLoader.vue';
import PieceItem from '@/components/mobile/telegram/work_pieces/PieceItem.vue';
import store from '@/store';

const mainButtonPressed = () => {
  setHaptic();
  router.push(`/cart_pieces?point_id=store_warehouse`);
}

const products = ref<Product[] | null>(null);

async function getProductsForPieces() {
  products.value = await getProductForCooking();
  setBottomButton('Корзина', '31B545', 'FFFFFF', mainButtonPressed)
}

onMounted(async () => {
  setBackButton();
  await getProductsForPieces();
})

onUnmounted(() => {
  hideBackButton();
  hideBottomButton();
});

console.log('store:', store)

</script>

<template>

  <div class="shop-wrapper">
    <div class="shop-items" v-if="products">
      <PieceItem v-for="(product, index) in products" 
        :product="product"
        :key="index"
      />
    </div>
    <div v-else class="no-products"> 
      <p>Получаем продукты</p>
      <SpinLoader/>
    </div>
  </div>

</template>

<style scoped>

.no-products{
  color: black;
  margin-top: 20px;
  font-size: 20px;
  font-weight: 500;
}

.shop-items{
 display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 30px;
  gap: 18px;
}

.shop-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}


</style>
