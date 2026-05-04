# Financy — Gestão Financeira Pessoal

> Projeto desenvolvido como atividade prática da **Pós-Graduação em Desenvolvimento Full Stack** da **Rocketseat**, aplicando os conceitos de construção de APIs GraphQL, autenticação JWT e interfaces React modernas.

---

## Visão Geral

**Financy** é uma aplicação full stack de gestão financeira pessoal que permite ao usuário controlar receitas, despesas e categorias de forma simples e visual. O projeto foi construído com uma API GraphQL no backend e uma SPA React no frontend, com design fiel a um protótipo Figma.

### Funcionalidades

- **Autenticação completa** — cadastro, login e sessão persistente via JWT
- **Dashboard** — resumo do saldo total, receitas e despesas do mês, últimas transações e gastos por categoria
- **Transações** — CRUD completo com filtros por tipo, categoria e período, paginação e busca por descrição
- **Categorias** — CRUD com ícone, cor e contador de transações vinculadas
- **Perfil** — visualização e edição dos dados do usuário

---

## Stack Tecnológica

### Backend

| Tecnologia     | Versão | Papel                    |
| -------------- | ------ | ------------------------ |
| Node.js        | 20+    | Runtime                  |
| Apollo Server  | 4      | Servidor GraphQL         |
| Prisma ORM     | 5      | Acesso ao banco de dados |
| SQLite         | —      | Banco de dados           |
| JSON Web Token | 9      | Autenticação             |
| bcryptjs       | 2      | Hash de senhas           |
| TypeScript     | 5      | Tipagem estática         |

### Frontend

| Tecnologia            | Versão | Papel                   |
| --------------------- | ------ | ----------------------- |
| React                 | 19     | UI                      |
| Vite                  | 8      | Bundler                 |
| TypeScript            | 6      | Tipagem estática        |
| Apollo Client         | 4      | Comunicação GraphQL     |
| Tailwind CSS          | 4      | Estilização             |
| Shadcn/ui + Radix UI  | —      | Componentes acessíveis  |
| React Router          | 7      | Roteamento SPA          |
| React Hook Form + Zod | —      | Formulários e validação |
| date-fns              | 4      | Manipulação de datas    |
| Lucide React          | —      | Ícones                  |
| Sonner                | —      | Notificações toast      |

---

## Arquitetura

```
pos-tech-financy/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos User, Category, Transaction
│   │   └── migrations/
│   └── src/
│       ├── graphql/
│       │   ├── typeDefs/       # Schema GraphQL
│       │   └── resolvers/      # Queries e Mutations
│       ├── middleware/         # Autenticação JWT
│       ├── utils/              # Helpers
│       └── server.ts           # Ponto de entrada Apollo Server
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/         # AppLayout, Sidebar
        │   ├── ui/             # Componentes base (Shadcn)
        │   ├── CategoryIcon    # Picker de ícones
        │   ├── CategoryModal   # Modal criar/editar categoria
        │   └── TransactionModal# Modal criar/editar transação
        ├── contexts/           # AuthContext (JWT + usuário)
        ├── graphql/            # Queries e Mutations Apollo
        ├── lib/                # Utilitários (format, catStyle)
        ├── pages/
        │   ├── auth/           # LoginPage, RegisterPage
        │   ├── DashboardPage
        │   ├── TransactionsPage
        │   ├── CategoriesPage
        │   └── ProfilePage
        ├── router/             # Rotas protegidas
        └── types/              # Tipagens globais
```

---

## Modelo de Dados

```
User
 ├── id (cuid)
 ├── name, email, password (hash)
 ├── resetToken?, resetTokenExpiry?
 ├── Category[]
 └── Transaction[]

Category
 ├── id, title, description?, icon, color
 ├── userId → User
 └── Transaction[]

Transaction
 ├── id, description, amount, type (INCOME | EXPENSE), date
 ├── userId → User
 └── categoryId? → Category (SetNull on delete)
```

---

## API GraphQL

### Queries

| Query                                                    | Descrição                                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `me`                                                     | Retorna o usuário autenticado                                                      |
| `transactions(type?, categoryId?, startDate?, endDate?)` | Lista transações com filtros opcionais                                             |
| `transaction(id)`                                        | Retorna uma transação pelo ID                                                      |
| `categories`                                             | Lista as categorias do usuário                                                     |
| `category(id)`                                           | Retorna uma categoria pelo ID                                                      |
| `dashboard`                                              | Retorna saldo, receitas/despesas do mês, últimas transações e resumo por categoria |

### Mutations

