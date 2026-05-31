
import React, { useState, useMemo } from "react";
import {
  RefreshCw,
  TrendingDown,
  IndianRupee,
  Calendar,
  Percent,
  AlertTriangle,
  Info,
  PlusCircle,
} from "lucide-react";

/* ── helpers ─────────────────────────────────────────────── */

const clamp = (v, min, max) => Math.min(Math.max(Number(v) || 0, min), max);

const fmtINR = (v) => {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)} K`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
};

const fmtFull = (v) =>
  `₹${Math.round(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* ── slider CSS (orange accent, visible filled track) ─────── */

const sliderStyle = `
  .inf-range {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    outline: none;
    cursor: pointer;
  }
  .inf-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #f97316;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #f97316;
    cursor: pointer;
    transition: box-shadow 0.15s;
  }
  .inf-range::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 4px rgba(249,115,22,0.2);
  }
  .inf-range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #f97316;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #f97316;
    cursor: pointer;
  }
`;

/* ── InputRow (identical pattern to SIPCalculator) ────────── */

const InputRow = ({ icon, label, value, onChange, min, max, unit, placeholder, step }) => {
  const Icon = icon;
  const clamped = clamp(value, min, max);
  const fillPct = ((clamped - min) / (max - min)) * 100;
  const trackStyle = {
    background: `linear-gradient(to right, #f97316 ${fillPct}%, #e5e7eb ${fillPct}%)`,
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 shrink-0">
        <Icon className="w-4 h-4 text-orange-500" />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
        <div className="relative">
          {unit === "₹" && (
            <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          )}
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onChange(clamp(e.target.value, min, max))}
            className={`w-full py-2 border border-gray-300 rounded-lg text-sm
              focus:ring-2 focus:ring-orange-400 focus:border-transparent
              ${unit === "₹" ? "pl-8 pr-3" : "pl-3 pr-8"}`}
          />
          {unit !== "₹" && (
            <span className="absolute right-3 top-2 text-sm text-gray-400 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </div>
      {/* slider with visible filled track */}
      <div className="w-28 hidden sm:block">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamped}
          onChange={(e) => onChange(Number(e.target.value))}
          className="inf-range"
          style={trackStyle}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

/* ── main component ──────────────────────────────────────── */

const InflationCalculator = ({ onClose }) => {
  const [amount,    setAmount]    = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [years,     setYears]     = useState(10);
  const [showTable, setShowTable] = useState(false);

  /* ── calculations ── */
  const { futureNeeded, purchasingLoss, realValue, lossPct, yearlyData } = useMemo(() => {
    const sa = clamp(amount,    1000, 500000);
    const si = clamp(inflation, 1,    20);
    const sy = clamp(years,     1,    40);

    const futureNeeded   = sa * Math.pow(1 + si / 100, sy);
    const realValue      = sa / Math.pow(1 + si / 100, sy);
    const purchasingLoss = sa - realValue;
    const lossPct        = ((purchasingLoss / sa) * 100).toFixed(1);

    const table = Array.from({ length: sy }, (_, i) => {
      const y = i + 1;
      return {
        year:          y,
        futureNeeded:  sa * Math.pow(1 + si / 100, y),
        realValue:     sa / Math.pow(1 + si / 100, y),
        erosionPct:    (((sa - sa / Math.pow(1 + si / 100, y)) / sa) * 100).toFixed(1),
      };
    });

    return { futureNeeded, purchasingLoss, realValue, lossPct, yearlyData: table };
  }, [amount, inflation, years]);

  const safeAmount = clamp(amount, 1000, 500000);
  const realPct    = (100 - parseFloat(lossPct)).toFixed(1);

  const reset = () => {
    setAmount(50000);
    setInflation(6);
    setYears(10);
    setShowTable(false);
  };

  /* ── render ── */
  return (
    <div className="max-w-4xl mx-auto">
      <style>{sliderStyle}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inflation Calculator</h2>
          <p className="text-gray-600 text-sm mt-1">
            See how inflation silently erodes your money's purchasing power
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={reset}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </button>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Inputs ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-5">
            <TrendingDown className="w-5 h-5 text-orange-500 mr-2" />
            Inflation Details
          </h3>

          <div className="space-y-5">
            <InputRow
              icon={IndianRupee}
              label="Current Amount / Monthly Expense"
              value={amount}
              onChange={setAmount}
              min={1000}
              max={500000}
              step={1000}
              unit="₹"
              placeholder="50000"
            />
            <InputRow
              icon={Percent}
              label="Inflation Rate"
              value={inflation}
              onChange={setInflation}
              min={1}
              max={20}
              step={0.5}
              unit="%"
              placeholder="6"
            />
            <InputRow
              icon={Calendar}
              label="Time Period"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              unit="yr"
              placeholder="10"
            />
          </div>

          {/* quick summary strip */}
          <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            {[
              { label: "Today's Value", value: fmtINR(safeAmount),    color: "text-gray-800"   },
              { label: "Future Need",   value: fmtINR(futureNeeded),  color: "text-orange-600" },
              { label: "Value Lost",    value: `${lossPct}%`,         color: "text-red-500"    },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-lg py-2 px-1">
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-sm font-bold ${color} mt-0.5`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Results ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          {/* future needed banner */}
          <div className="rounded-xl bg-orange-50 border border-orange-100 p-5 text-center">
            <p className="text-xs text-orange-400 uppercase tracking-widest font-semibold mb-1">
              To buy what costs {fmtINR(safeAmount)} today, you'll need
            </p>
            <p className="text-4xl font-extrabold text-orange-600">{fmtINR(futureNeeded)}</p>
            <p className="text-xs text-orange-400 mt-1">
              {fmtFull(futureNeeded)} — in {clamp(years, 1, 40)} yrs at {clamp(inflation, 1, 20)}% inflation
            </p>
          </div>

          {/* purchasing power bar */}
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
              Purchasing Power of {fmtINR(safeAmount)} Today
            </p>
            <div className="flex rounded-full overflow-hidden h-5 mb-3">
              <div
                className="bg-emerald-400 transition-all duration-700 flex items-center justify-center"
                style={{ width: `${realPct}%` }}
              >
                {parseFloat(realPct) > 15 && (
                  <span className="text-white text-xs font-semibold">{realPct}%</span>
                )}
              </div>
              <div className="bg-red-400 flex-1 flex items-center justify-center">
                {parseFloat(lossPct) > 15 && (
                  <span className="text-white text-xs font-semibold">{lossPct}%</span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 mr-1 align-middle" />
                <span className="text-gray-500 text-xs">Real Value Remaining</span>
                <p className="font-bold text-gray-800 mt-0.5">{fmtINR(realValue)}</p>
              </div>
              <div className="text-right">
                <span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-1 align-middle" />
                <span className="text-gray-500 text-xs">Purchasing Power Lost</span>
                <p className="font-bold text-red-500 mt-0.5">{fmtINR(purchasingLoss)}</p>
              </div>
            </div>
          </div>

          {/* toggle year-wise table */}
          <button
            onClick={() => setShowTable((p) => !p)}
            className="flex items-center justify-center text-sm text-orange-600 hover:text-orange-800 font-medium py-1"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            {showTable ? "Hide" : "Show"} Year-wise Inflation Timeline
          </button>

          {showTable && (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-y-auto max-h-52">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {["Year", "Future Need", "Real Value", "Erosion"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyData.map((row) => (
                      <tr key={row.year} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-600">Yr {row.year}</td>
                        <td className="px-3 py-1.5 text-orange-600 font-medium">{fmtINR(row.futureNeeded)}</td>
                        <td className="px-3 py-1.5 text-emerald-600 font-medium">{fmtINR(row.realValue)}</td>
                        <td className="px-3 py-1.5 text-red-500 font-semibold">{row.erosionPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary / Tip Banner ── */}
      <div className="mt-6 bg-linear-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Purchasing power loss after {clamp(years, 1, 40)} years
            </p>
            <p className="text-3xl font-bold text-red-600">{fmtINR(purchasingLoss)}</p>
            <p className="text-sm text-gray-600 mt-1">
              {parseFloat(lossPct) >= 50
                ? "🔥 More than half your money's value is gone"
                : parseFloat(lossPct) >= 30
                ? "⚠️ Significant erosion — time to invest wisely"
                : "📉 Gradual but real erosion happening"}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Value Eroded</p>
              <p className="text-2xl font-bold text-red-500">{lossPct}%</p>
            </div>
          </div>
        </div>

        {inflation >= 10 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ High Inflation Alert:</strong> At {inflation}%, prices double roughly every{" "}
              {(72 / inflation).toFixed(1)} years. Consider inflation-beating investments like equity
              mutual funds or real estate.
            </p>
          </div>
        )}

        {inflation >= 5 && inflation < 10 && parseFloat(lossPct) >= 40 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-800">
              Over a long period, even moderate inflation causes severe erosion. Investing in assets
              that return above {inflation}% p.a. will protect your purchasing power.
            </p>
          </div>
        )}

        {inflation < 5 && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-2">
            <Info className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-green-800">
              <strong>💡 Low inflation environment.</strong> India's RBI targets 4% inflation. Even at
              this rate, your money still loses {lossPct}% of its value over {clamp(years, 1, 40)} years —
              keep investing to stay ahead.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InflationCalculator;