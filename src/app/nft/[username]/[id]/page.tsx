"use client";

import { AnimationContext, ModalContext } from "@/app/providers";
import useNFT from "@/components/NFT/hooks/useNFT";
import Data from "@/components/NFT/modules/Data";
import Purchase from "@/components/NFT/modules/Purchase";
import { INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/legacy/image";
import { useParams, useRouter } from "next/navigation";
import { useContext } from "react";

export default function NFT() {
  const id = useParams();
  const context = useContext(ModalContext);
  const animationContext = useContext(AnimationContext);
  const router = useRouter();
  const {
    nft,
    nftLoading,
    setNft,
    hasMore,
    handleMoreActivity,
    agentLoading,
    handlePosts,
    moreCollections,
    moreCollectionsLoading,
  } = useNFT(
    id?.id as string,
    context?.lensClient!,
    context?.agents!,
    context?.lensConnected
  );

  return (
    <div className="relative w-full h-full flex items-start justify-between flex-col py-6 px-10 gap-24">
      <div className="relative w-full h-[60rem] md:h-[40rem] flex flex-col md:flex-row items-center justify-between gap-4 pb-10 px-6 pt-6">
        <Data
          id={nft?.id!}
          url={nft?.image!}
          setImageView={context?.setImageView!}
        />
        <Purchase
          nft={nft!}
          setFulfillmentOpen={context?.setFulfillmentOpen!}
          handlePosts={handlePosts}
          tokenThresholds={context?.tokenThresholds!}
          setIndexer={context?.setIndexer!}
          nftLoading={nftLoading}
          setNotification={context?.setNotification!}
          setNft={setNft}
          hasMore={hasMore}
          handleMoreActivity={handleMoreActivity}
          agentLoading={agentLoading}
          lensConnected={context?.lensConnected}
          setSignless={context?.setSignless!}
          storageClient={context?.storageClient!}
          setImageView={context?.setImageView!}
          agents={context?.agents!}
          fulfillers={context?.fulfillers!}
        />
      </div>
      <div className="relative w-full h-fit flex items-center justify-center">
        <div className="relative w-5/6 flex items-center justify-center flex-col gap-3 h-fit">
          <div className="relative w-fit h-fit flex font-nim text-white text-3xl uppercase">
            {"<= MORE ART =>"}
          </div>
          <div className="relative w-full h-fit flex overflow-x-scroll">
            <div className="relative w-fit h-fit flex flex-row gap-6">
              {moreCollectionsLoading
                ? Array.from({ length: 20 }).map((_, index) => {
                    return (
                      <div
                        className="relative w-fit h-fit flex flex-row gap-6 items-center justify-center"
                        key={index}
                      >
                        <div className="relative animate-pulse flex w-56 h-56 rounded-3xl pixel-border-6 bg-white p-3">
                          <div className="pixel-border-7 w-full h-full relative bg-mochi rounded-xl"></div>
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
                : moreCollections.map((coll, index: number) => {
                    return (
                      <div
                        className="relative w-fit h-fit flex flex-row gap-6 items-center justify-center"
                        key={index}
                      >
                        <div
                          className="relative cursor-canP flex w-56 h-56 bg-white pixel-border-6 rounded-3xl p-3"
                          onClick={() => {
                            animationContext?.setPageChange?.(true);
                            router.push(
                              `/nft/${
                                coll?.profile?.username?.value?.split(
                                  "lens/"
                                )?.[1]
                              }/${coll?.id}`
                            );
                          }}
                        >
                          <div className="pixel-border-7 w-full h-full relative bg-mochi rounded-xl">
                            <Image
                              draggable={false}
                              layout="fill"
                              objectFit="cover"
                              src={`${INFURA_GATEWAY}/ipfs/${
                                coll?.image?.split("ipfs://")?.[1]
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
