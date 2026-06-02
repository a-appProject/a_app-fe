type Product = {
  id: number;
  name: string;
  description: string;
  packaging: string;
  quantity: number;
  icon: string
}  

type ProductItem = { 
  quantity: number; 
  product: Product 
};

type OrderTelegram = {
  id: number;
  status: string;
  products: ProductItem[];
  comment: string,
  point: number
}  

export default OrderTelegram;
