"use client";

import AgentSwitch from "@/components/Agents/modules/AgentSwitch";
import {
  AgentSwitcher,
  CreateSwitcher,
} from "@/components/Agents/types/agents.types";
import { useState } from "react";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import useArt from "@/components/Agents/hooks/useArt";
import { useAccount } from "wagmi";
import { useModal } from "connectkit";
import MiniGallery from "@/components/Common/modules/MiniGallery";
export default function Agents() {
  const [agentSwitcher, setAgentSwitcher] = useState<AgentSwitcher>(
    AgentSwitcher.Gallery
  );
  const [createSwitcher, setCreateSwitcher] = useState<CreateSwitcher>(
    CreateSwitcher.Details
  );
  const { moreArt, moreArtLoading } = useArt();
  const { isConnected } = useAccount();
  const { setOpen } = useModal();

  return (
    <div className="relative w-full h-full flex items-start justify-between flex-col py-6 px-3 sm:px-10 gap-24">
      <div className="relative w-full h-fit flex flex-col xl:flex-row justify-between xl:items-start items-end gap-12">
        <div className="relative w-full xl:w-fit h-fit flex flex-col sm:flex-row xl:flex-col gap-8 xl:gap-20 items-center justify-center xl:items-start xl:justify-start xl:top-20 xl:left-10">
          <div className="relative w-40 xl:w-80 h-28 xl:h-60 flex">
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
        <div
          className={`${
            agentSwitcher == AgentSwitcher.Create ? "w-full" : "w-full xl:w-fit"
          } relative flex flex-col h-fit items-between justify-start gap-5`}
        >
          <div className="relative w-full h-fit flex justify-between items-center">
            <div className="relative w-fit h-fit flex font-nim text-white text-lg md:text-3xl uppercase md:left-12">
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
      <MiniGallery
        text={"<= ART IN ACTION =>"}
        loader={moreArtLoading}
        content={
          moreArt?.map((col) => ({
            cover: col?.image!,
            id: col?.id.toString(),
            username: col?.profile?.username?.value?.split("lens/")?.[1]!,
          }))!
        }
      />
    </div>
  );
}
