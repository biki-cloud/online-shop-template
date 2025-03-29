import "reflect-metadata";
import { EmailServiceImpl } from "../email.service.impl";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs/promises";
import ejs from "ejs";
import type { EmailOptions } from "@/lib/core/domain/email.domain";

// nodemailer のモック
jest.mock("nodemailer", () => {
  const mockSendMail = jest.fn().mockResolvedValue({ messageId: "mock-id" });
  const mockTransporter = {
    sendMail: mockSendMail,
  };

  return {
    createTransport: jest.fn().mockReturnValue(mockTransporter),
  };
});

// fs のモック
jest.mock("fs/promises", () => ({
  readFile: jest.fn().mockImplementation((path, encoding) => {
    if (path.includes("subject")) {
      return Promise.resolve("Subject Template: {{name}}");
    }
    return Promise.resolve("HTML Template: {{name}}");
  }),
}));

// ejs のモック
jest.mock("ejs", () => ({
  render: jest.fn().mockImplementation((template, data) => {
    if (template.includes("Subject Template")) {
      return "Rendered Subject";
    }
    return "<p>Rendered HTML Content</p>";
  }),
}));

// 環境変数のモック
const originalEnv = process.env;

describe("EmailService", () => {
  let emailService: EmailServiceImpl;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "587",
      SMTP_SECURE: "false",
      SMTP_USER: "testuser",
      SMTP_PASS: "testpass",
      SMTP_FROM: "noreply@example.com",
    };

    // モックをリセット
    jest.clearAllMocks();

    emailService = new EmailServiceImpl();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("constructor", () => {
    it("should create a transporter with correct config", () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: {
          user: "testuser",
          pass: "testpass",
        },
      });
    });
  });

  describe("send", () => {
    it("should send an email with direct options", async () => {
      const options: EmailOptions = {
        to: "recipient@example.com",
        subject: "Test Subject",
        text: "Test content",
        html: "<p>Test HTML content</p>",
      };

      await emailService.send(options);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        text: "Test content",
        html: "<p>Test HTML content</p>",
        attachments: undefined,
      });
    });

    it("should use the 'from' field if provided", async () => {
      const options: EmailOptions = {
        to: "recipient@example.com",
        from: "custom@example.com",
        subject: "Test Subject",
        text: "Test content",
      };

      await emailService.send(options);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: "custom@example.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        text: "Test content",
        html: undefined,
        attachments: undefined,
      });
    });

    it("should handle array of recipients", async () => {
      const options: EmailOptions = {
        to: ["recipient1@example.com", "recipient2@example.com"],
        subject: "Test Subject",
        text: "Test content",
      };

      await emailService.send(options);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: ["recipient1@example.com", "recipient2@example.com"],
        subject: "Test Subject",
        text: "Test content",
        html: undefined,
        attachments: undefined,
      });
    });

    it("should use the template if provided", async () => {
      const options: EmailOptions = {
        to: "recipient@example.com",
        template: {
          name: "welcome",
          data: { name: "John Doe" },
        },
      };

      await emailService.send(options);

      // sendTemplateが呼ばれることを確認
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe("loadTemplate", () => {
    it("should load template from correct path", async () => {
      // privateメソッドなので、publicメソッド経由でテスト
      const options: EmailOptions = {
        to: "recipient@example.com",
        template: {
          name: "welcome",
          data: { name: "John Doe" },
        },
      };

      await emailService.send(options);

      const expectedPath = path.join(
        process.cwd(),
        "lib",
        "infrastructure",
        "email",
        "templates",
        "welcome",
        "subject.ejs"
      );

      expect(fs.readFile).toHaveBeenCalledWith(expectedPath, "utf-8");
    });
  });

  describe("sendTemplate", () => {
    it("should load and render templates correctly", async () => {
      const templateName = "welcome";
      const data = { name: "John Doe" };
      const options: Omit<EmailOptions, "template"> = {
        to: "recipient@example.com",
      };

      await emailService.sendTemplate(templateName, data, options);

      // テンプレートが読み込まれたことを確認
      expect(fs.readFile).toHaveBeenCalledTimes(2);

      // ejsでレンダリングされたことを確認
      expect(ejs.render).toHaveBeenCalledTimes(2);

      // メールが送信されたことを確認
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: "recipient@example.com",
        subject: "Rendered Subject",
        html: "<p>Rendered HTML Content</p>",
        attachments: undefined,
      });
    });

    it("should use custom subject if provided", async () => {
      const templateName = "welcome";
      const data = { name: "John Doe" };
      const options: Omit<EmailOptions, "template"> = {
        to: "recipient@example.com",
        subject: "Custom Subject",
      };

      await emailService.sendTemplate(templateName, data, options);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: "recipient@example.com",
        subject: "Custom Subject",
        html: "<p>Rendered HTML Content</p>",
        attachments: undefined,
      });
    });

    it("should include attachments if provided", async () => {
      const templateName = "welcome";
      const data = { name: "John Doe" };
      const options: Omit<EmailOptions, "template"> = {
        to: "recipient@example.com",
        attachments: [
          {
            filename: "test.pdf",
            content: Buffer.from("test content"),
            contentType: "application/pdf",
          },
        ],
      };

      await emailService.sendTemplate(templateName, data, options);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: "recipient@example.com",
        subject: "Rendered Subject",
        html: "<p>Rendered HTML Content</p>",
        attachments: [
          {
            filename: "test.pdf",
            content: Buffer.from("test content"),
            contentType: "application/pdf",
          },
        ],
      });
    });
  });
});
