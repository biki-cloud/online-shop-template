### **📌 Next.js × Server Actions × ドメインモデルのアーキテクチャ（レイヤー構成）**

👉 **基本の流れ：**

```
Page (UI) → Server Actions (Controller) → Service (ビジネスロジック) → Domain (ドメインモデル) → Repository (DB操作)
```

---

## **✅ 各レイヤーの役割**

### **① `Page (UI)` レイヤー**

📌 **役割:**

- ユーザーが直接触れる部分（フロントエンド）
- `useState` や `useEffect` を用いて UI の状態管理
- `server actions` を呼び出してデータを取得・送信

📂 **例: `app/products/page.tsx`**

```tsx
export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          {product.name}: {product.price}円
        </div>
      ))}
    </div>
  );
}
```

---

### **② `Server Actions (Controller)` レイヤー**

📌 **役割:**

- **UI からのリクエストを受け取り、Service を呼び出す**
- **データのバリデーション・認証を行う**
- **直接 DB を操作せず、Service を通す**
- Next.js の **Server Actions** を利用して UI 側から呼び出される

📂 **例: `app/products/actions.ts`**

```ts
"use server";

import { ProductService } from "@/modules/product/service";

export async function fetchProducts() {
  return await ProductService.getAllProducts();
}

export async function createProduct(name: string, price: number) {
  return await ProductService.createProduct(name, price);
}
```

---

### **③ `Service (ビジネスロジック)` レイヤー**

📌 **役割:**

- アプリケーションの **ビジネスロジックを処理** する
- `Server Actions` に直接ロジックを書かないことでテストしやすくする
- **複数のリポジトリや外部 API を統合する役割**

📂 **例: `modules/product/service.ts`**

```ts
import { ProductRepository } from "./repository";
import { Product } from "./product";

export class ProductService {
  static async getAllProducts() {
    return await ProductRepository.findAll();
  }

  static async createProduct(name: string, price: number) {
    const product = new Product(name, price);
    return await ProductRepository.save(product);
  }
}
```

---

### **④ `Domain (ドメインモデル)` レイヤー**

📌 **役割:**

- **アプリケーションの中心となるデータ構造とルールを定義する**
- `new Product(name, price)` のようにドメインルールを持たせる
- ビジネスロジックが `Service` に散らばらないようにする

📂 **例: `modules/product/product.ts`**

```ts
export class Product {
  constructor(public name: string, public price: number) {
    if (price < 0) {
      throw new Error("価格は0以上である必要があります");
    }
  }
}
```

---

### **⑤ `Repository (DB操作)` レイヤー**

📌 **役割:**

- **データベースとのやりとりを抽象化**
- `Drizzle ORM` や `Prisma` を利用してデータを取得・保存
- 他のレイヤーが直接 SQL を書かなくてもよいようにする

📂 **例: `modules/product/repository.ts`**

```ts
import { db } from "@/lib/drizzle";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Product } from "./product";

export class ProductRepository {
  static async findAll() {
    return await db.select().from(products);
  }

  static async save(product: Product) {
    return await db
      .insert(products)
      .values({
        name: product.name,
        price: product.price,
      })
      .returning();
  }
}
```

---

## **✅ まとめ**

| レイヤー                        | 役割                                          |
| ------------------------------- | --------------------------------------------- |
| **Page (UI)**                   | フロントエンドの表示・ユーザー操作            |
| **Server Actions (Controller)** | UI からのリクエストを受け、Service を呼び出す |
| **Service (ビジネスロジック)**  | アプリケーションの主要ロジックを管理          |
| **Domain (ドメインモデル)**     | ビジネスルールを持つデータ構造                |
| **Repository (DB 操作)**        | データベースとのやりとりを管理                |

---

## **✅ なぜこの構成にするのか？**

1. **役割が明確になる → コードが整理される**
2. **テストしやすくなる**
   - `Service` や `Repository` を分けることで、ユニットテストがしやすくなる
3. **変更に強い**
   - DB が変わっても、Repository 層だけ修正すれば OK
   - UI が変わっても、Service / Repository には影響なし
4. **拡張しやすい**
   - 例えば、管理者とユーザーで異なるロジックを追加しても影響を局所化できる

👉 **EC サイトのようにビジネスロジックが増えていくアプリなら、この構成はメリットが大きい！**
