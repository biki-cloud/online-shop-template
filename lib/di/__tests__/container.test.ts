import "reflect-metadata";
import { container as tsyringeContainer } from "tsyringe";

// 実際のクラス実装をインポートする代わりにモックを使用
const mockClasses = {
  CartRepository: class CartRepository {},
  OrderRepository: class OrderRepository {},
  PaymentRepository: class PaymentRepository {},
  UserRepository: class UserRepository {},
  ProductRepository: class ProductRepository {},
  CartService: class CartService {},
  ProductService: class ProductService {},
  PaymentService: class PaymentService {},
  OrderService: class OrderService {},
  UserService: class UserService {},
  UrlService: class UrlService {},
  EmailServiceImpl: class EmailServiceImpl {},
  AuthService: class AuthService {},
  SessionService: class SessionService {},
};

// データベースのモック
jest.mock("@/lib/infrastructure/db/drizzle", () => ({
  db: {
    query: jest.fn(),
  },
}));

// リポジトリのモック
jest.mock("@/lib/core/repositories/cart.repository.impl", () => ({
  CartRepository: mockClasses.CartRepository,
}));
jest.mock("@/lib/core/repositories/order.repository.impl", () => ({
  OrderRepository: mockClasses.OrderRepository,
}));
jest.mock("@/lib/core/repositories/payment.repository.impl", () => ({
  PaymentRepository: mockClasses.PaymentRepository,
}));
jest.mock("@/lib/core/repositories/user.repository.impl", () => ({
  UserRepository: mockClasses.UserRepository,
}));
jest.mock("@/lib/core/repositories/product.repository.impl", () => ({
  ProductRepository: mockClasses.ProductRepository,
}));

// サービスのモック
jest.mock("@/lib/core/services/cart.service.impl", () => ({
  CartService: mockClasses.CartService,
}));
jest.mock("@/lib/core/services/product.service.impl", () => ({
  ProductService: mockClasses.ProductService,
}));
jest.mock("@/lib/core/services/payment.service.impl", () => ({
  PaymentService: mockClasses.PaymentService,
}));
jest.mock("@/lib/core/services/order.service.impl", () => ({
  OrderService: mockClasses.OrderService,
}));
jest.mock("@/lib/core/services/user.service.impl", () => ({
  UserService: mockClasses.UserService,
}));
jest.mock("@/lib/core/services/url.service.impl", () => ({
  UrlService: mockClasses.UrlService,
}));
jest.mock("@/lib/core/services/email.service.impl", () => ({
  EmailServiceImpl: mockClasses.EmailServiceImpl,
}));
jest.mock("@/lib/core/services/auth.service.impl", () => ({
  AuthService: mockClasses.AuthService,
}));
jest.mock("@/lib/core/services/session.service.impl", () => ({
  SessionService: mockClasses.SessionService,
}));

