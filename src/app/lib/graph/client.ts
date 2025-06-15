import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const aaaLink = new HttpLink({
  uri: `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_KEY}/subgraphs/id/5XK1Z5BL6TGMmpJV4irttCu4RgAePp7sPLKnPZfXVCcK`,
});  

export const aaaClient = new ApolloClient({
  link: aaaLink,
  cache: new InMemoryCache(),
});
