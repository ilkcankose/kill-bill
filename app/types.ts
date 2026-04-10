export interface ServiceItem {
  description: string;
  amount: number;
}

export type Currency = "USD" | "TRY";

export interface InvoiceData {
  currency: Currency;
  invoiceDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;

  fromName: string;
  fromEmail: string;
  fromAddress: string;

  toName: string;
  toEmail: string;
  toAddress: string;

  services: ServiceItem[];

  bankName: string;
  bankAddress: string;
  routing: string;
  accountNumber: string;
  accountType: string;
  beneficiaryName: string;
}
