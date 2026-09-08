import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(price: number, type: "buy" | "rent"): string {
  const formatted = formatCurrency(price);
  return type === "rent" ? `${formatted}/mo` : formatted;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export interface MortgageCalculation {
  monthlyPayment: number;
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  loanAmount: number;
  downPayment: number;
}

export function calculateMortgage(
  homePrice: number,
  downPaymentPct: number = 20,
  interestRatePct: number = 6.5,
  loanTermYears: number = 30
): MortgageCalculation {
  const downPayment = (homePrice * downPaymentPct) / 100;
  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRatePct / 100 / 12;
  const totalMonths = loanTermYears * 12;

  let principalAndInterest = 0;
  if (monthlyRate === 0) {
    principalAndInterest = loanAmount / totalMonths;
  } else {
    principalAndInterest =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  // Estimated annual property tax ~ 1.1%, home insurance ~ 0.4%
  const propertyTax = (homePrice * 0.011) / 12;
  const homeInsurance = (homePrice * 0.004) / 12;
  const monthlyPayment = Math.round(principalAndInterest + propertyTax + homeInsurance);

  return {
    monthlyPayment,
    principalAndInterest: Math.round(principalAndInterest),
    propertyTax: Math.round(propertyTax),
    homeInsurance: Math.round(homeInsurance),
    loanAmount: Math.round(loanAmount),
    downPayment: Math.round(downPayment),
  };
}

