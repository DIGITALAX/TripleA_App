import { useEffect, useState } from "react";
import { Order } from "../types/dashboard.types";
import { getSales } from "../../../../graphql/queries/getSales";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import { STORAGE_NODE } from "@/lib/constants";
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
      const sales: Order[] = await Promise.all(
        data?.data?.collectionPurchaseds?.map(async (sale: any) => {
          const result = await fetchAccountsAvailable(lensClient, {
            managedBy: evmAddress(sale?.collection?.artist),
            includeOwned: true,
          });

          if (result.isErr()) {
            setSalesLoading(false);
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
