import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar DateTime

  enum TransactionType {
    INCOME
    EXPENSE
  }

  # ─── Types ──────────────────────────────────────────────────────────────────

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type ForgotPasswordPayload {
    message: String!
    resetToken: String!
  }

  type Category {
    id: ID!
    title: String!
    description: String
    icon: String!
    color: String!
    transactionCount: Int!
    createdAt: DateTime!
  }

  type Transaction {
    id: ID!
    description: String!
    amount: Float!
    type: TransactionType!
    date: DateTime!
    category: Category
    createdAt: DateTime!
  }

  type CategorySummary {
    category: Category!
    total: Float!
    count: Int!
  }

  type DashboardData {
    totalBalance: Float!
    monthlyIncome: Float!
    monthlyExpense: Float!
    recentTransactions: [Transaction!]!
    categorySummary: [CategorySummary!]!
  }

  # ─── Inputs ─────────────────────────────────────────────────────────────────

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateTransactionInput {
    description: String!
    amount: Float!
    type: TransactionType!
    date: DateTime!
    categoryId: ID
  }

  input UpdateTransactionInput {
    description: String
    amount: Float
    type: TransactionType
    date: DateTime
    categoryId: ID
  }

  input CreateCategoryInput {
    title: String!
    description: String
    icon: String!
    color: String!
  }

  input UpdateCategoryInput {
    title: String
    description: String
    icon: String
    color: String
  }

  # ─── Queries ────────────────────────────────────────────────────────────────

  type Query {
    me: User!
    transactions(
      type: TransactionType
      categoryId: ID
      startDate: DateTime
      endDate: DateTime
    ): [Transaction!]!
    categories: [Category!]!
    dashboard: DashboardData!
  }

  # ─── Mutations ──────────────────────────────────────────────────────────────

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    forgotPassword(email: String!): ForgotPasswordPayload!
    resetPassword(token: String!, newPassword: String!): Boolean!
    updateProfile(name: String!): User!

    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!

    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
  }
`;
