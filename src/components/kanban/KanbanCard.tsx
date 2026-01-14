import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Flame, Thermometer, Snowflake } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export interface KanbanLead {
  id: string;
  clientName: string;
  propertyName: string | null;
  value: number;
  temperature: "quente" | "morno" | "frio";
  columnId: string;
  anuncioNome?: string | null;
}

interface KanbanColumn {
  id: string;
  title: string;
  description: string;
}

interface KanbanCardProps {
  lead: KanbanLead;
  onStatusChange?: (leadId: string, newStatus: string) => Promise<void>;
  columns?: KanbanColumn[];
}

const temperatureConfig = {
  quente: {
    label: "Quente",
    icon: Flame,
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  morno: {
    label: "Morno",
    icon: Thermometer,
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  frio: {
    label: "Frio",
    icon: Snowflake,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function KanbanCard({ lead, onStatusChange, columns }: KanbanCardProps) {
  const isMobile = useIsMobile();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const tempConfig = temperatureConfig[lead.temperature];
  const TempIcon = tempConfig.icon;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        bg-card/80 backdrop-blur-sm border-border/50 
        hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-50 shadow-2xl scale-105 z-50" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge
            variant="outline"
            className={`text-xs font-medium ${tempConfig.className}`}
          >
            <TempIcon className="w-3 h-3 mr-1" />
            {tempConfig.label}
          </Badge>
          <GripVertical className="w-4 h-4 text-muted-foreground/50" />
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-sm leading-tight">
            {lead.clientName}
          </h4>
          {lead.propertyName && (
            <p className="text-xs text-muted-foreground leading-tight">
              {lead.propertyName}
            </p>
          )}
          {lead.value > 0 && (
            <p className="text-sm font-bold text-primary">
              {formatCurrency(lead.value)}
            </p>
          )}
          {lead.anuncioNome && (
            <Badge variant="secondary" className="text-xs mt-2">
              via {lead.anuncioNome}
            </Badge>
          )}
          {!lead.anuncioNome && (
            <Badge variant="outline" className="text-xs mt-2 text-muted-foreground">
              Landing Page
            </Badge>
          )}

          {/* Mobile: Status change dropdown */}
          {isMobile && onStatusChange && columns && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <Select
                value={lead.columnId}
                onValueChange={(value) => onStatusChange(lead.id, value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Mudar status" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id} className="text-xs">
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
