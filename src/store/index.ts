import { createStore } from "vuex";
import Product from '@/models/product'
import User from "@/models/user";
import Order from "@/models/order";
import btn from '@/models/popup_button';
import { Packaging } from "@/models/packaging";
import { ProductWithPackaging } from "@/models/product";

const storedCart = localStorage.getItem("cart");
const storedUser = localStorage.getItem("user");

// Тип для корзины с разделением по точкам
interface PointCart {
  [pointId: number]: ProductWithPackaging[];
}

interface popUp {
  open: boolean, 
  text: string | null, 
  buttons: btn[] | null
}

export default createStore({
  state: {
    user: (storedUser && storedUser.startsWith("{")) ? JSON.parse(storedUser) : {
      id: 0,
      telegram_id: "",
      username: "",
      photo_url: "",
      role: ""
    },
    cart: storedCart ? JSON.parse(storedCart) as PointCart : {},
    products: [] as Product[],
    orders: [] as Order[],
    admins: [],
    telegramretrieveLaunchParams: null as any | null,
    authToken: null as string | null,
    popUp: {} as popUp,
  },
  getters: {
    getStatusPopUp: state => {
      return state.popUp;
    },
    // Получить все товары из корзины (всех точек)
    getAllCartItems: state => {
      return Object.values(state.cart).flat();
    },
    
    // Получить корзину для конкретной точки
    getCartItemsByPoint: (state) => (pointId: number) => {
      return state.cart[pointId] || [];
    },

    getAllProducts: (state) => state.products,
    
    // Получить структуру корзины с группировкой по точкам
    getCartByPoints: state => {
      return Object.entries(state.cart).map(([pointId, items]) => ({
        pointId: Number(pointId),
        items
      }));
    },
    
    // Получить конкретный товар из корзины точки
    getProductFromPoint: (state) => (pointId: number, productId: number) => {
      const pointItems = state.cart[pointId];
      if (!pointItems) return null;
      return pointItems.find(item => item.id === productId);
    },
    
    // // Получить общее количество товаров во всех точках
    // getTotalItemsCount: state => {
    //   return Object.values(state.cart).reduce((total, items) => {
    //     return total + items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    //   }, 0);
    // },
    
    // Старые геттеры (оставляем для обратной совместимости)
    getOrders: (state) => state.orders,
    getAdmin: (state) => state.admins,
    USER: (state) => { 
      return state.user
    },
    TELEGRAM_RETRIENE_LAUNCH_PARAMS: state => state.telegramretrieveLaunchParams,
    AUTH_TOKEN: state => state.authToken,
  },
  mutations: {
    SET_POPUP_PARAMS(state, popUp: popUp) {
      state.popUp = popUp;
    },
    SET_AUTH_TOKEN(state, token: string) {
      state.authToken = token;
    },
    SET_TELEGRAM_RETRIENE_LAUNCH_PARAMS(state, payload: any) { 
      state.telegramretrieveLaunchParams = payload;
    }, 
    SET_USER: (state, payload: User) => {
      if (typeof payload !== "object" || payload === null) {
        console.error("SET_USER: Некорректный payload", payload);
        return;
      }
    
      state.user = payload;
      localStorage.setItem("user", JSON.stringify(payload));
    },
    
    // Добавить товар в корзину точки
    addToPointCart(state, { pointId, product }: { pointId: number; product: ProductWithPackaging }) {
      // Инициализируем корзину для точки, если её нет
      if (!state.cart[pointId]) {
        state.cart[pointId] = [];
      }
      
      const existingProduct = state.cart[pointId].find((item: ProductWithPackaging) => (item.id === product.id) && (item.packaging.id === product.packaging.id));
      if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + (product.quantity || 1);
      } else {
        // Добавляем новый товар
        state.cart[pointId].push({
          ...product,
          quantity: product.quantity || 1
        });
      }
      
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    
    // Удалить товар из корзины точки
    removeFromPointCart(state, { pointId, productId, packaging }: { pointId: number; productId: number, packaging: Packaging }) {
      if (!state.cart[pointId]) return;
      
      state.cart[pointId] = state.cart[pointId].filter((item) => !(item.id === productId && item.packaging.id === packaging.id));
      
      // Если после удаления товаров в точке не осталось, удаляем запись точки
      if (state.cart[pointId].length === 0) {
        delete state.cart[pointId];
      }
      
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    
    // Обновить количество товара в корзине точки
    updatePointCartQuantity(state, { pointId, id, quantity, packaging }: { pointId: number; id: number; quantity: number, packaging: Packaging }) {
      if (!state.cart[pointId]) return;
      
      const product = state.cart[pointId].find(item => (item.id === id) && (item.packaging.id === packaging.id));
      if (product) {
        product.quantity = quantity;
      }
      
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    
    // Очистить корзину конкретной точки
    clearPointCart(state, pointId: number) {
      delete state.cart[pointId];
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    
    // Очистить все корзины (всех точек)
    clearAllCarts(state) {
      state.cart = {};
      localStorage.removeItem("cart");
    },

    setProducts(state, products: Product[]) {
      state.products = products
    },

    clearProducts(state) {
      state.products = [];
    }
  },
  actions: {
    setPopUp({commit}, popUp: popUp) {
      commit("SET_POPUP_PARAMS", popUp);
    },

    setAuthToken({ commit }, token: string) {
      commit("SET_AUTH_TOKEN", token);
    },
    
    setTelegramRetrieveLaunchParams({ commit }, payload) {
      commit("SET_TELEGRAM_RETRIENE_LAUNCH_PARAMS", payload);
    },
    
    setUser({commit}, user: User) {
      commit("SET_USER", user);
    },
    
    addProductToCart({ commit }, { product, pointId }: { product: ProductWithPackaging; pointId: number }) {
      commit("addToPointCart", { pointId, product });
    },
    
    removeProductFromCart({ commit }, { productId, pointId, packaging }: { productId: number; pointId: number, packaging: Packaging }) {
      commit("removeFromPointCart", { pointId, productId, packaging });
    },
    
    updateProductQuantity({ commit }, { id, quantity, pointId, packaging }: { id: number; quantity: number; pointId: number; packaging: Packaging }) {
      commit("updatePointCartQuantity", { pointId, id, quantity, packaging });
    },
    
    clearPointCart({ commit }, pointId: number) {
      commit("clearPointCart", pointId);
    },
    
    clearAllCart({ commit }) {
      commit("clearAllCarts");
    },
    
    setProducts({ commit }, products: Product[]) {
      commit("setProducts", products)
    },

    clearProducts({ commit }) {
      commit("clearProducts")
    },

  },
});