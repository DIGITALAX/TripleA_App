import { useContext, useEffect, useState } from "react";
import { CollectionType, Order } from "../types/dashboard.types";
import { getOrders } from "../../../../graphql/queries/getOrders";
import { Account, evmAddress } from "@lens-protocol/client";
import { MARKET_CONTRACT } from "@/lib/constants";
import {
  checkAndSignAuthMessage,
  LitNodeClient,
  uint8arrayFromString,
  uint8arrayToString,
} from "@lit-protocol/lit-node-client";
import { chains } from "@lens-chain/sdk/viem";
import { createWalletClient, custom, PublicClient } from "viem";
import MarketAbi from "@abis/MarketAbi.json";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { LIT_NETWORK } from "@lit-protocol/constants";
import { ModalContext } from "@/app/providers";

const useCollects = (
  address: `0x${string}` | undefined,
  publicClient: PublicClient
) => {
  const context = useContext(ModalContext);
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
  const client = new LitNodeClient({
    litNetwork: LIT_NETWORK.Datil,
    debug: false,
  });

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

      let nonce = await client.getLatestBlockhash();
      const authSig = await checkAndSignAuthMessage({
        chain: "polygon",
        nonce: nonce!,
      });
      await client.connect();

      const { decryptedData } = await client.decrypt({
        dataToEncryptHash: encrypted.dataToEncryptHash,
        accessControlConditions: encrypted.accessControlConditions,
        chain: encrypted.chain,
        ciphertext: encrypted.ciphertext,
        authSig,
      });

      const fulfillmentDetails = await JSON.parse(
        uint8arrayToString(decryptedData)
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
      let nonce = await client.getLatestBlockhash();
      await checkAndSignAuthMessage({
        chain: "polygon",
        nonce: nonce!,
      });
      await client.connect();

      const accessControlConditions = [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "polygon",
          method: "",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: "=",
            value: address?.toLowerCase(),
          },
        },
        { operator: "or" },
        {
          contractAddress: "",
          standardContractType: "",
          chain: "polygon",
          method: "",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: "=",
            value: allCollects?.[index]?.fulfiller?.toLowerCase(),
          },
        },
      ];

      const { ciphertext, dataToEncryptHash } = await client.encrypt({
        accessControlConditions,
        dataToEncrypt: uint8arrayFromString(
          JSON.stringify({
            color: allCollects?.[index].fulfillmentDetails?.color,
            size: allCollects?.[index].fulfillmentDetails?.size,
            name: fulfillmentInfo?.[index].name,
            address: fulfillmentInfo?.[index].address,
            zip: fulfillmentInfo?.[index].zip,
            country: fulfillmentInfo?.[index].country,
            state: fulfillmentInfo?.[index].state,
          })
        ),
      });

      setFulfillmentEncrypted((prev) => {
        let arr = [...prev];

        arr[index] = JSON.stringify({
          ciphertext,
          dataToEncryptHash,
          chain: "polygon",
          accessControlConditions,
        });

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
