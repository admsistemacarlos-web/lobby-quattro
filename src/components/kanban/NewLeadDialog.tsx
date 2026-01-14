import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(20, "Telefone muito longo"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  empreendimento: z.string().trim().max(200, "Nome muito longo").optional(),
  valor_estimado: z.string().optional(),
  temperature: z.enum(["quente", "morno", "frio"]),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface NewLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  corretorId: string;
  onSuccess: () => void;
}

export default function NewLeadDialog({
  open,
  onOpenChange,
  corretorId,
  onSuccess,
}: NewLeadDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      empreendimento: "",
      valor_estimado: "",
      temperature: "morno",
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);

    const valorNumerico = data.valor_estimado
      ? parseFloat(data.valor_estimado.replace(/\D/g, ""))
      : 0;

    const { error } = await supabase.from("leads").insert({
      corretor_id: corretorId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      empreendimento: data.empreendimento?.trim() || null,
      valor_estimado: valorNumerico,
      temperature: data.temperature,
      crm_status: "novo",
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao criar lead",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    form.reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
          <DialogDescription>
            Adicione um lead manualmente ao seu CRM.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="quente">🔥 Quente</SelectItem>
                        <SelectItem value="morno">🌡️ Morno</SelectItem>
                        <SelectItem value="frio">❄️ Frio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="empreendimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empreendimento</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do imóvel de interesse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor_estimado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Estimado (R$)</FormLabel>
                  <FormControl>
                    <Input placeholder="500.000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Lead
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
