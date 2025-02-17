import { FunctionComponent, JSX, useContext } from "react";
import { PurchaseProps } from "../types/nft.types";
import usePurchase from "../hooks/usePurchase";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-network/sdk/viem";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import Image from "next/legacy/image";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import useInteractions from "../hooks/useInteractions";
import Post from "./Post";
import Comments from "./Comments";
import { useRouter } from "next/navigation";
import { useModal } from "connectkit";
import useAgentRecharge from "../hooks/useAgentRecharge";
import { AnimationContext } from "@/app/providers";
import {
  CollectionType,
  Format,
} from "@/components/Dashboard/types/dashboard.types";
import calculateRent from "@/lib/helpers/calculateRent";
import descriptionRegex from "@/lib/helpers/descriptionRegex";
import { CiCircleQuestion } from "react-icons/ci";

const Purchase: FunctionComponent<PurchaseProps> = ({
  nft,
  setNft,
  nftLoading,
  setNotification,
  hasMore,
  handleMoreActivity,
  agentLoading,
  lensConnected,
  setSignless,
  setImageView,
  storageClient,
  setIndexer,
  tokenThresholds,
  agents,
  handlePosts,
  setFulfillmentOpen,
  fulfillers,
  setToolTip,
}): JSX.Element => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { setOpen, open } = useModal();
  const animationContext = useContext(AnimationContext);
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const {
    purchaseLoading,
    handleApprove,
    handlePurchase,
    approved,
    setCollectData,
    collectData,
    screen,
    setScreen,
  } = usePurchase(
    nft,
    setNft,
    address,
    publicClient,
    setNotification,
    setFulfillmentOpen,
    fulfillers,
    agents
  );
  const {
    rechargeLoading,
    handleRecharge,
    setRechargeAmount,
    rechargeAmount,
    handleApproveRecharge,
    approvedRecharge,
  } = useAgentRecharge(
    nft?.agentIds,
    publicClient,
    address,
    setNotification,
    nft?.id
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
    lensConnected?.sessionClient!,
    setSignless,
    storageClient,
    setIndexer,
    setNotification,
    setNft,
    nft,
    handlePosts
  );
  return (
    <div
      className={`relative w-full md:w-[38rem] h-full flex flex-col gap-4 items-start justify-start text-left text-windows p-3 bg-viol rounded-md ${
        (nftLoading || agentLoading || nft?.amount == 0) && "animate-pulse"
      }`}
    >
      {!nftLoading && nft?.amount > 0 && (
        <>
          <div className="relative w-full h-fit flex flex-row justify-between items-center">
            <div
              className="relative w-fit h-fit flex items-center justiy-center cursor-canP"
              onClick={() =>
                setScreen(
                  screen > 0
                    ? screen - 1
                    : Number(nft?.agentIds?.length || 0) > 0
                    ? nft?.isAgent
                      ? 4
                      : 3
                    : 1
                )
              }
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
                  fill="#0000f5"
                />{" "}
              </svg>
            </div>
            <div className="text-sm relative flex w-fit h-fit text-center uppercase font-nerd">
              {Number(nft?.agentIds?.length || 0) > 0
                ? screen < 1
                  ? "Collect"
                  : screen == 1
                  ? "Collectors"
                  : screen == 2
                  ? "Agents On Lens"
                  : screen == 3
                  ? "Agent Recharge Station"
                  : "CC0 GenArt"
                : screen < 1
                ? "Collect"
                : "Collectors"}
            </div>
            <div
              className="relative w-fit h-fit flex items-center justiy-center cursor-canP"
              onClick={() =>
                setScreen(
                  screen <
                    (Number(nft?.agentIds?.length || 0) > 0
                      ? nft?.isAgent
                        ? 4
                        : 3
                      : 1)
                    ? screen + 1
                    : 0
                )
              }
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
                  fill="#0000f5"
                />{" "}
              </svg>
            </div>
          </div>
          {screen < 1 ? (
            <>
              <div className="relative font-dos text-xl break-all flex">
                {nft?.title}
              </div>
              <div className="relative text-sm flex font-nerd">
                Edition — {nft?.amountSold || 0} / {nft?.amount}
              </div>
              <div className="relative w-full h-fit flex items-center justify-between flex-row gap-3 font-nim flex-wrap sm:flex-nowrap text-xs">
                <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
                  {nft?.profile?.metadata?.picture && (
                    <div
                      className="relative flex rounded-full w-8 h-8 bg-morado border border-windows cursor-canP"
                      onClick={(e) => {
                        e.stopPropagation();
                        animationContext?.setPageChange?.(true);
                        router.prefetch(
                          `/user/${nft?.profile?.username?.localName}`
                        );
                        router.push(
                          `/user/${nft?.profile?.username?.localName}`
                        );
                      }}
                    >
                      <Image
                        src={`${INFURA_GATEWAY}/ipfs/${
                          nft?.profile?.metadata?.picture?.split("ipfs://")?.[1]
                        }`}
                        draggable={false}
                        className="rounded-full"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                  <div className="relative flex w-fit h-fit">
                    {nft?.profile?.username?.localName
                      ? nft?.profile?.username?.localName?.slice(0, 10) + " ..."
                      : nft?.artist?.slice(0, 10) + " ..."}
                  </div>
                </div>
                <div className="relative w-fit h-fit flex">
                  {moment.unix(Number(nft?.blocktimestamp)).fromNow()}
                </div>
              </div>
              <div className="relative w-full font-start justify-between items-center flex flex-wrap sm:flex-nowrap flex-row gap-3">
                <input
                  disabled={purchaseLoading}
                  type="number"
                  min={1}
                  max={Number(nft?.amount) - Number(nft?.amountSold) || ""}
                  title={nft?.title}
                  placeholder={"1"}
                  value={collectData.amount}
                  step={1}
                  className="relative flex w-20 px-1 h-10 focus:outline-none text-xl text-left text-lg pixel-border-7 rounded-xl bg-viol"
                  onChange={(e) =>
                    setCollectData({
                      ...collectData,
                      amount: Number(e.target.value),
                    })
                  }
                />
                <div className="relative w-fit h-fit justify-end flex text-sm">
                  {(
                    (Number(
                      nft?.prices?.find(
                        (tok) => tok.token?.toLowerCase() == collectData?.token
                      )?.price
                    ) /
                      10 ** 18) *
                    Number(collectData?.amount)
                  )?.toFixed(2)}{" "}
                  {
                    TOKENS?.find(
                      (tok) => collectData?.token == tok.contract?.toLowerCase()
                    )?.symbol
                  }
                </div>
              </div>
              {nft?.prices?.length > 1 && (
                <div className="relative w-full h-fit flex items-center justify-end flex flex-row gap-2">
                  {nft?.prices?.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className="relative w-fit h-fit flex items-center justify-center"
                      >
                        <div
                          className={`relative w-6 h-6 rounded-full border cursor-canP ${
                            collectData?.token == item?.token?.toLowerCase()
                              ? "opacity-70 border-windows"
                              : "border-black"
                          }`}
                          onClick={() =>
                            setCollectData({
                              ...collectData,
                              token: item.token?.toLowerCase(),
                            })
                          }
                          title={
                            TOKENS.find(
                              (tok) =>
                                tok.contract?.toLowerCase() ==
                                item.token?.toLowerCase()
                            )?.symbol
                          }
                        >
                          <Image
                            src={`${INFURA_GATEWAY}/ipfs/${
                              TOKENS.find(
                                (tok) =>
                                  tok.contract?.toLowerCase() ==
                                  item.token?.toLowerCase()
                              )?.image
                            }`}
                            layout="fill"
                            objectFit="cover"
                            draggable={false}
                            className="rounded-full"
                            alt={
                              TOKENS.find(
                                (tok) =>
                                  tok.contract?.toLowerCase() ==
                                  item.token?.toLowerCase()
                              )?.symbol
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="relative w-full h-fit flex text-xxs text-pink items-start justify-start text-left font-nim">
                {Number(nft?.agentIds?.length || 0) <= 0
                  ? "No Agents Assigned To this Collection."
                  : (Number(nft?.amountSold || 0) > 1 &&
                      Number(nft?.amount || 0) > 2 &&
                      Number(nft?.agentIds?.length || 0) > 0 &&
                      Number(
                        nft?.prices?.find(
                          (tok) =>
                            tok.token?.toLowerCase() == collectData?.token
                        )?.price
                      ) >=
                        Number(
                          tokenThresholds?.find(
                            (t) => t?.token?.toLowerCase() == collectData?.token
                          )?.threshold
                        )) ||
                    (Number(nft?.agentIds?.length || 0) > 0 &&
                      Number(nft?.amount || 0) > 2 &&
                      Number(
                        nft?.prices?.find(
                          (tok) =>
                            tok.token?.toLowerCase() == collectData?.token
                        )?.price
                      ) >=
                        Number(
                          tokenThresholds?.find(
                            (t) => t?.token?.toLowerCase() == collectData?.token
                          )?.threshold
                        ) &&
                      agents
                        ?.filter((ag) => nft?.agentIds?.includes(ag?.id))
                        ?.map((bal) =>
                          bal?.balances?.filter(
                            (b) =>
                              Number(b?.collectionId) == nft?.id &&
                              Number(b?.rentBalance) > 0
                          )
                        )
                        ?.filter((arr) => arr?.length > 0)?.length > 0)
                  ? "Agents Activated!"
                  : Number(nft?.amountSold || 0) == 1 &&
                    Number(nft?.agentIds?.length || 0) > 0 &&
                    Number(nft?.amount || 0) > 2 &&
                    Number(
                      nft?.prices?.find(
                        (tok) => tok.token?.toLowerCase() == collectData?.token
                      )?.price
                    ) >=
                      Number(
                        tokenThresholds?.find(
                          (t) => t?.token?.toLowerCase() == collectData?.token
                        )?.threshold
                      )
                  ? "Agents Not Yet Activated for this Collection. One more sale needed! Or recharge now!"
                  : "Agents Not Yet Activated for this Collection. Two more sales needed! Or recharge now!"}
              </div>
              <div className="relative w-full h-fit flex">
                <div
                  className={`relative w-full h-14 bg-windows rounded-md text-white flex items-center justify-center font-nerd hover:opacity-80 ${
                    !purchaseLoading ? "cursor-canP" : "opacity-70"
                  }`}
                  onClick={() => {
                    if (!purchaseLoading) {
                      if (!isConnected) {
                        setOpen?.(!open);
                      } else if (approved) {
                        handlePurchase();
                      } else {
                        handleApprove();
                      }
                    }
                  }}
                >
                  {purchaseLoading ? (
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
                  ) : approved || !isConnected ? (
                    "Collect"
                  ) : (
                    "Approve"
                  )}
                </div>
              </div>
              {nft?.collectionType == CollectionType.IRL && (
                <>
                  <div
                    className={`relative bg-windows rounded-md w-fit h-fit flex text-sm flex p-1 items-center justify-center text-center font-nerd text-white`}
                  >
                    {nft?.format}
                  </div>
                  <div className="relative w-full h-fit flex flex-row gap-3 justify-between font-nerd">
                    <div className="relative w-full h-fit flex flex-col gap-1 items-start justify-start">
                      <div className="relative w-fit h-fit flex items-start justify-start text-left">
                        Sizes
                      </div>
                      <div className="relative w-full h-fit flex flex-wrap md:flex-row gap-3 text-viol">
                        {nft?.sizes?.map((item, index) => {
                          return (
                            <div
                              key={index}
                              className={`hover:opacity-60 relative bg-windows p-1 w-fit h-fit flex cursor-canP text-sm flex items-center justify-center text-center ${
                                collectData.size == item && "opacity-70"
                              } ${
                                nft?.format == Format.Sticker ||
                                nft?.format == Format.Poster
                                  ? "rounded-md"
                                  : "rounded-full"
                              }`}
                              onClick={() =>
                                setCollectData({
                                  ...collectData,
                                  size: item,
                                })
                              }
                            >
                              <div
                                className={`relative flex items-center justify-center  ${
                                  nft?.format == Format.Sticker ||
                                  nft?.format == Format.Poster
                                    ? "w-fit h-fit"
                                    : "w-6 h-6 "
                                }`}
                              >
                                {item}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {nft?.format !== Format.Sticker &&
                      nft?.format !== Format.Poster && (
                        <div className="relative w-full h-fit flex flex-col gap-1 items-start justify-start">
                          <div className="relative w-fit h-fit flex items-start justify-start text-left">
                            Colors
                          </div>
                          <div className="relative w-full h-fit flex gap-3 flex-wrap md:flex-row">
                            {nft?.colors?.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className={`hover:opacity-60 relative rounded-full w-fit h-fit flex cursor-canP text-sm flex items-center justify-center text-center ${
                                    collectData?.color == item && "opacity-70"
                                  }`}
                                  style={{
                                    backgroundColor: item,
                                  }}
                                  onClick={() =>
                                    setCollectData({
                                      ...collectData,
                                      color: item,
                                    })
                                  }
                                >
                                  <div className="relative w-7 h-7 flex"></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )}
              <div className="relative w-full h-full flex flex-col gap-3 items-start justify-between">
                <div
                  className={`relative w-full h-full flex py-4 overflow-y-scroll ${
                    Number(nft?.remixId) > 0 ? "max-h-28" : "max-h-32"
                  }`}
                >
                  <div
                    className={`py-3 h-fit flex relative items-start justify-start text-left text-sm font-nerd break-all w-full`}
                    dangerouslySetInnerHTML={{
                      __html: descriptionRegex(nft?.description, false),
                    }}
                  ></div>
                </div>
                <div className="relative w-full h-fit flex-col gap-1 flex py-1 items-start justify-start">
                  <div className="relative w-fit h-fit text-right flex text-sm font-nerd">
                    {nft?.isAgent ? "Minted By Agent" : "Minted By Hand"}
                  </div>
                  {Number(nft?.remixId) > 0 && (
                    <div className="w-full h-fit flex relative flex-wrap galaxy:flex-row justify-between items-center">
                      <div className="relative w-fit h-fit text-right flex text-sm font-nerd">
                        Remix Of
                      </div>
                      <div className="relative w-fit h-fit text-right flex text-sm font-nerd">
                        <div
                          className="relative w-5 h-5 cursor-canP flex rounded-sm border border-windows bg-windows"
                          onClick={() => {
                            animationContext?.setPageChange?.(true);
                            router.prefetch(
                              `/nft/${nft?.remix?.profile?.username?.localName}/${nft?.remixId}`
                            );
                            router.push(
                              `/nft/${nft?.remix?.profile?.username?.localName}/${nft?.remixId}`
                            );
                          }}
                        >
                          <Image
                            draggable={false}
                            src={`${INFURA_GATEWAY}/ipfs/${
                              nft?.remix?.image?.split("ipfs://")?.[1]
                            }`}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : screen == 1 ? (
            <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
              {Number(nft?.collectors?.length || 0) < 1 ? (
                <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                  No Collectors Yet.
                </div>
              ) : (
                <div className="relative w-full h-fit flex flex-col items-start justify-start gap-6">
                  {nft?.collectors?.map((collector, key) => {
                    return (
                      <div
                        key={key}
                        className="relative w-full h-fit flex cursor-canP justify-between items-center flex-wrap sm:flex-nowrap flex-row gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://block-explorer.testnet.lens.dev/tx/${collector?.transactionHash}`
                          );
                        }}
                      >
                        {collector?.name ? (
                          <div
                            className="relative w-fit h-fit flex flex-row gap-1 items-center justify-center cursor-canP"
                            onClick={(e) => {
                              e.stopPropagation();
                              animationContext?.setPageChange?.(true);
                              router.prefetch(`/user/${collector?.localName}`);
                              router.push(`/user/${collector?.localName}`);
                            }}
                          >
                            {collector?.pfp && (
                              <div className="relative rounded-full w-6 h-6 bg-crema border border-windows">
                                <Image
                                  src={`${INFURA_GATEWAY}/ipfs/${
                                    (collector?.pfp || "")?.split(
                                      "ipfs://"
                                    )?.[1]
                                  }`}
                                  alt="pfp"
                                  draggable={false}
                                  className="rounded-full"
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                            )}
                            <div className="relative w-fit h-fit flex text-xs font-nim">
                              @
                              {collector?.name?.length > 10
                                ? collector?.name?.slice(0, 10) + " ..."
                                : collector?.name}
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-fit h-fit flex font-nim text-xs">
                            {collector?.address?.slice(0, 10) + " ..."}
                          </div>
                        )}

                        <div className="relative w-fit h-fit flex items-center justify-center font-nim">
                          X {collector?.amount}
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-center font-nim text-xs">
                          {moment
                            .unix(Number(collector?.blockTimestamp))
                            .fromNow()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : screen == 2 ? (
            <div className="relative w-full gap-3 flex flex-col h-full justify-between">
              {Number(nft?.agentActivity?.length || 0) < 1 ? (
                <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                  No Agent Activity Yet.
                </div>
              ) : (
                <div
                  className="relative w-full h-[20rem] overflow-y-scroll"
                  id="scrollableDiv"
                >
                  <InfiniteScroll
                    scrollableTarget="scrollableDiv"
                    dataLength={nft?.agentActivity?.length || 1}
                    next={handleMoreActivity}
                    hasMore={hasMore}
                    loader={<div key={0} />}
                    className="relative w-full"
                  >
                    <Comments
                      agents={agents}
                      comments={nft?.agentActivity || []}
                      setImageView={setImageView}
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
          ) : screen == 3 ? (
            <div className="relative w-full h-full flex-col gap-3 overflow-y-scroll flex items-start justify-start">
              <div className="relative w-full h-fit flex items-center justify-center">
                <CiCircleQuestion
                  size={20}
                  className="cursor-canP"
                  onClick={() => setToolTip(true)}
                  color="#0000f5"
                />
              </div>
              <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3">
                {agents
                  ?.filter((ag) => nft?.agentIds?.includes(ag?.id))
                  ?.map((agent, key) => {
                    const worker = agent?.workers?.find(
                      (ag) => Number(ag?.collectionId) == Number(nft?.id)
                    );

                    return (
                      <div
                        key={key}
                        className="relative w-full h-fit font-nerd flex justify-between items-center flex-col gap-2"
                      >
                        <div className="relative w-full h-px flex bg-windows"></div>
                        <div className="relative w-full h-fit flex flex-row gap-2 justify-between items-center md:flex-nowrap flex-wrap">
                          <div
                            className="relative w-fit h-fit flex cursor-canP"
                            onClick={(e) => {
                              e.stopPropagation();
                              animationContext?.setPageChange?.(true);
                              router.prefetch(`/agent/${agent?.id}`);
                              router.push(`/agent/${agent?.id}`);
                            }}
                          >
                            <div className="relative w-8 h-8 flex rounded-sm">
                              <Image
                                src={`${INFURA_GATEWAY}/ipfs/${
                                  agent?.cover?.split("ipfs://")?.[1]
                                }`}
                                alt="pfp"
                                draggable={false}
                                layout="fill"
                                className="rounded-sm"
                                objectFit="contain"
                              />
                            </div>
                          </div>
                          <input
                            className="relative w-full h-8 p-1 bg-viol text-sm text-windows focus:outline-none pixel-border-7"
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
                                  collectData?.token ==
                                  tok.contract?.toLowerCase()
                              )?.symbol
                            }
                          </div>
                          <div className="relative w-fit h-fit flex">
                            <div
                              className={`relative w-24 h-8 bg-windows text-white rounded-md hover:opacity-80 flex items-center justify-center text-xxs ${
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
                                      collectData?.token!,
                                      Number(agent?.id)
                                    );
                                  } else {
                                    handleApproveRecharge(
                                      key,
                                      collectData?.token!
                                    );
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
                              ) : approvedRecharge[key] || !isConnected ? (
                                "Recharge"
                              ) : (
                                "Approve"
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="relative w-full h-fit flex items-start justify-between gap-2 text-xs flex-col">
                          <div className="relative w-full h-fit flex items-start justify-between flex-row gap-1">
                            <div className="relative w-fit h-fit flex">
                              Active Collection Balance:
                            </div>
                            <div className="relative w-fit h-fit flex">
                              {Number(
                                agent?.balances?.find(
                                  (bal) =>
                                    Number(bal?.collectionId) ==
                                      Number(nft?.id) &&
                                    bal?.token?.toLowerCase() ==
                                      collectData?.token?.toLowerCase()
                                )?.rentBalance || 0
                              ) /
                                10 ** 18}
                            </div>
                          </div>
                          <div className="relative w-full h-fit flex flex-wrap items-center justify-between gap-2">
                            {worker?.publish && (
                              <div className="relative w-fit h-fit flex items-start justify-between flex-col gap-1">
                                <div className="relative w-fit h-fit flex">
                                  Publishing Rate:
                                </div>
                                <div className="relative w-fit h-fit flex">
                                  {Number(worker?.publishFrequency || 0) *
                                    (Number(
                                      tokenThresholds?.find(
                                        (thr) =>
                                          thr?.token?.toLowerCase() ==
                                          collectData?.token
                                      )?.rentPublish || 0
                                    ) /
                                      10 ** 18)}
                                </div>
                              </div>
                            )}
                            {worker?.remix && (
                              <div className="relative w-fit h-fit flex items-start justify-between flex-col gap-1">
                                <div className="relative w-fit h-fit flex">
                                  Remix Rate:
                                </div>
                                <div className="relative w-fit h-fit flex">
                                  {Number(worker?.remixFrequency || 0) *
                                    (Number(
                                      tokenThresholds?.find(
                                        (thr) =>
                                          thr?.token?.toLowerCase() ==
                                          collectData?.token
                                      )?.rentRemix || 0
                                    ) /
                                      10 ** 18)}
                                </div>
                              </div>
                            )}
                            {worker?.mint && (
                              <div className="relative w-fit h-fit flex items-start justify-between flex-col gap-1">
                                <div className="relative w-fit h-fit flex">
                                  Mint Rate:
                                </div>
                                <div className="relative w-fit h-fit flex">
                                  {Number(worker?.mintFrequency || 0) *
                                    (Number(
                                      tokenThresholds?.find(
                                        (thr) =>
                                          thr?.token?.toLowerCase() ==
                                          collectData?.token
                                      )?.rentMint || 0
                                    ) /
                                      10 ** 18)}
                                </div>
                              </div>
                            )}
                            {worker?.lead && (
                              <div className="relative w-fit h-fit flex items-start justify-between flex-col gap-1">
                                <div className="relative w-fit h-fit flex">
                                  Lead Gen Rate:
                                </div>
                                <div className="relative w-fit h-fit flex">
                                  {Number(worker?.leadFrequency || 0) *
                                    (Number(
                                      tokenThresholds?.find(
                                        (thr) =>
                                          thr?.token?.toLowerCase() ==
                                          collectData?.token
                                      )?.rentLead || 0
                                    ) /
                                      10 ** 18)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="relative w-full h-fit text-pink text-sm break-all flex">
                          {(Number(
                            agent?.balances?.find(
                              (bal) =>
                                Number(bal?.collectionId) == Number(nft?.id)
                            )?.rentBalance
                          ) || 0) /
                            10 ** 18 >
                          0
                            ? `If not recharged, Agent will run out in ${(
                                Number(
                                  agent?.balances?.find(
                                    (bal) =>
                                      Number(bal?.collectionId) ==
                                      Number(nft?.id)
                                  )?.rentBalance || 0
                                ) /
                                10 ** 18 /
                                calculateRent(
                                  tokenThresholds?.find(
                                    (t) =>
                                      t?.token?.toLowerCase() ==
                                      collectData?.token
                                  )!,
                                  worker!
                                )
                              )?.toFixed(0)} cycles.`
                            : "Agent needs to be recharged to start activity."}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="relative font-nerd text-sm w-full h-full flex flex-col gap-5 items-start justify-between">
              <div className="relative w-full h-fit flex flex-row gap-3 items-start justify-between flex-wrap">
                <div className="relative w-fit hit flex">Image Model:</div>
                <div className="relative w-fit h-fit flex">{nft?.model}</div>
              </div>
              <div className="relative w-full h-full flex flex-col gap-3 items-start justify-start">
                <div className="relative w-fit hit flex">Image Prompt:</div>
                <div
                  className={`relative w-full h-full flex overflow-y-scroll max-h-60`}
                >
                  <div
                    className={`h-fit flex relative items-start justify-start text-left break-all w-full`}
                    dangerouslySetInnerHTML={{
                      __html: descriptionRegex(nft?.prompt || "", false),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Purchase;
