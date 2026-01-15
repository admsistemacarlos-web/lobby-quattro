import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Users, 
  Trash2, 
  Search, 
  Plus,
  Phone,
  MapPin,
  Circle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight
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

// Valores padrão para novo cliente
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

// Função para obter badge de status com cor e ícone
function getStatusBadge(status: string | null) {
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

  const config = statusConfig[status || "novo"] || statusConfig.novo;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(emptyClient);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [corretorId, setCorretorId] = useState<string | null>(null);

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

  // Buscar clientes quando tiver corretor_id
  useEffect(() => {
    if (corretorId) fetchClients();
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

  // Filtrar clientes pela busca
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.phone?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.pref_location?.toLowerCase().includes(term)
    );
  });

  // Abrir modal para novo cliente
  function openNewClientModal() {
    setFormData(emptyClient);
    setIsModalOpen(true);
  }

  // Navegar para página de detalhes do cliente
  function goToClientDetail(clientId: string) {
    navigate(`/cliente/${clientId}`);
  }

  // Salvar novo cliente
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

    const { error } = await supabase
      .from("clients" as any)
      .insert([clientData]);

    setLoading(false);

    if (error) {
      toast.error("Erro ao salvar cliente");
      console.error(error);
    } else {
      toast.success("Cliente cadastrado!");
      setIsModalOpen(false);
      setFormData(emptyClient);
      fetchClients();
    }
  }

  // Deletar cliente (com confirmação)
  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation(); // Evita navegar para detalhes ao clicar em excluir
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    const { error } = await supabase.from("clients" as any).delete().eq("id", id);
    if (!error) {
      toast.success("Cliente removido");
      fetchClients();
    } else {
      toast.error("Erro ao remover cliente");
    }
  }

  // Buscar label da origem
  function getOriginLabel(origin: string | null) {
    return originOptions.find((o) => o.value === origin)?.label || origin || "-";
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6" />
          Clientes ({clients.length})
        </h1>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Busca */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Botão Novo Cliente */}
          <Button onClick={openNewClientModal}>
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>
      </div>

      {/* Lista de Clientes - CARDS SIMPLIFICADOS */}
      <div className="space-y-2">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchTerm ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado. Clique em 'Novo' para adicionar."}
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className="overflow-hidden hover:shadow-md hover:bg-muted/30 transition-all cursor-pointer group"
              onClick={() => goToClientDetail(client.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Informações principais */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-base truncate">{client.name}</h3>
                      {getStatusBadge(client.status)}
                    </div>
                    
                    {/* Telefone e Origem */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {client.phone}
                        </span>
                      )}
                      {client.origin && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {getOriginLabel(client.origin)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleDelete(e, client.id)} 
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* MODAL DE CADASTRO DE NOVO CLIENTE */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dados básicos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome completo *</label>
                <Input
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Telefone/WhatsApp</label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <Input
                  placeholder="email@exemplo.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* O que busca */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tipo de imóvel</label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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
                    <SelectValue placeholder="Selecione a finalidade" />
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Bairros de interesse</label>
                <Input
                  placeholder="Ex: Centro, Batel, Água Verde"
                  value={formData.pref_location}
                  onChange={(e) => setFormData({ ...formData, pref_location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Origem do lead</label>
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
            </div>

            {/* Preferências */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Quartos (mín)</label>
                <Input
                  type="number"
                  placeholder="2"
                  value={formData.pref_min_bedrooms}
                  onChange={(e) => setFormData({ ...formData, pref_min_bedrooms: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Vagas (mín)</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.pref_min_parking}
                  onChange={(e) => setFormData({ ...formData, pref_min_parking: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Valor mínimo (R$)</label>
                <Input
                  type="number"
                  placeholder="200000"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Valor máximo (R$)</label>
                <Input
                  type="number"
                  placeholder="500000"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                />
              </div>
            </div>

            {/* Financiamento e Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {financingOptions.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Valor de entrada (R$)</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.down_payment_value}
                  onChange={(e) => setFormData({ ...formData, down_payment_value: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
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

            {/* Observações */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Observações</label>
              <Textarea
                placeholder="Informações adicionais sobre o cliente..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Cadastrar Cliente"}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}