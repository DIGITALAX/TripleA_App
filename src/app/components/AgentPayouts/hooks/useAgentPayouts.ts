import { useContext, useEffect, useState } from "react";
import { getOwnersPaid } from "./../../../../../graphql/queries/getOwnersPaid";
import { getCollectorsPaid } from "./../../../../../graphql/queries/getCollectorsPaid";
import { Account, evmAddress, PublicClient } from "@lens-protocol/client";
import { INFURA_GATEWAY } from "@/lib/constants";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { getDevTreasuryPaid } from "./../../../../../graphql/queries/getDevTreasuryPaid";
import { getArtistPaid } from "./../../../../../graphql/queries/getArtistsPaid";
import { ModalContext } from "@/providers";

const useAgentPayouts = () => {
  const context = useContext(ModalContext);
  const accountCache = new Map<string, any>();
  const metadataCache = new Set<string>();
  const [screen, setScreen] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ownersPaid, setOwnersPaid] = useState<
    {
      amount: number;
      blockTimestamp: string;
      owner: string;
      token: string;
      transactionHash: string;
      profile?: Account;
      collection: {
        uri: string;
        artist: string;
        collectionId: string;
        metadata: {
          image: string;
        };
      };
    }[]
  >([]);
  const [artistsPaid, setArtistsPaid] = useState<
    {
      amount: number;
      blockTimestamp: string;
      artist: string;
      token: string;
      transactionHash: string;
      profile?: Account;
      collection: {
        uri: string;
        artist: string;
        collectionId: string;
        metadata: {
          image: string;
        };
      };
    }[]
  >([]);
  const [collectorsPaid, setCollectorsPaid] = useState<
    {
      amount: number;
      blockTimestamp: string;
      collector: string;
      token: string;
      transactionHash: string;
      profile?: Account;
      collection: {
        uri: string;
        artist: string;
        collectionId: string;
        metadata: {
          image: string;
        };
      };
    }[]
  >([]);
  const [devTreasuryPaid, setDevTreasuryPaid] = useState<
    {
      amount: number;
      blockTimestamp: string;
      collector: string;
      token: string;
      transactionHash: string;
      collection: {
        uri: string;
        artist: string;
        collectionId: string;
        metadata: {
          image: string;
        };
      };
    }[]
  >([]);

  const [hasMore, setHasMore] = useState<{
    owners: boolean;
    collectors: boolean;
    dev: boolean;
    artists: boolean;
  }>({
    owners: true,
    collectors: true,
    dev: true,
    artists: true,
  });
  const [paginated, setPaginated] = useState<{
    owners: number;
    collectors: number;
    dev: number;
    artists: number;
  }>({
    owners: 0,
    collectors: 0,
    dev: 0,
    artists: 0,
  });

  const fetchAccountData = async (artist: string) => {
    if (accountCache.has(artist)) return accountCache.get(artist);

    const result = await fetchAccountsAvailable(context?.lensClient!, {
      managedBy: evmAddress(artist),
      includeOwned: true,
    });

    if (result.isErr()) {
      setOrdersLoading(false);
      return null;
    }

    const accountData = result.value.items?.[0]?.account;

    accountCache.set(artist, accountData);
    return accountData;
  };

  const fetchMetadata = async (collection: any) => {
    const uri = collection?.uri.split("ipfs://")?.[1];
    if (!uri || metadataCache.has(uri)) return;

    const cadena = await fetch(`${INFURA_GATEWAY}/ipfs/${uri}`);
    collection.metadata = await cadena.json();
    metadataCache.add(uri);
  };

  const handleOrderPayments = async () => {
    setOrdersLoading(true);
    try {
      const owners = await getOwnersPaid(0);
      const collectors = await getCollectorsPaid(0);
      const dev = await getDevTreasuryPaid(0);
      const artists = await getArtistPaid(0);

      setHasMore({
        collectors:
          collectors?.data?.collectorPaids?.length < 20 ? false : true,
        owners: owners?.data?.ownerPaids?.length < 20 ? false : true,
        dev: dev?.data?.devTreasuryPaids?.length < 20 ? false : true,
        artists: artists?.data?.artistPaids?.length < 20 ? false : true,
      });

      setPaginated({
        collectors:
          collectors?.data?.collectorPaids?.length == 20
            ? paginated?.collectors + 20
            : paginated?.collectors,
        owners:
          owners?.data?.ownerPaids?.length == 20
            ? paginated?.owners + 20
            : paginated?.owners,
        dev:
          dev?.data?.devTreasuryPaids?.length == 20
            ? paginated?.dev + 20
            : paginated?.dev,
        artists:
          artists?.data?.artistPaids?.length == 20
            ? paginated?.artists + 20
            : paginated?.artists,
      });

      let collectors_info = await Promise.all(
        (collectors?.data?.collectorPaids || [])?.map(async (collect: any) => {
          const profile = await fetchAccountData(collect?.collection?.artist);
          await fetchMetadata(collect?.collection);

          return {
            amount: collect?.amount,
            blockTimestamp: collect?.blockTimestamp,
            collector: collect?.collector,
            token: collect?.token,
            transactionHash: collect?.transactionHash,
            collection: collect?.collection,
            profile,
          };
        })
      );

      let owners_info = await Promise.all(
        (owners?.data?.ownerPaids || [])?.map(async (owner: any) => {
          const profile = await fetchAccountData(owner?.collection?.artist);
          await fetchMetadata(owner?.collection);

          return {
            amount: owner?.amount,
            blockTimestamp: owner?.blockTimestamp,
            owner: owner?.owner,
            token: owner?.token,
            transactionHash: owner?.transactionHash,
            collection: owner?.collection,
            profile,
          };
        })
      );

      let devs_info = await Promise.all(
        (owners?.data?.devTreasuryPaids || [])?.map(async (dev: any) => {
          await fetchMetadata(dev?.collection);
          return {
            amount: dev?.amount,
            blockTimestamp: dev?.blockTimestamp,
            token: dev?.token,
            transactionHash: dev?.transactionHash,
            collection: dev?.collection,
          };
        })
      );

      let artists_info = await Promise.all(
        (artists?.data?.artistPaids || [])?.map(async (collect: any) => {
          const profile = await fetchAccountData(collect?.collection?.artist);
          await fetchMetadata(collect?.collection);

          return {
            amount: collect?.amount,
            blockTimestamp: collect?.blockTimestamp,
            artist: collect?.forArtist,
            token: collect?.token,
            transactionHash: collect?.transactionHash,
            collection: collect?.collection,
            profile,
          };
        })
      );

      setOwnersPaid(owners_info);
      setCollectorsPaid(collectors_info);
      setDevTreasuryPaid(devs_info);
      setArtistsPaid(artists_info);
    } catch (err: any) {
      console.error(err.message);
    }
    setOrdersLoading(false);
  };

  const handleMorePaid = async () => {
    try {
      let hasMoreOwner: boolean = false,
        hasMoreCollector: boolean = false,
        hasMoreDev: boolean = false,
        hasMoreArtist: boolean = false,
        paginatedOwner: number = paginated.owners,
        paginatedCollector: number = paginated.collectors,
        paginatedDev: number = paginated.dev,
        paginatedArtist: number = paginated.artists;

      if (hasMore.collectors) {
        const collectors = await getCollectorsPaid(paginatedCollector);

        let collectors_info = await Promise.all(
          collectors?.data?.collectorPaids?.map(async (collect: any) => {
            const profile = await fetchAccountData(collect?.collection?.artist);
            await fetchMetadata(collect?.collection);

            return {
              amount: collect?.amount,
              blockTimestamp: collect?.blockTimestamp,
              collector: collect?.collector,
              token: collect?.token,
              transactionHash: collect?.transactionHash,
              collection: collect?.collection,
              profile,
            };
          })
        );

        setCollectorsPaid([...collectorsPaid, ...collectors_info] as any);

        if (collectors?.data?.collectorPaids?.length == 20) {
          hasMoreCollector = true;
          paginatedCollector = paginated?.collectors + 20;
        }
      }

      if (hasMore.artists) {
        const artists = await getArtistPaid(paginatedArtist);

        let artists_info = await Promise.all(
          artists?.data?.artistPaids?.map(async (collect: any) => {
            const profile = await fetchAccountData(collect?.collection?.artist);
            await fetchMetadata(collect?.collection);

            return {
              amount: collect?.amount,
              blockTimestamp: collect?.blockTimestamp,
              artist: collect?.forArtist,
              token: collect?.token,
              transactionHash: collect?.transactionHash,
              collection: collect?.collection,
              profile,
            };
          })
        );

        setArtistsPaid([...artistsPaid, ...artists_info] as any);

        if (artists?.data?.artistPaids?.length == 20) {
          hasMoreArtist = true;
          paginatedArtist = paginated?.artists + 20;
        }
      }

      if (hasMore.owners) {
        const owners = await getOwnersPaid(paginated.owners);

        let owners_info = await Promise.all(
          owners?.data?.ownerPaids?.map(async (owner: any) => {
            const profile = await fetchAccountData(owner?.collection?.artist);
            await fetchMetadata(owner?.collection);

            return {
              amount: owner?.amount,
              blockTimestamp: owner?.blockTimestamp,
              owner: owner?.owner,
              token: owner?.token,
              transactionHash: owner?.transactionHash,
              collection: owner?.collection,
              profile,
            };
          })
        );

        setOwnersPaid([...ownersPaid, ...owners_info] as any);

        if (owners?.data?.agentOwnerPaids?.length == 20) {
          hasMoreOwner = true;
          paginatedOwner = paginated?.collectors + 20;
        }
      }

      if (hasMore.dev) {
        const dev = await getDevTreasuryPaid(paginated.dev);

        let dev_info = await Promise.all(
          dev?.data?.devTreasuryPaids?.map(async (owner: any) => {
            await fetchMetadata(owner?.collection);

            return {
              amount: owner?.amount,
              blockTimestamp: owner?.blockTimestamp,
              token: owner?.token,
              transactionHash: owner?.transactionHash,
              collection: owner?.collection,
            };
          })
        );

        setDevTreasuryPaid([...devTreasuryPaid, ...dev_info] as any);

        if (dev?.data?.devTreasuryPaids?.length == 20) {
          hasMoreDev = true;
          paginatedDev = paginated?.dev + 20;
        }
      }

      setHasMore({
        owners: hasMoreOwner,
        collectors: hasMoreCollector,
        dev: hasMoreDev,
        artists: hasMoreArtist,
      });

      setPaginated({
        owners: paginatedOwner,
        collectors: paginatedCollector,
        dev: paginatedDev,
        artists: paginatedArtist,
      });
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (
      ownersPaid?.length < 1 &&
      collectorsPaid?.length < 1 &&
      context?.lensClient
    ) {
      handleOrderPayments();
    }
  }, [context?.lensClient]);

  return {
    screen,
    setScreen,
    ordersLoading,
    ownersPaid,
    collectorsPaid,
    hasMore,
    handleMorePaid,
    devTreasuryPaid,
    artistsPaid,
  };
};

export default useAgentPayouts;
