import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import path from 'path';

// Registrace DejaVu Sans fontu pro české znaky
Font.register({
  family: 'DejaVu Sans',
  src: path.join(process.cwd(), 'src', 'fonts', 'DejaVuSans.ttf'),
});

// Styly s podporou českých znaků
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'DejaVu Sans',
    position: 'relative',
  },

  // Vodoznak
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e5e7eb',
    opacity: 0.3,
    zIndex: 1,
  },

  // Hlavička
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: 20,
    position: 'relative',
    zIndex: 2,
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },

  companyDetails: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 1.4,
  },

  invoiceInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },

  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },

  invoiceNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },

  invoiceDate: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Dodavatel a odběratel
  parties: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    position: 'relative',
    zIndex: 2,
  },

  supplier: {
    flex: 1,
    marginRight: 40,
  },

  customer: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 4,
  },

  partyInfo: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },

  // Tabulka položek
  itemsTable: {
    marginBottom: 40,
    position: 'relative',
    zIndex: 2,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },

  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  tableCell: {
    fontSize: 10,
    color: '#374151',
  },

  // Sloupce tabulky
  col1: { width: '10%' }, // Pořadí
  col2: { width: '40%' }, // Popis
  col3: { width: '10%' }, // Množství
  col4: { width: '10%' }, // Jednotka
  col5: { width: '15%' }, // Cena za jednotku
  col6: { width: '15%' }, // Celkem

  // Součty
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
    position: 'relative',
    zIndex: 2,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    width: '300px',
  },

  totalLabel: {
    fontSize: 12,
    color: '#374151',
  },

  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  finalTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    borderTop: '2px solid #e5e7eb',
    paddingTop: 8,
  },

  // Platební údaje
  paymentInfo: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f9fafb',
    position: 'relative',
    zIndex: 2,
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },

  paymentDetails: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },

  // Patička
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1px solid #e5e7eb',
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
  },
});

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface SimpleCzechInvoiceProps {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  supplier: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    ico: string;
    dic?: string; // DIC je volitelné pro neplátce DPH
    bankAccount: string;
    bankCode: string;
  };
  customer: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    ico?: string;
    dic?: string;
  };
  items: InvoiceItem[];
  currency: string;
  vatRate: number;
  paid?: boolean; // Nová vlastnost pro označení zaplacené faktury
}

const SimpleCzechInvoice: React.FC<SimpleCzechInvoiceProps> = ({
  invoiceNumber,
  invoiceDate,
  dueDate,
  supplier,
  customer,
  items,
  currency,
  vatRate,
  paid = false, // Výchozí hodnota false
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;
  const isVatPayer = vatRate > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Vodoznak */}
        <Text style={styles.watermark}>ZAPLACENO</Text>

        {/* Hlavička */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{supplier.name}</Text>
            <Text style={styles.companyDetails}>
              {supplier.address}{'\n'}
              {supplier.zipCode} {supplier.city}{'\n'}
              IČO: {supplier.ico}
              {supplier.dic && `\nDIČ: ${supplier.dic}`}
            </Text>
          </View>

          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>FAKTURA</Text>
            <Text style={styles.invoiceNumber}>Číslo: {invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>Datum vystavení: {formatDate(invoiceDate)}</Text>
            {!paid && <Text style={styles.invoiceDate}>Datum splatnosti: {formatDate(dueDate)}</Text>}
          </View>
        </View>

        {/* Dodavatel a odběratel */}
        <View style={styles.parties}>
          <View style={styles.supplier}>
            <Text style={styles.sectionTitle}>DODAVATEL</Text>
            <Text style={styles.partyInfo}>
              {supplier.name}{'\n'}
              {supplier.address}{'\n'}
              {supplier.zipCode} {supplier.city}{'\n'}
              IČO: {supplier.ico}
              {supplier.dic && `\nDIČ: ${supplier.dic}`}
            </Text>
          </View>

          <View style={styles.customer}>
            <Text style={styles.sectionTitle}>ODBĚRATEL</Text>
            <Text style={styles.partyInfo}>
              {customer.name}{'\n'}
              {customer.address}{'\n'}
              {customer.zipCode} {customer.city}
              {customer.ico && `\nIČO: ${customer.ico}`}
              {customer.dic && `\nDIČ: ${customer.dic}`}
            </Text>
          </View>
        </View>

        {/* Tabulka položek */}
        <View style={styles.itemsTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>Pořadí</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>Popis</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>Množství</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>Jednotka</Text>
            <Text style={[styles.tableHeaderCell, styles.col5]}>Cena za jednotku</Text>
            <Text style={[styles.tableHeaderCell, styles.col6]}>Celkem</Text>
          </View>

          {items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.col2]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.col3]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{item.unit}</Text>
              <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, styles.col6]}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Součty */}
        <View style={styles.totals}>
          {isVatPayer ? (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Mezisoučet:</Text>
                <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>DPH ({vatRate}%):</Text>
                <Text style={styles.totalValue}>{formatCurrency(vatAmount)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Neplátce DPH:</Text>
              <Text style={styles.totalValue}>-</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={[styles.totalValue, styles.finalTotal]}>Celkem k úhradě:</Text>
            <Text style={[styles.totalValue, styles.finalTotal]}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Platební údaje */}
        {!paid && (
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>PLATEBNÍ ÚDAJE</Text>
            <Text style={styles.paymentDetails}>
              Číslo účtu: {supplier.bankAccount}/{supplier.bankCode}{'\n'}
              Variabilní symbol: {invoiceNumber}{'\n'}
              Způsob platby: Bankovní převod{'\n'}
              Splatnost: {formatDate(dueDate)}
            </Text>
          </View>
        )}

        {/* Patička */}
        <View style={styles.footer}>
          <Text>
            Faktura byla vytvořena elektronicky. V případě dotazů nás kontaktujte.
            {!isVatPayer && '\nNeplátce DPH - faktura neobsahuje DPH.'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default SimpleCzechInvoice;