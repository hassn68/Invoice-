import { 
  type Client, 
  type Invoice, 
  type LineItem, 
  type InsertClient, 
  type InsertInvoice, 
  type InsertLineItem,
  type InvoiceWithLineItems,
  type CreateInvoiceRequest
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Client operations
  getClient(id: string): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  getAllClients(): Promise<Client[]>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Invoice operations
  getInvoice(id: string): Promise<InvoiceWithLineItems | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithLineItems | undefined>;
  createInvoice(invoiceData: CreateInvoiceRequest): Promise<InvoiceWithLineItems>;
  getAllInvoices(): Promise<InvoiceWithLineItems[]>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getNextInvoiceNumber(): Promise<string>;

  // Line item operations
  getLineItemsByInvoiceId(invoiceId: string): Promise<LineItem[]>;
  createLineItem(lineItem: InsertLineItem): Promise<LineItem>;
  updateLineItem(id: string, lineItem: Partial<InsertLineItem>): Promise<LineItem | undefined>;
  deleteLineItem(id: string): Promise<boolean>;

  // Statistics
  getInvoiceStats(): Promise<{
    totalInvoices: number;
    totalRevenue: string;
    pendingInvoices: number;
    overdueInvoices: number;
  }>;
}

export class MemStorage implements IStorage {
  private clients: Map<string, Client> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private lineItems: Map<string, LineItem> = new Map();
  private invoiceCounter: number = 1;

  constructor() {
    // Initialize with some sample data if needed
  }

  // Client operations
  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(client => client.email === email);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = {
      ...insertClient,
      id,
      address: insertClient.address || null,
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateClient(id: string, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;

    const updated: Client = { ...existing, ...clientData };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Invoice operations
  async getInvoice(id: string): Promise<InvoiceWithLineItems | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const lineItems = await this.getLineItemsByInvoiceId(id);
    return { ...invoice, lineItems };
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithLineItems | undefined> {
    const invoice = Array.from(this.invoices.values()).find(inv => inv.invoiceNumber === invoiceNumber);
    if (!invoice) return undefined;

    const lineItems = await this.getLineItemsByInvoiceId(invoice.id);
    return { ...invoice, lineItems };
  }

  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<InvoiceWithLineItems> {
    const id = randomUUID();
    const invoiceNumber = await this.getNextInvoiceNumber();
    
    // Calculate totals
    const lineItemsWithAmounts = invoiceData.lineItems.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));
    
    const subtotal = lineItemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + taxAmount;

    const invoice: Invoice = {
      id,
      invoiceNumber,
      clientId: null,
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      clientAddress: invoiceData.clientAddress || null,
      issueDate: invoiceData.issueDate,
      dueDate: invoiceData.dueDate || null,
      status: "draft",
      subtotal: subtotal.toFixed(2),
      taxRate: invoiceData.taxRate.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      notes: invoiceData.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invoices.set(id, invoice);

    // Create line items
    const createdLineItems: LineItem[] = [];
    for (const item of lineItemsWithAmounts) {
      const lineItem = await this.createLineItem({
        invoiceId: id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate.toFixed(2),
        amount: item.amount.toFixed(2),
      });
      createdLineItems.push(lineItem);
    }

    return { ...invoice, lineItems: createdLineItems };
  }

  async getAllInvoices(): Promise<InvoiceWithLineItems[]> {
    const invoicesWithLineItems: InvoiceWithLineItems[] = [];
    
    for (const invoice of Array.from(this.invoices.values())) {
      const lineItems = await this.getLineItemsByInvoiceId(invoice.id);
      invoicesWithLineItems.push({ ...invoice, lineItems });
    }

    return invoicesWithLineItems.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateInvoice(id: string, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existing = this.invoices.get(id);
    if (!existing) return undefined;

    const updated: Invoice = { 
      ...existing, 
      ...invoiceData,
      updatedAt: new Date()
    };
    this.invoices.set(id, updated);
    return updated;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    // Delete associated line items first
    const lineItems = await this.getLineItemsByInvoiceId(id);
    for (const item of lineItems) {
      this.lineItems.delete(item.id);
    }
    
    return this.invoices.delete(id);
  }

  async getNextInvoiceNumber(): Promise<string> {
    const existingNumbers = Array.from(this.invoices.values())
      .map(inv => inv.invoiceNumber)
      .filter(num => num.startsWith('INV-'))
      .map(num => parseInt(num.replace('INV-', '')))
      .filter(num => !isNaN(num));

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `INV-${String(maxNumber + 1).padStart(3, '0')}`;
  }

  // Line item operations
  async getLineItemsByInvoiceId(invoiceId: string): Promise<LineItem[]> {
    return Array.from(this.lineItems.values()).filter(item => item.invoiceId === invoiceId);
  }

  async createLineItem(insertLineItem: InsertLineItem): Promise<LineItem> {
    const id = randomUUID();
    const lineItem: LineItem = { 
      ...insertLineItem, 
      id,
      quantity: insertLineItem.quantity || 1,
      rate: insertLineItem.rate || "0",
      amount: insertLineItem.amount || "0"
    };
    this.lineItems.set(id, lineItem);
    return lineItem;
  }

  async updateLineItem(id: string, lineItemData: Partial<InsertLineItem>): Promise<LineItem | undefined> {
    const existing = this.lineItems.get(id);
    if (!existing) return undefined;

    const updated: LineItem = { ...existing, ...lineItemData };
    this.lineItems.set(id, updated);
    return updated;
  }

  async deleteLineItem(id: string): Promise<boolean> {
    return this.lineItems.delete(id);
  }

  // Statistics
  async getInvoiceStats(): Promise<{
    totalInvoices: number;
    totalRevenue: string;
    pendingInvoices: number;
    overdueInvoices: number;
  }> {
    const allInvoices = Array.from(this.invoices.values());
    
    const totalInvoices = allInvoices.length;
    const totalRevenue = allInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0)
      .toFixed(2);
    
    const pendingInvoices = allInvoices.filter(inv => inv.status === 'sent').length;
    const overdueInvoices = allInvoices.filter(inv => inv.status === 'overdue').length;

    return {
      totalInvoices,
      totalRevenue,
      pendingInvoices,
      overdueInvoices,
    };
  }
}

export const storage = new MemStorage();
