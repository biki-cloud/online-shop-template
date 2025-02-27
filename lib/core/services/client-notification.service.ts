"use client";

import "reflect-metadata";
import { injectable, inject } from "tsyringe";
import type { NotificationPayload } from "../domain/notification";
import type { INotificationService } from "./interfaces/notification.service";
import type { INotificationRepository } from "../repositories/interfaces/notification.repository.interface";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";

@injectable()
export class ClientNotificationService implements INotificationService {
  constructor(
    @inject(NOTIFICATION_TOKENS.REPOSITORY)
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

  async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean> {
    return this.repository.sendNotification(subscription, payload);
  }

  async getStoredSubscription(): Promise<PushSubscription | null> {
    return this.repository.getStoredSubscription();
  }
}
