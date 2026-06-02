<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { on, off, postEvent } from '@tma.js/sdk-vue'
import router from '@/router';
import { setBottomButton, hideBottomButton } from '@/tools/setTelegramButtons';
import { getAllReceipts, getAllSuppliers, createNewReceipt } from '@/composables/receivingWorker';
import Receipt from '@/models/receiving/receipt';
import Supplier from '@/models/receiving/supplier';
import ReceiptItem from '@/components/mobile/telegram/receiving/receipts/ReceiptItem.vue';
import SuppliersList from '@/components/mobile/telegram/receiving/suppliers/SuppliersList.vue';

//Кли по существующей приёмке -> пуш в ScannedItemsList с id приёмки

const allReceipts = ref<Receipt[] | null>(null);
const isOpenedPopUpSuppliersList = ref<boolean>(false);
const suppliers = ref<Supplier[]>([]);
const isSelected = ref<string | null>(null);

function backButtonPressed() {
  if (isOpenedPopUpSuppliersList.value === true) {
    closeSupplierList();
  }
  else {
    router.go(-1);
  }
}

async function mainButtonPressed() {
  if (isOpenedPopUpSuppliersList.value === true) {
    const data = await createNewReceipt(isSelected.value);
    if (data) {
      router.push(`/scanned_list?receipt_id=${data.id}`)
      hideBottomButton();
      off('main_button_pressed', mainButtonPressed);
    }
  }
  else {
    await getSuppliers();
    isOpenedPopUpSuppliersList.value = true;
    hideBottomButton();
    off('main_button_pressed', mainButtonPressed);
  }
}

async function getReceipts(){
  allReceipts.value = await getAllReceipts();
}

function selectReceipt(receiptId: number) {
  router.push(`/scanned_list?receipt_id=${receiptId}`)
}

function closeSupplierList() {
  isOpenedPopUpSuppliersList.value = false;
  setBottomButton('Создать новую приёмку', '007AFF', 'FFFFFF', mainButtonPressed, true);
}

async function getSuppliers() {
  suppliers.value = await getAllSuppliers();
}

function selectSupplier(uuid: string) {
  isSelected.value = uuid;
  setBottomButton('Создать новую приёмку', '007AFF', 'FFFFFF', mainButtonPressed, true);
}

onMounted(async() => {
  await getReceipts();
  postEvent('web_app_setup_back_button', {is_visible: true});
  on('back_button_pressed', backButtonPressed);
  setBottomButton('Создать новую приёмку', '007AFF', 'FFFFFF', mainButtonPressed, true);
})

onUnmounted(() => {
  postEvent('web_app_setup_back_button', {is_visible: false});
  off('back_button_pressed', backButtonPressed)
  hideBottomButton();
})


</script>

<template>
  <div class="background-blur" v-if="isOpenedPopUpSuppliersList"></div>
  <SuppliersList v-if="isOpenedPopUpSuppliersList"
    :suppliers="suppliers"
    :is-selected="isSelected"
    @select_supplier="selectSupplier"
  />

  <div class="receipts-wrapper">
    <div class="label">{{ allReceipts?.length ? 'Все приёмки' : 'Нет созданных приёмок' }}</div>
    <div class="suppliers-wrapper" v-if="allReceipts?.length !== 0">
      <ReceiptItem v-for="(receipt, index) in allReceipts"
        :receipt="receipt"
        @select_receipt="selectReceipt"
      />
    </div>
  </div>

</template>

<style scoped>

.background-blur {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0; 
  background-color: #8E8E9290;
  backdrop-filter: blur(10px);
}

.suppliers-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.label {
  width: 100%;
  text-align: start;
  font-size: 20px;
  color: black;
  font-weight: 600;
}

.receipts-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  width: 100%;
}

</style>