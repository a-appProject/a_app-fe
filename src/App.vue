<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { postEvent, retrieveRawInitData, retrieveLaunchParams }  from '@tma.js/sdk-vue';
import { useStore } from "vuex";
import router from '@/router';
import SpinLoader from '@/SpinLoader.vue';
import { getUser } from '@/composables/userWorker';
import { playSucces, playError } from '@/tools/soundManager';
import NotificationBorder from '@/components/NotificationBorder.vue';

const store = useStore();
const isRender = import.meta.env.VITE_DEV;
const initDataRowFromTelegram = ref<string>();
const initDataFromTelegram = ref<any>()

try {
  const initDataRaw = retrieveRawInitData();
  const { tgWebAppData: initData, tgWebAppVersion } = retrieveLaunchParams();
  console.log('initData=', tgWebAppVersion)
  initDataRowFromTelegram.value = initDataRaw;
  initDataFromTelegram.value = initData;
} catch(error) {
  console.log(error)
}


const telegramLoginContainer = ref<HTMLElement | null>(null)

const isAuth = ref(false);
const isLogined = ref(false);
const isRenderRoll = ref<boolean>(true)

async function logIn() {
  try{
    const Params = new URLSearchParams(initDataRowFromTelegram.value);
    const startParam = Params.get('start_param');
    const [kentId, role] = startParam ? startParam.split('_') : [null, null];
    const data = await getUser(kentId, role)
    localStorage.setItem("user", JSON.stringify(data.user));
    store.dispatch('setUser', data.user);
    isAuth.value = true;
    isLogined.value = true;
    isRenderRoll.value = false;
    if (startParam != null && kentId !== null && role !== null){
      pushUserToOrder(Number(kentId), role)
    }
  }
  catch(error) {
    console.error('Ошибка logIn:', error);
    isAuth.value = false;
    isLogined.value = false;
    return null
  }
}

function pushUserToOrder(point: number, role: string){
  if (role != 'cass' && role != 'loader' && role != 'warehouse' && role != 'driver') {
    router.push(`/order?id=${role}&point_id=${point}`)
  } 
}

async function onTelegramAuth(user: any) {
  isRenderRoll.value = true;
  localStorage.setItem('user', JSON.stringify(user))
  console.log('user=', user)
  store.dispatch('setAuthToken', user);
  await logIn();
}

function insertTelegramLoginWidget() {
  if (!telegramLoginContainer.value) return

  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.async = true
  script.setAttribute('data-telegram-login', 'chpx_opt_bot')
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', 'onTelegramAuth(user)')

  ;(window as any).onTelegramAuth = onTelegramAuth

  telegramLoginContainer.value.appendChild(script)
}

onMounted(async ()=> {
  if (initDataRowFromTelegram.value) {
    store.dispatch('setTelegramRetrieveLaunchParams', initDataRowFromTelegram.value);
    postEvent('web_app_setup_closing_behavior', {need_confirmation: true})
    postEvent('web_app_setup_swipe_behavior', {allow_vertical_swipe: false})
    postEvent('web_app_toggle_orientation_lock', {locked: true})
    postEvent('web_app_expand');
    await logIn();
  }
  else {
    insertTelegramLoginWidget(); 
    isRenderRoll.value = false;
  }
});

async function logInLocal() {
  let user = {
    auth_date: import.meta.env.VITE_AUTH_DATE,
    first_name: import.meta.env.VITE_FIRST_NAME,
    hash: import.meta.env.VITE_USER_HASH,
    id: import.meta.env.VITE_USER_ID,
    photo_url: import.meta.env.VITE_PHOTO_URL,
    username: import.meta.env.VITE_USER_NAME
  }
  store.dispatch('setAuthToken', user);
  await logIn();
  isAuth.value = true
}

const notifBorder = ref<{color: string, borderHeight: number}>({color: '', borderHeight: 0});
const openNotif = ref<boolean>(false)

function openNotifBorder(value: string, color: string, borderHeight: number) {
  openNotif.value = true;
  if (value === 'succes') {
    playSucces();
  } else {
    playError();
  }
  notifBorder.value = {
    color, 
    borderHeight
  }
  setTimeout(() => {
    openNotif.value = false
  }, 2000)
}

</script>


<template>
  <!-- <SpinLoader v-if="isRenderRoll"/> -->
   <Transition name="fade">
     <NotificationBorder v-if="openNotif"
        :color="notifBorder.color"
        :borderheight="notifBorder.borderHeight"
     />
   </Transition>
  <div id="all-wrapper" class="all-wrapper" :style="{'margin-top': initDataRowFromTelegram ? '30px': '', 'max-height': initDataRowFromTelegram ? '100%' : '96vh' }">
    <div class="not_load_wrapper" v-if="!isAuth">
      <!-- <p v-if="initDataRowFromTelegram" class="not_auth_text">Кажется не тот бот</p> -->
      <SpinLoader v-if="initDataRowFromTelegram && !isLogined"/>
      <div v-else>
        <p class="auth_in_telegram_text">Авторизоваться через Telegram</p>
        <div ref="telegramLoginContainer"></div>
        <div class="buttons-wrapper" v-if="isRender === 'true'">
          <button class="btn" @click="logInLocal()">ЛОКАЛКА</button>
          <button class="btn" @click="openNotifBorder('succes', 'var(--green-color)', 10)">SUCCES</button>
          <button class="btn" @click="openNotifBorder('error', 'var(--red-color)', 10)">ERROR</button>
        </div>
      </div>
    </div>
    <router-view :key="$route.fullPath" v-else/>
  </div>
</template>

<style scoped>

.buttons-wrapper {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.background-blur {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0; 
  background-color: #8E8E9290;
  backdrop-filter: blur(10px);
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  background-color: var(--orange-color);
  color: white;
  font-size: 20px;
  padding: 20px 50px;
  border-radius: var(--border-radius);
  box-shadow: var(--drop-shadow-2);
}

.btn:hover {
  background-color: white;
  color: var(--orange-color);
}

.btn:active {
  transform: var(--transform-scale-active);
}

.auth_in_telegram_text{
  color: black;
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 30px;
}

.not_auth_text{
  color: black;
  font-size: 20px;
  font-weight: 400;
}

.not_load_wrapper{
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image {
  max-width: 200px;
}

</style>