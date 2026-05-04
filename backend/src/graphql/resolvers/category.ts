import { GraphQLError } from "graphql";
import { prisma } from "../../utils/prisma";
import { GraphQLContext } from "../../middleware/auth";

function requireAuth(context: GraphQLContext): string {
  if (!context.userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.userId;
}

interface CreateCategoryInput {
  title: string;
  description?: string;
  icon: string;
  color: string;
}

interface UpdateCategoryInput {
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export const categoryResolvers = {
  Query: {
    async categories(_: unknown, __: unknown, context: GraphQLContext) {
      const userId = requireAuth(context);

      const categories = await prisma.category.findMany({
        where: { userId },
        include: { _count: { select: { transactions: true } } },
        orderBy: { createdAt: "asc" },
      });

      return categories.map((cat) => ({
        ...cat,
        transactionCount: cat._count.transactions,
      }));
    },
  },

  Mutation: {
    async createCategory(
      _: unknown,
      { input }: { input: CreateCategoryInput },
      context: GraphQLContext,
    ) {
      const userId = requireAuth(context);

      if (!input.title?.trim()) {
        throw new GraphQLError("Title is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (!input.icon?.trim()) {
        throw new GraphQLError("Icon is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (!input.color?.trim()) {
        throw new GraphQLError("Color is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const category = await prisma.category.create({
        data: {
          title: input.title.trim(),
          description: input.description?.trim() ?? null,
          icon: input.icon.trim(),
          color: input.color.trim(),
          userId,
        },
        include: { _count: { select: { transactions: true } } },
      });

      return { ...category, transactionCount: category._count.transactions };
    },

    async updateCategory(
      _: unknown,
      { id, input }: { id: string; input: UpdateCategoryInput },
      context: GraphQLContext,
    ) {
      const userId = requireAuth(context);

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const data: Record<string, unknown> = {};
      if (input.title !== undefined) data["title"] = input.title.trim();
      if ("description" in input)
        data["description"] = input.description?.trim() ?? null;
      if (input.icon !== undefined) data["icon"] = input.icon.trim();
      if (input.color !== undefined) data["color"] = input.color.trim();

      const category = await prisma.category.update({
        where: { id },
        data,
        include: { _count: { select: { transactions: true } } },
      });

      return { ...category, transactionCount: category._count.transactions };
    },

    async deleteCategory(
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) {
      const userId = requireAuth(context);

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      await prisma.category.delete({ where: { id } });
      return true;
    },
  },
};
