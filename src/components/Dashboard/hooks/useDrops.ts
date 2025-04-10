import { useContext, useEffect, useState } from "react";
import { NFTData } from "@/components/Common/types/common.types";
import { DropInterface } from "../types/dashboard.types";
import { INFURA_GATEWAY } from "@/lib/constants";
import { getDrop } from "../../../../graphql/queries/getDrop";
import { Account, evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { ModalContext } from "@/app/providers";

const useDrops = (drop: DropInterface | undefined) => {
  const context = useContext(ModalContext);
  const [collectionsLoading, setCollectionsLoading] = useState<boolean>(false);
  const [allCollections, setAllCollections] = useState<NFTData[]>([]);

  const handleCollections = async () => {
    if (!drop?.id) return;
    setCollectionsLoading(true);

    try {
      const data = await getDrop(Number(drop?.id));

      const metadataCache = new Map<string, any>();
      const profileCache = new Map<string, Account>();

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

          if (!profileCache.has(artistAddress)) {
            const result = await fetchAccountsAvailable(context?.lensClient!, {
              managedBy: artistAddress,
              includeOwned: true,
            });

            if (result.isErr()) {
              setCollectionsLoading(false);
              return;
            }

            profileCache.set(artistAddress, result.value.items?.[0]?.account);
          }

          const profile = profileCache.get(artistAddress);

          return {
            id: collection?.collectionId,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
            description: collection?.metadata?.description,
            prices: collection?.prices,
            agentIds: collection?.agentIds,
            active: collection?.active,
            amountSold: collection?.amountSold,
            amount: collection?.amount,
            profile,
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
    if (allCollections?.length < 1 && drop && context?.lensClient) {
      handleCollections();
    }
  }, [context?.lensClient]);

  return {
    allCollections,
    collectionsLoading,
  };
};

export default useDrops;
