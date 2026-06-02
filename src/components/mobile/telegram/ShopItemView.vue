<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import router from '@/router';
import { useRoute } from "vue-router";
import ShopItem from '@/components/mobile/telegram/shop_components/ShopItem.vue';
import Product from '@/models/product';
import { getProductsByPoint } from '@/composables/itemWorker';
import { setBottomButton, hideBottomButton, setBackButton, hideBackButton } from '@/tools/setTelegramButtons';
import { setHaptic } from '@/tools/setTelegramHaptick';
import iconMapping from '@/models/iconmapping';
import categories from '@/models/productsCategories';
import SpinLoader from '@/SpinLoader.vue';

const mainButtonPressed = () => {
  setHaptic();
  router.push(`/cart?point_uuid=${point_uuid.value}&point_id=${point_id.value}`);
}

const products = ref<Product[] | null>(null);
const point_uuid = ref();
const point_id = ref();
const editRef = ref(false);
const search = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('Под заказ');
const respIsResieved = ref<boolean>(false)

async function getAllProducts() {
  products.value = await getProductsByPoint(point_uuid.value)
  respIsResieved.value = true
}

onMounted(async () => {
  setBackButton();
  setBottomButton('Корзина', '31B545', 'FFFFFF', mainButtonPressed)
  point_uuid.value = String(useRoute().query.point_uuid);
  point_id.value = Number(useRoute().query.point_id);
  await getAllProducts();
})

onUnmounted(() => {
  hideBackButton();
  hideBottomButton();
});

const filteredProducts = computed(() => {
  return (products.value ?? [])
    .filter((product: Product) => {
      const searchText = searchQuery.value?.toLowerCase() || '';
      const forLog = product.description.split(';').map(item => item.trim());
      const matchesCategory = forLog.find(item => item === selectedCategory.value)
      const matchesSearch =
        (product.name?.toLowerCase().includes(searchText) ?? false) ||
        (product.description?.toLowerCase().includes(searchText) ?? false);
      return matchesCategory && matchesSearch;
    })
    .map((product: Product) => ({
      ...product,
      icon: iconMapping[product.description] || product.icon || ''
    }));
});

function openSearch() {
  search.value = !search.value;
}

function editproducts() {
  editRef.value = !editRef.value;
}


</script>

<template>

  <div class="shop-wrapper">
    <div class="shop-header">
      <div class="sections-shop">
        <div class="section-scroll">
          <div 
            v-for="category in categories"
            :key="category.id"
            :class="[category.class, { active: selectedCategory === category.name }]"
            :style="{ color: selectedCategory === category.name ? 'white' : 'black' }"
            @click="setHaptic(); selectedCategory = category.name"
          >
            {{ category.name.toUpperCase() }}
          </div>
        </div>
      </div>
      <div class="search-icon" @click="setHaptic(); openSearch()">
        <svg width="20px" height="20px" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.1434 8.57148C17.1434 13.3054 13.3057 17.143 8.57168 17.143C3.83767 17.143 0 13.3054 0 8.57148C0 3.83758 3.83767 0 8.57168 0C13.3057 0 17.1434 3.83758 17.1434 8.57148ZM1.80604 8.57148C1.80604 12.3079 4.83512 15.337 8.57168 15.337C12.3082 15.337 15.3373 12.3079 15.3373 8.57148C15.3373 4.83501 12.3082 1.806 8.57168 1.806C4.83512 1.806 1.80604 4.83501 1.80604 8.57148Z" fill="black"/>
          <path d="M19.206 20.7959C19.6454 21.2353 20.3577 21.2353 20.7971 20.7959C21.2364 20.3566 21.2364 19.6442 20.797 19.2049L19.206 20.7959ZM13.0834 14.6734L19.206 20.7959L20.797 19.2049L14.6744 13.0824L13.0834 14.6734Z" fill="black"/>
        </svg>
      </div>
    </div>
    <div class="search-wrapper" v-if="search">
      <input v-model="searchQuery"
          ref="inputRef"
          class="text"
          id="msg"
          type="text"
          placeholder="Поиск..."
        />
        <div class="close-search-icon-wrapper" @click="setHaptic(); openSearch()">
          <img class="icon-close-search" src="@/assets/close_search.svg">
        </div>
    </div>
    <div class="shop-items" v-if="filteredProducts.length > 0 && respIsResieved">
      <ShopItem v-for="(product, index) in filteredProducts" 
        :product="product"
        :key="index"
        :id="product.id"
        :name="product.name"
        :description="selectedCategory"
        :packaging="product.packaging"
        :icon="product.icon"
        :point-id="point_id"
      />
    </div>
    <SpinLoader v-else-if="!respIsResieved"/>
    <p v-else class="no-products">Не нашли ничего похожего :(</p>
  </div>

</template>

<style scoped>

.admin-header-edit{
  font-size: 15px;
  color: var(--green-color);
  font-weight: 600;
}

.admin-header-label{
  font-size: 18px;
  color: black;
  font-weight: 600;
}

.admin-header{
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
}

.shop-items-admin{
  width: 100%;
}

.no-products{
  color: black;
  margin-top: 20px;
  font-size: 20px;
  font-weight: 500;
}

.close-search-icon-wrapper{
  position: absolute;
  display: flex;
  right: 0;
  width: 15%;
  justify-content: end;
  height: 100%;
}

.icon-close-search{
  max-width: 14px;
  margin-right: 30%;
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

.search-wrapper{
  position: relative;
  margin-top: 30px;
  width: 100%;
  height: 50px;
  background-color: #EFEFF3;
  border-radius: var(--border-radius);
  display: flex;
  justify-content: center;
  align-items: center;
}

.active {
  background-color: var(--green-color);
  color: white;
}

.test-btn-cart{
  position: absolute;
  background-color: var(--green-color);
  bottom: 10px;
  color: white;
  padding: 20px 100px;
  border-radius: var(--border-radius);
}

.shop-items{
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 30px;
  margin-bottom: 30px;
  gap: 18px;
}

.search-icon{
  display: flex;
  background-color: var(--grey-color);
  padding: 12px;
  border-radius: var(--border-radius);
}

/* .first-section1{ 
  font-size: 13px;
  font-weight: 500;
  padding: 10px 13px;
  border-radius: var(--border-radius);
  background-color: var(--green-color);
  color: white;
} */

.first-section, .second-section, .third-section, .four-section, .five-section, .six-section, .seven-section, .eight-section, .nine-section{
  font-size: 13px;
  font-weight: 500;
  color: black;
  padding: 10px 13px;
  border-radius: var(--border-radius);
  white-space: nowrap;
}

.section-scroll {
  overflow-x: scroll;
  display: flex;
  max-width: 78vw;
  background-color: var(--grey-color);
  border-radius: var(--border-radius);
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding: 5px;
}

.section-scroll::-webkit-scrollbar {
  display: none;
}

.sections-shop {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  height: 100%;
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 13px;
}

.shop-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}


</style>
