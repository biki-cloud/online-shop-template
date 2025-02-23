export type EmailAddress = string;

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  data: Record<string, any>;
}

export interface EmailOptions {
  to: EmailAddress | EmailAddress[];
  from?: EmailAddress;
  subject?: string;
  text?: string;
  html?: string;
  template?: EmailTemplate;
  attachments?: EmailAttachment[];
}

// メールテンプレート名の定義
export const EmailTemplates = {
  WELCOME: "welcome",
  PASSWORD_RESET: "password-reset",
  ORDER_CONFIRMATION: "order-confirmation",
  SHIPPING_CONFIRMATION: "shipping-confirmation",
  ADMIN_REGISTRATION: "admin-registration",
  ADMIN_APPROVAL_REQUEST: "admin-approval-request",
} as const;

export type EmailTemplateName =
  (typeof EmailTemplates)[keyof typeof EmailTemplates];

// メールテンプレートのデータ型定義
export interface WelcomeEmailData {
  name: string;
  verificationUrl?: string;
}

export interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
}

export interface OrderConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: string;
}

export interface ShippingConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export interface AdminRegistrationEmailData {
  name: string;
  email: string;
  verificationUrl?: string;
}

export interface AdminApprovalRequestEmailData {
  applicantName: string;
  applicantEmail: string;
  companyName: string;
  position: string;
  reason: string;
  approveUrl: string;
  rejectUrl: string;
}
