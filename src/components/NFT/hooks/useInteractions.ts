import { Post } from "@lens-protocol/client";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { NFTData } from "@/components/Common/types/common.types";
import { Agent } from "@/components/Dashboard/types/dashboard.types";
import pollResult from "@/lib/helpers/pollResult";
import {
  addReaction,
  post as createPost,
  repost,
} from "@lens-protocol/client/actions";
import { textOnly } from "@lens-protocol/metadata";
import { immutable } from "@lens-chain/storage-client";
import { chains } from "@lens-chain/sdk/viem";
import { ModalContext } from "@/app/providers";

const useInteractions = (
  setData:
    | ((e: SetStateAction<NFTData | undefined>) => void)
    | ((e: SetStateAction<Agent | undefined>) => void)
    | ((e: SetStateAction<Post[]>) => void),
  data: NFTData | Agent | undefined | Post[],
  handlePosts: (bool: true) => Promise<Post[] | void>,
  setPostData?: (e: SetStateAction<Post[]>) => void,
  postId?: string | undefined
) => {
  const context = useContext(ModalContext);
  const [success, setSuccess] = useState<boolean>(false);
  const [post, setPost] = useState<string>("");
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [commentQuote, setCommentQuote] = useState<
    | {
        type: "Comment" | "Quote";
        id: string;
        post?: string;
      }
    | undefined
  >();

  const [interactionsLoading, setInteractionsLoading] = useState<
    {
      mirror: boolean;
      like: boolean;
      id: string;
    }[]
  >([]);
  const [interactionsLoadingPost, setInteractionsLoadingPost] = useState<
    {
      mirror: boolean;
      like: boolean;
      id: string;
    }[]
  >([
    {
      mirror: false,
      like: false,
      id: (data as Post[])?.[0]?.id,
    },
  ]);

  const handlePost = async () => {
    if (post?.trim() == "") return;
    setPostLoading(true);
    try {
      const schema = textOnly({
        content: post,
        tags: [
          "tripleA",
          (data as any)?.title
            ? (data as any)?.title?.replaceAll(" ", "")?.toLowerCase()
            : undefined,
        ]?.filter(Boolean),
      });
      const acl = immutable(chains.mainnet.id);
      const { uri } = await context?.storageClient?.uploadAsJson(schema, {
        acl,
      })!;

      const res = await createPost(context?.lensConnected?.sessionClient!, {
        contentUri: uri,
      });

      if (res.isErr()) {
        context?.setNotification?.("Something went wrong :( Try again?");
        setPostLoading(false);
        return;
      }

      if (
        (res.value as any)?.reason?.includes(
          "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
        )
      ) {
        context?.setSignless?.(true);
      } else if ((res.value as any)?.hash) {
        if (
          await pollResult(
            (res.value as any)?.hash,
            context?.lensConnected?.sessionClient!
          )
        ) {
          setSuccess(true);
          setPost("");
          context?.setIndexer?.("Post Indexing");
          await handlePosts(true);
        } else {
          context?.setNotification?.("Something went wrong :( Try again?");
        }
      } else {
        context?.setNotification?.("Something went wrong :( Try again?");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setPostLoading(false);
  };

  const handleComment = async () => {
    if (!commentQuote) return;
    setPostLoading(true);
    try {
      const schema = textOnly({
        content: post,

        tags: [
          "tripleA",
          (data as any)?.title
            ? (data as any)?.title?.replaceAll(" ", "")?.toLowerCase()
            : undefined,
        ]?.filter(Boolean),
      });
      const acl = immutable(chains.mainnet.id);
      const { uri } = await context?.storageClient?.uploadAsJson(schema, {
        acl,
      })!;

      const res = await createPost(context?.lensConnected?.sessionClient!, {
        contentUri: uri,
        commentOn: {
          post: commentQuote?.id,
        },
      });

      if (res.isErr()) {
        context?.setNotification?.("Something went wrong :( Try again?");
        setPostLoading(false);
        return;
      }

      if (
        (res.value as any)?.reason?.includes(
          "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
        )
      ) {
        context?.setSignless?.(true);
      } else if ((res.value as any)?.hash) {
        if (
          await pollResult(
            (res.value as any)?.hash,
            context?.lensConnected?.sessionClient!
          )
        ) {
          setSuccess(true);
          setPost("");
          if (commentQuote?.post) {
            setCommentQuote({
              type: "Comment",
              id: postId!,
              post: postId,
            });
          } else {
            setCommentQuote(undefined);
          }

          context?.setIndexer?.("Comment Indexing");
          await handlePosts(true);
        } else {
          context?.setNotification?.("Something went wrong :( Try again?");
        }
      } else {
        context?.setNotification?.("Something went wrong :( Try again?");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setPostLoading(false);
  };

  const handleLike = async (id: string, reaction: string, post: boolean) => {
    if (post) {
      setInteractionsLoadingPost((prev) => {
        let interactions = [...prev];

        interactions[0].like = true;

        return interactions;
      });
    } else {
      setInteractionsLoading((prev) => {
        let interactions = [...prev];

        let index = interactions?.findIndex((int) => int.id == id);
        interactions[index].like = true;

        return interactions;
      });
    }

    try {
      const res = await addReaction(context?.lensConnected?.sessionClient!, {
        post: id,
        reaction,
      });

      if (res.isOk()) {
        if (
          (res.value as any)?.reason?.includes(
            "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
          )
        ) {
          context?.setSignless?.(true);
        } else if ((res.value as any)?.success) {
          context?.setIndexer?.("Reaction Success");
          if (post) {
            setPostData?.((prev) => {
              const da = [...prev];

              da[0] = {
                ...da[0],
                stats: {
                  ...da[0]?.stats!,
                  upvotes:
                    reaction == "UPVOTE"
                      ? da[0]?.stats?.upvotes + 1
                      : da[0]?.stats?.upvotes - 1,
                },
                operations: {
                  ...da[0]?.operations!,
                  hasUpvoted: reaction == "UPVOTE" ? true : false,
                },
              };
              return da;
            });
          } else {
            setData((prev: any) => {
              if (!prev) return;

              if (
                (prev as Agent)?.creator ||
                (prev as NFTData)?.prices?.length > 0
              ) {
                const da = { ...(prev || {}) };

                if ((da as Agent)?.creator) {
                  let activity = (da as Agent).activity || [];
                  let index = activity?.findIndex((ac) => ac?.id == id);

                  activity[index] = {
                    ...activity[index],
                    stats: {
                      ...activity[index].stats!,
                      upvotes:
                        reaction == "UPVOTE"
                          ? activity[index].stats?.upvotes + 1
                          : activity[index].stats?.upvotes - 1,
                    },
                    operations: {
                      ...activity[index].operations!,

                      hasUpvoted: reaction == "UPVOTE" ? true : false,
                    },
                  };

                  (da as Agent).activity = activity;
                } else if ((da as NFTData)?.prices?.length > 0) {
                  let activity = (da as NFTData).agentActivity || [];
                  let index = activity?.findIndex((ac) => ac?.id == id);

                  activity[index] = {
                    ...activity[index],
                    stats: {
                      ...activity[index].stats!,
                      upvotes:
                        reaction == "UPVOTE"
                          ? activity[index].stats?.upvotes + 1
                          : activity[index].stats?.upvotes - 1,
                    },
                    operations: {
                      ...activity[index].operations!,

                      hasUpvoted: reaction == "UPVOTE" ? true : false,
                    },
                  };

                  (da as NFTData).agentActivity = activity;
                }
                return da;
              } else {
                let activity = [...((prev as Post[]) || [])];
                let index = activity?.findIndex((ac) => ac?.id == id);

                activity[index] = {
                  ...activity[index],
                  stats: {
                    ...activity[index].stats!,
                    upvotes:
                      reaction == "UPVOTE"
                        ? activity[index].stats?.upvotes + 1
                        : activity[index].stats?.upvotes - 1,
                  },
                  operations: {
                    ...activity[index].operations!,
                    hasUpvoted: reaction == "UPVOTE" ? true : false,
                  },
                };

                return activity;
              }
            });
          }
        } else {
          context?.setNotification?.("Something went wrong :( Try again?");
        }
      } else {
        context?.setNotification?.("Something went wrong :( Try again?");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    if (post) {
      setInteractionsLoadingPost((prev) => {
        let interactions = [...prev];

        interactions[0].like = false;

        return interactions;
      });
    } else {
      setInteractionsLoading((prev) => {
        let interactions = [...prev];

        let index = interactions?.findIndex((int) => int.id == id);
        interactions[index].like = false;

        return interactions;
      });
    }
  };

  const handleMirror = async (id: string, post: boolean) => {
    if (post) {
      setInteractionsLoadingPost((prev) => {
        let interactions = [...prev];

        interactions[0].mirror = true;

        return interactions;
      });
    } else {
      setInteractionsLoading((prev) => {
        let interactions = [...prev];

        let index = interactions?.findIndex((int) => int.id == id);
        interactions[index].mirror = true;

        return interactions;
      });
    }
    try {
      const res = await repost(context?.lensConnected?.sessionClient!, {
        post: id,
      });

      if (res.isErr()) {
        context?.setNotification?.("Something went wrong :( Try again?");
        if (post) {
          setInteractionsLoadingPost((prev) => {
            let interactions = [...prev];

            interactions[0].mirror = false;

            return interactions;
          });
        } else {
          setInteractionsLoading((prev) => {
            let interactions = [...prev];

            let index = interactions?.findIndex((int) => int.id == id);
            interactions[index].mirror = false;

            return interactions;
          });
        }
        return;
      }

      if (
        (res.value as any)?.reason?.includes(
          "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
        )
      ) {
        context?.setSignless?.(true);
      } else if ((res.value as any)?.hash) {
        context?.setIndexer?.("Mirror Indexing");

        if (post) {
          setPostData?.((prev) => {
            const da = [...prev];

            da[0] = {
              ...da[0],
              stats: {
                ...da[0]?.stats!,
                reposts: da[0]?.stats?.reposts + 1,
              },
              operations: {
                ...da[0]?.operations!,
                hasReposted: {
                  ...da[0]?.operations?.hasReposted!,

                  onChain: true,
                  optimistic: true,
                },
              },
            };
            return da;
          });
        } else {
          setData((prev: any) => {
            if (!prev) return;

            if (
              (prev as Agent)?.creator ||
              (prev as NFTData)?.prices?.length > 0
            ) {
              const da = { ...(prev || {}) };

              if ((da as Agent)?.creator) {
                let activity = (da as Agent).activity || [];
                let index = activity?.findIndex((ac) => ac?.id == id);

                activity[index] = {
                  ...activity[index],
                  stats: {
                    ...activity[index].stats!,
                    reposts: activity[index].stats?.reposts + 1,
                  },
                  operations: {
                    ...activity[index].operations!,
                    hasReposted: {
                      __typename: "BooleanValue",
                      optimistic: true,
                      onChain: true,
                    },
                  },
                };

                (da as Agent).activity = activity;
              } else if ((da as NFTData)?.prices?.length > 0) {
                let activity = (da as NFTData).agentActivity || [];
                let index = activity?.findIndex((ac) => ac?.id == id);

                activity[index] = {
                  ...activity[index],
                  stats: {
                    ...activity[index].stats!,
                    reposts: activity[index].stats?.reposts + 1,
                  },
                  operations: {
                    ...activity[index].operations!,

                    hasReposted: {
                      __typename: "BooleanValue",
                      optimistic: true,
                      onChain: true,
                    },
                  },
                };

                (da as NFTData).agentActivity = activity;
              }
              return da;
            } else {
              let activity = [...((prev as Post[]) || [])];
              let index = activity?.findIndex((ac) => ac?.id == id);

              activity[index] = {
                ...activity[index],
                stats: {
                  ...activity[index].stats!,
                  reposts: activity[index].stats?.reposts + 1,
                },
                operations: {
                  ...activity[index].operations!,
                  hasReposted: {
                    __typename: "BooleanValue",
                    optimistic: true,
                    onChain: true,
                  },
                },
              };

              return activity;
            }
          });
        }
      } else {
        context?.setNotification?.("Something went wrong :( Try again?");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    if (post) {
      setInteractionsLoadingPost((prev) => {
        let interactions = [...prev];

        interactions[0].mirror = false;

        return interactions;
      });
    } else {
      setInteractionsLoading((prev) => {
        let interactions = [...prev];

        let index = interactions?.findIndex((int) => int.id == id);
        interactions[index].mirror = false;

        return interactions;
      });
    }
  };

  const handleQuote = async () => {
    if (!commentQuote) return;
    setPostLoading(true);
    try {
      const schema = textOnly({
        content: post,

        tags: [
          "tripleA",
          (data as any)?.title
            ? (data as any)?.title?.replaceAll(" ", "")?.toLowerCase()
            : undefined,
        ]?.filter(Boolean),
      });
      const acl = immutable(chains.mainnet.id);
      const { uri } = await context?.storageClient?.uploadAsJson(schema, {
        acl,
      })!;

      const res = await createPost(context?.lensConnected?.sessionClient!, {
        contentUri: uri,
        quoteOf: {
          post: commentQuote?.id,
        },
      });

      if (res.isErr()) {
        context?.setNotification?.("Something went wrong :( Try again?");
        setPostLoading(false);

        return;
      }

      if (
        (res.value as any)?.reason?.includes(
          "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
        )
      ) {
        context?.setSignless?.(true);
      } else if ((res.value as any)?.hash) {
        if (
          await pollResult(
            (res.value as any)?.hash,
            context?.lensConnected?.sessionClient!
          )
        ) {
          setSuccess(true);
          setPost("");
          if (commentQuote?.post) {
            setCommentQuote({
              type: "Quote",
              id: postId!,
              post: postId,
            });
          } else {
            setCommentQuote(undefined);
          }
          context?.setIndexer?.("Quote Indexing");
          await handlePosts(true);
        } else {
          context?.setNotification?.("Something went wrong :( Try again?");
        }
      } else {
        context?.setNotification?.("Something went wrong :( Try again?");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setPostLoading(false);
  };

  useEffect(() => {
    if (data) {
      setInteractionsLoading(
        Array.from(
          {
            length: ((data as Agent)?.creator
              ? (data as Agent)?.activity
              : (data as NFTData)?.prices?.length > 0
              ? (data as NFTData)?.agentActivity
              : (data as Post[]))!.length,
          },
          (_, i) => ({
            mirror: false,
            like: false,
            id: ((data as Agent)?.creator
              ? (data as Agent)?.activity
              : (data as NFTData)?.prices?.length > 0
              ? (data as NFTData)?.agentActivity
              : (data as Post[]))?.[i]?.id as string,
          })
        )
      );
    }

    if (postId) {
      setInteractionsLoadingPost([
        {
          like: false,
          mirror: false,
          id: postId,
        },
      ]);
    }
  }, [data, postId]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    }
  }, [success]);

  return {
    handlePost,
    postLoading,
    handleComment,
    interactionsLoading,
    handleLike,
    handleMirror,
    handleQuote,
    post,
    setPost,
    commentQuote,
    setCommentQuote,
    success,
    interactionsLoadingPost,
  };
};

export default useInteractions;
