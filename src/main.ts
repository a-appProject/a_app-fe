import { createApp } from 'vue'
import '@/style.css'
import App from '@/App.vue'
import router from "@/router";
import store from "@/store";
import { init } from '@tma.js/sdk-vue';

try {
  init();
} catch (error) {
  
}

createApp(App).use(store).use(router).mount('#app')
