import Supplier from "@/models/receiving/supplier"
import {ProductInReceiving} from "@/models/receiving/productForReceiving";

type Receipt = {
  id: number,
  supplier: Supplier,
  status: string,
  items: ProductInReceiving[]
}


export default Receipt;