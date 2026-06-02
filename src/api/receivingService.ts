import { ApiService } from "@/api/apiService";
import ProductForComplete from '@/models/receiving/productForComplete';

const auth = ApiService.getToken()!;

export class ReceivingService {

  //Получить все приёмки
  public async getAllReceipts(): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/receipts`;
    return await fetch(url, {
      method: 'GET',
      headers: headers,
    })
  }

  //Получить все продукты с полями из айки (для приёмки)
  public async getAllProducts(): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/all-products`;
    return await fetch(url, {
      method: 'GET',
      headers: headers,
    })
  }

  //Получить всех поставщиков
  public async getAllSuppliers(): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/suppliers`;
    return await fetch(url, {
      method: 'GET',
      headers: headers,
    })
  }

  //Получить конкретную приёмку по ID
  public async getReceiptById(receipt_id: number): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/receipts/${receipt_id}`;
    return await fetch(url, {
      method: 'GET',
      headers: headers,
    })
  }

  //Создать новую пустую приёмку
  public async createNewReceipt(supplier_uuid: string | null): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/receipts`;
    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        supplier_uuid
      })
    })
  }

  //Завершить приёмку
  public async completeReceipt(receipt_id: number | null, items: ProductForComplete[]): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/receipts/${receipt_id}/complete`;
    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        items
      })
    })
  }

  //Промежуточное сохранение
  public async saveReceiptProgress(receipt_id: number | null, items: ProductForComplete[]): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/receipts/${receipt_id}`;
    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        items
      })
    })
  }

  //Создать акт приготовления
  public async getCookingAct(items: { id: number; quantity: number, packagingName: string, packagingId: string }[], status: boolean, comment: string): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/cooking-acts`;
    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        items,
        status,
        comment
      })
    })
  }
}