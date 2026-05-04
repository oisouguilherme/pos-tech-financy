import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CREATE_TRANSACTION_MUTATION,
  UPDATE_TRANSACTION_MUTATION,
  TRANSACTIONS_QUERY,
  CATEGORIES_QUERY,
  DASHBOARD_QUERY,
} from "@/graphql/queries";
import type { Transaction, Category } from "@/types";

const schema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z
    .string()
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      "Valor deve ser maior que 0",
    ),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string().min(1, "Data obrigatória"),
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export function TransactionModal({ open, onClose, transaction }: Props) {
  const isEdit = !!transaction;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "EXPENSE", date: format(new Date(), "yyyy-MM-dd") },
  });

  const typeValue = watch("type");

  const { data: catData } = useQuery<{ categories: Category[] }>(
    CATEGORIES_QUERY,
  );
  const categories: Category[] = catData?.categories ?? [];

  const refetchQueries = [
    { query: TRANSACTIONS_QUERY },
    { query: DASHBOARD_QUERY },
  ];

  const [createTransaction] = useMutation(CREATE_TRANSACTION_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          description: transaction.description,
          amount: String(transaction.amount),
          type: transaction.type,
          date: format(new Date(transaction.date), "yyyy-MM-dd"),
          categoryId: transaction.category?.id ?? undefined,
        });
      } else {
        reset({
          type: "EXPENSE",
          date: format(new Date(), "yyyy-MM-dd"),
          description: "",
          amount: "",
        });
      }
    }
  }, [open, transaction, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const input = {
        description: values.description,
        amount: parseFloat(values.amount),
        type: values.type,
        date: new Date(values.date + "T12:00:00Z").toISOString(),
        categoryId: values.categoryId || null,
      };

      if (isEdit) {
        await updateTransaction({ variables: { id: transaction.id, input } });
        toast.success("Transação atualizada");
      } else {
        await createTransaction({ variables: { input } });
        toast.success("Transação criada");
      }
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar transação";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar transação" : "Nova transação"}
          </DialogTitle>
          {!isEdit && (
            <p className="text-sm text-muted-foreground">
              Registre sua despesa ou Receita
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Type toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setValue("type", "EXPENSE")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                typeValue === "EXPENSE"
                  ? "bg-red-500 text-white"
                  : "bg-white text-muted-foreground hover:bg-gray-50"
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "INCOME")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                typeValue === "INCOME"
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground hover:bg-gray-50"
              }`}
            >
              Receita
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex. Almoço no restaurante"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  R$
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  className="pl-9"
                  {...register("amount")}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "__none__"}
                  onValueChange={(v) =>
                    field.onChange(v === "__none__" ? undefined : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem categoria</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
