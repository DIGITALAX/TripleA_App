import { CollectData } from "@/components/NFT/types/nft.types";
import { MARKET_CONTRACT } from "@/lib/constants";
import { chains } from "@lens-network/sdk/viem";
import { SetStateAction, useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import MarketAbi from "@abis/MarketAbi.json";
import {
  checkAndSignAuthMessage,
  LitNodeClient,
  uint8arrayFromString,
} from "@lit-protocol/lit-node-client";

const useFulfillment = (
  address: `0x${string}` | undefined,
  publicClient: PublicClient,
  setNotification: (e: SetStateAction<string | undefined>) => void,
  details: CollectData & {
    id: number;
    fulfiller: string;
  },
  setFulfillmentOpen: (
    e: SetStateAction<
      | (CollectData & {
          id: number;
          fulfiller: string;
        })
      | undefined
    >
  ) => void
) => {
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
  const [fulfillmentEncrypted, setFulfillmentEncrypted] = useState<string>("");
  const [fulfillmentInfo, setFulfillmentInfo] = useState<{
    name: string;
    address: string;
    state: string;
    country: string;
    zip: string;
  }>({
    name: "",
    address: "",
    state: "",
    country: "",
    zip: "",
  });
  const client = new LitNodeClient({ litNetwork: "datil", debug: false });

  const handlePurchase = async () => {
    if (fulfillmentEncrypted.trim() == "") return;
    setPurchaseLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: MARKET_CONTRACT,
        abi: MarketAbi,
        functionName: "buy",
        chain: chains.testnet,
        args: [
          fulfillmentEncrypted,
          details?.token,
          details.id,
          details?.amount,
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });

      setNotification?.("It's All Yours! Check sales in your dashboard.");
      setFulfillmentOpen(undefined);
      setFulfillmentInfo({
        name: "",
        address: "",
        state: "",
        country: "",
        zip: "",
      });
    } catch (err: any) {
      if (err?.message?.includes("NotAvailable")) {
        setNotification?.(
          "We know you're eager, but you've reached this creations' collect limit!"
        );
      }
      console.error(err?.message);
    }
    setPurchaseLoading(false);
  };

  const handleFulfillmentEncrypt = async () => {
    if (
      fulfillmentInfo.name.trim() == "" ||
      fulfillmentInfo.address.trim() == "" ||
      fulfillmentInfo.country.trim() == "" ||
      fulfillmentInfo.state.trim() == "" ||
      fulfillmentInfo.zip.trim() == ""
    )
      return;
    setPurchaseLoading(true);
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
            value: details?.fulfiller?.toLowerCase(),
          },
        },
      ];

      const { ciphertext, dataToEncryptHash } = await client.encrypt({
        accessControlConditions,
        dataToEncrypt: uint8arrayFromString(
          JSON.stringify({
            color: details.color,
            size: details.size,
            name: fulfillmentInfo.name,
            address: fulfillmentInfo.address,
            zip: fulfillmentInfo.zip,
            country: fulfillmentInfo.country,
            state: fulfillmentInfo.state,
          })
        ),
      });

      setFulfillmentEncrypted(
        JSON.stringify({ ciphertext, dataToEncryptHash })
      );
    } catch (err: any) {
      console.error(err.message);
    }
    setPurchaseLoading(false);
  };

  return {
    purchaseLoading,
    handlePurchase,
    handleFulfillmentEncrypt,
    fulfillmentInfo,
    setFulfillmentInfo,
    fulfillmentEncrypted,
  };
};

export default useFulfillment;
