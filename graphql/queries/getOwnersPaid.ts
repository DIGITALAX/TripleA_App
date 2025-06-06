import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const OWNERS_PAID = gql`
  query ($skip: Int!) {
    ownerPaids(
      first: 20
      skip: $skip
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
      amount
      blockTimestamp
      owner
      collection {
        collectionId
        artist
        uri
        metadata {
          image
        }
      }
      token
      transactionHash
    }
  }
`;

export const getOwnersPaid = async (
  skip: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: OWNERS_PAID,
    variables: {
      skip,
    },
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
