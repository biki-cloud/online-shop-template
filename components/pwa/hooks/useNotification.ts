"use client";

import "reflect-metadata";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { INotificationService } from "@/lib/core/services/interfaces/notification.service";
import {
  notificationContainer,
  initializeNotificationContainer,
} from "@/lib/di/notification-container";

// 通知機能のコンテナを初期化（クライアントサイドのみ）
if (typeof window !== "undefined") {
  initializeNotificationContainer();
}

export function useNotification() {
  const notificationService =
    notificationContainer.resolve<INotificationService>("NotificationService");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeNotificationState = async () => {
      if (!isMounted) return;

      try {
        if (!(await notificationService.checkSupport())) {
          setIsLoading(false);
          return;
        }

        const storedSubscription =
          await notificationService.getStoredSubscription();
        if (storedSubscription) {
          setSubscription(storedSubscription);
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error("通知の初期化中にエラーが発生しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeNotificationState();

    return () => {
      isMounted = false;
    };
  }, [notificationService]);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      if (!(await notificationService.checkSupport())) {
        toast.error("このブラウザはプッシュ通知に対応していません");
        return;
      }

      const isPermissionGranted = await notificationService.requestPermission();
      if (!isPermissionGranted) {
        toast.error("通知の許可が必要です");
        return;
      }

      const newSubscription = await notificationService.subscribe();
      if (newSubscription) {
        setSubscription(newSubscription);
        setIsSubscribed(true);
        toast.success("プッシュ通知を設定しました", {
          description: "テスト通知を送信できます",
        });
      }
    } catch (error) {
      console.error("プッシュ通知サブスクリプションエラー:", error);
      toast.error("通知の設定に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscription) return;

    try {
      setIsLoading(true);
      const success = await notificationService.unsubscribe(subscription);
      if (success) {
        setSubscription(null);
        setIsSubscribed(false);
        toast.success("通知をオフにしました", {
          description: "プッシュ通知は届かなくなります",
        });
      }
    } catch (error) {
      console.error("通知解除エラー:", error);
      toast.error("通知の解除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!subscription) {
      toast.error("通知の設定が必要です");
      return;
    }

    try {
      setIsSending(true);
      const success = await notificationService.sendTestNotification(
        subscription
      );
      if (success) {
        toast.success("テスト通知を送信しました", {
          description: "まもなく通知が届きます",
        });
      }
    } catch (error) {
      console.error("通知送信エラー:", error);
      toast.error("通知の送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSubscribed,
    isLoading,
    isSending,
    handleSubscribe,
    handleUnsubscribe,
    handleSendTestNotification,
  };
}
