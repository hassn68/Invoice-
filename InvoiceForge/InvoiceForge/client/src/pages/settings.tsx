import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
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
import { 
  User, 
  Building, 
  Lock, 
  Bell, 
  Palette,
  FileText,
  DollarSign,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const profileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const invoiceSettingsSchema = z.object({
  defaultTaxRate: z.number().min(0).max(100),
  currency: z.string(),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  paymentTerms: z.string(),
  notes: z.string().optional(),
  autoSendReminders: z.boolean(),
  reminderDays: z.number().min(1).max(365),
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;
type InvoiceSettingsData = z.infer<typeof invoiceSettingsSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  // Load from localStorage or set defaults
  const getStoredData = (key: string, defaultData: any) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  };

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: getStoredData("invoiceSettings_profile", {
      companyName: "Your Company Name",
      ownerName: "",
      email: "",
      phone: "",
      address: "123 Business St\nCity, State 12345",
      website: "",
      logo: "",
    }),
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const invoiceForm = useForm<InvoiceSettingsData>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: getStoredData("invoiceSettings_invoice", {
      defaultTaxRate: 0,
      currency: "USD",
      invoicePrefix: "INV",
      paymentTerms: "Net 30",
      notes: "Thank you for your business!",
      autoSendReminders: false,
      reminderDays: 7,
    }),
  });

  const onProfileSubmit = (data: ProfileData) => {
    localStorage.setItem("invoiceSettings_profile", JSON.stringify(data));
    toast({
      title: "Profile updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  const onPasswordSubmit = (data: PasswordData) => {
    // In a real app, this would make an API call
    localStorage.setItem("lastPasswordChange", new Date().toISOString());
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
    passwordForm.reset();
  };

  const onInvoiceSubmit = (data: InvoiceSettingsData) => {
    localStorage.setItem("invoiceSettings_invoice", JSON.stringify(data));
    toast({
      title: "Invoice settings updated",
      description: "Your invoice preferences have been saved successfully.",
    });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "invoice", label: "Invoice Settings", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <main className="flex-1 overflow-y-auto" data-testid="settings-main">
      <div className="py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl" data-testid="page-title">
              Settings
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Manage your account settings, company profile, and invoice preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <nav className="space-y-1" data-testid="settings-nav">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                      data-testid={`tab-${tab.id}`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <Card data-testid="profile-settings">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      Company Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your Company Name" {...field} data-testid="input-company-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="ownerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Owner Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your Full Name" {...field} data-testid="input-owner-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="contact@company.com" {...field} data-testid="input-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={profileForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Address</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="123 Business St&#10;City, State 12345"
                                  rows={3}
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://yourcompany.com" {...field} data-testid="input-website" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="logo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Logo URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/logo.png" {...field} data-testid="input-logo" />
                                </FormControl>
                                <FormDescription>
                                  Enter a URL to your company logo image
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Logo Preview */}
                        {profileForm.watch("logo") && (
                          <div className="mt-4">
                            <FormLabel>Logo Preview</FormLabel>
                            <div className="mt-2 p-4 border rounded-lg bg-slate-50">
                              <img 
                                src={profileForm.watch("logo")} 
                                alt="Company logo preview"
                                className="h-16 w-auto object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                                data-testid="logo-preview"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-4">
                          <Button type="submit" data-testid="button-save-profile">
                            <Save className="mr-2 h-4 w-4" />
                            Save Profile
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {activeTab === "password" && (
                <Card data-testid="password-settings">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="mr-2 h-5 w-5" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} data-testid="input-current-password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} data-testid="input-new-password" />
                                </FormControl>
                                <FormDescription>
                                  Must be at least 6 characters long
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} data-testid="input-confirm-password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button type="submit" data-testid="button-change-password">
                            <Lock className="mr-2 h-4 w-4" />
                            Change Password
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {activeTab === "invoice" && (
                <Card data-testid="invoice-settings">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Invoice Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...invoiceForm}>
                      <form onSubmit={invoiceForm.handleSubmit(onInvoiceSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={invoiceForm.control}
                            name="defaultTaxRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Tax Rate (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    data-testid="input-tax-rate"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={invoiceForm.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-currency">
                                      <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                                    <SelectItem value="PKR">PKR (₨)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={invoiceForm.control}
                            name="invoicePrefix"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Invoice Number Prefix</FormLabel>
                                <FormControl>
                                  <Input placeholder="INV" {...field} data-testid="input-invoice-prefix" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={invoiceForm.control}
                          name="paymentTerms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Payment Terms</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-payment-terms">
                                    <SelectValue placeholder="Select payment terms" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                                  <SelectItem value="Net 15">Net 15</SelectItem>
                                  <SelectItem value="Net 30">Net 30</SelectItem>
                                  <SelectItem value="Net 60">Net 60</SelectItem>
                                  <SelectItem value="Net 90">Net 90</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={invoiceForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Invoice Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Thank you for your business!"
                                  rows={3}
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-invoice-notes"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Reminder Settings</h4>
                          
                          <div className="flex items-center space-x-2">
                            <FormField
                              control={invoiceForm.control}
                              name="autoSendReminders"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      data-testid="switch-auto-reminders"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Auto-send payment reminders</FormLabel>
                                    <FormDescription>
                                      Automatically send reminders for overdue invoices
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={invoiceForm.control}
                            name="reminderDays"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Send reminders after (days)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1"
                                    max="365"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 7)}
                                    data-testid="input-reminder-days"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button type="submit" data-testid="button-save-invoice-settings">
                            <Save className="mr-2 h-4 w-4" />
                            Save Invoice Settings
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {activeTab === "notifications" && (
                <Card data-testid="notification-settings">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Email Notifications</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">New invoice created</div>
                              <div className="text-sm text-slate-500">Get notified when a new invoice is created</div>
                            </div>
                            <Switch defaultChecked data-testid="switch-new-invoice" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Payment received</div>
                              <div className="text-sm text-slate-500">Get notified when payments are received</div>
                            </div>
                            <Switch defaultChecked data-testid="switch-payment-received" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Invoice overdue</div>
                              <div className="text-sm text-slate-500">Get notified when invoices become overdue</div>
                            </div>
                            <Switch defaultChecked data-testid="switch-invoice-overdue" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Weekly summary</div>
                              <div className="text-sm text-slate-500">Receive a weekly summary of your invoices</div>
                            </div>
                            <Switch data-testid="switch-weekly-summary" />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Browser Notifications</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Desktop notifications</div>
                              <div className="text-sm text-slate-500">Show browser notifications for important events</div>
                            </div>
                            <Switch data-testid="switch-desktop-notifications" />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button data-testid="button-save-notifications">
                          <Save className="mr-2 h-4 w-4" />
                          Save Notification Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}