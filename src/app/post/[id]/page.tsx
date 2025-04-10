"use client";

import useInteractions from "@/components/NFT/hooks/useInteractions";
import Comments from "@/components/NFT/modules/Comments";
import MakePost from "@/components/NFT/modules/Post";
import usePost from "@/components/Post/hooks/usePost";
import { useParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Post() {
  const id = useParams();
  const {
    postData,
    handleActivity,
    activity,
    handleMoreActivity,
    activityCursor,
    activityLoading,
    setActivity,
    setPostData,
    postDataLoading,
  } = usePost(id?.id as string);
  const {
    handlePost,
    postLoading,
    interactionsLoading,
    handleComment,
    handleLike,
    handleMirror,
    handleQuote,
    post,
    setPost,
    commentQuote,
    setCommentQuote,
    success,
    interactionsLoadingPost,
  } = useInteractions(
    setActivity,
    activity,
    handleActivity,
    setPostData,
    id?.id as string
  );
  return (
    <div className="relative w-full h-full flex items-start justify-between flex-row py-6 px-10 gap-24">
      <div className="relative w-1/2 h-full flex px-1 sm:px-6 py-2">
        <Comments
          comments={postData}
          interactionsLoading={interactionsLoadingPost}
          handleLike={handleLike}
          handleMirror={handleMirror}
          setCommentQuote={setCommentQuote}
          postLoading={postLoading}
          commentQuote={commentQuote}
          post
        />
      </div>
      <div
        className={`relative w-full md:w-[38rem] h-[40rem] flex flex-col gap-4 items-start justify-start text-left text-windows p-3 bg-viol rounded-md ${
          (postDataLoading || postData?.length < 1 || activityLoading) &&
          "animate-pulse"
        }`}
      >
        {!postDataLoading && postData?.length > 0 && (
          <div className="relative w-full gap-3 flex flex-col h-full justify-between">
            {!activityLoading && activity?.length < 1 ? (
              <div className="relative w-full h-full flex items-center justify-center text-xs font-jackey2 text-black">
                Not Post Activity Yet.
              </div>
            ) : (
              <div className="relative w-full h-[50%] overflow-y-scroll">
                <InfiniteScroll
                  dataLength={activity?.length || 1}
                  next={handleMoreActivity}
                  hasMore={activityCursor ? true : false}
                  loader={<div key={0} />}
                  className="relative w-full"
                >
                  <Comments
                    comments={activity || []}
                    interactionsLoading={interactionsLoading}
                    handleLike={handleLike}
                    handleMirror={handleMirror}
                    setCommentQuote={setCommentQuote}
                    postLoading={postLoading}
                    commentQuote={commentQuote}
                  />
                </InfiniteScroll>
              </div>
            )}
            <MakePost
              handlePost={handlePost}
              postLoading={postLoading}
              setPost={setPost}
              post={post}
              commentQuote={commentQuote}
              setCommentQuote={setCommentQuote}
              handleComment={handleComment}
              handleQuote={handleQuote}
              success={success}
              postPage
            />
          </div>
        )}
      </div>
    </div>
  );
}
