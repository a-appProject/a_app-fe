<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Supplier from '@/models/receiving/supplier';
import SupplierItem from '@/components/mobile/telegram/receiving/suppliers/SupplierItem.vue';


const props = defineProps<{
  suppliers: Supplier[]
  isSelected: string | null
}>()

const emit = defineEmits<{
  (e: 'select_supplier', value: string): void
}>()

function selectSupplier(uuid: string) {
  emit('select_supplier', uuid)
}

const isShowSearch = ref<boolean>(false);
const searchQuery = ref<string>('');
const suppliers = ref<Supplier[]>([])

onMounted(() => {
  console.log(props.suppliers)
  if (props.suppliers) {
    suppliers.value = props.suppliers
  }
})

function showHideSearch() {
  isShowSearch.value = !isShowSearch.value
  searchQuery.value = ''
}

const suppliersToRender = computed<Supplier[] | []>(() => {
  if (!searchQuery.value && suppliers.value) {
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


</script>

<template>

  <div class="suppliers-body">
    <div class="label-search-wrapper">
      <p class="label">Выберите поставщика</p>
      <button type="button" class="btn-search" @click="showHideSearch()">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1_4764_731" fill="white">
            <path d="M17.1431 8.57134C17.1431 13.3052 13.3055 17.1427 8.57154 17.1427C3.83761 17.1427 0 13.3052 0 8.57134C0 3.83752 3.83761 0 8.57154 0C13.3055 0 17.1431 3.83752 17.1431 8.57134ZM1.80601 8.57134C1.80601 12.3078 4.83504 15.3367 8.57154 15.3367C12.308 15.3367 15.3371 12.3078 15.3371 8.57134C15.3371 4.83493 12.308 1.80597 8.57154 1.80597C4.83504 1.80597 1.80601 4.83493 1.80601 8.57134Z"/>
            </mask>
            <path d="M17.1431 8.57134C17.1431 13.3052 13.3055 17.1427 8.57154 17.1427C3.83761 17.1427 0 13.3052 0 8.57134C0 3.83752 3.83761 0 8.57154 0C13.3055 0 17.1431 3.83752 17.1431 8.57134ZM1.80601 8.57134C1.80601 12.3078 4.83504 15.3367 8.57154 15.3367C12.308 15.3367 15.3371 12.3078 15.3371 8.57134C15.3371 4.83493 12.308 1.80597 8.57154 1.80597C4.83504 1.80597 1.80601 4.83493 1.80601 8.57134Z" fill="black" stroke="black" stroke-width="1.6667" mask="url(#path-1-inside-1_4764_731)"/>
            <path d="M19.205 20.7958C19.6443 21.2352 20.3566 21.2352 20.796 20.7958C21.2353 20.3565 21.2353 19.6441 20.796 19.2048L20.0005 20.0003L19.205 20.7958ZM13.8779 13.8779L13.0824 14.6734L19.205 20.7958L20.0005 20.0003L20.796 19.2048L14.6734 13.0824L13.8779 13.8779Z" fill="black"/>
          </svg>
        </button>
    </div>
    <div class="search-wrapper" v-if="isShowSearch">
      <input v-model="searchQuery"
          ref="inputRef"
          class="text"
          id="msg"
          type="text"
          placeholder="Поиск..."
        />
        <div class="close-search-icon-wrapper" @click="showHideSearch()">
          <img class="icon-close-search" src="@/assets/close_search.svg">
        </div>
    </div>
    <div class="suppliers-wrapper">
      <SupplierItem v-for="(supplier, index) in suppliersToRender"
        :supplier="supplier"
        :is-selected="props.isSelected === supplier.uuid"
        @select_supplier="selectSupplier"
      />
    </div>
  </div>

</template>

<style scoped>

.icon-close-search{
  max-width: 14px;
}

.close-search-icon-wrapper{
  margin-right: 10px;
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
  height: 50px;
}

.search-wrapper{
  position: relative;
  width: 100%;
  height: 50px;
  background-color: #EFEFF3;
  border-radius: var(--border-radius);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: var(--drop-shadow-2);
}

.btn-search {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  background: 0;
  margin-right: 10px;
} 

.label-search-wrapper {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.suppliers-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 10px;
  overflow-y: scroll;
  width: 100%;
}

.suppliers-wrapper::-webkit-scrollbar {
  display: none;
}

.label {
  width: 100%;
  text-align: start;
  font-size: 20px;
  color: black;
  font-weight: 600;
}

.suppliers-body {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  background-color: white;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 15px;
  padding: 20px;
}

</style>