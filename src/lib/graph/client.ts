import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const aaaLink = new HttpLink({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_KEY}/subgraphs/id/AudwYcFk14weD3LBKdn3kcgvT2JQKas31ZrKrTk8UF3K`,
});

export const aaaClient = new ApolloClient({
  link: aaaLink,
  cache: new InMemoryCache(),
});
