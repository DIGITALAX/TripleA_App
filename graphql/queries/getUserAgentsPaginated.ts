import { aaaClient ,graphTripleServer } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const USER_AGENTS = gql`
  query ($creator: String!, $skip: Int!) {
    agentCreateds(where: { creator: $creator }, first: 20, skip: $skip) {
      metadata {
        title
        bio
        cover
        customInstructions
      }
      creator
      owners
      blockTimestamp
      balances {
        token
        rentBalance
        historicalRentBalance
        historicalBonusBalance
        collectionId
        bonusBalance
      }
      activeCollectionIds {
        collectionId
        artist
        metadata {
          image
          title
        }
      }
      workers {
        remixFrequency
        remix
        mintFrequency
        mint
        publishFrequency
        publish
        leadFrequency
        lead
        instructions
        tokens
        collectionId
      }
      collectionIdsHistory {
        collectionId
        artist
        metadata {
          image
          title
        }
      }
      blockNumber
      SkyhuntersAgentManager_id
      transactionHash
      uri
      wallets
    }
  }
`;

export const getUserAgentsPaginated = async (
  creator: string,
  skip: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = (typeof window === "undefined" ? graphTripleServer : aaaClient).query({
    query: USER_AGENTS,
    variables: {
      creator,
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
