import { UserCheck, Percent, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "Atendimento Personalizado",
    description:
      "Entendemos suas necessidades e encontramos as melhores opções para você e sua família.",
  },
  {
    icon: Percent,
    title: "Melhores Taxas de Financiamento",
    description:
      "Parceria com os principais bancos para garantir as condições mais vantajosas do mercado.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança Jurídica",
    description:
      "Toda documentação verificada e acompanhamento completo até a entrega das chaves.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 sm:py-28 bg-slate-darker relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_hsl(var(--primary))_1px,_transparent_0)] bg-[length:40px_40px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Por que escolher{" "}
            <span className="text-gradient-gold">Willian Souza</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mais de 10 anos de experiência no mercado imobiliário, ajudando
            famílias a realizarem o sonho da casa própria.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 sm:p-8 text-center group hover:border-primary/50 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