| Mutation                       | Descrição                            |
| ------------------------------ | ------------------------------------ |
| `register(input)`              | Cria novo usuário                    |
| `login(input)`                 | Autentica e retorna token JWT        |
| `updateProfile(input)`         | Atualiza nome/email/senha do usuário |
| `createTransaction(input)`     | Cria uma transação                   |
| `updateTransaction(id, input)` | Atualiza uma transação               |
| `deleteTransaction(id)`        | Remove uma transação                 |
| `createCategory(input)`        | Cria uma categoria                   |
| `updateCategory(id, input)`    | Atualiza uma categoria               |
| `deleteCategory(id)`           | Remove uma categoria                 |

> Todas as operações (exceto `register` e `login`) exigem o header `Authorization: Bearer <token>`.

---

## Pré-requisitos

- **Node.js** 20 ou superior
- **npm** 10 ou superior

---

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd pos-tech-financy
```

### 2. Configure e inicie o Backend

```bash
cd backend

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=sua_chave_secreta_aqui
PORT=4000
```

```bash
# Instale as dependências
npm install

# Execute as migrações e gere o cliente Prisma
npx prisma migrate dev
npx prisma generate

# Inicie o servidor em modo desenvolvimento
npm run dev
```

O servidor GraphQL estará disponível em `http://localhost:4000/graphql`.

### 3. Configure e inicie o Frontend

```bash
cd ../frontend

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
```

Edite o `.env`:

```env
VITE_BACKEND_URL=http://localhost:4000/
```

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## Scripts Disponíveis

### Backend

| Comando                  | Descrição                                     |
| ------------------------ | --------------------------------------------- |
| `npm run dev`            | Inicia em modo desenvolvimento com hot-reload |
| `npm run build`          | Compila TypeScript para `dist/`               |
| `npm start`              | Inicia a versão compilada                     |
| `npm run prisma:migrate` | Executa as migrações do banco                 |
| `npm run prisma:studio`  | Abre o Prisma Studio (GUI do banco)           |

### Frontend

| Comando           | Descrição                                |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Inicia o Vite em modo desenvolvimento    |
| `npm run build`   | Gera o build de produção em `dist/`      |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint`    | Executa o ESLint                         |

---

## Decisões Técnicas

### GraphQL com Apollo Server v4

A escolha por GraphQL permite que o frontend requisite exatamente os campos necessários, evitando over-fetching e under-fetching. O Apollo Server v4 traz melhorias significativas de performance e API mais simples em relação à v3.

### Prisma ORM + SQLite

O Prisma oferece type-safety end-to-end com as models geradas automaticamente. O SQLite elimina a necessidade de infraestrutura externa de banco de dados, facilitando a execução local do projeto.

### Autenticação com JWT

Tokens JWT são armazenados no `localStorage` e enviados como `Bearer token` no header `Authorization`. O middleware valida e injeta o `userId` no contexto do Apollo Server.

### Tailwind CSS v4 com Design Tokens

As variáveis do Figma foram mapeadas no bloco `@theme inline` do CSS, criando utilities customizadas (`bg-primary`, `bg-card`, `text-foreground`) alinhadas ao design system do projeto.

### React Hook Form + Zod

A validação dos formulários é feita em camadas: Zod define o schema e o React Hook Form gerencia o estado do form, garantindo UX com feedback de erro em tempo real sem re-renders desnecessários.

---

## Estrutura das Páginas

| Rota            | Página           | Acesso      |
| --------------- | ---------------- | ----------- |
| `/login`        | LoginPage        | Público     |
| `/register`     | RegisterPage     | Público     |
| `/`             | DashboardPage    | Autenticado |
| `/transactions` | TransactionsPage | Autenticado |
| `/categories`   | CategoriesPage   | Autenticado |
| `/profile`      | ProfilePage      | Autenticado |

Rotas protegidas redirecionam para `/login` se não houver token válido.

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável       | Descrição                         | Exemplo               |
| -------------- | --------------------------------- | --------------------- |
| `DATABASE_URL` | Caminho do banco SQLite           | `file:./dev.db`       |
| `JWT_SECRET`   | Chave secreta para assinar tokens | `minha_chave_secreta` |
| `PORT`         | Porta do servidor                 | `4000`                |

### Frontend (`frontend/.env`)

| Variável           | Descrição               | Exemplo                  |
| ------------------ | ----------------------- | ------------------------ |
| `VITE_BACKEND_URL` | URL base da API GraphQL | `http://localhost:4000/` |

---

## Licença

Projeto desenvolvido para fins acadêmicos — Pós-Graduação Full Stack, Rocketseat.
