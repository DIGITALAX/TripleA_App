import {
  DIGITALAX_ADDRESS,
  DIGITALAX_PUBLIC_KEY,
  MARKET_CONTRACT,
} from "@/lib/constants";
import { chains } from "@lens-chain/sdk/viem";
import { useContext, useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import MarketAbi from "@abis/MarketAbi.json";
import { ModalContext } from "@/providers";
import {
  encryptForMultipleRecipients,
  getPublicKeyFromSignature,
} from "@/lib/helpers/encryption";

const useFulfillment = (
  address: `0x${string}` | undefined,
  publicClient: PublicClient
) => {
  const context = useContext(ModalContext);
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

  const handlePurchase = async () => {
    if (fulfillmentEncrypted.trim() == "") return;
    setPurchaseLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: MARKET_CONTRACT,
        abi: MarketAbi,
        functionName: "buy",
        chain: chains.mainnet,
        args: [
          fulfillmentEncrypted,
          context?.fulfillmentOpen?.token,
          context?.fulfillmentOpen?.id,
          context?.fulfillmentOpen?.amount,
          context?.fulfillmentOpen?.agentId,
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });

      context?.setNotification?.(
        "It's All Yours! Keep track of fulfillment updates in your dashboard."
      );
      context?.setFulfillmentOpen(undefined);
      setFulfillmentInfo({
        name: "",
        address: "",
        state: "",
        country: "",
        zip: "",
      });
    } catch (err: any) {
      if (err?.message?.includes("NotAvailable")) {
        context?.setNotification?.(
          "We know you're eager, but you've reached this creations' collect limit!"
        );
      }

      if (
        err?.message?.includes("0xfb8f41b2") ||
        err?.message?.includes("ERC20InsufficientAllowance")
      ) {
        context?.setNotification?.("Out of tokens? Fill up your wallet!");
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
          color: context?.fulfillmentOpen?.color,
          size: context?.fulfillmentOpen?.size,
          name: fulfillmentInfo.name,
          address: fulfillmentInfo.address,
          zip: fulfillmentInfo.zip,
          country: fulfillmentInfo.country,
          state: fulfillmentInfo.state,
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

      setFulfillmentEncrypted(JSON.stringify("ipfs://" + json?.cid));
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
