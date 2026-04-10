"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { InvoiceData } from "./types";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#111827",
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  metaLabel: {
    fontWeight: "bold",
    width: 120,
    color: "#374151",
  },
  metaValue: {
    color: "#1f2937",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 18,
  },
  sectionRow: {
    flexDirection: "row",
    gap: 40,
  },
  sectionColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  text: {
    marginBottom: 2,
    color: "#374151",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#d1d5db",
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: "#111827",
    fontSize: 11,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  descCol: {
    flex: 1,
  },
  amountCol: {
    width: 100,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#111827",
  },
  totalLabel: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 12,
    color: "#111827",
  },
  totalAmount: {
    width: 100,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 12,
    color: "#111827",
  },
  paymentGrid: {
    marginTop: 4,
  },
  paymentRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  paymentLabel: {
    width: 130,
    fontWeight: "bold",
    color: "#374151",
  },
  paymentValue: {
    flex: 1,
    color: "#374151",
  },
});

export default function InvoicePDF({ data, invoiceNumber }: { data: InvoiceData; invoiceNumber: string }) {
  const total = data.services.reduce((sum, s) => sum + (s.amount || 0), 0);
  const sym = data.currency === "TRY" ? "₺" : "$";
  const fmt = (n: number) => `${sym}${n.toFixed(2)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>Invoice</Text>

        {/* Meta info */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Invoice Number:</Text>
          <Text style={styles.metaValue}>#{invoiceNumber}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Invoice Date:</Text>
          <Text style={styles.metaValue}>{data.invoiceDate}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Billing Period:</Text>
          <Text style={styles.metaValue}>
            {data.billingPeriodStart} - {data.billingPeriodEnd}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* From / To */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionColumn}>
            <Text style={styles.sectionTitle}>From:</Text>
            <Text style={styles.text}>{data.fromName}</Text>
            <Text style={styles.text}>{data.fromEmail}</Text>
            {data.fromAddress.split("\n").map((line, i) => (
              <Text key={i} style={styles.text}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.sectionColumn}>
            <Text style={styles.sectionTitle}>To:</Text>
            <Text style={styles.text}>{data.toName}</Text>
            <Text style={styles.text}>{data.toEmail}</Text>
            {data.toAddress.split("\n").map((line, i) => (
              <Text key={i} style={styles.text}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Services */}
        <Text style={styles.sectionTitle}>Services:</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.descCol]}>
            Description
          </Text>
          <Text style={[styles.tableHeaderText, styles.amountCol]}>
            Amount
          </Text>
        </View>
        {data.services.map((service, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.descCol}>{service.description}</Text>
            <Text style={styles.amountCol}>
              {fmt(service.amount || 0)}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>{fmt(total)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Payment Details */}
        <Text style={styles.sectionTitle}>Payment Details:</Text>
        <View style={styles.paymentGrid}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Bank Name:</Text>
            <Text style={styles.paymentValue}>{data.bankName}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Bank Address:</Text>
            <Text style={styles.paymentValue}>{data.bankAddress}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Routing:</Text>
            <Text style={styles.paymentValue}>{data.routing}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Account Number:</Text>
            <Text style={styles.paymentValue}>{data.accountNumber}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Account Type:</Text>
            <Text style={styles.paymentValue}>{data.accountType}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Beneficiary Name:</Text>
            <Text style={styles.paymentValue}>{data.beneficiaryName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
