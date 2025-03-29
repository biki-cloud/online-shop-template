import "reflect-metadata";
import { container as tsyringeContainer } from "tsyringe";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import { ServerNotificationRepository } from "@/lib/core/repositories/server-notification.repository.impl";
import { NotificationService } from "@/lib/core/services/server-notification.service.impl";
import { PushSubscriptionRepository } from "@/lib/core/repositories/push-subscription.repository.impl";
import { PushSubscriptionService } from "@/lib/core/services/push-subscription.service.impl";

// データベースのモック
jest.mock("@/lib/infrastructure/db/drizzle", () => ({
  db: {
    query: jest.fn(),
  },
}));

describe("server-notification-container", () => {
  let serverNotificationContainer: any;
  let initializeServerNotificationContainer: any;

  beforeEach(() => {
    // テスト毎にモジュールキャッシュをリセット
    jest.resetModules();

    // tsyringeのコンテナをクリア
    tsyringeContainer.clearInstances();

    // モジュールを再インポート
    const containerModule = require("../server-notification-container");
    serverNotificationContainer = containerModule.serverNotificationContainer;
    initializeServerNotificationContainer =
      containerModule.initializeServerNotificationContainer;
  });

  it("serverNotificationContainerはtsyringeのコンテナのインスタンスである", () => {
    expect(serverNotificationContainer).toBeDefined();
    // チャイルドコンテナの存在を確認する方法として、親コンテナと異なるインスタンスであることを確認
    expect(serverNotificationContainer).not.toBe(tsyringeContainer);
  });

  it("初期化時にデータベースインスタンスを登録する", () => {
    // 初期化前はエラーが発生する
    expect(() => {
      serverNotificationContainer.resolve("Database");
    }).toThrow();

    // 初期化（引数なし）
    initializeServerNotificationContainer();

    // データベースが登録されていることを確認
    const registeredDb = serverNotificationContainer.resolve("Database");

    // データベースオブジェクトが存在することを確認
    expect(registeredDb).toBeDefined();
  });

  it("初期化時に必要なサービスとリポジトリを登録する", () => {
    // 初期化前はエラーが発生する
    expect(() => {
      serverNotificationContainer.resolve(NOTIFICATION_TOKENS.SERVICE);
    }).toThrow();

    // 初期化（引数なし）
    initializeServerNotificationContainer();

    // 各サービスとリポジトリが登録されていることを確認
    const notificationService = serverNotificationContainer.resolve(
      NOTIFICATION_TOKENS.SERVICE
    );
    const notificationRepo = serverNotificationContainer.resolve(
      NOTIFICATION_TOKENS.REPOSITORY
    );
    const pushSubscriptionRepo = serverNotificationContainer.resolve(
      NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_REPOSITORY
    );
    const pushSubscriptionService = serverNotificationContainer.resolve(
      NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE
    );

    // インスタンスが存在することを確認
    expect(notificationService).toBeDefined();
    expect(notificationRepo).toBeDefined();
    expect(pushSubscriptionRepo).toBeDefined();
    expect(pushSubscriptionService).toBeDefined();

    // クラス名チェック（インスタンスチェックの代わり）
    expect(notificationService.constructor.name).toBe("NotificationService");
    expect(notificationRepo.constructor.name).toBe(
      "ServerNotificationRepository"
    );
    expect(pushSubscriptionRepo.constructor.name).toBe(
      "PushSubscriptionRepository"
    );
    expect(pushSubscriptionService.constructor.name).toBe(
      "PushSubscriptionService"
    );
  });

  it("2回目以降の初期化は無視される", () => {
    // 初期化（引数なし）
    initializeServerNotificationContainer();

    // 初期登録されたインスタンスを取得
    const firstService = serverNotificationContainer.resolve(
      NOTIFICATION_TOKENS.SERVICE
    );

    // モックを使って再登録されるかを監視
    const spyRegisterSingleton = jest.spyOn(
      serverNotificationContainer,
      "registerSingleton"
    );

    // 2回目の初期化（引数なし）
    initializeServerNotificationContainer();

    // registerSingletonが呼ばれていないことを確認
    expect(spyRegisterSingleton).not.toHaveBeenCalled();

    // 2回目の初期化後も同じインスタンスが返されることを確認
    const secondService = serverNotificationContainer.resolve(
      NOTIFICATION_TOKENS.SERVICE
    );
    expect(secondService).toBe(firstService);
  });

  it("条件分岐のテスト: 初期化済みの場合は早期リターンする", () => {
    // registerSingletonを監視するスパイを設定
    const registerSingletonSpy = jest.spyOn(
      serverNotificationContainer,
      "registerSingleton"
    );

    // 初回の初期化（引数なし）
    initializeServerNotificationContainer();

    // registerSingletonが4回呼ばれたことを確認（DIコンテナの中でregisterSingletonが4回使われている）
    expect(registerSingletonSpy).toHaveBeenCalledTimes(4);

    // スパイの呼び出し回数をリセット
    registerSingletonSpy.mockClear();

    // 2回目の初期化（引数なし）
    initializeServerNotificationContainer();

    // isServerNotificationInitializedがtrueの場合、早期リターンするため
    // registerSingletonが呼ばれない
    expect(registerSingletonSpy).not.toHaveBeenCalled();
  });
});
