"use client";

import { injectable } from "tsyringe";
import type {
  NotificationSubscription,
  NotificationPayload,
} from "../domain/notification.domain";
import type { INotificationRepository } from "./interfaces/notification.repository.interface";

@injectable()
export class NotificationRepository implements INotificationRepository {
  private readonly STORAGE_KEYS = {
    NOTIFICATION_STATUS: "push-notification-status",
    SUBSCRIPTION: "push-subscription",
  };

  async checkSupport(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    return "Notification" in window && "serviceWorker" in navigator;
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (typeof window === "undefined") return null;
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
    if (typeof window === "undefined") return false;
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
    if (typeof window === "undefined") return false;
    try {
      const response = await fetch("/api/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: this.convertSubscriptionToWebPush(subscription),
          payload,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to send notification:", error);
      return false;
    }
  }

  saveSubscription(subscription: PushSubscription): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEYS.NOTIFICATION_STATUS, "true");
    localStorage.setItem(
      this.STORAGE_KEYS.SUBSCRIPTION,
      JSON.stringify(subscription)
    );
  }

  clearSubscription(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.STORAGE_KEYS.NOTIFICATION_STATUS);
    localStorage.removeItem(this.STORAGE_KEYS.SUBSCRIPTION);
  }

  async getStoredSubscription(): Promise<PushSubscription | null> {
    if (typeof window === "undefined") return null;
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
