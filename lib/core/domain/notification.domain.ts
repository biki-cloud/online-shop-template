export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  url: string;
}

export interface NotificationPermissionStatus {
  isGranted: boolean;
  isDenied: boolean;
  isDefault: boolean;
}
