import { SetStateAction, useEffect, useState } from "react";
import { Order } from "../types/dashboard.types";
import { getOrders } from "../../../../graphql/queries/getOrders";
import {
  evmAddress,
  PublicClient as PublicLensClient,
} from "@lens-protocol/client";
import { MARKET_CONTRACT, STORAGE_NODE } from "@/lib/constants";
import {
  checkAndSignAuthMessage,
  LitNodeClient,
  uint8arrayFromString,
  uint8arrayToString,
} from "@lit-protocol/lit-node-client";
import { chains } from "@lens-network/sdk/viem";
import { createWalletClient, custom, PublicClient } from "viem";
import MarketAbi from "@abis/MarketAbi.json";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

const useCollects = (
  address: `0x${string}` | undefined,
  lensClient: PublicLensClient,
  setNotification: (e: SetStateAction<string | undefined>) => void,
  publicClient: PublicClient
) => {
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
  const client = new LitNodeClient({ litNetwork: "datil", debug: false });

  const handleCollects = async () => {
    if (!address) return;
    setCollectsLoading(true);
    try {
      const data = await getOrders(address);
      const collects: Order[] = await Promise.all(
        data?.data?.orders?.map(async (collect: any) => {
          const result = await fetchAccountsAvailable(lensClient, {
            managedBy: evmAddress(collect?.collection?.artist),
          });

          if (result.isErr()) {
            setCollectsLoading(false);
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
            id: collect?.id,
            totalPrice: collect?.totalPrice,
            token: collect?.token,
            amount: collect?.amount,
            collectionId: collect?.collectionId,
            mintedTokenIds: collect?.mintedTokenIds,
            blockTimestamp: collect?.blockTimestamp,
            transactionHash: collect?.transactionHash,
            collection: {
              id: collect?.collection?.id,
              image: collect?.collection?.metadata?.image,
              title: collect?.collection?.metadata?.title,
              description: collect?.collection?.metadata?.description,
              blocktimestamp: collect?.collection?.blockTimestamp,
              prices: collect?.collection?.prices,
              tokens: collect?.collection?.tokens,
              agents: collect?.collection?.agents,
              artist: collect?.collection?.artist,
              amountSold: collect?.collection?.amountSold,
              tokenIds: collect?.collection?.tokenIds,
              amount: collect?.collection?.amount,
            },
            fulfiller: collect?.fulfiller,
            buyer: collect?.buyer,
            fulfilled: collect?.fulfilled,
            fulfillment: collect?.fulfillmentDetails,
            profile: {
              ...result.value.items?.[0]?.account,
              metadata: {
                ...result.value.items?.[0]?.account?.metadata!,
                picture,
              },
            },
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
      let nonce = await client.getLatestBlockhash();
      await checkAndSignAuthMessage({
        chain: "polygon",
        nonce: nonce!,
      });
      await client.connect();

      const encrypted = await JSON.parse(allCollects?.[index].fulfillment);

      const { decryptedData } = await client.decrypt({
        dataToEncryptHash: encrypted.dataToEncryptHash,
        accessControlConditions: encrypted.accessControlConditions,
        chain: encrypted.chain,
        ciphertext: encrypted.ciphertext,
      });

      const fulfillmentDetails = await JSON.parse(
        uint8arrayToString(decryptedData)
      );
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
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: MARKET_CONTRACT,
        abi: MarketAbi,
        functionName: "updateFulfillmentDetails",
        chain: chains.testnet,
        args: [fulfillmentEncrypted?.[index], allCollects?.[index].id],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });

      setNotification?.("Fulfillment Details Updated!");
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
    if (allCollects?.length < 1 && lensClient) {
      handleCollects();
    }
  }, [lensClient]);

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
