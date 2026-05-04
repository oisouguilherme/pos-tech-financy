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
import { CategoryIcon, AVAILABLE_ICONS } from "@/components/CategoryIcon";
import type { Category } from "@/types";

// Paleta oficial do Figma — Style Guide: Financy Community
const PRESET_COLORS = [
  "#1F6F43", // brand-base (verde primário)
  "#2563EB", // blue-base
  "#9333EA", // purple-base
  "#DB2777", // pink-base
  "#DC2626", // red-base
  "#EA580C", // orange-base
  "#CA8A04", // yellow-base
  "#16A34A", // green-base
  "#6B7280", // gray-500
  "#111827", // gray-800 (dark)
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
    defaultValues: { icon: "dollar", color: PRESET_COLORS[0] },
  });

  const selectedIcon = watch("icon");
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
          icon: "dollar",
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
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Ex. Gastos com comida e bebida"
              {...register("description")}
            />
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => field.onChange(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        field.value === c
                          ? "scale-125 ring-2 ring-offset-2 ring-gray-400"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          {/* Icon picker */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto p-1">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => field.onChange(icon)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                        field.value === icon
                          ? "ring-2 ring-primary"
                          : "hover:bg-gray-100"
                      }`}
                      style={{
                        backgroundColor:
                          field.value === icon
                            ? `${selectedColor}20`
                            : undefined,
                      }}
                    >
                      <CategoryIcon
                        icon={icon}
                        className="w-4 h-4"
                        style={{
                          color:
                            field.value === icon ? selectedColor : "#6b7280",
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${selectedColor}20` }}
            >
              <CategoryIcon
                icon={selectedIcon}
                className="w-5 h-5"
                style={{ color: selectedColor }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {watch("title") || "Preview da categoria"}
            </span>
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
