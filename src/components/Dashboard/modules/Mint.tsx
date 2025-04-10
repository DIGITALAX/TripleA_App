import { FunctionComponent, JSX, useContext } from "react";
import { CollectionType, MintProps } from "../types/dashboard.types";
import Image from "next/legacy/image";
import { TOKENS } from "@/lib/constants";
import calculateRent from "@/lib/helpers/calculateRent";
import descriptionRegex from "@/lib/helpers/descriptionRegex";
import { ModalContext } from "@/app/providers";

const Mint: FunctionComponent<MintProps> = ({
  handleMint,
  mintLoading,
  mintData,
  allDrops,
}): JSX.Element => {
  const context = useContext(ModalContext);
  return (
    <div className="relative w-full h-full flex items-start justify-between font-nerd text-windows flex-col gap-4">
      <div className="relative w-full h-full flex flex-col md:flex-row items-center md:items-start justify-start md:justify-center gap-10">
        {mintData?.agents?.length > 0 && (
          <div className="relative flex flex-col gap-2 items-center justify-start w-full h-fit max-h-60 overflow-y-scroll">
            <div className="relative w-fit h-fit flex text-center text-base">
              Agent Costs
            </div>
            {mintData?.agents?.map((agent, index) => {
              return (
                <div
                  key={index}
                  className="relative text-xxs text-white w-full md:w-fit h-fit px-2 py-1 rounded-lg bg-pink rounded-md flex flex-col gap-2 items-center justify-center"
                >
                  <div className="relative w-fit h-fit flex">
                    {agent?.agent?.title}
                  </div>
                  {mintData?.tokens?.map((tok, index) => {
                    const tokenThreshold = context?.tokenThresholds?.find(
                      (t) => t.token?.toLowerCase() == tok?.toLowerCase()
                    );
                    const rent = calculateRent(tokenThreshold!, agent as any);
                    return (
                      <div
                        key={index}
                        className="relative w-full h-fit flex flex-row items-center justify-between gap-2"
                      >
                        <div className="relative w-fit h-fit flex">{rent}</div>
                        <div className="relative w-fit h-fit flex">
                          {
                            TOKENS.find(
                              (t) =>
                                t?.contract?.toLowerCase() ==
                                tokenThreshold?.token?.toLowerCase()
                            )?.symbol
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
        <div className="relative w-full md:w-fit h-fit flex">
          <div className="relative w-full md:w-80 h-60 flex items-center justify-center">
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

        <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-start">
          <div className="relative flex w-fit h-fit text-center font-dos uppercase text-2xl">
            {mintData.title} {`( ${mintData.collectionType} )`}
          </div>
          {mintData.collectionType == CollectionType.IRL && (
            <div className="font-nerd text-xs relative w-fit h-fit flex items-center justify-center">
              {mintData.format}
            </div>
          )}
          <div className="font-jackey text-xxs relative w-fit h-fit flex items-center justify-center">
            Drop —{" "}
            {allDrops?.find((drop) => mintData.dropId == Number(drop.id))
              ?.title || mintData?.dropTitle}
          </div>
          <div className="relative w-fit h-fit flex items-center justify-between flex-row gap-4 text-pink text-xs text-center">
            {mintData.amount +
              ` x (${mintData.prices?.map(
                (price, index) =>
                  ` ${price} ${
                    TOKENS.find(
                      (tok) => tok.contract == mintData.tokens?.[index]
                    )?.symbol
                  }`
              )})`}
          </div>
          <div
            className="relative flex w-full h-fit max-h-60 overflow-y-scroll text-center text-black text-windows items-start justify-center"
            dangerouslySetInnerHTML={{
              __html: descriptionRegex(mintData?.description, false),
            }}
          ></div>
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
