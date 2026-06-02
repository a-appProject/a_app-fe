import { itemsService } from '@/api/itemsService';
import { handleResponseError } from '@/tools/handleResponseError';
import { Item } from '@/models/order_scan_models/orderScan'

const items_service = new itemsService();

//Получить заказы на точке
export async function getOrdersByPoint(point_id: number | null) {
  try {
    const response = await items_service.getOrderByPoint(point_id);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data)  {
      return data;
    }
  } catch(error) {
    console.error('Ошибка getOrderByPoint:', error);
    return null;
  }
}

//Создать новый заказ
export async function addOrder(poit_id: number, comment: string, products: { name: string; quantity: number, containerId: string }[]) {
  try {
    const response = await items_service.addOrder(poit_id, comment, products);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  } catch(error) {
    console.error('Ошибка createOrder:', error);
    return null;
  }
}

//Изменить состав заказа
export async function editOrderById(point_id: number, params: { order_id: number, comment: string | null, products: { name: string; quantity: number, containerId: string }[] }) {
  try {
    const response = await items_service.editOrderById(point_id, params.order_id, params.comment, params.products);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  } catch(error) {
    console.error('Ошибка editStatusOrder:', error);
    return null;
  }
}

//Изменить статус заказа
export async function editOrderStatus(point_id: number, params: { order_id: number, status: string }) {
  try {
    const response = await items_service.editOrderStatus(point_id, params.order_id, params.status);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  } catch(error) {
    console.error('Ошибка editStatusOrder:', error);
    return null;
  }
}

//Получить продукты в заказе
export async function getOrderById(point_id: number | null, order_id: number, role?: string, context?: string) {
  try {
    let contextInRole: string | undefined = context;
    if (role && !contextInRole) {
      //Добавить обработку новой роли
      const isWarehouseRole = ['admin', 'warehouse', 'warehouse_driver', 'warehouse_driver_loader'].includes(role);
      contextInRole = isWarehouseRole ? 'warehouse' : 'point';
    }
    const response = await items_service.getOrderById(point_id!, order_id, contextInRole);
    const data = await response.json();
    if (await handleResponseError(response, data)) {
      return null;
    }
    return data || null;
  } catch(error) {
    console.error('Ошибка в getOrderById:', error);
    return null;
  }
}

//Получить временную статистику по заказу
export async function getStatisticByOrder(point_id: number | null, order_id: number | null) {
  try {
    const response = await items_service.getStatisticByOrder(point_id, order_id)
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data)  {
      return data;
    }
  }catch(error) {
    console.error('Ошибка getStatByOrderId:', error);
    return null;
  }
}

//Получить заказы для статистики
export async function fetchOrdersForStatistic(point_id: number) {
  try {
    const response = await items_service.getOrderByPoint(point_id)
    const data = await response.json()

    if (await handleResponseError(response, data)) return []

    return data ?? []
  } catch (error) {
    console.error('Ошибка fetchOrdersForStatistic:', error)
    return []
  }
}

//Завершить заказ
export async function completeOrderById(order_id: number, role: string, items: Item[]) {
  try {
    //Добавить обработку новой роли
    let contextInRole: string | undefined = role;
    if (role && !contextInRole) { 
      const isWarehouseRole = ['admin', 'warehouse', 'warehouse_driver', 'warehouse_driver_loader'].includes(role);
      contextInRole = isWarehouseRole ? 'warehouse' : 'point';
    }
    const response = await items_service.completeOrderById(order_id, contextInRole, items)
    const data = await response.json()

    if (await handleResponseError(response, data)) return []

    return data;
  } catch (error) {
    console.error('Ошибка fetchOrdersForStatistic:', error)
    return []
  }
}

//Сохранить промежуточный пргерсс по заказу
export async function saveProgressOrderById(point_id: number, order_id: number, role: string, items: Item[]) {
  try {
    //Добавить обработку новой роли
    let contextInRole: string | undefined = role;
    if (role && !contextInRole) { 
      const isWarehouseRole = ['admin', 'warehouse', 'warehouse_driver', 'warehouse_driver_loader'].includes(role);
      contextInRole = isWarehouseRole ? 'warehouse' : 'point';
    }
    const response = await items_service.saveProgressOrderById(point_id, order_id, contextInRole, items)
    const data = await response.json()

    if (await handleResponseError(response, data)) return []

    return data;
  } catch (error) {
    console.error('Ошибка fetchOrdersForStatistic:', error)
    return []
  }
}
