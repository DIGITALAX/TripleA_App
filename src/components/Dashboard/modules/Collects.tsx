import { FunctionComponent, JSX, useContext } from "react";

import { CollectsProps, Switcher } from "../types/dashboard.types";
import useCollects from "../hooks/useCollects";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import moment from "moment";
import { AnimationContext } from "@/app/providers";

const Collects: FunctionComponent<CollectsProps> = ({
  setSwitcher,
  lensClient,
}): JSX.Element => {
  const { address } = useAccount();
  const { collectsLoading, allCollects } = useCollects(address, lensClient);
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
                    className="relative w-60 h-80 bg-pink rounded-md animate-pulse rounded-xl"
                  ></div>
                );
              })
            ) : allCollects?.length < 1 ? (
              <div className="relative w-full h-80 flex items-center justify-center text-sm text-gray-600 font-jack">
                No Collects Yet.
              </div>
            ) : (
              allCollects?.map((collect, key) => {
                return (
                  <div
                    key={key}
                    className={`relative w-60 h-80 bg-pink rounded-md flex flex-col items-center justify-between p-2 font-nerd`}
                  >
                    <div
                      className="relative w-full h-full flex cursor-canP pixel-border-7"
                      onClick={() => {
                        animationContext?.setPageChange?.(true);
                        router.push(
                          `/nft/${
                            (collect as any)?.profile?.username?.value?.split(
                              "lens/"
                            )?.[1]
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
