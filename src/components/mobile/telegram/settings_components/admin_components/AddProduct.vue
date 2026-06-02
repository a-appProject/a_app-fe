<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import {MiniAppsEventListener, off, on, postEvent} from "@telegram-apps/sdk";
import router from '@/router';
import { useRoute } from "vue-router";
import { itemsService } from '@/api/itemsService';

const itemService = new itemsService

const listener: MiniAppsEventListener<'back_button_pressed'> = () => {
  triggerHapticFeedback('soft');
  router.go(-1);
};

const mainButtonPressed: MiniAppsEventListener<'main_button_pressed'> = () => {
  if (!isNaN(product_id.value) && product_id.value > 0) {
    if (editTrue.value == true){
      editItem();
    }
    else {
      postEvent('web_app_open_popup', {
        message: 'Чтобы отредактировать товар, измените одно из полей',
        buttons: [
          {
            id: 'cancel',
            text: 'Закрыть',
            type: 'default'
          }
        ]
      });
    }
  }
  else {
    if (addTrue.value == true && name.value != '' && category.value != '' && packaging.value != '') {
      adItem();
    }
    else {
      postEvent('web_app_open_popup', {
        message: 'Необходимо заполнить обязательные поля',
        buttons: [
          {
            id: 'cancel',
            text: 'Закрыть',
            type: 'default'
          }
        ]
      });
    }
  }
}

const secondaryButtonPressedListener: MiniAppsEventListener<'secondary_button_pressed'> = () => {
  openPopdelItem();
};

const popupClosedListener: MiniAppsEventListener<'popup_closed'> = (payload: { button_id: any; }) => {
  const { button_id } = payload;

  if (button_id == 'delete') {
    delItem();
  } 
  else if (button_id == 'cancel') {
      router.go(-1);
  }
  else {
    if (addTrue.value == true) {
      router.go(-1);
    }
  }
};

onMounted(async () => {
  postEvent('web_app_setup_back_button', { is_visible: true});
  on('back_button_pressed', listener);
  on('main_button_pressed', mainButtonPressed);
  on('secondary_button_pressed', secondaryButtonPressedListener);
  on('popup_closed', popupClosedListener);

  product_id.value = Number(useRoute().query.product_id);

  if (!isNaN(product_id.value) && product_id.value > 0) {

    name.value = (useRoute().query.name?.toString() ?? '');
    olValName.value = (useRoute().query.name?.toString() ?? '');

    category.value = useRoute().query.descr?.toString();
    oldValCategory.value = useRoute().query.descr?.toString();

    packaging.value = useRoute().query.packaging?.toString();
    oldValpackaging.value = useRoute().query.packaging?.toString();

    postEvent('web_app_setup_main_button', {
      is_visible: true,
      is_active: true,
      is_progress_visible: false,
      text: 'ГОТОВО',
      color: '#31B545',
      text_color: '#FFFFFF',
    });
    postEvent('web_app_setup_secondary_button', {
      is_visible: true,
      is_active: true,
      is_progress_visible: false,
      text: 'УДАЛИТЬ',
      color:  '#E64D44',
      text_color: '#FFFFFF',
      position: 'right'
    });
  }
  else {

    name.value = '';
    olValName.value = '';

    category.value = '';
    oldValCategory.value = '';

    packaging.value = '';
    oldValpackaging.value = '';
    
    postEvent('web_app_setup_main_button', {
      is_visible: true,
      is_active: true,
      is_progress_visible: false,
      text: 'ДОБАВИТЬ ТОВАР',
      color: '#F8A917',
      text_color: '#FFFFFF',
    });
  }

})

onUnmounted(() => {
  postEvent('web_app_setup_back_button', { is_visible: false});
  off('back_button_pressed', listener);
  off('main_button_pressed', mainButtonPressed);
  off('popup_closed', popupClosedListener);
  off('secondary_button_pressed', secondaryButtonPressedListener);
  postEvent('web_app_setup_main_button', {
    is_visible: false,
    is_active: false
  })
  postEvent('web_app_setup_secondary_button', {
    is_visible: false,
    is_active: false
  })
});

const tg = window.Telegram?.WebApp;

