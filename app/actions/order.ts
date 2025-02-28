"use server";

import {
  Order,
  OrderItem,
  CreateOrderInput,
  UpdateOrderInput,
  CreateOrderItemInput,
} from "@/lib/core/domain/order.domain";
import { getContainer } from "@/lib/di/container";
import { IOrderService } from "@/lib/core/services/interfaces/order.service.interface";

function getOrderService() {
  const container = getContainer();
  return container.resolve<IOrderService>("OrderService");
}

export async function getOrders(): Promise<Order[]> {
  const orderService = getOrderService();
  const orders = await orderService.findAll();
  return orders;
}

export async function getOrderById(id: number): Promise<Order | null> {
  const orderService = getOrderService();
  return await orderService.findById(id);
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const orderService = getOrderService();
  return await orderService.findByUserId(userId);
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  const orderService = getOrderService();
  return await orderService.create(data);
}

export async function createOrderItems(
  orderId: number,
  items: Omit<CreateOrderItemInput, "orderId">[]
): Promise<OrderItem[]> {
  const orderService = getOrderService();
  const orderItems = await Promise.all(
    items.map((item) => orderService.createOrderItem({ ...item, orderId }))
  );
  return orderItems;
}

export async function updateOrder(
  id: number,
  data: UpdateOrderInput
): Promise<Order | null> {
  const orderService = getOrderService();
  return await orderService.update(id, data);
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const orderService = getOrderService();
  return await orderService.getOrderItems(orderId);
}
