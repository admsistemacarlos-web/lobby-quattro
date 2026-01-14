import { forwardRef } from "react";
import { Bed, Car, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdTemplate, AdColor, getColorHex } from "./types";

type CardType = 'single' | 'cover' | 'intermediate' | 'final';
type FormatMode = 'stories' | 'feed'; // 9:16 vs 4:5

interface AdPreviewCardProps {
  imageUrl: string;
  title: string;
  neighborhood: string;
  customText?: string;
  price: string;
  area: string;
  bedrooms: string;
  parking: string;
  downPayment: string;
  installmentValue: string;
  installmentCount: string;
  cardType: CardType;
  showPrice: boolean;
  cardIndex?: number;
  totalCards?: number;
  template: AdTemplate;
  formatMode?: FormatMode;
  // Color controls
  headlineColor?: AdColor;
  nameColor?: AdColor;
  priceColor?: AdColor;
  iconsColor?: AdColor;
}

export const AdPreviewCard = forwardRef<HTMLDivElement, AdPreviewCardProps>(
  ({ 
    imageUrl, title, neighborhood, customText, price, area, bedrooms, parking, 
    downPayment, installmentValue, installmentCount, cardType, showPrice, 
    cardIndex, totalCards, template, formatMode = 'stories',
    headlineColor = 'white',
    nameColor = 'white',
    priceColor = 'white',
    iconsColor = 'white',
  }, ref) => {
    
    // Get hex colors for inline styles
    const headlineHex = getColorHex(headlineColor);
    const nameHex = getColorHex(nameColor);
    const priceHex = getColorHex(priceColor);
    const iconsHex = getColorHex(iconsColor);

    // Template-specific styles
    const getTemplateStyles = () => {
      switch (template) {
        case 'classic':
          return {
            container: 'border-4 border-amber-600/30',
            overlay: 'bg-gradient-to-t from-black/95 via-black/60 to-transparent',
            badge: 'bg-amber-900/60 border border-amber-600/40',
            cta: 'bg-amber-700 text-amber-50',
            ctaAccent: 'text-amber-300',
          };
        case 'minimal':
          return {
            container: 'border border-white/10',
            overlay: 'bg-gradient-to-t from-black/90 via-black/50 to-transparent',
            badge: 'bg-white/10 backdrop-blur-sm',
            cta: 'bg-white text-black',
            ctaAccent: 'text-white/60',
          };
        default: // modern
          return {
            container: '',
            overlay: 'bg-gradient-to-t from-black/95 via-black/50 to-transparent',
            badge: 'bg-white/20 backdrop-blur-sm',
            cta: 'bg-[#128C7E] text-white',
            ctaAccent: 'text-white/90',
          };
      }
    };

    const styles = getTemplateStyles();

    // Single posts use 9:16 (Stories) or 4:5 (Feed), carousel cards use 1:1
    const isStoriesFormat = cardType === 'single';
    const isFeedMode = formatMode === 'feed';

    // Calculate bottom position based on format
    // Feed (4:5) needs content higher to fit within the cropped area
    // Stories (9:16) has more vertical space
    const getContentPosition = () => {
      if (cardType === 'cover') {
        return "bottom-[12%] px-6"; // Carousel cover - 1:1
      }
      if (isFeedMode) {
        return "bottom-[22%] px-5"; // Feed 4:5 - move content up significantly
      }
      return "bottom-[12%] px-5"; // Stories 9:16 - default
    };

    const renderSingleOrCover = () => (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-2xl overflow-hidden shadow-2xl",
          isStoriesFormat ? "aspect-[9/16]" : "aspect-square",
          styles.container
        )}
        style={{ maxWidth: isStoriesFormat ? '280px' : '400px' }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-[#1a1a2e]">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="" 
              className="w-full h-full object-cover object-center"
              crossOrigin="anonymous"
            />
          )}
        </div>
        
        {/* Strong Gradient Overlay for text readability */}
        <div className={cn("absolute inset-0", styles.overlay)} />
        
        {/* Content - Position adjusted based on format mode */}
        <div className={cn(
          "absolute inset-x-0 flex flex-col items-center text-center",
          getContentPosition()
        )}>
          {/* Headline (Frase de Impacto) */}
          <div className="mb-3">
            <h2 
              className={cn(
                "text-xl font-bold leading-tight",
                template === 'classic' && 'font-serif'
              )}
              style={{ color: headlineHex }}
            >
              {title || 'Frase de Impacto'}
            </h2>
          </div>

          {/* Name/Neighborhood (Nome do Empreendimento) */}
          <p 
            className="text-sm font-medium mb-2"
            style={{ color: nameHex }}
          >
            📍 {neighborhood || 'Empreendimento - Bairro'}
          </p>

          {/* Custom Text (optional) */}
          {customText && (
            <p 
              className="text-sm font-medium tracking-wide mb-3 opacity-80"
              style={{ color: headlineHex }}
            >
              {customText}
            </p>
          )}

          {/* Secondary Info - Down Payment */}
          {showPrice && downPayment && (
            <div className="mb-1">
              <p 
                className="text-lg font-semibold"
                style={{ color: priceHex }}
              >
                Entrada de {downPayment}
              </p>
            </div>
          )}

          {/* Primary Hook (Largest & Boldest) - Installment Price */}
          {showPrice && installmentValue && installmentCount && (
            <div className="mb-4">
              <p 
                className={cn(
                  "text-3xl font-black leading-none",
                  template === 'classic' && 'font-serif'
                )}
                style={{ color: priceHex }}
              >
                {installmentCount}x de {installmentValue}
              </p>
            </div>
          )}

          {/* Details Footer - Icons aligned horizontally centered */}
          {(area || bedrooms || parking) && (
            <div 
              className="flex items-center justify-center gap-5 text-sm"
              style={{ color: iconsHex }}
            >
              {area && (
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4" style={{ color: iconsHex }} />
                  <span>{area}</span>
                </div>
              )}
              {bedrooms && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" style={{ color: iconsHex }} />
                  <span>{bedrooms} qts</span>
                </div>
              )}
              {parking && (
                <div className="flex items-center gap-1.5">
                  <Car className="w-4 h-4" style={{ color: iconsHex }} />
                  <span>{parking} vg</span>
                </div>
              )}
            </div>
          )}

          {/* Valor Total de Venda - discreto no rodapé */}
          {showPrice && price && (
            <p className="text-xs text-white/50 mt-3">
              Valor total: {price}
            </p>
          )}
        </div>

        {/* Card number indicator for carousel */}
        {cardType === 'cover' && totalCards && totalCards > 1 && (
          <div className={cn("absolute top-4 right-4 px-3 py-1 rounded-full", styles.badge)}>
            <span className="text-white text-xs font-medium">1/{totalCards}</span>
          </div>
        )}
      </div>
    );

    const renderIntermediate = () => (
      <div
        ref={ref}
        className={cn(
          "relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl",
          styles.container
        )}
        style={{ maxWidth: '400px' }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-[#1a1a2e]">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="" 
              className="w-full h-full object-cover object-center"
              crossOrigin="anonymous"
            />
          )}
        </div>
        
        {/* Subtle bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Footer Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <div className="flex items-center justify-center gap-4 text-sm" style={{ color: iconsHex }}>
            {showPrice && price ? (
              <span className="text-lg font-bold" style={{ color: priceHex }}>{price}</span>
            ) : (
              <>
                {area && (
                  <div className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    <span>{area}</span>
                  </div>
                )}
                {bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{bedrooms} qts</span>
                  </div>
                )}
                {parking && (
                  <div className="flex items-center gap-1">
                    <Car className="w-4 h-4" />
                    <span>{parking} vg</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Card number indicator */}
        {cardIndex !== undefined && totalCards && (
          <div className={cn("absolute top-4 right-4 px-3 py-1 rounded-full", styles.badge)}>
            <span className="text-white text-xs font-medium">{cardIndex + 1}/{totalCards}</span>
          </div>
        )}
      </div>
    );

    const renderFinal = () => (
      <div
        ref={ref}
        className={cn(
          "relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl",
          styles.container
        )}
        style={{ maxWidth: '400px' }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-[#1a1a2e]">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="" 
              className="w-full h-full object-cover object-center"
              crossOrigin="anonymous"
            />
          )}
        </div>
        
        {/* Dark overlay for CTA focus */}
        <div className={cn(
          "absolute inset-0",
          template === 'classic' ? 'bg-amber-950/70' :
          template === 'minimal' ? 'bg-black/75' :
          'bg-black/60'
        )} />
        
        {/* CTA Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <h3 className={cn(
            "text-2xl mb-2",
            template === 'classic' ? 'font-serif text-amber-50' :
            template === 'minimal' ? 'font-light tracking-wide text-white' :
            'font-bold text-white'
          )}>
            {template === 'minimal' ? 'AGENDE UMA VISITA' : 'Gostou?'}
          </h3>
          {template !== 'minimal' && (
            <p className={cn("text-lg mb-6", styles.ctaAccent)}>
              {template === 'classic' ? 'Agende sua visita exclusiva' : 'Agende uma visita'}
            </p>
          )}
          
          {/* CTA Text */}
          <div className={cn(
            "px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 text-sm font-semibold shadow-lg",
            styles.cta,
            template === 'minimal' && 'mt-4'
          )}>
            <span>Fale Conosco</span>
          </div>
        </div>

        {/* Card number indicator */}
        {totalCards && (
          <div className={cn("absolute top-4 right-4 px-3 py-1 rounded-full", styles.badge)}>
            <span className="text-white text-xs font-medium">{totalCards}/{totalCards}</span>
          </div>
        )}
      </div>
    );

    switch (cardType) {
      case 'single':
      case 'cover':
        return renderSingleOrCover();
      case 'intermediate':
        return renderIntermediate();
      case 'final':
        return renderFinal();
      default:
        return renderSingleOrCover();
    }
  }
);

AdPreviewCard.displayName = 'AdPreviewCard';
