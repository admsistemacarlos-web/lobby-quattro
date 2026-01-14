import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Image } from "lucide-react";

interface LogoUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const LogoUpload = ({ value, onChange, disabled }: LogoUploadProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("corretor-logos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("corretor-logos")
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
      toast({ title: "Logo enviado com sucesso!" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erro ao enviar logo",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Logo preview"
            className="w-20 h-20 object-contain rounded-lg border border-border bg-muted"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {value ? "Trocar Logo" : "Enviar Logo"}
            </>
          )}
        </Button>
        {!value && (
          <span className="text-xs text-muted-foreground">
            JPG, PNG (max 2MB)
          </span>
        )}
      </div>

      {/* Manual URL input */}
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ou cole uma URL de imagem..."
          disabled={disabled || isUploading}
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default LogoUpload;
