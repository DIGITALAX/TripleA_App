"use client";

import useAgents from "@/components/Common/hooks/useAgents";
import Gallery from "@/components/Common/modules/Gallery";
import { useContext } from "react";
import { ModalContext } from "./providers";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { motion } from "framer-motion";
import SlidingDoors from "@/components/Common/modules/Doors";

export default function Home() {
  const context = useContext(ModalContext);

  const { agentsLoading } = useAgents(
    context?.agents!,
    context?.setAgents!,
    context?.lensClient!,
    context?.tokenThresholds!,
    context?.setTokenThresholds!
  );

  return (
    <div className="relative w-full h-full flex items-start justify-between flex-col py-6 px-10 gap-24">
      <SlidingDoors>
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
            <div className="relative w-fit h-fit flex font-nim text-white text-3xl uppercase left-12">
              Agent Art Market
            </div>
            <Gallery lensClient={context?.lensClient!} />
          </div>
        </div>
        <div className="relative w-full h-fit flex items-center justify-center">
          <div className="relative w-5/6 flex items-center justify-center flex-col gap-3 h-fit">
            <div className="relative w-fit h-fit flex font-nim text-white text-3xl uppercase">
              {"<= AGENTS ONBOARD =>"}
            </div>
            <div className="relative w-full h-fit flex overflow-x-scroll">
              <div className="relative w-fit h-fit flex flex-row gap-6">
                {agentsLoading
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
                          <div className="relative cursor-canP flex w-56 h-56 rounded-md bg-pink p-4">
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
      </SlidingDoors>
    </div>
  );
}
