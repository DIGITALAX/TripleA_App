import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const ORDERS = gql`
  query ($buyer: String!, $skip: Int!) {
    collectionPurchaseds(
      where: { buyer_contains: $buyer }
      orderDirection: desc
      orderBy: blockTimestamp
      first: 20
      skip: $skip
    ) {
      id
      totalPrice
      paymentToken
      mintedTokens
      transactionHash
      collectionId
      collection {
        metadata {
          image
          title
          format
        }
        id
        collectionType
        artist
      }
      buyer
      amount
      blockTimestamp
      fulfilled
      fulfillment
      fulfiller
    }
  }
`;

export const getOrdersPaginated = async (
  buyer: string,
  skip: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: ORDERS,
    variables: { buyer, skip },
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
