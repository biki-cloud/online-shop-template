export interface INotificationService {
  checkSupport(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  subscribe(): Promise<PushSubscription | null>;
  unsubscribe(subscription: PushSubscription): Promise<boolean>;
  sendTestNotification(subscription: PushSubscription): Promise<boolean>;
  getStoredSubscription(): Promise<PushSubscription | null>;
}
