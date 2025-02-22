import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import { promisify } from "node:util";
import readline from "node:readline";
import crypto from "node:crypto";
import path from "node:path";
import os from "node:os";
import "reflect-metadata";

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function checkStripeCLI() {
  console.log(
    "Step 1: Checking if Stripe CLI is installed and authenticated..."
  );
  try {
    await execAsync("stripe --version");
    console.log("Stripe CLI is installed.");

    // Check if Stripe CLI is authenticated
    try {
      await execAsync("stripe config --list");
      console.log("Stripe CLI is authenticated.");
    } catch (error) {
      console.log(
        "Stripe CLI is not authenticated or the authentication has expired."
      );
      console.log("Please run: stripe login");
      const answer = await question(
        "Have you completed the authentication? (y/n): "
      );
      if (answer.toLowerCase() !== "y") {
        console.log(
          "Please authenticate with Stripe CLI and run this script again."
        );
        process.exit(1);
      }

      // Verify authentication after user confirms login
      try {
        await execAsync("stripe config --list");
        console.log("Stripe CLI authentication confirmed.");
      } catch (error) {
        console.error(
          "Failed to verify Stripe CLI authentication. Please try again."
        );
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(
      "Stripe CLI is not installed. Please install it and try again."
    );
    console.log("To install Stripe CLI, follow these steps:");
    console.log("1. Visit: https://docs.stripe.com/stripe-cli");
    console.log(
      "2. Download and install the Stripe CLI for your operating system"
    );
    console.log("3. After installation, run: stripe login");
    console.log(
      "After installation and authentication, please run this setup script again."
    );
    process.exit(1);
  }
}

async function checkStripeLogin() {
  console.log("Step 3: Checking Stripe CLI login status...");
  try {
    // まず認証状態をチェック
    try {
      await execAsync("stripe config --list");
      console.log("Stripe CLI is already authenticated.");
      return;
    } catch (error) {
      console.log("Stripe CLI needs authentication.");
      console.log("Please run 'stripe login' in a new terminal window.");
      const answer = await question(
        "Have you completed the Stripe login process? (y/n): "
      );
      if (answer.toLowerCase() !== "y") {
        console.log("Please complete Stripe login and run this script again.");
        process.exit(1);
      }

      // 認証の確認
      try {
        await execAsync("stripe config --list");
        console.log("Stripe CLI authentication confirmed.");
      } catch (error) {
        console.error("Failed to verify Stripe CLI authentication.");
        console.log(
          "Please make sure you completed the login process correctly."
        );
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("Failed to check Stripe login status:", error);
    process.exit(1);
  }
}

async function getSupabaseURL(): Promise<{
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRole: string;
  storageUrl: string;
  postgresUrl: string;
}> {
  console.log("Step 2: Setting up Supabase");

  try {
    // Supabaseログインの確認
    console.log("Checking Supabase CLI login status...");
    try {
      await execAsync("supabase login --help");
    } catch (error) {
      console.error("Supabase CLI is not installed. Please install it first:");
      console.log("npm install supabase --global");
      process.exit(1);
    }

    // ログイン状態の確認
    try {
      await execAsync("supabase projects list");
    } catch (error) {
      console.log("Please login to Supabase CLI first:");
      console.log("Run: supabase login");
      const answer = await question("Have you completed the login? (y/n): ");
      if (answer.toLowerCase() !== "y") {
        console.log("Please login to Supabase CLI and run this script again.");
        process.exit(1);
      }
    }

    // プロジェクトの初期化
    console.log("Initializing Supabase project...");
    try {
      // 強制的に初期化を実行
      await execAsync("supabase init --force");
      console.log("Supabase project initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize Supabase project:", error);
      process.exit(1);
    }

    // Supabaseローカル環境の起動
    console.log("Starting Supabase local development environment...");
    try {
      // 既存のインスタンスがある場合は停止してから開始
      try {
        await execAsync("supabase stop");
        console.log("Stopped existing Supabase instance.");
      } catch (error) {
        // 既存のインスタンスがない場合はエラーを無視
      }

      const { stdout } = await execAsync("supabase start");

      // API URLとキーを抽出（新しい出力形式に対応）
      const lines = stdout.split("\n");
      let supabaseUrl = "";
      let supabaseAnonKey = "";
      let supabaseServiceRole = "";
      let storageUrl = "";
      let postgresUrl = "";

      for (const line of lines) {
        if (line.includes("API URL:")) {
          supabaseUrl = line.split("API URL:")[1].trim();
        } else if (line.includes("anon key:")) {
          supabaseAnonKey = line.split("anon key:")[1].trim();
        } else if (line.includes("service_role key:")) {
          supabaseServiceRole = line.split("service_role key:")[1].trim();
        } else if (line.includes("Storage URL:")) {
          storageUrl = line.split("Storage URL:")[1].trim();
        } else if (line.includes("DB URL:")) {
          postgresUrl = line.split("DB URL:")[1].trim();
        }
      }

      if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        !supabaseServiceRole ||
        !storageUrl ||
        !postgresUrl
      ) {
        throw new Error(
          "Failed to extract Supabase configuration. Output: " + stdout
        );
      }

      console.log("Successfully extracted Supabase configuration:");
      console.log("- API URL:", supabaseUrl);
      console.log("- Storage URL:", storageUrl);
      console.log("- DB URL:", postgresUrl);

      return {
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceRole,
        storageUrl,
        postgresUrl,
      };
    } catch (error) {
      console.error("Failed to start Supabase. Error:", error);
      console.log("Make sure Docker is running and try again.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Failed to setup Supabase:", error);
    process.exit(1);
  }
}

async function getStripeSecretKey(): Promise<string> {
  console.log("Step 4: Getting Stripe Secret Key");
  console.log(
    "You can find your Stripe Secret Key at: https://dashboard.stripe.com/test/apikeys"
  );
  return await question("Enter your Stripe Secret Key: ");
}

async function createStripeWebhook(): Promise<string> {
  console.log("Step 5: Creating Stripe webhook...");
  try {
    const { stdout } = await execAsync("stripe listen --print-secret");
    const match = stdout.match(/whsec_[a-zA-Z0-9]+/);
    if (!match) {
      throw new Error("Failed to extract Stripe webhook secret");
    }
    console.log("Stripe webhook created.");
    return match[0];
  } catch (error) {
    console.error(
      "Failed to create Stripe webhook. Check your Stripe CLI installation and permissions."
    );
    if (os.platform() === "win32") {
      console.log(
        "Note: On Windows, you may need to run this script as an administrator."
      );
    }
    throw error;
  }
}

function generateAuthSecret(): string {
  console.log("Step 6: Generating AUTH_SECRET...");
  return crypto.randomBytes(32).toString("hex");
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log("Step 7: Writing environment variables to .env");

  const envComments = {
    NEXT_PUBLIC_SUPABASE_URL:
      "# Supabaseの設定\n# ローカルで動作するSupabaseのURL",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "# Supabaseの匿名認証用キー（クライアントサイドで使用可能）",
    SUPABASE_SERVICE_ROLE_KEY:
      "# Supabaseの管理者権限用キー（サーバーサイドでのみ使用）",
    NEXT_PUBLIC_STORAGE_URL: "# Supabaseのストレージ（S3互換）のURL",
    STRIPE_SECRET_KEY:
      "\n# Stripe決済の設定\n# Stripeのシークレットキー（サーバーサイドでのみ使用）",
    STRIPE_WEBHOOK_SECRET:
      "# Stripeのウェブフックシークレット（支払いイベントの検証用）",
    BASE_URL:
      "\n# アプリケーションの基本設定\n# アプリケーションのベースURL（開発環境）",
    AUTH_SECRET:
      "\n# NextAuth.js認証の設定\n# 認証用のシークレットキー（32文字以上のランダムな文字列）",
    POSTGRES_URL: "\n# PostgreSQLデータベースの接続URL",
  };

  const envContent =
    "# This file was automatically generated by local setup script.\n\n" +
    Object.entries(envVars)
      .map(([key, value]) => {
        const comment = envComments[key as keyof typeof envComments] || "";
        return `${comment}\n${key}=${value}`;
      })
      .join("\n\n");

  await fs.writeFile(path.join(process.cwd(), ".env"), envContent);
  console.log(".env file created with the necessary variables and comments.");
}

async function main() {
  await checkStripeCLI();

  const {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRole,
    storageUrl,
    postgresUrl,
  } = await getSupabaseURL();

  await checkStripeLogin();
  const STRIPE_SECRET_KEY = await getStripeSecretKey();
  const STRIPE_WEBHOOK_SECRET = await createStripeWebhook();
  const BASE_URL = "http://localhost:3000";
  const AUTH_SECRET = generateAuthSecret();

  await writeEnvFile({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRole,
    NEXT_PUBLIC_STORAGE_URL: storageUrl,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    BASE_URL,
    AUTH_SECRET,
    POSTGRES_URL: postgresUrl,
  });

  console.log("🎉 Local Setup completed successfully!");
  console.log("Supabase Dashboard is available at: http://localhost:54323");
}

main().catch(console.error);
