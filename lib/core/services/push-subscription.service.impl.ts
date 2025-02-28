import { injectable, inject } from "tsyringe";
import type {
  IPushSubscriptionRepository,
  WebPushSubscription,
} from "../repositories/interfaces/push-subscription.repository.interface";
import type { PushSubscription } from "@/lib/infrastructure/db/schema";
import type { IPushSubscriptionService } from "./interfaces/push-subscription.service.interface";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";

@injectable()
export class PushSubscriptionService implements IPushSubscriptionService {
  constructor(
    @inject(NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_REPOSITORY)
    private repository: IPushSubscriptionRepository
  ) {}

  async saveSubscription(
    userId: number,
    subscription: WebPushSubscription
  ): Promise<PushSubscription> {
    return this.repository.save(userId, subscription);
  }

  async deleteSubscription(userId: number): Promise<void> {
    await this.repository.delete(userId);
  }

  async getSubscription(userId: number): Promise<PushSubscription | null> {
    return this.repository.findByUserId(userId);
  }

  async getAllSubscriptions(): Promise<PushSubscription[]> {
    return this.repository.findAll();
  }
}
