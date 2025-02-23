/**
 * 通知機能専用のDIコンテナ
 *
 * このファイルを分離した理由：
 * 1. サーバー/クライアントの分離
 *    - メインのDIコンテナはサーバーサイドの機能（認証、DB操作など）を含む
 *    - 通知機能はブラウザAPIに依存する純粋なクライアントサイド機能
 *
 * 2. 依存関係の分離
 *    - メインコンテナが持つ`next/headers`などのサーバー専用APIへの依存を避ける
 *    - クライアントコンポーネントで安全に使用できる独立した通知機能を実現
 *
 * 3. コードの責務の明確化
 *    - 通知機能に関連するDI設定を1つのファイルにまとめることで管理を容易に
 *    - 機能の追加・変更時の影響範囲を限定的に
 */

import "reflect-metadata";
import { container } from "tsyringe";
import type { INotificationRepository } from "@/lib/core/repositories/interfaces/notification.repository";
import type { INotificationService } from "@/lib/core/services/interfaces/notification.service";
import type { IPushSubscriptionRepository } from "@/lib/core/repositories/interfaces/push-subscription.repository";
import { NotificationRepository } from "@/lib/core/repositories/notification.repository";
import { NotificationService } from "@/lib/core/services/notification.service";
import { PushSubscriptionRepository } from "@/lib/core/repositories/push-subscription.repository";
import { PushSubscriptionService } from "@/lib/core/services/push-subscription.service";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import { db } from "@/lib/infrastructure/db/drizzle";

let isNotificationInitialized = false;

// 通知機能専用のコンテナ（メインコンテナの子コンテナとして作成）
const notificationContainer = container.createChildContainer();

export function initializeNotificationContainer() {
  if (isNotificationInitialized) return;

  // データベースインスタンスの登録
  notificationContainer.register("Database", {
    useValue: db,
  });

  notificationContainer.registerSingleton<INotificationRepository>(
    NOTIFICATION_TOKENS.REPOSITORY,
    NotificationRepository
  );
  notificationContainer.registerSingleton<INotificationService>(
    NOTIFICATION_TOKENS.SERVICE,
    NotificationService
  );
  notificationContainer.registerSingleton<IPushSubscriptionRepository>(
    NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_REPOSITORY,
    PushSubscriptionRepository
  );
  notificationContainer.registerSingleton<PushSubscriptionService>(
    NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE,
    PushSubscriptionService
  );

  isNotificationInitialized = true;
}

export { notificationContainer };
