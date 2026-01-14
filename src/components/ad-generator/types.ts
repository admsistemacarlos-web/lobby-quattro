export type AdFormat = 'single' | 'carousel';
export type AdTemplate = 'modern' | 'classic' | 'minimal';

export type AdColor = 'white' | 'gold' | 'emerald' | 'orange' | 'blue';

export const colorOptions: { value: AdColor; label: string; hex: string }[] = [
  { value: 'white', label: 'Branco', hex: '#FFFFFF' },
  { value: 'gold', label: 'Dourado', hex: '#FFB300' },
  { value: 'emerald', label: 'Esmeralda', hex: '#2ecc71' },
  { value: 'orange', label: 'Laranja', hex: '#E67E22' },
  { value: 'blue', label: 'Azul', hex: '#0F52BA' },
];

export const getColorHex = (color: AdColor): string => {
  return colorOptions.find(c => c.value === color)?.hex || '#FFFFFF';
};

export interface AdFormData {
  format: AdFormat;
  template: AdTemplate;
  images: File[];
  imageUrls: string[];
  title: string;
  neighborhood: string;
  customText: string;
  price: string;
  highlightPriceOnCover: boolean;
  area: string;
  bedrooms: string;
  parking: string;
  downPayment: string;
  installmentValue: string;
  installmentCount: string;
  // Color controls
  headlineColor: AdColor;
  nameColor: AdColor;
  priceColor: AdColor;
  iconsColor: AdColor;
}

export interface AdGeneratorProps {
  corretorId?: string;
  corretorSlug?: string;
}

export const initialFormData: AdFormData = {
  format: 'single',
  template: 'modern',
  images: [],
  imageUrls: [],
  title: '',
  neighborhood: '',
  customText: '',
  price: '',
  highlightPriceOnCover: true,
  area: '',
  bedrooms: '',
  parking: '',
  downPayment: '',
  installmentValue: '',
  installmentCount: '',
  // Default colors
  headlineColor: 'white',
  nameColor: 'white',
  priceColor: 'white',
  iconsColor: 'white',
};

export const templateConfig = {
  modern: {
    name: 'Moderno',
    description: 'Design arrojado com gradientes e sombras',
    icon: '✨',
  },
  classic: {
    name: 'Clássico',
    description: 'Elegante com bordas e tipografia serif',
    icon: '🏛️',
  },
  minimal: {
    name: 'Minimalista',
    description: 'Limpo e direto ao ponto',
    icon: '◻️',
  },
} as const;
