import { useContext, useEffect, useState } from "react";
import { CollectionType, EncryptedData, Order } from "../types/dashboard.types";
import { getOrders } from "./../../../../../graphql/queries/getOrders";
import { Account, evmAddress } from "@lens-protocol/client";
import {
  DIGITALAX_ADDRESS,
  DIGITALAX_PUBLIC_KEY,
  MARKET_CONTRACT,
} from "@/lib/constants";
import { chains } from "@lens-chain/sdk/viem";
import { createWalletClient, custom, PublicClient } from "viem";
import MarketAbi from "@abis/MarketAbi.json";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { ModalContext } from "@/providers";
import {
  decryptData,
  encryptForMultipleRecipients,
  getPublicKeyFromSignature,
} from "@/lib/helpers/encryption";

const useCollects = (
  address: `0x${string}` | undefined,
  publicClient: PublicClient
) => {
  const context = useContext(ModalContext);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [collectsLoading, setCollectsLoading] = useState<boolean>(false);
  const [allCollects, setAllCollects] = useState<Order[]>([]);
  const [fulfillmentOpen, setFulfillmentOpen] = useState<boolean[]>([]);
  const [fulfillmentInfo, setFulfillmentInfo] = useState<
    {
      color: string;
      size: string;
      name: string;
      address: string;
      state: string;
      country: string;
      zip: string;
    }[]
  >([]);
  const [decryptLoading, setDecryptLoading] = useState<boolean[]>([]);
  const [updateLoading, setUpdateLoading] = useState<boolean[]>([]);
  const [fulfillmentEncrypted, setFulfillmentEncrypted] = useState<string[]>(
    []
  );

  const handleCollects = async () => {
    if (!address) return;
    setCollectsLoading(true);
    try {
      const data = await getOrders(address);

      const profileCache = new Map<string, Account>();

      const collects: Order[] = await Promise.all(
        data?.data?.collectionPurchaseds?.map(async (collect: any) => {
          const artistAddress = evmAddress(collect?.collection?.artist);

          if (!profileCache.has(artistAddress)) {
            const result = await fetchAccountsAvailable(context?.lensClient!, {
              managedBy: artistAddress,
              includeOwned: true,
            });

            if (result.isErr()) {
              setCollectsLoading(false);
              return;
            }

            profileCache.set(artistAddress, result.value.items?.[0]?.account);
          }

          const profile = profileCache.get(artistAddress);

          return {
            id: collect?.id,
            totalPrice: collect?.totalPrice,
            token: collect?.paymentToken,
            amount: collect?.amount,
            collectionId: collect?.collectionId,
            mintedTokenIds: collect?.mintedTokens,
            blockTimestamp: collect?.blockTimestamp,
            transactionHash: collect?.transactionHash,
            collection: {
              id: collect?.collection?.id,
              image: collect?.collection?.metadata?.image,
              title: collect?.collection?.metadata?.title,
              format: collect?.collection?.metadata?.format,
              collectionType:
                collect?.collection?.collectionType == "1"
                  ? CollectionType.IRL
                  : CollectionType.Digital,
            },
            fulfiller: collect?.fulfiller,
            buyer: collect?.buyer,
            fulfilled: collect?.fulfilled,
            fulfillment: collect?.fulfillment,
            profile,
          };
        })
      );

      setFulfillmentEncrypted(
        Array.from({ length: collects.length }, () => "")
      );
      setDecryptLoading(Array.from({ length: collects.length }, () => false));
      setUpdateLoading(Array.from({ length: collects.length }, () => false));
      setFulfillmentInfo(
        Array.from({ length: collects.length }, () => ({
          color: "",
          size: "",
          country: "",
          address: "",
          state: "",
          name: "",
          zip: "",
        }))
      );

      setAllCollects(collects);
    } catch (err: any) {
      console.error(err.message);
    }
    setCollectsLoading(false);
  };

  const decryptOrder = async (index: number) => {
    setDecryptLoading((prev) => {
      let arr = [...prev];
      arr[index] = true;

      return arr;
    });
    try {
      const encrypted = await JSON.parse(allCollects?.[index].fulfillment);

      let key = privateKey;

      if (!key) {
        const promptMessage =
          "Enter your wallet private key to decrypt your fulfillment details.\n\nThis interface is fully open source, runs entirely in your browser, and never stores your key. Make sure you are in a secure environment before entering it.";
        const promptValue = window.prompt(promptMessage);

        if (!promptValue) {
          return;
        }

        key = promptValue.trim();

        if (!key.startsWith("0x")) {
          key = `0x${key}`;
        }

        setPrivateKey(key);
      }

      const fulfillmentDetails = await decryptData(
        encrypted as EncryptedData,
        key,
        address!
      );

      setFulfillmentInfo((prev) => {
        let arr = [...prev];
        arr[index] = {
          color: fulfillmentDetails?.color,
          size: fulfillmentDetails?.size,
          name: fulfillmentDetails?.name,
          address: fulfillmentDetails?.address,
          state: fulfillmentDetails?.state,
          country: fulfillmentDetails?.country,
          zip: fulfillmentDetails?.zip,
        };
        return arr;
      });
      setAllCollects((prev) => {
        let arr = [...prev];
        arr[index] = {
          ...arr?.[index],
          fulfillmentDetails,
        };
        return arr;
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setDecryptLoading((prev) => {
      let arr = [...prev];
      arr[index] = false;

      return arr;
    });
  };

  const updateOrderFulfillmentEncrypt = async (index: number) => {
    if (
      fulfillmentInfo?.[index].name.trim() == "" ||
      fulfillmentInfo?.[index].address.trim() == "" ||
      fulfillmentInfo?.[index].country.trim() == "" ||
      fulfillmentInfo?.[index].state.trim() == "" ||
      fulfillmentInfo?.[index].zip.trim() == ""
    )
      return;
    setUpdateLoading((prev) => {
      let arr = [...prev];
      arr[index] = true;

      return arr;
    });
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const message = "Sign this message to encrypt your fulfillment details";
      const signature = await clientWallet.signMessage({
        account: address!,
        message,
      });

      const buyerPublicKey = await getPublicKeyFromSignature(
        message,
        signature
      );

      const encryptedData = await encryptForMultipleRecipients(
        {
          color: allCollects?.[index].fulfillmentDetails?.color,
          size: allCollects?.[index].fulfillmentDetails?.size,
          name: fulfillmentInfo?.[index].name,
          address: fulfillmentInfo?.[index].address,
          zip: fulfillmentInfo?.[index].zip,
          country: fulfillmentInfo?.[index].country,
          state: fulfillmentInfo?.[index].state,
        },
        [
          { address: address!, publicKey: buyerPublicKey },
          { address: DIGITALAX_ADDRESS, publicKey: DIGITALAX_PUBLIC_KEY },
        ]
      );

      const ipfsRes = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(encryptedData),
      });
      const json = await ipfsRes.json();

      setFulfillmentEncrypted((prev) => {
        let arr = [...prev];

        arr[index] = "ipfs://" + json?.cid;

        return arr;
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setUpdateLoading((prev) => {
      let arr = [...prev];
      arr[index] = false;

      return arr;
    });
  };

  const updateOrderFulfillment = async (index: number) => {
    if (fulfillmentEncrypted?.[index].trim() == "") return;
    setUpdateLoading((prev) => {
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
        address: MARKET_CONTRACT,
        abi: MarketAbi,
        functionName: "updateFulfillmentDetails",
        chain: chains.mainnet,
        args: [fulfillmentEncrypted?.[index], allCollects?.[index].id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });

      context?.setNotification?.("Fulfillment Details Updated!");
      setFulfillmentEncrypted((prev) => {
        let arr = [...prev];

        arr[index] = "";
        return arr;
      });

      setAllCollects((prev) => {
        let arr = [...prev];
        arr[index] = {
          ...arr?.[index],
          fulfillmentDetails: fulfillmentInfo?.[index],
        };

        return arr;
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setUpdateLoading((prev) => {
      let arr = [...prev];
      arr[index] = false;

      return arr;
    });
  };

  useEffect(() => {
    if (allCollects?.length < 1 && context?.lensClient) {
      handleCollects();
    }
  }, [context?.lensClient]);

  return {
    allCollects,
    collectsLoading,
    decryptOrder,
    decryptLoading,
    updateOrderFulfillment,
    updateLoading,
    fulfillmentEncrypted,
    updateOrderFulfillmentEncrypt,
    fulfillmentOpen,
    setFulfillmentOpen,
    setFulfillmentInfo,
    fulfillmentInfo,
  };
};

export default useCollects;
