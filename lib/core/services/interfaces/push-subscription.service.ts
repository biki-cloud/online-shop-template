import type { PushSubscription } from "@/lib/infrastructure/db/schema";
import type { WebPushSubscription } from "@/lib/core/repositories/interfaces/push-subscription.repository";

export interface IPushSubscriptionService {
  saveSubscription(
    userId: number,
    subscription: WebPushSubscription
  ): Promise<PushSubscription>;
  deleteSubscription(userId: number): Promise<void>;
  getSubscription(userId: number): Promise<PushSubscription | null>;
  getAllSubscriptions(): Promise<PushSubscription[]>;
}
