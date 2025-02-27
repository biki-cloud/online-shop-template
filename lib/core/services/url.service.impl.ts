import { injectable } from "tsyringe";
import type { IUrlService } from "./interfaces/url.service.interface";

@injectable()
export class UrlService implements IUrlService {
  getBaseUrl(): string {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return process.env.BASE_URL || "http://localhost:3000";
  }

  getFullUrl(path: string): string {
    const baseUrl = this.getBaseUrl().replace(/\/$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
