import { NFTData } from "@/components/Common/types/common.types";
import { ImageMetadata, Post, TextOnlyMetadata } from "@lens-protocol/client";
import { SetStateAction } from "react";

export type DataProps = {
  url: string;
  id: number;
};

export type PurchaseProps = {
  nft: NFTData;
  handlePosts: (bool: true) => Promise<Post[] | void>;
  nftLoading: boolean;
  setNft: (e: SetStateAction<NFTData | undefined>) => void;
  hasMore: boolean;
  handleMoreActivity: () => Promise<void>;
  agentLoading: boolean;
};

export interface CollectData {
  amount: number;
  token?: string;
  size?: string;
  color?: string;
}

export type CommentsProps = {
  comments: Post[];
  postLoading: boolean;
  interactionsLoading: {
    mirror: boolean;
    like: boolean;
    id: string;
  }[];
  handleLike: (id: string, reaction: string, post: boolean) => Promise<void>;
  handleMirror: (id: string, post: boolean) => Promise<void>;
  setCommentQuote: (
    e: SetStateAction<
      | {
          type: "Comment" | "Quote";
          id: string;
          post?: string;
        }
      | undefined
    >
  ) => void;
  commentQuote:
    | {
        type: "Comment" | "Quote";
        id: string;
        post?: string;
      }
    | undefined;
  post?: boolean;
};

export type PostProps = {
  handlePost: () => Promise<void>;
  handleComment: () => Promise<void>;
  handleQuote: () => Promise<void>;
  postLoading: boolean;
  success: boolean;
  postPage?: boolean;
  setPost: (e: SetStateAction<string>) => void;
  post: string;
  commentQuote:
    | {
        type: "Comment" | "Quote";
        id: string;
        post?: string;
      }
    | undefined;
  setCommentQuote: (
    e: SetStateAction<
      | {
          type: "Comment" | "Quote";
          id: string;
          post?: string;
        }
      | undefined
    >
  ) => void;
};

export type MetadataProps = {
  metadata: string;
  data: TextOnlyMetadata | ImageMetadata;
  post?: boolean;
};
