import { useEffect, useState } from "react";
import { NFTData } from "../types/common.types";
import { getCollections } from "../../../../graphql/queries/getGallery";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import { FetchResult } from "@apollo/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

const useGallery = (lensClient: PublicClient, choice: string) => {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
  const [priceIndex, setPriceIndex] = useState<number[]>([]);

  const handleGallery = async (): Promise<void> => {
    setGalleryLoading(true);
    try {
      let data: FetchResult | void;
      if (choice?.includes("All")) {
        data = await getCollections(page);
      } else {
        data = await getCollections(
          page,
          choice?.includes("Agent") ? true : false
        );
      }

      const gallery: NFTData[] = await Promise.all(
        data?.data?.collectionCreateds?.map(async (collection: any) => {
          if (!collection.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${collection.uri.split("ipfs://")?.[1]}`
            );
            collection.metadata = await cadena.json();
          }
         
          const result = await fetchAccountsAvailable(lensClient, {
            managedBy: evmAddress(collection?.artist),
            includeOwned: true,
            
          });
          if (result.isErr()) {
            setGalleryLoading(false);
            return;
          }
          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${
              result.value.items?.[0]?.account?.metadata?.picture?.split(
                "lens://"
              )?.[1]
            }`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          return {
            id: collection?.collectionId,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
            description: collection?.metadata?.description,
            blocktimestamp: collection?.blockTimestamp,
            prices: collection?.prices,
            agentIds: collection?.agentIds,
            artist: collection?.artist,
            amountSold: collection?.amountSold,
            tokenIds: collection?.tokenIds,
            amount: collection?.amount,
            profile: {
              ...result.value.items?.[0]?.account,
              metadata: {
                ...result.value.items?.[0]?.account?.metadata,
                picture,
              },
            },
          };
        })
      );

      setPage(gallery?.length == 40 ? 40 : 0);
      setHasMore(gallery?.length == 40 ? true : false);
      setNfts(gallery?.sort(() => Math.random() - 0.5));
      setPriceIndex(Array.from({ length: gallery?.length }, () => 0));
    } catch (err: any) {
      console.error(err.message);
    }
    setGalleryLoading(false);
  };

  useEffect(() => {
    if (lensClient) {
      handleGallery();
    }
  }, [lensClient, choice]);

  const handleMoreGallery = async () => {
    setGalleryLoading(true);
    try {
      let data: FetchResult | void;

      if (choice?.includes("All")) {
        data = await getCollections(page);
      } else {
        data = await getCollections(
          page,
          choice?.includes("Agent") ? true : false
        );
      }

      const gallery: NFTData[] = await Promise.all(
        data?.data?.collectionCreateds?.map(async (collection: any) => {
          if (!collection.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${collection.uri.split("ipfs://")?.[1]}`
            );
            collection.metadata = await cadena.json();
          }

          const result = await fetchAccountsAvailable(lensClient, {
            managedBy: evmAddress(collection?.artist),
          });

          if (result.isErr()) {
            setGalleryLoading(false);
            return;
          }
          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${
              result.value.items?.[0]?.account?.metadata?.picture?.split(
                "lens://"
              )?.[1]
            }`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          return {
            id: collection?.id,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
            description: collection?.metadata?.description,
            blocktimestamp: collection?.blockTimestamp,
            prices: collection?.prices,
            tokens: collection?.tokens,
            agents: collection?.agents,
            artist: collection?.artist,
            amountSold: collection?.amountSold,
            tokenIds: collection?.tokenIds,
            amount: collection?.amount,
            profile: {
              ...result.value.items?.[0]?.account,
              metadata: {
                ...result.value.items?.[0]?.account?.metadata,
                picture,
              },
            },
          };
        })
      );

      setPage(gallery?.length == 40 ? page + 40 : page);
      setHasMore(gallery?.length == 40 ? true : false);
      setNfts([...nfts, ...gallery?.sort(() => Math.random() - 0.5)]);

      setPriceIndex([
        ...priceIndex,
        ...Array.from({ length: gallery?.length }, () => 0),
      ]);
    } catch (err: any) {
      console.error(err.message);
    }
    setGalleryLoading(false);
  };

  return {
    handleMoreGallery,
    nfts,
    hasMore,
    galleryLoading,
    priceIndex,
    setPriceIndex,
  };
};

export default useGallery;
