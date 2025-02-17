import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const ARTISTS_PAID = gql`
  query ($skip: Int!) {
    artistPaids(
      first: 20
      skip: $skip
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
      forArtist
      token
      agentId
      amount
      blockTimestamp
      collection {
        collectionId
        artist
        uri
        metadata {
          image
        }
      }
      transactionHash
    }
  }
`;

export const getArtistPaid = async (
  skip: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: ARTISTS_PAID,
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
