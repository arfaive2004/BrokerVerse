import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | null | undefined
): string {
  const numericAmount =
    typeof amount === "string"
      ? Number.parseFloat(amount.replace(/,/g, ""))
      : amount ?? 0;

  const safeAmount = Number.isFinite(numericAmount)
    ? numericAmount
    : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}