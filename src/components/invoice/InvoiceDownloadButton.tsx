"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTRPC } from '@/trcp/client';
import { useMutation } from '@tanstack/react-query';

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
  dic?: string; // Změněno na volitelné
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

interface InvoiceDownloadButtonProps {
  invoiceData: InvoiceData;
  filename?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const InvoiceDownloadButton: React.FC<InvoiceDownloadButtonProps> = ({
  invoiceData,
  filename,
  variant = 'default',
  size = 'default'
}) => {
  const [isClient, setIsClient] = useState(false);
  const trpc = useTRPC();

      const generateInvoiceMutation = useMutation(trpc.fitness.generateInvoice.mutationOptions({
    onSuccess: async (result) => {
      console.log('Invoice generated:', result);

      // Download PDF using the API route
      if (result.downloadUrl) {
        try {
          const response = await fetch(result.downloadUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(result.data),
          });

          if (!response.ok) {
            throw new Error('Failed to generate PDF');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `faktura-${invoiceData.invoiceNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          toast.success(`Faktura ${invoiceData.invoiceNumber} byla úspěšně stažena!`);
        } catch (error) {
          console.error('Error downloading PDF:', error);
          toast.error('Chyba při stahování PDF', {
            description: 'Zkuste to prosím znovu.',
          });
        }
      } else {
        toast.success(`Faktura ${invoiceData.invoiceNumber} byla úspěšně vygenerována!`, {
          description: 'Později zde bude možnost stáhnout PDF.',
        });
      }
    },
    onError: (error) => {
      console.error('Error generating PDF:', error);
      toast.error('Chyba při generování faktury', {
        description: 'Zkuste to prosím znovu.',
      });
    },
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

          const handleDownload = () => {
    if (!isClient) return;
    generateInvoiceMutation.mutate(invoiceData);
  };

  if (!isClient) {
    return (
      <Button variant={variant} size={size} disabled>
        <Download className="w-4 h-4 mr-2" />
        Načítání...
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={generateInvoiceMutation.isPending}
      onClick={handleDownload}
    >
      <Download className="w-4 h-4 mr-2" />
      {generateInvoiceMutation.isPending ? 'Generuji PDF...' : 'Stáhnout fakturu'}
    </Button>
  );
};