import { postEvent, on, off, type PopupButton } from '@tma.js/sdk-vue';

type PopupButtonCallback = (buttonId?: string) => void;

// Глобальные переменные для управления состоянием
let globalCallback: PopupButtonCallback | null = null;
let isEventHandlerSet = false;

export function createPopupManager() {
  // Обработчик закрытия попапа
  const handlePopupClose = (payload: any) => {
    if (globalCallback) {
      globalCallback(payload.button_id);
      globalCallback = null;
    }
  };

  // Устанавливаем обработчик только один раз при первом создании менеджера
  if (!isEventHandlerSet) {
    on('popup_closed', handlePopupClose);
    isEventHandlerSet = true;
  }

  return {
    openPopup: (message: string, onButtonClick: PopupButtonCallback, buttons_config?: PopupButton[]) => {
      let buttons: PopupButton[];

      if (buttons_config) {
        buttons = buttons_config;
      } else {
        buttons = [
          {
            id: 'cancel',
            text: 'Закрыть',
            type: 'default'
          }
        ];
      }

      // Сохраняем callback для текущего попапа
      globalCallback = onButtonClick;
      
      const res = postEvent('web_app_open_popup', {
        title: '',
        message,
        buttons
      });
    },

    cleanup: () => {
      if (isEventHandlerSet) {
        off('popup_closed', handlePopupClose);
        isEventHandlerSet = false;
      }
      globalCallback = null;
    }
  };
}