import Order from '@/models/order'

type PointsAndOrders = {
    pointId: number,
    pointName: string,
    orders: Order[] 
}

export default PointsAndOrders;