import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, DollarSign, Clock, AlertTriangle, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import InvoiceForm from "@/components/invoice/invoice-form";
import InvoicePreview from "@/components/invoice/invoice-preview";
import { type InvoiceWithLineItems } from "@shared/schema";

export default function Dashboard() {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithLineItems | null>(null);

  // Get company info from settings
  const getCompanyInfo = () => {
    const stored = localStorage.getItem("invoiceSettings_profile");
    return stored ? JSON.parse(stored) : {
      companyName: "Your Company Name",
      ownerName: "",
      logo: ""
    };
  };

  const companyInfo = getCompanyInfo();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalInvoices: number;
    totalRevenue: string;
    pendingInvoices: number;
    overdueInvoices: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<InvoiceWithLineItems[]>({
    queryKey: ["/api/invoices"],
  });

  const recentInvoices = invoices?.slice(0, 5) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-100 text-emerald-800" data-testid={`status-${status}`}>Paid</Badge>;
      case "sent":
        return <Badge className="bg-amber-100 text-amber-800" data-testid={`status-${status}`}>Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800" data-testid={`status-${status}`}>Overdue</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800" data-testid={`status-${status}`}>Draft</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (statsLoading || invoicesLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-48 mb-8"></div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-5 rounded-lg shadow">
                    <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto" data-testid="dashboard-main">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            {/* Dashboard Header */}
            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl" data-testid="page-title">
                  Dashboard
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Welcome back{companyInfo.ownerName ? `, ${companyInfo.ownerName}` : ''}! Here's an overview of your business activity.
                </p>
              </div>
              {companyInfo.logo && (
                <div className="mt-4 md:mt-0">
                  <img 
                    src={companyInfo.logo} 
                    alt={`${companyInfo.companyName} logo`}
                    className="h-16 w-auto object-contain"
                    data-testid="company-logo"
                  />
                </div>
              )}
            </div>

            {/* Create Invoice Button */}
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => setShowInvoiceForm(true)}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-create-invoice"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <div className="text-sm font-medium text-slate-500">Total Invoices</div>
                        <div className="text-lg font-medium text-slate-900" data-testid="stat-total-invoices">
                          {stats?.totalInvoices || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <div className="text-sm font-medium text-slate-500">Total Revenue</div>
                        <div className="text-lg font-medium text-slate-900" data-testid="stat-total-revenue">
                          ${stats?.totalRevenue || "0.00"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-amber-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <div className="text-sm font-medium text-slate-500">Pending</div>
                        <div className="text-lg font-medium text-slate-900" data-testid="stat-pending-invoices">
                          {stats?.pendingInvoices || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <div className="text-sm font-medium text-slate-500">Overdue</div>
                        <div className="text-lg font-medium text-slate-900" data-testid="stat-overdue-invoices">
                          {stats?.overdueInvoices || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentInvoices.length === 0 ? (
                    <div className="text-center py-8" data-testid="empty-invoices">
                      <FileText className="mx-auto h-12 w-12 text-slate-400" />
                      <h3 className="mt-2 text-sm font-medium text-slate-900">No invoices yet</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Get started by creating your first invoice.
                      </p>
                      <div className="mt-6">
                        <Button 
                          onClick={() => setShowInvoiceForm(true)}
                          className="bg-primary hover:bg-primary/90"
                          data-testid="button-create-first-invoice"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Invoice
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentInvoices.map((invoice) => (
                          <TableRow key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                            <TableCell className="font-medium text-primary">
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="hover:underline"
                                data-testid={`link-invoice-${invoice.invoiceNumber}`}
                              >
                                {invoice.invoiceNumber}
                              </button>
                            </TableCell>
                            <TableCell data-testid={`client-name-${invoice.id}`}>
                              {invoice.clientName}
                            </TableCell>
                            <TableCell data-testid={`amount-${invoice.id}`}>
                              ${invoice.total}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(invoice.status)}
                            </TableCell>
                            <TableCell className="text-slate-500" data-testid={`date-${invoice.id}`}>
                              {formatDate(invoice.issueDate)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <InvoiceForm 
        open={showInvoiceForm} 
        onOpenChange={setShowInvoiceForm}
      />

      <InvoicePreview 
        invoice={selectedInvoice}
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      />
    </>
  );
}
