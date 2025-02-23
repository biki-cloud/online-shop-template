import type { EmailOptions } from "@/lib/core/domain/email";

export interface IEmailService {
  /**
   * メールを送信します
   * @param options メール送信オプション
   */
  send(options: EmailOptions): Promise<void>;

  /**
   * テンプレートを使用してメールを送信します
   * @param templateName テンプレート名
   * @param data テンプレートデータ
   * @param options その他のメール送信オプション
   */
  sendTemplate(
    templateName: string,
    data: Record<string, any>,
    options: Omit<EmailOptions, "template">
  ): Promise<void>;
}
