import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Home, Trash2, Edit2, Search, Plus, MapPin, Bed, Car, Bath, Ruler, Users, X, Phone, Mail, Filter } from "lucide-react";
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
interface Property {
  id: string;
  created_at: string;
  title: string;
  property_type: string | null;
  purpose: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  total_area: number | null;
  built_area: number | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  location: string | null;
  condo_fee: number | null;
  iptu: number | null;
  accepts_financing: boolean | null;
  accepts_trade: boolean | null;
  status: string | null;
  description: string | null;
  image_url: string | null;
  corretor_id: string | null;
}

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  pref_location: string | null;
  pref_min_bedrooms: number | null;
  property_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
  pref_min_parking: number | null;
}

// Valores padrão
const emptyProperty = {
  title: "",
  property_type: "",
  purpose: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  parking_spots: "",
  total_area: "",
  built_area: "",
  address: "",
  neighborhood: "",
  city: "",
  state: "PR",
  condo_fee: "",
  iptu: "",
  accepts_financing: "",
  accepts_trade: "",
  status: "disponivel",
  description: "",
  image_url: "",
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
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "temporada", label: "Temporada" },
];

const statusOptions = [
  { value: "disponivel", label: "Disponível", color: "bg-green-500" },
  { value: "reservado", label: "Reservado", color: "bg-yellow-500" },
  { value: "vendido", label: "Vendido", color: "bg-blue-500" },
  { value: "alugado", label: "Alugado", color: "bg-purple-500" },
  { value: "inativo", label: "Inativo", color: "bg-gray-500" },
];

const booleanOptions = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
];

const bedroomOptions = [
  { value: "1", label: "1+ quarto" },
  { value: "2", label: "2+ quartos" },
  { value: "3", label: "3+ quartos" },
  { value: "4", label: "4+ quartos" },
  { value: "5", label: "5+ quartos" },
];

const parkingOptions = [
  { value: "1", label: "1+ vaga" },
  { value: "2", label: "2+ vagas" },
  { value: "3", label: "3+ vagas" },
  { value: "4", label: "4+ vagas" },
];

interface PropertiesProps {
  filterByIds?: string[] | null;
  filterClientName?: string;
  onClearFilter?: () => void;
}

