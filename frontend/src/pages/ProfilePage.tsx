import { useQuery, useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, User as UserIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ME_QUERY, UPDATE_PROFILE_MUTATION } from "@/graphql/queries";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data, loading } = useQuery<{ me: User }>(ME_QUERY);
  const user = data?.me;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }],
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateProfile({ variables: { name: values.name } });
      toast.success("Perfil atualizado");
      reset({ name: values.name });
    } catch {
      toast.error("Erro ao atualizar perfil");
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const initials =
    user?.name
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl border p-8 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-gray-200 text-gray-600 text-2xl font-semibold">
              {loading ? "…" : initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold text-lg">
              {loading ? "..." : user?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {loading ? "..." : user?.email}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="name" className="pl-9" {...register("name")} />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                className="pl-9 bg-gray-50 text-muted-foreground"
                value={user?.email ?? ""}
                disabled
                readOnly
              />
            </div>
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>

        <div className="border-t pt-4">
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-red-50 hover:border-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
