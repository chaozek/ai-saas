import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import SimpleCzechInvoice from '@/components/invoice/SimpleCzechInvoice';
import prisma from '@/lib/prisma';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  supplier: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    ico: string;
    dic?: string;
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
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  currency: string;
  vatRate: number;
  paid: boolean;
}

export async function generateAndSaveInvoice(
  invoiceData: InvoiceData,
  userId: string,
  paymentSessionId?: string
) {
  try {
    console.log('Generating and saving invoice for user:', userId);

    // Vytvoření faktury v databázi
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: new Date(invoiceData.invoiceDate),
        dueDate: new Date(invoiceData.dueDate),
        supplier: invoiceData.supplier,
        customer: invoiceData.customer,
        items: invoiceData.items,
        currency: invoiceData.currency,
        vatRate: invoiceData.vatRate,
        totalAmount: invoiceData.items.reduce((sum, item) => sum + item.total, 0),
        paid: invoiceData.paid,
        userId: userId,
        paymentSessionId: paymentSessionId || null,
      },
    });

    // Generování PDF
    const InvoiceElement = React.createElement(SimpleCzechInvoice, {
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      supplier: invoiceData.supplier,
      customer: invoiceData.customer,
      items: invoiceData.items,
      currency: invoiceData.currency,
      vatRate: invoiceData.vatRate,
      paid: invoiceData.paid,
    });

    const pdfBuffer = await (renderToBuffer as any)(InvoiceElement);

    // Uložení PDF do databáze
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        pdfBuffer: pdfBuffer,
      },
    });

    console.log('Invoice saved with PDF, ID:', invoice.id);

    return {
      success: true,
      invoiceId: invoice.id,
      invoiceNumber: invoiceData.invoiceNumber,
    };
  } catch (error) {
    console.error('Error generating and saving invoice:', error);
    throw error;
  }
}

export function createInvoiceData(
  customerName: string,
  customerAddress: string,
  customerCity: string,
  customerZipCode: string,
  planName: string,
  amount: number,
  paymentId: string,
  paid: boolean = true
): InvoiceData {
  const invoiceDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const invoiceNumber = `F${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

  // Vaše firemní údaje - Pavel Kaplan (neplátce DPH)
  const supplier = {
    name: "Pavel Kaplan",
    address: "Obilní 6",
    city: "Praha",
    zipCode: "110 00",
    ico: "300032",
    bankAccount: "123456789",
    bankCode: "0100"
  };

  const customer = {
    name: customerName || "Zákazník",
    address: customerAddress || "",
    city: customerCity || "",
    zipCode: customerZipCode || "",
  };

  const items = [
    {
      id: paymentId,
      description: planName,
      quantity: 1,
      unit: "ks",
      unitPrice: amount,
      total: amount
    }
  ];

  return {
    invoiceNumber,
    invoiceDate,
    dueDate: dueDate.toISOString().split('T')[0],
    supplier,
    customer,
    items,
    currency: "CZK",
    vatRate: 0, // Neplátce DPH
    paid
  };
}