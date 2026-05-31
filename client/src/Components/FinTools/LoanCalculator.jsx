import { useState, useMemo } from "react";

const fmt = (n) =>
  isFinite(n) && !isNaN(n)
    ? "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "₹0.00";

const pct = (n) => (isFinite(n) && !isNaN(n) ? n.toFixed(1) + "%" : "0.0%");

const EXAMPLES = [
  { label: "🏠 Home Loan", amount: "5000000", rate: "8.5", term: "20" },
  { label: "🚗 Car Loan", amount: "800000", rate: "9.0", term: "5" },
  { label: "🎓 Education", amount: "1500000", rate: "10.5", term: "10" },
  { label: "💼 Personal", amount: "300000", rate: "14.0", term: "3" },
];

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");

  const principal = Math.max(0, parseFloat(loanAmount) || 0);
  const annualRate = Math.max(0, parseFloat(interestRate) || 0);
  const years = Math.max(0, parseInt(loanTerm) || 0);

  const { emi, totalPayment, totalInterest, principalPct, interestPct } = useMemo(() => {
    if (principal <= 0 || years <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, principalPct: 0, interestPct: 0 };
    }
    const n = years * 12;
    const r = annualRate / 100 / 12;
    let emi;
    if (r === 0) {
      emi = principal / n;
    } else {
      const pow = Math.pow(1 + r, n);
      emi = (principal * r * pow) / (pow - 1);
    }
    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;
    const principalPct = (principal / totalPayment) * 100;
    const interestPct = (totalInterest / totalPayment) * 100;
    return { emi, totalPayment, totalInterest, principalPct, interestPct };
  }, [principal, annualRate, years]);

  const hasResult = principal > 0 && years > 0;

  const reset = () => {
    setLoanAmount("");
    setInterestRate("");
    setLoanTerm("");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#faf7f2] p-4 sm:p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        .calc-card { background: #fff; border-radius: 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }
        .input-field {
          width: 100%; padding: 12px 14px 12px 44px;
          border: 1.5px solid #e5e0d8; border-radius: 12px;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          background: #faf7f2; color: #1a1208;
          transition: border-color .2s, box-shadow .2s;
          outline: none;
        }
        .input-field:focus { border-color: #c9651a; box-shadow: 0 0 0 3px rgba(201,101,26,.12); background: #fff; }
        .input-field::placeholder { color: #b0a898; }
        /* hide number spinners */
        .input-field::-webkit-outer-spin-button,
        .input-field::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .input-field[type=number] { -moz-appearance: textfield; }

        .pill-btn {
          padding: 7px 13px; border-radius: 99px; font-size: 12.5px;
          font-weight: 500; border: 1.5px solid #e5e0d8;
          background: #faf7f2; color: #5c4f3a; cursor: pointer;
          transition: background .15s, border-color .15s, color .15s;
        }
        .pill-btn:hover { background: #c9651a; border-color: #c9651a; color: #fff; }

        .bar-track { height: 8px; border-radius: 99px; background: #ede9e0; overflow: hidden; }
        .bar-fill-blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); height: 100%; border-radius: 99px; transition: width .5s ease; }
        .bar-fill-orange { background: linear-gradient(90deg, #c9651a, #f59e0b); height: 100%; border-radius: 99px; transition: width .5s ease; }

        .stat-box { border-radius: 16px; padding: 18px 20px; }
        .result-glow { background: linear-gradient(135deg, #c9651a 0%, #e87d2b 100%); border-radius: 20px; }

        .amort-row:nth-child(even) { background: #faf7f2; }
        .amort-row { border-radius: 8px; }

        @media (max-width: 640px) {
          .grid-2col { grid-template-columns: 1fr; }
          .grid-4col { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 641px) {
          .grid-2col { grid-template-columns: 1fr 1fr; }
          .grid-4col { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#1a1208" }}
              className="text-3xl sm:text-4xl font-bold leading-tight">
              EMI Calculator
            </h1>
            <p className="text-sm text-[#8a7d6b] mt-1">Equated Monthly Installment · Indian Rupees</p>
          </div>
          <button onClick={reset}
            className="self-start sm:self-auto px-5 py-2 rounded-full text-sm font-medium border-2 border-[#e5e0d8] text-[#5c4f3a] hover:bg-[#c9651a] hover:text-white hover:border-[#c9651a] transition-all">
            Reset
          </button>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr" }}>
          {/* Top row: inputs + result */}
          <div className="grid gap-5 grid-2col">
            {/* Input card */}
            <div className="calc-card p-6">
              <h2 className="text-base font-semibold text-[#1a1208] mb-5">Loan Details</h2>
              <div className="space-y-4">

                {/* Loan Amount */}
                <div>
                  <label className="block text-sm font-medium text-[#5c4f3a] mb-1.5">Loan Amount</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a7d6b] font-semibold text-base select-none">₹</span>
                    <input type="number" placeholder="5,00,000" value={loanAmount}
                      onChange={e => setLoanAmount(e.target.value)}
                      className="input-field" min="0" />
                  </div>
                  {loanAmount && principal <= 0 && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid positive amount</p>
                  )}
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-[#5c4f3a] mb-1.5">Annual Interest Rate</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a7d6b] font-semibold text-sm select-none">%</span>
                    <input type="number" placeholder="8.5" step="0.1" value={interestRate}
                      onChange={e => setInterestRate(e.target.value)}
                      className="input-field" min="0" max="100" />
                  </div>
                  {interestRate && annualRate <= 0 && (
                    <p className="text-xs text-amber-600 mt-1">0% = simple division (no compound interest)</p>
                  )}
                </div>

                {/* Loan Term */}
                <div>
                  <label className="block text-sm font-medium text-[#5c4f3a] mb-1.5">Loan Term</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a7d6b] text-xs font-semibold select-none">YR</span>
                    <input type="number" placeholder="20" value={loanTerm}
                      onChange={e => setLoanTerm(e.target.value)}
                      className="input-field" min="1" max="30" />
                  </div>
                  {loanTerm && years <= 0 && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid loan term (≥1 year)</p>
                  )}
                </div>

                {/* Quick examples */}
                <div className="pt-3 border-t border-[#ede9e0]">
                  <p className="text-xs text-[#8a7d6b] mb-2">Quick presets</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map(ex => (
                      <button key={ex.label} className="pill-btn"
                        onClick={() => { setLoanAmount(ex.amount); setInterestRate(ex.rate); setLoanTerm(ex.term); }}>
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Result card */}
            <div className="flex flex-col gap-5">
              {/* EMI highlight */}
              <div className="result-glow p-6 text-white">
                <p className="text-sm font-medium opacity-80 mb-1">Monthly EMI</p>
                <p className="text-4xl sm:text-5xl font-bold tracking-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {hasResult ? fmt(emi) : "₹0.00"}
                </p>
                <p className="text-xs opacity-70 mt-2">per month for {years || 0} years ({years * 12} payments)</p>
                {hasResult && (
                  <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-xs opacity-70">Total Payment</p>
                      <p className="text-base font-semibold mt-0.5">{fmt(totalPayment)}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70">Total Interest</p>
                      <p className="text-base font-semibold mt-0.5">{fmt(totalInterest)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="calc-card p-6 flex-1">
                <h3 className="text-sm font-semibold text-[#1a1208] mb-4">Payment Distribution</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#5c4f3a] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
                        Principal
                      </span>
                      <span className="font-semibold text-[#1a1208]">{pct(principalPct)}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill-blue" style={{ width: `${principalPct || 0}%` }} />
                    </div>
                    <p className="text-xs text-[#8a7d6b] mt-1">{fmt(principal)}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#5c4f3a] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span>
                        Interest
                      </span>
                      <span className="font-semibold text-[#1a1208]">{pct(interestPct)}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill-orange" style={{ width: `${interestPct || 0}%` }} />
                    </div>
                    <p className="text-xs text-[#8a7d6b] mt-1">{fmt(totalInterest)}</p>
                  </div>
                </div>

                {/* Summary rows */}
                {hasResult && (
                  <div className="mt-5 pt-4 border-t border-[#ede9e0] space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#8a7d6b]">Interest Rate</span>
                      <span className="font-medium text-[#1a1208]">{annualRate}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a7d6b]">Total Payments</span>
                      <span className="font-medium text-[#1a1208]">{years * 12} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a7d6b]">Interest Cost Ratio</span>
                      <span className="font-medium text-orange-600">
                        {principal > 0 ? pct((totalInterest / principal) * 100) : "0.0%"} of principal
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amortization table (first 12 months) */}
          {hasResult && (
            <div className="calc-card p-6">
              <h3 className="text-sm font-semibold text-[#1a1208] mb-4">
                Yearly Amortization Schedule
                <span className="ml-2 text-xs font-normal text-[#8a7d6b]">(first {Math.min(years, 10)} years shown)</span>
              </h3>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-xs text-[#8a7d6b] border-b border-[#ede9e0]">
                      <th className="text-left pb-2 pr-4 font-medium">Year</th>
                      <th className="text-right pb-2 pr-4 font-medium">Opening Balance</th>
                      <th className="text-right pb-2 pr-4 font-medium">Principal Paid</th>
                      <th className="text-right pb-2 pr-4 font-medium">Interest Paid</th>
                      <th className="text-right pb-2 font-medium">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rows = [];
                      let balance = principal;
                      const r = annualRate / 100 / 12;
                      const displayYears = Math.min(years, 10);
                      for (let y = 1; y <= displayYears; y++) {
                        const opening = balance;
                        let principalYear = 0, interestYear = 0;
                        for (let m = 0; m < 12; m++) {
                          const intM = balance * r;
                          const prinM = r === 0 ? emi : emi - intM;
                          interestYear += intM;
                          principalYear += prinM;
                          balance -= prinM;
                          if (balance < 0) balance = 0;
                        }
                        rows.push(
                          <tr key={y} className="amort-row">
                            <td className="py-2 pr-4 font-medium text-[#1a1208]">Year {y}</td>
                            <td className="py-2 pr-4 text-right text-[#5c4f3a]">{fmt(opening)}</td>
                            <td className="py-2 pr-4 text-right text-blue-600 font-medium">{fmt(principalYear)}</td>
                            <td className="py-2 pr-4 text-right text-orange-600 font-medium">{fmt(interestYear)}</td>
                            <td className="py-2 text-right text-[#5c4f3a]">{fmt(Math.max(0, balance))}</td>
                          </tr>
                        );
                      }
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="calc-card p-5 border-l-4 border-[#c9651a]">
            <h4 className="text-sm font-semibold text-[#1a1208] mb-2">💡 Smart Borrowing Tips</h4>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr" }}>
              {[
                "Make prepayments towards principal to reduce total interest significantly.",
                "A shorter tenure = higher EMI but much lower total interest paid.",
                "Even a 0.5% lower rate on a ₹50L home loan saves ₹3–4L over 20 years.",
                "Maintain CIBIL score above 750 for the best interest rate offers.",
              ].map((tip, i) => (
                <p key={i} className="text-xs text-[#5c4f3a] flex gap-2">
                  <span className="text-[#c9651a] font-bold shrink-0">→</span>{tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}