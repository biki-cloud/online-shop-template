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

"use client";

import "reflect-metadata";
import { container } from "tsyringe";
import { NotificationRepository } from "@/lib/core/repositories/client-notification.repository";
import { ClientNotificationService } from "@/lib/core/services/client-notification.service";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";

let isNotificationInitialized = false;

// クライアントサイドの通知機能専用のコンテナ
const notificationContainer = container.createChildContainer();

export function initializeNotificationContainer() {
  if (isNotificationInitialized) return;

  notificationContainer.registerSingleton(
    NOTIFICATION_TOKENS.REPOSITORY,
    NotificationRepository
  );
  notificationContainer.registerSingleton(
    NOTIFICATION_TOKENS.SERVICE,
    ClientNotificationService
  );

  isNotificationInitialized = true;
}

export { notificationContainer };
