import { FunctionComponent, JSX } from "react";
import { DropProps, MintSwitcher } from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";

const Drop: FunctionComponent<DropProps> = ({
  setMintData,
  mintData,
  mintLoading,
  allDrops,
  setMintSwitcher,
}): JSX.Element => {
  return (
    <div className="relative w-full h-full flex items-start flex-col md:flex-row justify-between gap-3 font-nerd text-windows">
      <div className="relative w-full h-full flex flex-col items-center justify-between gap-5">
        <div className="relative w-full h-fit flex items-center justify-center">
          <input
            className="relative flex w-full md:w-1/2 h-10 text-center bg-windows text-viol rounded-md p-1.5 focus:outline-none text-3xl"
            placeholder="Drop Title"
            onChange={(e) =>
              setMintData({
                ...mintData,
                dropTitle: e.target.value,
              })
            }
            value={mintData.dropTitle}
            disabled={mintLoading}
          />
        </div>
        <label
          className="relative w-full h-96 md:h-60 flex items-center justify-center cursor-canP"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {mintData.dropCover ? (
            <Image
              src={URL.createObjectURL(mintData.dropCover)}
              objectFit="contain"
              layout="fill"
              draggable={false}
            />
          ) : (
            <svg
              className="size-6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {" "}
              <path
                d="M3 3h18v18H3V3zm16 16V5H5v14h14zm-6-8h4v2h-4v4h-2v-4H7v-2h4V7h2v4z"
                fill="currentColor"
              />{" "}
            </svg>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg"
            hidden
            required
            id="files"
            multiple={false}
            name="pfp"
            disabled={mintLoading}
            onChange={(e) => {
              e.stopPropagation();
              if (!e.target.files || e.target.files.length === 0) return;
              setMintData({
                ...mintData,
                dropCover: e?.target?.files?.[0],
              });
            }}
          />
        </label>
        <div className="relative w-full h-fit flex items-center justify-center">
          <div
            className={`relative hover:opacity-80 w-1/2 h-12 bg-black text-white rounded-md flex items-center justify-center ${
              mintData.dropCover &&
              mintData.dropTitle?.trim() !== "" &&
              "cursor-canP active:scale-95"
            }`}
            onClick={() => {
              setMintData({
                ...mintData,
                dropId: 0,
              });
              setMintSwitcher(MintSwitcher.Remix);
            }}
          >
            Use Drop
          </div>
        </div>
      </div>
      <div className="relative flex w-full h-full items-center justify-start flex-col gap-5">
        <div className="relative w-full flex text-center h-fit text-xl items-center justify-center">
          {allDrops?.length < 1 || !allDrops
            ? "Create New Drop"
            : "Select Existing Drop"}
        </div>
        <div className="relative w-full h-fit overflow-y-scroll grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {allDrops?.map((drop, key) => {
            return (
              <div
                key={key}
                className={`relative w-full h-96 sm:h-40 rounded-md flex cursor-canP pixel-border-7 ${
                  mintData.dropId == Number(drop.id) && "opacity-80"
                }`}
                onClick={() => {
                  setMintData({
                    ...mintData,
                    dropId: Number(drop.id),
                  });
                }}
              >
                <Image
                  className="rounded-md"
                  src={`${INFURA_GATEWAY}/ipfs/${
                    drop.cover?.split("ipfs://")?.[1]
                  }`}
                  layout="fill"
                  draggable={false}
                  objectFit="cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Drop;
