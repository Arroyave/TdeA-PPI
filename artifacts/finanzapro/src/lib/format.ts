export function formatCurrency(amount: number, currency: string = "USD") {
  const locale = currency === "COP" ? "es-CO" : currency === "EUR" ? "es-ES" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "COP" ? 0 : 2,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(amount);
}
