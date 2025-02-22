"use client";

import "reflect-metadata";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, BellOff, Send } from "lucide-react";
import { useNotification } from "../pwa/hooks/useNotification";

export function NotificationSettingsPanel() {
  const {
    isSubscribed,
    isLoading,
    isSending,
    handleSubscribe,
    handleUnsubscribe,
    handleSendTestNotification,
  } = useNotification();

  if (typeof window === "undefined") {
    return null; // サーバーサイドでは何も表示しない
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プッシュ通知設定</CardTitle>
        <CardDescription>ブラウザのプッシュ通知を設定できます</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant={isSubscribed ? "outline" : "default"}
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading}
          >
            {isSubscribed ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                通知をオフにする
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                通知を設定する
              </>
            )}
          </Button>
          {isSubscribed && (
            <Button
              variant="outline"
              onClick={handleSendTestNotification}
              disabled={isSending || !isSubscribed}
            >
              <Send className="mr-2 h-4 w-4" />
              テスト通知を送信
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
