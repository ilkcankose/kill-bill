"use client";

import { useState, useEffect } from "react";
import { InvoiceData, ServiceItem, Currency } from "./types";

import PDFDownloadButton from "./PDFDownloadButton";

const COUNTER_KEY = "invoice_counter";
const COUNTER_START = 382;

function getCounter(): number {
  if (typeof window === "undefined") return COUNTER_START;
  const stored = localStorage.getItem(COUNTER_KEY);
  return stored ? parseInt(stored, 10) : COUNTER_START;
}

function incrementCounter(): number {
  const next = getCounter() + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}

const STORAGE_KEY = "invoice_data";

const defaultData: InvoiceData = {
  currency: "USD",
  invoiceDate: "",
  billingPeriodStart: "",
  billingPeriodEnd: "",

  fromName: "",
  fromEmail: "",
  fromAddress: "",

  toName: "",
  toEmail: "",
  toAddress: "",

  services: [{ description: "", amount: 0 }],

  bankName: "",
  bankAddress: "",
  routing: "",
  accountNumber: "",
  accountType: "",
  beneficiaryName: "",
};

function loadSavedData(): InvoiceData {
  if (typeof window === "undefined") return defaultData;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultData;
  try {
    return { ...defaultData, ...JSON.parse(stored) };
  } catch {
    return defaultData;
  }
}

