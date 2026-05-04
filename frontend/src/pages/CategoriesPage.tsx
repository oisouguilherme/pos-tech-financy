import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Pencil, Trash2, Tag, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CATEGORIES_QUERY, DELETE_CATEGORY_MUTATION } from "@/graphql/queries";
import { catStyle } from "@/lib/format";
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[24px] font-bold text-[#111827] leading-8">
            Categorias
          </h1>
          <p className="text-base text-[#4B5563]">
            Organize suas transações por categorias
          </p>
        </div>
        <button
          onClick={() => {
            setEditCategory(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova categoria
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* Total categorias */}
        <div className="bg-card border border-border rounded-xl p-[25px] flex items-center gap-6">
          <div className="w-10 h-10 rounded-lg bg-[#E0FAE9] flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5 text-[#15803D]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[28px] font-bold text-[#111827] leading-8">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-gray-100 rounded animate-pulse" />
              ) : (
                categories.length
              )}
            </span>
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-[#6B7280]">
              Total de categorias
            </span>
          </div>
        </div>

        {/* Total transações */}
        <div className="bg-card border border-border rounded-xl p-[25px] flex items-center gap-6">
          <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] flex items-center justify-center shrink-0">
            <ArrowUpDown className="w-5 h-5 text-[#1D4ED8]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[28px] font-bold text-[#111827] leading-8">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-gray-100 rounded animate-pulse" />
              ) : (
                totalTransactions
              )}
            </span>
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-[#6B7280]">
              Total de transações
            </span>
          </div>
        </div>

        {/* Categoria mais utilizada */}
        <div className="bg-card border border-border rounded-xl p-[25px] flex items-center gap-6">
          {loading ? (
            <div className="h-8 w-40 bg-gray-100 rounded animate-pulse" />
          ) : mostUsed ? (
            <>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: catStyle(mostUsed.color).bg }}
              >
                <CategoryIcon
                  icon={mostUsed.icon}
                  className="w-5 h-5"
                  style={{ color: catStyle(mostUsed.color).text }}
                />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[28px] font-bold text-[#111827] leading-8 truncate">
                  {mostUsed.title}
                </span>
                <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-[#6B7280]">
                  Categoria mais utilizada
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria ainda
            </p>
          )}
        </div>
      </div>

      {/* Category cards grid */}
      {loading && (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !categories.length && (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma categoria criada ainda</p>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {categories.map((cat) => {
            const cs = catStyle(cat.color);
            return (
              <div
                key={cat.id}
                className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3"
              >
                {/* Top row: icon + actions */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cs.bg }}
                  >
                    <CategoryIcon
                      icon={cat.icon}
                      className="w-5 h-5"
                      style={{ color: cs.text }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    <button
                      onClick={() => handleEdit(cat)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-[#6B7280]" />
                    </button>
                  </div>
                </div>

                {/* Title + description */}
                <div className="flex flex-col gap-1 flex-1">
                  <h3 className="text-base font-semibold text-[#111827]">
                    {cat.title}
                  </h3>
                  {cat.description && (
                    <p className="text-sm text-[#4B5563] line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>

                {/* Bottom: pill + count */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: cs.bg, color: cs.text }}
                  >
                    {cat.title}
                  </span>
                  <span className="text-sm text-[#4B5563] whitespace-nowrap shrink-0">
                    {cat.transactionCount}{" "}
                    {cat.transactionCount === 1 ? "item" : "itens"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CategoryModal
        open={openModal}
        onClose={handleClose}
        category={editCategory}
      />
    </div>
  );
}

