"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Sparkles,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import { calculateMortgage, formatCurrency } from "@/lib/utils";
import PropertyCard from "@/components/PropertyCard";

export default function BuyPage() {
  const { properties } = usePropertyStore();

  // Buy filters
  const [selectedCity, setSelectedCity] = useState("all");

  // Mortgage Calculator State
  const [calcPrice, setCalcPrice] = useState(2500000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTermYears, setLoanTermYears] = useState(30);

  const mortgage = useMemo(() => {
    return calculateMortgage(
      calcPrice,
      downPaymentPct,
      interestRate,
      loanTermYears
    );
  }, [calcPrice, downPaymentPct, interestRate, loanTermYears]);

  // Filtered buy properties
  const buyProperties = useMemo(() => {
    return properties
      .filter((p) => p.type === "buy")
      .filter((p) => (selectedCity === "all" ? true : p.location.city === selectedCity));
  }, [properties, selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Buyer Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Exceptional Homes & Estates For Sale
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Acquire pristine residential architecture in America&apos;s most sought-after
            neighborhoods. Full title diligence and closing concierge included with every sale.
          </p>
        </div>
      </div>

      {/* Interactive Mortgage Calculator */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Interactive Mortgage Calculator
            </h2>
            <p className="text-xs text-gray-500">
              Estimate your monthly payment, down payment, and closing taxes in real-time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Inputs (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Home Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-700">Home Purchase Price</span>
                <span className="text-indigo-600 font-extrabold">
                  {formatCurrency(calcPrice)}
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={10000000}
                step={50000}
                value={calcPrice}
                onChange={(e) => setCalcPrice(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>$500k</span>
                <span>$5M</span>
                <span>$10M+</span>
              </div>
            </div>

            {/* Down Payment & Interest Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  Down Payment ({downPaymentPct}%)
                </label>
                <div className="flex items-center gap-2">
                  {[10, 20, 25, 30].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDownPaymentPct(pct)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        downPaymentPct === pct
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-500 font-medium pt-1">
                  Est. Down Payment: {formatCurrency(mortgage.downPayment)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  Interest Rate (% APR)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="12.0"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Loan Term Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Loan Duration
              </label>
              <div className="flex gap-3">
                {[15, 30].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setLoanTermYears(term)}
                    className={`px-5 py-2 text-xs font-bold rounded-xl border transition-all ${
                      loanTermYears === term
                        ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {term} Years Fixed
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Card (Right 1 col) */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 rounded-2xl p-6 border border-indigo-100 space-y-5 text-gray-900">
            <div>
              <div className="text-xs font-bold uppercase text-indigo-700 tracking-wider">
                Estimated Total Monthly Payment
              </div>
              <div className="text-4xl font-black text-indigo-900 mt-1">
                {formatCurrency(mortgage.monthlyPayment)}
                <span className="text-sm font-normal text-indigo-700"> / mo</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-indigo-200/60 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal & Interest</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(mortgage.principalAndInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. Property Taxes</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(mortgage.propertyTax)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Homeowner Insurance</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(mortgage.homeInsurance)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-indigo-200/60 font-medium">
                <span className="text-gray-700">Total Financed Amount</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(mortgage.loanAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Quick Pills */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Active Properties For Sale ({buyProperties.length})
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Browse all purchase opportunities currently available.
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Metros" },
              { id: "Beverly Hills", label: "Beverly Hills" },
              { id: "New York", label: "New York" },
              { id: "Austin", label: "Austin" },
              { id: "San Francisco", label: "San Francisco" },
              { id: "Chicago", label: "Chicago" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCity === c.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {buyProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </div>
    </div>
  );
}

