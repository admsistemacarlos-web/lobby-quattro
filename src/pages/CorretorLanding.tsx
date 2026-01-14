import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LeadForm from "@/components/LeadForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

interface Corretor {
  id: string;
  nome: string;
  telefone: string | null;
  slug: string;
  logo_url: string | null;
  cor_primaria: string;
}

interface FormConfig {
  titulo: string;
  subtitulo: string;
  botao_texto: string;
  campos: {
    income: { visivel: boolean; obrigatorio: boolean };
    goal: { visivel: boolean; obrigatorio: boolean };
    down_payment: { visivel: boolean; obrigatorio: boolean };
  };
}

interface LandingConfig {
  whatsapp: string | null;
  email_contato: string | null;
  creci: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  headline_principal: string | null;
  subtitulo: string | null;
  imagem_fundo_url: string | null;
  badges_customizados: string[] | null;
  form_config: FormConfig | null;
}

interface Anuncio {
  id: string;
  nome: string;
  slug: string;
  status: string;
  has_custom_landing: boolean;
  headline_custom: string | null;
  subtitulo_custom: string | null;
  imagem_fundo_url: string | null;
}

// Type for the master RPC response
interface LandingPageData {
  corretor: {
    id: string;
    nome: string;
    telefone: string | null;
    slug: string;
    logo_url: string | null;
    cor_primaria: string | null;
    creci: string | null;
  };
  landing_config: {
    whatsapp: string | null;
    email_contato: string | null;
    creci: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    linkedin_url: string | null;
    tiktok_url: string | null;
    youtube_url: string | null;
    headline_principal: string | null;
    subtitulo: string | null;
    imagem_fundo_url: string | null;
    badges_customizados: string[] | null;
    form_config: FormConfig | null;
  } | null;
  anuncio: {
    id: string;
    nome: string;
    slug: string;
    status: string;
    has_custom_landing: boolean;
    headline_custom: string | null;
    subtitulo_custom: string | null;
    imagem_fundo_url: string | null;
  } | null;
}

