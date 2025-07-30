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

    // Zkontrolovat, zda je uživatel admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || !invoice.pdfBuffer) {
      return NextResponse.json(
        { error: 'Faktura nebo PDF nebylo nalezeno' },
        { status: 404 }
      );
    }

    // Označit jako stažené
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        downloadedAt: new Date(),
        downloadedBy: userId,
      },
    });

    // Vrátit PDF jako response
    return new NextResponse(invoice.pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="faktura-${invoice.invoiceNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error fetching admin invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}