<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useStore } from 'vuex';
import { off, postEvent, type PopupButton  } from '@tma.js/sdk-vue'
import User from '@/models/user';
import { setBackButton, hideBackButton, setBottomButton, hideBottomButton, setBottomSecondaryButton, hideBottomSecondaryButton } from '@/tools/setTelegramButtons';
import { addUser, editUser, delUser } from '@/composables/userWorker';
import { createPopupManager } from '@/tools/setTelegramPopUp'
import { setHaptic } from '@/tools/setTelegramHaptick';

const props = defineProps<{ 
  editworker?: boolean,
  adminToEdit: User|null
}>();

const popupManager = createPopupManager();
const emit = defineEmits(['close'])
const store = useStore();
const role = ref(props.adminToEdit?.role ?? 'cass');
const roleTransl = ref('Кассир');

let mainButtonListener: (() => void) | null = null;
let secondaryButtonListener: (() => void) | null = null;

const handleMainButton = () => {
  console.log('Нажата основная кнопка');
  if (props.editworker) {
    editWorker();
  }
  else {
    openShare();
  }
};

const handleSecondaryButton = () => {
  console.log('Нажата вторичная кнопка');
  if (props.editworker) {
    let buttons: PopupButton[];
    buttons = [
      {
        id: 'delete',
        text: 'Удалить',
        type: 'destructive'
      },
      {
        id: 'cancel',
        type: 'close'
      }
    ];
    popupManager.openPopup(`Вы уверены что хотите удалить сотрудника?`,
      (buttonId) => {
        if (buttonId === 'cancel') {
          popupManager.cleanup();
        }
        if (buttonId === 'delete') {
          delWorker();
          popupManager.cleanup();
        }
      }, buttons
    );
  }
  else {
    emit('close');
  }
};

onMounted(async () => {
  setBackButton();
  mainButtonListener = handleMainButton;
  secondaryButtonListener = handleSecondaryButton;
  setBottomButton(props.editworker ? 'ПОДТВЕРДИТЬ' : 'ПРИГЛАСИТЬ', 'F8A917', 'FFFFFF', handleMainButton)
  setBottomSecondaryButton(props.editworker ? 'УДАЛИТЬ' : 'ОТМЕНА', 'E64D44', 'FFFFFF', 'right', handleSecondaryButton);
})

onUnmounted(() => {
  hideBottomButton();
  hideBottomSecondaryButton();
});

//Логика изменения сотрудника
async function editWorker(){
  setHaptic();
  if (props.adminToEdit?.telegram_id !== undefined) {
    await editUser(props.adminToEdit?.id, role.value);
    popupManager.openPopup(`Вы успешно изменили роль ${props.adminToEdit?.username} с ${props.adminToEdit?.role} на ${role.value}`,
      (buttonId) => {
        if (buttonId === 'cancel') {
          popupManager.cleanup();
        }
      }
    );
  } else {
    console.error('Error: adminToEdit does not have a valid telegram_id');
  }
}

//Логика удаления сотрудника
async function delWorker() {
  if (props.adminToEdit?.telegram_id !== undefined) {
    await delUser(props.adminToEdit?.id);
    emit('close');
    popupManager.openPopup(`Вы успешно удалили пользователя ${props.adminToEdit?.username}`,
      (buttonId) => {
        if (buttonId === 'cancel') {
          popupManager.cleanup();
        }
      },
    );
  }
}

//Логика добавления новых людей

function selectRole(roleSelect: string) {
  role.value = roleSelect;
}

async function openShare() {
  setHaptic();
  if (role.value == 'cass') {
    roleTransl.value = 'Кассир'
  }
  if (role.value == 'loader') {
    roleTransl.value = 'Грузчик'
  }
  if (role.value == 'warehouse') {
    roleTransl.value = 'Склад'
  }
  if (role.value == 'warehouse_driver_loader') {
    roleTransl.value = 'Склад, водитель, грузчик'
  }
  if (role.value == 'driver') {
    roleTransl.value = 'Водитель'
  }
  if (role.value == 'admin') {
    roleTransl.value = 'Администратор'
  }
  if (role.value == 'zagotovshik') {
    roleTransl.value = 'Заготовщик'
  }
  await addUser(store.getters.USER.telegram_id, role.value);
  const inviteText = `Привет!\nВыдал тебе доступ ${roleTransl.value}`;
  postEvent('web_app_open_tg_link', {
    path_full: `/share/url?text=${encodeURIComponent(inviteText)}&url=${encodeURIComponent(`https://t.me/chpx_opt_bot/chpx?startapp=${store.getters.USER.telegram_id}_${role.value}`)}`
  });
  emit('close');
}
</script>

<template>
  <div class="add-admin">
    <div class="add-admin-background" @click="emit('close')"></div>
      <div class="add-admin-wrapper-popup">
        <div class="close-btn-wrapper">
          <button type="button" class="btn">
            <img src="@/assets/desktop/close_cart.svg" class="close-img" @click="emit('close')">
          </button>
        </div>
        <p class="popup-label">{{ props.editworker ? `Редактировать сотрудника ${props.adminToEdit?.username}` : 'Добавить сотрудника' }}</p>
        <div class="popup-roles">
          <p>Выберите роль:</p>
          <div class="roles-wrapper">
          <div class="role" @click="selectRole('cass')">
            <img v-if="role == 'cass'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="role-text">Кассир</p>
          </div>
          <div class="role" @click="selectRole('loader')">
            <img v-if="role == 'loader'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="role-text">Грузчик</p>
          </div>
          <div class="role" @click="selectRole('warehouse')">
            <img v-if="role == 'warehouse'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="role-text">Склад</p>
          </div>
          <div class="role" @click="selectRole('driver')">
            <img v-if="role == 'driver'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="role-text">Водитель</p>
          </div>
          <div class="role" @click="selectRole('admin')">
            <img v-if="role == 'admin'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="role-text">Администратор</p>
          </div>
          <div class="role" @click="selectRole('zagotovshik')">
            <img v-if="role == 'zagotovshik'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="role-text">Загтовщик</p>
          </div>
          <div class="role" @click="selectRole('warehouse_driver_loader')">
            <img v-if="role == 'warehouse_driver_loader'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="role-text">Склад, водитель, грузчик</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.close-img{
  width: 30px;
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  background: 0;
  margin-bottom: 20px;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.btn-close{
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  background-color: var(--red-color);
  padding: 11px 11px;
  border-radius: var(--border-radius);
  width: 100%;
}

.close-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: end;
  width: 100%;
}

.btns {
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
}

.roles-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: var(--border-radius);
  margin-top: 10px;
  gap: 25px;
  margin-top: 20px;
  padding-top: 15px;
  padding-bottom: 25px;
}

.role-text {
  font-size: 16px;
}

.role-checker {
  width: 18px;
  display: flex;
}

.role {
  display: flex;
  width: 90%;
  align-items: center;
  justify-content: start;
  gap: 10px;
}

.popup-roles {
  width: 90%;
  text-align: start;
  font-size: 16px;
  margin-top: 30px;
}

.popup-label {
  width: 90%;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
}

.add-admin-wrapper-popup{
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  background-color: var(--grey-color);
  padding: 10px 10px 100px 10px;
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.add-admin-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  animation: fadeIn 0.1s ease-out;
  backdrop-filter: blur(3px);
}

.add-admin{
  top: 0;
  left: 0;
  position: absolute;
  z-index: 10;
  height: 100vh;
  width: 100vw;
}

</style>
