"use client";

import { useContext, useState } from "react";
import GalleryItems from "@/components/Common/modules/Gallery";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { AnimationContext, ModalContext } from "../providers";
import { useRouter } from "next/navigation";

export default function Gallery() {
  const context = useContext(ModalContext);
  const animationContext = useContext(AnimationContext);
  const [openChoice, setOpenChoice] = useState<boolean>(false);
  const [choice, setChoice] = useState<string>("All Minted");
  const router = useRouter();
  return (
    <div className="relative w-full h-full flex items-start justify-between flex-col py-6 px-10 gap-24">
      <div className="relative w-full h-fit flex flex-row justify-between items-start gap-6">
        <div className="relative w-fit h-fit flex items-start justify-start">
          <div className="relative w-80 h-60 flex top-20 left-10">
            <Image
              src={`${INFURA_GATEWAY}/ipfs/QmbxJAdseh52v72wdSztAVWghF1FTDE3Uee2gJJ2wHR17a`}
              draggable={false}
              layout="fill"
            />
          </div>
        </div>
        <div className="relative flex flex-col w-fit h-fit items-between justify-start gap-5">
          <div className="relative w-full h-fit flex justify-between items-center flex-row gap-3">
            <div className="relative w-fit h-fit flex font-nim text-white text-3xl uppercase left-12">
              Agent Art Market
            </div>
            <div
              className="relative w-36 h-fit flex font-nerd text-white text-sm cursor-canP flex-row gap-2 items-center justify-center border border-verde"
              onClick={() => setOpenChoice(!openChoice)}
            >
              <div className="relative w-fit h-fit flex items-center justify-center">
                {choice}
              </div>
              <div className="relative w-fit h-fit text-lg top-px flex items-center justify-center">
                ▼
              </div>
              {openChoice && (
                <div className="absolute w-full top-7 bg-windows h-fit flex flex-col items-center justify-start text-xs text-white border border-verde z-20">
                  {["All Minted", "Minted By Agent", "Minted By Hand"]
                    .filter((item) => item !== choice)
                    .map((item: string, index: number) => {
                      return (
                        <div
                          key={index}
                          className={`relative w-full h-8 flex items-center justify-center cursor-canP hover:opacity-70 ${
                            index !== item.length - 1 && "border-b border-verde"
                          }`}
                          onClick={() => {
                            setOpenChoice(false);
                            setChoice(item);
                          }}
                        >
                          {item}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
          <GalleryItems lensClient={context?.lensClient!} choice={choice} />
        </div>
      </div>
      <div className="relative w-full h-fit flex items-center justify-center">
        <div className="relative w-5/6 flex items-center justify-center flex-col gap-3 h-fit">
          <div className="relative w-fit h-fit flex font-nim text-white text-3xl uppercase">
            {"<= AGENTS ONBOARD =>"}
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
                : context?.agents.map((agent, index) => {
                    return (
                      <div
                        className="relative w-fit h-fit flex flex-row gap-6 items-center justify-center"
                        key={index}
                      >
                        <div
                          className="relative cursor-canP flex w-56 h-56 rounded-md bg-pink p-4"
                          onClick={() => {
                            animationContext?.setPageChange?.(true);
                            router.prefetch(`/agent/${agent.id}`);
                            router.push(`/agent/${agent.id}`);
                          }}
                        >
                          <div className="pixel-border-3 w-full h-full relative bg-mochi rounded-xl">
                            <Image
                              draggable={false}
                              layout="fill"
                              objectFit="cover"
                              src={`${INFURA_GATEWAY}/ipfs/${
                                agent.cover?.split("ipfs://")?.[1]
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
