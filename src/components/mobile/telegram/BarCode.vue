<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import {BrowserMultiFormatReader} from '@zxing/browser'
import { createPopupManager } from '@/tools/setTelegramPopUp';

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'findItem', value: string): void
}>()

const scannedResult = ref('');
const isScanning = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
let codeReader: BrowserMultiFormatReader | null = null;
let hasScanned = false;

const popupManager = createPopupManager();

onUnmounted(() => {
  stopScanning();
});

async function startScanning() {
  if (isScanning.value) return;

  scannedResult.value = '';
  isScanning.value = true;
  hasScanned = false;

  codeReader = new BrowserMultiFormatReader();

  try {
    const previewElem = videoRef.value;
    if (previewElem) {
      await codeReader.decodeFromVideoDevice(undefined, previewElem, (result: { getText: () => string; }, err: any) => {
        if (result && !hasScanned) {
          hasScanned = true;
          scannedResult.value = result.getText();
          emit('findItem', scannedResult.value)
          stopScanning();
        }
      });
    }
  } catch (err) {
    console.error('Ошибка при сканировании', err);
    isScanning.value = false;
  }
}

function closeScan() {
  emit('close')
}

function stopScanning() {
  isScanning.value = false;
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
}
</script>

<template>

  <div class="scanner-wrapper">
    <video ref="videoRef" class="scanner-video" autoplay muted playsinline></video>

    <button type="button" class="btn btn-bar-code" v-if="!isScanning" @click="startScanning">
      Сканировать
    </button>

    <button type="button" class="btn btn-bar-code" @click="closeScan">
      Закрыть
    </button>
  </div>

</template>


<style scoped>

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.scanner-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  height: 100vh;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.scanner-video {
  width: 90%;
  max-width: 400px;
  border-radius: 10px;
  border: 2px solid #ccc;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  height: 190px;
}

.btn-bar-code {
  background-color: var(--orange-color);
  padding: 17px 0;
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  font-size: 18px;
  font-weight: 500;
  color: white;
  margin-top: 30px;
}

</style>
