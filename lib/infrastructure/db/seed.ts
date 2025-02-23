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
import { hash } from "bcryptjs";
import type { NewUser, NewProduct } from "./schema";
import { sql } from "drizzle-orm";

async function clearTables() {
  console.log("🗑️ テーブルの内容を削除中...");

  // 外部キー制約があるため、削除順序が重要
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(pushSubscriptions);
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
    ALTER SEQUENCE push_subscriptions_id_seq RESTART WITH 1;
  `);

  console.log("✅ テーブルの内容とシーケンスをリセットしました");
}

async function seedUsers() {
  console.log("🌱 ユーザーデータを作成中...");

  const testUsers: NewUser[] = [
    {
      name: "Test User",
      email: "test@example.com",
      passwordHash: await hash("password123", 10),
      role: "user",
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: await hash("admin123", 10),
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
      description:
        "クラシックなデザインのビキニ。エレガントなデザインで、デイリーからパーティーまで幅広く活躍。",
      price: "7500",
      currency: "JPY",
      imageUrl: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101",
      stock: 70,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "リネンブレンドシャツ - ホワイト",
      description:
        "通気性の良いリネン混紡素材を使用した、爽やかな着心地のシャツ。",
      price: "8900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80",
      stock: 65,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "クロップドデニム - ライトブルー",
      description:
        "トレンド感のあるクロップド丈のデニムパンツ。春夏のスタイリングに最適。",
      price: "11200",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
      stock: 45,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ストローハット - ナチュラル",
      description:
        "上質な麦わら素材を使用した、夏の定番アイテム。UVカット機能付き。",
      price: "6500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=800&q=80",
      stock: 80,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "シルクブラウス - ピンク",
      description:
        "上質なシルク素材を使用した、エレガントなブラウス。オフィスからパーティーまで活躍。",
      price: "16800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80",
      stock: 35,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "レザーベルト - ブラウン",
      description: "イタリアンレザーを使用した、クラシックなデザインのベルト。",
      price: "8500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      stock: 55,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "カシミアストール - グレー",
      description: "最高級カシミア100%を使用した、軽くて暖かいストール。",
      price: "22000",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
      stock: 30,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "クラッチバッグ - ブラック",
      description: "スムースレザーを使用した、スタイリッシュなクラッチバッグ。",
      price: "18500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "プリーツスカート - ネイビー",
      description:
        "エレガントなプリーツデザインのミディ丈スカート。オフィススタイルに最適。",
      price: "13800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
      stock: 45,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "パールネックレス - シルバー",
      description: "淡水パールを使用した、上品なデザインのネックレス。",
      price: "12500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      stock: 50,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "バンドカラーシャツ - ブルー",
      description: "スタンドカラーがスタイリッシュな印象のシャツ。",
      price: "8900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
      stock: 55,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "レザーミニスカート - ブラック",
      description: "本革を使用した、エッジの効いたミニスカート。",
      price: "19800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
      stock: 35,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "カーディガン - キャメル",
      description: "メリノウール100%を使用した、上質なカーディガン。",
      price: "14500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
      stock: 45,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ショルダーバッグ - レッド",
      description: "鮮やかな赤色が印象的な、コンパクトなショルダーバッグ。",
      price: "16800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "アンクルブーツ - ブラウン",
      description: "イタリア製レザーを使用した、クラシカルなデザインのブーツ。",
      price: "28000",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      stock: 30,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "フラワープリントワンピース",
      description:
        "春らしい花柄プリントのワンピース。軽やかな着心地で季節感たっぷり。",
      price: "15800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80",
      stock: 50,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "デニムジャケット - ブラック",
      description: "ブラックデニムを使用した、モードな印象のジャケット。",
      price: "16500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80",
      stock: 45,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ニットベスト - アイボリー",
      description: "トレンド感のあるニットベスト。レイヤードスタイルに最適。",
      price: "7800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
      stock: 60,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "レザーグローブ - ブラック",
      description: "上質なラムレザーを使用した、エレガントな手袋。",
      price: "8500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "マキシスカート - グリーン",
      description: "鮮やかなグリーンカラーのプリーツマキシスカート。",
      price: "14800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
      stock: 35,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "バケットハット - ブラック",
      description: "コットンツイル素材のカジュアルなバケットハット。",
      price: "5800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80",
      stock: 70,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "レザーウォレット - ブラウン",
      description: "本革を使用した、使い込むほどに味わいが増す長財布。",
      price: "23000",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "コットンパーカー - グレー",
      description: "オーガニックコットンを使用した、肌触りの良いパーカー。",
      price: "8900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
      stock: 55,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "プリーツパンツ - ブラック",
      description: "きれいめカジュアルスタイルに最適なプリーツパンツ。",
      price: "12800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
      stock: 50,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ビジューサンダル - シルバー",
      description: "パーティーシーンに映えるビジュー付きサンダル。",
      price: "13500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "リネンブレザー - ベージュ",
      description: "リネン混素材で仕立てた、軽やかな着心地のブレザー。",
      price: "19800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
      stock: 35,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "メタルフレームサングラス",
      description:
        "クラシカルなデザインのメタルフレームサングラス。UV400カット。",
      price: "15800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
      stock: 50,
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
