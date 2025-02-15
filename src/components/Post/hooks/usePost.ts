import { LensConnected } from "@/components/Common/types/common.types";
import {
  PageSize,
  Post,
  PostReferenceType,
  PublicClient,
} from "@lens-protocol/client";
import { useEffect, useState } from "react";
import { STORAGE_NODE } from "@/lib/constants";
import { fetchPost, fetchPostReferences, fetchPosts } from "@lens-protocol/client/actions";

const usePost = (
  lensConnected: LensConnected | undefined,
  lensClient: PublicClient,
  postId: string
) => {
  const [postData, setPostData] = useState<Post[]>([]);
  const [activity, setActivity] = useState<Post[]>([]);
  const [activityLoading, setActivityLoading] = useState<boolean>(false);
  const [postDataLoading, setPostDataLoading] = useState<boolean>(false);
  const [activityCursor, setActivityCursor] = useState<string | undefined>();

  const handleActivity = async () => {
    if (!postId) return;
    setActivityLoading(true);
    try {
      const postsRes = await fetchPostReferences(
        lensConnected?.sessionClient || lensClient,
        {
          pageSize: PageSize.Fifty,
          referencedPost: postId,
          referenceTypes: [
            PostReferenceType.CommentOn,
            PostReferenceType.QuoteOf,
          ],
        }
      );

      if (postsRes.isErr()) {
        setActivityLoading(false);
        return;
      }

      let posts: Post[] = [];

      if (postsRes.value?.items?.length > 0) {
        posts = postsRes.value?.items as Post[];
      }
      if (postsRes.value?.pageInfo?.next) {
        setActivityCursor(postsRes.value?.pageInfo?.next);
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
      setActivity(posts);
    } catch (err: any) {
      console.error(err.message);
    }
    setActivityLoading(false);
  };

  const handleMoreActivity = async () => {
    if (!activityCursor || !postId) return;
    try {
      const postsRes = await fetchPostReferences(
        lensConnected?.sessionClient || lensClient,
        {
          pageSize: PageSize.Fifty,
          referencedPost: postId,
          referenceTypes: [
            PostReferenceType.CommentOn,
            PostReferenceType.QuoteOf,
          ],
          cursor: activityCursor,
        }
      );

      if (postsRes.isErr()) {
        return;
      }

      let posts: Post[] = [];

      if (postsRes.value?.items?.length > 0) {
        posts = postsRes?.value.items as Post[];
      }
      if (postsRes.value?.pageInfo?.next) {
        setActivityCursor(postsRes?.value?.pageInfo?.next);
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

      setActivity([...activity, ...posts]);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handlePostData = async () => {
    setPostDataLoading(true);
    try {
      const res = await fetchPost(lensConnected?.sessionClient || lensClient, {
        post: postId,
      });

      if (res.isErr()) {
        setPostDataLoading(false);
        return;
      }

      let picture = (res.value as Post)?.author?.metadata?.picture;

      if ((res.value as Post)?.author?.metadata?.picture) {
        const cadena = await fetch(
          `${STORAGE_NODE}/${
            (res.value as Post)?.author?.metadata?.picture?.split(
              "lens://"
            )?.[1]
          }`
        );

        if (cadena) {
          const json = await cadena.json();
          picture = json.item;
        }
      }

      await handleActivity();

      setPostData([
        {
          ...(res.value as Post),
          author: {
            ...(res.value as Post)?.author,
            metadata: {
              ...(res.value as Post)?.author?.metadata!,
              picture,
            },
          },
        },
      ]);
    } catch (err: any) {
      console.error(err.message);
    }
    setPostDataLoading(false);
  };

  useEffect(() => {
    if (lensClient || lensConnected?.sessionClient) {
      handlePostData();
    }
  }, [lensConnected, lensClient]);

  return {
    postData,
    handleActivity,
    activity,
    activityCursor,
    activityLoading,
    postDataLoading,
    handleMoreActivity,
    setActivity,
    setPostData,
  };
};

export default usePost;
