import { NFTData } from "@/components/Common/types/common.types";
import { useContext, useEffect, useState } from "react";
import { getCollections } from "../../../../graphql/queries/getGallery";
import { INFURA_GATEWAY } from "@/lib/constants";
import { Account, evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { ModalContext } from "@/app/providers";

const useArt = () => {
  const context = useContext(ModalContext);
  const [moreArtLoading, setMoreArtLoading] = useState<boolean>(false);
  const [moreArt, setMoreArt] = useState<NFTData[]>([]);

  const handleMoreCollections = async () => {
    setMoreArtLoading(true);
    try {
      const data = await getCollections(
        [0, 10, 20, 25, 30][Math.floor(Math.random() * 5)]
      );

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
              context?.lensConnected?.sessionClient || context?.lensClient!,
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
    if (moreArt?.length < 1 && context?.lensClient) {
      handleMoreCollections();
    }
  }, [context?.lensClient]);

  return {
    moreArtLoading,
    moreArt,
  };
};

export default useArt;
