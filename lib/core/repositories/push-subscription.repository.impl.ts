import { injectable, inject } from "tsyringe";
import { eq } from "drizzle-orm";
import type {
  IPushSubscriptionRepository,
  WebPushSubscription,
} from "./interfaces/push-subscription.repository.interface";
import type {
  PushSubscription,
  NewPushSubscription,
} from "@/lib/infrastructure/db/schema";
import { pushSubscriptions } from "@/lib/infrastructure/db/schema";
import type { Database } from "@/lib/infrastructure/db/drizzle";

@injectable()
export class PushSubscriptionRepository implements IPushSubscriptionRepository {
  constructor(
    @inject("Database")
    protected readonly db: Database
  ) {}

  async save(
    userId: number,
    subscription: WebPushSubscription
  ): Promise<PushSubscription> {
    const newSubscription: NewPushSubscription = {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    };

    // 既存の購読情報を削除
    await this.delete(userId);

    // 新しい購読情報を保存
    const [saved] = await this.db
      .insert(pushSubscriptions)
      .values(newSubscription)
      .returning();

    return saved;
  }

  async delete(userId: number): Promise<void> {
    await this.db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
  }

  async findByUserId(userId: number): Promise<PushSubscription | null> {
    const [subscription] = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId))
      .limit(1);

    return subscription || null;
  }

  async findAll(): Promise<PushSubscription[]> {
    return this.db.select().from(pushSubscriptions);
  }
}
