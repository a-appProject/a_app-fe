<script setup lang="ts">
import User from '@/models/user';

const props = defineProps<{
  is_edit: boolean,
  user?: User
}>();

const emit = defineEmits<{
  (e: 'new_role', value: string): void,
  (e: 'close'): void,
  (e: 'edit_user_role', value: string): void,
  (e: 'del_user'): void
}>()

const roles = [
  { id: 'cass', label: 'Кассир' },
  { id: 'loader', label: 'Грузчик' },
  { id: 'warehouse', label: 'Склад' },
  { id: 'driver', label: 'Водитель' },
  { id: 'admin', label: 'Администратор' },
  { id: 'warehouse_driver_loader', label: 'Склад, водитель, грузчик' },
]

function updateRole(role: string) {
  emit('new_role', role);
}


function updateUserRole() {
  const roleObj = roles.find(r => r.id === props.user?.role);
  if (roleObj) {
    emit('edit_user_role', roleObj.id);
  }
}

</script>


<template>

  <div class="edit-wrapper" v-if="props.is_edit">
    <p class="label">Выберите роль</p>
    <div class="roles-wrapper">
      <div class="role" v-for="role in roles" @click="updateRole(role.id)">
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9.5" cy="9.5" r="9.5" fill="#D9D9D9"/>
          <circle v-if="role.id === props.user?.role" cx="9.5" cy="9.5" r="7.5" fill="#31B545"/>
        </svg>
        <p class="role-name">{{ role.label }}</p>
      </div>
    </div>
    <div class="buttons-wrapper">
       <button 
          type="button"
          class="btn apply-changes"
          @click="updateUserRole"
        >
        ПРИМЕНИТЬ
        </button>
        <button 
          type="button"
          class="btn cancel-button"
          @click="emit('close')"
        >
        ОТМЕНА
        </button>
    </div>
  </div>

  <div class="del-wrapper" v-else>
    <p class="del-user-label">Вы уверены, что хотите удалить {{ props.user?.username }}</p>
    <div class="buttons-wrapper">
       <button 
          type="button"
          class="btn del-user"
          @click="emit('del_user')"
        >
        УДАЛИТЬ
        </button>
        <button 
          type="button"
          class="btn cancel-button"
          @click="emit('close')"
        >
        ОТМЕНА
        </button>
    </div>
  </div>

</template>


<style scoped>

.del-wrapper{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.cancel-button{
  background-color: var(--orange-color);
}

.cancel-button:hover{
  background-color: white;
  color: var(--orange-color);
}

.del-user {
  background-color: var(--red-color);
}

.del-user:hover {
  background-color: white;
  color: var(--red-color);
}

.apply-changes {
  background-color: var(--green-color);
}

.apply-changes:hover {
  background-color: white;
  color: var(--green-color);
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

.buttons-wrapper{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.role-name{
  font-size: 16px;
  font-weight: 700;
}

.role{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.roles-wrapper {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 10px;
  margin-left: 17px;
}

.label {
  font-weight: 700;
  margin-left: 17px;
}

.edit-wrapper {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 20px;
  width: 100%;
  font-size: 16px;
}

</style>