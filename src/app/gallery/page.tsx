"use client";

import { useContext, useState } from "react";
import GalleryItems from "@/components/Common/modules/Gallery";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { AnimationContext, ModalContext } from "../providers";
import { useRouter } from "next/navigation";
import MiniGallery from "@/components/Common/modules/MiniGallery";

export default function Gallery() {
  const context = useContext(ModalContext);
  const animationContext = useContext(AnimationContext);
  const [openChoice, setOpenChoice] = useState<boolean>(false);
  const [choice, setChoice] = useState<string>("All Minted");
  const router = useRouter();
  return (
    <div className="relative w-full h-full flex items-start justify-between flex-col py-6 px-3 sm:px-10 gap-24">
      <div className="relative w-full h-fit flex flex-col xl:flex-row justify-between xl:items-start items-end gap-6">
        <div className="relative w-fit h-fit flex items-start justify-start">
          <div className="relative w-40 xl:w-80 h-28 xl:h-60 flex xl:top-20 xl:left-10">
            <Image
              src={`${INFURA_GATEWAY}/ipfs/QmbxJAdseh52v72wdSztAVWghF1FTDE3Uee2gJJ2wHR17a`}
              draggable={false}
              layout="fill"
            />
          </div>
        </div>
        <div className="relative flex flex-col w-full xl:w-fit h-fit items-between justify-start gap-6 md:gap-5">
          <div className="relative w-full h-fit flex justify-between items-center flex-col sm:flex-row gap-3">
            <div className="relative w-fit h-fit flex font-nim text-white text-lg md:text-3xl uppercase md:left-12">
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
      <MiniGallery
        text={"<= AGENTS ONBOARD =>"}
        loader={context?.agentsLoading!}
        content={
          context?.agents?.map((ag) => ({
            id: ag?.id,
            cover: ag?.cover,
          }))!
        }
        route
      />
    </div>
  );
}
