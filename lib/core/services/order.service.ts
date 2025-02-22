import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../repositories/interfaces/order.repository";
import type { IOrderService } from "./interfaces/order.service";
import type {
  Order,
  OrderItem,
  CreateOrderInput,
  UpdateOrderInput,
  CreateOrderItemInput,
} from "../domain/order";

@injectable()
export class OrderService implements IOrderService {
  constructor(
    @inject("OrderRepository")
    private readonly orderRepository: IOrderRepository
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.findAll();
  }

  async findById(id: number): Promise<Order | null> {
    return await this.orderRepository.findById(id);
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return await this.orderRepository.findByUserId(userId);
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await this.orderRepository.getOrderItems(orderId);
  }

  async create(data: CreateOrderInput): Promise<Order> {
    return await this.orderRepository.create(data);
  }

  async createOrderItem(data: CreateOrderItemInput): Promise<OrderItem> {
    const [orderItem] = await this.orderRepository.createOrderItems(
      data.orderId,
      [
        {
          productId: data.productId,
          quantity: data.quantity,
          price: data.price,
          currency: data.currency,
        },
      ]
    );
    return orderItem;
  }

  async update(id: number, data: UpdateOrderInput): Promise<Order | null> {
    return await this.orderRepository.update(id, data);
  }

  async findByStripeSessionId(sessionId: string): Promise<Order | null> {
    return await this.orderRepository.findByStripeSessionId(sessionId);
  }
}
