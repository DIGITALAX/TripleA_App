import { AnimationContext } from "@/app/providers";
import { INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/legacy/image";
import { useRouter } from "next/navigation";
import { FunctionComponent, JSX, useContext } from "react";
import { MiniGalleryProps } from "../types/common.types";

const MiniGallery: FunctionComponent<MiniGalleryProps> = ({
  text,
  loader,
  content,
  route,
}): JSX.Element => {
  const animationContext = useContext(AnimationContext);
  const router = useRouter();
  return (
    <div className="relative w-full h-fit flex items-center justify-center">
      <div className="relative w-full sm:w-5/6 flex items-center justify-center flex-col gap-3 h-fit">
        <div className="relative items-center justify-center text-center w-full md:w-fit h-fit flex font-nim text-white text-lg md:text-3xl uppercase">
          {text}
        </div>
        <div className="relative w-full h-fit flex overflow-x-scroll">
          <div className="relative w-fit h-fit flex flex-row gap-6">
            {loader
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
              : content.map((item, index: number) => {
                  return (
                    <div
                      className="relative w-fit h-fit flex flex-row gap-6 items-center justify-center"
                      key={index}
                    >
                      <div
                        className="relative cursor-canP flex w-56 h-56 rounded-md bg-pink p-4"
                        onClick={() => {
                          animationContext?.setPageChange?.(true);
                          router.prefetch(
                            route
                              ? `/agent/${item?.id}`
                              : `/nft/${item?.username}/${item?.id}`
                          );
                          router.push(
                            route
                              ? `/agent/${item?.id}`
                              : `/nft/${item?.username}/${item?.id}`
                          );
                        }}
                      >
                        <div className="pixel-border-3 w-full h-full relative bg-mochi rounded-xl">
                          <Image
                            draggable={false}
                            layout="fill"
                            objectFit="cover"
                            src={`${INFURA_GATEWAY}/ipfs/${
                              item?.cover?.split("ipfs://")?.[1]
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
        <div className="absolute -top-10 sm:top-0 right-0 sm:-right-10 flex w-fit h-fit z-30">
          <div className="relative sm:w-20 w-40 h-10 sm:h-20 flex rotate-[0.5rad]">
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
  );
};

export default MiniGallery;
