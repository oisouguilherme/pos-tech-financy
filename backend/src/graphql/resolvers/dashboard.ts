import { GraphQLError } from "graphql";
import { prisma } from "../../utils/prisma";

type TransactionType = "INCOME" | "EXPENSE";
const TransactionType = {
  INCOME: "INCOME" as const,
  EXPENSE: "EXPENSE" as const,
};
import { GraphQLContext } from "../../middleware/auth";

function requireAuth(context: GraphQLContext): string {
  if (!context.userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.userId;
}

export const dashboardResolvers = {
  Query: {
    async dashboard(_: unknown, __: unknown, context: GraphQLContext) {
      const userId = requireAuth(context);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const [allTransactions, monthlyTransactions, recentRaw, categories] =
        await Promise.all([
          prisma.transaction.findMany({
            where: { userId },
            select: { type: true, amount: true },
          }),
          prisma.transaction.findMany({
            where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
            select: { type: true, amount: true },
          }),
          prisma.transaction.findMany({
            where: { userId },
            include: {
              category: {
                include: { _count: { select: { transactions: true } } },
              },
            },
            orderBy: { date: "desc" },
            take: 5,
          }),
          prisma.category.findMany({
            where: { userId },
            include: {
              _count: { select: { transactions: true } },
              transactions: { select: { type: true, amount: true } },
            },
          }),
        ]);

      const totalIncome = allTransactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = allTransactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
      const totalBalance = totalIncome - totalExpense;

      const monthlyIncome = monthlyTransactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      const monthlyExpense = monthlyTransactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      const recentTransactions = recentRaw.map((t) => ({
        ...t,
        category: t.category
          ? { ...t.category, transactionCount: t.category._count.transactions }
          : null,
      }));

      const categorySummary = categories
        .map((cat) => ({
          category: { ...cat, transactionCount: cat._count.transactions },
          total: cat.transactions.reduce((sum, t) => sum + t.amount, 0),
          count: cat._count.transactions,
        }))
        .filter((cs) => cs.count > 0)
        .sort((a, b) => b.total - a.total);

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        recentTransactions,
        categorySummary,
      };
    },
  },
};
