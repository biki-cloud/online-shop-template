import { NextResponse } from "next/server";
import webPush from "web-push";
import { env } from "@/lib/config/env";

webPush.setVapidDetails(
  `mailto:${env.VAPID_EMAIL}`,
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface RequestBody {
  subscription: WebPushSubscription;
  payload: PushPayload;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { subscription, payload } = body;

    await webPush.sendNotification(subscription, JSON.stringify(payload));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("プッシュ通知送信エラー:", error);
    return NextResponse.json(
      { error: "プッシュ通知の送信に失敗しました" },
      { status: 500 }
    );
  }
}
