"use client";

import { AnimationContext, ModalContext } from "@/app/providers";
import useAgent from "@/components/Agent/hooks/useAgent";
import useRecharge from "@/components/Agent/hooks/useRecharge";
import useInteractions from "@/components/NFT/hooks/useInteractions";
import Comments from "@/components/NFT/modules/Comments";
import Post from "@/components/NFT/modules/Post";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import { downloadEliza } from "@/lib/helpers/downloadEliza";
import { chains } from "@lens-network/sdk/viem";
import { useModal } from "connectkit";
import moment from "moment";
import Image from "next/legacy/image";
import { useParams, useRouter } from "next/navigation";
import { useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { createPublicClient, http } from "viem";
import { useAccount } from "wagmi";

export default function Agent() {
  const id = useParams();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const animationContext = useContext(AnimationContext);
  const context = useContext(ModalContext);
  const { setOpen } = useModal();
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const {
    agent,
    agentLoading,
    hasMore,
    handleMoreActivity,
    screen,
    setScreen,
    setAgent,
    stats,
    handleActivity,
    followLoading,
    handleFollow,
    agentRent,
  } = useAgent(
    id?.id as string,
    context?.lensClient!,
    context?.lensConnected,
    context?.setNotification!,
    context?.setSignless!
  );

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
  } = useInteractions(
    context?.lensConnected?.sessionClient!,
    context?.setSignless!,
    context?.storageClient!,
    context?.setIndexer!,
    context?.setNotification!,
    setAgent,
    agent,
    handleActivity
  );

  const {
    rechargeLoading,
    approvedRecharge,
    handleRecharge,
    handleApproveRecharge,
    rechargeAmount,
    setRechargeAmount,
  } = useRecharge(
    publicClient,
    address,
    context?.setNotification!,
    agent?.details || []
  );

  return (
    <div className="relative w-full h-full flex items-start justify-between flex-col py-6 px-10 gap-24 text-windows">
      <div className="relative w-full h-[60rem] md:h-[40rem] flex flex-col md:flex-row items-center justify-between gap-4 pb-10 px-6 pt-6">
        <div className="relative w-full h-[30rem] md:h-full flex px-6 py-2">
          {agent?.cover && (
            <Image
              alt={id?.toString() || ""}
              src={`${INFURA_GATEWAY}/ipfs/${
                agent?.cover?.includes("ipfs")
                  ? agent?.cover?.split("ipfs://")?.[1]
                  : agent?.cover
              }`}
              draggable={false}
              layout="fill"
              objectFit="contain"
              className="cursor-canP"
              onClick={() =>
                context?.setImageView(
                  `${INFURA_GATEWAY}/ipfs/${
                    agent?.cover?.split("ipfs://")?.[1]
                  }`
                )
              }
            />
          )}
        </div>
        <div
          className={`relative w-full md:w-[38rem] h-full flex flex-col gap-4 items-start justify-start text-left text-windows p-3 bg-viol rounded-md ${
            (agentLoading || !agent) && "animate-pulse"
          }`}
        >
          {(!agentLoading || agent) && (
            <>
              <div className="relative w-full h-fit flex flex-row justify-between items-center">
                <div
                  className="relative w-fit h-fit flex items-center justiy-center cursor-canP"
                  onClick={() => setScreen(screen > 0 ? screen - 1 : 6)}
                >
                  <svg
                    className="size-6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                </div>
                <div className="text-sm relative flex w-fit h-fit text-center uppercase font-nerd">
                  {screen < 1
                    ? "Agent"
                    : screen == 1
                    ? "Agent Activity"
                    : screen == 2
                    ? "Active Collections"
                    : screen == 3
                    ? "Collection History"
                    : screen == 4
                    ? "Rent History"
                    : screen == 5
                    ? "Active Coll. Balances"
                    : "Activate Collections"}
                </div>
                <div
                  className="relative  w-fit h-fit flex items-center justiy-center cursor-canP"
                  onClick={() => setScreen(screen < 6 ? screen + 1 : 0)}
                >
                  <svg
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="size-6"
                  >
                    {" "}
                    <path
                      d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                </div>
              </div>
              {screen < 1 ? (
                <>
                  <div className="relative text-xl break-all flex font-dos">
                    {agent?.title}
                  </div>
                  <div className="relative w-full h-fit flex flex-col gap-3 items-start justify-between font-nerd">
                    <div className="relative w-full h-fit flex flex-row justify-between items-center gap-2">
                      <div className="relative w-fit h-fit flex items-start gap-1 flex-col justify-start">
                        <div className="relative w-fit h-fit flex text-xs">
                          Followers
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
                          {stats?.graphFollowStats?.followers || 0}
                        </div>
                      </div>
                      <div className="relative w-fit h-fit flex items-start gap-1 flex-col justify-start">
                        <div className="relative w-fit h-fit flex text-xs">
                          Following
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
                          {stats?.graphFollowStats?.following || 0}
                        </div>
                      </div>
                    </div>
                    <div className="relative w-full h-fit flex flex-row justify-between items-center gap-2">
                      <div className="relative w-fit h-fit flex items-start gap-1 flex-col justify-start">
                        <div className="relative w-fit h-fit flex text-xs">
                          Agent Owner
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
                          <div className="relative flex rounded-full w-8 h-8 bg-morado border border-morado">
                            {agent?.ownerProfile?.metadata?.picture && (
                              <Image
                                src={`${INFURA_GATEWAY}/ipfs/${
                                  agent?.ownerProfile?.metadata?.picture?.split(
                                    "ipfs://"
                                  )?.[1]
                                }`}
                                draggable={false}
                                className="rounded-full"
                                layout="fill"
                                objectFit="cover"
                              />
                            )}
                          </div>
                          <div className="relative flex w-fit h-fit text-xs">
                            {agent?.ownerProfile?.username?.localName
                              ? "@" +
                                agent?.ownerProfile?.username?.localName?.slice(
                                  0,
                                  10
                                )
                              : agent?.creator?.slice(0, 10)}
                          </div>
                        </div>
                      </div>
                      <div className="relative w-fit h-fit flex items-start gap-1 flex-col justify-start">
                        <div className="relative w-fit h-fit flex text-xs">
                          Agent
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
                          <div className="relative flex rounded-full w-8 h-8 bg-morado border border-morado">
                            {agent?.profile?.metadata?.picture && (
                              <Image
                                src={`${INFURA_GATEWAY}/ipfs/${
                                  agent?.profile?.metadata?.picture?.split(
                                    "ipfs://"
                                  )?.[1]
                                }`}
                                draggable={false}
                                className="rounded-full"
                                layout="fill"
                                objectFit="cover"
                              />
                            )}
                          </div>
                          <div className="relative flex w-fit h-fit text-xs">
                            {agent?.profile?.username?.localName
                              ? "@" +
                                agent?.profile?.username?.localName?.slice(
                                  0,
                                  10
                                )
                              : agent?.wallet?.slice(0, 10)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full h-full max-h-full flex flex-col py-4 overflow-y-scroll">
                    <div className="py-3 h-fit flex relative items-start justify-start text-left text-sm font-nim">
                      {agent?.bio}
                    </div>
                    <div className="relative w-full h-fit flex py-4 flex-col items-start justify-start gap-2 font-nerd">
                      <div className="relative w-fit h-fit flex text-xxs">
                        Custom Instructions
                      </div>
                      <div className="relative w-full h-fit flexoverflow-y-scroll">
                        <div className="pb-3 h-full max-h-full overflow-y-scroll flex relative items-start justify-start text-left text-sm">
                          {agent?.customInstructions}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full h-fit flex items-center justify-between gap-2">
                    <div className="relative w-fit h-fit flex font-dos text-sm">
                      Port To Eliza
                    </div>

                    <div
                      onClick={() =>
                        downloadEliza(
                          agent?.title!,
                          agent?.bio!,
                          agent?.lore!,
                          agent?.knowledge!,
                          agent?.messageExamples!,
                          agent?.style!,
                          agent?.adjectives!
                        )
                      }
                      className="relative w-fit h-fit flex"
                    >
                      <div className="relative w-7 h-7 rounded-full border border-windows cursor-canP">
                        <Image
                          draggable={false}
                          layout="fill"
                          className="rounded-full"
                          src={`${INFURA_GATEWAY}/ipfs/QmRGFsZ5Qg6WWKo3761WdwGSoqbDD1ZR9zVV95CTaomqdU`}
                          objectFit="cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full h-fit flex">
                    <div
                      className={`relative w-full h-12 text-viol bg-windows rounded-md hover:opacity-80 text-center font-nerd flex items-center justify-center ${
                        !followLoading ? "cursor-canP" : "opacity-70"
                      }`}
                      onClick={() => !followLoading && handleFollow()}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        {followLoading ? (
                          <svg
                            fill="none"
                            className="size-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                              fill="#CECEFF"
                            />{" "}
                          </svg>
                        ) : agent?.profile?.operations?.isFollowedByMe ? (
                          "Unfollow"
                        ) : (
                          "Follow"
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : screen == 1 ? (
                <div className="relative w-full gap-3 flex flex-col h-full">
                  <div className="relative w-full h-[50%] overflow-y-scroll">
                    <InfiniteScroll
                      dataLength={agent?.activity?.length || 1}
                      next={handleMoreActivity}
                      hasMore={hasMore}
                      loader={<div key={0} />}
                      className="relative w-full"
                    >
                      <Comments
                        comments={agent?.activity || []}
                        setImageView={context?.setImageView!}
                        interactionsLoading={interactionsLoading}
                        handleLike={handleLike}
                        handleMirror={handleMirror}
                        setCommentQuote={setCommentQuote}
                        postLoading={postLoading}
                        commentQuote={commentQuote}
                        agents={context?.agents!}
                      />
                    </InfiniteScroll>
                  </div>
                  <Post
                    handlePost={handlePost}
                    postLoading={postLoading}
                    setPost={setPost}
                    post={post}
                    commentQuote={commentQuote}
                    setCommentQuote={setCommentQuote}
                    handleComment={handleComment}
                    handleQuote={handleQuote}
                    success={success}
                  />
                </div>
              ) : screen == 4 ? (
                <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
                  <div className="relative w-full h-fit flex flex-col items-start justify-start gap-5">
                    {Number(agentRent?.length) < 1 ? (
                      <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                        No Rent Paid Yet.
                      </div>
                    ) : (
                      agentRent?.map((rent, key) => {
                        return (
                          <div
                            className="relative w-full h-fit flex flex-col gap-3 font-nerd"
                            key={key}
                          >
                            <div
                              className="relative w-full h-fit flex cursor-canP justify-between items-center flex-row gap-2 text-xs"
                              onClick={() =>
                                window.open(
                                  `https://block-explorer.testnet.lens.dev/tx/${rent?.transactionHash}`
                                )
                              }
                            >
                              <div className="relative w-fit h-fit flex items-center justify-center">
                                {rent?.transactionHash?.slice(0, 5) +
                                  "..." +
                                  rent?.transactionHash?.slice(-3)}
                              </div>
                              <div className="relative w-fit h-fit flex items-center justify-center">
                                {moment
                                  .unix(Number(rent?.blockTimestamp))
                                  .fromNow()}
                              </div>
                            </div>
                            <div className="relative w-full h-fit flex flex-col gap-2">
                              {rent?.amounts?.map((_, index) => {
                                return (
                                  <div
                                    key={index}
                                    className="relative w-full h-fit flex items-center justify-between gap-2 text-xxs"
                                  >
                                    <div
                                      className="relative w-fit h-fit flex items-center justify-center cursor-canP"
                                      onClick={() => {
                                        animationContext?.setPageChange?.(true);
                                        router.push(
                                          `/nft/${
                                            agent?.collectionIdsHistory
                                              ?.find(
                                                (col) =>
                                                  Number(col?.collectionId) ==
                                                  Number(
                                                    rent?.collectionIds[index]
                                                  )
                                              )
                                              ?.profile?.username?.value?.split(
                                                "lens/"
                                              )?.[1]
                                          }/${
                                            agent?.collectionIdsHistory?.find(
                                              (col) =>
                                                Number(col?.collectionId) ==
                                                Number(
                                                  rent?.collectionIds[index]
                                                )
                                            )?.collectionId
                                          }`
                                        );
                                      }}
                                    >
                                      <div className="rounded-sm w-7 h-7 flex relative border border-windows">
                                        <Image
                                          draggable={false}
                                          objectFit="cover"
                                          className="rounded-sm"
                                          layout="fill"
                                          src={`${INFURA_GATEWAY}/ipfs/${
                                            agent?.collectionIdsHistory
                                              ?.find(
                                                (col) =>
                                                  Number(col?.collectionId) ==
                                                  Number(
                                                    rent?.collectionIds[index]
                                                  )
                                              )
                                              ?.metadata?.image?.split(
                                                "ipfs://"
                                              )?.[1]
                                          }`}
                                        />
                                      </div>
                                    </div>
                                    <div className="relative w-fit h-fit flex">
                                      {Number(rent?.amounts?.[index]) /
                                        10 ** 18}{" "}
                                      {
                                        TOKENS?.find(
                                          (tok) =>
                                            tok.contract?.toLowerCase() ==
                                            rent?.tokens?.[index]?.toLowerCase()
                                        )?.symbol
                                      }
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="relative w-full h-px bg-windows flex"></div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : screen == 5 ? (
                <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
                  <div className="relative w-full h-fit flex flex-col items-start justify-start  gap-3">
                    {Number(agent?.balance?.length) < 1 ? (
                      <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                        No Balances Yet.
                      </div>
                    ) : (
                      agent?.balance?.map((balance, key) => {
                        return (
                          <div
                            key={key}
                            className="relative w-full h-fit flex justify-between items-center flex-row gap-2 cursor-canP"
                            onClick={() => {
                              animationContext?.setPageChange?.(true);
                              router.push(
                                `/nft/${
                                  (agent?.details as any[])
                                    ?.find(
                                      (col) =>
                                        Number(col?.collectionId) ==
                                        Number(balance?.collectionId)
                                    )
                                    ?.profile?.username?.value?.split(
                                      "lens/"
                                    )?.[1]
                                }/${
                                  agent?.collectionIdsHistory?.find(
                                    (col) =>
                                      Number(col?.collectionId) ==
                                      Number(balance?.collectionId)
                                  )?.collectionId
                                }`
                              );
                            }}
                          >
                            <div className="relative w-fit h-fit flex items-center justify-center">
                              <div className="rounded-sm w-7 h-7 flex relative border border-windows">
                                <Image
                                  draggable={false}
                                  objectFit="cover"
                                  className="rounded-sm"
                                  layout="fill"
                                  src={`${INFURA_GATEWAY}/ipfs/${
                                    (agent?.details as any[])
                                      ?.find(
                                        (col) =>
                                          Number(col?.collectionId) ==
                                          Number(balance?.collectionId)
                                      )
                                      ?.metadata?.image?.split("ipfs://")?.[1]
                                  }`}
                                />
                              </div>
                            </div>
                            <div className="relative w-fit h-fit flex text-left font-nerd text-xs">
                              {Number(balance.activeBalance) / 10 ** 18}{" "}
                              {
                                TOKENS.find(
                                  (tok) =>
                                    tok.contract?.toLowerCase() ==
                                    balance?.token?.toLowerCase()
                                )?.symbol
                              }
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : screen == 6 ? (
                <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
                  <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3">
                    {Number(agent?.details?.length) < 1 ? (
                      <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                        Agent Not Assigned to Any Collections Yet.
                      </div>
                    ) : (
                      <div className="relative w-full h-fit flex flex-col gap-2 items-start justify-start">
                        <div className="relative w-fit h-fit flex items-center justify-center text-sm text-pink font-nim">
                          Recharge to put this agent to work.
                        </div>
                        <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3">
                          {agent?.details?.map((collection, key) => {
                            return (
                              <div
                                key={key}
                                className="relative w-full h-fit flex flex-col items-start justify-start gap-2 font-nerd"
                              >
                                <div className="relative w-full h-fit flex justify-between items-center flex-col gap-2">
                                  <div className="relative w-full h-px flex bg-black"></div>
                                  <div className="relative w-full h-fit flex flex-row gap-2 justify-between items-center md:flex-nowrap flex-wrap">
                                    <div
                                      className="relative w-fit h-fit flex cursor-canP"
                                      onClick={() => {
                                        animationContext?.setPageChange?.(true);
                                        router.push(
                                          `/nft/${
                                            (
                                              collection as any
                                            )?.profile?.username?.value?.split(
                                              "lens/"
                                            )?.[1]
                                          }/${collection?.collectionId}`
                                        );
                                      }}
                                    >
                                      <div className="rounded-sm w-7 h-7 flex relative border border-windows">
                                        <Image
                                          draggable={false}
                                          objectFit="cover"
                                          className="rounded-sm"
                                          layout="fill"
                                          src={`${INFURA_GATEWAY}/ipfs/${
                                            (
                                              collection as any
                                            )?.metadata?.image?.split(
                                              "ipfs://"
                                            )?.[1]
                                          }`}
                                        />
                                      </div>
                                    </div>
                                    <input
                                      className="relative w-full h-full p-1 bg-viol rounded-xl text-sm focus:outline-none pixel-border-7"
                                      placeholder="1"
                                      type="number"
                                      disabled={rechargeLoading[key]}
                                      min={1}
                                      value={rechargeAmount[key]}
                                      onChange={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setRechargeAmount((prev) => {
                                          const newR = { ...prev };

                                          newR[key] = Number(e.target.value);

                                          return newR;
                                        });
                                      }}
                                    />
                                    <div className="relative w-fit h-fit flex text-sm">
                                      {
                                        TOKENS?.find(
                                          (tok) =>
                                            tok.contract?.toLowerCase() ==
                                            (
                                              collection as any
                                            )?.tokens?.[0]?.toLowerCase()
                                        )?.symbol
                                      }
                                    </div>

                                    <div className="relative w-fit h-fit flex">
                                      <div
                                        className={`relative w-24 h-8 bg-windows rounded-md text-white flex items-center justify-center font-nerd hover:opacity-80 ${
                                          !rechargeLoading[key]
                                            ? "cursor-canP"
                                            : "opacity-70"
                                        }`}
                                        onClick={() => {
                                          if (!rechargeLoading[key]) {
                                            if (!isConnected) {
                                              setOpen?.(!open);
                                            } else if (approvedRecharge[key]) {
                                              handleRecharge(
                                                key,
                                                (collection as any)
                                                  ?.tokens?.[0],
                                                Number(agent?.id),
                                                Number(collection?.collectionId)
                                              );
                                            } else {
                                              handleApproveRecharge(key);
                                            }
                                          }
                                        }}
                                      >
                                        {rechargeLoading[key] ? (
                                          <svg
                                            fill="none"
                                            className="size-4 animate-spin"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                                              fill="white"
                                            />{" "}
                                          </svg>
                                        ) : approvedRecharge[key] ||
                                          !isConnected ? (
                                          "Recharge"
                                        ) : (
                                          "Approve"
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative w-full h-fit flex items-start justify-between gap-2 text-xs font-nerd sm:flex-nowrap flex-wrap">
                                  <div className="relative w-full h-fit flex items-start justify-between flex-col gap-1">
                                    <div className="relative w-fit h-fit flex">
                                      Active Collection Balance:
                                    </div>
                                    <div className="relative w-fit h-fit flex">
                                      {Number(
                                        agent?.balance?.find(
                                          (bal) =>
                                            Number(bal?.collectionId) ==
                                            Number(collection?.collectionId)
                                        )?.activeBalance || 0
                                      ) /
                                        10 ** 18}
                                    </div>
                                  </div>
                                  <div className="relative w-full h-fit flex items-start justify-between flex-col gap-1">
                                    <div className="relative w-fit h-fit flex">
                                      Publishing Rate:
                                    </div>
                                    <div className="relative w-fit h-fit flex">
                                      {Number(
                                        agent?.details?.find(
                                          (bal) =>
                                            Number(bal?.collectionId) ==
                                            Number(collection?.collectionId)
                                        )?.publishFrequency || 0
                                      ) *
                                        (Number(
                                          context?.tokenThresholds?.find(
                                            (thr) =>
                                              thr?.token?.toLowerCase() ==
                                              (
                                                collection as any
                                              )?.tokens?.[0]?.toLowerCase()
                                          )?.rent || 0
                                        ) /
                                          10 ** 18)}
                                    </div>
                                  </div>
                                </div>
                                <div className="relative w-full h-fit text-pink font-nerd text-sm break-all flex">
                                  {Number(
                                    agent?.balance?.find(
                                      (bal) =>
                                        Number(bal?.collectionId) ==
                                        Number(collection?.collectionId)
                                    )?.activeBalance || 0
                                  ) /
                                    (Number(
                                      agent?.details?.find(
                                        (bal) =>
                                          Number(bal?.collectionId) ==
                                          Number(collection?.collectionId)
                                      )?.publishFrequency || 0
                                    ) *
                                      Number(
                                        context?.tokenThresholds?.find(
                                          (thr) =>
                                            thr?.token?.toLowerCase() ==
                                            (
                                              collection as any
                                            )?.tokens?.[0]?.toLowerCase()
                                        )?.rent || 0
                                      )) || 0 > 0
                                    ? `If not recharged, Agent will run out in ${
                                        Number(
                                          agent?.balance?.find(
                                            (bal) =>
                                              Number(bal?.collectionId) ==
                                              Number(collection?.collectionId)
                                          )?.activeBalance || 0
                                        ) /
                                          (Number(
                                            agent?.details?.find(
                                              (bal) =>
                                                Number(bal?.collectionId) ==
                                                Number(collection?.collectionId)
                                            )?.publishFrequency || 0
                                          ) *
                                            Number(
                                              context?.tokenThresholds?.find(
                                                (thr) =>
                                                  thr?.token?.toLowerCase() ==
                                                  (
                                                    collection as any
                                                  )?.tokens?.[0]?.toLowerCase()
                                              )?.rent || 0
                                            )) || 0
                                      } cycles.`
                                    : "Agent needs to be recharged to start activity."}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
                  <div className="relative w-full h-fit flex flex-col items-start justify-start  gap-3">
                    {Number(
                      screen == 2
                        ? agent?.activeCollectionIds?.length
                        : agent?.collectionIdsHistory?.length
                    ) < 1 ? (
                      <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                        No Collections Yet.
                      </div>
                    ) : (
                      (screen == 2
                        ? agent?.activeCollectionIds
                        : agent?.collectionIdsHistory
                      )?.map((collection, key) => {
                        return (
                          <div
                            key={key}
                            className="relative w-full h-fit flex cursor-canP justify-between items-center flex-row gap-2"
                            onClick={() => {
                              animationContext?.setPageChange?.(true);
                              router.push(
                                `/nft/${
                                  collection?.profile?.username?.value?.split(
                                    "lens/"
                                  )?.[1]
                                }/${collection?.collectionId}`
                              );
                            }}
                          >
                            <div className="relative w-fit h-fit flex items-center justify-center">
                              <div className="rounded-sm w-7 h-7 flex relative border border-windows">
                                <Image
                                  draggable={false}
                                  objectFit="cover"
                                  className="rounded-sm"
                                  layout="fill"
                                  src={`${INFURA_GATEWAY}/ipfs/${
                                    collection?.metadata?.image?.split(
                                      "ipfs://"
                                    )?.[1]
                                  }`}
                                />
                              </div>
                            </div>
                            <div className="relative w-fit h-fit flex items-center justify-center font-nerd text-xs">
                              {collection?.metadata?.title}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="relative w-full h-fit flex items-center justify-center">
        <div className="relative w-5/6 flex items-center justify-center flex-col gap-3 h-fit">
          <div className="relative w-fit h-fit flex font-nim text-white text-3xl uppercase">
            {"<= MORE AGENTS =>"}
          </div>
          <div className="relative w-full h-fit flex overflow-x-scroll">
            <div className="relative w-fit h-fit flex flex-row gap-6">
              {context?.agentsLoading
                ? Array.from({ length: 20 }).map((_, index) => {
                    return (
                      <div
                        className="relative w-fit h-fit flex flex-row gap-6 items-center justify-center"
                        key={index}
                      >
                        <div className="relative animate-pulse flex w-56 h-56 rounded-md bg-pink p-4">
                          <div className="pixel-border-6 w-full h-full relative bg-mochi rounded-3xl"></div>
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-center">
                          <div className="relative w-20 h-20 flex">
                            <Image
                              layout="fill"
                              src={`${INFURA_GATEWAY}/ipfs/${
                                index % 3 === 0
                                  ? "QmNVgB6TBsVeH2AwHck1MJwgHZTFtxWqrxGkGPsXRJhvs2"
                                  : index % 3 === 1
                                  ? "QmXHLgjrzCrDCzhfejFnNEcapxUqawuKLt5LSBd6je6G7V"
                                  : "QmT8fNjUqmjarmC3BHoYUomcTSvR9YLd4CxiLQftkUquWR"
                              }`}
                              objectFit="contain"
                              draggable={false}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                : context?.agents.map((agent, index: number) => {
                    return (
                      <div
                        className="relative w-fit h-fit flex flex-row gap-6 items-center justify-center"
                        key={index}
                      >
                        <div
                          className="relative cursor-canP flex w-56 h-56 rounded-md bg-pink p-4"
                          onClick={() => {
                            animationContext?.setPageChange?.(true);
                            router.push(`/agent/${agent?.id}`);
                          }}
                        >
                          <div className="pixel-border-3 w-full h-full relative bg-mochi rounded-xl">
                            <Image
                              draggable={false}
                              layout="fill"
                              objectFit="cover"
                              src={`${INFURA_GATEWAY}/ipfs/${
                                agent?.cover?.split("ipfs://")?.[1]
                              }`}
                            />
                          </div>
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-center">
                          <div className="relative w-20 h-20 flex">
                            <Image
                              layout="fill"
                              src={`${INFURA_GATEWAY}/ipfs/${
                                index % 3 === 0
                                  ? "QmNVgB6TBsVeH2AwHck1MJwgHZTFtxWqrxGkGPsXRJhvs2"
                                  : index % 3 === 1
                                  ? "QmXHLgjrzCrDCzhfejFnNEcapxUqawuKLt5LSBd6je6G7V"
                                  : "QmT8fNjUqmjarmC3BHoYUomcTSvR9YLd4CxiLQftkUquWR"
                              }`}
                              objectFit="contain"
                              draggable={false}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
          <div className="absolute top-0 -right-10 flex w-fit h-fit z-30">
            <div className="relative w-40 h-20 flex rotate-[0.5rad]">
              <Image
                src={`${INFURA_GATEWAY}/ipfs/QmdXC6EZpvSU1U25ikHvTwX7RjAhA8FXJ7ZYLieN52gFyP`}
                draggable={false}
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
