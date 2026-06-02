<script setup lang="ts">
import { watch, ref} from 'vue';
import {formatDate, getTimeDifference ,formatDateDay} from '@/tools/tools'
import { itemsService } from '@/api/itemsService';
import { handleResponseError } from '@/tools/handleResponseError';
import StatItem from '@/components/desktop/models_fourth_component/StatItem.vue';
import { getStatisticByOrder } from '@/composables/orderWorkerk';

const itemService = new itemsService();

const props = defineProps<{
  point_id: number | null,
  order_id: number | null
}>();

const date_create = ref();
const date_assembl = ref();
const date_completed = ref();
const date_delivered = ref();
const date_on_way = ref();

async function getStatByOrderId(order_id: number | null) {
  const data = await getStatisticByOrder(props.point_id, order_id)
  if (data)  {
    date_create.value = data[0].date_create;
    date_assembl.value = data[0].date_assembl;
    date_completed.value = data[0].date_completed;
    date_delivered.value = data[0].date_delivered;
    date_on_way.value = data[0].date_on_way;
  }
}

watch(() => props.order_id, async (newVal) => {
  await getStatByOrderId(newVal)
}, {immediate: true})

</script>


<template>

  <p class="date">{{ formatDateDay(date_create) }}</p>

  <StatItem v-if="date_create"
    :status="'var(--orange-color)'"
    :text="`Создан: ${formatDate(date_create)}`"
  />
  <img v-if="date_assembl" src="@/assets/line.svg">

  <StatItem v-if="date_assembl"
    :status="'var(--orange-color)'"
    :text="getTimeDifference(date_create, date_assembl)"
  />
  <img v-if="date_assembl" src="@/assets/line.svg">

  <StatItem v-if="date_assembl"
    :status="'var(--orange-color)'"
    :text="`Начали собирать: ${formatDate(date_assembl)}`"
  />
  <img v-if="date_completed" src="@/assets/line.svg">

  <StatItem v-if="date_completed"
    :status="'var(--orange-color)'"
    :text="getTimeDifference(date_assembl, date_completed)"
  />
  <img v-if="date_completed" src="@/assets/line.svg">

  <StatItem v-if="date_completed"
    :status="'var(--orange-color)'"
    :text="`Собрали: ${formatDate(date_completed)}`"
  />
  <img v-if="date_on_way" src="@/assets/line.svg">

  <StatItem v-if="date_on_way"
    :status="'var(--orange-color)'"
    :text="getTimeDifference(date_completed, date_on_way)"
  />
  <img v-if="date_on_way" src="@/assets/line.svg">

  <StatItem v-if="date_on_way"
    :status="'var(--orange-color)'"
    :text="`Поехал: ${formatDate(date_on_way)}`"
  />
  <img v-if="date_delivered" src="@/assets/line.svg">

  <StatItem v-if="date_delivered"
    :status="'var(--orange-color)'"
    :text="getTimeDifference(date_on_way, date_delivered)"
  />
  <img v-if="date_delivered" src="@/assets/line.svg">

  <StatItem  v-if="date_delivered"
    :status="'var(--orange-color)'"
    :text="`Доставили: ${formatDate(date_delivered)}`"
  />

</template>


<style scoped>

.date {
  margin-bottom: 30px;
  font-size: 25px;
  font-weight: 500;
  color: var(--orange-color);
  margin-top: 30px;
}

</style>