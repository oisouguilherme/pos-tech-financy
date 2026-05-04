import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000/',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('financy_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ error }) => {
  const err = error as { errors?: Array<{ message: string; extensions?: { code?: string } }> } | null;
  if (err && 'errors' in err && Array.isArray(err.errors)) {
    err.errors.forEach(({ message, extensions }) => {
      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('financy_token');
        window.location.href = '/';
      }
      console.error('[GraphQL error]', message);
    });
  } else {
    console.error('[Network error]', error);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
