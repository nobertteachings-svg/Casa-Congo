export function formatMoney(amount: number): string {
  return `CDF ${amount.toLocaleString("fr-CD")}`;
}

export const formatCdf = formatMoney;
/** @deprecated Use formatCdf */
export const formatKes = formatCdf;

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-CD", {
    timeZone: "Africa/Kinshasa",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusClass(status: string): string {
  return `badge badge-${status.replace("_", "-")}`;
}
