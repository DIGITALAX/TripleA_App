import { LensConnected } from "@/components/Common/types/common.types";
import {
  Agent,
  AgentCollection,
} from "@/components/Dashboard/types/dashboard.types";
import {
  Account,
  AccountStats,
  evmAddress,
  PageSize,
  Post,
  PublicClient,
  TextOnlyMetadata,
} from "@lens-protocol/client";
import { SetStateAction, useEffect, useState } from "react";
import { getAgent } from "../../../../graphql/queries/getAgent";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
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
      } else {
        const postsRes = await fetchPosts(
          lensConnected?.sessionClient || lensClient,
          {
            pageSize: PageSize.Fifty,
            filter: {
              authors: [agentInput ? agentInput : agent?.profile?.address],
            },
          }
        );
        if (postsRes.isErr()) {
          return;
        }

        posts = postsRes?.value?.items?.filter((pos: any) =>
          (pos?.metadata as TextOnlyMetadata)?.tags?.includes("tripleA")
        ) as Post[];
      }

      posts = await Promise.all(
        posts?.map(async (post) => {
          let picture = post?.author?.metadata?.picture;

          if (post?.author?.metadata?.picture) {
            const cadena = await fetch(
              `${STORAGE_NODE}/${
                post?.author?.metadata?.picture?.split("lens://")?.[1]
              }`
            );

            if (cadena) {
              const json = await cadena.json();
              picture = json.item;
            }
          }

          return {
            ...post,
            author: {
              ...post?.author,
              metadata: {
                ...post?.author?.metadata,
                picture,
              },
            },
          } as Post;
        })
      );

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
          managedBy: evmAddress(res?.data?.agentCreateds?.[0]?.wallets?.[0]),
        }
      );
      let picture = "";
      let profile: any;

      if (result.isErr()) {
        setAgentLoading(false);
        return;
      }

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

      profile = {
        ...result.value.items?.[0]?.account,
        metadata: {
          ...result.value.items?.[0]?.account?.metadata,
          picture,
        },
      };
      const resultOwner = await fetchAccountsAvailable(
        lensConnected?.sessionClient || lensClient,
        {
          managedBy: evmAddress(res?.data?.agentCreateds?.[0]?.creator),
        }
      );
      let ownerPicture = "";
      let ownerProfile: any;
      if (resultOwner.isOk()) {
        const cadena = await fetch(
          `${STORAGE_NODE}/${
            resultOwner.value.items?.[0]?.account?.metadata?.picture?.split(
              "lens://"
            )?.[1]
          }`
        );

        if (cadena) {
          const json = await cadena.json();
          ownerPicture = json.item;
        }

        ownerProfile = {
          ...resultOwner.value.items?.[0]?.account,
          metadata: {
            ...resultOwner.value.items?.[0]?.account?.metadata,
            picture: ownerPicture,
          },
        };
      }

      const posts = await handleActivity(
        false,
        result.value.items?.[0]?.account?.address
      );

      let activeCollectionIds: AgentCollection[] =
        res?.data?.agentCreateds?.[0]?.activeCollectionIds || [];
      let collectionIdsHistory: AgentCollection[] =
        res?.data?.agentCreateds?.[0]?.collectionIdsHistory || [];
      let details: any[] = res?.data?.agentCreateds?.[0]?.details || [];

      await Promise.all(
        activeCollectionIds?.map(async (id: any) => {
          const result = await fetchAccountsAvailable(lensClient, {
            managedBy: evmAddress(id?.artist),
          });

          if (result.isErr()) {
            setAgentLoading(false);
            return;
          }

          activeCollectionIds.push({
            profile: result?.value.items[0]?.account as Account,
            collectionId: id?.collectionId,
            metadata: id?.metadata,
          });
        })
      );

      await Promise.all(
        collectionIdsHistory?.map(async (id: any) => {
          const result = await fetchAccountsAvailable(
            lensConnected?.sessionClient || lensClient,
            {
              managedBy: evmAddress(id?.artist),
            }
          );
          if (result.isErr()) {
            setAgentLoading(false);
            return;
          }

          collectionIdsHistory.push({
            profile: result?.value.items[0]?.account as Account,
            collectionId: id?.collectionId,
            metadata: id?.metadata,
          });
        })
      );

      await Promise.all(
        details?.map(async (id: any) => {
          const col = await getCollectionArtist(Number(id?.collectionId));

          const result = await fetchAccountsAvailable(
            lensConnected?.sessionClient || lensClient,
            {
              managedBy: evmAddress(col?.data?.collectionCreateds?.[0]?.artist),
            }
          );

          if (result.isErr()) {
            setAgentLoading(false);
            return;
          }
          details.push({
            profile: result?.value.items[0]?.account as Account,
            collectionId: id?.collectionId,
            instructions: id?.instructions,
            publishFrequency: Number(id?.publishFrequency),
            leadFrequency: Number(id?.leadFrequency),
            remixFrequency: Number(id?.remixFrequency),
            remix: id?.remix,
            lead: id?.lead,
            publish: id?.publish,
            tokens: col?.data?.collectionCreateds?.[0]?.tokens,
            metadata: {
              image: col?.data?.collectionCreateds?.[0]?.metadata?.image,
              title: col?.data?.collectionCreateds?.[0]?.metadata?.title,
            },
          });
        })
      );

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

      setAgentRent(rent?.data?.rentPaids);

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
        wallet: res?.data?.agentCreateds?.[0]?.wallets?.[0],
        balance: res?.data?.agentCreateds?.[0]?.balances,
        owners: res?.data?.agentCreateds?.[0]?.owners,
        creator: res?.data?.agentCreateds?.[0]?.creator,
        details,
        profile,
        activity: posts || [],
        activeCollectionIds,
        collectionIdsHistory,
        accountConnected: result?.value.items[0]?.account?.address,
        ownerProfile,
        feeds: metadata?.feeds,
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
      } else {
        const postsRes = await fetchPosts(
          lensConnected?.sessionClient || lensClient,
          {
            pageSize: PageSize.Fifty,
            filter: {
              authors: [agent?.profile?.address],
            },
          }
        );

        if (postsRes.isErr()) {
          setAgentLoading(false);
          return;
        }

        posts = postsRes.value?.items?.filter((pos: any) =>
          (pos?.metadata as TextOnlyMetadata)?.tags?.includes("tripleA")
        ) as Post[];
      }

      if (postsRes?.value.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor(postsRes?.value.pageInfo?.next);
      } else {
        setHasMore(false);
        setActivityCursor(undefined);
      }

      posts = await Promise.all(
        posts?.map(async (post) => {
          let picture = post?.author?.metadata?.picture;

          if (post?.author?.metadata?.picture) {
            const cadena = await fetch(
              `${STORAGE_NODE}/${
                post?.author?.metadata?.picture?.split("lens://")?.[1]
              }`
            );

            if (cadena) {
              const json = await cadena.json();
              picture = json.item;
            }
          }

          return {
            ...post,
            author: {
              ...post?.author,
              metadata: {
                ...post?.author?.metadata,
                picture,
              },
            },
          } as Post;
        })
      );

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