export default function Properties({ filterByIds, filterClientName, onClearFilter }: PropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(emptyProperty);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [corretorId, setCorretorId] = useState<string | null>(null);
  const [selectedPropertyMatches, setSelectedPropertyMatches] = useState<Client[]>([]);
  const [selectedPropertyTitle, setSelectedPropertyTitle] = useState("");

  // Estados dos filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPropertyType, setFilterPropertyType] = useState<string>("all");
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [filterBedrooms, setFilterBedrooms] = useState<string>("all");
  const [filterParking, setFilterParking] = useState<string>("all");
  const [filterPriceMin, setFilterPriceMin] = useState<string>("");
  const [filterPriceMax, setFilterPriceMax] = useState<string>("");
  const [filterAreaMin, setFilterAreaMin] = useState<string>("");

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

  // Buscar imóveis e clientes quando tiver corretor_id
  useEffect(() => {
    if (corretorId) {
      fetchProperties();
      fetchClients();
    }
  }, [corretorId]);

  async function fetchProperties() {
    const { data, error } = await supabase
      .from("properties" as any)
      .select("*")
      .eq("corretor_id", corretorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar:", error);
      toast.error("Erro ao carregar imóveis");
    } else {
      setProperties((data as unknown as Property[]) || []);
    }
  }

  async function fetchClients() {
    const { data, error } = await supabase
      .from("clients" as any)
      .select("*")
      .eq("corretor_id", corretorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
    } else {
      setClients((data as unknown as Client[]) || []);
    }
  }

  // Função para encontrar clientes interessados em um imóvel
  function findMatchingClients(property: Property): Client[] {
    return clients.filter((client) => {
      let matches = true;

      if (client.pref_location && property.neighborhood) {
        const clientLocation = client.pref_location.toLowerCase();
        const propLocation = property.neighborhood.toLowerCase();
        if (!propLocation.includes(clientLocation) && !clientLocation.includes(propLocation)) {
          matches = false;
        }
      }

      if (client.property_type && property.property_type) {
        if (client.property_type !== property.property_type) {
          matches = false;
        }
      }

      if (client.pref_min_bedrooms && property.bedrooms) {
        if (property.bedrooms < client.pref_min_bedrooms) {
          matches = false;
        }
      }

      if (client.pref_min_parking && property.parking_spots) {
        if (property.parking_spots < client.pref_min_parking) {
          matches = false;
        }
      }

      if (property.price) {
        if (client.budget_min && property.price < client.budget_min) {
          matches = false;
        }
        if (client.budget_max && property.price > client.budget_max) {
          matches = false;
        }
      }

      return matches;
    });
  }

  // Abrir modal de clientes interessados
  function openMatchModal(property: Property) {
    const matches = findMatchingClients(property);
    setSelectedPropertyMatches(matches);
    setSelectedPropertyTitle(property.title);
    setIsMatchModalOpen(true);
  }

  // Limpar filtros
  function clearFilters() {
    setFilterStatus("all");
    setFilterPropertyType("all");
    setFilterPurpose("all");
    setFilterBedrooms("all");
    setFilterParking("all");
    setFilterPriceMin("");
    setFilterPriceMax("");
    setFilterAreaMin("");
  }

  // Contar filtros ativos
  function countActiveFilters() {
    let count = 0;
    if (filterStatus !== "all") count++;
    if (filterPropertyType !== "all") count++;
    if (filterPurpose !== "all") count++;
    if (filterBedrooms !== "all") count++;
    if (filterParking !== "all") count++;
    if (filterPriceMin) count++;
    if (filterPriceMax) count++;
    if (filterAreaMin) count++;
    return count;
  }

  // Filtrar imóveis
  const filteredProperties = properties.filter((property) => {
    // Primeiro, aplica filtro por IDs se existir (vindo da tela de clientes)
    if (filterByIds && filterByIds.length > 0) {
      if (!filterByIds.includes(property.id)) {
        return false;
      }
    }

    // Filtro por busca de texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (
        property.title.toLowerCase().includes(term) ||
        property.neighborhood?.toLowerCase().includes(term) ||
        property.city?.toLowerCase().includes(term) ||
        property.address?.toLowerCase().includes(term)
      );
      if (!matchesSearch) return false;
    }

    // Filtro por status
    if (filterStatus !== "all" && property.status !== filterStatus) {
      return false;
    }

    // Filtro por tipo de imóvel
    if (filterPropertyType !== "all" && property.property_type !== filterPropertyType) {
      return false;
    }

    // Filtro por finalidade
    if (filterPurpose !== "all" && property.purpose !== filterPurpose) {
      return false;
    }

    // Filtro por quartos
    if (filterBedrooms !== "all") {
      const minBedrooms = parseInt(filterBedrooms);
      if (!property.bedrooms || property.bedrooms < minBedrooms) {
        return false;
      }
    }

    // Filtro por vagas
    if (filterParking !== "all") {
      const minParking = parseInt(filterParking);
      if (!property.parking_spots || property.parking_spots < minParking) {
        return false;
      }
    }

    // Filtro por preço mínimo
    if (filterPriceMin) {
      const minPrice = parseFloat(filterPriceMin);
      if (!property.price || property.price < minPrice) {
        return false;
      }
    }

    // Filtro por preço máximo
    if (filterPriceMax) {
      const maxPrice = parseFloat(filterPriceMax);
      if (!property.price || property.price > maxPrice) {
        return false;
      }
    }

    // Filtro por área mínima
    if (filterAreaMin) {
      const minArea = parseFloat(filterAreaMin);
      if (!property.total_area || property.total_area < minArea) {
        return false;
      }
    }

    return true;
  });

  // Abrir modal para novo imóvel
  function openNewPropertyModal() {
    setFormData(emptyProperty);
    setEditingId(null);
    setIsModalOpen(true);
  }

  // Abrir modal para editar imóvel
  function openEditModal(property: Property) {
    setEditingId(property.id);
    setFormData({
      title: property.title || "",
      property_type: property.property_type || "",
      purpose: property.purpose || "",
      price: property.price?.toString() || "",
      bedrooms: property.bedrooms?.toString() || "",
      bathrooms: property.bathrooms?.toString() || "",
      parking_spots: property.parking_spots?.toString() || "",
      total_area: property.total_area?.toString() || "",
      built_area: property.built_area?.toString() || "",
      address: property.address || "",
      neighborhood: property.neighborhood || "",
      city: property.city || "",
      state: property.state || "PR",
      condo_fee: property.condo_fee?.toString() || "",
      iptu: property.iptu?.toString() || "",
      accepts_financing: property.accepts_financing === true ? "true" : property.accepts_financing === false ? "false" : "",
      accepts_trade: property.accepts_trade === true ? "true" : property.accepts_trade === false ? "false" : "",
      status: property.status || "disponivel",
      description: property.description || "",
      image_url: property.image_url || "",
    });
    setIsModalOpen(true);
  }

  // Salvar (criar ou atualizar)
  async function handleSave() {
    if (!formData.title) return toast.error("Título é obrigatório");
    if (!corretorId) return toast.error("Erro: corretor não identificado");

    setLoading(true);

    const propertyData = {
      corretor_id: corretorId,
      title: formData.title,
      property_type: formData.property_type || null,
      purpose: formData.purpose || null,
      price: formData.price ? parseFloat(formData.price) : null,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      parking_spots: formData.parking_spots ? parseInt(formData.parking_spots) : null,
      total_area: formData.total_area ? parseFloat(formData.total_area) : null,
      built_area: formData.built_area ? parseFloat(formData.built_area) : null,
      address: formData.address || null,
      neighborhood: formData.neighborhood || null,
      city: formData.city || null,
      state: formData.state || null,
      condo_fee: formData.condo_fee ? parseFloat(formData.condo_fee) : null,
      iptu: formData.iptu ? parseFloat(formData.iptu) : null,
      accepts_financing: formData.accepts_financing === "true" ? true : formData.accepts_financing === "false" ? false : null,
      accepts_trade: formData.accepts_trade === "true" ? true : formData.accepts_trade === "false" ? false : null,
      status: formData.status || "disponivel",
      description: formData.description || null,
      image_url: formData.image_url || null,
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from("properties" as any)
        .update(propertyData)
        .eq("id", editingId);
      error = result.error;
    } else {
      const result = await supabase
        .from("properties" as any)
        .insert([propertyData]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      toast.error(editingId ? "Erro ao atualizar imóvel" : "Erro ao salvar imóvel");
      console.error(error);
    } else {
      toast.success(editingId ? "Imóvel atualizado!" : "Imóvel cadastrado!");
      setIsModalOpen(false);
      setFormData(emptyProperty);
      setEditingId(null);
      fetchProperties();
    }
  }

  // Deletar imóvel
  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este imóvel?")) return;

    const { error } = await supabase.from("properties" as any).delete().eq("id", id);
    if (!error) {
      toast.success("Imóvel removido");
      fetchProperties();
    } else {
      toast.error("Erro ao remover imóvel");
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

  const activeFiltersCount = countActiveFilters();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Home className="w-6 h-6" />
          Imóveis ({filteredProperties.length})
        </h1>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar imóvel..."
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
          <Button onClick={openNewPropertyModal}>
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>
      </div>

      {/* Banner de filtro por cliente (vindo da tela de clientes) */}
      {filterByIds && filterByIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <span className="text-sm text-green-700 dark:text-green-400">
            Mostrando {filteredProperties.length} imóvel(is) compatível(is) com <strong>{filterClientName}</strong>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilter}
            className="text-green-700 dark:text-green-400 hover:text-green-800"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar filtro
          </Button>
        </div>
      )}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
          <Select value={filterPropertyType} onValueChange={setFilterPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
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
          <label className="text-xs font-medium text-muted-foreground">Finalidade</label>
          <Select value={filterPurpose} onValueChange={setFilterPurpose}>
            <SelectTrigger>
              <SelectValue placeholder="Finalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {purposes.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Quartos</label>
          <Select value={filterBedrooms} onValueChange={setFilterBedrooms}>
            <SelectTrigger>
              <SelectValue placeholder="Quartos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer</SelectItem>
              {bedroomOptions.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Vagas</label>
          <Select value={filterParking} onValueChange={setFilterParking}>
            <SelectTrigger>
              <SelectValue placeholder="Vagas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer</SelectItem>
              {parkingOptions.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Preço Mín</label>
          <Input
            type="number"
            placeholder="R$ 0"
            value={filterPriceMin}
            onChange={(e) => setFilterPriceMin(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Preço Máx</label>
          <Input
            type="number"
            placeholder="R$ 999.999"
            value={filterPriceMax}
            onChange={(e) => setFilterPriceMax(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Área Mín (m²)</label>
          <Input
            type="number"
            placeholder="0 m²"
            value={filterAreaMin}
            onChange={(e) => setFilterAreaMin(e.target.value)}
          />
        </div>
      </div>
    </CardContent>
  </Card>
)}

      {/* Lista de Imóveis */}
      <div className="space-y-4">
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchTerm || activeFiltersCount > 0 || filterByIds
                ? "Nenhum imóvel encontrado com os filtros aplicados." 
                : "Nenhum imóvel cadastrado. Clique em 'Novo' para adicionar."}
            </CardContent>
          </Card>
        ) : (
          filteredProperties.map((property) => {
            const matchingClients = findMatchingClients(property);
            const matchCount = matchingClients.length;
            const statusInfo = getStatusInfo(property.status);

            return (
              <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header do card */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{property.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs text-white ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.neighborhood || property.address || "-"}
                            {property.city ? `, ${property.city}` : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-primary text-xl">
                          {formatCurrency(property.price)}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(property)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(property.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Características */}
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        <Bed className="w-4 h-4" /> {property.bedrooms || 0} quartos
                      </span>
                      <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        <Bath className="w-4 h-4" /> {property.bathrooms || 0} banheiros
                      </span>
                      <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        <Car className="w-4 h-4" /> {property.parking_spots || 0} vagas
                      </span>
                      {property.total_area && (
                        <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                          <Ruler className="w-4 h-4" /> {property.total_area}m²
                        </span>
                      )}
                      <span className="bg-muted px-2 py-1 rounded">
                        {getPropertyTypeLabel(property.property_type)}
                      </span>
                      <span className="bg-muted px-2 py-1 rounded">
                        {getPurposeLabel(property.purpose)}
                      </span>
                    </div>

                    {/* Custos adicionais */}
                    {(property.condo_fee || property.iptu) && (
                      <div className="text-sm text-muted-foreground">
                        {property.condo_fee && <span>Condomínio: {formatCurrency(property.condo_fee)}</span>}
                        {property.condo_fee && property.iptu && <span> | </span>}
                        {property.iptu && <span>IPTU: {formatCurrency(property.iptu)}</span>}
                      </div>
                    )}

                    {/* MATCH DE CLIENTES */}
                    <div 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        matchCount > 0 
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
                          : "bg-muted/30 border border-transparent"
                      }`}
                      onClick={() => matchCount > 0 && openMatchModal(property)}
                    >
                      <div className="flex items-center gap-2">
                        <Users className={`w-5 h-5 ${matchCount > 0 ? "text-blue-600" : "text-muted-foreground"}`} />
                        <span className={`font-medium ${matchCount > 0 ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground"}`}>
                          {matchCount > 0 
                            ? `${matchCount} cliente(s) interessado(s)` 
                            : "Nenhum cliente compatível no momento"}
                        </span>
                      </div>
                      {matchCount > 0 && (
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          Ver detalhes
                        </span>
                      )}
                    </div>

                    {/* Descrição */}
                    {property.description && (
                      <div className="text-sm p-2 bg-muted/50 rounded border border-border">
                        <span className="text-muted-foreground font-medium">Descrição: </span>
                        {property.description}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Imóvel" : "Novo Imóvel"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Título e Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Título do imóvel *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="md:col-span-1"
              />
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
            </div>

            {/* Localização */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Endereço"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="md:col-span-2"
              />
              <Input
                placeholder="Bairro"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
              <Input
                placeholder="Cidade"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            {/* Características */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Input
                type="number"
                placeholder="Quartos"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Banheiros"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Vagas"
                value={formData.parking_spots}
                onChange={(e) => setFormData({ ...formData, parking_spots: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Área total (m²)"
                value={formData.total_area}
                onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Área construída (m²)"
                value={formData.built_area}
                onChange={(e) => setFormData({ ...formData, built_area: e.target.value })}
              />
            </div>

            {/* Valores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="number"
                placeholder="Preço (R$)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Condomínio (R$)"
                value={formData.condo_fee}
                onChange={(e) => setFormData({ ...formData, condo_fee: e.target.value })}
              />
              <Input
                type="number"
                placeholder="IPTU (R$)"
                value={formData.iptu}
                onChange={(e) => setFormData({ ...formData, iptu: e.target.value })}
              />
            </div>

            {/* Opções */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={formData.accepts_financing}
                onValueChange={(value) => setFormData({ ...formData, accepts_financing: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aceita financiamento?" />
                </SelectTrigger>
                <SelectContent>
                  {booleanOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.accepts_trade}
                onValueChange={(value) => setFormData({ ...formData, accepts_trade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aceita permuta?" />
                </SelectTrigger>
                <SelectContent>
                  {booleanOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* URL da imagem */}
            <Input
              placeholder="URL da imagem"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />

            {/* Descrição */}
            <Textarea
              placeholder="Descrição do imóvel..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Imóvel"}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE CLIENTES INTERESSADOS */}
      <Dialog open={isMatchModalOpen} onOpenChange={setIsMatchModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Clientes interessados em "{selectedPropertyTitle}"
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedPropertyMatches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum cliente interessado encontrado.
              </p>
            ) : (
              selectedPropertyMatches.map((client) => (
                <Card key={client.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{client.name}</h3>
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
                        </div>

                        <div className="flex flex-wrap gap-3 mt-3 text-sm">
                          {client.pref_location && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                              <MapPin className="w-4 h-4" /> {client.pref_location}
                            </span>
                          )}
                          {client.pref_min_bedrooms && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                              <Bed className="w-4 h-4" /> {client.pref_min_bedrooms}+ quartos
                            </span>
                          )}
                          {(client.budget_min || client.budget_max) && (
                            <span className="bg-muted px-2 py-1 rounded">
                              {formatCurrency(client.budget_min)} - {formatCurrency(client.budget_max)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}