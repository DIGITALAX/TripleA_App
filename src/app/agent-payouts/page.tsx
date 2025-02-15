"use client";

import useAgentPayouts from "@/components/AgentPayouts/hooks/useAgentPayouts";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import moment from "moment";
import { useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AnimationContext, ModalContext } from "../providers";
import Image from "next/legacy/image";
import { useRouter } from "next/navigation";

export default function AgentPayouts() {
  const context = useContext(ModalContext);
  const router = useRouter();
  const animationContext = useContext(AnimationContext);
  const {
    screen,
    setScreen,
    ordersLoading,
    ownersPaid,
    collectorsPaid,
    handleMorePaid,
    hasMore,
    devTreasuryPaid,
  } = useAgentPayouts(context?.lensClient!);

  return (
    <div className="relative w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start font-nerd text-viol min-h-96">
      <div className="relative w-full h-full p-3 flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex flex-row justify-between items-center">
          <div
            className="relative w-fit h-fit flex items-center justiy-center cursor-canP"
            onClick={() => setScreen(screen > 0 ? screen - 1 : 2)}
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
          <div className="text-sm relative flex w-fit h-fit text-center">
            {screen < 1
              ? "Agent Owners Paid"
              : screen == 1
              ? "Collectors Paid"
              : "Dev Treasury Paid"}
          </div>
          <div
            className="relative w-fit h-fit flex items-center justiy-center cursor-canP"
            onClick={() => setScreen(screen < 3 ? screen + 1 : 0)}
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
        <div className="relative w-full h-full flex flex-col gap-6 items-center justify-center">
          <div
            className="relative w-full h-[50%] overflow-y-scroll"
            id="scrollableDiv"
          >
            <InfiniteScroll
              scrollableTarget="scrollableDiv"
              dataLength={
                (screen < 1
                  ? ownersPaid
                  : screen == 1
                  ? collectorsPaid
                  : devTreasuryPaid
                )?.length || 1
              }
              next={handleMorePaid}
              hasMore={
                screen < 1
                  ? hasMore?.owners
                  : screen == 1
                  ? hasMore?.collectors
                  : hasMore?.dev
              }
              loader={<div key={0} />}
              className="relative w-full gap-6 flex flex-col"
            >
              {ordersLoading ||
              (screen < 1
                ? ownersPaid
                : screen == 1
                ? collectorsPaid
                : devTreasuryPaid
              )?.length < 1
                ? Array.from({ length: 10 }).map((_, key) => {
                    return (
                      <div
                        className="relative animate-pulse w-full h-px bg-viol"
                        key={key}
                      ></div>
                    );
                  })
                : (screen < 1
                    ? ownersPaid
                    : screen == 1
                    ? collectorsPaid
                    : devTreasuryPaid
                  )?.map((item, key) => {
                    return (
                      <div
                        className="relative w-full h-fit flex flex-col gap-1.5"
                        key={key}
                      >
                        <div
                          className="relative w-full h-fit flex cursor-canP justify-between items-center flex-row gap-2"
                          onClick={() =>
                            window.open(
                              `https://block-explorer.testnet.lens.dev/tx/${item?.transactionHash}`
                            )
                          }
                        >
                          <div
                            className="relative w-fit h-fit flex cursor-canP"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              animationContext?.setPageChange?.(true);
                              router.prefetch(
                                `/nft/${
                                  (
                                    item as any
                                  )?.profile?.username?.value?.split(
                                    "lens/"
                                  )?.[1]
                                }/${item?.collection?.collectionId}`
                              );
                              router.push(
                                `/nft/${
                                  (
                                    item as any
                                  )?.profile?.username?.value?.split(
                                    "lens/"
                                  )?.[1]
                                }/${item?.collection?.collectionId}`
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
                                  item?.collection?.metadata?.image?.split(
                                    "ipfs://"
                                  )?.[1]
                                }`}
                              />
                            </div>
                          </div>
                          {(item as any)?.profile && (
                            <div
                              className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row"
                              onClick={(e) => {
                                e.stopPropagation();
                                animationContext?.setPageChange?.(true);
                                router.prefetch(
                                  `/user/${
                                    (item as any)?.profile?.username?.localName
                                  }`
                                );
                                router.push(
                                  `/user/${
                                    (item as any)?.profile?.username?.localName
                                  }`
                                );
                              }}
                            >
                              <div className="relative flex rounded-full w-8 h-8 bg-pink border border-pink">
                                {(item as any)?.profile?.metadata?.picture && (
                                  <Image
                                    src={`${INFURA_GATEWAY}/ipfs/${
                                      (
                                        item as any
                                      )?.profile?.metadata?.picture?.split(
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
                                {"@" +
                                  (
                                    item as any
                                  )?.profile?.username?.localName?.slice(0, 10)}
                              </div>
                            </div>
                          )}
                          {screen < 2 && (
                            <div className="relative w-fit h-fit flex text-xs">
                              {(screen < 1
                                ? (item as any)?.owner
                                : (item as any)?.collector
                              )?.slice(0, 10) + " ..."}
                            </div>
                          )}
                          <div className="relative w-fit h-fit flex items-center justify-center">
                            {Number(item?.amount) / 10 ** 18}{" "}
                            {
                              TOKENS.find(
                                (tok) =>
                                  tok.contract?.toLowerCase() ==
                                  item?.token?.toLowerCase()
                              )?.symbol
                            }
                          </div>
                          <div className="relative w-fit h-fit flex items-center justify-center text-xs">
                            {moment
                              .unix(Number(item?.blockTimestamp))
                              .fromNow()}
                          </div>
                        </div>
                        <div className="relative w-full h-px bg-viol flex"></div>
                      </div>
                    );
                  })}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  );
}
