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

export const userResolvers = {
  Query: {
    async me(_: unknown, __: unknown, context: GraphQLContext) {
      const userId = requireAuth(context);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return user;
    },
  },

  Mutation: {
    async updateProfile(
      _: unknown,
      { name }: { name: string },
      context: GraphQLContext,
    ) {
      const userId = requireAuth(context);

      if (!name?.trim()) {
        throw new GraphQLError("Name is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      return prisma.user.update({
        where: { id: userId },
        data: { name: name.trim() },
      });
    },
  },
};
