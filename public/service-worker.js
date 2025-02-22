// プッシュ通知を受信したときの処理
self.addEventListener("push", (event) => {
  console.log("Push通知受信:", event);

  if (!event.data) {
    console.log("Push通知データなし");
    return;
  }

  try {
    const data = event.data.json();
    console.log("Push通知データ:", data);

    const options = {
      body: data.body,
      icon: "/icon512_rounded.png",
      badge: "/icon512_maskable.png",
      data: {
        url: data.url,
      },
    };

    event.waitUntil(
      self.registration
        .showNotification(data.title, options)
        .then(() => console.log("通知表示成功"))
        .catch((error) => console.error("通知表示エラー:", error))
    );
  } catch (error) {
    console.error("Push通知処理エラー:", error);
  }
});

// 通知がクリックされたときの処理
self.addEventListener("notificationclick", (event) => {
  console.log("通知クリック:", event);

  event.notification.close();

  if (event.notification.data.url) {
    event.waitUntil(
      clients
        .openWindow(event.notification.data.url)
        .then(() =>
          console.log("URLオープン成功:", event.notification.data.url)
        )
        .catch((error) => console.error("URLオープンエラー:", error))
    );
  }
});

self.addEventListener("install", (event) => {
  console.log("Service Worker: インストール中");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: アクティブ化");
  event.waitUntil(self.clients.claim());
});
