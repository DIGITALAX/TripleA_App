import {
  Fulfiller,
  LensConnected,
  NFTData,
  TokenThreshold,
} from "@/components/Common/types/common.types";
import {
  Account,
  Post,
  PublicClient,
  SessionClient,
} from "@lens-protocol/client";
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
  agents: Agent[];
  allDrops: DropInterface[];
  allDropsLoading: boolean;
  lensConnected: LensConnected;
  tokenThresholds: TokenThreshold[];
  fulfillers: Fulfiller[];
  setToolTip: (e: SetStateAction<boolean>) => void;
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
  setNotification: (e: SetStateAction<string | undefined>) => void;
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
  setToolTip: (e: SetStateAction<boolean>) => void;
};

export type AgentProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensClient: PublicClient;
  address: `0x${string}` | undefined;
  setNotification: (e: SetStateAction<string | undefined>) => void;
  setAgents: (e: SetStateAction<Agent[]>) => void;
  sessionClient: SessionClient;
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
    mintFrequency: number;
    publish: boolean;
    remix: boolean;
    lead: boolean;
    mint: boolean;
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
  owners: string[];
  bio: string;
  lore: string;
  knowledge: string;
  style: string;
  adjectives: string;
  model: string;
  messageExamples: {
    user: string;
    content: {
      text: string;
    };
  }[][];
  wallets: string[];
  balances: Balance[];
  creator: string;
  activeCollectionIds: AgentCollection[];
  collectionIdsHistory: AgentCollection[];
  profile?: Account;
  ownerProfile?: Account;
  activity?: Post[];
  accountConnected?: string;
  feeds: string[];
  workers?: Worker[];
}

export enum CollectionWorkerType {
  Publish = "Publish",
  Lead = "Lead Gen",
  Remix = "Remix",
  Mint = "Mint",
}

export interface Worker {
  leadFrequency: number;
  publishFrequency: number;
  remixFrequency: number;
  mintFrequency: number;
  remix: boolean;
  publish: boolean;
  lead: boolean;
  mint: boolean;
  instructions: string;
  profile?: Account;
  collectionId: string;
  tokens: string[];
  metadata: {
    image: string;
    title: string;
  };
}

export interface AgentCollection {
  metadata: {
    title: string;
    image: string;
  };
  collectionId: number;
  profile: Account;
}

export interface Balance {
  token: string;
  rentBalance: string;
  historicalRentBalance: string;
  historicalBonusBalance: string;
  collectionId: string;
  bonusBalance: string;
  image?: string;
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
  collectionType: CollectionType;
  fulfilled: boolean;
  fulfillment: string;
  fulfiller: string;
  fulfillmentDetails?: {
    color: string;
    size: string;
    name: string;
    address: string;
    country: string;
    state: string;
    zip: string;
  };
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
  agents: Agent[];
  collection: NFTData;
  setDrop: (e: SetStateAction<DropInterface | undefined>) => void;
  setDropSwitcher: (e: SetStateAction<DropSwitcher>) => void;
  setCollection: (e: SetStateAction<NFTData | undefined>) => void;
  setNotification: (e: SetStateAction<string | undefined>) => void;
};

export enum AgentEditSwitcher {
  Profile,
  Wallets,
  Feeds,
}

export interface AgentMetadata {
  cover?: string | Blob;
  title: string;
  bio: string;
  customInstructions: string;
  knowledge: string;
  style: string;
  lore: string;
  adjectives: string;
  model: string;
  modelsOpen: boolean;
}

export type AgentEditSwitchProps = {
  agentEdit: AgentEditSwitcher;
  handleEditAgent: () => Promise<void>;
  agentEditLoading: boolean;
  agentMetadata: AgentMetadata;
  agentOwners: { address: string; added: boolean }[];
  revokeOwner: (index: number) => Promise<void>;
  addOwner: (index: number) => Promise<void>;
  setAgentOwners: (
    e: SetStateAction<{ address: string; added: boolean }[]>
  ) => void;
  revokeLoading: boolean[];
  addOwnerLoading: boolean[];
  setAgentMetadata: (e: SetStateAction<AgentMetadata>) => void;
  feedsLoading: boolean;
  handleNewFeeds: () => Promise<void>;
  agentFeeds: { address: string; added: boolean }[];
  setAgentFeeds: (
    e: SetStateAction<{ address: string; added: boolean }[]>
  ) => void;
  addFeedLoading: boolean[];
  addFeedRule: (index: number) => Promise<void>;
};
