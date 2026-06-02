<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

async function scan() {
  console.log('nav=', window.navigator)
  
  try {
    // Запрашиваем разрешение на доступ к устройству
    const device = await navigator.hid.requestDevice({ filters: [] });
    console.log('device=', device)
    
    if (device && device.length > 0) {
      const selectedDevice = device[0]; // Берём первое устройство из массива
      
      // Открываем соединение с устройством
      if (!selectedDevice.opened) {
        await selectedDevice.open();
      }
      
      // Добавляем обработчик события к конкретному устройству
      selectedDevice.addEventListener("inputreport", (event) => {
        const { data, device: eventDevice, reportId } = event;
        
        // Проверяем конкретное устройство (Joy-Con Right)
        if (eventDevice.productId !== 0x2007 && reportId !== 0x3f) return;
        
        console.log('event=', event);
        console.log('data=', data);
      });
      
      console.log('Подписка на события устройства установлена');
    }
    
    // Получаем список уже подключенных устройств
    const devices = await navigator.hid.getDevices();
    devices.forEach((device) => {
      console.log(`HID: ${device.productName || 'Unknown device'}`);
    });
    
  } catch (error) {
    console.error('Ошибка при работе с HID:', error);
  }
}

onMounted(async () => {
  await scan();
});


</script>

<template>
  <div class="wrapper">
    <h3>Сканер штрих-кодов</h3>
    <div class="status-display">
    </div>
    <div class="hint">
      <p>https://nondebug.github.io/webhid-explorer/</p>
    </div>
  </div>
</template>

<style scoped>
  .wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 500px;
    background-color: aqua;
    border-radius: 50px;
    z-index: 11;
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
  }
  
  .status-display {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    min-width: 400px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 18px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .status-display p {
    margin: 0;
  }
  
  .hint {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    padding: 15px;
    max-width: 500px;
    text-align: center;
    color: #856404;
  }
  
  .hint p {
    margin: 0;
    font-size: 14px;
  }
</style>