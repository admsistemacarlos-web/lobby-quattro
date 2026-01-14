import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import KanbanCard, { KanbanLead } from "./KanbanCard";

export interface KanbanColumnData {
  id: string;
  title: string;
  description: string;
}

interface KanbanColumnProps {
  column: KanbanColumnData;
  leads: KanbanLead[];
}

export default function KanbanColumn({ column, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      className={`
        flex flex-col min-w-[280px] w-[280px] h-full
        bg-muted/20 backdrop-blur-sm rounded-xl border border-border/30
        transition-all duration-200
        ${isOver ? "border-primary/50 bg-primary/5" : ""}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground">{column.title}</h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{column.description}</p>
      </div>

      {/* Cards Container */}
      <ScrollArea className="flex-1 p-3">
        <div
          ref={setNodeRef}
          className="flex flex-col gap-3 min-h-[200px]"
        >
          <SortableContext
            items={leads.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {leads.map((lead) => (
              <KanbanCard key={lead.id} lead={lead} />
            ))}
          </SortableContext>

          {leads.length === 0 && (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-border/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Arraste leads aqui
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
