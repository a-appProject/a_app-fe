<script setup lang="ts">

</script>


<template>
  <div class="placeholder">
    &nbsp;
  </div>
</template>


<style scoped>
@keyframes bgAnimate {
  0% {
    background-position: 50% 0;
  }

  100% {
    background-position: -150% 0;
  }
}
.placeholder {
  height: 100%;
  width: 100%;
  border-radius: var(--border-radius);
  background-image: linear-gradient(
      to right,
      #007bff00 0%,
      #ffffff3b 10%,
      #007AFF00 20%,
      #007AFF00 100%
  );
  background-size: 200% 100%;
  animation: bgAnimate 1.2s linear infinite;
}
</style>