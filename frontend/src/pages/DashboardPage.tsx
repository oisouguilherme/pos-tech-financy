import { useQuery } from "@apollo/client/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_QUERY } from "@/graphql/queries";
import { formatCurrency } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionModal } from "@/components/TransactionModal";
import type { DashboardData } from "@/types";

export function DashboardPage() {
  const [openNewTransaction, setOpenNewTransaction] = useState(false);
  const { data, loading } = useQuery<{ dashboard: DashboardData }>(
    DASHBOARD_QUERY,
  );

  const dash = data?.dashboard;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Saldo total"
          value={dash?.totalBalance ?? 0}
          icon={<Wallet className="w-5 h-5" />}
          color="text-foreground"
          loading={loading}
        />
        <StatCard
          label="Receitas do mês"
          value={dash?.monthlyIncome ?? 0}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          color="text-green-600"
          loading={loading}
        />
        <StatCard
          label="Despesas do mês"
          value={dash?.monthlyExpense ?? 0}
          icon={<TrendingDown className="w-5 h-5 text-red-500" />}
          color="text-red-500"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Transações recentes
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary text-sm"
              onClick={() => setOpenNewTransaction(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova transação
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            )}
            {!loading && !dash?.recentTransactions.length && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma transação ainda
              </p>
            )}
            {dash?.recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: t.category?.color
                      ? `${t.category.color}20`
                      : "#f3f4f6",
                  }}
                >
                  <CategoryIcon
                    icon={t.category?.icon ?? "circle"}
                    className="w-4 h-4"
                    style={{ color: t.category?.color ?? "#6b7280" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {t.category && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0"
                        style={{
                          backgroundColor: `${t.category.color}20`,
                          color: t.category.color,
                        }}
                      >
                        {t.category.title}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(t.date), "dd/MM/yy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    t.type === "INCOME" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Categorias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            )}
            {!loading && !dash?.categorySummary.length && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma categoria com transações
              </p>
            )}
            {dash?.categorySummary.map((cs) => (
              <div key={cs.category.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cs.category.color}20` }}
                >
                  <CategoryIcon
                    icon={cs.category.icon}
                    className="w-4 h-4"
                    style={{ color: cs.category.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {cs.category.title}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(cs.total)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cs.count} {cs.count === 1 ? "item" : "itens"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <TransactionModal
        open={openNewTransaction}
        onClose={() => setOpenNewTransaction(false)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          {icon}
        </div>
        {loading ? (
          <div className="h-7 w-32 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className={`text-2xl font-bold ${color}`}>
            {formatCurrency(value)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
