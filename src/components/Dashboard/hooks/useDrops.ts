import { useEffect, useState } from "react";
import { NFTData } from "@/components/Common/types/common.types";
import { DropInterface } from "../types/dashboard.types";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import { getDrop } from "../../../../graphql/queries/getDrop";
import { Account, evmAddress, PublicClient } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

const useDrops = (
  drop: DropInterface | undefined,
  lensClient: PublicClient
) => {
  const [collectionsLoading, setCollectionsLoading] = useState<boolean>(false);
  const [allCollections, setAllCollections] = useState<NFTData[]>([]);

  const handleCollections = async () => {
    if (!drop?.id) return;
    setCollectionsLoading(true);

    try {
      const data = await getDrop(Number(drop?.id));

      const metadataCache = new Map<string, any>();
      const profileCache = new Map<string, Account>();
      const pictureCache = new Map<string, string>();

      const collections: NFTData[] = await Promise.all(
        data?.data?.collectionCreateds.map(async (collection: any) => {
          if (!collection.metadata) {
            if (!metadataCache.has(collection.uri)) {
              const response = await fetch(
                `${INFURA_GATEWAY}/ipfs/${collection.uri.split("ipfs://")?.[1]}`
              );
              const metadata = await response.json();
              metadataCache.set(collection.uri, metadata);
            }
            collection.metadata = metadataCache.get(collection.uri);
          }
          const artistAddress = evmAddress(collection?.artist);

          // 📌 Cachear perfil del artista
          if (!profileCache.has(artistAddress)) {
            const result = await fetchAccountsAvailable(lensClient, {
              managedBy: artistAddress,
              includeOwned: true,
            });

            if (result.isErr()) {
              setCollectionsLoading(false);
              return;
            }

            profileCache.set(artistAddress, result.value.items?.[0]?.account);
          }

          let picture = "";
          const profile = profileCache.get(artistAddress);

          if (profile?.metadata?.picture) {
            const pictureKey = profile.metadata.picture.split("lens://")?.[1];
            if (!pictureCache.has(pictureKey)) {
              const response = await fetch(`${STORAGE_NODE}/${pictureKey}`);
              const json = await response.json();
              pictureCache.set(pictureKey, json.item);
            }
            picture = pictureCache.get(pictureKey) || "";
          }

          return {
            id: collection?.collectionId,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
            description: collection?.metadata?.description,
            prices: collection?.prices,
            agents: collection?.agents,
            active: collection?.active,
            amountSold: collection?.amountSold,
            amount: collection?.amount,
            profile: {
              ...profile,
              metadata: {
                ...profile?.metadata,
                picture,
              },
            },
          };
        })
      );

      setAllCollections(collections);
    } catch (err: any) {
      console.error(err.message);
    }
    setCollectionsLoading(false);
  };

  useEffect(() => {
    if (allCollections?.length < 1 && drop && lensClient) {
      handleCollections();
    }
  }, [lensClient]);

  return {
    allCollections,
    collectionsLoading,
  };
};

export default useDrops;
