import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, UserPlus, Trash2, Shield } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRoles {
  user_id: string;
  email: string;
  roles: AppRole[];
}

const UserRolesManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("user");
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsersWithRoles = async () => {
    setIsLoading(true);
    try {
      const { data: rolesData, error } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (error) throw error;

      // Group roles by user_id
      const usersMap = new Map<string, AppRole[]>();
      rolesData?.forEach((item) => {
        const existing = usersMap.get(item.user_id) || [];
        usersMap.set(item.user_id, [...existing, item.role]);
      });

      // Convert to array - we only have user_id, not email from this query
      const usersArray: UserWithRoles[] = Array.from(usersMap.entries()).map(
        ([user_id, roles]) => ({
          user_id,
          email: user_id.substring(0, 8) + "...", // Placeholder since we can't access auth.users
          roles,
        })
      );

      setUsers(usersArray);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const addRoleByUserId = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "ID do usuário obrigatório",
        description: "Por favor, insira o ID do usuário.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      // Check if role already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", newUserEmail.trim())
        .eq("role", newUserRole)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Função já atribuída",
          description: "Este usuário já possui esta função.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("user_roles").insert({
        user_id: newUserEmail.trim(),
        role: newUserRole,
      });

      if (error) throw error;

      toast({
        title: "Função adicionada",
        description: `Função ${newUserRole} adicionada com sucesso.`,
      });

      setNewUserEmail("");
      fetchUsersWithRoles();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar função",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast({
        title: "Função removida",
        description: `Função ${role} removida com sucesso.`,
      });

      fetchUsersWithRoles();
    } catch (error: any) {
      toast({
        title: "Erro ao remover função",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roles.some((role) =>
        role.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const roleLabels: Record<AppRole, string> = {
    admin: "Administrador",
    corretor: "Corretor",
    moderator: "Moderador",
    user: "Usuário",
  };

  const roleBadgeColors: Record<AppRole, string> = {
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    corretor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    moderator: "bg-primary/10 text-primary border-primary/20",
    user: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6">
      {/* Add Role Section */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Adicionar Função ao Usuário
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="ID do usuário (UUID)"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="flex-1"
          />
          <Select
            value={newUserRole}
            onValueChange={(value: AppRole) => setNewUserRole(value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Selecionar função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="corretor">Corretor</SelectItem>
              <SelectItem value="moderator">Moderador</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="gold" onClick={addRoleByUserId} disabled={isAdding}>
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Para encontrar o ID do usuário, verifique a página de perfil do usuário ou o banco de dados.
        </p>
      </div>

      {/* Search */}
      <div className="glass-card p-4 sm:p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou função..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Shield className="w-12 h-12 mb-4 opacity-50" />
            <p>Nenhum usuário com funções encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground font-semibold">
                    ID do Usuário
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Funções
                  </TableHead>
                  <TableHead className="text-foreground font-semibold text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.user_id}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="font-mono text-sm text-foreground">
                      {user.user_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColors[role]}`}
                          >
                            {roleLabels[role]}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.roles.map((role) => (
                          <Button
                            key={role}
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRole(user.user_id, role)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {roleLabels[role]}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRolesManager;
