import { injectable } from "tsyringe";
import type { INotificationRepository } from "./interfaces/notification.repository";
import type { NotificationPayload } from "../domain/notification";

@injectable()
export class ServerNotificationRepository implements INotificationRepository {
  async checkSupport(): Promise<boolean> {
    return true;
  }

  async requestPermission(): Promise<boolean> {
    return true;
  }

  async subscribe(): Promise<PushSubscription | null> {
    return null;
  }

  async unsubscribe(): Promise<boolean> {
    return true;
  }

  async sendNotification(
    _subscription: PushSubscription,
    _payload: NotificationPayload
  ): Promise<boolean> {
    return true;
  }

  async saveSubscription(_subscription: PushSubscription): Promise<void> {
    // サーバーサイドでは何もしない
  }

  async clearSubscription(): Promise<void> {
    // サーバーサイドでは何もしない
  }

  async getStoredSubscription(): Promise<PushSubscription | null> {
    return null;
  }
}
