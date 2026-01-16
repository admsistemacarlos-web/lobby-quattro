import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Home,
  MapPin,
  Bed,
  Car,
  Bath,
  Ruler,
  DollarSign,
  FileText,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  Phone
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
}

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

// Função para obter configuração do status
function getStatusConfig(status: string | null) {
  return statusOptions.find((s) => s.value === status) || statusOptions[0];
}

export default function ImovelDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [matches, setMatches] = useState<Client[]>([]);
  const [corretorId, setCorretorId] = useState<string | null>(null);

  // Buscar corretor_id
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

  // Buscar dados do imóvel
  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  // Buscar matches quando tiver o imóvel e corretor
  useEffect(() => {
    if (property && corretorId) fetchMatches();
  }, [property, corretorId]);

  async function fetchProperty() {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties" as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar imóvel:", error);
      toast.error("Imóvel não encontrado");
      navigate("/dashboard");
    } else {
      setProperty(data as unknown as Property);
      initFormData(data as unknown as Property);
    }
    setLoading(false);
  }

  async function fetchMatches() {
    if (!property || !corretorId) return;

    let query = supabase
      .from("clients" as any)
      .select("*")
      .eq("corretor_id", corretorId);

    // Match por bairro
    if (property.neighborhood || property.location) {
      const location = property.neighborhood || property.location;
      query = query.ilike("pref_location", `%${location}%`);
    }

    // Match por quartos
    if (property.bedrooms) {
      query = query.lte("pref_min_bedrooms", property.bedrooms);
    }

    // Match por preço
    if (property.price) {
      query = query.lte("budget_min", property.price).gte("budget_max", property.price);
    }

    const { data } = await query;
    setMatches((data as unknown as Client[]) || []);
  }

  function initFormData(prop: Property) {
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
  }

  // Salvar alterações
  async function handleSave() {
    if (!formData.title) return toast.error("Título é obrigatório");
    if (!property) return;

    setSaving(true);

    const propertyData = {
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
      location: formData.neighborhood || null,
      city: formData.city || null,
      state: formData.state || "PR",
      accepts_financing: formData.accepts_financing === "true" ? true : formData.accepts_financing === "false" ? false : null,
      accepts_trade: formData.accepts_trade === "true" ? true : formData.accepts_trade === "false" ? false : null,
      status: formData.status || "disponivel",
      description: formData.description || null,
      image_url: formData.image_url || null,
    };

    const { error } = await supabase
      .from("properties" as any)
      .update(propertyData)
      .eq("id", property.id);

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar alterações");
      console.error(error);
    } else {
      toast.success("Imóvel atualizado!");
      setIsEditing(false);
      fetchProperty();
    }
  }

  // Deletar imóvel
  async function handleDelete() {
    if (!property) return;

    const { error } = await supabase
      .from("properties" as any)
      .delete()
      .eq("id", property.id);

    if (error) {
      toast.error("Erro ao excluir imóvel");
    } else {
      toast.success("Imóvel excluído");
      navigate("/dashboard");
    }
  }

  // Cancelar edição
  function handleCancel() {
    if (property) initFormData(property);
    setIsEditing(false);
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
  function getPropertyTypeLabel(type: string | null) {
    return propertyTypes.find((p) => p.value === type)?.label || type || "-";
  }

  function getPurposeLabel(purpose: string | null) {
    return purposes.find((p) => p.value === purpose)?.label || purpose || "-";
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Imóvel não encontrado
  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Imóvel não encontrado</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(property.status);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{property.title}</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusConfig.color}`}></span>
                <span className="text-sm text-muted-foreground">{statusConfig.label}</span>
                <span className="text-sm font-semibold text-primary ml-2">
                  {formatCurrency(property.price)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O imóvel será permanentemente removido.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Coluna principal - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card: Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Home className="w-5 h-5" />
                  Informações do Imóvel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Título *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo</label>
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
                        <label className="text-sm font-medium">Finalidade</label>
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
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
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <p className="font-medium">{getPropertyTypeLabel(property.property_type)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Finalidade:</span>
                      <p className="font-medium">{getPurposeLabel(property.purpose)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: Localização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-5 h-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Endereço</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua/Av. e número"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bairro</label>
                        <Input
                          value={formData.neighborhood}
                          onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cidade</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estado</label>
                        <Input
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm">
                      {property.address || "Endereço não informado"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {property.neighborhood || property.location || "-"}
                      {property.city ? `, ${property.city}` : ""}
                      {property.state ? ` - ${property.state}` : ""}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card: Características */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Ruler className="w-5 h-5" />
                  Características
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quartos</label>
                      <Input
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Banheiros</label>
                      <Input
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vagas</label>
                      <Input
                        type="number"
                        value={formData.parking_spots}
                        onChange={(e) => setFormData({ ...formData, parking_spots: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Área total</label>
                      <Input
                        type="number"
                        value={formData.total_area}
                        onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Área construída</label>
                      <Input
                        type="number"
                        value={formData.built_area}
                        onChange={(e) => setFormData({ ...formData, built_area: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-6">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="w-5 h-5 text-muted-foreground" />
                        <span>{property.bedrooms} quarto{property.bedrooms > 1 ? "s" : ""}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="w-5 h-5 text-muted-foreground" />
                        <span>{property.bathrooms} banheiro{property.bathrooms > 1 ? "s" : ""}</span>
                      </div>
                    )}
                    {property.parking_spots && (
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-muted-foreground" />
                        <span>{property.parking_spots} vaga{property.parking_spots > 1 ? "s" : ""}</span>
                      </div>
                    )}
                    {property.total_area && (
                      <div className="flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-muted-foreground" />
                        <span>{property.total_area}m² total</span>
                      </div>
                    )}
                    {property.built_area && (
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-muted-foreground" />
                        <span>{property.built_area}m² construído</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: Valores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="w-5 h-5" />
                  Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Preço (R$)</label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Condomínio (R$)</label>
                        <Input
                          type="number"
                          value={formData.condo_fee}
                          onChange={(e) => setFormData({ ...formData, condo_fee: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">IPTU (R$)</label>
                        <Input
                          type="number"
                          value={formData.iptu}
                          onChange={(e) => setFormData({ ...formData, iptu: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Aceita financiamento?</label>
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
                        <label className="text-sm font-medium">Aceita permuta?</label>
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
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Preço:</span>
                      <p className="font-semibold text-primary text-lg">{formatCurrency(property.price)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Condomínio:</span>
                      <p className="font-medium">{formatCurrency(property.condo_fee)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IPTU:</span>
                      <p className="font-medium">{formatCurrency(property.iptu)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Financiamento:</span>
                      <p className="font-medium">
                        {property.accepts_financing === true ? "Sim" : property.accepts_financing === false ? "Não" : "-"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: Descrição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5" />
                  Descrição
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva as características e diferenciais do imóvel..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {property.description || "Nenhuma descrição cadastrada."}
                  </p>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Coluna lateral - 1/3 */}
          <div className="space-y-6">
            
            {/* Card: Match de Clientes */}
            <Card className={`transition-all duration-500 ${matches.length > 0 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-xl" : "bg-muted/50"}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className={`w-5 h-5 ${matches.length > 0 ? "text-green-600" : "text-muted-foreground"}`} />
                  Clientes Interessados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum cliente com perfil compatível encontrado.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="font-bold text-green-700 dark:text-green-400 text-sm">
                      {matches.length} cliente(s) interessado(s)!
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

            {/* Card: Imagem */}
            {isEditing ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Imagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL da imagem</label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : property.image_url ? (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            ) : null}

          </div>
        </div>
      </main>
    </div>
  );
}