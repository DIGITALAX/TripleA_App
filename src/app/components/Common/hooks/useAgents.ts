import { useContext, useEffect } from "react";
import { Agent } from "../../Dashboard/types/dashboard.types";
import { getAgents } from "./../../../../../graphql/queries/getAgents";
import { INFURA_GATEWAY } from "@/lib/constants";
import { Account, evmAddress } from "@lens-protocol/client";
import { getTokenThresholds } from "./../../../../../graphql/queries/getTokenThresholds";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { ModalContext } from "@/providers";

const useAgents = () => {
  const context = useContext(ModalContext);
  const loadAgents = async () => {
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
            const result = await fetchAccountsAvailable(context?.lensClient!, {
              managedBy: creatorAddress,
              includeOwned: true,
            });

            if (result.isErr()) {
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
      context?.setAgents?.(allAgents?.sort(() => Math.random() - 0.5));
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const loadThresholdsAndRent = async () => {
    try {
      const data = await getTokenThresholds();

      context?.setTokenThresholds?.(data?.data?.tokenDetailsSets);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (
      (!context?.agents || context?.agents?.length < 1) &&
      context?.lensClient
    ) {
      loadAgents();
    }

    if (Number(context?.tokenThresholds?.length) < 1) {
      loadThresholdsAndRent();
    }
  }, [context?.lensClient]);
};

export default useAgents;
