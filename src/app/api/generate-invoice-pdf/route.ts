import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

// Import the invoice component directly (not using lazy loading in API routes)
import SimpleCzechInvoice from '@/components/invoice/SimpleCzechInvoice';

export async function POST(request: NextRequest) {
  try {
    const invoiceData = await request.json();

    console.log('Generating PDF with data:', invoiceData);

    // Create the invoice component element
    const InvoiceElement = React.createElement(SimpleCzechInvoice, {
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      supplier: invoiceData.supplier,
      customer: invoiceData.customer,
      items: invoiceData.items,
      currency: invoiceData.currency,
      vatRate: invoiceData.vatRate,
      paid: invoiceData.paid || false, // Přidáno pole paid
    });

    // Generate PDF buffer with type assertion
    const pdfBuffer = await (renderToBuffer as any)(InvoiceElement);

    console.log('PDF generated successfully, buffer size:', pdfBuffer.length);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="faktura-${invoiceData.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}