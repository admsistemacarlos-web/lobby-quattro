import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface HeaderProps {
  corretorNome?: string;
  corretorLogo?: string | null;
  whatsapp?: string | null;
}

const Header = ({ corretorNome, corretorLogo, whatsapp }: HeaderProps) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  
  // Use provided whatsapp or fallback to default
  const whatsappNumber = whatsapp || "5511999999999";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de mais informações sobre imóveis.");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const displayName = corretorNome || "Willian Souza";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {corretorLogo && (
            <img src={corretorLogo} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
          )}
          <span className="text-xl font-semibold text-foreground">
            {displayName}
          </span>
          <span className="hidden sm:inline text-muted-foreground font-light">|</span>
          <span className="hidden sm:inline text-sm text-muted-foreground font-light tracking-wide">
            Corretor de Imóveis
          </span>
        </div>

        <div className="flex items-center gap-2">
          {session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </Button>
          )}
          <Button
            variant="whatsapp"
            size="sm"
            asChild
          >
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
