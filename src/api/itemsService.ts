import { ApiService } from "@/api/apiService";
import { Item } from '@/models/order_scan_models/orderScan'


export class itemsService {

  //Получить точки
  public async getAllPoints(): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/points`;
    return await fetch(url, 
      {
        method: 'GET',
        headers: headers
      }
    )
  }

  //Получить все товары
  public async getAllItems(uuid: string): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/products?uuid=${uuid}`;
    return await fetch(url, 
      {
        method: 'GET',
        headers: headers
      }
    )
  }

  //Получитьв се товары из айки и записать их в бд
  public async syncAllItemsFromIIko(): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/sync/products`;
    return await fetch(url, 
      {
      method: 'POST',
      headers: headers,
      }
    )
  }

  //Получитьв се товары из айки и записать их в бд
  public async syncPointFromIIko(): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/sync/stores`;
    return await fetch(url, 
      {
      method: 'POST',
      headers: headers,
      }
    )
  }

  //Получитьв се товары из айки и записать их в бд
  public async syncSuppliersFromIIko(): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/sync/suppliers`;
    return await fetch(url, 
      {
      method: 'POST',
      headers: headers,
      }
    )
  }

  //Добавить товар
  public async addItem(name: string, description: string, packaging: string): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/products`;
    return await fetch(url, 
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          name: name,
          description: description,
          packaging: packaging,
        })
      }
    )
  } 

  //Изменить товар
  public async editItem(productId: number, name: string, description: string, packaging: string): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/products/${productId}`;
    return await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        name: name,
        description: description,
        packaging: packaging,
      })
    })
  }

  //Удалить товар
  public async delItem(productId: number): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/products/${productId}`;
    return await fetch(url, {
      method: 'DELETE',
      headers: headers
    })
  }

  //Создать заказ
  public async addOrder(point_id: number, comment: string, products: { name: string; quantity: number }[]): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/points/${point_id}/orders`;
    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        products: products,
        comment: comment
      })
    })
  }

  //Получить заказы на точке
  public async getOrderByPoint(point_id: number | null): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/points/${point_id}/orders`;
    return await fetch(url, {
      method: 'GET',
      headers: headers,
    })
  }

  //Получить конкретный закакз по id
  public async getOrderById(point_id: number, order_id: number, context?: string): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/points/${point_id}/orders/${order_id}`;
    if (context) {
      url += "?context=" + context
    }
    return await fetch(url, {
      method: 'GET',
      headers: headers,
    })
  }

  //Изменить статус заказа
  public async editOrderStatus(point_id: number, order_id: number, status: string): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/points/${point_id}/orders/${order_id}/status`;
    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        status: status
      })
    })
  }

  //Получить статистику по заказу
  public async getStatisticByOrder(point_id: number | null, order_id: number | null): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/points/${point_id}/orders/${order_id}/admin`;
    return await fetch(url, {
      method: 'GET',
      headers: headers
    })
  }

  //Изменить конкретный заказ по id
  public async editOrderById(point_id: number, order_id: number, comment: string | null, products: { name: string; quantity: number }[]): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/points/${point_id}/orders/${order_id}`;
    return await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        products: products,
        comment: comment
      })
    })
  }

  public async completeOrderById(order_id: number, context: string, items: Item[]): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/complete-scan-${context}/${order_id}`;
    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        items: items,
      })
    })
  }

  public async saveProgressOrderById(point_id: number, order_id: number, context: string, items: Item[]): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/points/${point_id}/orders/${order_id}?context=${context}`;
    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        items: items,
      })
    })
  }

  //Получить продукты для заготовок
  public async getProductForCooking(): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/zagotovshik/products`;
    return await fetch(url, {
      method: 'GET',
      headers: headers
    })
  }
  
}