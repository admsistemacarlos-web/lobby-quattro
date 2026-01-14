import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface FormData {
  name: string;
  phone: string;
  email: string;
  income: string;
  goal: string;
  downPayment: string;
}

interface LeadFormProps {
  corretorId?: string;
  corretorNome?: string;
  anuncioId?: string;
  formConfig?: FormConfig | null;
}

const defaultFormConfig: FormConfig = {
  titulo: "Receba uma Consultoria Gratuita",
  subtitulo: "Preencha o formulário e entraremos em contato",
  botao_texto: "Quero minha consultoria agora",
  campos: {
    income: { visivel: true, obrigatorio: false },
    goal: { visivel: true, obrigatorio: false },
    down_payment: { visivel: true, obrigatorio: false },
  },
};

const LeadForm = ({ corretorId, corretorNome, anuncioId, formConfig }: LeadFormProps) => {
  const config = formConfig || defaultFormConfig;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    income: "",
    goal: "",
    downPayment: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    // Check required optional fields
    if (config.campos.income.visivel && config.campos.income.obrigatorio && !formData.income) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione sua renda mensal.",
        variant: "destructive",
      });
      return;
    }

    if (config.campos.goal.visivel && config.campos.goal.obrigatorio && !formData.goal) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione o objetivo do imóvel.",
        variant: "destructive",
      });
      return;
    }

    if (config.campos.down_payment.visivel && config.campos.down_payment.obrigatorio && !formData.downPayment) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione se possui entrada.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Inserir na tabela leads (para o Kanban)
      const { error: leadError } = await supabase.from("leads").insert({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        income: formData.income || null,
        goal: formData.goal || null,
        down_payment: formData.downPayment || null,
        corretor_id: corretorId || null,
        anuncio_id: anuncioId || null,
      });

      if (leadError) {
        throw leadError;
      }

      // 2. NOVO: Também inserir na tabela clients (para a Lista de Clientes)
      if (corretorId) {
        // Mapear finalidade do lead para o formato do client
        const purposeMap: Record<string, string> = {
          moradia: "moradia",
          investimento: "investimento",
        };

        await supabase.from("clients" as any).insert({
          corretor_id: corretorId,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          purpose: formData.goal ? purposeMap[formData.goal] || null : null,
          accepts_financing: formData.downPayment === "nao" ? true : null,
          status: "novo",
          origin: "landing",
          notes: `🚨 LEAD DA LANDING PAGE - AGUARDANDO CONTATO!\n\nRenda: ${formData.income || "Não informada"}\nObjetivo: ${formData.goal || "Não informado"}\nEntrada: ${formData.downPayment || "Não informado"}`,
        });
        // Não tratamos erro do clients para não afetar a experiência do usuário
        // O lead principal já foi salvo com sucesso
      }
      
      toast({
        title: "Obrigado!",
        description: corretorNome ? `${corretorNome} entrará em contato em breve.` : "Entrarei em contato em breve.",
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        income: "",
        goal: "",
        downPayment: "",
      });
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 shadow-card animate-scale-in animation-delay-200">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 text-center">
        {config.titulo}
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {config.subtitulo}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            maxLength={100}
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Seu WhatsApp com DDD *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            maxLength={20}
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Seu melhor E-mail *</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            maxLength={255}
            required
          />
        </div>

        {/* Income - Conditionally shown */}
        {config.campos.income.visivel && (
          <div className="space-y-2">
            <Label>
              Renda Mensal Familiar {config.campos.income.obrigatorio && "*"}
            </Label>
            <Select
              value={formData.income}
              onValueChange={(value) => handleInputChange("income", value)}
            >
              <SelectTrigger className="h-12 bg-secondary/50 border-border">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="ate-5000">Até R$ 5.000</SelectItem>
                <SelectItem value="5000-10000">R$ 5.000 a R$ 10.000</SelectItem>
                <SelectItem value="10000-20000">R$ 10.000 a R$ 20.000</SelectItem>
                <SelectItem value="acima-20000">Acima de R$ 20.000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Goal - Conditionally shown */}
        {config.campos.goal.visivel && (
          <div className="space-y-3">
            <Label>
              O imóvel é para? {config.campos.goal.obrigatorio && "*"}
            </Label>
            <RadioGroup
              value={formData.goal}
              onValueChange={(value) => handleInputChange("goal", value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moradia" id="moradia" className="border-border text-primary" />
                <Label htmlFor="moradia" className="cursor-pointer font-normal">Moradia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="investimento" id="investimento" className="border-border text-primary" />
                <Label htmlFor="investimento" className="cursor-pointer font-normal">Investimento</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Down Payment - Conditionally shown */}
        {config.campos.down_payment.visivel && (
          <div className="space-y-2">
            <Label>
              Possui valor de entrada? {config.campos.down_payment.obrigatorio && "*"}
            </Label>
            <Select
              value={formData.downPayment}
              onValueChange={(value) => handleInputChange("downPayment", value)}
            >
              <SelectTrigger className="h-12 bg-secondary/50 border-border">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="sim">Sim, possuo valor para entrada</SelectItem>
                <SelectItem value="nao">Não possuo entrada</SelectItem>
                <SelectItem value="permuta">Tenho imóvel para permuta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gold"
          size="xl"
          className="w-full mt-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {config.botao_texto}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default LeadForm;
