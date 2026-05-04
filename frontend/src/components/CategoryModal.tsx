import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
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
  CREATE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
  CATEGORIES_QUERY,
} from "@/graphql/queries";
import { CategoryIcon, PICKER_ICONS } from "@/components/CategoryIcon";
import type { Category } from "@/types";

// Paleta oficial do Figma — 7 cores do picker (node 3107-4607)
const PRESET_COLORS = [
  "#16A34A", // green-base
  "#2563EB", // blue-base
  "#9333EA", // purple-base
  "#DB2777", // pink-base
  "#DC2626", // red-base
  "#EA580C", // orange-base
  "#CA8A04", // yellow-base
];

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  icon: z.string().min(1),
  color: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}

export function CategoryModal({ open, onClose, category }: Props) {
  const isEdit = !!category;
  const refetchQueries = [{ query: CATEGORIES_QUERY }];

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { icon: "briefcase_business", color: PRESET_COLORS[0] },
  });

  const selectedColor = watch("color");

  const [createCategory] = useMutation(CREATE_CATEGORY_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });
  const [updateCategory] = useMutation(UPDATE_CATEGORY_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          title: category.title,
          description: category.description ?? "",
          icon: category.icon,
          color: category.color,
        });
      } else {
        reset({
          title: "",
          description: "",
          icon: "briefcase_business",
          color: PRESET_COLORS[0],
        });
      }
    }
  }, [open, category, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const input = {
        title: values.title,
        description: values.description || null,
        icon: values.icon,
        color: values.color,
      };
      if (isEdit) {
        await updateCategory({ variables: { id: category.id, input } });
        toast.success("Categoria atualizada");
      } else {
        await createCategory({ variables: { input } });
        toast.success("Categoria criada");
      }
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar categoria";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Organize suas transações com categorias
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ex. Alimentação"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição da categoria"
              {...register("description")}
            />
            <p className="text-xs text-muted-foreground">Opcional</p>
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {PICKER_ICONS.map((icon) => {
                    const active = field.value === icon;
                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => field.onChange(icon)}
                        className={`w-10.5 h-10.5 flex items-center justify-center rounded-lg border transition-colors ${
                          active
                            ? "bg-[#f8f9fa] border-[#1f6f43]"
                            : "border-[#d1d5db] hover:bg-gray-50"
                        }`}
                      >
                        <CategoryIcon
                          icon={icon}
                          className="w-5 h-5"
                          style={{ color: active ? selectedColor : "#6b7280" }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {PRESET_COLORS.map((c) => {
                    const active =
                      field.value.toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => field.onChange(c)}
                        className={`flex flex-1 items-center justify-center p-1.25 rounded-lg border transition-colors ${
                          active
                            ? "bg-[#f8f9fa] border-[#1f6f43]"
                            : "border-[#d1d5db] hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className="h-5 w-full rounded"
                          style={{ backgroundColor: c }}
                        />
                      </button>
                    );
                  })}
                </div>
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