function triggerHapticFeedback(style: string) {
  tg.HapticFeedback.impactOccurred(style);
}

//Логика добавления товара
const product_id = ref();

//Категория
const category = ref();
let oldValCategory = ref();

function selectCategory(select_category: string){
  category.value = select_category;
}

//Фасовка
const packaging = ref();
let oldValpackaging = ref();

function selectpackaging(select_packaging: string){
  packaging.value = select_packaging;
}

//Название
const name = ref('');
let olValName = ref();

async function adItem() {
  await itemService.addItem(name.value, category.value, packaging.value)
    .then(response => response.json())
    .then(data => {
      if(data) {
        setTimeout(() => {
          postEvent('web_app_open_popup', {
            message: 'Товар успешно добавлен',
            buttons: [
              {
                id: 'cancel',
                text: 'Закрыть',
                type: 'default'
              }
            ]
          });
        })
      }
    })
}


const addTrue = computed(() =>
  category.value !== oldValCategory.value ||
  packaging.value !== oldValpackaging.value ||
  name.value !== olValName.value
);

// watch(addTrue, (newval) => {
//   console.log('Значение addTrue обновилось:', newval);
// });

//Логика редактирования товара

const editTrue = computed(() =>
  category.value !== oldValCategory.value ||
  packaging.value !== oldValpackaging.value ||
  name.value !== olValName.value 
);

// watch(editTrue, (newval) => {
//   console.log('Значение editTrue обновилось:', newval);
// });

async function editItem() {
  await itemService.editItem(product_id.value, name.value, category.value, packaging.value)
    .then(response => response.json())
    .then(data => {
      if (data) {
        setTimeout(() => {
          postEvent('web_app_open_popup', {
            message: 'Товар успешно отредактирован',
            buttons: [
              {
                id: 'cancel',
                text: 'Закрыть',
                type: 'default'
              }
            ]
          });
        },100);
      }
    })
}


function openPopdelItem() {
  postEvent('web_app_open_popup', {
    label: '',
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить товар?',
    buttons: [
      {
        id: 'delete',
        text: 'Удалить',
        type: 'destructive'
      },
      {
        id: 'cancel',
        text: 'Отмена',
        type: 'cancel'
      }
    ]
  });
}

async function delItem() {
  await itemService.delItem(product_id.value)
    .then(response => response.json())
    .then(data => {
      if(data) {
        setTimeout(() => {
          postEvent('web_app_open_popup', {
            message: 'Товар успешно удалён',
            buttons: [
              {
                id: 'canceled',
                text: 'Закрыть',
                type: 'default'
              }
            ]
          });
        },100);
      }
    })
}


</script>

