import { FunctionComponent, JSX, useContext } from "react";

import {
  CollectionType,
  CollectsProps,
  Format,
  Switcher,
} from "../types/dashboard.types";
import useCollects from "../hooks/useCollects";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import moment from "moment";
import { AnimationContext } from "@/app/providers";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-network/sdk/viem";

const Collects: FunctionComponent<CollectsProps> = ({
  setSwitcher,
  lensClient,
  setNotification,
}): JSX.Element => {
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const { address } = useAccount();
  const {
    allCollects,
    collectsLoading,
    decryptOrder,
    decryptLoading,
    updateOrderFulfillment,
    updateLoading,
    fulfillmentEncrypted,
    updateOrderFulfillmentEncrypt,
    setFulfillmentOpen,
    fulfillmentOpen,
    setFulfillmentInfo,
    fulfillmentInfo,
  } = useCollects(address, lensClient, setNotification, publicClient);
  const animationContext = useContext(AnimationContext);
  const router = useRouter();
  return (
    <div className="relative w-full h-full flex items-start px-4 sm:px-20 py-10 justify-start font-nerd text-windows">
      <div className="relative w-full min-h-80 h-full bg-viol rounded-md p-3 flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex items-start justify-start">
          <div
            className="relative flex w-fit h-fit cursor-canP hover:opacity-70"
            onClick={() => setSwitcher(Switcher.Home)}
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
        </div>
        <div className="flex relative w-full h-full items-center justify-start overflow-x-scroll">
          <div
            className={`relative h-full flex flex-row gap-6 ${
              !collectsLoading && allCollects?.length < 1 ? "w-full" : "w-fit"
            }`}
          >
            {collectsLoading ? (
              Array.from({ length: 10 }).map((_, key) => {
                return (
                  <div
                    key={key}
                    className="relative w-60 h-96 bg-pink rounded-md animate-pulse rounded-xl"
                  ></div>
                );
              })
            ) : allCollects?.length < 1 ? (
              <div className="relative w-full h-96 flex items-center justify-center text-sm text-gray-600 font-jack">
                No Collects Yet.
              </div>
            ) : (
              allCollects?.map((collect, key) => {

                return (
                  <div
                    key={key}
                    className={`relative w-60 h-96 bg-pink rounded-md flex flex-col items-center justify-between p-2 font-nerd`}
                  >
                    {fulfillmentOpen?.[key] ? (
                      <>
                        <div className="relative w-full h-fit flex items-end justify-end pb-2">
                          <div
                            className={`relative flex w-fit h-fit cursor-canP hover:opacity-70`}
                            onClick={() =>
                              setFulfillmentOpen((prev) => {
                                let arr = [...prev];
                                arr[key] = false;

                                return arr;
                              })
                            }
                          >
                            <svg
                              className="size-4"
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
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-center">
                          Fulfillment Details
                        </div>
                        {allCollects?.[key]?.fulfillmentDetails ? (
                          <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-center">
                            <div className="relative w-full h-fit flex flex-row justify-center items-center gap-3">
                              <div className="relative w-fit h-fit flex flex-col gap-1 items-center justify-center">
                                <div className="relative w-fit h-fit flex">
                                  Size
                                </div>
                                <div
                                  className={`relative flex text-white bg-windows items-center justify-center p-1 ${
                                    allCollects?.[key]?.collection?.format ==
                                      Format.Sticker ||
                                    allCollects?.[key]?.collection?.format ==
                                      Format.Poster
                                      ? "w-fit h-fit rounded-md"
                                      : "w-5 h-5 rounded-full"
                                  }`}
                                >
                                  {allCollects?.[key]?.fulfillmentDetails?.size}
                                </div>
                              </div>
                              {allCollects?.[key]?.collection?.format !==
                                Format.Sticker &&
                                allCollects?.[key]?.collection?.format !==
                                  Format.Poster && (
                                  <div className="relative w-fit h-fit flex flex-col gap-1 items-center justify-center">
                                    <div className="relative w-fit h-fit flex">
                                      Color
                                    </div>
                                    <div
                                      className={`relative rounded-full w-5 h-5 flex text-sm flex items-center justify-center text-center`}
                                      style={{
                                        backgroundColor:
                                          allCollects?.[key]?.fulfillmentDetails
                                            ?.color,
                                      }}
                                    ></div>
                                  </div>
                                )}
                            </div>
                            <div className="relative w-full h-fit flex items-start justify-between flex-row gap-3">
                              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                                <div className="relative w-fit h-fit flex">
                                  Name
                                </div>
                                <input
                                  disabled={
                                    updateLoading?.[key] ||
                                    decryptLoading?.[key] ||
                                    allCollects?.[key]?.fulfilled
                                  }
                                  onChange={(e) =>
                                    setFulfillmentInfo((prev) => {
                                      let arr = [...prev];
                                      arr[key] = {
                                        ...arr?.[key],
                                        name: e.target.value,
                                      };
                                      return arr;
                                    })
                                  }
                                  className="relative w-full text-windows bg-viol h-8 border border-black focus:outline-none p-1"
                                  value={fulfillmentInfo?.[key]?.name}
                                />
                              </div>
                              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                                <div className="relative w-fit h-fit flex">
                                  Address
                                </div>
                                <input
                                  disabled={
                                    updateLoading?.[key] ||
                                    decryptLoading?.[key] ||
                                    allCollects?.[key]?.fulfilled
                                  }
                                  onChange={(e) =>
                                    setFulfillmentInfo((prev) => {
                                      let arr = [...prev];
                                      arr[key] = {
                                        ...arr?.[key],
                                        address: e.target.value,
                                      };
                                      return arr;
                                    })
                                  }
                                  className="relative w-full text-windows  bg-viol h-8 border border-black focus:outline-none p-1"
                                  value={fulfillmentInfo?.[key]?.address}
                                />
                              </div>
                            </div>
                            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                              <div className="relative w-fit h-fit flex">
                                Country
                              </div>
                              <input
                                disabled={
                                  updateLoading?.[key] ||
                                  decryptLoading?.[key] ||
                                  allCollects?.[key]?.fulfilled
                                }
                                onChange={(e) =>
                                  setFulfillmentInfo((prev) => {
                                    let arr = [...prev];
                                    arr[key] = {
                                      ...arr?.[key],
                                      country: e.target.value,
                                    };
                                    return arr;
                                  })
                                }
                                className="relative w-full text-windows bg-viol h-8 border border-black focus:outline-none p-1"
                                value={fulfillmentInfo?.[key]?.country}
                              />
                            </div>
                            <div className="relative w-full h-fit flex items-start justify-between flex-row gap-3">
                              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                                <div className="relative w-fit h-fit flex">
                                  State
                                </div>
                                <input
                                  disabled={
                                    updateLoading?.[key] ||
                                    decryptLoading?.[key] ||
                                    allCollects?.[key]?.fulfilled
                                  }
                                  onChange={(e) =>
                                    setFulfillmentInfo((prev) => {
                                      let arr = [...prev];
                                      arr[key] = {
                                        ...arr?.[key],
                                        state: e.target.value,
                                      };
                                      return arr;
                                    })
                                  }
                                  className="relative w-full text-windows bg-viol h-8 border border-black focus:outline-none p-1"
                                  value={fulfillmentInfo?.[key]?.state}
                                />
                              </div>
                              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                                <div className="relative w-fit h-fit flex">
                                  Zip
                                </div>
                                <input
                                  disabled={
                                    updateLoading?.[key] ||
                                    decryptLoading?.[key] ||
                                    allCollects?.[key]?.fulfilled
                                  }
                                  onChange={(e) =>
                                    setFulfillmentInfo((prev) => {
                                      let arr = [...prev];
                                      arr[key] = {
                                        ...arr?.[key],
                                        zip: e.target.value,
                                      };
                                      return arr;
                                    })
                                  }
                                  className="relative w-full text-windows bg-viol h-8 border border-black focus:outline-none p-1"
                                  value={fulfillmentInfo?.[key]?.zip}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-full flex items-center justify-center text-center text-white">
                            <div className="relative w-3/4 h-fit flex">
                              Decrypt your Fulfillment Details to make updates.
                            </div>
                          </div>
                        )}
                        <div className="relative w-full h-fit flex items-center justify-center">
                          <div
                            className={`bg-windows rounded-md text-viol text-center items-center justify-center relative flex w-full h-8 ${
                              !updateLoading?.[key] &&
                              !decryptLoading?.[key] &&
                              !allCollects?.[key]?.fulfilled &&
                              "cursor-canP hover:opacity-70"
                            }`}
                            onClick={() =>
                              !updateLoading?.[key] &&
                              !decryptLoading?.[key] &&
                              !allCollects?.[key]?.fulfilled &&
                              (!allCollects?.[key]?.fulfillmentDetails
                                ? decryptOrder(key)
                                : fulfillmentEncrypted?.[key] == "" &&
                                  allCollects?.[key]?.fulfillmentDetails
                                ? updateOrderFulfillmentEncrypt(key)
                                : updateOrderFulfillment(key))
                            }
                          >
                            {updateLoading?.[key] || decryptLoading?.[key] ? (
                              <svg
                                fill="none"
                                className="size-4 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                                  fill="currentColor"
                                />{" "}
                              </svg>
                            ) : allCollects?.[key]?.fulfilled ? (
                              "FULFILLED"
                            ) : !allCollects?.[key]?.fulfillmentDetails ? (
                              "DECRYPT DETAILS"
                            ) : fulfillmentEncrypted?.[key] == "" &&
                              allCollects?.[key]?.fulfillmentDetails ? (
                              "ENCRYPT UPDATE"
                            ) : (
                              "UPDATE DETAILS"
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {allCollects?.[key]?.collection?.collectionType ==
                          CollectionType.IRL && (
                          <div className="relative w-full h-fit flex items-end justify-end pb-2">
                            <div
                              className={`relative flex w-fit h-fit cursor-canP hover:opacity-70`}
                              onClick={() =>
                                setFulfillmentOpen((prev) => {
                                  let arr = [...prev];
                                  arr[key] = true;

                                  return arr;
                                })
                              }
                            >
                              <svg
                                className="size-4"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                {" "}
                                <path
                                  d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z"
                                  fill="currentColor"
                                />{" "}
                              </svg>
                            </div>
                          </div>
                        )}
                        <div
                          className="relative w-full h-full flex cursor-canP pixel-border-7"
                          onClick={() => {
                            animationContext?.setPageChange?.(true);
                            router.prefetch(
                              `/nft/${
                                (
                                  collect as any
                                )?.profile?.username?.value?.split("lens/")?.[1]
                              }/${collect?.collection?.id}`
                            );
                            router.push(
                              `/nft/${
                                (
                                  collect as any
                                )?.profile?.username?.value?.split("lens/")?.[1]
                              }/${collect?.collection?.id}`
                            );
                          }}
                        >
                          <Image
                            objectFit="cover"
                            layout="fill"
                            draggable={false}
                            alt={collect?.collection?.title}
                            src={`${INFURA_GATEWAY}/ipfs/${
                              collect?.collection?.image?.split("ipfs://")?.[1]
                            }`}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3 pt-4">
                          <div className="relative w-fit h-fit flex text-xs">
                            {collect?.collection?.title}
                          </div>
                          <div
                            className="relative w-full h-fit flex cursor-canP justify-between items-center flex-row gap-2 font-jack text-sm"
                            onClick={() =>
                              window.open(
                                `https://block-explorer.testnet.lens.dev/tx/${collect?.transactionHash}`
                              )
                            }
                          >
                            <div className="relative w-fit h-fit flex items-center justify-center text-white">
                              X {collect?.amount}
                            </div>
                            <div className="relative w-fit h-fit flex items-center justify-center text-white">
                              {moment
                                .unix(Number(collect?.blockTimestamp))
                                .fromNow()}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collects;
