import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const getTripleUri = () => {
  if (typeof window === "undefined") {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    return `${baseUrl}/api/graphql/triplea`;
  }
  return "/api/graphql/triplea";
};

const aaaLink = new HttpLink({
  uri: getTripleUri(),
});

export const aaaClient = new ApolloClient({
  link: aaaLink,

  cache: new InMemoryCache(),
});

const tripleServerLink = new HttpLink({
  uri: process.env.GRAPH_NODE_URL_TRIPLEA,
});

export const graphTripleServer = new ApolloClient({
  link: tripleServerLink,
  cache: new InMemoryCache(),
});
