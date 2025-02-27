import type {
  PushSubscription,
  NewPushSubscription,
} from "@/lib/infrastructure/db/schema";

export interface IPushSubscriptionRepository {
  save(
    userId: number,
    subscription: WebPushSubscription
  ): Promise<PushSubscription>;
  delete(userId: number): Promise<void>;
  findByUserId(userId: number): Promise<PushSubscription | null>;
  findAll(): Promise<PushSubscription[]>;
}

export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
