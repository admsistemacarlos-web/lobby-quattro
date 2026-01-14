import { useRef, useState, useEffect } from "react";
import { Download, Check, Loader2, Archive, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdFormData } from "./types";
import { AdPreviewCard } from "./AdPreviewCard";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdPreviewProps {
  formData: AdFormData;
}

export const AdPreview = ({ formData }: AdPreviewProps) => {
  const { toast } = useToast();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const feedCardRef = useRef<HTMLDivElement | null>(null);

  const [feedDownloaded, setFeedDownloaded] = useState(false);
  const [storiesDownloaded, setStoriesDownloaded] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);
  const [isDownloadingFeed, setIsDownloadingFeed] = useState(false);
  const [isDownloadingStories, setIsDownloadingStories] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  
  // Carousel modal state (fallback for mobile when multi-file share not supported)
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Reset states when form data changes
  useEffect(() => {
    setFeedDownloaded(false);
    setStoriesDownloaded(false);
    setZipDownloaded(false);
  }, [
    formData.imageUrls,
    formData.title,
    formData.neighborhood,
    formData.customText,
    formData.price,
    formData.area,
    formData.bedrooms,
    formData.parking,
    formData.downPayment,
    formData.installmentValue,
    formData.installmentCount,
    formData.template,
    formData.highlightPriceOnCover,
    formData.headlineColor,
    formData.nameColor,
    formData.priceColor,
    formData.iconsColor,
  ]);

  // Detect mobile device (iOS or Android)
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  };

  // Check if Web Share API with files is supported
  const canShareFiles = () => {
    return typeof navigator.share !== 'undefined' && typeof navigator.canShare !== 'undefined';
  };

  // Convert data URL to File object for sharing
  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: 'image/png' });
  };

  // Share file on mobile using Web Share API
  const shareFile = async (dataUrl: string, fileName: string): Promise<boolean> => {
    try {
      const file = await dataUrlToFile(dataUrl, fileName);
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileName,
        });
        return true;
      }
      return false;
    } catch (error) {
      // User cancelled or share failed
      console.log('Share cancelled or failed:', error);
      return false;
    }
  };

  // Simple capture function
  const captureCard = async (
    cardElement: HTMLDivElement,
    targetWidth: number,
    targetHeight: number
  ): Promise<string | null> => {
    try {
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1a1a2e',
        logging: false,
        imageTimeout: 15000,
        width: cardElement.offsetWidth,
        height: cardElement.offsetHeight,
      });

      // Validate canvas dimensions
      if (!canvas.width || !canvas.height || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Invalid canvas dimensions');
      }

      // Create final canvas with target dimensions
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const ctx = finalCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Fill background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calculate scaling - cover the target area
      const scale = Math.max(targetWidth / canvas.width, targetHeight / canvas.height);
      const drawWidth = canvas.width * scale;
      const drawHeight = canvas.height * scale;
      const offsetX = (targetWidth - drawWidth) / 2;
      const offsetY = (targetHeight - drawHeight) / 2;

      // Validate calculated values
      if (!isFinite(drawWidth) || !isFinite(drawHeight) || !isFinite(offsetX) || !isFinite(offsetY)) {
        throw new Error('Invalid calculated dimensions');
      }

      ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);

      return finalCanvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Capture error:', error);
      return null;
    }
  };

  // Download via link click
  const downloadFromDataUrl = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Feed (1080x1350 - 4:5)
  const handleDownloadFeed = async () => {
    if (!feedCardRef.current) return;
    
    setIsDownloadingFeed(true);
    try {
      const dataUrl = await captureCard(feedCardRef.current, 1080, 1350);
      
      if (!dataUrl) {
        throw new Error('Capture failed');
      }

      const fileName = `${formData.title || 'anuncio'}-feed-1080x1350.png`;
      
      // Mobile: try Web Share API
      if (isMobile() && canShareFiles()) {
        const shared = await shareFile(dataUrl, fileName);
        if (shared) {
          setFeedDownloaded(true);
          toast({
            title: "Compartilhado!",
            description: "Arte para Feed (1080x1350) compartilhada.",
          });
        }
        // If share was cancelled, do nothing
      } else {
        // Desktop: force download
        downloadFromDataUrl(dataUrl, fileName);
        setFeedDownloaded(true);
        toast({
          title: "Download concluído!",
          description: "Arte para Feed (1080x1350) salva.",
        });
      }
    } catch (error) {
      console.error('Feed download error:', error);
      toast({
        title: "Erro no processamento",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingFeed(false);
    }
  };

  // Download Stories (1080x1920 - 9:16)
  const handleDownloadStories = async () => {
    const cardElement = cardRefs.current[0];
    if (!cardElement) return;
    
    setIsDownloadingStories(true);
    try {
      const dataUrl = await captureCard(cardElement, 1080, 1920);
      
      if (!dataUrl) {
        throw new Error('Capture failed');
      }

      const fileName = `${formData.title || 'anuncio'}-stories-1080x1920.png`;
      
      // Mobile: try Web Share API
      if (isMobile() && canShareFiles()) {
        const shared = await shareFile(dataUrl, fileName);
        if (shared) {
          setStoriesDownloaded(true);
          toast({
            title: "Compartilhado!",
            description: "Arte para Stories (1080x1920) compartilhada.",
          });
        }
        // If share was cancelled, do nothing
      } else {
        // Desktop: force download
        downloadFromDataUrl(dataUrl, fileName);
        setStoriesDownloaded(true);
        toast({
          title: "Download concluído!",
          description: "Arte para Stories (1080x1920) salva.",
        });
      }
    } catch (error) {
      console.error('Stories download error:', error);
      toast({
        title: "Erro no processamento",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingStories(false);
    }
  };

  // Download Carousel as ZIP (or share on mobile)
  const handleDownloadCarousel = async () => {
    setIsDownloadingZip(true);
    try {
      const generatedImages: string[] = [];
      
      for (let i = 0; i < formData.imageUrls.length; i++) {
        const cardElement = cardRefs.current[i];
        if (!cardElement) continue;

        const dataUrl = await captureCard(cardElement, 1080, 1080);
        if (dataUrl) {
          generatedImages.push(dataUrl);
        }
      }

      if (generatedImages.length === 0) {
        throw new Error('No images captured');
      }

      // Mobile: try Web Share API with multiple files
      if (isMobile() && canShareFiles()) {
        try {
          const files: File[] = [];
          for (let i = 0; i < generatedImages.length; i++) {
            const file = await dataUrlToFile(
              generatedImages[i],
              `card-${String(i + 1).padStart(2, '0')}.png`
            );
            files.push(file);
          }
          
          if (navigator.canShare && navigator.canShare({ files })) {
            await navigator.share({
              files,
              title: `${formData.title || 'carrossel'} - ${files.length} artes`,
            });
            setZipDownloaded(true);
            toast({
              title: "Compartilhado!",
              description: `${generatedImages.length} artes compartilhadas.`,
            });
          } else {
            // Fallback: show modal for individual saving
            setCarouselImages(generatedImages);
            setCurrentCarouselIndex(0);
            setShowCarouselModal(true);
            setZipDownloaded(true);
          }
        } catch (error) {
          // Share cancelled - do nothing
          console.log('Share cancelled:', error);
        }
      } else {
        // Desktop: download as ZIP
        const zip = new JSZip();
        
        for (let i = 0; i < generatedImages.length; i++) {
          const base64Data = generatedImages[i].split(',')[1];
          zip.file(`card-${String(i + 1).padStart(2, '0')}.png`, base64Data, { base64: true });
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.download = `${formData.title || 'carrossel'}-artes.zip`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setZipDownloaded(true);
        toast({
          title: "Download concluído!",
          description: `ZIP com ${generatedImages.length} artes baixado.`,
        });
      }
    } catch (error) {
      console.error('Carousel download error:', error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível gerar as artes.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const renderSinglePost = () => {
    if (formData.imageUrls.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">
            Adicione uma imagem para visualizar
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Preview visível (Stories 9:16) */}
        <AdPreviewCard
          ref={(el) => (cardRefs.current[0] = el)}
          imageUrl={formData.imageUrls[0]}
          title={formData.title}
          neighborhood={formData.neighborhood}
          customText={formData.customText}
          price={formData.price}
          area={formData.area}
          bedrooms={formData.bedrooms}
          parking={formData.parking}
          downPayment={formData.downPayment}
          installmentValue={formData.installmentValue}
          installmentCount={formData.installmentCount}
          cardType="single"
          showPrice={true}
          template={formData.template}
          formatMode="stories"
          headlineColor={formData.headlineColor}
          nameColor={formData.nameColor}
          priceColor={formData.priceColor}
          iconsColor={formData.iconsColor}
        />

        {/* Hidden Feed card (4:5) for export - using fixed dimensions */}
        <div 
          className="fixed -left-[2000px] top-0 pointer-events-none" 
          aria-hidden="true"
          style={{ width: '400px', height: '500px' }}
        >
          <AdPreviewCard
            ref={feedCardRef}
            imageUrl={formData.imageUrls[0]}
            title={formData.title}
            neighborhood={formData.neighborhood}
            customText={formData.customText}
            price={formData.price}
            area={formData.area}
            bedrooms={formData.bedrooms}
            parking={formData.parking}
            downPayment={formData.downPayment}
            installmentValue={formData.installmentValue}
            installmentCount={formData.installmentCount}
            cardType="single"
            showPrice={true}
            template={formData.template}
            formatMode="feed"
            headlineColor={formData.headlineColor}
            nameColor={formData.nameColor}
            priceColor={formData.priceColor}
            iconsColor={formData.iconsColor}
          />
        </div>

        {/* Download buttons only */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownloadFeed}
            variant={feedDownloaded ? "outline" : "gold"}
            disabled={feedDownloaded || isDownloadingFeed}
            className="flex-1"
          >
            {isDownloadingFeed ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : feedDownloaded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Baixado
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Salvar Feed (4:5)
              </>
            )}
          </Button>

          <Button
            onClick={handleDownloadStories}
            variant={storiesDownloaded ? "outline" : "gold"}
            disabled={storiesDownloaded || isDownloadingStories}
            className="flex-1"
          >
            {isDownloadingStories ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : storiesDownloaded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Baixado
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Salvar Stories (9:16)
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderCarousel = () => {
    if (formData.imageUrls.length < 2) {
      return (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm text-center px-4">
            Adicione pelo menos 2 imagens para visualizar o carrossel
          </p>
        </div>
      );
    }

    const totalCards = formData.imageUrls.length;

    return (
      <div className="space-y-6">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {formData.imageUrls.map((url, index) => {
            const isFirst = index === 0;
            const isLast = index === totalCards - 1;

            let cardType: 'cover' | 'intermediate' | 'final' = 'intermediate';
            let showPrice = false;

            if (isFirst) {
              cardType = 'cover';
              showPrice = formData.highlightPriceOnCover;
            } else if (isLast) {
              cardType = 'final';
              showPrice = false;
            } else {
              cardType = 'intermediate';
              showPrice = index === 1 && !formData.highlightPriceOnCover;
            }

            return (
              <div key={index} className="flex-shrink-0 snap-center" style={{ width: '300px' }}>
                <AdPreviewCard
                  ref={(el) => (cardRefs.current[index] = el)}
                  imageUrl={url}
                  title={formData.title}
                  neighborhood={formData.neighborhood}
                  customText={formData.customText}
                  price={formData.price}
                  area={formData.area}
                  bedrooms={formData.bedrooms}
                  parking={formData.parking}
                  downPayment={formData.downPayment}
                  installmentValue={formData.installmentValue}
                  installmentCount={formData.installmentCount}
                  cardType={cardType}
                  showPrice={showPrice}
                  cardIndex={index}
                  totalCards={totalCards}
                  template={formData.template}
                  headlineColor={formData.headlineColor}
                  nameColor={formData.nameColor}
                  priceColor={formData.priceColor}
                  iconsColor={formData.iconsColor}
                />
              </div>
            );
          })}
        </div>

        {totalCards < 2 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Adicione pelo menos 2 imagens para baixar o carrossel
          </p>
        ) : (
          <Button
            onClick={handleDownloadCarousel}
            variant={zipDownloaded ? "outline" : "gold"}
            disabled={zipDownloaded || isDownloadingZip}
            className="w-full"
          >
            {isDownloadingZip ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando {totalCards} artes...
              </>
            ) : zipDownloaded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Baixado
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 mr-2" />
                Baixar Todas (.zip)
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Preview em Tempo Real</h3>
        {formData.format === 'carousel' && formData.imageUrls.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {formData.imageUrls.length} cards
          </span>
        )}
      </div>

      {formData.format === 'single' ? renderSinglePost() : renderCarousel()}

      {/* iOS Modal for saving carousel cards to Photos */}
      <Dialog open={showCarouselModal} onOpenChange={setShowCarouselModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Salvar Card {currentCarouselIndex + 1} de {carouselImages.length}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Pressione e segure</strong> a imagem para salvar na Galeria
            </p>
            
            {carouselImages[currentCarouselIndex] && (
              <div className="flex justify-center">
                <img 
                  src={carouselImages[currentCarouselIndex]} 
                  alt={`Card ${currentCarouselIndex + 1}`}
                  className="max-w-full h-auto rounded-lg shadow-lg max-h-[50vh] object-contain"
                />
              </div>
            )}
            
            <p className="text-xs text-muted-foreground text-center">
              1080x1080 (1:1)
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrentCarouselIndex(prev => Math.max(0, prev - 1))}
                disabled={currentCarouselIndex === 0}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              
              <span className="text-sm font-medium text-muted-foreground">
                {currentCarouselIndex + 1}/{carouselImages.length}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentCarouselIndex(prev => Math.min(carouselImages.length - 1, prev + 1))}
                disabled={currentCarouselIndex === carouselImages.length - 1}
                className="flex-1"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};