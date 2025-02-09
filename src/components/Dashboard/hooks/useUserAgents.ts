import { SetStateAction, useEffect, useState } from "react";
import { Agent, AgentEditSwitcher } from "../types/dashboard.types";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import {
  createWalletClient,
  custom,
  PublicClient as LensPublicClient,
} from "viem";
import { getUserAgents } from "../../../../graphql/queries/getUserAgents";
import {
  SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
  INFURA_GATEWAY,
  STORAGE_NODE,
} from "@/lib/constants";
import { chains } from "@lens-network/sdk/viem";
import AgentManagerAbi from "@abis/AgentManagerAbi.json";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

const useUserAgents = (
  lensClient: PublicClient,
  publicClient: LensPublicClient,
  address: `0x${string}` | undefined,
  setNotification: (e: SetStateAction<string | undefined>) => void
) => {
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);
  const [agentEditLoading, setAgentEditLoading] = useState<boolean>(false);
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [agentEdit, setAgentEdit] = useState<AgentEditSwitcher>(
    AgentEditSwitcher.Profile
  );
  const [agentMetadata, setAgentMetadata] = useState<{
    cover?: string | Blob;
    title: string;
    bio: string;
    customInstructions: string;
    knowledge: string;
    style: string;
    lore: string;
    adjectives: string;
  }>({
    title: "",
    bio: "",
    customInstructions: "",
    style: "",
    knowledge: "",
    adjectives: "",
    lore: "",
  });
  const [currentAgent, setCurrentAgent] = useState<Agent | undefined>();
  const [agentOwners, setAgentOwners] = useState<string[]>([]);
  const [agentFeeds, setAgentFeeds] = useState<string[]>([]);
  const [addLoading, setAddLoading] = useState<boolean[]>([]);
  const [revokeLoading, setRevokeLoading] = useState<boolean[]>([]);
  const [feedsLoading, setFeedsLoading] = useState<boolean>(false);
  const [adminLoading, setAdminLoading] = useState<boolean[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean[]>([]);

  const changeFeedAdmin = async (index: number) => {
    setAdminLoading((prev) => {
      let arr = [...prev];
      arr[index] = true;
      return arr;
    });
    try {
      if (isAdmin?.[index]) {
        setAgentFeeds(agentFeeds?.filter((_, i) => i !== index));
        setNotification?.("Success! Admin Revoked.");
      } else {
        setNotification?.("Success! Admin Update.");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setAdminLoading((prev) => {
      let arr = [...prev];
      arr[index] = false;
      return arr;
    });
  };

  const handleNewFeeds = async () => {
    if (agentFeeds?.filter((fe) => fe.trim() !== "")?.length < 1) return;
    if (isAdmin?.filter((a) => a == false).length > 0) {
      setNotification?.("Agent must be Feed admin to publish.");
      return;
    }

    setFeedsLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: currentAgent?.title,
          description: currentAgent?.bio,
          customInstructions: currentAgent?.customInstructions,
          lore: currentAgent?.lore,
          adjectives: currentAgent?.adjectives,
          style: currentAgent?.style,
          knowledge: currentAgent?.knowledge,
          cover: currentAgent?.cover,
          messageExamples: currentAgent?.messageExamples,
          feeds: agentFeeds?.filter((f) => f.trim() !== ""),
        }),
      });

      const responseJSON = await response.json();

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "editAgent",
        chain: chains.testnet,
        args: ["ipfs://" + responseJSON?.cid, currentAgent?.id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      setNotification?.("Success! Feeds Updated.");
    } catch (err: any) {
      console.error(err.message);
    }
    setFeedsLoading(false);
  };

  const addOwner = async (index: number) => {
    if (agentOwners?.[index]?.trim() == "") return;
    setAddLoading((prev) => {
      let arr = [...prev];
      arr[index] = true;
      return arr;
    });
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "addOwner",
        chain: chains.testnet,
        args: [agentOwners?.[index], currentAgent?.id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      setNotification?.("Success! Owner Added.");
    } catch (err: any) {
      console.error(err.message);
    }
    setAddLoading((prev) => {
      let arr = [...prev];
      arr[index] = false;
      return arr;
    });
  };

  const revokeOwner = async (index: number) => {
    if (agentOwners?.[index]?.trim() == "") return;
    setRevokeLoading((prev) => {
      let arr = [...prev];
      arr[index] = true;
      return arr;
    });
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "revokeOwner",
        chain: chains.testnet,
        args: [agentOwners?.[index], currentAgent?.id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      setNotification?.("Success! Owner Revoked.");
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

      const allAgents: Agent[] = await Promise.all(
        data?.data?.agentCreateds.map(async (agent: any) => {
          if (!agent.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${agent.uri.split("ipfs://")?.[1]}`
            );
            agent.metadata = await cadena.json();
          }

          const result = await fetchAccountsAvailable(lensClient, {
            managedBy: evmAddress(agent?.wallets?.[0]),
          });
          if (result.isErr()) {
            setAgentsLoading(false);
            return;
          }
          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${
              result.value.items?.[0]?.account?.metadata?.picture?.split(
                "lens://"
              )?.[1]
            }`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          return {
            id: agent?.SkyhuntersAgentManager_id,
            cover: agent?.metadata?.cover,
            title: agent?.metadata?.title,
            description: agent?.metadata?.description,
            customInstructions: agent?.metadata?.customInstructions,
            wallet: agent?.wallets?.[0],
            balances: agent?.balances,
            workers: agent?.workers,
            owner: agent?.owner,
            profile: {
              ...result.value.items?.[0]?.account,
              metadata: {
                ...result.value.items?.[0]?.account?.metadata,
                picture,
              },
            },
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
        chain: chains.testnet,
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
          description: agentMetadata.bio,
          customInstructions: agentMetadata.customInstructions,
          lore: agentMetadata.lore,
          adjectives: agentMetadata.adjectives,
          style: agentMetadata.style,
          knowledge: agentMetadata.knowledge,
          cover: agentImage,
          messageExamples: currentAgent?.messageExamples,
          feeds: currentAgent?.feeds,
        }),
      });

      const responseJSON = await response.json();

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "editAgent",
        chain: chains.testnet,
        args: ["ipfs://" + responseJSON?.cid, currentAgent?.id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      setNotification?.("Success! Everything will be on chain soon :)");
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentEditLoading(false);
  };

  useEffect(() => {
    if (userAgents?.length < 1 && lensClient && address) {
      handleUserAgents();
    }
  }, [lensClient, address]);

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
    addLoading,
    addOwner,
    agentOwners,
    revokeLoading,
    revokeOwner,
    feedsLoading,
    handleNewFeeds,
    setAgentFeeds,
    agentFeeds,
    adminLoading,
    changeFeedAdmin,
    isAdmin,
  };
};

export default useUserAgents;
