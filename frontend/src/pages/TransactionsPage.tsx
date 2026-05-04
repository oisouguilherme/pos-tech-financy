import { useQuery, useMutation } from "@apollo/client/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  CircleArrowUp,
  CircleArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
import { formatCurrency, catStyle } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionModal } from "@/components/TransactionModal";
import type { Transaction, Category } from "@/types";

const ITEMS_PER_PAGE = 10;

function generatePeriodOptions() {
  const options = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = format(d, "yyyy-MM");
    const label = format(d, "MMMM / yyyy", { locale: ptBR }).replace(
      /^\w/,
      (c) => c.toUpperCase(),
    );
    options.push({ value, label });
  }
  return options;
}

const PERIOD_OPTIONS = generatePeriodOptions();

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

  const [year, month] = period.split("-").map(Number);
  const periodStart = new Date(year, month - 1, 1).toISOString();
  const periodEnd = new Date(year, month, 0, 23, 59, 59).toISOString();

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[24px] font-bold text-[#111827] leading-8">
            Transações
          </h1>
          <p className="text-base text-[#4B5563]">
            Gerencie todas as suas transações financeiras
          </p>
        </div>
        <button
          onClick={() => {
            setEditTransaction(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova transação
        </button>
      </div>

      {/* Filters card */}
      <div className="bg-card border border-border rounded-xl px-[25px] pb-[25px] pt-[21px] flex gap-4 items-end">
        {/* Buscar */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <label className="text-sm font-medium text-[#374151]">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
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
        </div>

        {/* Tipo */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <label className="text-sm font-medium text-[#374151]">Tipo</label>
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="INCOME">Entrada</SelectItem>
              <SelectItem value="EXPENSE">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <label className="text-sm font-medium text-[#374151]">
            Categoria
          </label>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
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
        </div>

        {/* Período */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <label className="text-sm font-medium text-[#374151]">Período</label>
          <Select
            value={period}
            onValueChange={(v) => {
              setPeriod(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center border-b border-border">
          <div className="flex-1 min-w-0 px-6 py-5">
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-[#6B7280]">
              Descrição
            </span>
          </div>
          <div className="w-28 flex justify-center px-6 py-5 shrink-0">
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-[#6B7280]">
              Data
            </span>
          </div>
          <div className="w-48 flex justify-center px-6 py-5 shrink-0">
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-[#6B7280]">
              Categoria
            </span>
          </div>
          <div className="w-36 flex justify-center px-6 py-5 shrink-0">
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-[#6B7280]">
              Tipo
            </span>
          </div>
          <div className="w-48 flex justify-end px-6 py-5 shrink-0">
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-[#6B7280]">
              Valor
            </span>
          </div>
          <div className="w-28 flex justify-end px-6 py-5 shrink-0">
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-[#6B7280]">
              Ações
            </span>
          </div>
        </div>

        {/* Rows */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center h-[72px] px-6 gap-4 border-b border-border last:border-0"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}

        {!loading && !paginated.length && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma transação encontrada
          </div>
        )}

        {!loading &&
          paginated.map((t) => {
            const cs = catStyle(t.category?.color);
            return (
              <div
                key={t.id}
                className="flex items-center border-b border-border last:border-0"
              >
                {/* Descrição */}
                <div className="flex flex-1 items-center gap-4 h-[72px] px-6 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cs.bg }}
                  >
                    <CategoryIcon
                      icon={t.category?.icon ?? "dollar"}
                      className="w-4 h-4"
                      style={{ color: cs.text }}
                    />
                  </div>
                  <span className="text-base font-medium text-[#111827] truncate">
                    {t.description}
                  </span>
                </div>

                {/* Data */}
                <div className="w-28 h-[72px] flex items-center justify-center px-6 shrink-0">
                  <span className="text-sm text-[#4B5563] text-center whitespace-nowrap">
                    {format(new Date(t.date), "dd/MM/yy", { locale: ptBR })}
                  </span>
                </div>

                {/* Categoria */}
                <div className="w-48 h-[72px] flex items-center justify-center px-6 shrink-0">
                  {t.category ? (
                    <span
                      className="text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: cs.bg, color: cs.text }}
                    >
                      {t.category.title}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>

                {/* Tipo */}
                <div className="w-36 h-[72px] flex items-center justify-center gap-2 px-6 shrink-0">
                  {t.type === "INCOME" ? (
                    <>
                      <CircleArrowUp className="w-4 h-4 text-[#15803D] shrink-0" />
                      <span className="text-sm font-medium text-[#15803D] whitespace-nowrap">
                        Entrada
                      </span>
                    </>
                  ) : (
                    <>
                      <CircleArrowDown className="w-4 h-4 text-[#B91C1C] shrink-0" />
                      <span className="text-sm font-medium text-[#B91C1C] whitespace-nowrap">
                        Saída
                      </span>
                    </>
                  )}
                </div>

                {/* Valor */}
                <div className="w-48 h-[72px] flex items-center justify-end px-6 shrink-0">
                  <span className="text-sm font-semibold text-[#111827] whitespace-nowrap">
                    {t.type === "INCOME" ? "+ " : "- "}
                    {formatCurrency(t.amount)}
                  </span>
                </div>

                {/* Ações */}
                <div className="w-28 h-[72px] flex items-center justify-end gap-2 px-6 shrink-0">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-[#6B7280] hover:text-red-500" />
                  </button>
                  <button
                    onClick={() => handleEdit(t)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-[#6B7280]" />
                  </button>
                </div>
              </div>
            );
          })}

        {/* Pagination */}
        {(totalPages > 0 || filtered.length > 0) && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-sm text-[#4B5563]">
              {filtered.length === 0
                ? "0 resultados"
                : `${(page - 1) * ITEMS_PER_PAGE + 1} a ${Math.min(page * ITEMS_PER_PAGE, filtered.length)} | ${filtered.length} resultados`}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#374151]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-primary text-white"
                          : "border border-[#D1D5DB] bg-white text-[#374151] hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#374151]" />
                </button>
              </div>
            )}
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

