import { LensConnected, NFTData } from "@/components/Common/types/common.types";
import { useEffect, useState } from "react";
import { getCollections } from "../../../../graphql/queries/getGallery";
import { INFURA_GATEWAY } from "@/lib/constants";
import { Account, evmAddress, PublicClient } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

const useArt = (lensClient: PublicClient, lensConnected: LensConnected) => {
  const [moreArtLoading, setMoreArtLoading] = useState<boolean>(false);
  const [moreArt, setMoreArt] = useState<NFTData[]>([]);

  const handleMoreCollections = async () => {
    setMoreArtLoading(true);
    try {
      const data = await getCollections(0);

      const metadataCache = new Map<string, any>();
      const profileCache = new Map<string, Account>();

      let colls = await Promise.all(
        data?.data?.collectionCreateds?.map(async (col: any) => {
          if (!col?.metadata) {
            if (!metadataCache.has(col?.uri)) {
              const cadena = await fetch(
                `${INFURA_GATEWAY}/ipfs/${col?.uri.split("ipfs://")?.[1]}`
              );
              const metadata = await cadena.json();
              metadataCache.set(col?.uri, metadata);
            }
            col.metadata = metadataCache.get(col?.uri);
          }

          const artistAddress = evmAddress(col?.artist);
          if (!profileCache.has(artistAddress)) {
            const result = await fetchAccountsAvailable(
              lensConnected?.sessionClient || lensClient,
              {
                managedBy: artistAddress,
                includeOwned: true,
              }
            );

            if (result.isErr()) {
              setMoreArtLoading(false);
              return;
            }

            profileCache.set(artistAddress, result.value.items?.[0]?.account);
          }

          return {
            id: Number(col?.id),
            image: col?.metadata?.image,
            artist: col?.artist,
            profile: profileCache.get(artistAddress),
          };
        })
      );

      setMoreArt(colls);
    } catch (err: any) {
      console.error(err.message);
    }
    setMoreArtLoading(false);
  };

  useEffect(() => {
    if (moreArt?.length < 1 && lensClient) {
      handleMoreCollections();
    }
  }, [lensClient]);

  return {
    moreArtLoading,
    moreArt,
  };
};

export default useArt;
