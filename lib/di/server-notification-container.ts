/**
 * サーバーサイドの通知機能専用のDIコンテナ
 *
 * このファイルを分離した理由：
 * 1. クライアント/サーバーの分離
 *    - データベース操作やサーバーサイドの機能を含む
 *    - クライアントサイドのコンテナとは独立して動作
 *
 * 2. 依存関係の分離
 *    - データベースやサーバーサイドのAPIに依存する機能を集約
 *    - クライアントサイドのコードに影響を与えない
 *
 * 3. コードの責務の明確化
 *    - サーバーサイドの通知機能に関連するDI設定を1つのファイルにまとめる
 *    - 機能の追加・変更時の影響範囲を限定的に
 */

import "reflect-metadata";
import { container } from "tsyringe";
import type { IPushSubscriptionRepository } from "@/lib/core/repositories/interfaces/push-subscription.repository.interface";
import { PushSubscriptionRepository } from "@/lib/core/repositories/push-subscription.repository.impl";
import { PushSubscriptionService } from "@/lib/core/services/push-subscription.service.impl";
import { NotificationService } from "@/lib/core/services/server-notification.service.impl";
import { ServerNotificationRepository } from "@/lib/core/repositories/server-notification.repository.impl";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import { db } from "@/lib/infrastructure/db/drizzle";

let isServerNotificationInitialized = false;

// サーバーサイドの通知機能専用のコンテナ
const serverNotificationContainer = container.createChildContainer();

export function initializeServerNotificationContainer() {
  if (isServerNotificationInitialized) return;

  // データベースインスタンスの登録
  serverNotificationContainer.register("Database", {
    useValue: db,
  });

  // プッシュ通知関連の登録
  serverNotificationContainer.registerSingleton<IPushSubscriptionRepository>(
    NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_REPOSITORY,
    PushSubscriptionRepository
  );
  serverNotificationContainer.registerSingleton<PushSubscriptionService>(
    NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE,
    PushSubscriptionService
  );

  // 通知サービスの登録
  serverNotificationContainer.registerSingleton(
    NOTIFICATION_TOKENS.REPOSITORY,
    ServerNotificationRepository
  );
  serverNotificationContainer.registerSingleton(
    NOTIFICATION_TOKENS.SERVICE,
    NotificationService
  );

  isServerNotificationInitialized = true;
}

export { serverNotificationContainer };
