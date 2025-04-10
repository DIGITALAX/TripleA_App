import { FunctionComponent, JSX, useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useGallery from "../hooks/useGallery";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import { NFTData } from "../types/common.types";
import { useRouter } from "next/navigation";
import { AnimationContext } from "@/app/providers";

const Gallery: FunctionComponent<{
  choice: string;
}> = ({ choice }): JSX.Element => {
  const animationContext = useContext(AnimationContext);
  const {
    handleMoreGallery,
    nfts,
    hasMore,
    galleryLoading,
    priceIndex,
    setPriceIndex,
  } = useGallery(choice);
  const router = useRouter();

  return (
    <div className="relative w-full h-fit flex flex-col text-white">
      <div
        id="scroll"
        className="relative w-full h-[40rem] overflow-y-scroll flex"
      >
        <div className="relative w-full h-full px-3">
          <InfiniteScroll
            key={"gallery"}
            dataLength={nfts?.length}
            next={handleMoreGallery}
            hasMore={hasMore}
            loader={<div key={0} />}
            scrollableTarget="scroll"
            className="grid grid-cols-1 sm:grid-cols-2 tablet:grid-cols-3 gap-10 xl:w-max h-fit pb-10 items-start justify-between xl:w-auto w-full sm:w-[calc(100vw-10rem)]"
          >
            {(galleryLoading || Number(nfts?.length) < 1
              ? [...nfts, ...Array.from({ length: 20 })]
              : nfts
            ).map((nft: NFTData | unknown, index: number) => {
              return (
                <>
                  {(nft as any)?.id !== undefined &&
                  Number((nft as any)?.id) > 0 ? (
                    <div
                      key={`nft-${(nft as NFTData).id}`}
                      className={`w-full sm:w-fit h-fit flex relative flex-col gap-3`}
                    >
                      <div className="w-full sm:w-40 h-80 sm:h-40 xl:w-56 xl:h-56 rounded-3xl bg-white flex p-2 relative pixel-border-6 gap-2">
                        <div className="relative w-full h-full flex bg-mochi pixel-border-7 rounded-lg">
                          <div className="relative w-full h-full  rounded-sm bg-mochi p-2">
                            <div
                              className="relative w-full h-full flex bg-mochi cursor-canP"
                              onClick={() => {
                                animationContext?.setPageChange?.(true);
                                router.push(
                                  `/nft/${
                                    (
                                      nft as NFTData
                                    )?.profile?.username?.value?.split(
                                      "lens/"
                                    )?.[1]
                                  }/${(nft as NFTData)?.id}`
                                );
                              }}
                            >
                              <Image
                                src={`${INFURA_GATEWAY}/ipfs/${
                                  (nft as NFTData).image?.split("ipfs://")?.[1]
                                }`}
                                alt={"NFT " + (nft as NFTData).id}
                                className="w-full h-full flex relative"
                                layout="fill"
                                objectFit="cover"
                                draggable={false}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative w-full h-fit flex text-xxs text-left font-start">
                        {(nft as NFTData)?.title?.length > 15
                          ? (nft as NFTData)?.title?.slice(0, 12) + "..."
                          : (nft as NFTData)?.title}
                      </div>
                      <div className="relative h-1 w-full flex bg-white"></div>
                      <div className="relative w-full h-fit flex justify-between items-center flex-row gap-2 font-jackey2">
                        <div className="relative w-fit h-fit flex flex-row gap-2">
                          <svg
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="size-6"
                          >
                            <path
                              d="M6 2h12v2H6V2zM4 6V4h2v2H4zm0 12V6H2v12h2zm2 2v-2H4v2h2zm12 0v2H6v-2h12zm2-2v2h-2v-2h2zm0-12h2v12h-2V6zm0 0V4h-2v2h2zm-9-1h2v2h3v2h-6v2h6v6h-3v2h-2v-2H8v-2h6v-2H8V7h3V5z"
                              fill="white"
                            />
                          </svg>
                          <div className="relative w-fit h-fit flex items-center justify-center gap-2">
                            <div className="relative w-fit h-fit flex items-center justify-center lg:text-base text-xs">
                              {(
                                Number(
                                  (nft as NFTData)?.prices?.[
                                    priceIndex?.[index]
                                  ]?.price
                                ) /
                                10 ** 18
                              )?.toFixed(0)}{" "}
                              {
                                TOKENS?.find(
                                  (tok) =>
                                    (nft as NFTData)?.prices?.[
                                      priceIndex?.[index]
                                    ]?.token?.toLowerCase() ==
                                    tok.contract?.toLowerCase()
                                )?.symbol
                              }
                            </div>
                            {(nft as NFTData)?.prices?.length > 1 && (
                              <div
                                className="relative w-fit h-fit flex items-center justify-center cursor-canP"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setPriceIndex((prev) => {
                                    const arr = [...prev];
                                    arr[index] =
                                      arr[index] + 1 >
                                      (nft as NFTData)?.prices?.length
                                        ? 0
                                        : arr[index] + 1;

                                    return arr;
                                  });
                                }}
                              >
                                {">>"}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="relative text-xxs flex">
                          {(nft as NFTData)?.amountSold || 0} /{" "}
                          {(nft as NFTData)?.amount}
                        </div>
                      </div>
                      <div className="relative w-full justify-start h-fit flex">
                        <div
                          className="relative flex w-fit h-fit pixel-border-5 font-start text-xxs p-1 cursor-canP bg-white text-black rounded-xl"
                          onClick={() => {
                            animationContext?.setPageChange?.(true);
                            router.push(
                              `/nft/${
                                (
                                  nft as NFTData
                                )?.profile?.username?.value?.split("lens/")?.[1]
                              }/${(nft as NFTData)?.id}`
                            );
                          }}
                        >
                          Look Closer
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-full sm:w-fit h-fit flex relative animate-pulse`}
                    >
                      <div
                        key={`placeholder-${index}`}
                        className="w-full sm:w-40 h-80 sm:h-40 xl:w-56 xl:h-56 rounded-3xl bg-white flex p-2 relative pixel-border-6 gap-2"
                      >
                        <div className="relative w-full h-full flex bg-mochi pixel-border-7 rounded-lg">
                          <div className="relative w-full h-full bg-mochi p-2 rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })}
          </InfiniteScroll>
        </div>
      </div>
      <div className="relative w-full h-fit flex">
        <div className="relative w-full h-7 bg-pink flex"></div>
        <div className="absolute w-fit h-fit -bottom-10 z-10 -right-10 flex">
          <div className="relative w-40 h-24 flex">
            <Image
              src={`${INFURA_GATEWAY}/ipfs/QmTgW32sekGrjiSxXyBQjecT6KhqgAK3DchdJC63bSaom6`}
              layout="fill"
              objectFit="contain"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
