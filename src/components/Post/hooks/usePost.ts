import { LensConnected } from "@/components/Common/types/common.types";
import {
  PageSize,
  Post,
  PostReferenceType,
  PublicClient,
} from "@lens-protocol/client";
import { useEffect, useState } from "react";
import {
  fetchPost,
  fetchPostReferences,
} from "@lens-protocol/client/actions";

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


      await handleActivity();

      setPostData([res.value as Post]);
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
