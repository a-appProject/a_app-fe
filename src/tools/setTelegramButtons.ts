import router from '@/router';
import { setHaptic } from '@/tools/setTelegramHaptick';

// Хранилище текущих обработчиков
let currentMainHandler: (() => void) | null = null;
let currentSecondaryHandler: (() => void) | null = null;

// Единый обработчик для главной кнопки
const mainButtonHandler = () => {
  if (currentMainHandler) {
    currentMainHandler();
  }
};

// Единый обработчик для второстепенной кнопки
const secondaryButtonHandler = () => {
  if (currentSecondaryHandler) {
    currentSecondaryHandler();
  }
};

// Установить нижнюю кнопку
export function setBottomButton(
  text: string, 
  color: string, 
  text_color: string, 
  onPress: () => void, 
  has_shine_effect?: boolean, 
  is_progress_visible?: boolean | false
) {
  // Сохраняем новый обработчик
  currentMainHandler = onPress;
  
  // Убеждаемся, что обработчик установлен только один раз
  // Удаляем все предыдущие обработчики и устанавливаем единый
  window.Telegram.WebApp.MainButton.offClick(mainButtonHandler);
  window.Telegram.WebApp.MainButton.onClick(mainButtonHandler);

  // Настраиваем кнопку
  window.Telegram.WebApp.MainButton.setText(text);
  window.Telegram.WebApp.MainButton.setParams({
    color: `#${color}`,
    text_color: `#${text_color}`,
    has_shine_effect: has_shine_effect,
    is_active: true,
    is_visible: true
  });
  
  if (is_progress_visible) {
    window.Telegram.WebApp.MainButton.showProgress();
  } else {
    window.Telegram.WebApp.MainButton.hideProgress();
  }
  
  window.Telegram.WebApp.MainButton.show();
}

// Скрыть нижнюю кнопку
export function hideBottomButton() {
  window.Telegram.WebApp.MainButton.hide();
  window.Telegram.WebApp.MainButton.offClick(mainButtonHandler);
  currentMainHandler = null;
}

// Установить вторую нижнюю кнопку
export function setBottomSecondaryButton(
  text: string, 
  color: string, 
  text_color: string, 
  position: string, 
  onPress: () => void
) {
  // Сохраняем новый обработчик
  currentSecondaryHandler = onPress;
  
  // Убеждаемся, что обработчик установлен только один раз
  window.Telegram.WebApp.SecondaryButton.offClick(secondaryButtonHandler);
  window.Telegram.WebApp.SecondaryButton.onClick(secondaryButtonHandler);

  // Настраиваем кнопку
  window.Telegram.WebApp.SecondaryButton.setText(text);
  window.Telegram.WebApp.SecondaryButton.setParams({
    color: `#${color}`,
    text_color: `#${text_color}`,
    position: position,
    is_active: true,
    is_visible: true
  });
  
  window.Telegram.WebApp.SecondaryButton.show();
}

// Скрыть вторую нижнюю кнопку
export function hideBottomSecondaryButton() {
  window.Telegram.WebApp.SecondaryButton.hide();
  window.Telegram.WebApp.SecondaryButton.offClick(secondaryButtonHandler);
  currentSecondaryHandler = null;
}

// Обработчик кнопки назад
const onBackPressed = () => {
  setHaptic();
  if (router.currentRoute.value.meta?.allowBack !== false && window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
};

// Установить кнопку назад
export function setBackButton() {
  // Для back button проще, так как обработчик всегда один и тот же
  window.Telegram.WebApp.BackButton.offClick(onBackPressed);
  window.Telegram.WebApp.BackButton.onClick(onBackPressed);
  window.Telegram.WebApp.BackButton.show();
}

// Скрыть кнопку назад
export function hideBackButton() {
  window.Telegram.WebApp.BackButton.offClick(onBackPressed);
  window.Telegram.WebApp.BackButton.hide();
}