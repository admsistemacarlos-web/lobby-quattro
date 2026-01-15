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
  Phone,
  Mail,
  MapPin,
  Home,
  Target,
  CreditCard,
  FileText,
  Edit2,
  Trash2,
  Save,
  X,
  Circle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
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
  { value: "novo", label: "Novo" },
  { value: "em_contato", label: "Em Contato" },
  { value: "visitou", label: "Visitou Imóvel" },
  { value: "negociando", label: "Negociando" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido" },
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

// Função para obter configuração do status
function getStatusConfig(status: string | null) {
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    novo: {
      label: "Novo",
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      icon: Circle
    },
    em_contato: {
      label: "Em Contato",
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      icon: AlertCircle
    },
    visitou: {
      label: "Visitou",
      className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      icon: CheckCircle2
    },
    negociando: {
      label: "Negociando",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      icon: AlertCircle
    },
    fechado: {
      label: "Fechado",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      icon: CheckCircle2
    },
    perdido: {
      label: "Perdido",
      className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      icon: XCircle
    }
  };

  return statusConfig[status || "novo"] || statusConfig.novo;
}

export default function ClienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Buscar dados do cliente
  useEffect(() => {
    if (id) fetchClient();
  }, [id]);

  async function fetchClient() {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients" as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar cliente:", error);
      toast.error("Cliente não encontrado");
      navigate("/dashboard");
    } else {
      setClient(data as unknown as Client);
      initFormData(data as unknown as Client);
    }
    setLoading(false);
  }

  function initFormData(clientData: Client) {
    setFormData({
      name: clientData.name || "",
      phone: clientData.phone || "",
      email: clientData.email || "",
      property_type: clientData.property_type || "",
      purpose: clientData.purpose || "",
      pref_location: clientData.pref_location || "",
      pref_min_bedrooms: clientData.pref_min_bedrooms?.toString() || "",
      pref_min_parking: clientData.pref_min_parking?.toString() || "",
      budget_min: clientData.budget_min?.toString() || "",
      budget_max: clientData.budget_max?.toString() || "",
      accepts_financing: clientData.accepts_financing === true ? "true" : clientData.accepts_financing === false ? "false" : "",
      down_payment_value: clientData.down_payment_value?.toString() || "",
      status: clientData.status || "novo",
      origin: clientData.origin || "",
      notes: clientData.notes || "",
    });
  }

  // Salvar alterações
  async function handleSave() {
    if (!formData.name) return toast.error("Nome é obrigatório");
    if (!client) return;

    setSaving(true);

    const clientData = {
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

    const { error } = await supabase
      .from("clients" as any)
      .update(clientData)
      .eq("id", client.id);

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar alterações");
      console.error(error);
    } else {
      toast.success("Cliente atualizado!");
      setIsEditing(false);
      fetchClient();
    }
  }

  // Deletar cliente
  async function handleDelete() {
    if (!client) return;

    const { error } = await supabase
      .from("clients" as any)
      .delete()
      .eq("id", client.id);

    if (error) {
      toast.error("Erro ao excluir cliente");
    } else {
      toast.success("Cliente excluído");
      navigate("/dashboard");
    }
  }

  // Cancelar edição
  function handleCancel() {
    if (client) initFormData(client);
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

  function getOriginLabel(origin: string | null) {
    return originOptions.find((o) => o.value === origin)?.label || origin || "-";
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Cliente não encontrado
  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Cliente não encontrado</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(client.status);
  const StatusIcon = statusConfig.icon;

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
              <h1 className="text-lg font-semibold text-foreground">{client.name}</h1>
              <Badge variant="outline" className={statusConfig.className}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
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
                      <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O cliente será permanentemente removido.
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
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Card: Dados de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="w-5 h-5" />
                Dados de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome completo *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone/WhatsApp</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-mail</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Origem do lead</label>
                    <Select
                      value={formData.origin}
                      onValueChange={(value) => setFormData({ ...formData, origin: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="De onde veio?" />
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
                <>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{client.phone || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{client.email || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Origem: {getOriginLabel(client.origin)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card: Preferências de Imóvel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Home className="w-5 h-5" />
                Preferências de Imóvel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de imóvel</label>
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
                    <label className="text-sm font-medium">Bairros de interesse</label>
                    <Input
                      value={formData.pref_location}
                      onChange={(e) => setFormData({ ...formData, pref_location: e.target.value })}
                      placeholder="Ex: Centro, Batel, Água Verde"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quartos (mín)</label>
                      <Input
                        type="number"
                        value={formData.pref_min_bedrooms}
                        onChange={(e) => setFormData({ ...formData, pref_min_bedrooms: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vagas (mín)</label>
                      <Input
                        type="number"
                        value={formData.pref_min_parking}
                        onChange={(e) => setFormData({ ...formData, pref_min_parking: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card: Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor mínimo (R$)</label>
                      <Input
                        type="number"
                        value={formData.budget_min}
                        onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor máximo (R$)</label>
                      <Input
                        type="number"
                        value={formData.budget_max}
                        onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
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
                          {financingOptions.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor de entrada (R$)</label>
                      <Input
                        type="number"
                        value={formData.down_payment_value}
                        onChange={(e) => setFormData({ ...formData, down_payment_value: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Card: Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-5 h-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o cliente..."
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {client.notes || "Nenhuma observação registrada."}
                </p>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}