import { LensConnected } from "@/components/Common/types/common.types";
import {
  Agent,
  AgentCollection,
  Balance,
  Worker,
} from "@/components/Dashboard/types/dashboard.types";
import {
  Account,
  AccountStats,
  evmAddress,
  PageSize,
  Post,
  PublicClient,
} from "@lens-protocol/client";
import { SetStateAction, useEffect, useState } from "react";
import { getAgent } from "../../../../graphql/queries/getAgent";
import { INFURA_GATEWAY } from "@/lib/constants";
import { getAgentRent } from "../../../../graphql/queries/getAgentRent";
import { getCollectionArtist } from "../../../../graphql/queries/getCollectionArtist";
import {
  fetchAccountsAvailable,
  fetchAccountStats,
  fetchPosts,
  follow,
  unfollow,
} from "@lens-protocol/client/actions";

const useAgent = (
  id: string | undefined,
  lensClient: PublicClient,
  lensConnected: LensConnected | undefined,
  setNotification: (e: SetStateAction<string | undefined>) => void,
  setSignless: (e: SetStateAction<boolean>) => void
) => {
  const [screen, setScreen] = useState<number>(0);
  const [agent, setAgent] = useState<Agent | undefined>();
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [activityCursor, setActivityCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [stats, setStats] = useState<AccountStats>();
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [agentRent, setAgentRent] = useState<
    {
      amounts: string[];
      collectionIds: string[];
      tokens: string;
      blockTimestamp: string;
      transactionHash: string;
    }[]
  >([]);

  const handleFollow = async () => {
    if (!lensConnected?.sessionClient) return;
    setFollowLoading(true);
    try {
      if (agent?.profile?.operations?.isFollowedByMe) {
        const res = await unfollow(lensConnected?.sessionClient, {
          account: evmAddress(agent?.profile?.address),
        });

        if (res.isErr()) {
          setNotification("Something went wrong. Try again? :/");
          setFollowLoading(false);
          return;
        }

        if (
          (res.value as any)?.reason?.includes(
            "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
          )
        ) {
          setSignless?.(true);
        } else if ((res.value as any)?.hash) {
          setNotification("Unfollowed!");
          setStats({
            ...stats!,
            graphFollowStats: {
              ...stats?.graphFollowStats!,
              followers:
                Number(stats?.graphFollowStats?.followers) > 0
                  ? Number(stats?.graphFollowStats?.followers) - 1
                  : 0,
            },
          });
          setAgent({
            ...agent!,
            profile: {
              ...agent?.profile!,
              operations: {
                ...agent?.profile?.operations!,
                isFollowedByMe: false,
              },
            },
          });
        }
      } else {
        const res = await follow(lensConnected?.sessionClient, {
          account: evmAddress(agent?.profile?.address),
        });

        if (res.isErr()) {
          setNotification("Something went wrong. Try again? :/");
          setFollowLoading(false);

          return;
        }

        if (
          (res.value as any)?.reason?.includes(
            "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
          )
        ) {
          setSignless?.(true);
        } else if ((res.value as any)?.hash) {
          setNotification("Followed!");
          setStats({
            ...stats!,
            graphFollowStats: {
              ...stats?.graphFollowStats!,
              followers: Number(stats?.graphFollowStats?.followers) + 1,
            },
          });
          setAgent({
            ...agent!,
            profile: {
              ...agent?.profile!,
              operations: {
                ...agent?.profile?.operations!,
                isFollowedByMe: true,
              },
            },
          });
        }
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setFollowLoading(false);
  };

  const handleActivity = async (
    reset: boolean,
    agentInput?: string
  ): Promise<Post[] | void> => {
    try {
      const postsRes = await fetchPosts(
        lensConnected?.sessionClient || lensClient,
        {
          pageSize: PageSize.Fifty,
          filter: {
            authors: [agentInput ? agentInput : agent?.profile?.address],
            metadata: {
              tags: {
                oneOf: ["tripleA"],
              },
            },
          },
        }
      );

      if (postsRes.isErr()) {
        return;
      }

      let posts: Post[] = [];

      if (postsRes?.value?.items?.length > 0) {
        posts = postsRes?.value?.items as Post[];
      }

      if (postsRes.value?.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor(postsRes.value?.pageInfo?.next);
      } else {
        setHasMore(false);
        setActivityCursor(undefined);
      }

      if (!reset) {
        return posts;
      } else {
        setAgent({
          ...agent!,
          activity: posts || [],
        });
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleAgent = async () => {
    if (!id) return;

    setAgentLoading(true);
    try {
      const res = await getAgent(Number(id));
      let metadata: any = res?.data?.agentCreateds?.[0]?.metadata;
      if (!metadata) {
        const cadena = await fetch(
          `${INFURA_GATEWAY}/ipfs/${
            res?.data?.agentCreateds?.[0]?.uri?.includes("ipfs://")
              ? res?.data?.agentCreateds?.[0]?.uri?.split("ipfs://")?.[1]
              : res?.data?.agentCreateds?.[0]?.uri
          }`
        );
        metadata = await cadena.json();
      }

      const result = await fetchAccountsAvailable(
        lensConnected?.sessionClient || lensClient,
        {
          managedBy: evmAddress(res?.data?.agentCreateds?.[0]?.creator),
          includeOwned: true,
        }
      );
      let profile: any;

      if (result.isErr()) {
        setAgentLoading(false);
        return;
      }

      profile = result.value.items?.[0]?.account;
      const resultOwner = await fetchAccountsAvailable(
        lensConnected?.sessionClient || lensClient,
        {
          managedBy: evmAddress(res?.data?.agentCreateds?.[0]?.creator),
          includeOwned: true,
        }
      );
      let ownerProfile: any;
      if (resultOwner.isOk()) {
        ownerProfile = resultOwner.value.items?.[0]?.account;
      }

      const posts = await handleActivity(
        false,
        result.value.items?.[0]?.account?.address
      );

      let activeCollectionIds: AgentCollection[] =
        res?.data?.agentCreateds?.[0]?.activeCollectionIds || [];
      let collectionIdsHistory: AgentCollection[] =
        res?.data?.agentCreateds?.[0]?.collectionIdsHistory || [];
      let workers: Worker[] = res?.data?.agentCreateds?.[0]?.workers || [];
      let balances: Balance[] = res?.data?.agentCreateds?.[0]?.balances || [];

      const metadataCache = new Map<string, any>();
      const profileCache = new Map<string, Account>();

      workers = (await Promise.all(
        workers?.map(async (id) => {
          const col = await getCollectionArtist(Number(id?.collectionId));

          let profile = profileCache.get(
            col?.data?.collectionCreateds?.[0]?.artist
          );
          if (!profile) {
            const result = await fetchAccountsAvailable(
              lensConnected?.sessionClient || lensClient,
              {
                managedBy: col?.data?.collectionCreateds?.[0]?.artist,
                includeOwned: true,
              }
            );

            if (result.isErr()) {
              setAgentLoading(false);
              return;
            }

            profile = result?.value.items[0]?.account as Account;
            profileCache.set(
              col?.data?.collectionCreateds?.[0]?.artist,
              profile
            );
          }

          let metadata = (id as any)?.collection?.metadata;

          if (!metadata) {
            metadata = metadataCache.get((id as any)?.collection?.uri);

            if (!metadata) {
              const uri = (id as any)?.collection?.uri?.includes("ipfs://")
                ? (id as any)?.collection?.uri?.split("ipfs://")[1]
                : (id as any)?.collection?.uri;

              const cadena = await fetch(`${INFURA_GATEWAY}/ipfs/${uri}`);
              metadata = await cadena.json();
              metadataCache.set((id as any)?.collection?.uri, metadata);
            }
          }

          return {
            profile,
            collectionId: id?.collectionId,
            instructions: id?.instructions,
            publishFrequency: Number(id?.publishFrequency),
            leadFrequency: Number(id?.leadFrequency),
            remixFrequency: Number(id?.remixFrequency),
            mintFrequency: Number(id?.mintFrequency),
            remix: id?.remix,
            lead: id?.lead,
            mint: id?.mint,
            publish: id?.publish,
            tokens: id?.tokens,
            metadata,
          };
        })
      )) as Worker[];

      activeCollectionIds = (await Promise.all(
        activeCollectionIds?.map(async (id: any) => {
          const result = await fetchAccountsAvailable(lensClient, {
            managedBy: evmAddress(id?.artist),
            includeOwned: true,
          });

          if (result.isErr()) {
            setAgentLoading(false);
            return;
          }

          return {
            profile: result?.value.items[0]?.account as Account,
            collectionId: id?.collectionId,
            metadata: workers?.find(
              (worker) =>
                Number(worker?.collectionId) == Number(id?.collectionId)
            )?.metadata,
          };
        })
      )) as AgentCollection[];

      collectionIdsHistory = (await Promise.all(
        collectionIdsHistory?.map(async (id: any) => {
          const result = await fetchAccountsAvailable(
            lensConnected?.sessionClient || lensClient,
            {
              managedBy: evmAddress(id?.artist),
              includeOwned: true,
            }
          );
          if (result.isErr()) {
            setAgentLoading(false);
            return;
          }

          return {
            profile: result?.value.items[0]?.account as Account,
            collectionId: id?.collectionId,
            metadata: workers?.find(
              (worker) =>
                Number(worker?.collectionId) == Number(id?.collectionId)
            )?.metadata,
          };
        })
      )) as AgentCollection[];

      balances = balances?.map((balance) => {
        return {
          ...balance,
          image: workers?.find(
            (worker) =>
              Number(worker?.collectionId) == Number(balance?.collectionId)
          )?.metadata?.image,
        };
      }) as Balance[];

      const stats = await fetchAccountStats(
        lensConnected?.sessionClient || lensClient,
        {
          account: result.value.items?.[0]?.account?.owner,
        }
      );

      if (stats.isErr()) {
        setAgentLoading(false);
        return;
      }

      setStats(stats.value as AccountStats);
      const rent = await getAgentRent(
        Number(res?.data?.agentCreateds?.[0]?.SkyhuntersAgentManager_id)
      );

      setAgentRent(rent?.data?.agentPaidRents);
      setAgent({
        id: res?.data?.agentCreateds?.[0]?.SkyhuntersAgentManager_id,
        cover: metadata?.cover,
        title: metadata?.title,
        customInstructions: metadata?.customInstructions,
        bio: metadata?.bio,
        adjectives: metadata?.adjectives,
        style: metadata?.style,
        lore: metadata?.lore,
        knowledge: metadata?.knowledge,
        messageExamples: metadata?.messageExamples?.map(
          (messageExamples: string) => JSON.parse(messageExamples)
        ),
        wallets: res?.data?.agentCreateds?.[0]?.wallets,
        balances,
        owners: res?.data?.agentCreateds?.[0]?.owners,
        creator: res?.data?.agentCreateds?.[0]?.creator,
        workers,
        profile,
        activity: posts || [],
        activeCollectionIds,
        collectionIdsHistory,
        accountConnected: result?.value.items[0]?.account?.address,
        ownerProfile,
        feeds: metadata?.feeds,
        model: metadata?.model,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentLoading(false);
  };

  const handleMoreActivity = async () => {
    if (!hasMore || !activityCursor || !id) return;
    setAgentLoading(true);
    try {
      const postsRes = await fetchPosts(
        lensConnected?.sessionClient || lensClient,
        {
          pageSize: PageSize.Fifty,
          cursor: activityCursor,
          filter: {
            authors: [agent?.profile?.address],
            metadata: {
              tags: {
                oneOf: ["tripleA"],
              },
            },

            // authors: [agent?.accountConnected],
          },
        }
      );

      if (postsRes.isErr()) {
        setAgentLoading(false);
        return;
      }

      let posts: Post[] = [];

      if (postsRes?.value.items?.length > 0) {
        posts = postsRes?.value.items as Post[];
      }

      if (postsRes?.value.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor(postsRes?.value.pageInfo?.next);
      } else {
        setHasMore(false);
        setActivityCursor(undefined);
      }

      setAgent({
        ...(agent as Agent),
        activity: [...(agent?.activity || []), ...posts],
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentLoading(false);
  };

  useEffect(() => {
    if (id && !agent && lensClient) {
      handleAgent();
    }
  }, [id, lensClient]);

  return {
    agent,
    agentLoading,
    hasMore,
    handleMoreActivity,
    screen,
    setScreen,
    setAgent,
    handleActivity,
    stats,
    followLoading,
    handleFollow,
    agentRent,
  };
};

export default useAgent;
