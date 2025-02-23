/**
 * 通知機能に関連する定数の定義
 */

// DIトークンの定義
export const NOTIFICATION_TOKENS = {
  REPOSITORY: "INotificationRepository",
  SERVICE: "INotificationService",
  PUSH_SUBSCRIPTION_REPOSITORY: "IPushSubscriptionRepository",
  PUSH_SUBSCRIPTION_SERVICE: "IPushSubscriptionService",
} as const;
