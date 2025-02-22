export const env = {
  VAPID_EMAIL: process.env.VAPID_EMAIL as string,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY as string,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env
    .NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
} as const;
