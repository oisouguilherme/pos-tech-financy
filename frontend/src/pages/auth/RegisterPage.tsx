import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import {
  Coins,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REGISTER_MUTATION } from "@/graphql/queries";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthPayload } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [registerMutation] = useMutation<{ register: AuthPayload }>(
    REGISTER_MUTATION,
  );

  async function onSubmit(values: FormValues) {
    try {
      const { data } = await registerMutation({
        variables: { input: values },
      });
      login(data!.register.token, data!.register.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar conta";
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col gap-5 items-center justify-center p-4">
      <div className="flex items-center gap-2 text-primary font-bold text-xl mb-2">
        <Coins className="w-6 h-6" />
        <span>FINANCY</span>
      </div>
      <div className="bg-card rounded-xl shadow-sm border border-border p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-xl font-semibold text-foreground">Criar conta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comece a controlar suas finanças ainda hoje
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                className="pl-9"
                {...register("name")}
              />
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
                type="email"
                placeholder="mail@exemplo.com"
                className="pl-9"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                className="pl-9 pr-9"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              A senha deve ter no mínimo 8 caracteres
            </p>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground mb-3">ou</p>
          <p className="text-sm text-muted-foreground">Já tem uma conta?</p>
          <Button asChild variant="outline" className="w-full mt-2">
            <Link to="/">
              <LogIn className="w-4 h-4" />
              Fazer login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
