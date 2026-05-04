import { useQuery, useMutation } from "@apollo/client/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TRANSACTIONS_QUERY,
  CATEGORIES_QUERY,
  DELETE_TRANSACTION_MUTATION,
} from "@/graphql/queries";
import { formatCurrency } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionModal } from "@/components/TransactionModal";
import type { Transaction, Category } from "@/types";

const ITEMS_PER_PAGE = 10;

export function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [period, setPeriod] = useState(() => format(new Date(), "yyyy-MM"));
  const [page, setPage] = useState(1);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null,
  );
  const [openModal, setOpenModal] = useState(false);

  const periodStart = `${period}-01T00:00:00.000Z`;
  const periodEnd = new Date(
    parseInt(period.split("-")[0]),
    parseInt(period.split("-")[1]),
    0,
    23,
    59,
    59,
  ).toISOString();

  const { data, loading } = useQuery<{ transactions: Transaction[] }>(
    TRANSACTIONS_QUERY,
    {
      variables: {
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        categoryId: categoryFilter !== "ALL" ? categoryFilter : undefined,
        startDate: periodStart,
        endDate: periodEnd,
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const { data: catData } = useQuery<{ categories: Category[] }>(
    CATEGORIES_QUERY,
  );

  const [deleteTransaction] = useMutation(DELETE_TRANSACTION_MUTATION, {
    refetchQueries: [{ query: TRANSACTIONS_QUERY }],
    awaitRefetchQueries: true,
  });

  const transactions: Transaction[] = data?.transactions ?? [];
  const categories: Category[] = catData?.categories ?? [];

  const filtered = transactions.filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  async function handleDelete(id: string) {
    if (!confirm("Deseja remover esta transação?")) return;
    try {
      await deleteTransaction({ variables: { id } });
      toast.success("Transação removida");
    } catch {
      toast.error("Erro ao remover transação");
    }
  }

  function handleEdit(t: Transaction) {
    setEditTransaction(t);
    setOpenModal(true);
  }

  function handleCloseModal() {
    setOpenModal(false);
    setEditTransaction(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as suas transações financeiras
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => {
            setEditTransaction(null);
            setOpenModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova transação
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="INCOME">Entrada</SelectItem>
            <SelectItem value="EXPENSE">Saída</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="month"
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Descrição
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Data
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Categoria
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Tipo
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Valor
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Carregando...
                  </td>
                </tr>
              )}
              {!loading && !paginated.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhuma transação encontrada
                  </td>
                </tr>
              )}
              {paginated.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: t.category?.color
                            ? `${t.category.color}20`
                            : "#f3f4f6",
                        }}
                      >
                        <CategoryIcon
                          icon={t.category?.icon ?? "dollar"}
                          className="w-3.5 h-3.5"
                          style={{ color: t.category?.color ?? "#6b7280" }}
                        />
                      </div>
                      <span className="font-medium">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3">
                    {t.category ? (
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: `${t.category.color}20`,
                          color: t.category.color,
                        }}
                      >
                        {t.category.title}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={
                        t.type === "INCOME"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }
                    >
                      {t.type === "INCOME" ? "Entrada" : "Saída"}
                    </Badge>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${t.type === "INCOME" ? "text-green-600" : "text-red-500"}`}
                  >
                    {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-1.5 rounded hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm text-muted-foreground">
            <span>
              {(page - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} de{" "}
              {filtered.length} resultados
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        open={openModal}
        onClose={handleCloseModal}
        transaction={editTransaction}
      />
    </div>
  );
}
