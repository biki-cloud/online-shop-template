import "reflect-metadata";
import { container as tsyringeContainer } from "tsyringe";
import {
  serverNotificationContainer,
  initializeServerNotificationContainer,
} from "../server-notification-container";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import { ServerNotificationRepository } from "@/lib/core/repositories/server-notification.repository.impl";
import { NotificationService } from "@/lib/core/services/server-notification.service.impl";
import { PushSubscriptionRepository } from "@/lib/core/repositories/push-subscription.repository.impl";
import { PushSubscriptionService } from "@/lib/core/services/push-subscription.service.impl";
import { db } from "@/lib/infrastructure/db/drizzle";

// モジュールモックをリセット
jest.resetModules();

// データベースモック
jest.mock("@/lib/infrastructure/db/drizzle", () => ({
  db: {
    query: jest.fn(),
  },
}));

describe("server-notification-container", () => {
  beforeEach(() => {
    // tsyringeのコンテナをクリア
    tsyringeContainer.clearInstances();

    // 内部の初期化フラグをリセットするため、モジュールをリロード
    jest.isolateModules(() => {
      const module = require("../server-notification-container");
      // モジュールを再読み込みした時点ではリセットされている
    });
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

    // 初期化
    initializeServerNotificationContainer();

    // データベースが登録されていることを確認
    const registeredDb = serverNotificationContainer.resolve("Database");
    expect(registeredDb).toBe(db);
  });

  it("初期化時に必要なサービスとリポジトリを登録する", () => {
    // 初期化前はエラーが発生する
    expect(() => {
      serverNotificationContainer.resolve(NOTIFICATION_TOKENS.SERVICE);
    }).toThrow();

    // 初期化
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

    // 型チェック
    expect(notificationService).toBeInstanceOf(NotificationService);
    expect(notificationRepo).toBeInstanceOf(ServerNotificationRepository);
    expect(pushSubscriptionRepo).toBeInstanceOf(PushSubscriptionRepository);
    expect(pushSubscriptionService).toBeInstanceOf(PushSubscriptionService);
  });

  it("2回目以降の初期化は無視される", () => {
    // 初期化
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

    // 2回目の初期化
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
    // spyを使って内部の処理が実行されるかを確認
    const registerSpy = jest.spyOn(serverNotificationContainer, "register");

    // 初回の初期化
    initializeServerNotificationContainer();
    expect(registerSpy).toHaveBeenCalledTimes(1); // Database登録で1回

    // registerSpy呼び出し回数をリセット
    registerSpy.mockClear();

    // 2回目の初期化
    initializeServerNotificationContainer();

    // isServerNotificationInitializedがtrueの場合、早期リターンするため
    // register()もregisterSingleton()も呼ばれない
    expect(registerSpy).not.toHaveBeenCalled();
  });
});
