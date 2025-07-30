import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { userId } = await auth();
    const { invoiceId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userId
      },
    });

    if (!invoice || !invoice.pdfBuffer) {
      return NextResponse.json(
        { error: 'Faktura nebo PDF nebylo nalezeno' },
        { status: 404 }
      );
    }

    // Vrátit PDF jako response
    return new NextResponse(invoice.pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="faktura-${invoice.invoiceNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error fetching invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}