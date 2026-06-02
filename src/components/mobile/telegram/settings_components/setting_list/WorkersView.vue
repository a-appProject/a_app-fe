<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import AdminItem from '@/components/mobile/telegram/settings_components/admin_components/AdminItem.vue';
import PopUpModal from '@/components/mobile/telegram/modal_components/SelectUserRole.vue';
import User from '@/models/user';
import { getUsers } from '@/composables/userWorker'; 
import { setBackButton, hideBackButton } from '@/tools/setTelegramButtons';

const admins = ref();
const editworker = ref();
const adminToEdit = ref<User | null>(null);

async function getAdmins() {
  admins.value = await getUsers();
}

onMounted(async () => {
  setBackButton();
  await getAdmins();
})

onUnmounted(() => {
  hideBackButton();
});

const openPopAddAdmin = ref(false);

function openPop(){
  openPopAddAdmin.value = true;
}

async function closePop() {
  openPopAddAdmin.value = false;
  editworker.value = false;
  await getAdmins();
}

function openEditAdmin(admin_telegram_id: number) {
  adminToEdit.value = admins.value.find((admin: { telegram_id: number; }) => admin.telegram_id == admin_telegram_id);
  editworker.value = true;
  openPopAddAdmin.value = true;
}

</script>

<template>
  <div v-if="openPopAddAdmin">
    <PopUpModal
      @close="closePop"
      :editworker="editworker"
      :adminToEdit="adminToEdit"
    />
  </div>
  <div class="admin-section">
    <div class="admin-label">
      Сотрудники
    </div>
    <div class="admins-body">
      <AdminItem v-for="(admin, index) in admins"
        :admin="admin"
        :isFirst="index == 0"
        @openEditAdmin="openEditAdmin"
      />
      <div class="add-admin-wrapper" @click="openPop()">
        <img src="@/assets/admin-plus.svg">
        <p class="add-admin-text">Добавить</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

.btn:active {
  transform: var(--transform-scale-active);
}

.all-items-btn:active {
  transform: var(--transform-scale-active);
}

.btn-settings:active {
  transform: var(--transform-scale-active);
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  background: none;
  font-family: inherit;
  background-color: var(--orange-color);
  font-size: 18px;
  font-weight: 600;
  color: white;
  border-radius: var(--border-radius);
  width: 100%;
  height: 40px;
  align-items: center;
  display: flex;
  justify-content: center;
  transition: all .3s ease;
}

.add-admin-text{
  font-size: 16px;
  font-weight: 400;
}

.add-admin-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--grey-color);
  padding: 13px 21px;
  gap: 10px;
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}

.admins-body{
  width: 100%;
  margin-bottom: 30px;
}

.label-section{
  font-size: 18px;
  font-weight: 500;
  text-align: start;
}

.admin-section{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.admin-label {
  width: 100%;
  font-size: 18px;
  font-weight: 500;
  text-align: start;
}

</style>
