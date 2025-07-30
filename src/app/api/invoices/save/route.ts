import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invoiceData = await request.json();

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
        totalAmount: invoiceData.items.reduce((sum: number, item: any) => sum + item.total, 0),
        paid: invoiceData.paid || false,
        userId: userId,
        paymentSessionId: invoiceData.paymentSessionId || null,
      },
    });

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      message: 'Faktura byla úspěšně uložena',
      invoice: invoice
    });

  } catch (error) {
    console.error('Error saving invoice:', error);
    return NextResponse.json(
      { error: 'Failed to save invoice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}