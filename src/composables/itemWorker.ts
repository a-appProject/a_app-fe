import { itemsService } from '@/api/itemsService';
import { handleResponseError } from '@/tools/handleResponseError';

const items_service = new itemsService();

//Получить все точки
export async function getAllPoints() {
  try {
    const response = await items_service.getAllPoints();
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }catch(error) {
    console.error('Ошибка getAllPoints:', error);
    return null;
  }
}

//Получить продукты для конкретной точки
export async function getProductsByPoint(uuid: string) {
  try {
    const response = await items_service.getAllItems(uuid);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getProductsByPoint:', error);
    return null;
  }
}

//Синхронизировать продукты из айки в бд
export async function syncAllItemsFromIiko() {
  try {
    const response = await items_service.syncAllItemsFromIIko();
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка syncAllItemsFromIiko:', error);
    return null;
  }
}

//Синхронизировать точки
export async function syncAllPointsFromIiko() {
  try {
    const response = await items_service.syncPointFromIIko();
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка syncAllPointsFromIiko:', error);
    return null;
  }
}

//Синхронизировать поставщиков
export async function syncAllSuppliersFromIiko() {
  try {
    const response = await items_service.syncSuppliersFromIIko();
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка syncAllSuppliersFromIiko:', error);
    return null;
  }
}

//Получить продукты для заготовок
export async function getProductForCooking() {
  try {
    const response = await items_service.getProductForCooking();
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getProductForCooking:', error);
    return null;
  }
}