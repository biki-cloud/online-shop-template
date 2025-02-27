import { injectable } from "tsyringe";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs/promises";
import ejs from "ejs";
import type { EmailOptions } from "@/lib/core/domain/email";
import type { IEmailService } from "./interfaces/email.service.interface";

@injectable()
export class EmailServiceImpl implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(options: EmailOptions): Promise<void> {
    if (options.template) {
      await this.sendTemplate(
        options.template.name,
        options.template.data,
        options
      );
      return;
    }

    await this.transporter.sendMail({
      from: options.from || process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
  }

  private async loadTemplate(
    templateName: string,
    type: string
  ): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      "lib",
      "infrastructure",
      "email",
      "templates",
      templateName,
      `${type}.ejs`
    );
    return fs.readFile(templatePath, "utf-8");
  }

  async sendTemplate(
    templateName: string,
    data: Record<string, any>,
    options: Omit<EmailOptions, "template">
  ): Promise<void> {
    // テンプレートの読み込み
    const [subjectTemplate, htmlTemplate] = await Promise.all([
      this.loadTemplate(templateName, "subject"),
      this.loadTemplate(templateName, "html"),
    ]);

    // テンプレートのレンダリング
    const subject = ejs.render(subjectTemplate, data).trim();
    const html = ejs.render(htmlTemplate, data);

    // メールの送信
    await this.transporter.sendMail({
      from: options.from || process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject || subject,
      html,
      attachments: options.attachments,
    });
  }
}
