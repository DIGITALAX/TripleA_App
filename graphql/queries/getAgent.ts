import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const AGENT = gql`
  query ($SkyhuntersAgentManager_id: Int!) {
    agentCreateds(
      where: { SkyhuntersAgentManager_id: $SkyhuntersAgentManager_id }
      first: 1
    ) {
      owners
      metadata {
        title
        style
        messageExamples
        lore
        knowledge
        feeds
        customInstructions
        cover
        bio
        model
        adjectives
      }
      creator
      collectionIdsHistory {
        artist
        collectionId
      }
      activeCollectionIds {
        artist
        collectionId
      }
      balances {
        token
        rentBalance
        historicalRentBalance
        historicalBonusBalance
        collectionId
        bonusBalance
      }
      scoreNegative
      scorePositive
      transactionHash
      uri
      wallets
      blockNumber
      blockTimestamp
      SkyhuntersAgentManager_id
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
        collection {
          uri
          metadata {
            title
            image
          }
        }
      }
    }
  }
`;

export const getAgent = async (
  SkyhuntersAgentManager_id: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: AGENT,
    variables: {
      SkyhuntersAgentManager_id,
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
