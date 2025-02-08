import { CollectionType } from "@/components/Dashboard/types/dashboard.types";
import { Account, Post, SessionClient } from "@lens-protocol/client";

export interface NFTData {
  id: number;
  image: string;
  title: string;
  format?: string;
  description: string;
  blocktimestamp: string;
  collectionType: CollectionType;
  colors?: string[];
  sizes?: string[];
  prices: { price: string; token: string }[];
  agentIds: string[];
  artist: string;
  amountSold: number;
  tokenIds: string[];
  amount: number;
  profile: Account;
  collectors?: Collector[];
  agentActivity?: Post[];
  active: boolean;
  agent: boolean;
  remixId: string;
  fulfillerId: string;
  remix?: {
    image: string;
    profile: Account;
  };
}

export interface LensConnected {
  profile?: Account;
  sessionClient?: SessionClient;
}

export interface Collector {
  pfp?: string;
  name?: string;
  address: string;
  transactionHash: string;
  amount: number;
  blockTimestamp: string;
  localName?: string;
}

export interface TokenThreshold {
  token: string;
  threshold: string;
  rent: string;
}

export interface Fulfiller {
  uri: string;
  cover: string;
  description: string;
  title: string;
  link: string;
  wallet: string;
  fulfillerId: string;
  orderHistory: string[];
  activeOrders: string[];
}
