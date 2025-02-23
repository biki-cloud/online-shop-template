import "reflect-metadata";
import { container } from "tsyringe";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import type { ICartRepository } from "@/lib/core/repositories/interfaces/cart.repository";
import type { IOrderRepository } from "@/lib/core/repositories/interfaces/order.repository";
import type { IPaymentRepository } from "@/lib/core/repositories/interfaces/payment.repository";
import type { IUserRepository } from "@/lib/core/repositories/interfaces/user.repository";
import type { IProductRepository } from "@/lib/core/repositories/interfaces/product.repository";
import { CartRepository } from "@/lib/core/repositories/cart.repository";
import { OrderRepository } from "@/lib/core/repositories/order.repository";
import { PaymentRepository } from "@/lib/core/repositories/payment.repository";
import { UserRepository } from "@/lib/core/repositories/user.repository";
import { ProductRepository } from "@/lib/core/repositories/product.repository";
import type { ICartService } from "@/lib/core/services/interfaces/cart.service";
import type { IProductService } from "@/lib/core/services/interfaces/product.service";
import type { IPaymentService } from "@/lib/core/services/interfaces/payment.service";
import type { IOrderService } from "@/lib/core/services/interfaces/order.service";
import type { IUserService } from "@/lib/core/services/interfaces/user.service";
import { CartService } from "@/lib/core/services/cart.service";
import { ProductService } from "@/lib/core/services/product.service";
import { PaymentService } from "@/lib/core/services/payment.service";
import { OrderService } from "@/lib/core/services/order.service";
import { UserService } from "@/lib/core/services/user.service";
import { db } from "@/lib/infrastructure/db/drizzle";
import { UrlService } from "@/lib/core/services/url.service";
import { IUrlService } from "../core/services/interfaces/url.service";
import type { IEmailService } from "@/lib/core/services/interfaces/email.service";
import { EmailServiceImpl } from "@/lib/core/services/email.service";

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

  isInitialized = true;
}

// 初期化を即時実行
initializeContainer();

export { container };

export function getContainer() {
  return container;
}
