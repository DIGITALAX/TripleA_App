import { aaaClient ,graphTripleServer } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const AGENT_RENT = gql`
  query ($agentId: Int!) {
    agentPaidRents(
      where: { agentId: $agentId }
      first: 100
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
      transactionHash
      tokens
      collectionIds
      bonuses
      blockTimestamp
      blockNumber
      amounts
      agentId
    }
  }
`;

export const getAgentRent = async (
  agentId: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = (typeof window === "undefined" ? graphTripleServer : aaaClient).query({
    query: AGENT_RENT,
    variables: {
      agentId,
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
