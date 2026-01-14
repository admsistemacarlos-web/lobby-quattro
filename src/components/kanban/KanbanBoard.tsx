import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn, { KanbanColumnData } from "./KanbanColumn";
import KanbanCard, { KanbanLead } from "./KanbanCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

const columns: KanbanColumnData[] = [
  { id: "novo", title: "Novo", description: "Leads recém-chegados" },
  { id: "em_atendimento", title: "Em Atendimento", description: "Primeiro contato feito" },
  { id: "visita_agendada", title: "Visita Agendada", description: "Visita ao imóvel marcada" },
  { id: "proposta", title: "Proposta", description: "Negociação em andamento" },
  { id: "vendido", title: "Vendido", description: "Negócio fechado" },
];

// Abbreviated titles for mobile tabs
const mobileColumnTitles: Record<string, string> = {
  novo: "Novo",
  em_atendimento: "Atend.",
  visita_agendada: "Visita",
  proposta: "Prop.",
  vendido: "Vendido",
};

interface KanbanBoardProps {
  leads: KanbanLead[];
  onUpdateLead: (leadId: string, newStatus: string) => Promise<void>;
}

export default function KanbanBoard({ leads, onUpdateLead }: KanbanBoardProps) {
  const [localLeads, setLocalLeads] = useState<KanbanLead[]>(leads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeLead = activeId ? localLeads.find((l) => l.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    const activeLead = localLeads.find((l) => l.id === activeLeadId);
    if (!activeLead) return;

    // Check if we're over a column
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn) {
      // Move to column if it's different
      if (activeLead.columnId !== overColumn.id) {
        setLocalLeads((leads) =>
          leads.map((lead) =>
            lead.id === activeLeadId
              ? { ...lead, columnId: overColumn.id }
              : lead
          )
        );
      }
      return;
    }

    // Check if we're over another lead
    const overLead = localLeads.find((l) => l.id === overId);
    if (overLead && activeLead.columnId !== overLead.columnId) {
      setLocalLeads((leads) =>
        leads.map((lead) =>
          lead.id === activeLeadId
            ? { ...lead, columnId: overLead.columnId }
            : lead
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    const activeLead = localLeads.find((l) => l.id === activeLeadId);
    if (!activeLead) return;

    // If over a column directly, just place at the end
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn) {
      setLocalLeads((leads) =>
        leads.map((lead) =>
          lead.id === activeLeadId
            ? { ...lead, columnId: overColumn.id }
            : lead
        )
      );
      // Persist to database
      await onUpdateLead(activeLeadId, overColumn.id);
      return;
    }

    // If over another lead, reorder within the column
    const overLead = localLeads.find((l) => l.id === overId);
    if (overLead && activeLead.columnId === overLead.columnId) {
      const columnLeads = localLeads.filter((l) => l.columnId === activeLead.columnId);
      const oldIndex = columnLeads.findIndex((l) => l.id === activeLeadId);
      const newIndex = columnLeads.findIndex((l) => l.id === overId);

      if (oldIndex !== newIndex) {
        const newColumnLeads = arrayMove(columnLeads, oldIndex, newIndex);
        const otherLeads = localLeads.filter((l) => l.columnId !== activeLead.columnId);
        setLocalLeads([...otherLeads, ...newColumnLeads]);
      }
    } else if (overLead) {
      // Moving to different column via hovering over a lead
      await onUpdateLead(activeLeadId, overLead.columnId);
    }
  };

  const getLeadsForColumn = (columnId: string) =>
    localLeads.filter((lead) => lead.columnId === columnId);

  // Mobile: Tab-based layout
  if (isMobile) {
    return (
      <Tabs defaultValue="novo" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          {columns.map((col) => (
            <TabsTrigger
              key={col.id}
              value={col.id}
              className="text-xs px-1 py-2"
            >
              {mobileColumnTitles[col.id]}
              <span className="ml-1 text-muted-foreground">
                ({getLeadsForColumn(col.id).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {columns.map((col) => (
          <TabsContent key={col.id} value={col.id} className="mt-0">
            <div className="bg-muted/20 rounded-xl border border-border/30 p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-foreground">{col.title}</h3>
                <p className="text-xs text-muted-foreground">{col.description}</p>
              </div>
            <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                <div className="space-y-3 pr-2">
                  {getLeadsForColumn(col.id).map((lead) => (
                    <KanbanCard 
                      key={lead.id} 
                      lead={lead} 
                      onStatusChange={onUpdateLead}
                      columns={columns}
                    />
                  ))}
                  {getLeadsForColumn(col.id).length === 0 && (
                    <div className="flex items-center justify-center h-24 border-2 border-dashed border-border/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Nenhum lead nesta etapa
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  // Desktop: Traditional Kanban with drag & drop
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-300px)] min-h-[500px]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            leads={getLeadsForColumn(column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="rotate-3 scale-105">
            <KanbanCard lead={activeLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
