"use server";

import { injectable } from "tsyringe";
import nodemailer from "nodemailer";
import path from "path";
import type { EmailOptions } from "@/lib/core/domain/email";
import type { IEmailService } from "./interfaces/email.service";
import type Email from "email-templates";
import { container } from "@/lib/di/container";

@injectable()
export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  private emailTemplate: any;

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

  private async initEmailTemplate() {
    if (!this.emailTemplate) {
      const { default: EmailTemplate } = await import("email-templates");
      this.emailTemplate = new EmailTemplate({
        message: {
          from: process.env.SMTP_FROM,
        },
        transport: this.transporter,
        views: {
          root: path.join(process.cwd(), "emails"),
          options: {
            extension: "ejs",
          },
        },
        juice: true,
        juiceResources: {
          preserveImportant: true,
          webResources: {
            relativeTo: path.join(process.cwd(), "emails"),
          },
        },
      });
    }
    return this.emailTemplate;
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

  async sendTemplate(
    templateName: string,
    data: Record<string, any>,
    options: Omit<EmailOptions, "template">
  ): Promise<void> {
    const emailTemplate = await this.initEmailTemplate();
    await emailTemplate.send({
      template: templateName,
      message: {
        to: options.to,
        from: options.from,
        attachments: options.attachments,
      },
      locals: data,
    });
  }
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const emailService = container.resolve<IEmailService>("EmailService");
  await emailService.send(options);
}

export async function sendTemplateEmail(
  templateName: string,
  data: Record<string, any>,
  options: Omit<EmailOptions, "template">
): Promise<void> {
  const emailService = container.resolve<IEmailService>("EmailService");
  await emailService.sendTemplate(templateName, data, options);
}
