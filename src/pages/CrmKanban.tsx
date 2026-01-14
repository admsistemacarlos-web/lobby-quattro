import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CrmKanban() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  CRM Kanban
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acesse o CRM através do seu dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Redirect message */}
      <main className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">
          O CRM Kanban agora está disponível diretamente no seu dashboard.
        </p>
        <Button onClick={() => navigate("/dashboard")}>
          Ir para o Dashboard
        </Button>
      </main>
    </div>
  );
}
