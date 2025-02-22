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
import { NotificationRepository } from "@/lib/core/repositories/notification.repository";
import { NotificationService } from "@/lib/core/services/notification.service";

let isNotificationInitialized = false;

// 通知機能専用のコンテナ（メインコンテナの子コンテナとして作成）
const notificationContainer = container.createChildContainer();

export function initializeNotificationContainer() {
  if (isNotificationInitialized) return;

  notificationContainer.registerSingleton<INotificationRepository>(
    "INotificationRepository",
    NotificationRepository
  );
  notificationContainer.registerSingleton<INotificationService>(
    "NotificationService",
    NotificationService
  );

  isNotificationInitialized = true;
}

export { notificationContainer };
