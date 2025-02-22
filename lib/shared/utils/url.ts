import { container } from "tsyringe";
import { UrlService } from "@/lib/core/services/url.service";

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getFullImageUrl(imageUrl: string | null): string | undefined {
  if (!imageUrl) return undefined;

  if (isValidUrl(imageUrl)) {
    return imageUrl;
  }

  const urlService = container.resolve(UrlService);
  const baseUrl = urlService.getBaseUrl().replace(/\/$/, "");
  if (!baseUrl) return undefined;

  const fullUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  return isValidUrl(fullUrl) ? fullUrl : undefined;
}
