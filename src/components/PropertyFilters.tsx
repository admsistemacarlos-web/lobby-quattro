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

interface PropertyFiltersProps {
  filters: {
    propertyType: string;
    purpose: string;
    neighborhood: string;
    status: string;
    minBedrooms: string;
    maxBedrooms: string;
    minBathrooms: string;
    maxBathrooms: string;
    minParkingSpots: string;
    maxParkingSpots: string;
    minPrice: string;
    maxPrice: string;
    minArea: string;
    maxArea: string;
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
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "venda_aluguel", label: "Venda ou Aluguel" },
];

const statusOptions = [
  { value: "disponivel", label: "Disponível" },
  { value: "reservado", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
  { value: "alugado", label: "Alugado" },
  { value: "inativo", label: "Inativo" },
];

export function PropertyFilters({ filters, onFilterChange, onClearFilters }: PropertyFiltersProps) {
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
            <label className="text-xs font-medium text-muted-foreground">Tipo</label>
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

          {/* Localização/Bairro */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Bairro/Localização</label>
            <Input
              placeholder="Ex: Centro, Batel"
              value={filters.neighborhood}
              onChange={(e) => onFilterChange("neighborhood", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange("status", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quartos Mín */}
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

          {/* Quartos Máx */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Quartos (máx)</label>
            <Input
              type="number"
              placeholder="Ex: 4"
              value={filters.maxBedrooms}
              onChange={(e) => onFilterChange("maxBedrooms", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Banheiros Mín */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Banheiros (mín)</label>
            <Input
              type="number"
              placeholder="Ex: 1"
              value={filters.minBathrooms}
              onChange={(e) => onFilterChange("minBathrooms", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Banheiros Máx */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Banheiros (máx)</label>
            <Input
              type="number"
              placeholder="Ex: 3"
              value={filters.maxBathrooms}
              onChange={(e) => onFilterChange("maxBathrooms", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Vagas Mín */}
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

          {/* Vagas Máx */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Vagas (máx)</label>
            <Input
              type="number"
              placeholder="Ex: 3"
              value={filters.maxParkingSpots}
              onChange={(e) => onFilterChange("maxParkingSpots", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Preço Mínimo */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Preço Mín (R$)</label>
            <Input
              type="number"
              placeholder="Ex: 200000"
              value={filters.minPrice}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Preço Máximo */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Preço Máx (R$)</label>
            <Input
              type="number"
              placeholder="Ex: 500000"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange("maxPrice", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Área Mínima */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Área Mín (m²)</label>
            <Input
              type="number"
              placeholder="Ex: 50"
              value={filters.minArea}
              onChange={(e) => onFilterChange("minArea", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Área Máxima */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Área Máx (m²)</label>
            <Input
              type="number"
              placeholder="Ex: 200"
              value={filters.maxArea}
              onChange={(e) => onFilterChange("maxArea", e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}