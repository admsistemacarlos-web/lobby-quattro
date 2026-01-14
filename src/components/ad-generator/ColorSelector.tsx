import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdColor, colorOptions } from "./types";

interface ColorSelectorProps {
  label: string;
  value: AdColor;
  onChange: (value: AdColor) => void;
}

export const ColorSelector = ({ label, value, onChange }: ColorSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as AdColor)}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: colorOptions.find(c => c.value === value)?.hex }}
              />
              <span>{colorOptions.find(c => c.value === value)?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50">
          {colorOptions.map((color) => (
            <SelectItem key={color.value} value={color.value}>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