<template>

    <div class="head">
      <p>{{ isNaN(product_id) ? 'Добавить товар' : 'Редактировать товар'}}</p>
    </div>
    <div class="body">
      <div class="name-product">
        <div class="imm">
          <p class="name-product-text">Название</p>
          <img v-if="isNaN(product_id)" src="@/assets/inevitably.svg">
        </div>  
        <div class="input">
          <input
              v-model="name"
              class="text"
              id="name"
              type="text"
              placeholder="Введите название"
          />
        </div>
      </div>
      <div class="category-product">
        <div class="head-category">
          <p class="name-product-text">Категория</p>
          <img v-if="isNaN(product_id)" src="@/assets/inevitably.svg">
        </div>
        <div class="body-category">
          <div class="category-1" @click="selectCategory('Мороженное')">
            <img v-if="category == 'Мороженное'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Мороженное</p>
          </div>
          <div class="category-1" @click="selectCategory('Хоз.товары')">
            <img v-if="category == 'Хоз.товары'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Хоз.Товары</p>
          </div>
          <div class="category-1" @click="selectCategory('Продукты')">
            <img v-if="category == 'Продукты'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Продукты</p>
          </div>
          <div class="category-1" @click="selectCategory('Готовое')">
            <img v-if="category == 'Готовое'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Готовое</p>
          </div>
          <div class="category-1" @click="selectCategory('Напитки')">
            <img v-if="category == 'Напитки'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Напитки</p>
          </div>
          <div class="category-1" @click="selectCategory('Пиво')">
            <img v-if="category == 'Пиво'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Пиво</p>
          </div>
          <div class="category-1" @click="selectCategory('Горячее')">
            <img v-if="category == 'Горячее'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Горячее</p>
          </div>
          <div class="category-1" @click="selectCategory('Сувенир')">
            <img v-if="category == 'Сувенир'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Сувенир</p>
          </div>
        </div>
      </div>
      <div class="category-product">
        <div class="head-category">
          <p class="name-product-text">Фасовка</p>
          <img v-if="isNaN(product_id)" src="@/assets/inevitably.svg">
        </div>
        <div class="body-category">
          <div class="category-1" @click="selectpackaging('Box')">
            <img v-if="packaging == 'Box'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Коробка</p>
          </div>
          <div class="category-1" @click="selectpackaging('Pack')">
            <img v-if="packaging == 'Pack'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Пакет</p>
          </div>
          <div class="category-1" @click="selectpackaging('Sleeve')">
            <img v-if="packaging == 'Sleeve'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Рукав</p>
          </div>
          <div class="category-1" @click="selectpackaging('Package')">
            <img v-if="packaging == 'Package'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Упаковка</p>
          </div>
          <div class="category-1" @click="selectpackaging('Roll')">
            <img v-if="packaging == 'Roll'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Рулон</p>
          </div>
          <div class="category-1" @click="selectpackaging('Piece')">
            <img v-if="packaging == 'Piece'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Штучно</p>
          </div>
          <div class="category-1" @click="selectpackaging('Keg')">
            <img v-if="packaging == 'Keg'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Кега</p>
          </div>
          <div class="category-1" @click="selectpackaging('kg')">
            <img v-if="packaging == 'kg'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">Кг</p>
          </div>
          <div class="category-1" @click="selectpackaging('1kg')">
            <img v-if="packaging == '1kg'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">1кг</p>
          </div>
          <div class="category-1" @click="selectpackaging('300pcs')">
            <img v-if="packaging == '300pcs'" class="role-checker" src="@/assets/check.svg">
            <img v-else class="role-checker" src="@/assets/uncheck.svg">
            <p class="category-title">300шт</p>
          </div>
        </div>
      </div>
      <!-- <div class="btns-edit-product">
        <div class="btn-confirm" :style="{ color: editTrue ? 'var(--green-color)' : 'var(--grey-color)' }" @click="editTrue ? editItem() : null">
          Готово
        </div>
        <div class="btn-cancel" @click="delItem()">
          Удалить товра
        </div>
      </div> -->
    </div>

</template>


<style scoped>

.imm{
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.btn-cancel{
  width: 100%;
  background-color: var(--red-color);
  color: white;
  padding-top: 15px;
  padding-bottom: 15px;
  border-radius: var(--border-radius);
}

.btn-confirm {
  width: 100%;
  color: white;
  padding-top: 15px;
  padding-bottom: 15px;
  border-radius: var(--border-radius);
}

.btns-edit-product{
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 50px;
}

.role-checker {
  width: 18px;
  display: flex;
}

.category-1 {
  display: flex;
  width: 90%;
  align-items: center;
  justify-content: start;
  gap: 10px;
}

.category-title{
  color: black;
  font-weight: 400;
  font-size: 16px;
  margin-left: 5%;
}

.body-category{
  display: flex;
  position: relative;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.head-category {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.input {
  display: flex;
  width: 100%;
  background-color: var(--grey-color);
  height: 11.7vw;
  border-radius: var(--border-radius);
}

.name-product-text{
  font-size: 16px;
  font-weight: 500;
}

.name-product, .category-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10px;
  text-align: start;
}

.body{
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
}

.head{
  width: 100%;
  text-align: start;
  font-size: 18px;
  font-weight: 500;
}

input.text::placeholder {
  color: #B9B9B9;
}

input.text {
  background-color: inherit;
  color: black;
  font-weight: 500;
  font-size: 16px;
  padding: 0px;
  font-family: inherit;
  margin: 0;
  border: none;
  outline: none;
  width: 90%;
  margin-left: 5%;
}

</style>
