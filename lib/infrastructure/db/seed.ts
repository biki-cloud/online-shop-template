import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import {
  users,
  products,
  carts,
  cartItems,
  orders,
  orderItems,
} from "./schema";
import { hashPassword } from "@/lib/infrastructure/auth/session";
import type { NewUser, NewProduct } from "./schema";
import { sql } from "drizzle-orm";

async function clearTables() {
  console.log("🗑️ テーブルの内容を削除中...");

  // 外部キー制約があるため、削除順序が重要
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(products);
  await db.delete(users);

  // シーケンスをリセット
  await db.execute(sql`
    ALTER SEQUENCE users_id_seq RESTART WITH 1;
    ALTER SEQUENCE products_id_seq RESTART WITH 1;
    ALTER SEQUENCE carts_id_seq RESTART WITH 1;
    ALTER SEQUENCE cart_items_id_seq RESTART WITH 1;
    ALTER SEQUENCE orders_id_seq RESTART WITH 1;
    ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
  `);

  console.log("✅ テーブルの内容とシーケンスをリセットしました");
}

async function seedUsers() {
  console.log("🌱 ユーザーデータを作成中...");

  const testUsers: NewUser[] = [
    {
      name: "Test User",
      email: "test@example.com",
      passwordHash: await hashPassword("password123"),
      role: "user",
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: await hashPassword("admin123"),
      role: "admin",
    },
  ];

  for (const user of testUsers) {
    await db.insert(users).values(user);
  }

  console.log("✅ ユーザーデータを作成しました");
}

async function seedProducts() {
  console.log("🌱 商品データを作成中...");

  const testProducts: NewProduct[] = [
    {
      name: "クラシック ホワイト Tシャツ",
      description:
        "上質なコットン100%を使用した、シンプルで着回しやすいベーシックTシャツ。",
      price: "4900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      stock: 100,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "フローラル サマードレス",
      description:
        "軽やかな花柄プリントの夏向けワンピース。エレガントなデザインで、デイリーからパーティーまで幅広く活躍。",
      price: "12800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&q=80",
      stock: 50,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "デニムジャケット - ヴィンテージウォッシュ",
      description:
        "クラシックなデザインのデニムジャケット。ヴィンテージ加工が施された、こなれた雰囲気の一着。",
      price: "15800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
      stock: 30,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "レザースニーカー - ホワイト",
      description:
        "上質なレザーを使用したミニマルデザインのスニーカー。どんなスタイルにも合わせやすい万能アイテム。",
      price: "13500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
      stock: 45,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "トートバッグ - キャメル",
      description:
        "高級レザーを使用した大容量トートバッグ。ビジネスからカジュアルまで幅広く使える実用的なデザイン。",
      price: "24800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      stock: 25,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "アビエーターサングラス",
      description:
        "クラシックなアビエーターデザインのサングラス。UV400カット機能付き。",
      price: "16500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      stock: 60,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ウールブレンドセーター - グレー",
      description:
        "上質なウールブレンド素材を使用した、暖かみのあるクルーネックセーター。",
      price: "9800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "スリムフィットチノパン - ベージュ",
      description:
        "コットンツイル素材を使用した、スリムフィットのチノパン。オフィスカジュアルにも最適。",
      price: "8900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
      stock: 55,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ネイビー - ビキニ",
      description: "クラシックなデザインのビキニ。",
      price: "7500",
      currency: "JPY",
      imageUrl: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101",
      stock: 70,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
  ];

  for (const product of testProducts) {
    await db.insert(products).values(product);
  }

  console.log("✅ 商品データを作成しました");
}

async function main() {
  try {
    await clearTables();
    await seedUsers();
    await seedProducts();

    console.log("🎉 データベースの初期化が完了しました");
    process.exit(0);
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

main();
