import { GraphQLError } from "graphql";
import { prisma } from "../../utils/prisma";

type TransactionType = "INCOME" | "EXPENSE";
import { GraphQLContext } from "../../middleware/auth";

function requireAuth(context: GraphQLContext): string {
  if (!context.userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.userId;
}

interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

interface CreateTransactionInput {
  description: string;
  amount: number;
  type: TransactionType;
  date: Date | string;
  categoryId?: string;
}

interface UpdateTransactionInput {
  description?: string;
  amount?: number;
  type?: TransactionType;
  date?: Date | string;
  categoryId?: string | null;
}

export const transactionResolvers = {
  Query: {
    async transactions(
      _: unknown,
      filters: TransactionFilters,
      context: GraphQLContext,
    ) {
      const userId = requireAuth(context);

      const where: Record<string, unknown> = { userId };

      if (filters.type) where["type"] = filters.type;
      if (filters.categoryId) where["categoryId"] = filters.categoryId;
      if (filters.startDate || filters.endDate) {
        const dateFilter: Record<string, Date> = {};
        if (filters.startDate) dateFilter["gte"] = new Date(filters.startDate);
        if (filters.endDate) dateFilter["lte"] = new Date(filters.endDate);
        where["date"] = dateFilter;
      }

      return prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
      });
    },
  },

  Mutation: {
    async createTransaction(
      _: unknown,
      { input }: { input: CreateTransactionInput },
      context: GraphQLContext,
    ) {
      const userId = requireAuth(context);

      if (!input.description?.trim()) {
        throw new GraphQLError("Description is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (input.amount <= 0) {
        throw new GraphQLError("Amount must be greater than 0", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (input.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: input.categoryId },
        });
        if (!category || category.userId !== userId) {
          throw new GraphQLError("Category not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
      }

      return prisma.transaction.create({
        data: {
          description: input.description.trim(),
          amount: input.amount,
          type: input.type,
          date: new Date(input.date),
          userId,
          categoryId: input.categoryId ?? null,
        },
        include: { category: true },
      });
    },

    async updateTransaction(
      _: unknown,
      { id, input }: { id: string; input: UpdateTransactionInput },
      context: GraphQLContext,
    ) {
      const userId = requireAuth(context);

      const existing = await prisma.transaction.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        throw new GraphQLError("Transaction not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (input.amount !== undefined && input.amount <= 0) {
        throw new GraphQLError("Amount must be greater than 0", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (input.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: input.categoryId },
        });
        if (!category || category.userId !== userId) {
          throw new GraphQLError("Category not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
      }

      const data: Record<string, unknown> = {};
      if (input.description !== undefined)
        data["description"] = input.description.trim();
      if (input.amount !== undefined) data["amount"] = input.amount;
      if (input.type !== undefined) data["type"] = input.type;
      if (input.date !== undefined) data["date"] = new Date(input.date);
      if ("categoryId" in input) data["categoryId"] = input.categoryId ?? null;

      return prisma.transaction.update({
        where: { id },
        data,
        include: { category: true },
      });
    },

    async deleteTransaction(
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) {
      const userId = requireAuth(context);

      const existing = await prisma.transaction.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        throw new GraphQLError("Transaction not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      await prisma.transaction.delete({ where: { id } });
      return true;
    },
  },

  Transaction: {
    category: (parent: { categoryId: string | null; category?: unknown }) => {
      return parent.category ?? null;
    },
  },
};
