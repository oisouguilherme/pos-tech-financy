import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { Coins, Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FORGOT_PASSWORD_MUTATION } from "@/graphql/queries";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [forgotPassword] = useMutation<{
    forgotPassword: { resetToken: string };
  }>(FORGOT_PASSWORD_MUTATION);

  async function onSubmit(values: FormValues) {
    try {
      const { data } = await forgotPassword({
        variables: { email: values.email },
      });
      setResetToken(data!.forgotPassword.resetToken);
      setSubmitted(true);
      toast.success("Token gerado com sucesso");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao solicitar recuperação";
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl mb-2">
            <Coins className="w-6 h-6" />
            <span>FINANCY</span>
          </div>
          <h1 className="text-xl font-semibold">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Informe seu e-mail para receber o token de recuperação
          </p>
        </div>

        {submitted && resetToken ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800 mb-2">
                Token gerado com sucesso!
              </p>
              <p className="text-xs text-green-700 mb-2">
                Use o token abaixo para redefinir sua senha:
              </p>
              <code className="text-xs bg-white border rounded px-2 py-1 block break-all">
                {resetToken}
              </code>
            </div>
            <Link
              to={`/redefinir-senha/${resetToken}`}
              className="block text-center"
            >
              <Button className="w-full bg-primary hover:bg-primary/90">
                Redefinir senha
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Gerar token de recuperação"}
            </Button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
