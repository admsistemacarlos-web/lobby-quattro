import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, Trash2, Edit2, Search, Plus, Home, MapPin, Bed, Car, Phone, Mail, Tag, Eye, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Tipos
interface Client {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  pref_location: string | null;
  pref_min_bedrooms: number | null;
  property_type: string | null;
  purpose: string | null;
  budget_min: number | null;
  budget_max: number | null;
  pref_min_parking: number | null;
  accepts_financing: boolean | null;
  down_payment_value: number | null;
  status: string | null;
  origin: string | null;
  notes: string | null;
  corretor_id: string | null;
}

interface Property {
  id: string;
  title: string;
  property_type: string | null;
  price: number | null;
  bedrooms: number | null;
  parking_spots: number | null;
  neighborhood: string | null;
  location: string | null;
  city: string | null;
  status: string | null;
}

// Valores padrão
const emptyClient = {
  name: "",
  phone: "",
  email: "",
  property_type: "",
  purpose: "",
  pref_location: "",
  pref_min_bedrooms: "",
  pref_min_parking: "",
  budget_min: "",
  budget_max: "",
  accepts_financing: "",
  down_payment_value: "",
  status: "novo",
  origin: "",
  notes: "",
};

// Opções dos selects
const propertyTypes = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
  { value: "rural", label: "Rural" },
];

const purposes = [
  { value: "moradia", label: "Moradia" },
  { value: "investimento", label: "Investimento" },
];

const statusOptions = [
  { value: "novo", label: "Novo", color: "bg-green-500" },
  { value: "em_contato", label: "Em Contato", color: "bg-yellow-500" },
  { value: "visitou", label: "Visitou Imóvel", color: "bg-blue-500" },
  { value: "negociando", label: "Negociando", color: "bg-orange-500" },
  { value: "fechado", label: "Fechado", color: "bg-emerald-600" },
  { value: "perdido", label: "Perdido", color: "bg-red-500" },
];

const originOptions = [
  { value: "indicacao", label: "Indicação" },
  { value: "site", label: "Site" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "placa", label: "Placa" },
  { value: "portais", label: "Portais (OLX, ZAP, etc)" },
  { value: "landing", label: "Landing Page" },
  { value: "outro", label: "Outro" },
];

const financingOptions = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
];

interface ClientsProps {
  onNavigateToFilteredProperties?: (propertyIds: string[], clientName: string) => void;
}