function saveData(data: InvoiceData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Home() {
  const [data, setData] = useState<InvoiceData>(defaultData);
  const [counter, setCounter] = useState(COUNTER_START);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateFlash, setRateFlash] = useState(false);

  useEffect(() => {
    setCounter(getCounter());
    setData(loadSavedData());
    fetchRate();
  }, []);

  const fetchRate = async () => {
    setRateLoading(true);
    try {
      const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json");
      const json = await res.json();
      setExchangeRate(json.usd.try);
      setRateFlash(true);
      setTimeout(() => setRateFlash(false), 1500);
    } catch {
      setExchangeRate(null);
    } finally {
      setRateLoading(false);
    }
  };

  const update = (field: keyof InvoiceData, value: string) => {
    if (field === "currency" && exchangeRate && value !== data.currency) {
      const newCurrency = value as Currency;
      setData((prev) => {
        const next = {
          ...prev,
          currency: newCurrency,
          services: prev.services.map((s) => ({
            ...s,
            amount: newCurrency === "USD"
              ? parseFloat((s.amount / exchangeRate).toFixed(2))
              : parseFloat((s.amount * exchangeRate).toFixed(2)),
          })),
        };
        saveData(next);
        return next;
      });
      return;
    }
    setData((prev) => {
      const next = { ...prev, [field]: value };
      saveData(next);
      return next;
    });
  };

  const updateService = (
    index: number,
    field: keyof ServiceItem,
    value: string
  ) => {
    setData((prev) => {
      const services = [...prev.services];
      if (field === "amount") {
        services[index] = { ...services[index], amount: parseFloat(value) || 0 };
      } else {
        services[index] = { ...services[index], [field]: value };
      }
      const next = { ...prev, services };
      saveData(next);
      return next;
    });
  };

  const addService = () => {
    setData((prev) => {
      const next = { ...prev, services: [...prev.services, { description: "", amount: 0 }] };
      saveData(next);
      return next;
    });
  };

  const removeService = (index: number) => {
    setData((prev) => {
      const next = { ...prev, services: prev.services.filter((_, i) => i !== index) };
      saveData(next);
      return next;
    });
  };

  const total = data.services.reduce((sum, s) => sum + (s.amount || 0), 0);
  const currencySymbol = data.currency === "USD" ? "$" : "₺";

  const invoiceNumber = (() => {
    if (!data.invoiceDate) return String(counter);
    const d = new Date(data.invoiceDate + "T00:00:00");
    const yy = String(d.getFullYear() % 100).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yy}${mm}${counter}`;
  })();

  const handleDownloaded = () => {
    const next = incrementCounter();
    setCounter(next);
  };

  const pdfData = {
    ...data,
    invoiceDate: formatDateForDisplay(data.invoiceDate),
    billingPeriodStart: formatDateForDisplay(data.billingPeriodStart),
    billingPeriodEnd: formatDateForDisplay(data.billingPeriodEnd),
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-white focus:border-[var(--yellow)] focus:ring-1 focus:ring-[var(--yellow)] outline-none transition";
  const labelClass = "block text-xs font-semibold text-[var(--text-label)] uppercase tracking-wide mb-1";

  return (
    <div className="min-h-screen bg-[var(--background)] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-[var(--yellow)] mb-2 tracking-tight">
          KILL BILL
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Slash through your billing paperwork</p>

        {/* Invoice Meta */}
        <section className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--yellow)] mb-4">
            Invoice Details
          </h2>
          <div className="mb-4 p-3 bg-[var(--background)] rounded-lg border border-[var(--card-border)]">
            <span className="text-xs font-semibold text-[var(--text-label)] uppercase tracking-wide">Invoice Number</span>
            <p className="text-lg font-mono font-bold text-[var(--yellow)] mt-1">#{invoiceNumber}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Invoice Date</label>
              <input
                type="date"
                className={inputClass}
                value={data.invoiceDate}
                onChange={(e) => update("invoiceDate", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Billing Period Start</label>
              <input
                type="date"
                className={inputClass}
                value={data.billingPeriodStart}
                onChange={(e) => update("billingPeriodStart", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Billing Period End</label>
              <input
                type="date"
                className={inputClass}
                value={data.billingPeriodEnd}
                onChange={(e) => update("billingPeriodEnd", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* From / To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <section className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--yellow)] mb-4">From</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Hattori Hanzo"
                  value={data.fromName}
                  onChange={(e) => update("fromName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="hanzo@swords.jp"
                  value={data.fromEmail}
                  onChange={(e) => update("fromEmail", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder={"Okinawa Sword Shop\nOkinawa, Japan"}
                  value={data.fromAddress}
                  onChange={(e) => update("fromAddress", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--yellow)] mb-4">To</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Deadly Viper Assassination Squad"
                  value={data.toName}
                  onChange={(e) => update("toName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="bill@vipers.org"
                  value={data.toEmail}
                  onChange={(e) => update("toEmail", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder={"Two Pines Chapel\nEl Paso, Texas"}
                  value={data.toAddress}
                  onChange={(e) => update("toAddress", e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Services */}
        <section className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-[var(--yellow)]">Services</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold text-[var(--text-label)] uppercase tracking-wide">Currency</label>
              <select
                className="rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-1.5 text-sm text-white focus:border-[var(--yellow)] outline-none"
                value={data.currency}
                onChange={(e) => update("currency", e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="TRY">TRY (₺)</option>
              </select>
              <button
                onClick={fetchRate}
                disabled={rateLoading}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs cursor-pointer transition-all duration-300 ${
                  rateFlash
                    ? "border-[var(--accent-green)] bg-green-900/30 text-green-400"
                    : "border-[var(--input-border)] text-[var(--text-muted)] hover:border-[var(--yellow)] hover:text-[var(--yellow)]"
                } disabled:opacity-50`}
              >
                <span className={`inline-block transition-transform duration-500 ${rateLoading ? "animate-spin" : ""}`}>↻</span>
                {exchangeRate
                  ? `1 USD = ${exchangeRate.toFixed(2)} TRY`
                  : rateLoading ? "Loading..." : "Load rate"}
                {rateFlash && <span className="text-green-400 text-[10px]">updated</span>}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {data.services.map((service, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <input
                  type="text"
                  className={`${inputClass} flex-1`}
                  placeholder="Sword sharpening service"
                  value={service.description}
                  onChange={(e) =>
                    updateService(i, "description", e.target.value)
                  }
                />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-[var(--text-muted)]">{currencySymbol}</span>
                  <input
                    type="number"
                    className={`${inputClass} w-full sm:w-32`}
                    placeholder="0.00"
                    value={service.amount || ""}
                    onChange={(e) =>
                      updateService(i, "amount", e.target.value)
                    }
                  />
                  {data.services.length > 1 && (
                    <button
                      onClick={() => removeService(i)}
                      className="text-[var(--accent-red)] hover:text-red-400 text-lg px-2 transition"
                      title="Remove"
                    >
                      x
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addService}
            className="mt-3 text-sm text-[var(--yellow)] hover:text-[var(--yellow-dark)] font-medium transition"
          >
            + Add Service
          </button>
          <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex justify-between items-center">
            <span className="font-semibold text-[var(--text-muted)]">Total</span>
            <span className="text-xl font-bold text-[var(--yellow)]">
              {currencySymbol}{total.toFixed(2)}
            </span>
          </div>
          {data.currency === "TRY" && exchangeRate && (
            <div className="mt-2 text-sm text-[var(--text-muted)] text-right">
              ≈ ${(total / exchangeRate).toFixed(2)} USD
            </div>
          )}
          {data.currency === "USD" && exchangeRate && (
            <div className="mt-2 text-sm text-[var(--text-muted)] text-right">
              ≈ ₺{(total * exchangeRate).toFixed(2)} TRY
            </div>
          )}
        </section>

        {/* Payment Details */}
        <section className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-6 mb-8">
          <h2 className="text-lg font-semibold text-[var(--yellow)] mb-4">
            Payment Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Bank Name</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Bank of Okinawa"
                value={data.bankName}
                onChange={(e) => update("bankName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Bank Address</label>
              <input
                type="text"
                className={inputClass}
                placeholder="1 Katana Blvd, Okinawa"
                value={data.bankAddress}
                onChange={(e) => update("bankAddress", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Routing</label>
              <input
                type="text"
                className={inputClass}
                placeholder="0000KILL"
                value={data.routing}
                onChange={(e) => update("routing", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Account Number</label>
              <input
                type="text"
                className={inputClass}
                placeholder="BILL-0001"
                value={data.accountNumber}
                onChange={(e) => update("accountNumber", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Account Type</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Revenge Checking"
                value={data.accountType}
                onChange={(e) => update("accountType", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Beneficiary Name</label>
              <input
                type="text"
                className={inputClass}
                placeholder="The Bride"
                value={data.beneficiaryName}
                onChange={(e) => update("beneficiaryName", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Download Button */}
        <div className="flex gap-4">
          <PDFDownloadButton data={pdfData} invoiceNumber={invoiceNumber} onDownloaded={handleDownloaded} />
        </div>
      </div>
    </div>
  );
}
