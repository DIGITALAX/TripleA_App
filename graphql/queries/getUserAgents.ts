import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const USER_AGENTS = gql`
  query ($creator: String!) {
    agentCreateds(where: { creator: $creator }) {
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
      collectionIdsHistory {
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
        publishFrequency
        publish
        leadFrequency
        lead
        instructions
        tokens
        collectionId
      }
      blockNumber
      SkyhuntersAgentManager_id
      transactionHash
      uri
      wallets
    }
  }
`;

export const getUserAgents = async (
  creator: string
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: USER_AGENTS,
    variables: {
      creator,
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
