import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Copy, ExternalLink, Loader2, UserPlus, Mail, Clock, Eye, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import LogoUpload from "./LogoUpload";
import PlanoBadge, { PlanoCorretor } from "./PlanoBadge";
import PlanoSelect from "./PlanoSelect";

interface Corretor {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  slug: string;
  logo_url: string | null;
  cor_primaria: string;
  ativo: boolean;
  created_at: string;
  user_id: string | null;
  plano: PlanoCorretor | null;
}

interface Invite {
  id: string;
  token: string;
  email: string;
  nome: string | null;
  status: string;
  created_at: string;
  expires_at: string;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  slug: string;
  logo_url: string;
  cor_primaria: string;
  plano: PlanoCorretor | null;
}

const CorretoresManager = () => {
  const { toast } = useToast();
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingCorretor, setEditingCorretor] = useState<Corretor | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    slug: "",
    logo_url: "",
    cor_primaria: "#d4a574",
    plano: null,
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNome, setInviteNome] = useState("");
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const fetchCorretores = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("corretores")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar corretores",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCorretores(data || []);
    }
    setIsLoading(false);
  };

  const fetchInvites = async () => {
    const { data, error } = await supabase
      .from("corretor_invites")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInvites(data);
    }
  };

  useEffect(() => {
    fetchCorretores();
    fetchInvites();
  }, []);

  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      nome: value,
      slug: editingCorretor ? prev.slug : generateSlug(value),
    }));
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      slug: "",
      logo_url: "",
      cor_primaria: "#d4a574",
      plano: null,
    });
    setEditingCorretor(null);
  };

  const openEditDialog = (corretor: Corretor) => {
    setEditingCorretor(corretor);
    setFormData({
      nome: corretor.nome,
      email: corretor.email,
      telefone: corretor.telefone || "",
      slug: corretor.slug,
      logo_url: corretor.logo_url || "",
      cor_primaria: corretor.cor_primaria,
      plano: corretor.plano,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.email.trim() || !formData.slug.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, e-mail e slug.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      telefone: formData.telefone.trim() || null,
      slug: formData.slug.trim(),
      logo_url: formData.logo_url.trim() || null,
      cor_primaria: formData.cor_primaria,
      plano: formData.plano,
    };

    if (editingCorretor) {
      const { error } = await supabase
        .from("corretores")
        .update(payload)
        .eq("id", editingCorretor.id);

      if (error) {
        toast({
          title: "Erro ao atualizar corretor",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Corretor atualizado com sucesso!" });
    } else {
      const { error } = await supabase.from("corretores").insert(payload);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Slug já existe",
            description: "Escolha um slug diferente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao criar corretor",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({ title: "Corretor criado com sucesso!" });
    }

    setIsDialogOpen(false);
    resetForm();
    fetchCorretores();
  };

  const toggleAtivo = async (corretor: Corretor) => {
    const { error } = await supabase
      .from("corretores")
      .update({ ativo: !corretor.ativo })
      .eq("id", corretor.id);

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchCorretores();
    }
  };

  const deleteCorretor = async (id: string) => {
    const { error } = await supabase.from("corretores").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir corretor",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Corretor excluído com sucesso!" });
      fetchCorretores();
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/c/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!", description: url });
  };

  const generateInviteToken = () => {
    return crypto.randomUUID();
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      toast({
        title: "E-mail obrigatório",
        description: "Informe o e-mail do corretor.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingInvite(true);

    const token = generateInviteToken();
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from("corretor_invites").insert({
      token,
      email: inviteEmail.trim(),
      nome: inviteNome.trim() || null,
      created_by: user.user?.id,
    });

    if (error) {
      toast({
        title: "Erro ao criar convite",
        description: error.message,
        variant: "destructive",
      });
      setIsCreatingInvite(false);
      return;
    }

    const link = `${window.location.origin}/convite/${token}`;
    setGeneratedLink(link);
    toast({ title: "Convite criado com sucesso!" });
    fetchInvites();
    setIsCreatingInvite(false);
  };

  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!", description: link });
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteNome("");
    setGeneratedLink(null);
  };

  const baseUrl = window.location.origin;

  // Separate pending requests from active corretores
  const pendingCorretores = corretores.filter(c => !c.ativo && c.user_id);
  const activeCorretores = corretores.filter(c => c.ativo);
  const inactiveCorretores = corretores.filter(c => !c.ativo && !c.user_id);

  const approveCorretor = async (corretor: Corretor) => {
    const { error } = await supabase
      .from("corretores")
      .update({ ativo: true })
      .eq("id", corretor.id);

    if (error) {
      toast({
        title: "Erro ao aprovar corretor",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ 
        title: "Corretor aprovado!",
        description: `${corretor.nome} agora pode acessar o sistema.`
      });
      fetchCorretores();
    }
  };

  const rejectCorretor = async (id: string) => {
    const { error } = await supabase.from("corretores").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro ao rejeitar solicitação",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Solicitação rejeitada" });
      fetchCorretores();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Corretores</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os corretores e suas landing pages
          </p>
        </div>
        <div className="flex gap-2">
          {/* Invite Dialog */}
          <Dialog open={isInviteDialogOpen} onOpenChange={(open) => {
            setIsInviteDialogOpen(open);
            if (!open) resetInviteForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Gerar Convite
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Gerar Convite para Corretor</DialogTitle>
              </DialogHeader>
              {generatedLink ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-green-600 mb-2 font-medium">
                      Convite criado com sucesso!
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Envie este link para o corretor:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input value={generatedLink} readOnly className="text-xs" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteLink(generatedLink)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsInviteDialogOpen(false)}
                    >
                      Fechar
                    </Button>
                    <Button
                      type="button"
                      variant="gold"
                      onClick={resetInviteForm}
                    >
                      Novo Convite
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">E-mail do Corretor *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="inviteEmail"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="pl-10"
                        placeholder="corretor@email.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteNome">Nome Sugerido (opcional)</Label>
                    <Input
                      id="inviteNome"
                      value={inviteNome}
                      onChange={(e) => setInviteNome(e.target.value)}
                      placeholder="Nome do corretor"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O convite expira em 7 dias. O corretor receberá um link para criar sua conta e perfil.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsInviteDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" variant="gold" disabled={isCreatingInvite}>
                      {isCreatingInvite ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        "Gerar Convite"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* New Corretor Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="w-4 h-4 mr-2" />
                Novo Corretor
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCorretor ? "Editar Corretor" : "Novo Corretor"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="joao@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, telefone: e.target.value }))
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/c/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="joao-silva"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <LogoUpload
                  value={formData.logo_url}
                  onChange={(url) => setFormData((prev) => ({ ...prev, logo_url: url }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plano">Plano</Label>
                <PlanoSelect
                  value={formData.plano}
                  onChange={(plano) => setFormData((prev) => ({ ...prev, plano }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="gold">
                  {editingCorretor ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Pending Requests Section */}
      {pendingCorretores.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-amber-500" />
              Solicitações Pendentes
              <Badge variant="outline" className="ml-2 bg-amber-500/10 text-amber-600 border-amber-500/30">
                {pendingCorretores.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {pendingCorretores.map((corretor) => (
                <div
                  key={corretor.id}
                  className="flex flex-col gap-4 p-4 rounded-lg bg-background border border-border"
                >
                  {/* Header: Avatar + Nome + Badge */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{corretor.nome}</span>
                        <PlanoBadge plano={corretor.plano} size="sm" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Info: Email, Slug, Telefone */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                    <span className="truncate">{corretor.email}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>/c/{corretor.slug}</span>
                    {corretor.telefone && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>{corretor.telefone}</span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Solicitado em {format(new Date(corretor.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  
                  {/* Botões: Empilhados no mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => openEditDialog(corretor)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-destructive border-destructive/30 hover:bg-destructive/10">
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rejeitar solicitação?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá excluir a solicitação de cadastro de {corretor.nome}. O usuário poderá criar uma nova solicitação depois.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => rejectCorretor(corretor.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Rejeitar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      variant="gold"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => approveCorretor(corretor)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Autorizar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Corretores Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Corretores Ativos</h3>
          <p className="text-sm text-muted-foreground">{activeCorretores.length} corretores</p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeCorretores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p>Nenhum corretor ativo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground font-semibold">Ações</TableHead>
                  <TableHead className="text-foreground font-semibold">Nome</TableHead>
                  <TableHead className="text-foreground font-semibold">Plano</TableHead>
                  <TableHead className="text-foreground font-semibold">E-mail</TableHead>
                  <TableHead className="text-foreground font-semibold">Slug</TableHead>
                  <TableHead className="text-foreground font-semibold">Ativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCorretores.map((corretor) => (
                  <TableRow key={corretor.id} className="border-border hover:bg-secondary/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(corretor)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/dashboard/${corretor.id}`, "_blank")}
                          title="Visualizar dashboard"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir corretor?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Os leads deste corretor
                                permanecerão no sistema mas não terão mais associação.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCorretor(corretor.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {corretor.nome}
                    </TableCell>
                    <TableCell>
                      <PlanoBadge plano={corretor.plano} size="sm" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {corretor.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>/c/{corretor.slug}</span>
                        <button
                          onClick={() => copyLink(corretor.slug)}
                          className="text-primary hover:text-primary/80"
                          title="Copiar link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={`${baseUrl}/c/${corretor.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                          title="Abrir página"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={corretor.ativo}
                        onCheckedChange={() => toggleAtivo(corretor)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Inactive Corretores (created manually without user_id) */}
      {inactiveCorretores.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Corretores Inativos</h3>
            <p className="text-sm text-muted-foreground">{inactiveCorretores.length} corretores sem conta vinculada</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground font-semibold">Nome</TableHead>
                  <TableHead className="text-foreground font-semibold">Plano</TableHead>
                  <TableHead className="text-foreground font-semibold">E-mail</TableHead>
                  <TableHead className="text-foreground font-semibold">Slug</TableHead>
                  <TableHead className="text-foreground font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveCorretores.map((corretor) => (
                  <TableRow key={corretor.id} className="border-border hover:bg-secondary/50">
                    <TableCell className="font-medium text-foreground">
                      {corretor.nome}
                    </TableCell>
                    <TableCell>
                      <PlanoBadge plano={corretor.plano} size="sm" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {corretor.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      /c/{corretor.slug}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(corretor)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir corretor?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCorretor(corretor.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorretoresManager;