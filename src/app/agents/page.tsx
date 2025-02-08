"use client";

import AgentSwitch from "@/components/Agents/modules/AgentSwitch";
import {
  AgentSwitcher,
  CreateSwitcher,
} from "@/components/Agents/types/agents.types";
import { useContext, useState } from "react";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { AnimationContext, ModalContext } from "../providers";
import { useRouter } from "next/navigation";
import useArt from "@/components/Agents/hooks/useArt";
import { useAccount } from "wagmi";
import { useModal } from "connectkit";
export default function Agents() {
  const [agentSwitcher, setAgentSwitcher] = useState<AgentSwitcher>(
    AgentSwitcher.Gallery
  );
  const [createSwitcher, setCreateSwitcher] = useState<CreateSwitcher>(
    CreateSwitcher.Details
  );
  const router = useRouter();
  const context = useContext(ModalContext);
  const animationContext = useContext(AnimationContext);
  const { moreArt, moreArtLoading } = useArt(
    context?.lensClient!,
    context?.lensConnected!
  );
  const { isConnected } = useAccount();
  const { setOpen } = useModal();

  return (
    <div className="relative w-full h-full flex items-start justify-between flex-col py-6 px-10 gap-24">
      <div className="relative w-full h-fit flex flex-row justify-between items-start gap-6">
        <div className="relative w-fit h-fit flex items-start justify-between flex-col gap-4 top-20 left-10">
          <div className="relative w-80 h-60 flex">
            <Image
              src={`${INFURA_GATEWAY}/ipfs/QmWLPmcf4LerwrL1pTmiWDsFc2rfaMLHeY4Zvim8dhcUur`}
              draggable={false}
              layout="fill"
            />
          </div>
          <div className="relative w-fit h-fit flex items-end justify-end">
            <div
              className="relative w-40 h-10 flex pixel-border-5 bg-white rounded-xl items-center justify-between hover:opacity-70 cursor-canP flex-row gap-2 px-2"
              title={"Create Agent"}
              onClick={() => {
                if (isConnected) {
                  if (agentSwitcher != AgentSwitcher.Create) {
                    setCreateSwitcher(CreateSwitcher.Details);
                  }
                  setAgentSwitcher(
                    agentSwitcher == AgentSwitcher.Create
                      ? AgentSwitcher.Gallery
                      : AgentSwitcher.Create
                  );
                } else {
                  setOpen?.(!open);
                }
              }}
            >
              <svg
                className="size-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M4 2h4v4H4V2zM1 7h10v9H9v6H7v-6H5v6H3v-6H1V7zm18-5h-2v2h-2v2h-2v2h2V6h2v12h-2v-2h-2v2h2v2h2v2h2v-2h2v-2h2v-2h-2v2h-2V6h2v2h2V6h-2V4h-2V2z"
                  fill="currentColor"
                />{" "}
              </svg>
              <svg
                className="size-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M15 9V7h2v2h-2zm2 6v-2h-4v-2h4V9h2v2h2v2h-2v2h-2zm0 0v2h-2v-2h2zm-6-4v2H7v2H5v-2H3v-2h2V9h2v2h4zm-4 4h2v2H7v-2zm2-8v2H7V7h2z"
                  fill="currentColor"
                />{" "}
              </svg>
              <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-6"
              >
                <path
                  d="M10 3H8v2H6v2h2V5h2v2h2v2h-2v2H8v2H6v2H4v-2H2v2h2v2h2v-2h4v2h2v2h-2v2h2v-2h2v-2h-2v-4h2v-2h2v2h2v2h2v-2h2v-2h-2v2h-2v-2h-2V9h2V5h-4v2h-2V5h-2V3z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className={`${agentSwitcher == AgentSwitcher.Create ? "w-full" : "w-fit"} relative flex flex-col h-fit items-between justify-start gap-5`}>
          <div className="relative w-full h-fit flex justify-between items-center">
            <div className="relative w-fit h-fit flex font-nim text-white text-3xl uppercase left-12">
              Agency For Hire
            </div>
          </div>
          <AgentSwitch
            agentSwitcher={agentSwitcher}
            createSwitcher={createSwitcher}
            setCreateSwitcher={setCreateSwitcher}
          />
        </div>
      </div>
      <div className="relative w-full h-fit flex items-center justify-center">
        <div className="relative w-5/6 flex items-center justify-center flex-col gap-3 h-fit">
          <div className="relative w-fit h-fit flex font-nim text-white text-3xl uppercase">
            {"<= ART IN ACTION =>"}
          </div>
          <div className="relative w-full h-fit flex overflow-x-scroll">
            <div className="relative w-fit h-fit flex flex-row gap-6">
              {moreArtLoading
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
                : moreArt.map((art, index) => {
                    return (
                      <div
                        className="relative w-fit h-fit flex flex-row gap-6 items-center justify-center"
                        key={index}
                      >
                        <div
                          className="relative cursor-canP flex w-56 h-56 bg-white pixel-border-6 rounded-3xl p-3"
                          onClick={() => {
                            animationContext?.setPageChange?.(true);
                            router.prefetch(
                              `/nft/${
                                art?.profile?.username?.value?.split(
                                  "lens/"
                                )?.[1]
                              }/${art?.id}`
                            );
                            router.push(
                              `/nft/${
                                art?.profile?.username?.value?.split(
                                  "lens/"
                                )?.[1]
                              }/${art?.id}`
                            );
                          }}
                        >
                          <div className="pixel-border-7 w-full h-full relative bg-mochi rounded-xl">
                            <Image
                              draggable={false}
                              layout="fill"
                              objectFit="cover"
                              src={`${INFURA_GATEWAY}/ipfs/${
                                art.image?.split("ipfs://")?.[1]
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
