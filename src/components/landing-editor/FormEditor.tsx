import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FileText } from "lucide-react";

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

interface FormEditorProps {
  formConfig: FormConfig;
  onChange: (field: string, value: any) => void;
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

const FormEditor = ({ formConfig, onChange }: FormEditorProps) => {
  const config = formConfig || defaultFormConfig;

  const handleFieldToggle = (fieldName: string, property: "visivel" | "obrigatorio", value: boolean) => {
    const newCampos = {
      ...config.campos,
      [fieldName]: {
        ...config.campos[fieldName as keyof typeof config.campos],
        [property]: value,
      },
    };
    onChange("form_config", { ...config, campos: newCampos });
  };

  const handleTextChange = (field: keyof FormConfig, value: string) => {
    onChange("form_config", { ...config, [field]: value });
  };

  const fieldLabels = {
    income: "Renda Mensal Familiar",
    goal: "Objetivo do Imóvel (Moradia/Investimento)",
    down_payment: "Possui Valor de Entrada",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-medium text-foreground">Formulário de Lead</h3>
      </div>

      {/* Título e Subtítulo */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="form_titulo">Título do Formulário</Label>
          <Input
            id="form_titulo"
            value={config.titulo}
            onChange={(e) => handleTextChange("titulo", e.target.value)}
            placeholder="Ex: Receba uma Consultoria Gratuita"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form_subtitulo">Subtítulo</Label>
          <Input
            id="form_subtitulo"
            value={config.subtitulo}
            onChange={(e) => handleTextChange("subtitulo", e.target.value)}
            placeholder="Ex: Preencha o formulário e entraremos em contato"
            maxLength={150}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form_botao">Texto do Botão</Label>
          <Input
            id="form_botao"
            value={config.botao_texto}
            onChange={(e) => handleTextChange("botao_texto", e.target.value)}
            placeholder="Ex: Quero minha consultoria agora"
            maxLength={50}
          />
        </div>
      </div>

      {/* Campos opcionais */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Campos Opcionais</Label>
        <p className="text-sm text-muted-foreground">
          Nome, Telefone e E-mail são sempre obrigatórios. Configure a visibilidade dos campos abaixo:
        </p>

        <div className="space-y-4">
          {Object.entries(fieldLabels).map(([field, label]) => (
            <div key={field} className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">{label}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`${field}_visivel`}
                    checked={config.campos[field as keyof typeof config.campos]?.visivel ?? true}
                    onCheckedChange={(checked) => handleFieldToggle(field, "visivel", checked)}
                  />
                  <Label htmlFor={`${field}_visivel`} className="text-sm cursor-pointer">
                    Visível
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`${field}_obrigatorio`}
                    checked={config.campos[field as keyof typeof config.campos]?.obrigatorio ?? false}
                    onCheckedChange={(checked) => handleFieldToggle(field, "obrigatorio", checked)}
                    disabled={!config.campos[field as keyof typeof config.campos]?.visivel}
                  />
                  <Label 
                    htmlFor={`${field}_obrigatorio`} 
                    className={`text-sm cursor-pointer ${
                      !config.campos[field as keyof typeof config.campos]?.visivel ? "text-muted-foreground" : ""
                    }`}
                  >
                    Obrigatório
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
