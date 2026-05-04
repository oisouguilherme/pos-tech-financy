import { useQuery } from "@apollo/client/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Wallet,
  CircleArrowUp,
  CircleArrowDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DASHBOARD_QUERY } from "@/graphql/queries";
import { formatCurrency } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionModal } from "@/components/TransactionModal";
import type { DashboardData } from "@/types";

// Figma palette: maps stored hex → { bg (light), text (dark) }
const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  "#1f6f43": { bg: "#E0FAE9", text: "#124B2B" },
  "#2563eb": { bg: "#DBEAFE", text: "#1D4ED8" },
  "#9333ea": { bg: "#F3E8FF", text: "#7E22CE" },
  "#db2777": { bg: "#FCE7F3", text: "#BE185D" },
  "#dc2626": { bg: "#FEE2E2", text: "#B91C1C" },
  "#ea580c": { bg: "#FFEDD5", text: "#C2410C" },
  "#ca8a04": { bg: "#F7F3CA", text: "#A16207" },
  "#16a34a": { bg: "#E0FAE9", text: "#15803D" },
  "#6b7280": { bg: "#F3F4F6", text: "#4B5563" },
  "#111827": { bg: "#F3F4F6", text: "#374151" },
};

function catStyle(color?: string | null) {
  if (!color) return { bg: "#F3F4F6", text: "#4B5563" };
  return COLOR_MAP[color.toLowerCase()] ?? { bg: `${color}20`, text: color };
}

export function DashboardPage() {
  const [openNewTransaction, setOpenNewTransaction] = useState(false);
  const navigate = useNavigate();
  const { data, loading, refetch } = useQuery<{ dashboard: DashboardData }>(
    DASHBOARD_QUERY,
  );

  const dash = data?.dashboard;

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        {/* ── Stat Cards ── */}
        {/* Saldo Total */}
        <div className="bg-card border border-border rounded-xl p-6.25 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-purple-600 shrink-0" />
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-muted-foreground">
              Saldo total
            </span>
          </div>
          {loading ? (
            <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-[28px] font-bold text-foreground leading-8">
              {formatCurrency(dash?.totalBalance ?? 0)}
            </p>
          )}
        </div>

        {/* Receitas */}
        <div className="bg-card border border-border rounded-xl p-6.25 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CircleArrowUp className="w-5 h-5 text-[#16A34A] shrink-0" />
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-muted-foreground">
              Receitas do mês
            </span>
          </div>
          {loading ? (
            <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-[28px] font-bold text-foreground leading-8">
              {formatCurrency(dash?.monthlyIncome ?? 0)}
            </p>
          )}
        </div>

        {/* Despesas */}
        <div className="bg-card border border-border rounded-xl p-6.25 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CircleArrowDown className="w-5 h-5 text-[#DC2626] shrink-0" />
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-muted-foreground">
              Despesas do mês
            </span>
          </div>
          {loading ? (
            <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-[28px] font-bold text-foreground leading-8">
              {formatCurrency(dash?.monthlyExpense ?? 0)}
            </p>
          )}
        </div>

        {/* ── Transações Recentes (col-span-2) ── */}
        <div className="col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-muted-foreground">
              Transações recentes
            </span>
            <button
              onClick={() => navigate("/transacoes")}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 h-20 px-6 border-b border-border last:border-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}

            {!loading && !dash?.recentTransactions.length && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhuma transação ainda
              </p>
            )}

            {!loading &&
              dash?.recentTransactions.map((t) => {
                const cs = catStyle(t.category?.color);
                return (
                  <div
                    key={t.id}
                    className="flex items-center border-b border-border last:border-0"
                  >
                    {/* Icon + title + date */}
                    <div className="flex flex-1 items-center gap-4 h-20 px-6 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cs.bg }}
                      >
                        <CategoryIcon
                          icon={t.category?.icon ?? "circle"}
                          className="w-4 h-4"
                          style={{ color: cs.text }}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-base font-medium text-foreground truncate">
                          {t.description}
                        </span>
                        <span className="text-sm text-[#4B5563]">
                          {format(new Date(t.date), "dd/MM/yy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Category tag */}
                    <div className="w-40 h-20 flex items-center justify-center px-6 shrink-0">
                      {t.category && (
                        <span
                          className="text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap"
                          style={{
                            backgroundColor: cs.bg,
                            color: cs.text,
                          }}
                        >
                          {t.category.title}
                        </span>
                      )}
                    </div>

                    {/* Amount + icon */}
                    <div className="w-40 h-20 flex items-center justify-end gap-2 px-6 shrink-0">
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {t.type === "INCOME" ? "+ " : "- "}
                        {formatCurrency(t.amount)}
                      </span>
                      {t.type === "INCOME" ? (
                        <CircleArrowUp className="w-4 h-4 text-[#16A34A] shrink-0" />
                      ) : (
                        <CircleArrowDown className="w-4 h-4 text-[#DC2626] shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Footer: Nova transação */}
          <div className="flex items-center justify-center px-6 py-5">
            <button
              onClick={() => setOpenNewTransaction(true)}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Nova transação
            </button>
          </div>
        </div>

        {/* ── Categorias (col-span-1) ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <span className="text-[11px] font-medium tracking-[0.6px] uppercase text-muted-foreground">
              Categorias
            </span>
            <button
              onClick={() => navigate("/categorias")}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
            >
              Gerenciar
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-5 p-6">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-7 w-24 rounded-full bg-gray-100 animate-pulse" />
                  <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}

            {!loading && !dash?.categorySummary.length && (
              <p className="text-sm text-muted-foreground text-center">
                Nenhuma categoria com transações
              </p>
            )}

            {!loading &&
              dash?.categorySummary.map((cs) => {
                const style = catStyle(cs.category.color);
                return (
                  <div key={cs.category.id} className="flex items-center gap-1">
                    {/* Category pill */}
                    <span
                      className="text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap shrink-0"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                      }}
                    >
                      {cs.category.title}
                    </span>
                    {/* Count */}
                    <span className="flex-1 text-sm text-[#4B5563] text-right min-w-0">
                      {cs.count} {cs.count === 1 ? "item" : "itens"}
                    </span>
                    {/* Total */}
                    <span className="text-sm font-semibold text-foreground text-right w-22 shrink-0">
                      {formatCurrency(cs.total)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <TransactionModal
        open={openNewTransaction}
        onClose={() => {
          setOpenNewTransaction(false);
          refetch();
        }}
      />
    </>
  );
}
