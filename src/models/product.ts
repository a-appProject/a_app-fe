import { Packaging } from '@/models/packaging'
 
type Product = {
  id: number;
  name: string;
  description: string;
  packaging: Packaging[];
  quantity: number;
  icon: string;
}  

export type ProductWithPackaging = {
  id: number;
  name: string;
  description: string;
  packaging: Packaging;
  quantity: number;
  icon: string
}  

export default Product;