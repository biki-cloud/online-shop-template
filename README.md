# Online Shop Template

This is a online shop starter template for building a SaaS application using **Next.js** with support for authentication, Stripe integration for payments, and a dashboard for logged-in users.

## Features

- 商品管理機能
  - 商品一覧表示 (`/products`)
  - 商品詳細表示
  - 商品検索・フィルタリング
- ショッピングカート機能 (`/cart`)
  - カートへの商品追加/削除
  - 数量調整
- 注文管理機能 (`/orders`)
  - 注文履歴の表示
  - 注文状況の追跡
- 決済機能
  - Stripe を利用した安全な決済処理
  - チェックアウトページ (`/checkout`)
- ユーザー管理機能
  - メール/パスワード認証
  - JWT を使用したセッション管理
  - ユーザー設定ページ (`/settings`)
- 管理者機能 (`/admin`)
  - 商品の登録/編集/削除
  - 注文管理
  - ユーザー管理
- セキュリティ機能
  - ミドルウェアによる保護されたルート
  - RBAC（ロールベースアクセス制御）
  - アクティビティログ記録
- モダンな UI/UX
  - レスポンシブデザイン
  - Shadcn UI コンポーネント
  - Tailwind CSS によるスタイリング

## Tech Stack

- **フレームワーク**
  - [Next.js](https://nextjs.org/) - React ベースのフルスタックフレームワーク
  - [React](https://react.dev/) - UI ライブラリ
- **データベース**
  - [PostgreSQL](https://www.postgresql.org/) - リレーショナルデータベース
  - [Supabase](https://supabase.com/) - バックエンドサービス
- **ORM & データ管理**
  - [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ネイティブ ORM
  - [React Hook Form](https://react-hook-form.com/) - フォーム状態管理
  - [Zod](https://zod.dev/) - スキーマ検証
- **ストレージ**
  - [Supabase Storage](https://supabase.com/docs/guides/storage) - S3 互換のオブジェクトストレージ
  - [@supabase/storage-js](https://github.com/supabase/storage-js) - ストレージクライアント
- **認証 & セキュリティ**
  - [JWT](https://jwt.io/) - トークンベース認証
  - [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - パスワードハッシュ化
- **UI & スタイリング**
  - [shadcn/ui](https://ui.shadcn.com/) - UI コンポーネントライブラリ
  - [Radix UI](https://www.radix-ui.com/) - ヘッドレス UI コンポーネント
  - [Tailwind CSS](https://tailwindcss.com/) - CSS フレームワーク
  - [Framer Motion](https://www.framer.com/motion/) - アニメーションライブラリ
- **決済**
  - [Stripe](https://stripe.com/) - 決済プラットフォーム
- **テスト**
  - [Jest](https://jestjs.io/) - テストフレームワーク
  - [Testing Library](https://testing-library.com/) - UI テストユーティリティ

## Running Locally

### 1. create stripe account

### 2. create supabase account

### 3. run setup command

Use the included setup script to create your `.env` file:

```bash
pnpm local:setup
```

### 4. init and insert db

```bash
pnpm db:reset
```

### 5. Run server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

#### Prepared user and admin

- User: `test@example.com`
- Password: `password123`

- admin User: `admin@example.com`
- Password: `admin123`

#### listen stripe webhoook

Optionally, you can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

##### About cookie

if you in trouble about cookie, recommend delete cookie in localhost.
[chrome://settings/content/all](chrome://settings/content/all)

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Set up a production Stripe webhook

1. Go to the Stripe Dashboard and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/stripe/webhook`).
3. Select the events you want to listen for (e.g., `checkout.session.completed`, `customer.subscription.updated`).

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`:

   - 説明: アプリケーションのベース URL
   - 開発環境: `http://localhost:3000`
   - 本番環境: デプロイ後のドメイン（例: `https://your-app.vercel.app`）

2. `STRIPE_SECRET_KEY`:

   - 説明: Stripe のシークレットキー（サーバーサイドでのみ使用）
   - 取得方法: [Stripe ダッシュボード](https://dashboard.stripe.com/apikeys) → 「API キー」→ 「シークレットキー」
   - 注意: 本番環境では`sk_live`で始まるキーを使用

3. `STRIPE_WEBHOOK_SECRET`:

   - 説明: Stripe のウェブフックシークレット（支払いイベントの検証用）
   - 取得方法:
     1. [Stripe ダッシュボード](https://dashboard.stripe.com/webhooks) → 「Webhooks」→ 「エンドポイントを追加」
     2. エンドポイント URL（本番）: `https://your-app.vercel.app/api/stripe/webhook`
     3. イベント選択: `checkout.session.completed`, `customer.subscription.updated`など
     4. 作成後に表示される`whsec_`で始まるシークレットをコピー

4. `POSTGRES_URL`:

   - 説明: PostgreSQL データベースの接続 URL
   - 開発環境: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
   - 本番環境: Supabase プロジェクトの接続文字列
   - 取得方法: Supabase ダッシュボード → プロジェクト設定 → Database → Connection string → URI

5. `AUTH_SECRET`:

   - 説明: NextAuth.js 認証用のシークレットキー
   - 生成方法: ターミナルで`openssl rand -base64 32`を実行
   - 要件: 32 文字以上のランダムな文字列

6. `NEXT_PUBLIC_SUPABASE_URL`:

   - 説明: Supabase のプロジェクト URL
   - 取得方法: Supabase ダッシュボード → プロジェクト設定 → API → Project URL
   - 開発環境: `http://127.0.0.1:54321`

7. `NEXT_PUBLIC_SUPABASE_ANON_KEY`:

   - 説明: Supabase の匿名認証用キー
   - 取得方法: Supabase ダッシュボード → プロジェクト設定 → API → Project API keys → `anon public`

8. `SUPABASE_SERVICE_ROLE_KEY`:

   - 説明: Supabase の管理者権限用キー（サーバーサイドでのみ使用）
   - 取得方法: Supabase ダッシュボード → プロジェクト設定 → API → Project API keys → `service_role secret`
   - 注意: 絶対に公開しないでください

9. `NEXT_PUBLIC_STORAGE_URL`:
   - 説明: Supabase のストレージ（S3 互換）の URL
   - 開発環境: `http://127.0.0.1:54321/storage/v1/s3`
   - 本番環境: `https://[PROJECT_ID].supabase.co/storage/v1/s3`
   - 取得方法: Supabase ダッシュボード → Storage
