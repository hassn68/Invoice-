import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { createInvoiceSchema, type CreateInvoiceRequest, type Client } from "@shared/schema";
import LineItemRow from "./line-item-row";

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type LineItemFormData = {
  description: string;
  quantity: number;
  rate: number;
};

export default function InvoiceForm({ open, onOpenChange }: InvoiceFormProps) {
  const [lineItems, setLineItems] = useState<LineItemFormData[]>([
    { description: "", quantity: 1, rate: 0 }
  ]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const { toast } = useToast();

  const { data: nextNumberResponse } = useQuery<{ nextNumber: string }>({
    queryKey: ["/api/invoices/next-number"],
    enabled: open,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: open,
  });

  // Get default values from settings
  const getDefaultValues = () => {
    const stored = localStorage.getItem("invoiceSettings_invoice");
    const defaults = stored ? JSON.parse(stored) : { taxRate: 0, notes: "" };
    
    return {
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      taxRate: defaults.taxRate || 0,
      notes: defaults.notes || "",
      lineItems: [{ description: "", quantity: 1, rate: 0 }],
    };
  };

  const form = useForm<CreateInvoiceRequest>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: getDefaultValues(),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: CreateInvoiceRequest) => {
      return await apiRequest("POST", "/api/invoices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Invoice created",
        description: "Your invoice has been created successfully.",
      });
      onOpenChange(false);
      form.reset();
      setLineItems([{ description: "", quantity: 1, rate: 0 }]);
      setSelectedClientId("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addLineItem = () => {
    const newItem = { description: "", quantity: 1, rate: 0 };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItemFormData, value: string | number) => {
    const updated = lineItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => 
      sum + (item.quantity * item.rate), 0
    );
    const taxRate = form.watch("taxRate") || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const onSubmit = (data: CreateInvoiceRequest) => {
    const formData = { ...data, lineItems };
    createInvoiceMutation.mutate(formData);
  };

  useEffect(() => {
    if (open) {
      form.setValue("lineItems", lineItems);
    }
  }, [lineItems, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="invoice-form-dialog">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">Create New Invoice</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Invoice Number
                </label>
                <Input
                  value={nextNumberResponse?.nextNumber || ""}
                  disabled
                  className="bg-slate-50"
                  data-testid="input-invoice-number"
                />
              </div>
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        data-testid="input-issue-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client Information */}
            <div>
              <h4 className="text-md font-medium text-slate-900 mb-4">Client Information</h4>
              
              {/* Client Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Existing Client (Optional)
                </label>
                <Select
                  value={selectedClientId}
                  onValueChange={(value) => {
                    setSelectedClientId(value);
                    if (value) {
                      const client = clients.find(c => c.id === value);
                      if (client) {
                        form.setValue("clientName", client.name);
                        form.setValue("clientEmail", client.email);
                        form.setValue("clientAddress", client.address || "");
                      }
                    } else {
                      form.setValue("clientName", "");
                      form.setValue("clientEmail", "");
                      form.setValue("clientAddress", "");
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-client">
                    <SelectValue placeholder="Choose from existing clients or enter manually below" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter client name"
                          {...field}
                          data-testid="input-client-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="client@company.com"
                          {...field}
                          data-testid="input-client-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="clientAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter billing address"
                            rows={3}
                            {...field}
                            data-testid="input-client-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-slate-900">Line Items</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  data-testid="button-add-line-item"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <LineItemRow
                    key={index}
                    item={item}
                    index={index}
                    onUpdate={updateLineItem}
                    onRemove={removeLineItem}
                    canRemove={lineItems.length > 1}
                  />
                ))}
              </div>
            </div>

            {/* Invoice Totals */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Subtotal:</span>
                <span className="text-sm font-medium text-slate-900" data-testid="subtotal-amount">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-sm text-slate-600 mr-2">Tax:</span>
                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            step="0.1"
                            min="0"
                            max="100"
                            className="w-16 h-8 text-xs"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-tax-rate"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="text-sm text-slate-600 ml-1">%</span>
                </div>
                <span className="text-sm font-medium text-slate-900" data-testid="tax-amount">
                  ${taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-base font-semibold text-slate-900">Total:</span>
                <span className="text-base font-bold text-slate-900" data-testid="total-amount">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or payment terms..."
                      rows={3}
                      {...field}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInvoiceMutation.isPending}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-create-invoice"
              >
                {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
