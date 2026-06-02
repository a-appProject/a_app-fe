<script setup lang="ts">
import { computed } from 'vue'
import icons from '@/models/icons'
import iconMapping from '@/models/iconmapping'
import {ProductWithPackaging} from '@/models/product';

const props = defineProps<{
  item: ProductWithPackaging,
  index: number,
  isLast: boolean
}>();

const iconPath = computed(() => icons[iconMapping[props.item.description.split(';')[0].trim()]] || '');

</script>


<template>

  <div class="item-wrapper" :style="{ marginTop: props.index === 0 ? '10px' : '0', marginBottom: props.isLast ? '10px' : '0'}">
    <p class="quantity">x{{ props.item.quantity }}</p>
    <img class="img" :src="iconPath">
    <div class="texts">
      <p class="label">{{ props.item.name }}</p>
      <p class="label-pack">{{ props.item.packaging.name }}</p>
    </div>
  </div>

</template>


<style scoped>

.label-pack {
  font-size: 13px;
  color: #8E8E92;
}

.texts {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  height: 100%;
}

.quantity {
  font-size: 20px;
  color: var(--orange-color);
  margin-left: 30px;
}

.label {
  color: black;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
  white-space: nowrap;
  max-width: 192px;
}

.img {
  width: 50px;
}

.item-wrapper {
  display: flex;
  align-items: center;
  justify-content: start;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
  width: 95%;
  height: 50px;
  background-color: #F2F2F2;
}

</style>