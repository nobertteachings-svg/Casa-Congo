import { env, isPaymentsEnabled } from "../../config/env.js";

export function calculateMoveInCost(rent: number, monthsUpfront: number): {
  rentMonthly: number;
  upfrontTotal: number;
  unlockFee: number;
  grandTotal: number;
} {
  const upfrontTotal = rent * monthsUpfront;
  const unlockFee = isPaymentsEnabled ? env.UNLOCK_FEE_CDF : 0;
  return {
    rentMonthly: rent,
    upfrontTotal,
    unlockFee,
    grandTotal: upfrontTotal + unlockFee,
  };
}

export function formatMoveInCost(
  rent: number,
  monthsUpfront: number,
  _lang: "en" = "en"
): string {
  const { upfrontTotal, unlockFee, grandTotal } = calculateMoveInCost(
    rent,
    monthsUpfront
  );
  const feeLine = isPaymentsEnabled
    ? `• Frais de déblocage Casa : ${unlockFee.toLocaleString("fr-CD")} CDF\n`
    : "";
  return (
    `💰 *Coût total pour emménager :*\n` +
    `• Loyer : ${rent.toLocaleString("fr-CD")} CDF/mois\n` +
    `• Avance (${monthsUpfront} mois) : ${upfrontTotal.toLocaleString("fr-CD")} CDF\n` +
    feeLine +
    `━━━━━━━━━━━━━━━━\n` +
    `*Total : ${grandTotal.toLocaleString("fr-CD")} CDF*`
  );
}
