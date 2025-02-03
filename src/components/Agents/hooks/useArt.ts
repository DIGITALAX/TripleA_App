import { LensConnected, NFTData } from "@/components/Common/types/common.types";
import { useEffect, useState } from "react";
import { getCollections } from "../../../../graphql/queries/getGallery";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { evmAddress, PublicClient } from "@lens-protocol/client";

const useArt = (lensClient: PublicClient, lensConnected: LensConnected) => {
  const [moreArtLoading, setMoreArtLoading] = useState<boolean>(false);
  const [moreArt, setMoreArt] = useState<NFTData[]>([]);

  const handleMoreCollections = async () => {
    setMoreArtLoading(true);
    try {
      const data = await getCollections(0);

      let colls = await Promise.all(
        data?.data?.collectionCreateds?.map(async (col: any) => {
          if (!col?.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${col?.uri.split("ipfs://")?.[1]}`
            );
            col.metadata = await cadena.json();
          }

          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(col?.artist),
            },
            lensConnected?.sessionClient || lensClient
          );

          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${
              (result as any)?.[0]?.account?.metadata?.picture?.split(
                "lens://"
              )?.[1]
            }`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          return {
            id: Number(col?.id),
            image: col?.metadata?.image,
            artist: col?.artist,
            profile: {
              ...(result as any)?.[0]?.account,
              metadata: {
                ...(result as any)?.[0]?.account?.metadata,
                picture,
              },
            },
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
