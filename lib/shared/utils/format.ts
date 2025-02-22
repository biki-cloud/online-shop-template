export function formatPrice(price: number, currency: string = "JPY"): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(price);
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat("ja-JP").format(number);
}
