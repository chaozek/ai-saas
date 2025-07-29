import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const invoiceData = await request.json();

    // Prozatím vracíme JSON s informacemi o fakturu
    // Později můžeme implementovat skutečné PDF generování
    return NextResponse.json({
      success: true,
      invoiceNumber: invoiceData.invoiceNumber,
      message: 'PDF generation will be implemented soon',
      data: invoiceData
    });
  } catch (error) {
    console.error('Error processing invoice data:', error);
    return NextResponse.json(
      { error: 'Failed to process invoice data' },
      { status: 500 }
    );
  }
}