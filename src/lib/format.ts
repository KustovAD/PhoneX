export function formatPrice(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function maskImei(imei?: string | null) {
  if (!imei) return "•••• •••• •••• ••••";
  const digits = imei.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

export function pluralRu(n: number, one: string, few: string, many: string) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}
