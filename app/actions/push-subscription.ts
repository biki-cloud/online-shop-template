"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/user";
import {
  serverNotificationContainer,
  initializeServerNotificationContainer,
} from "@/lib/di/server-notification-container";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import type { PushSubscriptionService } from "@/lib/core/services/push-subscription.service.impl";
import type { WebPushSubscription } from "@/lib/core/repositories/interfaces/push-subscription.repository.interface";

export async function savePushSubscription(subscription: WebPushSubscription) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("認証が必要です");
    }

    initializeServerNotificationContainer();
    const service =
      serverNotificationContainer.resolve<PushSubscriptionService>(
        NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE
      );

    await service.saveSubscription(user.id, subscription);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("プッシュ通知の購読情報の保存に失敗しました:", error);
    return { success: false, error: "プッシュ通知の設定に失敗しました" };
  }
}

export async function deletePushSubscription() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("認証が必要です");
    }

    initializeServerNotificationContainer();
    const service =
      serverNotificationContainer.resolve<PushSubscriptionService>(
        NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE
      );

    await service.deleteSubscription(user.id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("プッシュ通知の購読情報の削除に失敗しました:", error);
    return { success: false, error: "プッシュ通知の解除に失敗しました" };
  }
}

export async function getPushSubscription() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("認証が必要です");
    }

    initializeServerNotificationContainer();
    const service =
      serverNotificationContainer.resolve<PushSubscriptionService>(
        NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE
      );

    const subscription = await service.getSubscription(user.id);
    return { success: true, subscription };
  } catch (error) {
    console.error("プッシュ通知の購読情報の取得に失敗しました:", error);
    return { success: false, error: "プッシュ通知の情報取得に失敗しました" };
  }
}
