import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Pencil, Trash2, Tag, List } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES_QUERY, DELETE_CATEGORY_MUTATION } from "@/graphql/queries";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CategoryModal } from "@/components/CategoryModal";
import type { Category } from "@/types";

export function CategoriesPage() {
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const { data, loading } = useQuery<{ categories: Category[] }>(
    CATEGORIES_QUERY,
    { fetchPolicy: "cache-and-network" },
  );
  const categories: Category[] = data?.categories ?? [];

  const [deleteCategory] = useMutation(DELETE_CATEGORY_MUTATION, {
    refetchQueries: [{ query: CATEGORIES_QUERY }],
    awaitRefetchQueries: true,
  });

  const totalTransactions = categories.reduce(
    (s, c) => s + c.transactionCount,
    0,
  );
  const mostUsed = [...categories].sort(
    (a, b) => b.transactionCount - a.transactionCount,
  )[0];

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Deseja remover esta categoria? As transações associadas perderão a categoria.",
      )
    )
      return;
    try {
      await deleteCategory({ variables: { id } });
      toast.success("Categoria removida");
    } catch {
      toast.error("Erro ao remover categoria");
    }
  }

  function handleEdit(cat: Category) {
    setEditCategory(cat);
    setOpenModal(true);
  }

  function handleClose() {
    setOpenModal(false);
    setEditCategory(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Organize suas transações por categorias
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => {
            setEditCategory(null);
            setOpenModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova categoria
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total de categorias
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <List className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalTransactions}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total de transações
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            {mostUsed ? (
              <>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${mostUsed.color}20` }}
                >
                  <CategoryIcon
                    icon={mostUsed.icon}
                    className="w-5 h-5"
                    style={{ color: mostUsed.color }}
                  />
                </div>
                <div>
                  <p className="text-xl font-bold">{mostUsed.title}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Categoria mais utilizada
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-36 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && !categories.length && (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma categoria criada ainda</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <CategoryIcon
                    icon={cat.icon}
                    className="w-5 h-5"
                    style={{ color: cat.color }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-1.5 rounded hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-sm mb-0.5">{cat.title}</h3>
              {cat.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {cat.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-2">
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                  }}
                >
                  {cat.title}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {cat.transactionCount}{" "}
                  {cat.transactionCount === 1 ? "item" : "itens"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CategoryModal
        open={openModal}
        onClose={handleClose}
        category={editCategory}
      />
    </div>
  );
}
