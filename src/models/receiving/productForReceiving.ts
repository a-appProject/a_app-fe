import { Barcode } from "@/models/order_scan_models/orderScan"
import { Packaging } from '@/models/packaging'

//Моделька продукта, который приходит с бэка при запросе на получение всех продуктов
export type ProductForReceiving = {
  amount: number
  barcode: Barcode[],
  description: string | null,
  icon: string,
  id: 1,
  name: string,
  packaging: Packaging[],
  part_of_amount: number,
  quantity: number,
  uuid: string,
}

//Моделька продукта, который будет лежать в приёмке
export type ProductInReceiving = {
  amount: number
  barcode: Barcode[],
  description: string | null,
  icon: string,
  id: 1,
  name: string,
  packaging: Packaging,
  receivedQuantity: number;
  uuid: string,
}

