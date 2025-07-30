"use client"

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useTRPC } from "@/trcp/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Download, Search, Eye, Calendar, DollarSign, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RestrictedAccess } from "@/components/ui/restricted-access";

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  paid: boolean;
  createdAt: Date;
  downloadedAt: Date | null;
  downloadedBy: string | null;
  customer: any;
  paymentSession: {
    planName: string;
    status: string;
  } | null;
}

export default function AdminInvoicesPage() {
  const { user } = useClerk();
  const trpc = useTRPC();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all invoices
  const { data: invoices, isLoading, refetch, error } = useQuery({
    ...trpc.fitness.getAllInvoices.queryOptions(),
    staleTime: 0,
    refetchOnMount: true,
    retry: false, // Don't retry on error
  });

  const filteredInvoices = invoices?.filter((invoice: Invoice) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.customer?.name?.toLowerCase().includes(searchLower) ||
      invoice.paymentSession?.planName?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd. MMMM yyyy", { locale: cs });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount);
  };

  const handleDownload = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `faktura-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Refresh data to update download status
        refetch();
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  // Error state - Access denied
  if (error) {
    return (
      <RestrictedAccess
        title="Přístup odepřen"
        message="Nemáte oprávnění k přístupu k této stránce. Vyžadována je admin role."
        icon="shield"
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Načítání faktur...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalInvoices = invoices?.length || 0;
  const totalAmount = invoices?.reduce((sum, inv) => sum + inv.totalAmount, 0) || 0;
  const downloadedInvoices = invoices?.filter(inv => inv.downloadedAt).length || 0;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Správa faktur</h2>
              <p className="text-muted-foreground">
                Přehled všech faktur všech uživatelů
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Celkem faktur</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  Všechny vygenerované faktury
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Celková částka</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(totalAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  Součet všech faktur
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stažené faktury</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{downloadedInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  Z {totalInvoices} celkem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nestažené</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvoices - downloadedInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  Čekají na stažení
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Faktury</CardTitle>
              <CardDescription>
                Seznam všech faktur s možností vyhledávání a stažení
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hledat podle čísla faktury, zákazníka nebo plánu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Číslo faktury</TableHead>
                    <TableHead>Zákazník</TableHead>
                    <TableHead>Plán</TableHead>
                    <TableHead>Částka</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum vytvoření</TableHead>
                    <TableHead>Staženo</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {invoice.customer?.name || "Neznámý zákazník"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.paymentSession?.planName || "Neznámý plán"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(invoice.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.paid ? "default" : "secondary"}>
                          {invoice.paid ? "Zaplaceno" : "Nezaplaceno"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(invoice.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.downloadedAt ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600">
                              Staženo
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(invoice.downloadedAt)}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-orange-600">
                            Nestaženo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(invoice.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}