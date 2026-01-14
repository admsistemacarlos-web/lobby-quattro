import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PlanoBadge, { PlanoCorretor } from "@/components/PlanoBadge";
import { TrendingUp, ArrowRight } from "lucide-react";

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanoCorretor | null;
}

const ChangePlanDialog = ({ open, onOpenChange, currentPlan }: ChangePlanDialogProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/upgrade");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Seu Plano
          </DialogTitle>
          <DialogDescription>
            Veja seu plano atual e explore opções de upgrade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="glass-card p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Seu plano atual:</p>
            <div className="flex items-center gap-2">
              <PlanoBadge plano={currentPlan} size="lg" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Desbloqueie mais recursos e funcionalidades fazendo upgrade do seu plano.
            </p>
            
            <Button
              variant="gold"
              className="w-full"
              onClick={handleUpgrade}
            >
              Ver Opções de Upgrade
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                window.open("/planos", "_blank");
              }}
            >
              Ver Todos os Planos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePlanDialog;
