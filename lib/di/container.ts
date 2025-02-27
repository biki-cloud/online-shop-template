import "reflect-metadata";
import { container } from "tsyringe";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import type { ICartRepository } from "@/lib/core/repositories/interfaces/cart.repository.interface";
import type { IOrderRepository } from "@/lib/core/repositories/interfaces/order.repository.interface";
import type { IPaymentRepository } from "@/lib/core/repositories/interfaces/payment.repository.interface";
import type { IUserRepository } from "@/lib/core/repositories/interfaces/user.repository.interface";
import type { IProductRepository } from "@/lib/core/repositories/interfaces/product.repository.interface";
import { CartRepository } from "@/lib/core/repositories/cart.repository.impl";
import { OrderRepository } from "@/lib/core/repositories/order.repository.impl";
import { PaymentRepository } from "@/lib/core/repositories/payment.repository.impl";
import { UserRepository } from "@/lib/core/repositories/user.repository.impl";
import { ProductRepository } from "@/lib/core/repositories/product.repository.impl";
import type { ICartService } from "@/lib/core/services/interfaces/cart.service";
import type { IProductService } from "@/lib/core/services/interfaces/product.service";
import type { IPaymentService } from "@/lib/core/services/interfaces/payment.service";
import type { IOrderService } from "@/lib/core/services/interfaces/order.service";
import type { IUserService } from "@/lib/core/services/interfaces/user.service";
import { CartService } from "@/lib/core/services/cart.service.impl";
import { ProductService } from "@/lib/core/services/product.service.impl";
import { PaymentService } from "@/lib/core/services/payment.service.impl";
import { OrderService } from "@/lib/core/services/order.service.impl";
import { UserService } from "@/lib/core/services/user.service.impl";
import { db } from "@/lib/infrastructure/db/drizzle";
import { UrlService } from "@/lib/core/services/url.service.impl";
import { IUrlService } from "../core/services/interfaces/url.service.interface";
import type { IEmailService } from "@/lib/core/services/interfaces/email.service";
import { EmailServiceImpl } from "@/lib/core/services/email.service.impl";
import { AuthService } from "@/lib/core/services/auth.service.impl";
import type { IAuthService } from "@/lib/core/services/interfaces/auth.service";
import { ISessionService } from "../core/services/interfaces/session.service.interface";
import { SessionService } from "../core/services/session.service.impl";

let isInitialized = false;

function initializeContainer() {
  if (isInitialized) return;

  // Register Database
  container.registerInstance<Database>("Database", db);

  // Register Repositories
  container.registerSingleton<ICartRepository>(
    "CartRepository",
    CartRepository
  );
  container.registerSingleton<IOrderRepository>(
    "OrderRepository",
    OrderRepository
  );
  container.registerSingleton<IPaymentRepository>(
    "PaymentRepository",
    PaymentRepository
  );
  container.registerSingleton<IUserRepository>(
    "UserRepository",
    UserRepository
  );
  container.registerSingleton<IProductRepository>(
    "ProductRepository",
    ProductRepository
  );

  // Register Services
  container.registerSingleton<ICartService>("CartService", CartService);
  container.registerSingleton<IProductService>(
    "ProductService",
    ProductService
  );
  container.registerSingleton<IPaymentService>(
    "PaymentService",
    PaymentService
  );
  container.registerSingleton<IOrderService>("OrderService", OrderService);
  container.registerSingleton<IUserService>("UserService", UserService);
  container.registerSingleton<IUrlService>("UrlService", UrlService);
  container.registerSingleton<IEmailService>("EmailService", EmailServiceImpl);
  container.registerSingleton<IAuthService>("AuthService", AuthService);
  container.registerSingleton<ISessionService>(
    "SessionService",
    SessionService
  );

  isInitialized = true;
}

// 初期化を即時実行
initializeContainer();

export { container };

export function getContainer() {
  return container;
}

export function getCartService() {
  return container.resolve<ICartService>("CartService");
}
export function getProductService() {
  return container.resolve<IProductService>("ProductService");
}
export function getPaymentService() {
  return container.resolve<IPaymentService>("PaymentService");
}
export function getOrderService() {
  return container.resolve<IOrderService>("OrderService");
}
export function getUserService() {
  return container.resolve<IUserService>("UserService");
}
export function getUrlService() {
  return container.resolve<IUrlService>("UrlService");
}
export function getEmailService() {
  return container.resolve<IEmailService>("EmailService");
}
export function getAuthService() {
  return container.resolve<IAuthService>("AuthService");
}
export function getSessionService() {
  return container.resolve<ISessionService>("SessionService");
}

export function getCartRepository() {
  return container.resolve<ICartRepository>("CartRepository");
}
export function getOrderRepository() {
  return container.resolve<IOrderRepository>("OrderRepository");
}
export function getPaymentRepository() {
  return container.resolve<IPaymentRepository>("PaymentRepository");
}
export function getUserRepository() {
  return container.resolve<IUserRepository>("UserRepository");
}
export function getProductRepository() {
  return container.resolve<IProductRepository>("ProductRepository");
}