export default function Clients({ onNavigateToFilteredProperties }: ClientsProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(emptyClient);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [corretorId, setCorretorId] = useState<string | null>(null);
  const [selectedClientMatches, setSelectedClientMatches] = useState<Property[]>([]);
  const [selectedClientName, setSelectedClientName] = useState("");

  // Estados dos filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPropertyType, setFilterPropertyType] = useState<string>("all");
  const [filterOrigin, setFilterOrigin] = useState<string>("all");
  const [filterBudgetMin, setFilterBudgetMin] = useState<string>("");
  const [filterBudgetMax, setFilterBudgetMax] = useState<string>("");

  // Buscar corretor_id do usuário logado
  useEffect(() => {
    async function getCorretorId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("corretores")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (data) setCorretorId(data.id);
      }
    }
    getCorretorId();
  }, []);

  // Buscar clientes e imóveis quando tiver corretor_id
  useEffect(() => {
    if (corretorId) {
      fetchClients();
      fetchProperties();
    }
  }, [corretorId]);

  async function fetchClients() {
    const { data, error } = await supabase
      .from("clients" as any)
      .select("*")
      .eq("corretor_id", corretorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar:", error);
      toast.error("Erro ao carregar clientes");
    } else {
      setClients((data as unknown as Client[]) || []);
    }
  }

  async function fetchProperties() {
    const { data, error } = await supabase
      .from("properties" as any)
      .select("*")
      .eq("corretor_id", corretorId)
      .eq("status", "disponivel")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar imóveis:", error);
    } else {
      setProperties((data as unknown as Property[]) || []);
    }
  }

  // Função para encontrar imóveis compatíveis com um cliente
  function findMatchingProperties(client: Client): Property[] {
    return properties.filter((prop) => {
      let matches = true;

      if (client.pref_location && prop.neighborhood) {
        const clientLocation = client.pref_location.toLowerCase();
        const propLocation = prop.neighborhood.toLowerCase();
        if (!propLocation.includes(clientLocation) && !clientLocation.includes(propLocation)) {
          matches = false;
        }
      } else if (client.pref_location && prop.location) {
        const clientLocation = client.pref_location.toLowerCase();
        const propLocation = prop.location.toLowerCase();
        if (!propLocation.includes(clientLocation) && !clientLocation.includes(propLocation)) {
          matches = false;
        }
      }

      if (client.property_type && prop.property_type) {
        if (client.property_type !== prop.property_type) {
          matches = false;
        }
      }

      if (client.pref_min_bedrooms && prop.bedrooms) {
        if (prop.bedrooms < client.pref_min_bedrooms) {
          matches = false;
        }
      }

      if (client.pref_min_parking && prop.parking_spots) {
        if (prop.parking_spots < client.pref_min_parking) {
          matches = false;
        }
      }

      if (prop.price) {
        if (client.budget_min && prop.price < client.budget_min) {
          matches = false;
        }
        if (client.budget_max && prop.price > client.budget_max) {
          matches = false;
        }
      }

      return matches;
    });
  }

  // Abrir modal de matches
  function openMatchModal(client: Client) {
    const matches = findMatchingProperties(client);
    setSelectedClientMatches(matches);
    setSelectedClientName(client.name);
    setIsMatchModalOpen(true);
  }

  // Navegar para imóveis filtrados
  function handleViewFilteredProperties() {
    if (onNavigateToFilteredProperties && selectedClientMatches.length > 0) {
      const propertyIds = selectedClientMatches.map(p => p.id);
      onNavigateToFilteredProperties(propertyIds, selectedClientName);
      setIsMatchModalOpen(false);
    }
  }

  // Limpar filtros
  function clearFilters() {
    setFilterStatus("all");
    setFilterPropertyType("all");
    setFilterOrigin("all");
    setFilterBudgetMin("");
    setFilterBudgetMax("");
  }

  // Contar filtros ativos
  function countActiveFilters() {
    let count = 0;
    if (filterStatus !== "all") count++;
    if (filterPropertyType !== "all") count++;
    if (filterOrigin !== "all") count++;
    if (filterBudgetMin) count++;
    if (filterBudgetMax) count++;
    return count;
  }

  // Filtrar clientes
  const filteredClients = clients.filter((client) => {
    // Filtro por busca de texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (
        client.name.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.pref_location?.toLowerCase().includes(term)
      );
      if (!matchesSearch) return false;
    }

    // Filtro por status
    if (filterStatus !== "all" && client.status !== filterStatus) {
      return false;
    }

    // Filtro por tipo de imóvel
    if (filterPropertyType !== "all" && client.property_type !== filterPropertyType) {
      return false;
    }

    // Filtro por origem
    if (filterOrigin !== "all" && client.origin !== filterOrigin) {
      return false;
    }

    // Filtro por orçamento mínimo
    if (filterBudgetMin) {
      const minValue = parseFloat(filterBudgetMin);
      if (client.budget_max && client.budget_max < minValue) {
        return false;
      }
    }

    // Filtro por orçamento máximo
    if (filterBudgetMax) {
      const maxValue = parseFloat(filterBudgetMax);
      if (client.budget_min && client.budget_min > maxValue) {
        return false;
      }
    }

    return true;
  });

  // Abrir modal para novo cliente
  function openNewClientModal() {
    setFormData(emptyClient);
    setEditingId(null);
    setIsModalOpen(true);
  }

  // Abrir modal para editar cliente
  function openEditModal(client: Client) {
    setEditingId(client.id);
    setFormData({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      property_type: client.property_type || "",
      purpose: client.purpose || "",
      pref_location: client.pref_location || "",
      pref_min_bedrooms: client.pref_min_bedrooms?.toString() || "",
      pref_min_parking: client.pref_min_parking?.toString() || "",
      budget_min: client.budget_min?.toString() || "",
      budget_max: client.budget_max?.toString() || "",
      accepts_financing: client.accepts_financing === true ? "true" : client.accepts_financing === false ? "false" : "",
      down_payment_value: client.down_payment_value?.toString() || "",
      status: client.status || "novo",
      origin: client.origin || "",
      notes: client.notes || "",
    });
    setIsModalOpen(true);
  }

  // Salvar (criar ou atualizar)
  async function handleSave() {
    if (!formData.name) return toast.error("Nome é obrigatório");
    if (!corretorId) return toast.error("Erro: corretor não identificado");

    setLoading(true);

    const clientData = {
      corretor_id: corretorId,
      name: formData.name,
      phone: formData.phone || null,
      email: formData.email || null,
      property_type: formData.property_type || null,
      purpose: formData.purpose || null,
      pref_location: formData.pref_location || null,
      pref_min_bedrooms: formData.pref_min_bedrooms ? parseInt(formData.pref_min_bedrooms) : null,
      pref_min_parking: formData.pref_min_parking ? parseInt(formData.pref_min_parking) : null,
      budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
      accepts_financing: formData.accepts_financing === "true" ? true : formData.accepts_financing === "false" ? false : null,
      down_payment_value: formData.down_payment_value ? parseFloat(formData.down_payment_value) : null,
      status: formData.status || "novo",
      origin: formData.origin || null,
      notes: formData.notes || null,
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from("clients" as any)
        .update(clientData)
        .eq("id", editingId);
      error = result.error;
    } else {
      const result = await supabase
        .from("clients" as any)
        .insert([clientData]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      toast.error(editingId ? "Erro ao atualizar cliente" : "Erro ao salvar cliente");
      console.error(error);
    } else {
      toast.success(editingId ? "Cliente atualizado!" : "Cliente cadastrado!");
      setIsModalOpen(false);
      setFormData(emptyClient);
      setEditingId(null);
      fetchClients();
    }
  }

  // Deletar cliente
  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    const { error } = await supabase.from("clients" as any).delete().eq("id", id);
    if (!error) {
      toast.success("Cliente removido");
      fetchClients();
    } else {
      toast.error("Erro ao remover cliente");
    }
  }

  // Formatar valor como moeda
  function formatCurrency(value: number | null) {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  // Buscar labels e cores
  function getStatusInfo(status: string | null) {
    return statusOptions.find((s) => s.value === status) || { label: status || "-", color: "bg-gray-500" };
  }

  function getPropertyTypeLabel(type: string | null) {
    return propertyTypes.find((p) => p.value === type)?.label || type || "-";
  }

  function getPurposeLabel(purpose: string | null) {
    return purposes.find((p) => p.value === purpose)?.label || purpose || "-";
  }

  function getOriginLabel(origin: string | null) {
    return originOptions.find((o) => o.value === origin)?.label || origin || "-";
  }

  const activeFiltersCount = countActiveFilters();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6" />
          Clientes ({filteredClients.length})
        </h1>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <Button onClick={openNewClientModal}>
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>
      </div>

      {/* Painel de Filtros */}
{showFilters && (
  <Card className="border-dashed">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros Avançados
        </h3>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Tipo de Imóvel</label>
          <Select value={filterPropertyType} onValueChange={setFilterPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Origem</label>
          <Select value={filterOrigin} onValueChange={setFilterOrigin}>
            <SelectTrigger>
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {originOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Orçamento Mín</label>
          <Input
            type="number"
            placeholder="R$ 0"
            value={filterBudgetMin}
            onChange={(e) => setFilterBudgetMin(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Orçamento Máx</label>
          <Input
            type="number"
            placeholder="R$ 999.999"
            value={filterBudgetMax}
            onChange={(e) => setFilterBudgetMax(e.target.value)}
          />
        </div>
      </div>
    </CardContent>
  </Card>
)}
      {/* Lista de Clientes */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchTerm || activeFiltersCount > 0 
                ? "Nenhum cliente encontrado com os filtros aplicados." 
                : "Nenhum cliente cadastrado. Clique em 'Novo' para adicionar."}
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => {
            const matchingProperties = findMatchingProperties(client);
            const matchCount = matchingProperties.length;
            const statusInfo = getStatusInfo(client.status);

            return (
              <Card key={client.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header do card */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{client.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs text-white ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          {client.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {client.phone}
                            </span>
                          )}
                          {client.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {client.email}
                            </span>
                          )}
                          {client.origin && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {getOriginLabel(client.origin)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(client)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Detalhes do interesse */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <p className="font-medium">{getPropertyTypeLabel(client.property_type)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Finalidade:</span>
                        <p className="font-medium">{getPurposeLabel(client.purpose)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bairros:</span>
                        <p className="font-medium">{client.pref_location || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quartos/Vagas:</span>
                        <p className="font-medium">
                          {client.pref_min_bedrooms || 0}+ quartos, {client.pref_min_parking || 0}+ vagas
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Faixa de preço:</span>
                        <p className="font-medium">
                          {formatCurrency(client.budget_min)} - {formatCurrency(client.budget_max)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Financiamento:</span>
                        <p className="font-medium">
                          {client.accepts_financing === true ? "Sim" : client.accepts_financing === false ? "Não" : "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Entrada:</span>
                        <p className="font-medium">{formatCurrency(client.down_payment_value)}</p>
                      </div>
                    </div>

                    {/* MATCH DE IMÓVEIS */}
                    <div 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        matchCount > 0 
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30" 
                          : "bg-muted/30 border border-transparent"
                      }`}
                      onClick={() => matchCount > 0 && openMatchModal(client)}
                    >
                      <div className="flex items-center gap-2">
                        <Home className={`w-5 h-5 ${matchCount > 0 ? "text-green-600" : "text-muted-foreground"}`} />
                        <span className={`font-medium ${matchCount > 0 ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}`}>
                          {matchCount > 0 
                            ? `${matchCount} imóvel(is) compatível(is)` 
                            : "Nenhum imóvel compatível no momento"}
                        </span>
                      </div>
                      {matchCount > 0 && (
                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                          Ver detalhes <Eye className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    {/* Observações */}
                    {client.notes && (
                      <div className="text-sm p-2 bg-muted/50 rounded border border-border">
                        <span className="text-muted-foreground font-medium">Observações: </span>
                        {client.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Nome completo *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Telefone/WhatsApp"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                placeholder="E-mail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de imóvel" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.purpose}
                onValueChange={(value) => setFormData({ ...formData, purpose: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Finalidade" />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Bairros de interesse"
                value={formData.pref_location}
                onChange={(e) => setFormData({ ...formData, pref_location: e.target.value })}
              />

              <Select
                value={formData.origin}
                onValueChange={(value) => setFormData({ ...formData, origin: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Origem do lead" />
                </SelectTrigger>
                <SelectContent>
                  {originOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                type="number"
                placeholder="Quartos (mín)"
                value={formData.pref_min_bedrooms}
                onChange={(e) => setFormData({ ...formData, pref_min_bedrooms: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Vagas (mín)"
                value={formData.pref_min_parking}
                onChange={(e) => setFormData({ ...formData, pref_min_parking: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Valor mínimo (R$)"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Valor máximo (R$)"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={formData.accepts_financing}
                onValueChange={(value) => setFormData({ ...formData, accepts_financing: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aceita financiamento?" />
                </SelectTrigger>
                <SelectContent>
                  {financingOptions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Valor de entrada (R$)"
                value={formData.down_payment_value}
                onChange={(e) => setFormData({ ...formData, down_payment_value: e.target.value })}
              />

              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
                        {s.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Observações sobre o cliente..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Cliente"}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE IMÓVEIS COMPATÍVEIS */}
      <Dialog open={isMatchModalOpen} onOpenChange={setIsMatchModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-green-600" />
              Imóveis compatíveis para {selectedClientName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedClientMatches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum imóvel compatível encontrado.
              </p>
            ) : (
              <>
                <Button 
                  onClick={handleViewFilteredProperties}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver todos na aba Imóveis ({selectedClientMatches.length})
                </Button>

                {selectedClientMatches.map((prop) => (
                  <Card key={prop.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{prop.title}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {prop.neighborhood || prop.location || "-"}
                              {prop.city ? `, ${prop.city}` : ""}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 mt-3 text-sm">
                            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                              <Bed className="w-4 h-4" /> {prop.bedrooms || 0} quartos
                            </span>
                            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                              <Car className="w-4 h-4" /> {prop.parking_spots || 0} vagas
                            </span>
                            <span className="bg-muted px-2 py-1 rounded">
                              {getPropertyTypeLabel(prop.property_type)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="font-bold text-primary text-lg">
                            {formatCurrency(prop.price)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}