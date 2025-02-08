import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const FULFILLERS = gql`
  query {
    fulfillerCreateds {
      metadata {
        description
        cover
        title
        link
      }
      orderHistory
      uri
      wallet
      fulfillerId
      activeOrders
    }
  }
`;

export const getFulfillers = async (): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: FULFILLERS,

    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });

  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({ timedOut: true });
    }, 60000);
  });

  const result: any = await Promise.race([queryPromise, timeoutPromise]);

  timeoutId && clearTimeout(timeoutId);

  if (result.timedOut) {
    return;
  } else {
    return result;
  }
};
