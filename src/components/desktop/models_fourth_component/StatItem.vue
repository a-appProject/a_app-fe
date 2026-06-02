<script setup lang="ts">

const props= defineProps<{
  status: string,
  text: string
}>()


</script>


<template>

  <div class="wrapper">
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" :style="{ fill: props.status}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="5" r="5"/>
      </svg>
      <p class="date-create">{{ props.text }}</p>
  </div>

</template>

<style scoped>

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.date-create {
  background-color: var(--grey-color);
  font-size: 18px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: var(--border-radius);
}

</style>