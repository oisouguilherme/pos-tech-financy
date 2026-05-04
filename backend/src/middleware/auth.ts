import { verifyToken } from "../utils/jwt";

export interface GraphQLContext {
  userId: string | null;
}

export function buildContext(req: {
  headers: Record<string, string | string[] | undefined>;
}): GraphQLContext {
  const authHeader = req.headers["authorization"];
  if (!authHeader || typeof authHeader !== "string") {
    return { userId: null };
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return { userId: null };
  }

  const token = parts[1];
  try {
    const payload = verifyToken(token);
    return { userId: payload.userId };
  } catch {
    return { userId: null };
  }
}
