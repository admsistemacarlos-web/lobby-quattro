import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Home, Trash2, Edit2, Search, Plus, MapPin, Bed, Car, Bath, 
  Ruler, CheckCircle2, Phone 
} from "lucide-react";
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
  condo_fee: number | null;
  iptu: number | null;
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
  pref_location: string | null;
  pref_min_bedrooms: number | null;
  pref_min_parking: number | null;
  budget_min: number | null;
  budget_max: number | null;
  property_type: string | null;
  purpose: string | null;
}

// Valores padrão
const emptyProperty = {
  title: "",
  property_type: "",
  purpose: "",
  price: "",
  condo_fee: "",
  iptu: "",
  bedrooms: "",
  bathrooms: "",
  parking_spots: "",
  total_area: "",
  built_area: "",
  address: "",
  neighborhood: "",
  city: "",
  state: "PR",
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
  { value: "venda_aluguel", label: "Venda ou Aluguel" },
];

const statusOptions = [
  { value: "disponivel", label: "🟢 Disponível" },
  { value: "reservado", label: "🟡 Reservado" },
  { value: "vendido", label: "✅ Vendido" },
  { value: "alugado", label: "🔵 Alugado" },
  { value: "inativo", label: "⚫ Inativo" },
];

const booleanOptions = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
];

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(emptyProperty);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [corretorId, setCorretorId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Client[]>([]);

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

  // Buscar imóveis quando tiver corretor_id
  useEffect(() => {
    if (corretorId) fetchProperties();
  }, [corretorId]);

  // Match em tempo real enquanto preenche o formulário
  useEffect(() => {
    const checkMatches = async () => {
      if (!corretorId) return;
      if (!formData.neighborhood && !formData.bedrooms && !formData.price) {
        setMatches([]);
        return;
      }

      let query = supabase
        .from("clients" as any)
        .select("*")
        .eq("corretor_id", corretorId);

      // Match por bairro
      if (formData.neighborhood) {
        query = query.ilike("pref_location", `%${formData.neighborhood}%`);
      }

      // Match por quartos (cliente quer X ou menos, imóvel tem X)
      if (formData.bedrooms) {
        query = query.lte("pref_min_bedrooms", parseInt(formData.bedrooms));
      }

      // Match por preço (preço do imóvel está na faixa do cliente)
      if (formData.price) {
        const price = parseFloat(formData.price);
        query = query.lte("budget_min", price).gte("budget_max", price);
      }

      // Match por tipo de imóvel
      if (formData.property_type) {
        query = query.eq("property_type", formData.property_type);
      }

      const { data } = await query;
      setMatches((data as unknown as Client[]) || []);
    };

    const timer = setTimeout(checkMatches, 500);
    return () => clearTimeout(timer);
  }, [formData.neighborhood, formData.bedrooms, formData.price, formData.property_type, corretorId]);

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

  // Filtrar imóveis pela busca
  const filteredProperties = properties.filter((prop) => {
    const term = searchTerm.toLowerCase();
    return (
      prop.title.toLowerCase().includes(term) ||
      prop.neighborhood?.toLowerCase().includes(term) ||
      prop.city?.toLowerCase().includes(term) ||
      prop.address?.toLowerCase().includes(term)
    );
  });

  // Abrir modal para novo imóvel
  function openNewPropertyModal() {
    setFormData(emptyProperty);
    setEditingId(null);
    setMatches([]);
    setIsModalOpen(true);
  }

  // Abrir modal para editar imóvel
  function openEditModal(prop: Property) {
    setEditingId(prop.id);
    setFormData({
      title: prop.title || "",
      property_type: prop.property_type || "",
      purpose: prop.purpose || "",
      price: prop.price?.toString() || "",
      condo_fee: prop.condo_fee?.toString() || "",
      iptu: prop.iptu?.toString() || "",
      bedrooms: prop.bedrooms?.toString() || "",
      bathrooms: prop.bathrooms?.toString() || "",
      parking_spots: prop.parking_spots?.toString() || "",
      total_area: prop.total_area?.toString() || "",
      built_area: prop.built_area?.toString() || "",
      address: prop.address || "",
      neighborhood: prop.neighborhood || prop.location || "",
      city: prop.city || "",
      state: prop.state || "PR",
      accepts_financing: prop.accepts_financing === true ? "true" : prop.accepts_financing === false ? "false" : "",
      accepts_trade: prop.accepts_trade === true ? "true" : prop.accepts_trade === false ? "false" : "",
      status: prop.status || "disponivel",
      description: prop.description || "",
      image_url: prop.image_url || "",
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
      condo_fee: formData.condo_fee ? parseFloat(formData.condo_fee) : null,
      iptu: formData.iptu ? parseFloat(formData.iptu) : null,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      parking_spots: formData.parking_spots ? parseInt(formData.parking_spots) : null,
      total_area: formData.total_area ? parseFloat(formData.total_area) : null,
      built_area: formData.built_area ? parseFloat(formData.built_area) : null,
      address: formData.address || null,
      neighborhood: formData.neighborhood || null,
      location: formData.neighborhood || null, // manter compatibilidade
      city: formData.city || null,
      state: formData.state || "PR",
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
      setMatches([]);
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

  // Buscar labels
  function getStatusLabel(status: string | null) {
    return statusOptions.find((s) => s.value === status)?.label || status || "-";
  }

  function getPropertyTypeLabel(type: string | null) {
    return propertyTypes.find((p) => p.value === type)?.label || type || "-";
  }

  function getPurposeLabel(purpose: string | null) {
    return purposes.find((p) => p.value === purpose)?.label || purpose || "-";
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Home className="w-6 h-6" />
          Imóveis ({properties.length})
        </h1>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Busca */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar imóvel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Botão Novo Imóvel */}
          <Button onClick={openNewPropertyModal}>
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>
      </div>

      {/* Lista de Imóveis */}
      <div className="space-y-4">
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchTerm ? "Nenhum imóvel encontrado." : "Nenhum imóvel cadastrado. Clique em 'Novo' para adicionar."}
            </CardContent>
          </Card>
        ) : (
          filteredProperties.map((prop) => (
            <Card key={prop.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header do card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{prop.title}</h3>
                        <span className="text-sm">{getStatusLabel(prop.status)}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {prop.neighborhood || prop.location || "-"}{prop.city ? `, ${prop.city}` : ""}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(prop.price)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(prop)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(prop.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {prop.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        {prop.bedrooms} quarto{prop.bedrooms > 1 ? "s" : ""}
                      </span>
                    )}
                    {prop.bathrooms && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4 text-muted-foreground" />
                        {prop.bathrooms} banheiro{prop.bathrooms > 1 ? "s" : ""}
                      </span>
                    )}
                    {prop.parking_spots && (
                      <span className="flex items-center gap-1">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        {prop.parking_spots} vaga{prop.parking_spots > 1 ? "s" : ""}
                      </span>
                    )}
                    {prop.total_area && (
                      <span className="flex items-center gap-1">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                        {prop.total_area}m²
                      </span>
                    )}
                  </div>

                  {/* Info adicional */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                    <div>
                      <span className="text-muted-foreground">Condomínio:</span>
                      <p className="font-medium">{formatCurrency(prop.condo_fee)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IPTU:</span>
                      <p className="font-medium">{formatCurrency(prop.iptu)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Financiamento:</span>
                      <p className="font-medium">
                        {prop.accepts_financing === true ? "Sim" : prop.accepts_financing === false ? "Não" : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Aceita permuta:</span>
                      <p className="font-medium">
                        {prop.accepts_trade === true ? "Sim" : prop.accepts_trade === false ? "Não" : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Descrição */}
                  {prop.description && (
                    <div className="text-sm p-2 bg-muted/30 rounded">
                      {prop.description}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Imóvel" : "Novo Imóvel"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
            {/* Formulário - 2 colunas */}
            <div className="lg:col-span-2 space-y-4">
              {/* Título */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Título do imóvel *</label>
                <Input
                  placeholder="Ex: Apartamento 3 quartos no Centro"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Tipo e Finalidade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tipo de imóvel</label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Finalidade</label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
              </div>

              {/* Localização */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Endereço</label>
                  <Input
                    placeholder="Rua/Av. e número"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Bairro</label>
                  <Input
                    placeholder="Ex: Centro"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Cidade</label>
                  <Input
                    placeholder="Ex: Curitiba"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              {/* Características */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Quartos</label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Banheiros</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Vagas</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.parking_spots}
                    onChange={(e) => setFormData({ ...formData, parking_spots: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Área total (m²)</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.total_area}
                    onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Área construída (m²)</label>
                  <Input
                    type="number"
                    placeholder="80"
                    value={formData.built_area}
                    onChange={(e) => setFormData({ ...formData, built_area: e.target.value })}
                  />
                </div>
              </div>

              {/* Valores */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preço (R$)</label>
                  <Input
                    type="number"
                    placeholder="350000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Condomínio (R$)</label>
                  <Input
                    type="number"
                    placeholder="800"
                    value={formData.condo_fee}
                    onChange={(e) => setFormData({ ...formData, condo_fee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">IPTU (R$)</label>
                  <Input
                    type="number"
                    placeholder="300"
                    value={formData.iptu}
                    onChange={(e) => setFormData({ ...formData, iptu: e.target.value })}
                  />
                </div>
              </div>

              {/* Opções */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Aceita financiamento?</label>
                  <Select
                    value={formData.accepts_financing}
                    onValueChange={(value) => setFormData({ ...formData, accepts_financing: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {booleanOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Aceita permuta?</label>
                  <Select
                    value={formData.accepts_trade}
                    onValueChange={(value) => setFormData({ ...formData, accepts_trade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {booleanOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* URL da imagem */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URL da imagem (opcional)</label>
                <Input
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Descrição do imóvel</label>
                <Textarea
                  placeholder="Descreva as características e diferenciais do imóvel..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Imóvel"}
                </Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>

            {/* Match em tempo real - 1 coluna */}
            <div className="lg:col-span-1">
              <Card className={`sticky top-4 transition-all duration-500 ${matches.length > 0 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-xl" : "bg-muted/50"}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className={`w-5 h-5 ${matches.length > 0 ? "text-green-600" : "text-muted-foreground"}`} />
                    Match de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {matches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Preencha bairro, quartos e preço para ver clientes interessados...
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="font-bold text-green-700 dark:text-green-400 text-sm">
                        🎯 {matches.length} cliente(s) interessado(s)!
                      </p>
                      {matches.map((client) => (
                        <div key={client.id} className="bg-background p-3 rounded-lg border shadow-sm">
                          <p className="font-semibold">{client.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Busca: {client.pref_location} ({client.pref_min_bedrooms}+ quartos)
                          </p>
                          {client.phone && (
                            <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {client.phone}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}