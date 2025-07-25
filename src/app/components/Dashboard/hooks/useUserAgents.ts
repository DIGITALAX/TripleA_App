import { SetStateAction, useContext, useEffect, useState } from "react";
import {
  Agent,
  AgentEditSwitcher,
  AgentMetadata,
} from "../types/dashboard.types";
import {
  Account,
  evmAddress,
  FeedRuleExecuteOn,
  PublicClient,
  SessionClient,
} from "@lens-protocol/client";
import {
  createWalletClient,
  custom,
  PublicClient as LensPublicClient,
} from "viem";
import { getUserAgents } from "./../../../../../graphql/queries/getUserAgents";
import {
  SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
  INFURA_GATEWAY,
  AGENT_FEED_RULE,
} from "@/lib/constants";
import { chains } from "@lens-chain/sdk/viem";
import AgentManagerAbi from "@abis/AgentManagerAbi.json";
import {
  fetchAccountsAvailable,
  updateFeedRules,
} from "@lens-protocol/client/actions";
import { ModalContext } from "@/providers";

const useUserAgents = (
  publicClient: LensPublicClient,
  address: `0x${string}` | undefined
) => {
  const context = useContext(ModalContext);
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);
  const [agentEditLoading, setAgentEditLoading] = useState<boolean>(false);
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [agentEdit, setAgentEdit] = useState<AgentEditSwitcher>(
    AgentEditSwitcher.Profile
  );
  const [agentMetadata, setAgentMetadata] = useState<AgentMetadata>({
    title: "",
    bio: "",
    customInstructions: "",
    style: "",
    knowledge: "",
    adjectives: "",
    lore: "",
    model: "llama-3.3-70b",
    modelsOpen: false,
  });
  const [currentAgent, setCurrentAgent] = useState<Agent | undefined>();
  const [agentOwners, setAgentOwners] = useState<
    { address: string; added: boolean }[]
  >([]);
  const [agentFeeds, setAgentFeeds] = useState<
    { address: string; added: boolean }[]
  >([]);
  const [addOwnerLoading, setAddOwnerLoading] = useState<boolean[]>([]);
  const [addFeedLoading, setAddFeedLoading] = useState<boolean[]>([]);
  const [revokeLoading, setRevokeLoading] = useState<boolean[]>([]);
  const [feedsLoading, setFeedsLoading] = useState<boolean>(false);

  const handleNewFeeds = async () => {
    if (agentFeeds?.filter((fe) => fe?.address?.trim() !== "")?.length < 1)
      return;
    if (agentFeeds?.filter((f) => !f.added)?.length > 0) {
      context?.setNotification?.("Add Agentic Rules to All Feeds!");
      return;
    }

    setFeedsLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: currentAgent?.title,
          bio: currentAgent?.bio,
          customInstructions: currentAgent?.customInstructions,
          lore: currentAgent?.lore,
          adjectives: currentAgent?.adjectives,
          style: currentAgent?.style,
          knowledge: currentAgent?.knowledge,
          cover: currentAgent?.cover,
          messageExamples: currentAgent?.messageExamples,
          feeds: agentFeeds
            ?.filter((f) => f && f.address && f.address.trim() !== "")
            ?.filter(Boolean)
            ?.map((f) => f.address),
          model: currentAgent?.model,
        }),
      });

      const responseJSON = await response.json();

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "editAgent",
        chain: chains.mainnet,
        args: ["ipfs://" + responseJSON?.cid, currentAgent?.id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      context?.setNotification?.("Success! Feeds Updated.");
    } catch (err: any) {
      console.error(err.message);
    }
    setFeedsLoading(false);
  };

  const addOwner = async (index: number) => {
    if (agentOwners?.[index]?.address.trim() == "") return;
    setAddOwnerLoading((prev) => {
      let arr = [...prev];
      arr[index] = true;
      return arr;
    });
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "addOwner",
        chain: chains.mainnet,
        args: [agentOwners?.[index], currentAgent?.id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      context?.setAgents((prev) => {
        let ags = [...prev];

        return ags.map((agent) => {
          if (Number(agent.id) == Number(currentAgent?.id)) {
            let newag = { ...agent };
            let owners = [...agentOwners, agentOwners?.[index]];
            newag.owners = owners.map((own) => own.address);
            return newag;
          } else {
            return agent;
          }
        });
      });
      context?.setNotification?.("Success! Owner Added.");
      setAgentOwners([
        ...agentOwners,
        {
          ...agentOwners?.[index],
          added: true,
        },
      ]);
    } catch (err: any) {
      console.error(err.message);
    }
    setAddOwnerLoading((prev) => {
      let arr = [...prev];
      arr[index] = false;
      return arr;
    });
  };

  const revokeOwner = async (index: number) => {
    if (agentOwners?.[index]?.address.trim() == "") return;
    setRevokeLoading((prev) => {
      let arr = [...prev];
      arr[index] = true;
      return arr;
    });
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "revokeOwner",
        chain: chains.mainnet,
        args: [agentOwners?.[index], currentAgent?.id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      context?.setAgents((prev) => {
        let ags = [...prev];

        return ags.map((agent) => {
          if (Number(agent.id) == Number(currentAgent?.id)) {
            let newag = { ...agent };
            let owners = agentOwners.filter(
              (owner) => owner !== agentOwners?.[index]
            );
            newag.owners = owners.map((own) => own.address);
            return newag;
          } else {
            return agent;
          }
        });
      });
      context?.setNotification?.("Success! Owner Revoked.");
      setAgentOwners(
        agentOwners.filter((owner) => owner !== agentOwners?.[index])
      );
    } catch (err: any) {
      console.error(err.message);
    }
    setRevokeLoading((prev) => {
      let arr = [...prev];
      arr[index] = false;
      return arr;
    });
  };

  const handleUserAgents = async () => {
    if (!address) return;
    setAgentsLoading(true);
    try {
      const data = await getUserAgents(address);

      const metadataCache = new Map<string, any>();
      const profileCache = new Map<string, Account>();
      const allAgents: Agent[] = await Promise.all(
        data?.data?.agentCreateds.map(async (agent: any) => {
          if (!agent.metadata) {
            const metadataUri = agent.uri?.split("ipfs://")?.[1] || "";
            if (metadataUri && !metadataCache.has(metadataUri)) {
              const response = await fetch(
                `${INFURA_GATEWAY}/ipfs/${metadataUri}`
              );
              const metadata = await response.json();
              metadataCache.set(metadataUri, metadata);
            }
            agent.metadata = metadataCache.get(metadataUri);
          }

          const creatorAddress = evmAddress(agent?.creator);

          if (!profileCache.has(creatorAddress)) {
            const result = await fetchAccountsAvailable(context?.lensClient!, {
              managedBy: creatorAddress,
              includeOwned: true,
            });

            if (result.isErr()) {
              setAgentsLoading(false);
              return null;
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
            wallets: agent?.wallets,
            balances: agent?.balances,
            workers: agent?.workers,
            creator: agent?.creator,
            owners: agent?.owners,
            profile,
          };
        })
      );

      setUserAgents(allAgents);
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentsLoading(false);
  };

  const handleEditAgent = async () => {
    if (
      !agentMetadata.cover ||
      (typeof agentMetadata.cover == "string" &&
        (agentMetadata.cover as string)?.trim() == "") ||
      agentMetadata.title?.trim() == "" ||
      agentMetadata.bio?.trim() == "" ||
      agentMetadata.customInstructions?.trim() == ""
    )
      return;
    setAgentEditLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      let agentImage = agentMetadata?.cover;

      if (typeof agentImage !== "string") {
        const responseImage = await fetch("/api/ipfs", {
          method: "POST",
          body: agentImage,
        });

        if (!responseImage.ok) {
          const errorText = await responseImage.text();
          console.error("Error from API:", errorText);
          setAgentEditLoading(false);
          return;
        }

        const responseImageJSON = await responseImage.json();

        agentImage = "ipfs://" + responseImageJSON?.cid;
      }

      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: agentMetadata.title,
          bio: agentMetadata.bio,
          customInstructions: agentMetadata.customInstructions,
          lore: agentMetadata.lore,
          adjectives: agentMetadata.adjectives,
          style: agentMetadata.style,
          knowledge: agentMetadata.knowledge,
          cover: agentImage,
          messageExamples: currentAgent?.messageExamples,
          feeds: currentAgent?.feeds,
          model: agentMetadata?.model,
        }),
      });

      const responseJSON = await response.json();

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "editAgent",
        chain: chains.mainnet,
        args: ["ipfs://" + responseJSON?.cid, currentAgent?.id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      context?.setNotification?.(
        "Success! Everything will be on chain soon :)"
      );
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentEditLoading(false);
  };

  const addFeedRule = async (index: number) => {
    if (agentFeeds?.[index]?.address?.trim() == "") return;

    setAddFeedLoading((prev) => {
      let feeds = [...prev];

      feeds[index] = true;
      return feeds;
    });
    try {
      const res = await updateFeedRules(
        context?.lensConnected?.sessionClient!,
        {
          toAdd: {
            required: [
              {
                unknownRule: {
                  executeOn: [FeedRuleExecuteOn.CreatingPost],
                  address: AGENT_FEED_RULE,
                },
              },
            ],
          },
          feed: agentFeeds?.[index]?.address,
        }
      );

      if (res.isErr()) {
        setAddFeedLoading((prev) => {
          let feeds = [...prev];

          feeds[index] = true;
          return feeds;
        });
        context?.setNotification("Something went wrong. Try again? :/");
        return;
      }

      setAgentFeeds(
        agentFeeds?.map((feed, i) =>
          i == index
            ? {
                ...feed,
                added: true,
              }
            : feed
        )
      );
      context?.setNotification("Agentic Feed Rule Added!");
    } catch (err: any) {
      console.error(err.message);
    }
    setAddFeedLoading((prev) => {
      let feeds = [...prev];

      feeds[index] = false;
      return feeds;
    });
  };

  useEffect(() => {
    if (userAgents?.length < 1 && context?.lensClient && address) {
      handleUserAgents();
    }
  }, [context?.lensClient, address]);

  useEffect(() => {
    if (currentAgent) {
      setAgentOwners(
        (currentAgent?.owners || [])?.map((owner) => ({
          address: owner,
          added: true,
        }))
      );
      setAgentFeeds(
        (currentAgent?.feeds || [])?.map((feed) => ({
          address: feed,
          added: true,
        }))
      );
    }
  }, [currentAgent]);

  return {
    agentsLoading,
    userAgents,
    handleEditAgent,
    currentAgent,
    setCurrentAgent,
    agentEditLoading,
    agentMetadata,
    setAgentMetadata,
    agentEdit,
    setAgentEdit,
    setAgentOwners,
    addOwnerLoading,
    addOwner,
    agentOwners,
    revokeLoading,
    revokeOwner,
    feedsLoading,
    handleNewFeeds,
    setAgentFeeds,
    agentFeeds,
    addFeedRule,
    addFeedLoading,
  };
};

export default useUserAgents;
