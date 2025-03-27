import { LensConnected } from "@/components/Common/types/common.types";
import { SetStateAction } from "react";
import { StorageClient } from "@lens-chain/storage-client";
import { CollectData } from "@/components/NFT/types/nft.types";

export type ImageViewerProps = {
  imageView: string;
  setImageView: (e: SetStateAction<string | undefined>) => void;
};

export type FulfillmentProps = {
  address: `0x${string}` | undefined;
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
  details: CollectData & {
    id: number;
    fulfiller: string;
    agentId: number;
  };
  setNotification: (e: SetStateAction<string | undefined>) => void;
};

export type CreateAccountProps = {
  address: `0x${string}` | undefined;
  lensConnected: LensConnected | undefined;
  setLensConnected:
    | ((e: SetStateAction<LensConnected | undefined>) => void)
    | undefined;
  setCreateAccount: (e: SetStateAction<boolean>) => void;
  setIndexer: (e: SetStateAction<string | undefined>) => void;
  setNotification: (e: SetStateAction<string | undefined>) => void;
  storageClient: StorageClient;
};

export type IndexerProps = {
  indexer: string | undefined;
  setIndexer: (e: SetStateAction<string | undefined>) => void;
};

export type NotificationProps = {
  notification: string | undefined;
  setNotification: (e: SetStateAction<string | undefined>) => void;
};

export type SignlessProps = {
  lensConnected: LensConnected | undefined;
  setSignless: (e: SetStateAction<boolean>) => void;
};

export type ToolTipProps = {
  setTooltip: (e: SetStateAction<boolean>) => void;
};
