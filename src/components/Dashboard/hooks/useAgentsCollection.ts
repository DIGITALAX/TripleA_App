import { COLLECTION_MANAGER_CONTRACT } from "@/lib/constants";
import { chains } from "@lens-network/sdk/viem";
import { SetStateAction, useEffect, useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import CollectionManagerAbi from "@abis/CollectionManagerAbi.json";
import { NFTData } from "@/components/Common/types/common.types";
import { Agent, DropInterface, DropSwitcher } from "../types/dashboard.types";

const useAgentsCollection = (
  address: `0x${string}` | undefined,
  publicClient: PublicClient,
  collection: NFTData,
  agents: Agent[],
  setNotification: (e: SetStateAction<string | undefined>) => void,
  setDrop: (e: SetStateAction<DropInterface | undefined>) => void,
  setDropSwitcher: (e: SetStateAction<DropSwitcher>) => void,
  setCollection: (e: SetStateAction<NFTData | undefined>) => void
) => {
  const [priceAdjustLoading, setPriceAdjustLoading] = useState<boolean>(false);
  const [editAgentsLoading, setEditAgentsLoading] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [customInstructions, setCustomInstructions] = useState<string[]>([]);
  const [frequencies, setFrequencies] = useState<
    {
      publishFrequency: number;
      remixFrequency: number;
      leadFrequency: number;
      publish: boolean;
      remix: boolean;
      lead: boolean;
    }[]
  >([]);
  const [priceAdjusted, setPriceAdjusted] = useState<
    {
      price: number;
      token: string;
    }[]
  >([]);

  const handlePriceAdjust = async (index: number) => {
    if (priceAdjusted?.[index]?.price <= 0) return;

    setPriceAdjustLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: "adjustCollectionPrice",
        chain: chains.testnet,
        args: [
          priceAdjusted?.[index]?.token,
          Number(collection?.id),
          priceAdjusted?.[index]?.price * 10 ** 18,
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setPriceAdjustLoading(false);
  };

  const handleEditAgents = async () => {
    setEditAgentsLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });
      let ids = agents
        ?.filter((ag) => collection?.agentIds?.includes(ag?.id))
        ?.map((ag) => Number(ag?.id));

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: "updateCollectionWorkerAndDetails",
        chain: chains.testnet,
        args: [frequencies, customInstructions, ids, Number(collection?.id)],
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
    setEditAgentsLoading(false);
  };

  const handleCollectionStatus = async () => {
    setStatusLoading(true);
    try {
      const functionName =
        Number(collection?.amountSold || 0) == 0
          ? "deleteCollection"
          : collection?.active
          ? "deactivateCollection"
          : "activateCollection";

      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: functionName,
        chain: chains.testnet,
        args: [Number(collection?.id)],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      setNotification?.(
        `Success! Collection ${
          Number(collection?.amountSold || 0) == 0
            ? "Deleted"
            : collection?.active
            ? "Deactivated"
            : "Activated"
        } `
      );
      setDropSwitcher(DropSwitcher.Drops);
      setDrop(undefined);
      setCollection(undefined);
    } catch (err: any) {
      console.error(err.message);
    }
    setStatusLoading(false);
  };

  useEffect(() => {
    if (collection) {
      setPriceAdjusted(
        Array.from(
          { length: collection?.prices?.length },
          (_, index: number) => ({
            price: Number(collection?.prices?.[index]?.price) / 10 ** 18,
            token: collection?.prices?.[index]?.token,
          })
        )
      );
      if (collection?.agentIds?.length > 0) {
        let nftAgents = agents?.filter((ag) =>
          collection?.agentIds?.includes(ag?.id)
        );
        if (nftAgents) {
          setFrequencies(
            nftAgents?.map((ag) => ({
              publishFrequency:
                Number(
                  ag?.workers?.find(
                    (col) => Number(col?.collectionId) == Number(collection?.id)
                  )?.publishFrequency
                ) || 0,
              remixFrequency:
                Number(
                  ag?.workers?.find(
                    (col) => Number(col?.collectionId) == Number(collection?.id)
                  )?.remixFrequency
                ) || 0,
              leadFrequency:
                Number(
                  ag?.workers?.find(
                    (col) => Number(col?.collectionId) == Number(collection?.id)
                  )?.leadFrequency
                ) || 0,
              lead:
                ag?.workers?.find(
                  (col) => Number(col?.collectionId) == Number(collection?.id)
                )?.lead || false,
              remix:
                ag?.workers?.find(
                  (col) => Number(col?.collectionId) == Number(collection?.id)
                )?.remix || false,
              publish:
                ag?.workers?.find(
                  (col) => Number(col?.collectionId) == Number(collection?.id)
                )?.publish || false,
            }))
          );
          setCustomInstructions(
            nftAgents?.map(
              (ag) =>
                ag?.workers?.find(
                  (col) => Number(col?.collectionId) == Number(collection?.id)
                )?.instructions || ""
            )
          );
        }
      }
    }
  }, [collection, agents]);

  return {
    handlePriceAdjust,
    priceAdjustLoading,
    handleEditAgents,
    editAgentsLoading,
    priceAdjusted,
    setPriceAdjusted,
    frequencies,
    setCustomInstructions,
    setFrequencies,
    customInstructions,
    statusLoading,
    handleCollectionStatus,
  };
};

export default useAgentsCollection;
