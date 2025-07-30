"use client"

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useTRPC } from "@/trcp/client";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Download, Eye, Calendar, CreditCard, DollarSign, Plus } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  createdAt: string;
  invoiceUrl?: string;
  invoiceId?: string;
  paymentMethod: string;
}

export default function PaymentsPage() {
  const { user } = useClerk();
  const trpc = useTRPC();

  // Fetch real payment sessions from database
  const { data: paymentSessions, isLoading: paymentsLoading } = useQuery({
    ...trpc.fitness.getPaymentSessions.queryOptions(),
    staleTime: 0, // Always fresh data
    refetchOnMount: true,
  });

  // Fetch invoices from database
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    ...trpc.fitness.getInvoices.queryOptions(),
    staleTime: 0,
    refetchOnMount: true,
  });

  // Convert payment sessions to payment format and merge with invoices
  const payments: Payment[] = paymentSessions?.map(session => {
    const relatedInvoice = invoices?.find(inv => inv.paymentSessionId === session.id);

    return {
      id: session.paymentIntentId || session.stripeSessionId,
      amount: 199, // Default amount for fitness plans
      currency: "CZK",
      status: session.status === 'completed' ? 'paid' : session.status === 'pending' ? 'pending' : 'failed',
      description: session.planName,
      createdAt: session.createdAt.toISOString(),
      paymentMethod: "Kreditní karta",
      invoiceUrl: relatedInvoice ? `/api/invoices/${relatedInvoice.id}/pdf` : undefined,
      invoiceId: relatedInvoice?.id
    };
  }) || [];

  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      paid: { variant: "default" as const, text: "Zaplaceno", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      pending: { variant: "secondary" as const, text: "Čeká na platbu", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      failed: { variant: "destructive" as const, text: "Selhalo", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      refunded: { variant: "outline" as const, text: "Vráceno", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd. MMMM yyyy", { locale: cs });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Loading state
  if (paymentsLoading || invoicesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardHeader userName={user?.firstName} />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Načítání plateb...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <DashboardHeader userName={user?.firstName} />

          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Platby a faktury</h2>
              <p className="text-muted-foreground">
                Přehled všech vašich plateb a faktur
              </p>
            </div>

          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Celkem zaplaceno</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(totalPaid, 'CZK')}</div>
                <p className="text-xs text-muted-foreground">
                  {payments.filter(p => p.status === 'paid').length} úspěšných plateb
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Čekající platby</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(pendingAmount, 'CZK')}</div>
                <p className="text-xs text-muted-foreground">
                  {payments.filter(p => p.status === 'pending').length} nevyřízených plateb
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dostupné faktury</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payments.filter(p => p.status === 'paid').length}</div>
                <p className="text-xs text-muted-foreground">
                  Z {payments.length} celkem faktur
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Historie plateb</CardTitle>
              <CardDescription>
                Seznam všech vašich plateb a faktur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faktura</TableHead>
                    <TableHead>Popis</TableHead>
                    <TableHead>Částka</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Platební metoda</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.id}
                      </TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">

                          {payment.status === 'paid' && payment.invoiceId ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                window.open(`/api/invoices/${payment.invoiceId}/pdf`, '_blank');
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : payment.status === 'paid' ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="opacity-50 cursor-not-allowed"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Faktura se generuje...</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="opacity-50 cursor-not-allowed"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Faktura bude dostupná po zaplacení.</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
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