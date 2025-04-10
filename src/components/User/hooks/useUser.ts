import { NFTData } from "@/components/Common/types/common.types";
import {
  Agent,
  DropInterface,
} from "@/components/Dashboard/types/dashboard.types";
import { Account, AccountStats } from "@lens-protocol/client";
import { useContext, useEffect, useState } from "react";
import { getDropCollections } from "../../../../graphql/queries/getDropCollections";
import { getUserAgentsPaginated } from "../../../../graphql/queries/getUserAgentsPaginated";
import { getOrdersPaginated } from "../../../../graphql/queries/getOrdersPaginated";
import { fetchAccount, fetchAccountStats } from "@lens-protocol/client/actions";
import { ModalContext } from "@/app/providers";

const useUser = (username: string) => {
  const context = useContext(ModalContext);
  const [screen, setScreen] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<
    | (Account & {
        stats: AccountStats;
      })
    | undefined
  >();
  const [collected, setCollected] = useState<NFTData[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [drops, setDrops] = useState<DropInterface[]>([]);
  const [hasMore, setHasMore] = useState<{
    agents: boolean;
    drops: boolean;
    collected: boolean;
  }>({
    agents: true,
    drops: true,
    collected: true,
  });
  const [paginated, setPaginated] = useState<{
    agents: number;
    drops: number;
    collected: number;
  }>({
    agents: 0,
    drops: 0,
    collected: 0,
  });
  const [infoLoading, setInfoLoading] = useState<boolean>(false);
  const [itemsLoading, setItemsLoading] = useState<boolean>(false);

  const handleUserInfo = async () => {
    setInfoLoading(true);
    try {
      const newAcc = await fetchAccount(context?.lensClient!, {
        username: {
          localName: username,
        },
      });
      let ownerProfile: any;

      if (newAcc.isErr()) {
        setInfoLoading(false);
        return;
      }

      const stats = await fetchAccountStats(context?.lensClient!, {
        account: newAcc.value?.owner,
      });

      if (stats.isErr()) {
        setInfoLoading(false);
        return;
      }

      ownerProfile = newAcc.value;

      if (newAcc.value?.owner) {
        setUserInfo(ownerProfile);
      }

      handleItems(ownerProfile);
    } catch (err: any) {
      console.error(err.message);
    }
    setInfoLoading(false);
  };

  const handleItems = async (
    info: Account & {
      stats: AccountStats;
    }
  ) => {
    if (!info) return;
    setItemsLoading(true);
    try {
      const agents = await getUserAgentsPaginated(info?.owner, 0);
      const drops = await getDropCollections(info?.owner, 0);
      const collected = await getOrdersPaginated(info?.owner, 0);

      setHasMore({
        agents: agents?.data?.agentCreateds?.length == 20 ? true : false,
        collected:
          collected?.data?.collectionPurchaseds?.length == 20 ? true : false,
        drops: drops?.data?.dropCreateds?.length == 20 ? true : false,
      });

      setPaginated({
        agents:
          agents?.data?.agentCreateds?.length == 20
            ? paginated?.agents + 20
            : paginated?.agents,
        collected:
          collected?.data?.collectionPurchaseds?.length == 20
            ? paginated?.collected + 20
            : paginated?.collected,
        drops:
          drops?.data?.dropCreateds?.length == 20
            ? paginated?.drops + 20
            : paginated?.drops,
      });

      setCollected(collected?.data?.collectionPurchaseds);
      setAgents(agents?.data?.agentCreateds);
      setDrops(drops?.data?.dropCreateds);
    } catch (err: any) {
      console.error(err.message);
    }
    setItemsLoading(false);
  };

  const handleMoreItems = async () => {
    setItemsLoading(true);
    try {
      let hasMoreCollected: boolean = false,
        hasMoreDrops: boolean = false,
        hasMoreAgents: boolean = false,
        paginatedCollected: number = 0,
        paginatedAgents: number = 0,
        paginatedDrops: number = 0;

      if (hasMore.collected) {
        const collectedData = await getOrdersPaginated(
          userInfo?.owner,
          paginated?.agents
        );
        setCollected([
          ...collected,
          ...(collectedData?.data?.collectionPurchaseds || []),
        ] as any);

        if (collectedData?.data?.collectionPurchaseds?.length == 20) {
          hasMoreCollected = true;
          paginatedCollected = paginated?.collected + 20;
        }
      }

      if (hasMore.drops) {
        const dropsData = await getDropCollections(
          userInfo?.owner,
          paginated?.drops
        );
        setDrops([...drops, ...(dropsData?.data?.dropCreateds || [])] as any);

        if (dropsData?.data?.dropCreateds?.length == 20) {
          hasMoreDrops = true;
          paginatedDrops = paginated?.drops + 20;
        }
      }

      if (hasMore.agents) {
        const agentsData = await getUserAgentsPaginated(
          userInfo?.owner,
          paginated?.agents
        );
        setAgents([
          ...agents,
          ...(agentsData?.data?.agentCreateds || []),
        ] as any);

        if (agentsData?.data?.agentCreateds?.length == 20) {
          hasMoreAgents = true;
          paginatedAgents = paginated?.agents + 20;
        }
      }

      setHasMore({
        collected: hasMoreCollected,
        agents: hasMoreAgents,
        drops: hasMoreDrops,
      });

      setPaginated({
        collected: paginatedCollected,
        agents: paginatedAgents,
        drops: paginatedDrops,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setItemsLoading(false);
  };

  useEffect(() => {
    if (username && context?.lensClient) {
      handleUserInfo();
    }
  }, [username, context?.lensClient]);

  return {
    screen,
    setScreen,
    userInfo,
    drops,
    collected,
    agents,
    infoLoading,
    itemsLoading,
    handleMoreItems,
    hasMore,
  };
};

export default useUser;
