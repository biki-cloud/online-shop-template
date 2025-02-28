import type {
  NotificationPayload,
  NotificationSubscription,
} from "../../domain/notification.domain";

export interface INotificationRepository {
  checkSupport(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  subscribe(): Promise<PushSubscription | null>;
  unsubscribe(subscription: PushSubscription): Promise<boolean>;
  sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean>;
  saveSubscription(subscription: PushSubscription): void;
  clearSubscription(): void;
  getStoredSubscription(): Promise<PushSubscription | null>;
}