const CorretorLanding = () => {
  const { slug, anuncioSlug } = useParams<{ slug: string; anuncioSlug?: string }>();
  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const [landingConfig, setLandingConfig] = useState<LandingConfig | null>(null);
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.title = "Carregando... | Lobby Quattro";
    
    const fetchLandingData = async () => {
      if (!slug) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      // Use master SECURITY DEFINER RPC function that fetches all public data at once
      const { data: rpcData, error } = await supabase
        .rpc("get_landing_page_data", { 
          slug_corretor: slug, 
          slug_anuncio: anuncioSlug || null 
        });

      // Cast the jsonb response to our typed interface
      const data = rpcData as unknown as LandingPageData | null;

      if (error || !data || !data.corretor) {
        console.error("Error fetching landing data:", error);
        setNotFound(true);
        document.title = "Página não encontrada | Lobby Quattro";
        setIsLoading(false);
        return;
      }

      // Extract corretor data from response
      const corretorData: Corretor = {
        id: data.corretor.id,
        nome: data.corretor.nome,
        telefone: data.corretor.telefone,
        slug: data.corretor.slug,
        logo_url: data.corretor.logo_url,
        cor_primaria: data.corretor.cor_primaria || '#d4a574',
      };
      
      setCorretor(corretorData);
      document.title = `${corretorData.nome} | Corretor de Imóveis`;
      
      // Apply custom primary color
      if (corretorData.cor_primaria) {
        document.documentElement.style.setProperty('--corretor-primary', corretorData.cor_primaria);
      }

      // Extract landing config from the response
      if (data.landing_config) {
        setLandingConfig({
          whatsapp: data.landing_config.whatsapp,
          email_contato: data.landing_config.email_contato,
          creci: data.landing_config.creci,
          instagram_url: data.landing_config.instagram_url,
          facebook_url: data.landing_config.facebook_url,
          linkedin_url: data.landing_config.linkedin_url,
          tiktok_url: data.landing_config.tiktok_url,
          youtube_url: data.landing_config.youtube_url,
          headline_principal: data.landing_config.headline_principal,
          subtitulo: data.landing_config.subtitulo,
          imagem_fundo_url: data.landing_config.imagem_fundo_url,
          badges_customizados: data.landing_config.badges_customizados as string[] | null,
          form_config: data.landing_config.form_config as FormConfig | null,
        });
      }

      // Extract anuncio data if present
      if (data.anuncio) {
        setAnuncio({
          id: data.anuncio.id,
          nome: data.anuncio.nome,
          slug: data.anuncio.slug,
          status: data.anuncio.status,
          has_custom_landing: data.anuncio.has_custom_landing,
          headline_custom: data.anuncio.headline_custom,
          subtitulo_custom: data.anuncio.subtitulo_custom,
          imagem_fundo_url: data.anuncio.imagem_fundo_url,
        });
      } else if (anuncioSlug) {
        // Anuncio slug provided but not found - show 404
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    fetchLandingData();

    return () => {
      document.documentElement.style.removeProperty('--corretor-primary');
    };
  }, [slug, anuncioSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !corretor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground mb-6">
            O corretor que você está procurando não existe ou está inativo.
          </p>
          <a href="/" className="text-primary hover:underline">
            Voltar ao site principal
          </a>
        </div>
      </div>
    );
  }

  // Use anuncio overrides ONLY if has_custom_landing is true, then config values, then defaults
  const useAnuncioOverrides = anuncio?.has_custom_landing === true;
  const headline = (useAnuncioOverrides && anuncio?.headline_custom) || landingConfig?.headline_principal || "Encontre o Imóvel Ideal para Morar ou Investir.";
  const subtitulo = (useAnuncioOverrides && anuncio?.subtitulo_custom) || landingConfig?.subtitulo || `Consultoria personalizada com ${corretor.nome} para você realizar o melhor negócio com segurança e agilidade.`;
  const backgroundImage = (useAnuncioOverrides && anuncio?.imagem_fundo_url) || landingConfig?.imagem_fundo_url || heroBg;
  const badges = landingConfig?.badges_customizados?.length 
    ? landingConfig.badges_customizados 
    : ["Atendimento Personalizado", "CRECI Ativo", "Parceiro dos Principais Bancos"];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        corretorNome={corretor.nome} 
        corretorLogo={corretor.logo_url}
        whatsapp={landingConfig?.whatsapp}
      />

      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column - Text */}
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight animate-fade-up">
                {headline.includes("Ideal") ? (
                  <>
                    {headline.split("Ideal")[0]}
                    <span 
                      className="text-gradient-gold"
                      style={corretor.cor_primaria ? { color: corretor.cor_primaria } : undefined}
                    >
                      Ideal
                    </span>
                    {headline.split("Ideal")[1]}
                  </>
                ) : (
                  headline
                )}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 animate-fade-up animation-delay-100">
                {subtitulo.includes(corretor.nome) ? (
                  <>
                    {subtitulo.split(corretor.nome)[0]}
                    <strong>{corretor.nome}</strong>
                    {subtitulo.split(corretor.nome)[1]}
                  </>
                ) : (
                  subtitulo
                )}
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4 animate-fade-up animation-delay-200">
                {badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: corretor.cor_primaria || 'hsl(var(--primary))' }}
                    />
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <LeadForm 
                corretorId={corretor.id} 
                corretorNome={corretor.nome} 
                anuncioId={anuncio?.id}
                formConfig={landingConfig?.form_config}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer 
        corretorNome={corretor.nome}
        whatsapp={landingConfig?.whatsapp}
        email={landingConfig?.email_contato}
        creci={landingConfig?.creci}
        instagram={landingConfig?.instagram_url}
        facebook={landingConfig?.facebook_url}
        linkedin={landingConfig?.linkedin_url}
        tiktok={landingConfig?.tiktok_url}
        youtube={landingConfig?.youtube_url}
      />
    </div>
  );
};

export default CorretorLanding;
