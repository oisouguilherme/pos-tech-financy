import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { DateTimeResolver } from "graphql-scalars";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { buildContext } from "./middleware/auth";
import { prisma } from "./utils/prisma";

const PORT = parseInt(process.env.PORT ?? "4000", 10);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

async function bootstrap() {
  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      ...resolvers,
      DateTime: DateTimeResolver,
    },
    formatError: (formattedError) => {
      // Don't expose internal errors to clients
      if (formattedError.extensions?.code === "INTERNAL_SERVER_ERROR") {
        return {
          message: "Internal server error",
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        };
      }
      return formattedError;
    },
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async ({ req }) =>
      buildContext(
        req as { headers: Record<string, string | string[] | undefined> },
      ),
  });

  console.log(`🚀 Server ready at: ${url}`);
  console.log(`   Allowed CORS origin: ${FRONTEND_ORIGIN}`);
}

bootstrap().catch(async (err) => {
  console.error("Failed to start server:", err);
  await prisma.$disconnect();
  process.exit(1);
});
