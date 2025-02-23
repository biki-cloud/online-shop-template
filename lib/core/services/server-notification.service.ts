import "reflect-metadata";
import { injectable, inject } from "tsyringe";
import type { NotificationPayload } from "../domain/notification";
import type { INotificationService } from "./interfaces/notification.service";
import type { INotificationRepository } from "../repositories/interfaces/notification.repository";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import webPush from "web-push";
import type { Product } from "@/lib/infrastructure/db/schema";
import type { IPushSubscriptionService } from "./interfaces/push-subscription.service";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(NOTIFICATION_TOKENS.REPOSITORY)
    private repository: INotificationRepository,
    @inject(NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE)
    private pushSubscriptionService: IPushSubscriptionService
  ) {
    // Web Push通知の設定
    if (
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY
    ) {
      webPush.setVapidDetails(
        `mailto:${
          process.env.NEXT_PUBLIC_CONTACT_EMAIL || "admin@example.com"
        }`,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    }
  }

  // サーバーサイドでは使用しないメソッドをスタブ実装
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

  async getStoredSubscription(): Promise<PushSubscription | null> {
    return null;
  }

  // 実際に使用するメソッド
  async notifyNewProduct(product: Product): Promise<void> {
    const subscriptions =
      await this.pushSubscriptionService.getAllSubscriptions();

    const payload = {
      notification: {
        title: "新商品が登録されました！",
        body: `${product.name}が新しく追加されました。`,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: {
          url: `/products/${product.id}`,
          productId: product.id,
        },
        actions: [
          {
            action: "open",
            title: "商品を見る",
          },
        ],
      },
    };

    const errors: Error[] = [];
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify(payload)
          );
        } catch (error) {
          if (error instanceof Error) {
            errors.push(error);
            // 購読が無効になっている場合は削除
            await this.pushSubscriptionService.deleteSubscription(
              subscription.userId
            );
          }
        }
      })
    );

    if (errors.length > 0) {
      console.error("通知の送信中にエラーが発生しました:", errors);
    }
  }
}
