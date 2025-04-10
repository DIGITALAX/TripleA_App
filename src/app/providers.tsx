"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { createContext, SetStateAction, useEffect, useState } from "react";
import { Context, PublicClient, mainnet, testnet } from "@lens-protocol/client";
import { Agent } from "@/components/Dashboard/types/dashboard.types";
import {
  Fulfiller,
  LensConnected,
  TokenThreshold,
} from "@/components/Common/types/common.types";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { CollectData } from "@/components/NFT/types/nft.types";
import { StorageClient } from "@lens-chain/storage-client";
import { chains } from "@lens-chain/sdk/viem";

export const config = createConfig(
  getDefaultConfig({
    appName: "TripleA",
    walletConnectProjectId: process.env
      .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    appUrl: "https://triplea.agentmeme.xyz",
    appIcon: "https://triplea.agentmeme.xyz/favicon.ico",
    chains: [chains.mainnet],
    transports: {
      [chains.mainnet.id]: http("https://rpc.lens.xyz"),
    },
    ssr: true,
  })
);

const queryClient = new QueryClient();

export const AnimationContext = createContext<
  | {
      pageChange: boolean;
      setPageChange: (e: SetStateAction<boolean>) => void;
    }
  | undefined
>(undefined);

export const ModalContext = createContext<
  | {
      toolTip: boolean;
      setToolTip: (e: SetStateAction<boolean>) => void;
      imageView: string | undefined;
      setImageView: (e: SetStateAction<string | undefined>) => void;
      indexer: string | undefined;
      setIndexer: (e: SetStateAction<string | undefined>) => void;
      notification: string | undefined;
      setNotification: (e: SetStateAction<string | undefined>) => void;
      agents: Agent[];
      setAgents: (e: SetStateAction<Agent[]>) => void;
      lensClient: PublicClient<Context> | undefined;
      createAccount: boolean;
      setCreateAccount: (e: SetStateAction<boolean>) => void;
      signless: boolean;
      setSignless: (e: SetStateAction<boolean>) => void;
      setAgentsLoading: (e: SetStateAction<boolean>) => void;
      agentsLoading: boolean;
      lensConnected: LensConnected | undefined;
      setLensConnected: (e: SetStateAction<LensConnected | undefined>) => void;
      storageClient: StorageClient;
      tokenThresholds: TokenThreshold[];
      setTokenThresholds: (e: SetStateAction<TokenThreshold[]>) => void;
      fulfillers: Fulfiller[];
      setFulfillers: (e: SetStateAction<Fulfiller[]>) => void;
      setFulfillmentOpen: (
        e: SetStateAction<
          | (CollectData & {
              id: number;
              fulfiller: string;
              agentId: number;
            })
          | undefined
        >
      ) => void;
      fulfillmentOpen:
        | (CollectData & {
            id: number;
            fulfiller: string;
            agentId: number;
          })
        | undefined;
    }
  | undefined
>(undefined);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [lensConnected, setLensConnected] = useState<
    LensConnected | undefined
  >();
  const [indexer, setIndexer] = useState<string | undefined>();
  const [imageView, setImageView] = useState<string | undefined>();
  const [notification, setNotification] = useState<string | undefined>();
  const [tokenThresholds, setTokenThresholds] = useState<TokenThreshold[]>([]);
  const [pageChange, setPageChange] = useState<boolean>(false);
  const [signless, setSignless] = useState<boolean>(false);
  const [createAccount, setCreateAccount] = useState<boolean>(false);
  const [toolTip, setToolTip] = useState<boolean>(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);
  const [lensClient, setLensClient] = useState<PublicClient | undefined>();
  const [fulfillers, setFulfillers] = useState<Fulfiller[]>([]);
  const [fulfillmentOpen, setFulfillmentOpen] = useState<
    | (CollectData & {
        id: number;
        fulfiller: string;
        agentId: number;
      })
    | undefined
  >();
  const storageClient = StorageClient.create();

  useEffect(() => {
    if (!lensClient) {
      setLensClient(
        PublicClient.create({
          environment: {
            backend: "https://api.lens.xyz/graphql" as any,
            indexingTimeout: 10000,
            name: "mainnet",
            pollingInterval: 100,
          },
          storage: window.localStorage,
        })
      );
    }
  }, []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          customTheme={{
            "--ck-font-family": '"Jackey2", cursive',
          }}
        >
          <AnimationContext.Provider
            value={{
              pageChange,
              setPageChange,
            }}
          >
            <ModalContext.Provider
              value={{
                toolTip,
                setToolTip,
                fulfillmentOpen,
                setFulfillmentOpen,
                imageView,
                setImageView,
                agents,
                setAgents,
                lensClient,
                createAccount,
                setCreateAccount,
                lensConnected,
                setLensConnected,
                indexer,
                setIndexer,
                notification,
                setNotification,
                storageClient,
                signless,
                setSignless,
                tokenThresholds,
                setTokenThresholds,
                agentsLoading,
                setAgentsLoading,
                fulfillers,
                setFulfillers,
              }}
            >
              {children}
            </ModalContext.Provider>
          </AnimationContext.Provider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
