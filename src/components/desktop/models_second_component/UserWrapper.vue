<script setup lang="ts">
import { ref, onMounted } from 'vue'
import store from '@/store';
import User from '@/models/user';
import EditUserComponent from '@/components/desktop/models_second_component/EditUserComponent.vue';
//Подумат надо ли добавлять функционал добавления юзера
import { addUser, editUser, delUser } from '@/composables/userWorker';
import btn from '@/models/popup_button';

const props = defineProps<{
  user: User,
  index: number,
  isOpenEdit?: boolean, 
  isOpenDel?: boolean,
}>();

const emit = defineEmits<{
  (e: 'upd_users'): void,
  (e: 'open-edit'): void,
  (e: 'close-edit'): void,
  (e: 'open-del'): void,
  (e: 'close-del'): void,
}>()

const thisUser = ref<User>();

onMounted(()=> {
  thisUser.value = props.user;
})

function openEditRole() {
  emit('open-edit');
}

function closeEditComponent() {
  emit('close-edit');
}

function openDelUser() {
  emit('open-del');
}

function closeDelComponent() {
  emit('close-del');
}

function updateRole(role: string) {
  thisUser.value!.role = role;
}

async function editUserRole(role: string) {
  await editUser(thisUser.value!.id, role);
  openPopup(`Роль пользователя ${thisUser.value?.username} успешно изменена на ${role}`);
  emit('upd_users');
}

async function deleteUser() {
  await delUser(thisUser.value!.id);
  openPopup(`Пользоваетель ${thisUser.value?.username} успешно удалён`);
  emit('upd_users');
}

function openPopup(text: string) {
  const popUp = {
    open: true,
    text,
    buttons: [ {
      label: 'Закрыть',
      color: 'var(--orange-color)',
      type: 'cancel'
    } as btn ]
  }
  store.dispatch('setPopUp', popUp);
}

</script>

<template>
  <Transition 
    name="fade"
  >
  <div class="user-wrapper">
    <div class="up">
      <div class="left">
        <p class="name">{{ props.user.username }}</p>
        <!-- <p class="role">{{ isOpenEditRole ? '...' : props.user.role }}</p> -->
        <p class="role">{{ props.user.role }}</p>
      </div>
      <div class="right">
        <button 
          type="button"
          class="btn edit-button"
          @click="openEditRole()"
        >
        РЕДАКТИРОВАТЬ
        </button>
        <button 
          type="button"
          class="btn del-button"
          @click="openDelUser()"
        >
        УДАЛИТЬ
        </button>
      </div>
    </div>
    <EditUserComponent v-if="props.isOpenEdit"
      :is_edit="true"
      :user="thisUser"
      @new_role="updateRole"
      @close="closeEditComponent"
      @edit_user_role="editUserRole"
    />
    <EditUserComponent v-if="props.isOpenDel"
      :is_edit="false"
      :user="thisUser"
      @del_user="deleteUser"
      @close="closeDelComponent"
    />
  </div>
  </Transition>

</template>


<style scoped>

.del-button{
  background-color: var(--red-color);
}

.del-button:hover{
  background-color: white;
  color: var(--red-color);
}

.edit-button{
  background-color: var(--orange-color);
}

.edit-button:hover {
  background-color: white;
  color: var(--orange-color);
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  height: 40px; 
  font-size: 16px;
  font-weight: 600;
  padding: 10px;
  border-radius: var(--border-radius);
  color: white;
  transition-duration: 0.3s;
}

.btn:active {
  transform: var(--transform-scale-active);
}

.role {
  font-weight: 400;
}

.name {
  font-weight: 700;
}

.name, .role {
  font-size: 16px;
}

.right {
  display: flex;
  flex-direction: column;
  align-items: end;
  justify-content: center;
  gap: 10px;
  margin-right: 10px;
}

.left {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 18px;
  margin-left: 17px;
}

.up {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 95%;
  padding: 10px 0;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  background-color: #F2F2F2;
}

</style>
