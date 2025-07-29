import { useState } from 'react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Supplier {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  ico: string;
  dic?: string; // DIC je volitelné pro neplátce DPH
  bankAccount: string;
  bankCode: string;
}

interface Customer {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  ico?: string;
  dic?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  supplier: Supplier;
  customer: Customer;
  items: InvoiceItem[];
  currency: string;
  vatRate: number;
  paid?: boolean; // Přidáno pole paid
}

export const useInvoiceGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `F${year}${month}${random}`;
  };

  const calculateDueDate = (invoiceDate: string, days: number = 14) => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const createInvoiceData = (
    customer: Customer,
    items: InvoiceItem[],
    customInvoiceNumber?: string,
    paid: boolean = true // Výchozí hodnota true pro zaplacené faktury
  ): InvoiceData => {
    const invoiceDate = new Date().toISOString().split('T')[0];
    const invoiceNumber = customInvoiceNumber || generateInvoiceNumber();
    const dueDate = calculateDueDate(invoiceDate);

    // Vaše firemní údaje - Pavel Kaplan (neplátce DPH)
    const supplier: Supplier = {
      name: "Pavel Kaplan",
      address: "Obilní 6",
      city: "Praha",
      zipCode: "110 00",
      ico: "300032",
      // DIC není uvedeno - neplátce DPH
      bankAccount: "123456789",
      bankCode: "0100"
    };

    return {
      invoiceNumber,
      invoiceDate,
      dueDate,
      supplier,
      customer,
      items,
      currency: "CZK",
      vatRate: 0, // Neplátce DPH - sazba 0%
      paid // Použije předanou hodnotu
    };
  };

  const generateInvoice = async (invoiceData: InvoiceData) => {
    setIsGenerating(true);
    try {
      // Zde můžete přidat logiku pro uložení faktury do databáze
      console.log('Generating invoice:', invoiceData);

      // Simulace generování
      await new Promise(resolve => setTimeout(resolve, 1000));

      return invoiceData;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateInvoice,
    createInvoiceData,
    generateInvoiceNumber,
    calculateDueDate
  };
};