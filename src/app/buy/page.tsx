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

const NIGERIAN_CITIES = [
  "all",
  "Lekki",
  "Ikoyi",
  "Victoria Island",
  "Ikeja",
  "Ajah",
  "Maitama",
  "Guzape",
  "Asokoro",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
];

export default function BuyPage() {
  const { properties, isLoadingProperties } = usePropertyStore();

  // Buy filters
  const [selectedCity, setSelectedCity] = useState("all");

  // Mortgage Calculator State in Nigerian Naira
  const [calcPrice, setCalcPrice] = useState(150000000);
  const downPaymentPct = 20;
  const [interestRate, setInterestRate] = useState(18.5);
  const [loanTermYears, setLoanTermYears] = useState(20);

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
      .filter((p) => {
        if (selectedCity === "all") return true;
        const c = p.location?.city?.toLowerCase() || "";
        return c.includes(selectedCity.toLowerCase());
      });
  }, [properties, selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nigerian Buyer Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Exceptional Homes &amp; Estates For Sale in Nigeria
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Acquire verified residential duplexes, luxury flats, and detached mansions in Nigeria&apos;s most sought-after neighborhoods. Full title diligence (C of O, Governor&apos;s Consent) included with every listing.
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
              Nigerian Real Estate Mortgage Estimator
            </h2>
            <p className="text-xs text-gray-500">
              Estimate your monthly payment, down payment, and statutory fees in Nigerian Naira (₦).
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
                min={20000000}
                max={1000000000}
                step={5000000}
                value={calcPrice}
                onChange={(e) => setCalcPrice(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>₦20M</span>
                <span>₦500M</span>
                <span>₦1B+</span>
              </div>
            </div>

            {/* Down Payment & Term */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Down Payment ({downPaymentPct}%)
                </label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 truncate">
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
                  Loan Tenure
                </label>
                <select
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result Card (Right 1 col) */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Estimated Monthly Outlay
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {formatCurrency(mortgage.monthlyPayment)}
              <span className="text-xs font-normal text-indigo-300 block">/ month</span>
            </div>

            <div className="space-y-2 pt-4 border-t border-indigo-800/80 text-xs">
              <div className="flex justify-between">
                <span className="text-indigo-200">Principal &amp; Interest</span>
                <span className="font-semibold text-white">
                  {formatCurrency(mortgage.principalAndInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-200">Statutory Tax Est.</span>
                <span className="font-semibold text-white">
                  {formatCurrency(mortgage.propertyTax)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-200">Building Insurance</span>
                <span className="font-semibold text-white">
                  {formatCurrency(mortgage.homeInsurance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Grid Section */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Properties Available For Purchase
            </h2>
            <p className="text-xs text-gray-500">
              Showing {buyProperties.length} verified listings across Nigeria
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {NIGERIAN_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  selectedCity === city
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {city === "all" ? "All Cities" : city}
              </button>
            ))}
          </div>
        </div>

        {isLoadingProperties && properties.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading Nigerian properties for sale...</p>
          </div>
        ) : buyProperties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
            <SearchX className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">No properties for sale found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              We couldn&apos;t find any properties for sale matching &ldquo;{selectedCity}&rdquo;. Try selecting All Cities.
            </p>
            <button
              onClick={() => setSelectedCity("all")}
              className="py-2 px-4 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Clear City Filter
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
