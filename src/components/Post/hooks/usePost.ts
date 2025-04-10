import { PageSize, Post, PostReferenceType } from "@lens-protocol/client";
import { useContext, useEffect, useState } from "react";
import { fetchPost, fetchPostReferences } from "@lens-protocol/client/actions";
import { ModalContext } from "@/app/providers";

const usePost = (postId: string) => {
  const context = useContext(ModalContext);
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
        context?.lensConnected?.sessionClient || context?.lensClient!,
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
        context?.lensConnected?.sessionClient || context?.lensClient!,
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
      const res = await fetchPost(
        context?.lensConnected?.sessionClient || context?.lensClient!,
        {
          post: postId,
        }
      );

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
    if (context?.lensClient || context?.lensConnected?.sessionClient) {
      handlePostData();
    }
  }, [context?.lensConnected?.sessionClient, context?.lensClient]);

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
