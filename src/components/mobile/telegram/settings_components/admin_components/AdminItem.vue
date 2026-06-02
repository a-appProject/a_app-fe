<script setup lang="ts">
import { computed } from 'vue';
import User from '@/models/user';

const props = defineProps<{ 
  admin: User,
  isFirst: boolean
}>();

const emit = defineEmits(['openEditAdmin'])

const roleMapping: Record<string, string> = {
  'cass': 'Кассир',
  'loader': 'Грузчик', 
  'warehouse': 'Склад',
  'driver': 'Водитель',
  'admin': 'Админ',
  'warehouse_driver': 'Водитель',
  'warehouse_driver_loader': 'Склад, водитель, грузчик',
  'null': '-----'
  //Добавить тут новую роль
}

const rolePath = computed(() => {
  const roleKey = roleMapping[props.admin.role]
  return roleKey;
})

</script>

<template>

  <div :class="{'adin-wrapper': true, 'border-top': props.isFirst}">
    <div class="admin-left">
      <div class="name-admin">
        <p class="label">Имя:</p>
        <p class="value">{{ props.admin.first_name ?? props.admin.username }}</p>
      </div>
      <div class="role-admin">
        <p class="label">
          Роль:
        </p>
        <p class="role-value">
          {{ rolePath }}
        </p>
      </div>
    </div>
    <div class="admin-right" @click="emit('openEditAdmin', props.admin.telegram_id)">
      <img src="@/assets/edit.svg">
    </div>
  </div>

</template>

<style scoped>

.border-top{
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.role-admin{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.label {
  font-weight: 600;
}

.role-value {
  color: var(--green-color);
}

.admin-left {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 10px;
}

.name-admin {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.adin-wrapper{
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--grey-color);
  padding: 12px 20px;
  margin-bottom: 0.5px;
  box-shadow: 0 0.5px 0 #C8C7CB;
}

.item-img-item{
  display: flex;
  width: 33px;
  border-radius: 50%;
}

</style>
