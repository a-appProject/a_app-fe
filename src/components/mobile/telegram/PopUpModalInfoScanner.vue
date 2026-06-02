<script setup lang="ts">
import store from '@/store';

const emit = defineEmits<{
  (e: 'close'): string
}>()

</script>

<template>

  <div class="info-wrapper">
    <div class="close-wrapper">
      <button type="button" class="btn btn-close">
        <img src="@/assets/desktop/close_cart.svg" class="close-img" @click="emit('close')">
      </button>
    </div>
    <p class="label">Как работать со сканером</p>

    <section class="mobile" v-if="store.getters.AUTH_TOKEN === null">
      <p class="setion">Как подключить сканер?</p>
      <p class="descr">1. Перевести сканер в режим HID устройства</p>
      <img class="img" src="@/assets/set_hid.png">
      <p class="descr">2. Перевести сканер в режим подключения по блютуз</p>
      <img class="img" src="@/assets/bluetooth.png">
      <p class="descr">3. Подключить сканер к телефону</p>
      <p class="descr">4. Активировать переключатель "Подключить внешний сканер"</p>
      <p class="setion" :style="{ color: 'var(--red-color)', width: '100%', textAlign: 'center' }">!!!ВАЖНО!!!</p>
      <div class="warning">
        <p >Если к телефону подключен сканер, то клавиатура не будет открываться, так как сканер заменяет клавиатуру"</p>
      </div>
    </section>
    
    <p class="setion">Сканер не работает?</p>
    <p class="descr">1. Сбросьте сканер до заковских настроек</p>
    <img class="img" src="@/assets/reboot_settings.png">
    <p class="descr">2. Если сканер также не работает, настроить суффиксы</p>
    <img class="img" src="@/assets/suf.png">
  </div>

</template>

<style scoped>

.warning {
  width: 100%;
  height: 100px;
  border: 2px solid var(--red-color);
  border-radius: 20px;
  text-wrap: balance;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  text-align: center;
}

.mobile {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  gap: 15px;
}

.img {
  width: 100%;
}

.descr {
  font-size: 16px;
  text-align: start;
}

.label {
  font-size: 20px;
  font-weight: 700;
}

.setion {
  font-size: 18px;
  font-weight: 700;
}

.close-img {
  width: 30px;
}

.btn-close {
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

.close-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: end;
}

.info-wrapper {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 99;
  background-color: white;
  border-radius: 25px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  gap: 15px;
  padding: 20px;
  max-width: 390px;
}

.info-wrapper::-webkit-scrollbar {
  display: none;
}

</style>