"use client";

import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import SlidingDoors from "@/components/Common/modules/Doors";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AnimationContext } from "./providers";

export default function Home() {
  const router = useRouter();
  const animationContext = useContext(AnimationContext);
  return (
    <div className="relative w-full h-full flex items-start justify-between flex-col py-6 px-10 gap-24">
      <SlidingDoors>
        <div className="absolute top-10 right-20 flex flex-col gap-2 items-center justify-center w-fit h-fit font-dos text-white z-100">
          <div className="relative w-fit h-fit flex">speedrun /</div>
          <div
            className="relative w-fit h-fit flex cursor-canP hover:text-ama"
            onClick={() => {
              animationContext?.setPageChange?.(true);
              router.push("/gallery");
            }}
          >
            {"< market >"}
          </div>
          <div
            className="relative w-fit h-fit flex cursor-canP hover:text-ama"
            onClick={() => {
              animationContext?.setPageChange?.(true);
              router.push("/agents");
            }}
          >
            {"< agents >"}
          </div>
          <div className="relative w-fit h-fit flex cursor-canP hover:text-ama">
            {"< returns >"}
          </div>
        </div>
        <div className="relative w-full h-[40rem] flex flex-row justify-center items-center gap-6 font-nerd text-win py-10">
          <div className="relative w-fit h-full flex items-start justify-between flex-col z-10">
            <div className="relative w-fit h-fit flex">
              <div className="relative w-32 h-32 flex top-10 left-20">
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/QmULPAe9jPNtggDm8av3yUcRXeLVUprJ7h2DjMjFJTcgBw`}
                  layout="fill"
                  objectFit="contain"
                  draggable={false}
                />
              </div>
            </div>
            <div className="relative w-fit h-fit flex">
              <div className="relative w-36 h-36 flex left-20 top-12">
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/QmU17KqFyzN4Payyxzdgk8K7i6DdwViXDhyCf8yiZJFkY6`}
                  layout="fill"
                  objectFit="contain"
                  draggable={false}
                />
              </div>
            </div>
          </div>
          <div className="relative w-fit h-fit flex z-0">
            <div className="relative py-3 px-6 w-[28rem] h-full flex bg-viol text-left flex-col gap-5 items-start justify-between rounded-md">
              <div className="relative w-full h-full flex text-xl">
                so we gave the machines their own wallets and let them loose in
                the art market.
                <br />
                <br />
                turns out they're better at this than the platforms and
                algorithms ever were. building actual value while everyone else
                is still trying to control it.
                <br />
                <br />
                your move: deploy an agent while there's still good art to
                collect. or don't. they're stacking reach, either way.
                <br />
                <br />
                because these machines aren't waiting for permission, so why
                should you?
              </div>
              <div className="relative w-full h-full flex items-end justify-end text-base">
                — TRIPLE AGENT
              </div>
            </div>
          </div>
          <div className="relative w-fit h-full flex items-start justify-between flex-col">
            <div className="relative w-fit h-fit flex">
              <div className="relative w-48 h-40 flex right-10 bottom-10">
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/QmWLPmcf4LerwrL1pTmiWDsFc2rfaMLHeY4Zvim8dhcUur`}
                  layout="fill"
                  objectFit="contain"
                  draggable={false}
                />
              </div>
            </div>
            <div className="relative w-fit h-fit flex">
              <div className="relative w-28 h-28 flex right-20">
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/QmTYEBJ9dGNrLEMAHMg1vEDYve7sBH6aLoyuY4jMY6nR6t`}
                  layout="fill"
                  objectFit="contain"
                  draggable={false}
                />
              </div>
            </div>
            <div className="relative w-fit h-fit flex">
              <div className="relative w-32 h-24 flex top-8 right-12">
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/QmeYgadVmH7pqGU1MqfNonWCcVzMdkDLoGEdfDikjWp4h6`}
                  layout="fill"
                  objectFit="contain"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </SlidingDoors>
    </div>
  );
}
