"use client";

import { useState } from "react";
import { InvoiceData } from "./types";

export default function PDFDownloadButton({
  data,
  invoiceNumber,
  onDownloaded,
}: {
  data: InvoiceData;
  invoiceNumber: string;
  onDownloaded?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: InvoicePDF } = await import("./InvoicePDF");
      const blob = await pdf(<InvoicePDF data={data} invoiceNumber={invoiceNumber} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber || "draft"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      onDownloaded?.();
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] disabled:opacity-50 text-black font-bold py-3 px-6 rounded-xl shadow transition text-lg cursor-pointer disabled:cursor-wait uppercase tracking-wide"
    >
      {loading ? "Slashing..." : "Kill the Bill"}
    </button>
  );
}
