export type Item = {
  barcode: string,
  name: string,
  description: string,
  packaging: string,
  orderQuantity: number,
  scannedQuantity: number,
}

export type Barcode = {
  barcode: string,
  containerId: string | null
}

export type OrderForScan = {
  order_id: number,
  status: string,
  items: Item[],
  comment?: string
} | null
