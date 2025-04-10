import { COLLECTION_MANAGER_CONTRACT } from "@/lib/constants";
import { chains } from "@lens-chain/sdk/viem";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import CollectionManagerAbi from "@abis/CollectionManagerAbi.json";
import { NFTData } from "@/components/Common/types/common.types";
import {  DropInterface, DropSwitcher } from "../types/dashboard.types";
import { ModalContext } from "@/app/providers";

const useAgentsCollection = (
  address: `0x${string}` | undefined,
  publicClient: PublicClient,
  collection: NFTData,
  setDrop: (e: SetStateAction<DropInterface | undefined>) => void,
  setDropSwitcher: (e: SetStateAction<DropSwitcher>) => void,
  setCollection: (e: SetStateAction<NFTData | undefined>) => void
) => {
  const context = useContext(ModalContext);
  const [priceAdjustLoading, setPriceAdjustLoading] = useState<boolean>(false);
  const [editAgentsLoading, setEditAgentsLoading] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [customInstructions, setCustomInstructions] = useState<string[]>([]);
  const [frequencies, setFrequencies] = useState<
    {
      publishFrequency: number;
      remixFrequency: number;
      leadFrequency: number;
      mintFrequency: number;
      publish: boolean;
      remix: boolean;
      lead: boolean;
      mint: boolean;
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
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: "adjustCollectionPrice",
        chain: chains.mainnet,
        args: [
          priceAdjusted?.[index]?.token,
          Number(collection?.id),
          priceAdjusted?.[index]?.price * 10 ** 18,
          0,
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
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });
      let ids = context?.agents
        ?.filter((ag) => collection?.agentIds?.includes(ag?.id))
        ?.map((ag) => Number(ag?.id));

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: "updateCollectionWorkerAndDetails",
        chain: chains.mainnet,
        args: [frequencies, customInstructions, ids, Number(collection?.id), 0],
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
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: functionName,
        chain: chains.mainnet,
        args: [Number(collection?.id), 0],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      context?.setNotification?.(
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
        let nftAgents = context?.agents?.filter((ag) =>
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
              mintFrequency:
                Number(
                  ag?.workers?.find(
                    (col) => Number(col?.collectionId) == Number(collection?.id)
                  )?.mintFrequency
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
              mint:
                ag?.workers?.find(
                  (col) => Number(col?.collectionId) == Number(collection?.id)
                )?.mint || false,
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
  }, [collection, context?.agents]);

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
