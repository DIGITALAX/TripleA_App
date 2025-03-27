import { useEffect, useState } from "react";
import { Order } from "../types/dashboard.types";
import { getSales } from "../../../../graphql/queries/getSales";
import { Account, evmAddress, PublicClient } from "@lens-protocol/client";
import { INFURA_GATEWAY } from "@/lib/constants";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

const useSales = (
  address: `0x${string}` | undefined,
  lensClient: PublicClient
) => {
  const [salesLoading, setSalesLoading] = useState<boolean>(false);
  const [allSales, setAllSales] = useState<Order[]>([]);

  const handleSales = async () => {
    if (!address) return;
    setSalesLoading(true);
    try {
      const data = await getSales(address);

      const metadataCache = new Map<string, any>();
      const profileCache = new Map<string, Account>();
      const sales: Order[] = await Promise.all(
        data?.data?.collectionPurchaseds?.map(async (sale: any) => {
          const artistAddress = evmAddress(sale?.collection?.artist);

          if (!profileCache.has(artistAddress)) {
            const result = await fetchAccountsAvailable(lensClient, {
              managedBy: artistAddress,
              includeOwned: true,
            });

            if (result.isErr()) {
              setSalesLoading(false);
              return null;
            }

            profileCache.set(artistAddress, result.value.items?.[0]?.account);
          }

          const profile = profileCache.get(artistAddress);

          if (!sale?.collection?.metadata) {
            const metadataUri =
              sale?.collection?.uri?.split("ipfs://")?.[1] || "";
            if (metadataUri && !metadataCache.has(metadataUri)) {
              const response = await fetch(
                `${INFURA_GATEWAY}/ipfs/${metadataUri}`
              );
              const metadata = await response.json();
              metadataCache.set(metadataUri, metadata);
            }
            sale.collection.metadata = metadataCache.get(metadataUri);
          }

          return {
            id: sale?.id,
            totalPrice: sale?.totalPrice,
            token: sale?.paymentToken,
            amount: sale?.amount,
            collectionId: sale?.collectionId,
            mintedTokenIds: sale?.mintedTokens,
            blockTimestamp: sale?.blockTimestamp,
            transactionHash: sale?.transactionHash,
            collection: {
              id: sale?.collection?.id,
              image: sale?.collection?.metadata?.image,
              title: sale?.collection?.metadata?.title,
            },
            buyer: sale?.buyer,
            profile,
          };
        })
      );

      setAllSales(sales);
    } catch (err: any) {
      console.error(err.message);
    }
    setSalesLoading(false);
  };

  useEffect(() => {
    if (allSales?.length < 1 && lensClient && address) {
      handleSales();
    }
  }, [lensClient, address]);

  return {
    allSales,
    salesLoading,
  };
};

export default useSales;
