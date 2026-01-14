import LeadForm from "./LeadForm";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Column - Text */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight animate-fade-up">
              Encontre o Imóvel{" "}
              <span className="text-gradient-gold">Ideal</span> para Morar ou
              Investir.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 animate-fade-up animation-delay-100">
              Consultoria personalizada para você realizar o melhor negócio com
              segurança e agilidade.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4 animate-fade-up animation-delay-200">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary" />
                +500 Clientes Atendidos
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary" />
                CRECI Ativo
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Parceiro dos Principais Bancos
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
