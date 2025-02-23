"use server";

import { z } from "zod";
import { getContainer } from "@/lib/di/container";
import type { IEmailService } from "@/lib/core/services/interfaces/email.service";
import { EmailTemplates } from "@/lib/core/domain/email";

const testEmailSchema = z.object({
  email: z.string().email(),
});

export async function testEmail(data: z.infer<typeof testEmailSchema>) {
  const validatedData = testEmailSchema.parse(data);
  const container = getContainer();
  const emailService = container.resolve<IEmailService>("EmailService");

  // テストメールを送信
  await emailService.send({
    to: validatedData.email,
    subject: "テストメール",
    text: `これはテストメールです。

このメールは、メール送信設定が正しく機能していることを確認するために送信されました。
メールが正常に届いていれば、設定は正しく行われています。

送信時刻: ${new Date().toLocaleString("ja-JP")}
`,
  });

  // テンプレートメールのテストも送信
  await emailService.send({
    to: validatedData.email,
    template: {
      name: EmailTemplates.WELCOME,
      subject: "ようこそ - メール設定テスト",
      data: {
        name: "テストユーザー",
        verificationUrl: "https://example.com/verify",
      },
    },
  });
}
