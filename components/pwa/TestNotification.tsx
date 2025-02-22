"use client";

import { Button } from "@/components/ui/button";
import { Bell, BellRing, Send } from "lucide-react";
import { useNotification } from "./hooks/useNotification";

export function TestNotification() {
  const {
    isSubscribed,
    isLoading,
    isSending,
    handleSubscribe,
    handleUnsubscribe,
    handleSendTestNotification,
  } = useNotification();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isSubscribed ? "default" : "outline"}
        size="sm"
        onClick={() =>
          void (isSubscribed ? handleUnsubscribe() : handleSubscribe())
        }
        disabled={isLoading}
        className="transition-all duration-200"
        aria-label={isSubscribed ? "プッシュ通知を解除" : "プッシュ通知を設定"}
        data-testid="push-notification-subscribe-button"
      >
        {isLoading ? (
          <>
            <Bell className="mr-2 h-4 w-4 animate-pulse" />
            読み込み中
          </>
        ) : isSubscribed ? (
          <>
            <BellRing className="mr-2 h-4 w-4" />
            通知オン
          </>
        ) : (
          <>
            <Bell className="mr-2 h-4 w-4" />
            通知オフ
          </>
        )}
      </Button>
      {isSubscribed && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleSendTestNotification()}
          disabled={isSending}
          aria-label="テスト通知を送信"
          data-testid="push-notification-test-button"
        >
          <Send className="mr-2 h-4 w-4" />
          テスト通知
        </Button>
      )}
    </div>
  );
}
