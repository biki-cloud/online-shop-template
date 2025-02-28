import {
  Order,
  OrderItem,
  CreateOrderInput,
  UpdateOrderInput,
  CreateOrderItemInput,
} from "../../domain/order.domain";

export interface IOrderService {
  findAll(): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
  findByUserId(userId: number): Promise<Order[]>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  create(data: CreateOrderInput): Promise<Order>;
  createOrderItem(data: CreateOrderItemInput): Promise<OrderItem>;
  update(id: number, data: UpdateOrderInput): Promise<Order | null>;
  findByStripeSessionId(sessionId: string): Promise<Order | null>;
}
