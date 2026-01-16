import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientFiltersProps {
  filters: {
    propertyType: string;
    purpose: string;
    neighborhoods: string;
    origin: string;
    minBedrooms: string;
    minParkingSpots: string;
    minBudget: string;
    maxBudget: string;
    downPayment: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

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

export function ClientFilters({ filters, onFilterChange, onClearFilters }: ClientFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Filtros Avançados</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Tipo de Imóvel */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Tipo de Imóvel</label>
            <Select
              value={filters.propertyType}
              onValueChange={(value) => onFilterChange("propertyType", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
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

          {/* Finalidade */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Finalidade</label>
            <Select
              value={filters.purpose}
              onValueChange={(value) => onFilterChange("purpose", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
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

          {/* Bairros de Interesse */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Bairros</label>
            <Input
              placeholder="Ex: Centro, Batel"
              value={filters.neighborhoods}
              onChange={(e) => onFilterChange("neighborhoods", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Origem do Lead */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Origem</label>
            <Select
              value={filters.origin}
              onValueChange={(value) => onFilterChange("origin", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {originOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quartos Mínimos */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Quartos (mín)</label>
            <Input
              type="number"
              placeholder="Ex: 2"
              value={filters.minBedrooms}
              onChange={(e) => onFilterChange("minBedrooms", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Vagas Mínimas */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Vagas (mín)</label>
            <Input
              type="number"
              placeholder="Ex: 1"
              value={filters.minParkingSpots}
              onChange={(e) => onFilterChange("minParkingSpots", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Valor Mínimo */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Valor Mínimo (R$)</label>
            <Input
              type="number"
              placeholder="Ex: 200000"
              value={filters.minBudget}
              onChange={(e) => onFilterChange("minBudget", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Valor Máximo */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Valor Máximo (R$)</label>
            <Input
              type="number"
              placeholder="Ex: 500000"
              value={filters.maxBudget}
              onChange={(e) => onFilterChange("maxBudget", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Valor de Entrada */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Entrada (R$)</label>
            <Input
              type="number"
              placeholder="Ex: 50000"
              value={filters.downPayment}
              onChange={(e) => onFilterChange("downPayment", e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}