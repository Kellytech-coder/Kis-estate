"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Sparkles,
  Loader2,
  SearchX,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import { calculateMortgage, formatCurrency } from "@/lib/utils";
import PropertyCard from "@/components/PropertyCard";

export default function BuyPage() {
  const { properties, isLoadingProperties } = usePropertyStore();

  // Buy filters
  const [selectedCity, setSelectedCity] = useState("all");

  // Mortgage Calculator State
  const [calcPrice, setCalcPrice] = useState(2500000);
  const downPaymentPct = 20;
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
      .filter((p) => (selectedCity === "all" ? true : p.location?.city === selectedCity));
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
            Exceptional Homes &amp; Estates For Sale
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

            {/* Down Payment & Term */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Down Payment ({downPaymentPct}%)
                </label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-900">
                  {formatCurrency(mortgage.downPayment)}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Loan Term
                </label>
                <select
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={15}>15 Years Fixed</option>
                  <option value={30}>30 Years Fixed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result Card (Right Col) */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-3xl space-y-6 shadow-xl text-center lg:text-left">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Estimated Monthly Cost
              </span>
              <div className="text-3xl sm:text-4xl font-black mt-1 text-white">
                {formatCurrency(mortgage.monthlyPayment)}
                <span className="text-sm text-indigo-300 font-normal">/mo</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-indigo-800 text-xs">
              <div className="flex justify-between text-indigo-200">
                <span>Principal &amp; Interest</span>
                <span className="font-bold text-white">
                  {formatCurrency(mortgage.principalAndInterest)}
                </span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Property Tax Est.</span>
                <span className="font-bold text-white">
                  {formatCurrency(mortgage.propertyTax)}
                </span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Homeowners Insurance</span>
                <span className="font-bold text-white">
                  {formatCurrency(mortgage.homeInsurance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Sale Property Catalog */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Homes &amp; Estates Available For Purchase
            </h2>
            <p className="text-xs text-gray-500">
              Showing {buyProperties.length} verified listings for acquisition
            </p>
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Market:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Markets</option>
              <option value="Beverly Hills">Beverly Hills</option>
              <option value="New York">New York</option>
              <option value="Austin">Austin</option>
              <option value="Chicago">Chicago</option>
              <option value="San Francisco">San Francisco</option>
            </select>
          </div>
        </div>

        {isLoadingProperties && properties.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading purchase portfolio from database...</p>
          </div>
        ) : buyProperties.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-100 p-8 space-y-3 shadow-sm">
            <SearchX className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-gray-900 text-sm">No properties found in this market</h3>
            <button
              onClick={() => setSelectedCity("all")}
              className="text-xs text-indigo-600 font-bold underline"
            >
              View all markets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {buyProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
