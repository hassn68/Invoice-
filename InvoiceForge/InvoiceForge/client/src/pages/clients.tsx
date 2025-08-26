import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  ArrowUpDown,
  Users
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ClientForm from "@/components/client/client-form";
import { type Client } from "@shared/schema";

export default function Clients() {
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client deleted",
        description: "The client has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredClients = clients.filter((client) => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      deleteClientMutation.mutate(client.id);
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCloseForm = () => {
    setShowClientForm(false);
    setEditingClient(null);
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-48 mb-8"></div>
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto" data-testid="clients-main">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl" data-testid="page-title">
                  Clients
                </h2>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Button 
                  onClick={() => setShowClientForm(true)}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-create-client"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Client
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="max-w-sm">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clients Table */}
            <div className="mt-6">
              <Card>
                <CardContent className="p-0">
                  {filteredClients.length === 0 ? (
                    <div className="text-center py-12" data-testid="empty-clients">
                      <Users className="mx-auto h-12 w-12 text-slate-400" />
                      <h3 className="mt-2 text-sm font-medium text-slate-900">No clients found</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {searchTerm 
                          ? "Try adjusting your search criteria."
                          : "Get started by adding your first client."
                        }
                      </p>
                      {!searchTerm && (
                        <div className="mt-6">
                          <Button 
                            onClick={() => setShowClientForm(true)}
                            className="bg-primary hover:bg-primary/90"
                            data-testid="button-create-first-client"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Client
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Button variant="ghost" className="h-auto p-0 font-medium">
                              Name
                              <ArrowUpDown className="ml-2 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>
                            <Button variant="ghost" className="h-auto p-0 font-medium">
                              Created
                              <ArrowUpDown className="ml-2 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClients.map((client) => (
                          <TableRow key={client.id} data-testid={`client-row-${client.id}`}>
                            <TableCell className="font-medium" data-testid={`client-name-${client.id}`}>
                              {client.name}
                            </TableCell>
                            <TableCell className="text-slate-600" data-testid={`client-email-${client.id}`}>
                              {client.email}
                            </TableCell>
                            <TableCell className="text-slate-600 max-w-xs truncate" data-testid={`client-address-${client.id}`}>
                              {client.address || "—"}
                            </TableCell>
                            <TableCell className="text-slate-500" data-testid={`client-date-${client.id}`}>
                              {client.createdAt ? formatDate(client.createdAt) : "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClient(client)}
                                  data-testid={`button-edit-${client.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClient(client)}
                                  className="text-red-600 hover:text-red-800"
                                  disabled={deleteClientMutation.isPending}
                                  data-testid={`button-delete-${client.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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

      <ClientForm 
        open={showClientForm} 
        onOpenChange={handleCloseForm}
        client={editingClient}
      />
    </>
  );
}