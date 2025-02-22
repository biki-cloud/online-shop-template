"use client";

import { injectable, inject } from "tsyringe";
import type { NotificationPayload } from "../domain/notification";
import type { INotificationService } from "./interfaces/notification.service";
import type { INotificationRepository } from "../repositories/interfaces/notification.repository";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject("INotificationRepository")
    private repository: INotificationRepository
  ) {}

  async checkSupport(): Promise<boolean> {
    return this.repository.checkSupport();
  }

  async requestPermission(): Promise<boolean> {
    return this.repository.requestPermission();
  }

  async subscribe(): Promise<PushSubscription | null> {
    const subscription = await this.repository.subscribe();
    if (subscription) {
      this.repository.saveSubscription(subscription);
    }
    return subscription;
  }

  async unsubscribe(subscription: PushSubscription): Promise<boolean> {
    const success = await this.repository.unsubscribe(subscription);
    if (success) {
      this.repository.clearSubscription();
    }
    return success;
  }

  async sendTestNotification(subscription: PushSubscription): Promise<boolean> {
    const testPayload: NotificationPayload = {
      title: "テスト通知",
      body: "プッシュ通知のテストです",
      url: "/",
    };
    return this.repository.sendNotification(subscription, testPayload);
  }

  async getStoredSubscription(): Promise<PushSubscription | null> {
    return this.repository.getStoredSubscription();
  }
}
