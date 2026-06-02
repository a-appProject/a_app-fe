import { ProductWithPackaging } from "@/models/product";

export type ProductItemInOrder = { 
  quantity: number; 
  product: ProductWithPackaging 
};

type Order = {
  id: number;
  status: string;
  products: ProductItemInOrder[];
  comment: string,
  point: number
}  

export default Order;