import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, DollarSign, Home, Bed, Car, MapPin, Ruler, MessageSquare, CreditCard, Calculator, Palette } from "lucide-react";
import { AdFormData, AdFormat, AdTemplate, AdColor } from "./types";
import { FormatSelector } from "./FormatSelector";
import { TemplateSelector } from "./TemplateSelector";
import { ColorSelector } from "./ColorSelector";
import { useToast } from "@/hooks/use-toast";

interface AdGeneratorFormProps {
  formData: AdFormData;
  onChange: (data: Partial<AdFormData>) => void;
}

export const AdGeneratorForm = ({ formData, onChange }: AdGeneratorFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFormatChange = (format: AdFormat) => {
    onChange({ format, images: [], imageUrls: [] });
  };

  const handleTemplateChange = (template: AdTemplate) => {
    onChange({ template });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = formData.format === 'single' ? 1 : 5;

    // Para post único: substituir a imagem
    if (formData.format === 'single') {
      if (files.length > 0) {
        formData.imageUrls.forEach(url => URL.revokeObjectURL(url));
        const urls = files.slice(0, 1).map(file => URL.createObjectURL(file));
        onChange({ images: files.slice(0, 1), imageUrls: urls });
      }
      return;
    }

    // Para carrossel: ACUMULAR imagens (não substituir)
    const currentCount = formData.images.length;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      toast({
        title: "Limite atingido",
        description: `Máximo de ${maxImages} imagens. Remova alguma para adicionar novas.`,
        variant: "destructive",
      });
      return;
    }

    // Pegar apenas as imagens que cabem
    const filesToAdd = files.slice(0, availableSlots);
    const newUrls = filesToAdd.map(file => URL.createObjectURL(file));

    // Combinar com as imagens existentes
    onChange({
      images: [...formData.images, ...filesToAdd],
      imageUrls: [...formData.imageUrls, ...newUrls],
    });

    // Avisar se algumas foram ignoradas
    if (files.length > availableSlots) {
      toast({
        title: "Algumas imagens não foram adicionadas",
        description: `Limite de ${maxImages} imagens atingido.`,
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(formData.imageUrls[index]);
    onChange({ images: newImages, imageUrls: newUrls });
  };

  const formatPrice = (value: string, withDecimals = false) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = withDecimals ? parseInt(numbers, 10) / 100 : parseInt(numbers, 10);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: withDecimals ? 2 : 0,
    }).format(amount);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    onChange({ price: formatted });
  };

  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    onChange({ downPayment: formatted });
  };

  const handleInstallmentValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value, true);
    onChange({ installmentValue: formatted });
  };

  return (
    <div className="space-y-6">
      {/* Format Selector */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Formato do Anúncio</Label>
        <FormatSelector format={formData.format} onChange={handleFormatChange} />
      </div>

      {/* Template Selector */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Estilo do Template</Label>
        <TemplateSelector template={formData.template} onChange={handleTemplateChange} />
      </div>

      {/* Image Upload */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          {formData.format === 'single' 
            ? 'Imagem do Anúncio' 
            : `Imagens do Carrossel (${formData.imageUrls.length}/5)`}
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={formData.format === 'carousel'}
          onChange={handleImageUpload}
          className="hidden"
        />
        
        {formData.imageUrls.length === 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-dashed border-2 hover:border-primary hover:bg-primary/5"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Clique para fazer upload
              </span>
            </div>
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-xs bg-background/80 px-1.5 py-0.5 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={formData.format === 'carousel' && formData.imageUrls.length >= 5}
            >
              <Upload className="w-4 h-4 mr-2" />
              {formData.format === 'carousel' 
                ? `Adicionar imagens (${formData.imageUrls.length}/5)` 
                : 'Alterar imagem'}
            </Button>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium mb-2 flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" />
            Frase de Impacto (Headline)
          </Label>
          <Input
            id="title"
            placeholder="Ex: More no Centro pagando pouco"
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="neighborhood" className="text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Nome do Empreendimento e Bairro
          </Label>
          <Input
            id="neighborhood"
            placeholder="Ex: Zion - Jd. Botânico"
            value={formData.neighborhood}
            onChange={(e) => onChange({ neighborhood: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="customText" className="text-sm font-medium mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Texto Personalizado (opcional)
          </Label>
          <Textarea
            id="customText"
            placeholder="Ex: Oportunidade única! Aceita financiamento..."
            value={formData.customText}
            onChange={(e) => onChange({ customText: e.target.value.slice(0, 80) })}
            maxLength={80}
            className="resize-none h-20"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {formData.customText?.length || 0}/80 caracteres
          </p>
        </div>

        <div>
          <Label htmlFor="price" className="text-sm font-medium mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Valor Total de Venda
          </Label>
          <Input
            id="price"
            value={formData.price}
            onChange={handlePriceChange}
          />
        </div>

        {formData.format === 'carousel' && (
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="highlightPrice"
              checked={formData.highlightPriceOnCover}
              onCheckedChange={(checked) => onChange({ highlightPriceOnCover: !!checked })}
            />
            <Label htmlFor="highlightPrice" className="text-sm cursor-pointer">
              Destacar preço na capa/primeira foto
            </Label>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="area" className="text-sm font-medium mb-2 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" />
              Metragem
            </Label>
            <div className="relative">
              <Input
                id="area"
                type="number"
                value={formData.area.replace(/[^\d]/g, '')}
                onChange={(e) => onChange({ area: e.target.value ? `${e.target.value}m²` : '' })}
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                m²
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="bedrooms" className="text-sm font-medium mb-2 flex items-center gap-2">
              <Bed className="w-4 h-4 text-primary" />
              Quartos
            </Label>
            <Input
              id="bedrooms"
              value={formData.bedrooms}
              onChange={(e) => onChange({ bedrooms: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="parking" className="text-sm font-medium mb-2 flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Vagas
            </Label>
            <Input
              id="parking"
              value={formData.parking}
              onChange={(e) => onChange({ parking: e.target.value })}
            />
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Condições de Pagamento
          </Label>
          
          <div>
            <Label htmlFor="downPayment" className="text-sm text-muted-foreground mb-2 block">
              Valor da Entrada
            </Label>
            <Input
              id="downPayment"
              value={formData.downPayment}
              onChange={handleDownPaymentChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="installmentCount" className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                Nº de Parcelas
              </Label>
              <Input
                id="installmentCount"
                type="number"
                value={formData.installmentCount}
                onChange={(e) => onChange({ installmentCount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="installmentValue" className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Valor da Parcela
              </Label>
              <Input
                id="installmentValue"
                value={formData.installmentValue}
                onChange={handleInstallmentValueChange}
              />
            </div>
          </div>
        </div>

        {/* Color Customization */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Cores do Anúncio
          </Label>
          
          <div className="grid grid-cols-2 gap-3">
            <ColorSelector
              label="Cor da Headline"
              value={formData.headlineColor}
              onChange={(color) => onChange({ headlineColor: color })}
            />
            <ColorSelector
              label="Cor do Nome/Bairro"
              value={formData.nameColor}
              onChange={(color) => onChange({ nameColor: color })}
            />
            <ColorSelector
              label="Cor do Preço/Destaque"
              value={formData.priceColor}
              onChange={(color) => onChange({ priceColor: color })}
            />
            <ColorSelector
              label="Cor dos Ícones"
              value={formData.iconsColor}
              onChange={(color) => onChange({ iconsColor: color })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
