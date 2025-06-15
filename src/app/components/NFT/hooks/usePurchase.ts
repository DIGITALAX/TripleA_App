import { NFTData } from "@/components/Common/types/common.types";
import { chains } from "@lens-chain/sdk/viem";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import MarketAbi from "@abis/MarketAbi.json";
import { MARKET_CONTRACT } from "@/lib/constants";
import { CollectData } from "../types/nft.types";
import { CollectionType } from "@/components/Dashboard/types/dashboard.types";
import { ModalContext } from "@/providers";

const usePurchase = (
  nft: NFTData,
  setNft: (e: SetStateAction<NFTData | undefined>) => void,
  address: `0x${string}` | undefined,
  publicClient: PublicClient
) => {
  const context = useContext(ModalContext);
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
  const [collectData, setCollectData] = useState<CollectData>({
    amount: 1,
  });
  const [screen, setScreen] = useState<number>(0);
  const [approved, setApproved] = useState<boolean>(false);

  const checkAllowance = async () => {
    if (!address || !collectData?.token) return;
    try {
      const data = await publicClient.readContract({
        address: collectData.token as `0x${string}`,
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                internalType: "address",
                name: "spender",
                type: "address",
              },
            ],
            name: "allowance",
            outputs: [
              {
                internalType: "uint256",
                name: "",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "allowance",
        args: [address as `0x${string}`, MARKET_CONTRACT],
        account: address,
      });

      if (
        data >=
        BigInt(
          Number(
            Number(
              nft?.prices?.find(
                (tok) => tok.token?.toLowerCase() == collectData?.token
              )?.price
            ) * collectData?.amount
          ).toFixed(0)
        )
      ) {
        setApproved(true);
      } else {
        setApproved(false);
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleApprove = async () => {
    setPurchaseLoading(true);

    try {
      const balance = await publicClient.readContract({
        address: collectData.token as `0x${string}`,
        abi: [
          {
            constant: true,
            inputs: [
              {
                name: "_owner",
                type: "address",
              },
            ],
            name: "balanceOf",
            outputs: [
              {
                name: "balance",
                type: "uint256",
              },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        account: address,
      });

      if (
        balance <
        BigInt(
          Number(
            Number(
              nft?.prices?.find(
                (tok) => tok.token?.toLowerCase() == collectData?.token
              )?.price
            ) * collectData?.amount
          ).toFixed(0)
        )
      ) {
        context?.setNotification?.("Not Enough Tokens in Your Wallet :(");
        setPurchaseLoading(false);
        return;
      }

      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: collectData.token as `0x${string}`,
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "spender",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            name: "approve",
            outputs: [
              {
                internalType: "bool",
                name: "",
                type: "bool",
              },
            ],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "approve",
        chain: chains.mainnet,
        args: [
          MARKET_CONTRACT,
          BigInt(
            Number(
              Number(
                nft?.prices?.find(
                  (tok) => tok.token?.toLowerCase() == collectData?.token
                )?.price
              ) * collectData?.amount
            ).toFixed(0)
          ),
        ],
        account: address,
      });
      const res = await clientWallet.writeContract(request);

      await publicClient.waitForTransactionReceipt({ hash: res });

      setApproved(true);
    } catch (err: any) {
      console.error(err.message);
    }
    setPurchaseLoading(false);
  };

  const handlePurchase = async () => {
    if (collectData?.amount < 1) return;
    if (nft?.collectionType == CollectionType.IRL) {
      context?.setFulfillmentOpen({
        ...collectData,
        id: Number(nft.id),
        fulfiller: context?.fulfillers?.find(
          (ful) => ful.fulfillerId == nft.fulfillerId
        )?.wallet!,
        agentId: Number(
          context?.agents?.find((ag) =>
            ag?.wallets
              ?.map((w) => w.toLowerCase())
              ?.includes(nft?.artist?.toLowerCase())
          )?.id
        ),
      });
      return;
    }

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
          "",
          collectData?.token,
          Number(nft.id),
          collectData?.amount,
          Number(
            context?.agents?.find((ag) =>
              ag?.wallets
                ?.map((w) => w.toLowerCase())
                ?.includes(nft?.artist?.toLowerCase())
            )?.id
          ),
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });

      context?.setNotification?.(
        "It's All Yours! Check sales in your dashboard."
      );
      setNft({
        ...nft,
        amountSold: Number(nft?.amountSold) + Number(collectData?.amount),
      });
      checkAllowance();
      setCollectData({
        amount: 1,
        token: nft?.prices?.[0]?.token,
      });
    } catch (err: any) {
      if (err?.message?.includes("NotAvailable")) {
        context?.setNotification?.(
          "We know you're eager, but you've reached this creations' collect limit!"
        );
      }

      if (err?.message?.includes("0xfb8f41b2") ||err?.message?.includes("ERC20InsufficientAllowance") ) {
        context?.setNotification?.(
          "Out of tokens? Fill up your wallet!"
        );
      }
      console.error(err?.message);
    }
    setPurchaseLoading(false);
  };

  useEffect(() => {
    if (nft && address) {
      checkAllowance();
    }
  }, [address, nft, collectData?.amount]);

  useEffect(() => {
    if (nft) {
      if (nft?.collectionType == CollectionType.IRL) {
        setCollectData({
          ...collectData,
          size: nft?.sizes?.[0]!,
          color: nft?.colors?.[0]!,
          token: nft?.prices?.[0]?.token,
        });
      } else {
        setCollectData({
          ...collectData,
          token: nft?.prices?.[0]?.token,
        });
      }
    }
  }, [nft]);

  return {
    purchaseLoading,
    handlePurchase,
    handleApprove,
    approved,
    setCollectData,
    collectData,
    screen,
    setScreen,
  };
};

export default usePurchase;
