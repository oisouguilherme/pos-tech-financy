export type TransactionType = "INCOME" | "EXPENSE";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: string;
  title: string;
  description?: string | null;
  icon: string;
  color: string;
  transactionCount: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category?: Category | null;
  createdAt: string;
}

export interface CategorySummary {
  category: Category;
  total: number;
  count: number;
}

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentTransactions: Transaction[];
  categorySummary: CategorySummary[];
}

export interface AuthPayload {
  token: string;
  user: User;
}
