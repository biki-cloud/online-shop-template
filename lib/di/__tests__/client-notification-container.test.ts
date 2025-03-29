import "reflect-metadata";
import { container as tsyringeContainer } from "tsyringe";
import {
  notificationContainer,
  initializeNotificationContainer,
} from "../client-notification-container";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import { NotificationRepository } from "@/lib/core/repositories/client-notification.repository.impl";
import { ClientNotificationService } from "@/lib/core/services/client-notification.service.impl";

// jestのモジュールのモック状態をリセット
jest.resetModules();

describe("client-notification-container", () => {
  beforeEach(() => {
    // tsyringeのコンテナをクリア
    tsyringeContainer.clearInstances();

    // 内部の初期化フラグをリセットするため、モジュールをリロード
    jest.isolateModules(() => {
      const module = require("../client-notification-container");
      // モジュールを再読み込みした時点ではリセットされている
    });
  });

  it("notificationContainerはtsyringeのコンテナのインスタンスである", () => {
    expect(notificationContainer).toBeDefined();
    // チャイルドコンテナの存在を確認する方法として、親コンテナと異なるインスタンスであることを確認
    expect(notificationContainer).not.toBe(tsyringeContainer);
  });

  it("初回の初期化で通知サービスとリポジトリを登録する", () => {
    // リゾルブ前にエラーが発生することを確認
    expect(() => {
      notificationContainer.resolve(NOTIFICATION_TOKENS.SERVICE);
    }).toThrow();

    // 初期化の呼び出し
    initializeNotificationContainer();

    // 必要なサービスとリポジトリが登録されていることを確認
    const notificationService = notificationContainer.resolve(
      NOTIFICATION_TOKENS.SERVICE
    );
    const notificationRepo = notificationContainer.resolve(
      NOTIFICATION_TOKENS.REPOSITORY
    );

    expect(notificationService).toBeInstanceOf(ClientNotificationService);
    expect(notificationRepo).toBeInstanceOf(NotificationRepository);
  });

  it("2回目以降の初期化は無視される", () => {
    // 最初の初期化
    initializeNotificationContainer();

    // 初期登録されたインスタンスを取得
    const firstService = notificationContainer.resolve(
      NOTIFICATION_TOKENS.SERVICE
    );

    // モックを使って再登録されるかを監視
    const spyRegisterSingleton = jest.spyOn(
      notificationContainer,
      "registerSingleton"
    );

    // 2回目の初期化
    initializeNotificationContainer();

    // registerSingletonが呼ばれていないことを確認
    expect(spyRegisterSingleton).not.toHaveBeenCalled();

    // 2回目の初期化後も同じインスタンスが返されることを確認
    const secondService = notificationContainer.resolve(
      NOTIFICATION_TOKENS.SERVICE
    );
    expect(secondService).toBe(firstService);
  });
});
