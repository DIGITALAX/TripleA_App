import {
  Fulfiller,
  LensConnected,
  NFTData,
  TokenThreshold,
} from "@/components/Common/types/common.types";
import { Account, Post, PublicClient } from "@lens-protocol/client";
import { SetStateAction } from "react";
import { StorageClient } from "@lens-protocol/storage-node-client";

export enum Switcher {
  Home,
  Sales,
  Collects,
  Agents,
  Mint,
  Drops,
  Account,
  Page,
}

export enum MintSwitcher {
  Type,
  Collection,
  Tokens,
  Agent,
  Drop,
  Remix,
  Mint,
  Success,
}

export enum CollectionType {
  Digital = "Digital",
  IRL = "IRL",
}

export enum Format {
  Hoodie = "Hoodie",
  LongSleeve = "Long Sleeve",
  Tee = "Tee",
  Sticker = "Sticker",
  Poster = "Poster",
}

export enum DropSwitcher {
  Drops,
  Collection,
  AgentsCollection,
}

export type MintSwitchProps = {
  mintSwitcher: MintSwitcher;
  setMintSwitcher: (e: SetStateAction<MintSwitcher>) => void;
  setAgents: (e: SetStateAction<Agent[]>) => void;
  agents: Agent[];
  allDrops: DropInterface[];
  allDropsLoading: boolean;
  lensConnected: LensConnected;
  tokenThresholds: TokenThreshold[];
  fulfillers: Fulfiller[];
};

export type DropsProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  allDrops: DropInterface[];
  allDropsLoading: boolean;
  setDropSwitcher: (e: SetStateAction<DropSwitcher>) => void;
  setDrop: (e: SetStateAction<DropInterface | undefined>) => void;
};

export type SalesProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensClient: PublicClient;
};

export type CollectsProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensClient: PublicClient;
};

export type DropProps = {
  mintData: MintData;
  setMintData: (e: SetStateAction<MintData>) => void;
  mintLoading: boolean;
  allDrops: DropInterface[];
  setMintSwitcher: (e: SetStateAction<MintSwitcher>) => void;
};

export type MintProps = {
  handleMint: () => Promise<void>;
  mintLoading: boolean;
  mintData: MintData;
  allDrops: DropInterface[];
  tokenThresholds: TokenThreshold[];
};

export type CustomiseAgentProps = {
  chosenAgents: {
    agent: Agent;
    customInstructions: string;
  }[];
  setMintData: (e: SetStateAction<MintData>) => void;
};

export type ChooseAgentProps = {
  agents: Agent[];
  agentsLoading: boolean;
  mintData: MintData;
  setMintData: (e: SetStateAction<MintData>) => void;
  tokenThresholds: TokenThreshold[];
};

export type AgentProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensClient: PublicClient;
  address: `0x${string}` | undefined;
  setNotification: (e: SetStateAction<string | undefined>) => void;
};

export type AccountProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensConnected: LensConnected | undefined;
  setLensConnected: (e: SetStateAction<LensConnected | undefined>) => void;
  storageClient: StorageClient;
  setSignless: (e: SetStateAction<boolean>) => void;
};

export type MintData = {
  agents: {
    agent: Agent;
    customInstructions: string;
    publishFrequency: number;
    remixFrequency: number;
    leadFrequency: number;
    publish: boolean;
    remix: boolean;
    lead: boolean;
  }[];
  prices: number[];
  tokens: string[];
  dropId: number;
  dropCover: Blob | undefined;
  dropTitle: string;
  image: Blob | undefined;
  title: string;
  description: string;
  amount: number;
  collectionType: CollectionType;
  format: string;
  sizes: string[];
  colors: string[];
  remixable: boolean;
  fulfiller: number;
  remixId: number;
};

export interface Agent {
  id: string;
  cover: string;
  title: string;
  customInstructions: string;
  description: string;
  wallet: string;
  balance: Balances[];
  owner: string;
  activeCollectionIds: AgentCollection[];
  collectionIdsHistory: AgentCollection[];
  details: {
    collectionId: string;
    instructions: string;
    publishFrequency: number;
    remixFrequency: number;
    leadFrequency: number;
    publish: boolean;
    remix: boolean;
    lead: boolean;
  }[];
  profile?: Account;
  ownerProfile?: Account;
  activity?: Post[];
  accountConnected?: string;
}

export enum CollectionWorkerType {
  Publish = "Publish",
  Lead = "Lead Gen",
  Remix = "Remix",
}

export interface AgentCollection {
  metadata: {
    title: string;
    image: string;
  };
  collectionId: number;
  profile: Account;
}

export interface Balances {
  token: string;
  activeBalance: number;
  totalBalance: number;
  dailyFrequency: number;
  collectionId: number;
  instructions: string;
}

export interface DropInterface {
  id: string;
  title: string;
  cover: string;
  collectionIds: string[];
  collections: NFTData[];
}

export interface Order {
  id: string;
  totalPrice: string;
  token: string;
  amount: string;
  collectionId: string;
  mintedTokenIds: string[];
  blockTimestamp: string;
  transactionHash: string;
  collection: NFTData;
  buyer: string;
}

export type DropsSwitchProps = {
  allDrops: DropInterface[];
  allDropsLoading: boolean;
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensClient: PublicClient;
  agents: Agent[];
  setNotification: (e: SetStateAction<string | undefined>) => void;
};

export type CollectionProps = {
  setDropSwitcher: (e: SetStateAction<DropSwitcher>) => void;
  drop: DropInterface | undefined;
  setDrop: (e: SetStateAction<DropInterface | undefined>) => void;
  lensClient: PublicClient;
  setCollection: (e: SetStateAction<NFTData | undefined>) => void;
};

export type AgentsCollectionProps = {
  setDropSwitcher: (e: SetStateAction<DropSwitcher>) => void;
  agents: Agent[];
  setDrop: (e: SetStateAction<DropInterface | undefined>) => void;
  collection: NFTData;
  setCollection: (e: SetStateAction<NFTData | undefined>) => void;
  setNotification: (e: SetStateAction<string | undefined>) => void;
};
