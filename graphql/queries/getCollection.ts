import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const COLLECTION = gql`
  query ($collectionId: Int!) {
    collectionCreateds(
      where: { collectionId: $collectionId }
      first: 1
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
      id
      artist
      collectionId
      metadata {
        image
        title
        description
        format
        sizes
        colors
      }
      dropId
      amountSold
      amount
      agentIds
      tokenIds
      active
      collectionType
      transactionHash
      uri
      prices {
        price
        token
      }
      blockTimestamp
      isAgent
      remixId
      remixable
      fulfillerId
      collectionType
      remixCollection {
        artist
        uri
        metadata {
          image
          title
        }
      }
    }
  }
`;

const COLLECTION_REMIX = gql`
  query ($collectionId: Int!) {
    collectionCreateds(
      where: { collectionId: $collectionId }
      first: 1
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
      uri
      metadata {
        image
      }
      artist
    }
  }
`;

export const getCollection = async (
  collectionId: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: COLLECTION,
    variables: { collectionId },
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

export const getCollectionRemix = async (
  collectionId: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: COLLECTION_REMIX,
    variables: { collectionId },
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
