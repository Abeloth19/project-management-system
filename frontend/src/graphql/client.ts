import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || "http://localhost:8000/graphql/",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Organization: {
        keyFields: ["slug"],
      },
      Project: {
        keyFields: ["id"],
        fields: {
          tasks: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(_existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Task: {
        keyFields: ["id"],
        fields: {
          comments: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(_existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export default client;
