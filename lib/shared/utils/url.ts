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

  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return undefined;

  const fullUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  return isValidUrl(fullUrl) ? fullUrl : undefined;
}
