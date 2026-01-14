import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Mail, Award } from "lucide-react";

interface ContactInfoFormProps {
  whatsapp: string;
  email: string;
  creci: string;
  onChange: (field: string, value: string) => void;
}

const ContactInfoForm = ({ whatsapp, email, creci, onChange }: ContactInfoFormProps) => {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Phone className="w-5 h-5 text-primary" />
        Informações de Contato
      </h3>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="whatsapp"
              placeholder="(11) 99999-9999"
              value={formatPhone(whatsapp)}
              onChange={(e) => onChange("whatsapp", e.target.value.replace(/\D/g, ""))}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Número que aparecerá no botão de WhatsApp
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail de Contato</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => onChange("email_contato", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="creci">CRECI</Label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="creci"
              placeholder="000000-F"
              value={creci}
              onChange={(e) => onChange("creci", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoForm;
