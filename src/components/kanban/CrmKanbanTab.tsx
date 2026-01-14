import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import KanbanBoard from "./KanbanBoard";
import { KanbanLead } from "./KanbanCard";
import NewLeadDialog from "./NewLeadDialog";

interface CrmKanbanTabProps {
  corretorId: string;
}

interface LeadFromDB {
  id: string;
  name: string;
  empreendimento: string | null;
  valor_estimado: number | null;
  temperature: string | null;
  crm_status: string | null;
  anuncio: { nome: string } | null;
}

export default function CrmKanbanTab({ corretorId }: CrmKanbanTabProps) {
  const { toast } = useToast();
  const [leads, setLeads] = useState<KanbanLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, empreendimento, valor_estimado, temperature, crm_status, anuncio:anuncios(nome)")
      .eq("corretor_id", corretorId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar leads",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const mappedLeads: KanbanLead[] = (data || []).map((lead: LeadFromDB) => ({
      id: lead.id,
      clientName: lead.name,
      propertyName: lead.empreendimento,
      value: lead.valor_estimado || 0,
      temperature: (lead.temperature as "quente" | "morno" | "frio") || "morno",
      columnId: lead.crm_status || "novo",
      anuncioNome: lead.anuncio?.nome || null,
    }));

    setLeads(mappedLeads);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [corretorId]);

  const handleUpdateLead = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ crm_status: newStatus })
      .eq("id", leadId);

    if (error) {
      toast({
        title: "Erro ao atualizar lead",
        description: error.message,
        variant: "destructive",
      });
      fetchLeads();
    }
  };

  const handleLeadCreated = () => {
    setIsDialogOpen(false);
    fetchLeads();
    toast({
      title: "Lead criado com sucesso",
      description: "O novo lead foi adicionado ao quadro.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} no quadro
        </p>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <p className="text-muted-foreground mb-2">Nenhum lead encontrado.</p>
          <p className="text-sm text-muted-foreground mb-4">
            Crie um lead manualmente ou aguarde leads das suas landing pages.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Lead
          </Button>
        </div>
      ) : (
        <KanbanBoard leads={leads} onUpdateLead={handleUpdateLead} />
      )}

      <NewLeadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        corretorId={corretorId}
        onSuccess={handleLeadCreated}
      />
    </div>
  );
}
