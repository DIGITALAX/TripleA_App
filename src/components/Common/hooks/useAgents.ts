import { SetStateAction, useEffect } from "react";
import { Agent } from "../../Dashboard/types/dashboard.types";
import { getAgents } from "../../../../graphql/queries/getAgents";
import { INFURA_GATEWAY } from "@/lib/constants";
import {
  Account,
  evmAddress,
  PublicClient,
  SessionClient,
} from "@lens-protocol/client";
import { TokenThreshold } from "../types/common.types";
import { getTokenThresholds } from "../../../../graphql/queries/getTokenThresholds";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

const useAgents = (
  agents: Agent[],
  setAgents: (e: SetStateAction<Agent[]>) => void,
  lensClient: SessionClient | PublicClient,
  tokenThresholds: TokenThreshold[],
  setTokenThresholds: (e: SetStateAction<TokenThreshold[]>) => void,
  setAgentsLoading: (e: SetStateAction<boolean>) => void
) => {
  const loadAgents = async () => {
    setAgentsLoading(true);
    try {
      const data = await getAgents();

      const profileCache = new Map<string, Account>();
      const metadataCache = new Map<string, Account>();

      const allAgents: Agent[] = await Promise.all(
        data?.data?.agentCreateds?.map(async (agent: any) => {
          if (!agent.metadata) {
            if (!metadataCache.has(agent.uri)) {
              const cadena = await fetch(
                `${INFURA_GATEWAY}/ipfs/${agent.uri.split("ipfs://")?.[1]}`
              );
              metadataCache.set(agent.uri, await cadena.json());
            }
            agent.metadata = metadataCache.get(agent.uri);
          }

          const creatorAddress = evmAddress(agent?.creator);
          if (!profileCache.has(creatorAddress)) {
            const result = await fetchAccountsAvailable(lensClient, {
              managedBy: creatorAddress,
              includeOwned: true,
            });

            if (result.isErr()) {
              setAgentsLoading(false);
              return;
            }

            profileCache.set(creatorAddress, result.value.items?.[0]?.account);
          }

          const profile = profileCache.get(creatorAddress);

          return {
            id: agent?.SkyhuntersAgentManager_id,
            cover: agent?.metadata?.cover,
            title: agent?.metadata?.title,
            bio: agent?.metadata?.bio,
            customInstructions: agent?.metadata?.customInstructions,
            creator: agent?.creator,
            balances: agent?.balances,
            workers: agent?.workers,
            owners: agent?.owners,
            wallets: agent?.wallets,
            activeCollectionIds: agent?.activeCollectionIds,
            collectionIdHistory: agent?.collectionIdHistory,
            profile,
          };
        })
      );
      setAgents?.(allAgents?.sort(() => Math.random() - 0.5));
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentsLoading(false);
  };

  const loadThresholdsAndRent = async () => {
    try {
      const data = await getTokenThresholds();

      setTokenThresholds?.(data?.data?.tokenDetailsSets);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (!agents || (agents?.length < 1 && lensClient)) {
      loadAgents();
    }

    if (tokenThresholds?.length < 1) {
      loadThresholdsAndRent();
    }
  }, [lensClient]);
};

export default useAgents;
