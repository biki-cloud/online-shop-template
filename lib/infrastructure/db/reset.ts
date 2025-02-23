import { db } from "./drizzle";
import {
  users,
  products,
  carts,
  cartItems,
  orders,
  orderItems,
  pushSubscriptions,
} from "./schema";

async function resetDatabase() {
  console.log("🗑️ データベースをリセット中...");

  try {
    // 外部キー制約があるため、削除順序が重要
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(cartItems);
    await db.delete(carts);
    await db.delete(pushSubscriptions);
    await db.delete(products);
    await db.delete(users);

    console.log("✅ データベースのリセットが完了しました");
    process.exit(0);
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

resetDatabase();
