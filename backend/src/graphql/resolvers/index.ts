import { authResolvers } from "./auth";
import { userResolvers } from "./user";
import { transactionResolvers } from "./transaction";
import { categoryResolvers } from "./category";
import { dashboardResolvers } from "./dashboard";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...transactionResolvers.Query,
    ...categoryResolvers.Query,
    ...dashboardResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...transactionResolvers.Mutation,
    ...categoryResolvers.Mutation,
  },
  Transaction: transactionResolvers.Transaction,
};
