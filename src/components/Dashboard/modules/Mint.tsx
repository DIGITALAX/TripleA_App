import { FunctionComponent, JSX } from "react";
import { MintProps } from "../types/dashboard.types";
import { AiOutlineLoading } from "react-icons/ai";
import Image from "next/legacy/image";
import { TOKENS } from "@/lib/constants";

const Mint: FunctionComponent<MintProps> = ({
  handleMint,
  mintLoading,
  mintData,
  allDrops,
  tokenThresholds,
}): JSX.Element => {
  return (
    <div className="relative w-full h-full flex items-start justify-between font-nerd text-windows flex-col gap-4">
     <div className="relative w-full h-full flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-full sm:w-fit h-fit flex">
          <div className="relative w-full sm:w-80 h-60 flex items-center justify-center">
            {mintData.image && (
              <Image
                src={URL.createObjectURL(mintData.image)}
                objectFit="contain"
                layout="fill"
                draggable={false}
              />
            )}
          </div>
        </div>
        <div className="relative w-fit h-fit sm:h-full flex flex-col gap-3 items-start justify-start">
          <div className="relative flex w-fit h-10 text-center font-dos uppercase text-2xl">
            {mintData.title}
          </div>
          <div className="font-jackey text-xxs relative w-fit h-fit flex items-center justify-center">
            Drop —{" "}
            {allDrops?.find((drop) => mintData.dropId == Number(drop.id))
              ?.title || mintData?.dropTitle}
          </div>
          <div className="relative w-fit h-fit flex items-center justify-between flex-row gap-4 text-pink text-xl">
            <div className="relative w-fit h-fit flex text-left">
              {mintData.amount} x {mintData.prices?.[0]}{" "}
              {
                TOKENS.find((tok) => tok.contract == mintData.tokens?.[0])
                  ?.symbol
              }
            </div>
          </div>
          <div className="relative flex w-full sm:w-fit max-w-96 h-fit max-h-60 overflow-y-scroll text-left text-black text-windows">
            {mintData.description}
          </div>
          {mintData?.agents?.length > 0 && (
            <div className="relative flex w-fit h-fit flex flex-col gap-2 items-start justify-start">
              <div className="relative flex w-fit h-fit max-h-60 overflow-y-scroll text-left text-base">
                Agent Costs
              </div>
              {mintData?.agents?.map((agent, index) => {
                return (
                  <div
                    key={index}
                    className="relative text-xxs text-white w-fit h-fit px-2 py-1 rounded-lg bg-pink rounded-md flex flex-row gap-2 items-center justify-center"
                  >
                    <div className="relative w-fit h-fit flex">
                      {agent?.agent?.title}
                    </div>
                    <div className="relative w-fit h-fit flex">
                      {(Number(
                        tokenThresholds?.find(
                          (t) =>
                            t.token?.toLowerCase() ==
                            mintData?.tokens?.[0]?.toLowerCase()
                        )?.rent || 0
                      ) / 10 **18) * Number(agent?.dailyFrequency || 0)}
                    </div>
                    <div className="relative w-fit h-fit flex">
                      {
                        TOKENS.find(
                          (t) =>
                            t?.contract?.toLowerCase() ==
                            mintData?.tokens?.[0]?.toLowerCase()
                        )?.symbol
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="relative w-full h-fit flex items-center justify-center">
        <div
          className={`relative w-40 h-10 hover:opacity-80 bg-windows text-viol rounded-md flex items-center justify-center ${
            !mintLoading ? "cursor-canP" : "opacity-70"
          }`}
          onClick={() => !mintLoading && handleMint()}
        >
          {mintLoading ? (
            <svg
              fill="none"
              className="size-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                fill="currentColor"
              />{" "}
            </svg>
          ) : (
            "Mint"
          )}
        </div>
      </div>
    </div>
  );
};

export default Mint;
