"use client";

import { injectable } from "tsyringe";
import type {
  NotificationSubscription,
  NotificationPayload,
} from "../domain/notification";
import type { INotificationRepository } from "./interfaces/notification.repository";

@injectable()
export class NotificationRepository implements INotificationRepository {
  private readonly STORAGE_KEYS = {
    NOTIFICATION_STATUS: "push-notification-status",
    SUBSCRIPTION: "push-subscription",
  };

  constructor() {}

  async checkSupport(): Promise<boolean> {
    return "Notification" in window && "serviceWorker" in navigator;
  }

  async requestPermission(): Promise<boolean> {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  async subscribe(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  async unsubscribe(subscription: PushSubscription): Promise<boolean> {
    try {
      await subscription.unsubscribe();
      return true;
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  }

  async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      await fetch("/api/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: this.convertSubscriptionToWebPush(subscription),
          payload,
        }),
      });
      return true;
    } catch (error) {
      console.error("Failed to send notification:", error);
      return false;
    }
  }

  saveSubscription(subscription: PushSubscription): void {
    localStorage.setItem(this.STORAGE_KEYS.NOTIFICATION_STATUS, "true");
    localStorage.setItem(
      this.STORAGE_KEYS.SUBSCRIPTION,
      JSON.stringify(subscription)
    );
  }

  clearSubscription(): void {
    localStorage.removeItem(this.STORAGE_KEYS.NOTIFICATION_STATUS);
    localStorage.removeItem(this.STORAGE_KEYS.SUBSCRIPTION);
  }

  async getStoredSubscription(): Promise<PushSubscription | null> {
    const storedStatus = localStorage.getItem(
      this.STORAGE_KEYS.NOTIFICATION_STATUS
    );
    const storedSubscription = localStorage.getItem(
      this.STORAGE_KEYS.SUBSCRIPTION
    );

    if (storedStatus === "true" && storedSubscription) {
      try {
        const registration = await navigator.serviceWorker.ready;
        return await registration.pushManager.getSubscription();
      } catch {
        this.clearSubscription();
        return null;
      }
    }
    return null;
  }

  private convertSubscriptionToWebPush(
    subscription: PushSubscription
  ): NotificationSubscription {
    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey("p256dh")
          ? btoa(
              String.fromCharCode(
                ...new Uint8Array(subscription.getKey("p256dh")!)
              )
            )
          : "",
        auth: subscription.getKey("auth")
          ? btoa(
              String.fromCharCode(
                ...new Uint8Array(subscription.getKey("auth")!)
              )
            )
          : "",
      },
    };
  }
}