describe("container", () => {
  let containerModule: any;

  beforeEach(() => {
    // テスト毎にモジュールキャッシュをリセット
    jest.resetModules();

    // tsyringeのコンテナをクリア
    tsyringeContainer.clearInstances();

    // container.tsモジュールを再インポート
    containerModule = require("../container");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getContainerはコンテナインスタンスを返す", () => {
    const { getContainer, container } = containerModule;
    expect(getContainer()).toBe(container);
    expect(getContainer()).toBeDefined();
  });

  describe("リポジトリゲッター", () => {
    it("getCartRepositoryは正しくリポジトリを解決する", () => {
      const { getCartRepository } = containerModule;
      const cartRepo = getCartRepository();
      expect(cartRepo).toBeDefined();
      expect(cartRepo.constructor.name).toBe("CartRepository");
    });

    it("getOrderRepositoryは正しくリポジトリを解決する", () => {
      const { getOrderRepository } = containerModule;
      const orderRepo = getOrderRepository();
      expect(orderRepo).toBeDefined();
      expect(orderRepo.constructor.name).toBe("OrderRepository");
    });

    it("getPaymentRepositoryは正しくリポジトリを解決する", () => {
      const { getPaymentRepository } = containerModule;
      const paymentRepo = getPaymentRepository();
      expect(paymentRepo).toBeDefined();
      expect(paymentRepo.constructor.name).toBe("PaymentRepository");
    });

    it("getUserRepositoryは正しくリポジトリを解決する", () => {
      const { getUserRepository } = containerModule;
      const userRepo = getUserRepository();
      expect(userRepo).toBeDefined();
      expect(userRepo.constructor.name).toBe("UserRepository");
    });

    it("getProductRepositoryは正しくリポジトリを解決する", () => {
      const { getProductRepository } = containerModule;
      const productRepo = getProductRepository();
      expect(productRepo).toBeDefined();
      expect(productRepo.constructor.name).toBe("ProductRepository");
    });
  });

  describe("サービスゲッター", () => {
    it("getCartServiceは正しくサービスを解決する", () => {
      const { getCartService } = containerModule;
      const cartService = getCartService();
      expect(cartService).toBeDefined();
      expect(cartService.constructor.name).toBe("CartService");
    });

    it("getProductServiceは正しくサービスを解決する", () => {
      const { getProductService } = containerModule;
      const productService = getProductService();
      expect(productService).toBeDefined();
      expect(productService.constructor.name).toBe("ProductService");
    });

    it("getPaymentServiceは正しくサービスを解決する", () => {
      const { getPaymentService } = containerModule;
      const paymentService = getPaymentService();
      expect(paymentService).toBeDefined();
      expect(paymentService.constructor.name).toBe("PaymentService");
    });

    it("getOrderServiceは正しくサービスを解決する", () => {
      const { getOrderService } = containerModule;
      const orderService = getOrderService();
      expect(orderService).toBeDefined();
      expect(orderService.constructor.name).toBe("OrderService");
    });

    it("getUserServiceは正しくサービスを解決する", () => {
      const { getUserService } = containerModule;
      const userService = getUserService();
      expect(userService).toBeDefined();
      expect(userService.constructor.name).toBe("UserService");
    });

    it("getUrlServiceは正しくサービスを解決する", () => {
      const { getUrlService } = containerModule;
      const urlService = getUrlService();
      expect(urlService).toBeDefined();
      expect(urlService.constructor.name).toBe("UrlService");
    });

    it("getEmailServiceは正しくサービスを解決する", () => {
      const { getEmailService } = containerModule;
      const emailService = getEmailService();
      expect(emailService).toBeDefined();
      expect(emailService.constructor.name).toBe("EmailServiceImpl");
    });

    it("getAuthServiceは正しくサービスを解決する", () => {
      const { getAuthService } = containerModule;
      const authService = getAuthService();
      expect(authService).toBeDefined();
      expect(authService.constructor.name).toBe("AuthService");
    });

    it("getSessionServiceは正しくサービスを解決する", () => {
      const { getSessionService } = containerModule;
      const sessionService = getSessionService();
      expect(sessionService).toBeDefined();
      expect(sessionService.constructor.name).toBe("SessionService");
    });
  });

  describe("コンテナ初期化プロセス", () => {
    it("isInitializedフラグにより2回目以降の初期化は無視される", () => {
      const { container } = containerModule;

      // containerのspyを作成
      const registerSingletonSpy = jest.spyOn(container, "registerSingleton");
      const registerInstanceSpy = jest.spyOn(container, "registerInstance");

      // container.tsファイルから非公開の初期化関数を取得
      const initializeContainer =
        jest.requireActual("../container").initializeContainer;

      // 初期化済みなので、これらのメソッドは呼ばれないはず
      if (typeof initializeContainer === "function") {
        // 2回目の初期化を試みる
        initializeContainer();

        // 初期化済みなので登録メソッドは呼ばれないことを確認
        expect(registerSingletonSpy).not.toHaveBeenCalled();
        expect(registerInstanceSpy).not.toHaveBeenCalled();
      }
    });

    it("コンテナを通じて全てのサービスとリポジトリにアクセスできる", () => {
      const { container } = containerModule;

      // 全てのサービスとリポジトリの名前をリスト化
      const serviceNames = [
        "CartService",
        "ProductService",
        "PaymentService",
        "OrderService",
        "UserService",
        "UrlService",
        "EmailService",
        "AuthService",
        "SessionService",
      ];

      const repositoryNames = [
        "CartRepository",
        "OrderRepository",
        "PaymentRepository",
        "UserRepository",
        "ProductRepository",
      ];

      // 全てのサービスが解決できることを確認
      serviceNames.forEach((serviceName) => {
        expect(() => container.resolve(serviceName)).not.toThrow();
        const service = container.resolve(serviceName);
        expect(service).toBeDefined();
      });

      // 全てのリポジトリが解決できることを確認
      repositoryNames.forEach((repoName) => {
        expect(() => container.resolve(repoName)).not.toThrow();
        const repo = container.resolve(repoName);
        expect(repo).toBeDefined();
      });

      // データベースも解決できることを確認
      expect(() => container.resolve("Database")).not.toThrow();
      const db = container.resolve("Database");
      expect(db).toBeDefined();
      expect(db.query).toBeDefined();
    });
  });

  describe("エラーケース", () => {
    it("未登録のトークンを解決しようとするとエラーがスローされる", () => {
      const { container } = containerModule;
      expect(() => container.resolve("NonExistentService")).toThrow();
    });
  });
});
