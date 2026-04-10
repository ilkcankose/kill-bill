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
  onDownloaded: () => void;
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
      onDownloaded();
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
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl shadow transition text-lg cursor-pointer disabled:cursor-wait"
    >
      {loading ? "Generating PDF..." : "Download PDF"}
    </button>
  );
}
