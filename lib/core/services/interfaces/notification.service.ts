import type { NotificationPayload } from "../../domain/notification";

export interface INotificationService {
  checkSupport(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  subscribe(): Promise<PushSubscription | null>;
  unsubscribe(subscription: PushSubscription): Promise<boolean>;
  sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean>;
  getStoredSubscription(): Promise<PushSubscription | null>;
}
