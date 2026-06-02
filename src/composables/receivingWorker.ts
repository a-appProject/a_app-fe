import { handleResponseError } from '@/tools/handleResponseError';
import { ReceivingService } from '@/api/receivingService';
import ProductForComplete from '@/models/receiving/productForComplete';

const receivingServese = new ReceivingService();

//Получить все продукты с полями из айки (для приёмки)
export async function getAllProductsForReceiving() {
  try {
    const response = await receivingServese.getAllProducts();
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getAllProducts:', error);
    return null;
  }
}

//Получить всех поставщиков
export async function getAllSuppliers() {
  try {
    const response = await receivingServese.getAllSuppliers();
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getAllProducts:', error);
    return null;
  }
}

//Получить все существующие приёмки
export async function getAllReceipts() {
  try {
    const response = await receivingServese.getAllReceipts();
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getAllProducts:', error);
    return null;
  }
}

//Полуичть конкретную приёмку по ID
export async function getReceiptById(receipt_id: number) {
  try {
    const response = await receivingServese.getReceiptById(receipt_id);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getAllProducts:', error);
    return null;
  }
}


//Создать новую пустую приёмку 
export async function createNewReceipt(supplier_uuid: string | null) {
  try {
    const response = await receivingServese.createNewReceipt(supplier_uuid);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getAllProducts:', error);
    return null;
  }
}

//Завершить приёмку
export async function completeReceipt(receipt_id: number | null, items: ProductForComplete[]) {
  try {
    const response = await receivingServese.completeReceipt(receipt_id, items);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getAllProducts:', error);
    return null;
  }
}

//Сохранить промежуточное состояние приёмки
export async function saveReceiptProgress(receipt_id: number | null, items: ProductForComplete[]) {
  try {
    const response = await receivingServese.saveReceiptProgress(receipt_id, items);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getAllProducts:', error);
    return null;
  }
}

//Создать акт приготовления
export async function getCookingAct(items: { id: number; quantity: number, packagingName: string, packagingId: string }[], status: boolean, comment: string) {
  try {
    const response = await receivingServese.getCookingAct(items, status, comment);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  }
  catch(error) {
    console.error('Ошибка getAllProducts:', error);
    return null;
  }
}