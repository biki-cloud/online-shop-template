export interface IUrlService {
  getBaseUrl(): string;
  getFullUrl(path: string): string;
  isValidUrl(url: string): boolean;
}
