import { gql } from '@apollo/client/core';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        createdAt
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        createdAt
      }
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      message
      resetToken
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

// ─── User ────────────────────────────────────────────────────────────────────

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      createdAt
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String!) {
    updateProfile(name: $name) {
      id
      name
      email
      createdAt
    }
  }
`;

// ─── Transactions ─────────────────────────────────────────────────────────────

export const TRANSACTIONS_QUERY = gql`
  query Transactions(
    $type: TransactionType
    $categoryId: ID
    $startDate: DateTime
    $endDate: DateTime
  ) {
    transactions(
      type: $type
      categoryId: $categoryId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      description
      amount
      type
      date
      createdAt
      category {
        id
        title
        icon
        color
      }
    }
  }
`;

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      description
      amount
      type
      date
      createdAt
      category {
        id
        title
        icon
        color
      }
    }
  }
`;

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      description
      amount
      type
      date
      createdAt
      category {
        id
        title
        icon
        color
      }
    }
  }
`;

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

// ─── Categories ──────────────────────────────────────────────────────────────

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      title
      description
      icon
      color
      transactionCount
      createdAt
    }
  }
`;

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      title
      description
      icon
      color
      transactionCount
      createdAt
    }
  }
`;

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      title
      description
      icon
      color
      transactionCount
      createdAt
    }
  }
`;

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const DASHBOARD_QUERY = gql`
  query Dashboard {
    dashboard {
      totalBalance
      monthlyIncome
      monthlyExpense
      recentTransactions {
        id
        description
        amount
        type
        date
        category {
          id
          title
          icon
          color
        }
      }
      categorySummary {
        category {
          id
          title
          icon
          color
        }
        total
        count
      }
    }
  }
`;
