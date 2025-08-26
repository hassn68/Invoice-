import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";
import { type InvoiceWithLineItems } from "@shared/schema";

interface InvoicePreviewProps {
  invoice: InvoiceWithLineItems | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InvoicePreview({ invoice, open, onOpenChange }: InvoicePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  // Get company info from settings
  const getCompanyInfo = () => {
    const stored = localStorage.getItem("invoiceSettings_profile");
    return stored ? JSON.parse(stored) : {
      companyName: "Your Company Name",
      address: "123 Business St\nCity, State 12345",
      email: "contact@yourcompany.com",
      phone: "(555) 123-4567"
    };
  };

  const companyInfo = getCompanyInfo();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (printRef.current) {
      generatePDF(printRef.current, `${invoice.invoiceNumber}.pdf`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0" data-testid="invoice-preview-dialog">
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 print:hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle data-testid="preview-dialog-title">Invoice Preview</DialogTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  data-testid="button-download-pdf"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  data-testid="button-print"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-close-preview"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Invoice Content */}
        <div className="bg-white print:shadow-none overflow-y-auto">
          <div ref={printRef} className="max-w-3xl mx-auto p-8 print:p-0" data-testid="invoice-content">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900" data-testid="invoice-title">INVOICE</h1>
                <div className="mt-2 text-slate-600">
                  <p><strong>Invoice #:</strong> <span data-testid="invoice-number-display">{invoice.invoiceNumber}</span></p>
                  <p><strong>Date:</strong> <span data-testid="invoice-date-display">{formatDate(invoice.issueDate)}</span></p>
                  {invoice.dueDate && (
                    <p><strong>Due Date:</strong> <span data-testid="due-date-display">{formatDate(invoice.dueDate)}</span></p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-4">
                  {companyInfo.logo && (
                    <img 
                      src={companyInfo.logo} 
                      alt={`${companyInfo.companyName} logo`}
                      className="h-12 w-auto object-contain mr-4"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-slate-900">{companyInfo.companyName}</h2>
                </div>
                <div className="mt-2 text-slate-600">
                  {companyInfo.address && (
                    <div className="whitespace-pre-line">
                      {companyInfo.address}
                    </div>
                  )}
                  {companyInfo.email && <p>{companyInfo.email}</p>}
                  {companyInfo.phone && <p>{companyInfo.phone}</p>}
                  {companyInfo.website && <p>{companyInfo.website}</p>}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Bill To:</h3>
              <div className="text-slate-700">
                <p className="font-medium" data-testid="bill-to-name">{invoice.clientName}</p>
                <p data-testid="bill-to-email">{invoice.clientEmail}</p>
                {invoice.clientAddress && (
                  <div className="whitespace-pre-line" data-testid="bill-to-address">
                    {invoice.clientAddress}
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead className="border-b-2 border-slate-300">
                  <tr>
                    <th className="text-left py-3 font-semibold text-slate-900">Description</th>
                    <th className="text-center py-3 font-semibold text-slate-900">Qty</th>
                    <th className="text-right py-3 font-semibold text-slate-900">Rate</th>
                    <th className="text-right py-3 font-semibold text-slate-900">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoice.lineItems.map((item, index) => (
                    <tr key={item.id} data-testid={`line-item-${index}`}>
                      <td className="py-3 text-slate-700" data-testid={`item-description-${index}`}>
                        {item.description}
                      </td>
                      <td className="py-3 text-center text-slate-700" data-testid={`item-quantity-${index}`}>
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-slate-700" data-testid={`item-rate-${index}`}>
                        ${parseFloat(item.rate).toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-slate-700" data-testid={`item-amount-${index}`}>
                        ${parseFloat(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-900" data-testid="preview-subtotal">
                    ${parseFloat(invoice.subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Tax ({parseFloat(invoice.taxRate).toFixed(1)}%):</span>
                  <span className="text-slate-900" data-testid="preview-tax">
                    ${parseFloat(invoice.taxAmount).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-slate-900">Total:</span>
                    <span className="text-lg font-bold text-slate-900" data-testid="preview-total">
                      ${parseFloat(invoice.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            {invoice.notes && (
              <div className="mt-8 text-sm text-slate-600">
                <p><strong>Notes:</strong></p>
                <div className="whitespace-pre-line mt-1" data-testid="invoice-notes">
                  {invoice.notes}
                </div>
              </div>
            )}

            <div className="mt-8 text-sm text-slate-600">
              <p><strong>Payment Terms:</strong> Net 30</p>
              <p className="mt-1">Thank you for your business!</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
