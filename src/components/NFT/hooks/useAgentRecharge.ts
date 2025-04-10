import { AGENTS_CONTRACT } from "@/lib/constants";
import { chains } from "@lens-chain/sdk/viem";
import {  useContext, useEffect, useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import AgentAbi from "@abis/AgentAbi.json";
import { ModalContext } from "@/app/providers";

const useAgentRecharge = (
  nftAgents: string[],
  publicClient: PublicClient,
  address: `0x${string}` | undefined,
  collectionId: number
) => {
  const [rechargeLoading, setRechargeLoading] = useState<boolean[]>([]);
  const [rechargeAmount, setRechargeAmount] = useState<number[]>([]);
  const [approvedRecharge, setApprovedRecharge] = useState<boolean[]>([]);
  const context = useContext(ModalContext);

  const handleApproveRecharge = async (index: number, token: string) => {
    const amount = rechargeAmount[index];
    if (amount <= 0) {
      context?.setNotification?.("Invalid Recharge Amount :/");
      return;
    }

    setRechargeLoading((prev) => {
      let ref = [...prev];

      ref[index] = true;

      return ref;
    });

    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: token as `0x${string}`,
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
        args: [AGENTS_CONTRACT, BigInt(amount * 10 ** 18)],
        account: address,
      });
      const res = await clientWallet.writeContract(request);

      await publicClient.waitForTransactionReceipt({ hash: res });

      setApprovedRecharge((prev) => {
        let ref = [...prev];

        ref[index] = true;

        return ref;
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setRechargeLoading((prev) => {
      let ref = [...prev];

      ref[index] = false;

      return ref;
    });
  };

  const handleRecharge = async (
    index: number,
    token: string,
    agentId: number
  ) => {
    const amount = rechargeAmount[index];
    if (amount <= 0) {
      context?.setNotification?.("Invalid Recharge Amount :/");
      return;
    }

    setRechargeLoading((prev) => {
      let ref = [...prev];

      ref[index] = true;

      return ref;
    });
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const balance = await publicClient.readContract({
        address: token as `0x${string}`,
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

      if (balance < BigInt(amount * 10 ** 18)) {
        context?.setNotification?.("Not Enough Tokens in Your Wallet :(");
        setRechargeLoading((prev) => {
          let ref = [...prev];

          ref[index] = false;

          return ref;
        });
        return;
      }

      const { request } = await publicClient.simulateContract({
        address: AGENTS_CONTRACT,
        abi: AgentAbi,
        functionName: "rechargeAgentRentBalance",
        chain: chains.mainnet,
        args: [
          token,
          Number(agentId),
          Number(collectionId),
          BigInt(amount * 10 ** 18),
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      context?.setNotification?.("Success! You recharged the agent!");
      setApprovedRecharge((prev) => {
        let ref = [...prev];

        ref[index] = false;

        return ref;
      });
    } catch (err: any) {
      if (err?.message?.includes("Insufficient")) {
        context?.setNotification?.("Not Enough Tokens in Your Wallet :(");
      }
      console.error(err.message);
    }
    setRechargeLoading((prev) => {
      let ref = [...prev];

      ref[index] = false;

      return ref;
    });
  };

  useEffect(() => {
    if (nftAgents?.length > 0) {
      setRechargeLoading(
        Array.from({ length: nftAgents?.length }, () => false)
      );
      setApprovedRecharge(
        Array.from({ length: nftAgents?.length }, () => false)
      );
      setRechargeAmount(Array.from({ length: nftAgents?.length }, () => 1));
    }
  }, [nftAgents]);

  return {
    rechargeLoading,
    handleRecharge,
    setRechargeAmount,
    rechargeAmount,
    handleApproveRecharge,
    approvedRecharge,
  };
};

export default useAgentRecharge;
