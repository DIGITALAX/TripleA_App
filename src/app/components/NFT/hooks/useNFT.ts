import { Collector, NFTData } from "@/components/Common/types/common.types";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useContext, useEffect, useState } from "react";
import { getCollection } from "./../../../../../graphql/queries/getCollection";
import {
  Account,
  evmAddress,
  PageSize,
  Post,
  TextOnlyMetadata,
} from "@lens-protocol/client";
import { getCollectors } from "./../../../../../graphql/queries/getCollectors";
import { CollectionType } from "@/components/Dashboard/types/dashboard.types";
import {
  getCollectionsArtist,
  getCollectionsArtistNot,
} from "./../../../../../graphql/queries/getGallery";
import {
  fetchAccountsAvailable,
  fetchPosts,
} from "@lens-protocol/client/actions";
import { AnimationContext, ModalContext } from "@/providers";

const useNFT = (id: string) => {
  const animationContext = useContext(AnimationContext);
  const context = useContext(ModalContext);
  const [nft, setNft] = useState<NFTData | undefined>();
  const [moreCollections, setMoreCollections] = useState<NFTData[]>([]);
  const [nftLoading, setNftLoading] = useState<boolean>(false);
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [activityCursor, setActivityCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [moreCollectionsLoading, setMoreCollectionsLoading] =
    useState<boolean>(true);

  const handlePosts = async (
    reset: boolean,
    title?: string
  ): Promise<Post[] | void> => {
    try {
      const postsRes = await fetchPosts(
        context?.lensConnected?.sessionClient || context?.lensClient!,
        {
          pageSize: PageSize.Fifty,
          filter: {
            metadata: {
              tags: {
                oneOf: [
                  // "tripleA",
                  (title ?? nft?.title?.replaceAll(" ", "")?.toLowerCase())!,
                ]?.filter(Boolean),
              },
            },
          },
        }
      );

      if (postsRes.isErr()) {
        console.error(postsRes.error);
        return;
      }

      let posts: Post[] = [];

      if (postsRes.value?.items?.length > 0) {
        posts = postsRes?.value.items as Post[];
      }

      if (postsRes.value?.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor(postsRes.value?.pageInfo?.next);
      } else {
        setHasMore(false);
      }

      if (!reset) {
        return posts;
      } else {
        setNft({
          ...nft!,
          agentActivity: posts || [],
        });
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleNFT = async () => {
    setNftLoading(true);
    try {
  
      const collData = await getCollection(Number(id));

      let collection = collData?.data?.collectionCreateds?.[0];
      if (!collData?.data?.collectionCreateds?.[0]?.metadata) {
        const cadena = await fetch(
          `${INFURA_GATEWAY}/ipfs/${
            collData?.data?.collectionCreateds?.[0]?.uri.split("ipfs://")?.[1]
          }`
        );
        collection.metadata = await cadena.json();
      }

      const result = await fetchAccountsAvailable(
        context?.lensConnected?.sessionClient || context?.lensClient!,
        {
          managedBy: evmAddress(collection?.artist),
          includeOwned: true,
        }
      );

      if (result.isErr()) {
        setNftLoading(false);
        return;
      }

      const res = await getCollectors(Number(id));

      let collectors: Collector[] = [];
      const profileCache = new Map<string, Account>();

      await Promise.all(
        res?.data?.collectionPurchaseds?.map(async (order: any) => {
          const buyerAddress = evmAddress(order?.buyer);

          if (!profileCache.has(buyerAddress)) {
            const accounts = await fetchAccountsAvailable(
              context?.lensConnected?.sessionClient || context?.lensClient!,
              {
                managedBy: buyerAddress,
                includeOwned: true,
              }
            );

            if (accounts.isErr()) {
              setNftLoading(false);
              return null;
            }

            profileCache.set(buyerAddress, accounts.value.items?.[0]?.account);
          }

          const profile = profileCache.get(buyerAddress);

          collectors.push({
            transactionHash: order?.transactionHash,
            blockTimestamp: order?.blockTimestamp,
            amount: order?.amount,
            address: order?.buyer,
            pfp: profile?.metadata?.picture,
            localName: profile?.username?.localName,
            name: profile?.metadata?.name!,
          });
        })
      );

      const posts = await handlePosts(
        false,
        collection?.metadata?.title?.replaceAll(" ", "")?.toLowerCase()!
      );

      let remix = undefined;

      if (Number(collection?.remixId) > 0) {
        let image =
          collData?.data?.collectionCreateds?.[0]?.remixCollection?.metadata
            ?.image;
        if (!image) {
          const cadena = await fetch(
            `${INFURA_GATEWAY}/ipfs/${
              collData?.data?.collectionCreateds?.[0]?.remixCollection?.uri.split(
                "ipfs://"
              )?.[1]
            }`
          );
          const metadata = await cadena.json();
          image = metadata.image;
        }

        const accounts = await fetchAccountsAvailable(
          context?.lensConnected?.sessionClient || context?.lensClient!,
          {
            managedBy: evmAddress(
              collData?.data?.collectionCreateds?.[0]?.remixCollection?.artist
            ),
            includeOwned: true,
          }
        );

        if (accounts.isErr()) {
          setNftLoading(false);
          return;
        }

        remix = {
          image,
          profile: accounts.value.items?.[0]?.account,
        };
      }

      setNft({
        id: Number(collection?.collectionId),
        image: collection?.metadata?.image,
        title: collection?.metadata?.title,
        description: collection?.metadata?.description,
        blocktimestamp: collection?.blockTimestamp,
        active: collection?.active,
        prices: collection?.prices,
        agentIds: collection?.agentIds,
        artist: collection?.artist,
        amountSold: collection?.amountSold,
        tokenIds: collection?.tokenIds,
        amount: collection?.amount,
        isAgent: collection?.isAgent,
        remixId: collection?.remixId,
        prompt: collection?.metadata?.prompt,
        model: collection?.metadata?.model,
        remix,
        profile: result.value.items?.[0]?.account,
        collectors,
        agentActivity: posts || [],
        collectionType:
          collection?.collectionType == "1"
            ? CollectionType.IRL
            : CollectionType.Digital,
        format: collection?.metadata?.format,
        sizes: collection?.metadata?.sizes,
        colors: collection?.metadata?.colors,
        fulfillerId: collection?.fulfillerId,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setNftLoading(false);
  };

  const handleMoreActivity = async () => {
    if (!hasMore || !activityCursor) return;
    setAgentLoading(true);
    try {
      const postsRes = await fetchPosts(
        context?.lensConnected?.sessionClient || context?.lensClient!,
        {
          pageSize: PageSize.Fifty,
          cursor: activityCursor,
          filter: {
            metadata: {
              tags: {
                oneOf: [
                  // "tripleA",
                  nft?.title?.replaceAll(" ", "")?.toLowerCase()!,
                ],
              },
            },
          },
        }
      );

      if (postsRes.isErr()) {
        setAgentLoading(false);
        return;
      }

      let posts: Post[] = [];

      if (postsRes.value?.items?.length > 0) {
        posts = postsRes.value.items as Post[];
      } else {
        const postsRes = await fetchPosts(
          context?.lensConnected?.sessionClient || context?.lensClient!,
          {
            filter: {
              metadata: {
                tags: {
                  oneOf: [
                    // "tripleA",
                    nft?.title?.replaceAll(" ", "")?.toLowerCase()!,
                  ],
                },
              },
            },
            pageSize: PageSize.Fifty,
          }
        );
        if (postsRes.isErr()) {
          setAgentLoading(false);
          return;
        }

        posts = postsRes.value.items as Post[];
      }

      if (postsRes.value?.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor(postsRes.value?.pageInfo?.next);
      } else {
        setHasMore(false);
        setActivityCursor(undefined);
      }

      setNft({
        ...(nft as NFTData),
        agentActivity: [...(nft?.agentActivity || []), ...posts],
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentLoading(false);
  };

  const handleMoreCollections = async () => {
    setMoreCollectionsLoading(true);
    try {
      const data = await getCollectionsArtist(nft?.artist!);
      let collData = data?.data?.collectionCreateds;
      if (collData?.length < 10) {
        const data = await getCollectionsArtistNot(nft?.artist!);
        collData = [...collData, ...data?.data?.collectionCreateds].sort(
          () => Math.random() - 0.5
        );
      }

      let colls = await Promise.all(
        collData.map(async (col: any) => {
          if (!col?.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${col?.uri.split("ipfs://")?.[1]}`
            );
            col.metadata = await cadena.json();
          }

          const result = await fetchAccountsAvailable(
            context?.lensConnected?.sessionClient || context?.lensClient!,
            {
              managedBy: evmAddress(col?.artist),
              includeOwned: true,
            }
          );

          if (result.isErr()) {
            setMoreCollectionsLoading(false);
            return;
          }

          return {
            id: Number(col?.collectionId),
            image: col?.metadata?.image,
            artist: col?.artist,
            profile: result.value.items?.[0]?.account,
          };
        })
      );

      setMoreCollections(colls);
    } catch (err: any) {
      console.error(err.message);
    }
    setMoreCollectionsLoading(false);
  };

  useEffect(() => {
    if (
      Number(id) > 0 &&
      !nft &&
      context?.lensClient &&
      context?.agents?.length > 0
    ) {
      handleNFT();
    }
  }, [
    id,
    context?.lensClient,
    context?.agents,
    context?.lensConnected?.sessionClient,
  ]);

  useEffect(() => {
    if (nft && moreCollections?.length < 1 && !animationContext?.pageChange) {
      handleMoreCollections();
    }
  }, [nft]);

  return {
    nft,
    nftLoading,
    setNft,
    agentLoading,
    handleMoreActivity,
    hasMore,
    handlePosts,
    moreCollections,
    moreCollectionsLoading,
  };
};

export default useNFT;
