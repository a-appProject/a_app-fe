import { ref } from 'vue'
import store from "@/store";
import btn from '@/models/popup_button';
import { createPopupManager } from '@/tools/setTelegramPopUp'
import { retrieveRawInitData } from '@tma.js/sdk-vue';

const popupManager = createPopupManager();

const initDataRowFromTelegram = ref<string>();

  try {
    const initDataRaw = retrieveRawInitData();
    initDataRowFromTelegram.value = initDataRaw;
  } catch(error) {
    console.log(error)
  }

export async function handleResponseError<T>(response: Response, responseData: T): Promise<boolean> {
  if (response.ok) return false;

  let errorText = '';
  try {
    errorText = (responseData as any)?.message || JSON.stringify(responseData);
  } catch {
    errorText = await response.text();
  }

  console.error(`Ошибка ${response.status}:`, errorText);
  if (initDataRowFromTelegram.value !== undefined) {
    popupManager.openPopup(`Ошибка ${response.status}, ${errorText}`,
      (buttonId) => {
        console.log("Нажата кнопка:", buttonId);
        if (buttonId === 'cancel') {
          popupManager.cleanup();
        }
      },
    );
  }
  else {
    const popUp = {
      open: true,
      text: `Ошибка ${response.status}, ${errorText}`,
      buttons: [ {
        label: 'Закрыть',
        color: 'var(--orange-color)',
        type: 'cancel'
      } as btn ]
    }
    store.dispatch('setPopUp', popUp);
  }
  return true;
}
