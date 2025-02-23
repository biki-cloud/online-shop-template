declare module "email-templates" {
  import { Transporter } from "nodemailer";

  interface EmailConfig {
    message?: {
      from?: string;
    };
    transport?: Transporter;
    send?: boolean;
    preview?: boolean | string;
    views?: {
      root: string;
      options?: {
        extension: string;
      };
    };
    juice?: boolean;
    juiceResources?: {
      preserveImportant?: boolean;
      webResources?: {
        relativeTo: string;
      };
    };
  }

  class Email {
    constructor(config: EmailConfig);
    send(options: {
      template: string;
      message: {
        to: string | string[];
        from?: string;
        attachments?: any[];
      };
      locals: Record<string, any>;
    }): Promise<any>;
  }

  export default Email;
}
