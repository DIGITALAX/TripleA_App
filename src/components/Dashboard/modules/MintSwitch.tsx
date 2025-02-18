import { FunctionComponent, JSX, useContext } from "react";
import {
  CollectionType,
  Format,
  MintSwitcher,
  MintSwitchProps,
} from "../types/dashboard.types";
import useMint from "../hooks/useMint";
import Mint from "./Mint";
import Drop from "./Drop";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, TOKENS, TYPES, SIZES, COLORS } from "@/lib/constants";
import ChooseAgent from "./ChooseAgent";
import { createPublicClient, http } from "viem";
import { useAccount } from "wagmi";
import { chains } from "@lens-network/sdk/viem";
import { useRouter } from "next/navigation";
import { AnimationContext } from "@/app/providers";
import calculateRent from "@/lib/helpers/calculateRent";

const MintSwitch: FunctionComponent<MintSwitchProps> = ({
  mintSwitcher,
  setMintSwitcher,
  agents,
  allDrops,
  lensConnected,
  tokenThresholds,
  fulfillers,
  setToolTip,
}): JSX.Element => {
  const { address } = useAccount();
  const router = useRouter();
  const animationContext = useContext(AnimationContext);
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });

  const {
    handleMint,
    mintLoading,
    mintData,
    setMintData,
    agentsLoading,
    id,
    remixSearch,
    handleRemixSearch,
    remixSearchLoading,
    title,
    setTitle,
  } = useMint(publicClient, address, setMintSwitcher);
  switch (mintSwitcher) {
    case MintSwitcher.Agent:
      return (
        <ChooseAgent
          mintData={mintData}
          setMintData={setMintData}
          agents={agents}
          agentsLoading={agentsLoading}
          tokenThresholds={tokenThresholds}
          setToolTip={setToolTip}
        />
      );

    case MintSwitcher.Drop:
      return (
        <Drop
          mintLoading={mintLoading}
          mintData={mintData}
          setMintData={setMintData}
          allDrops={allDrops}
          setMintSwitcher={setMintSwitcher}
        />
      );

    case MintSwitcher.Mint:
      return (
        <Mint
          mintData={mintData}
          tokenThresholds={tokenThresholds}
          handleMint={handleMint}
          allDrops={allDrops}
          mintLoading={mintLoading}
        />
      );

    case MintSwitcher.Success:
      return (
        <div className="relative w-full h-full flex flex-col gap-6 items-center justify-center text-windows">
          <div className="relative flex w-fit h-10 text-center font-start uppercase text-3xl">
            Minted!
          </div>
          <div className="relative w-full h-fit flex items-center justify-center">
            <div
              className={`relative w-fit px-6 py-1 h-12 bg-windows text-viol cursor-canP hover:opacity-70 text-base rounded-md flex items-center justify-center font-jack`}
              onClick={() => {
                animationContext?.setPageChange?.(true);
                router.prefetch(
                  `/nft/${
                    lensConnected?.profile?.username?.value?.split("lens/")?.[1]
                  }/${id}`
                );
                router.push(
                  `/nft/${
                    lensConnected?.profile?.username?.value?.split("lens/")?.[1]
                  }/${id}`
                );
              }}
            >
              Go to NFT
            </div>
          </div>
        </div>
      );

    case MintSwitcher.Remix:
      return (
        <div className="relative w-full h-full flex flex-col gap-10 items-center justify-between">
          <div className="relative w-full h-fit flex items-center justify-center gap-3 flex-col">
            <div className="relative w-fit h-fit flex text-xl font-dos">
              Ever Seen A Remix Pay?
            </div>
            <div className="relative w-1/2 h-fit text-center flex overflow-y-scroll flex-col gap-3">
              You could say XCopy made CC0 famous. You’d be wrong, but I won’t
              stop you. You need agents to make it profitable. 20% of every
              remix made by humans & 50% of those made by agents flows back to
              you on-chain — until open culture turns into open cashflows.
            </div>
            <div className="relative w-fit h-fit flex flex-row items-center justify-center gap-4">
              <div
                className={`relative w-fit px-6 py-1 h-12 cursor-canP hover:opacity-50 text-base rounded-md flex items-center justify-center font-jack ${
                  mintData.remixable
                    ? "bg-windows text-viol"
                    : "opacity-70 bg-viol text-windows border border-windows"
                }`}
                onClick={() =>
                  setMintData({
                    ...mintData,
                    remixable: true,
                  })
                }
              >
                OK!
              </div>
              <div
                className={`relative w-fit px-6 py-1 h-12 cursor-canP hover:opacity-50 text-base rounded-md flex items-center justify-center font-jack ${
                  !mintData.remixable
                    ? "bg-windows text-viol"
                    : "opacity-70 bg-viol text-windows border border-windows"
                }`}
                onClick={() =>
                  setMintData({
                    ...mintData,
                    remixable: false,
                  })
                }
              >
                Not Today
              </div>
            </div>
          </div>
          <div className="relative w-full h-fit flex items-center justify-center gap-3 flex-col">
            <div className="relative w-fit h-fit flex text-xl font-dos">
              Even Echoes Have A Backstory
            </div>
            <div className="relative w-1/2 h-fit text-center flex overflow-y-scroll flex-col gap-3">
              It didn't come from nowhere. Trace it back, find the source.
            </div>
            <div className="relative w-full h-8 flex flex-row gap-3 text-viol text-sm items-center justify-center">
              <input
                className="relative focus:outline-none bg-windows px-1 h-full w-1/2 rounded-md"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                onKeyDown={(e) => e.key == "Enter" && handleRemixSearch()}
              />
              <div
                className={`relative w-20 h-full flex bg-windows text-center items-center justify-center px-1 rounded-md ${
                  !remixSearchLoading && "cursor-canP"
                }`}
                onClick={() => !remixSearchLoading && handleRemixSearch()}
              >
                {remixSearchLoading ? (
                  <svg
                    fill="none"
                    className="size-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                      fill="#0000f5"
                    />{" "}
                  </svg>
                ) : (
                  "Search"
                )}
              </div>
            </div>
            {remixSearch?.length > 0 && (
              <div className="relative w-full h-fit flex flex-wrap gap-2 items-start justify-center">
                {remixSearch?.map((col, index) => {
                  return (
                    <div
                      key={index}
                      className={`relative w-fit h-fit rounded-md bg-window cursor-canP hover:opacity-50 ${
                        Number(col.id) == mintData.remixId &&
                        "opacity-70 border border-windows"
                      }`}
                      title={col.title}
                      onClick={() =>
                        setMintData({
                          ...mintData,
                          remixId: Number(col.id),
                        })
                      }
                    >
                      <div className="relative w-32 h-32 flex">
                        <Image
                          draggable={false}
                          layout="fill"
                          className="rounded-md"
                          objectFit="cover"
                          src={`${INFURA_GATEWAY}/ipfs/${
                            col.image?.split("ipfs://")?.[1]
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );

    case MintSwitcher.Tokens:
      return (
        <div className="relative w-full h-full flex flex-col sm:flex-row gap-10 items-start justify-between">
          <div className="relative w-full h-full flex items-start justify-between flex-col gap-5">
            <div className="relative w-fit h-fit flex items-start justify-start text-lg">
              Set Tokens
            </div>
            <div className="relative w-full h-full flex overflow-y-scroll flex-col gap-3 items-start justify-start">
              {TOKENS?.map((token, key: number) => {
                return (
                  <div
                    key={key}
                    className="relative w-full h-fit flex flex-wrap sm:flex-row gap-3 items-center justify-between"
                  >
                    <div className="flex relative w-full h-fit flex-row items-center justify-center gap-2">
                      <div className="relative w-fit h-fit flex">
                        <div
                          className={`relative w-10 h-10`}
                          title={token.symbol}
                        >
                          <Image
                            src={`${INFURA_GATEWAY}/ipfs/${token.image}`}
                            layout="fill"
                            objectFit="contain"
                            draggable={false}
                            className="rounded-full"
                            alt={token.symbol}
                          />
                        </div>
                      </div>
                      <input
                        disabled={
                          // !mintData.tokens?.includes(token.contract) ||
                          mintLoading
                        }
                        value={mintData?.prices?.[key]}
                        type="number"
                        min={1}
                        placeholder="1"
                        step={1}
                        className="relative flex w-full h-10 pixel-border-7 bg-viol p-1.5 focus:outline-none text-xl text-right"
                        onChange={(e) =>
                          setMintData((prev) => {
                            const newMintData = {
                              ...prev,
                            };

                            const prices = [...newMintData.prices];
                            const tokens = [...newMintData.tokens];
                            prices[key] = Number(e.target.value);
                            tokens[key] = token.contract;

                            newMintData.prices = prices;
                            newMintData.tokens = tokens;

                            return newMintData;
                          })
                        }
                      />
                      <div className="relative w-fit h-fit flex text-sm">
                        {token.symbol}
                      </div>
                    </div>
                    <div className="flex relative w-full h-fit items-center justify-between gap-2 md:flex-nowrap flex-wrap md:flex-row text-xs text-left">
                      <div className="relative w-fit md:w-full h-fit flex flex-col gap-1 items-start justify-start">
                        <div className="relative flex w-fit h-fit">
                          Max Total Rent
                        </div>
                        <div className="relative flex w-fit h-fit">
                          {calculateRent(
                            tokenThresholds?.find(
                              (t) =>
                                t.token?.toLowerCase() ==
                                token.contract?.toLowerCase()
                            )!,
                            {
                              publish: true,
                              publishFrequency: 1,
                              remix: true,
                              remixFrequency: 1,
                              lead: true,
                              leadFrequency: 1,
                              mint: true,
                              mintFrequency: 1,
                            } as any
                          )}
                          {" " + token.symbol}
                        </div>
                      </div>
                      <div
                        className={`relative w-fit md:w-full h-fit flex flex-col gap-1 items-start justify-start ${
                          Number(mintData?.prices?.[key]) >=
                          Number(
                            tokenThresholds?.find(
                              (t) =>
                                t.token?.toLowerCase() ==
                                token.contract?.toLowerCase()
                            )?.threshold || 0
                          ) /
                            10 ** 18
                            ? "text-pink"
                            : "text-black"
                        }`}
                      >
                        <div className="relative flex w-fit h-fit">
                          Agent Threshold
                        </div>
                        <div className="relative flex w-fit h-fit">
                          {Number(
                            tokenThresholds?.find(
                              (t) =>
                                t.token?.toLowerCase() ==
                                token.contract?.toLowerCase()
                            )?.threshold || 0
                          ) /
                            10 ** 18}
                          {" " + token.symbol}
                        </div>
                      </div>
                      {mintData?.collectionType == CollectionType.IRL && (
                        <>
                          <div
                            className={`relative w-fit md:w-full h-fit flex flex-col gap-1 items-start justify-start text-black`}
                          >
                            <div className="relative flex w-fit h-fit">Vig</div>
                            <div className="relative flex w-fit h-fit">
                              {Number(
                                tokenThresholds?.find(
                                  (t) =>
                                    t.token?.toLowerCase() ==
                                    token.contract?.toLowerCase()
                                )?.vig || 0
                              )}
                              {"%"}
                            </div>
                          </div>
                          <div
                            className={`relative w-fit md:w-full h-fit flex flex-col gap-1 items-start justify-start ${
                              Number(mintData?.prices?.[key]) * 10 ** 18 >=
                              Number(
                                tokenThresholds?.find(
                                  (t) =>
                                    t.token?.toLowerCase() ==
                                    token.contract?.toLowerCase()
                                )?.base || 0
                              )
                                ? "text-pink"
                                : "text-black"
                            }`}
                          >
                            <div className="relative flex w-fit h-fit">
                              Base
                            </div>
                            <div className="relative flex w-fit h-fit">
                              {Number(
                                tokenThresholds?.find(
                                  (t) =>
                                    t.token?.toLowerCase() ==
                                    token.contract?.toLowerCase()
                                )?.base || 0
                              ) /
                                10 ** 18}
                              {" " + token.symbol}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {mintData.collectionType == CollectionType.IRL && (
            <div className="relative w-full h-full flex items-start justify-between flex-col gap-5">
              <div className="relative w-fit h-fit flex items-start justify-start text-lg">
                Choose Fulfiller
              </div>
              <div className="relative w-full h-fit overflow-y-scroll flex flex-wrap gap-3 items-start justify-start">
                {fulfillers?.map((fulfiller, index) => {
                  return (
                    <div
                      key={index}
                      className={`relative w-fit h-fit flex flex-col gap-2 items-center justify-center`}
                    >
                      <div
                        className={`relative w-fit h-fit flex rounded-md bg-windows cursor-canP ${
                          mintData.fulfiller == Number(fulfiller.fulfillerId) &&
                          "border border-windows opacity-70"
                        }`}
                        title={fulfiller.title}
                        onClick={() =>
                          setMintData({
                            ...mintData,
                            fulfiller: Number(fulfiller.fulfillerId),
                          })
                        }
                      >
                        <div className="relative w-full sm:w-24 h-40 sm:h-24 flex">
                          <Image
                            src={`${INFURA_GATEWAY}/ipfs/${
                              fulfiller.cover?.split("ipfs://")?.[1]
                            }`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                            draggable={false}
                          />
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-center relative w-fit h-fit cursor-canP hover:opacity-70"
                        onClick={() => window.open(fulfiller.link)}
                      >
                        <svg
                          fill="none"
                          className="size-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          {" "}
                          <path
                            d="M21 3h-8v2h4v2h2v4h2V3zm-4 4h-2v2h-2v2h2V9h2V7zm-8 8h2v-2H9v2H7v2h2v-2zm-4-2v4h2v2H5h6v2H3v-8h2z"
                            fill="currentColor"
                          />{" "}
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );

    case MintSwitcher.Collection:
      return (
        <div className="relative w-full h-full flex flex-col sm:flex-row gap-6 items-center justify-center">
          <label
            className="relative w-full h-72 flex items-center justify-center cursor-canP"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {mintData.image ? (
              <Image
                src={URL.createObjectURL(mintData.image)}
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
                  image: e?.target?.files?.[0],
                });
              }}
            />
          </label>
          <div className="relative w-full h-full flex flex-col gap-5 items-start justify-start">
            <div className="relative w-full h-full flex flex-col justify-start items-start gap-5">
              <input
                className="relative flex w-full h-10 text-left pixel-border-7 bg-viol focus:outline-none text-3xl p-1.5"
                placeholder="Title"
                onChange={(e) =>
                  setMintData({
                    ...mintData,
                    title: e.target.value,
                  })
                }
                value={mintData.title}
                disabled={mintLoading}
              />
              <div className="relative text-xs w-fit h-fit flex">
                {"( Min. of 3 Editions to Activate Agents. )"}
              </div>
              <input
                disabled={mintLoading}
                type="number"
                min={1}
                placeholder="1"
                value={mintData.amount}
                step={1}
                className={`relative flex w-14 px-1 h-12 pixel-border-7 bg-viol focus:outline-none text-xl text-left 
                  
                  ${Number(mintData?.amount) > 2 ? "text-pink" : "text-black"}`}
                onChange={(e) => {
                  if (Number(e.target.value) < 1) {
                    (e.target.value as any) = 1;
                  }

                  setMintData({
                    ...mintData,
                    amount: Number(e.target.value),
                  });
                }}
              />
              <textarea
                className="relative flex w-full h-full overflow-y-scroll text-left p-1.5 focus:outline-none text-lg pixel-border-7 bg-viol"
                placeholder="Description"
                onChange={(e) =>
                  setMintData({
                    ...mintData,
                    description: e.target.value,
                  })
                }
                value={mintData.description}
                disabled={mintLoading}
                style={{
                  resize: "none",
                }}
              ></textarea>
              {mintData.collectionType == CollectionType.IRL && (
                <>
                  <div className="relative w-full h-fit flex flex-col gap-1 items-start justify-start">
                    <div className="relative w-fit h-fit flex items-start justify-start text-left">
                      IRL Formats
                    </div>
                    <div className="relative w-full h-fit flex flex-wrap md:flex-row gap-3 text-viol">
                      {TYPES.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className={`hover:opacity-60 relative bg-windows rounded-md w-fit h-fit flex cursor-canP text-sm flex p-1 items-center justify-center text-center ${
                              mintData.format == item &&
                              "opacity-70 border border-white"
                            }`}
                            onClick={() =>
                              setMintData({
                                ...mintData,
                                format: item,
                              })
                            }
                          >
                            {item}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="relative w-full h-fit flex flex-row gap-3 justify-between">
                    <div className="relative w-full h-fit flex flex-col gap-1 items-start justify-start">
                      <div className="relative w-fit h-fit flex items-start justify-start text-left">
                        Sizes
                      </div>
                      <div className="relative w-full h-fit flex flex-wrap md:flex-row gap-3 text-viol">
                        {SIZES[mintData.format].map((item, index) => {
                          return (
                            <div
                              key={index}
                              className={`hover:opacity-60 relative bg-windows p-1 w-fit h-fit flex cursor-canP text-sm flex items-center justify-center text-center ${
                                mintData?.sizes?.includes(item) &&
                                "opacity-70 border border-white"
                              } ${
                                mintData?.format == Format.Sticker ||
                                mintData?.format == Format.Poster
                                  ? "rounded-md"
                                  : "rounded-full"
                              }`}
                              onClick={() =>
                                setMintData({
                                  ...mintData,
                                  sizes: mintData?.sizes?.includes(item)
                                    ? mintData?.sizes?.filter((i) => i !== item)
                                    : [...mintData?.sizes, item],
                                })
                              }
                            >
                              <div
                                className={`relative flex items-center justify-center  ${
                                  mintData?.format == Format.Sticker ||
                                  mintData?.format == Format.Poster
                                    ? "w-fit h-fit"
                                    : "w-6 h-6 "
                                }`}
                              >
                                {item}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {mintData.format !== Format.Sticker &&
                      mintData.format !== Format.Poster && (
                        <div className="relative w-full h-fit flex flex-col gap-1 items-start justify-start">
                          <div className="relative w-fit h-fit flex items-start justify-start text-left">
                            Colors
                          </div>
                          <div className="relative w-full h-fit flex flex-wrap md:flex-row gap-3">
                            {COLORS.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className={`hover:opacity-60 relative rounded-full w-fit h-fit flex cursor-canP text-sm flex items-center justify-center text-center ${
                                    mintData?.colors?.includes(item) &&
                                    "opacity-70 border border-windows"
                                  }`}
                                  style={{
                                    backgroundColor: item,
                                  }}
                                  onClick={() =>
                                    setMintData({
                                      ...mintData,
                                      colors: mintData?.colors?.includes(item)
                                        ? mintData?.colors?.filter(
                                            (i) => i !== item
                                          )
                                        : [...mintData?.colors, item],
                                    })
                                  }
                                >
                                  <div className="relative w-7 h-7 flex"></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="relative w-full h-full flex flex-wrap md:flex-row gap-6 items-center justify-center">
          <div className="relative w-fit h-fit flex flex-col items-center justify-center gap-3">
            <div className="relative w-fit h-fit flex text-center">
              {CollectionType.IRL}
            </div>
            <div className="relative w-fit h-fit flex">
              <div
                className={`relative w-40 h-40 rounded-md cursor-canP hover:opacity-50 flex bg-windows ${
                  mintData.collectionType == CollectionType.IRL &&
                  "opacity-70 border border-pink"
                }`}
                onClick={() => {
                  setMintData({
                    ...mintData,
                    collectionType: CollectionType.IRL,
                  });
                  setMintSwitcher(MintSwitcher.Collection);
                }}
                title={CollectionType.IRL}
              >
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/QmWU1dajFnaHuH7oAH57SbE2WiQU1G5pkSDtuzdHXshbCQ`}
                  objectFit="contain"
                  layout="fill"
                  className="rounded-md"
                  draggable={false}
                />
              </div>
            </div>
          </div>
          <div className="relative w-fit h-fit flex flex-col items-center justify-center gap-3">
            <div className="relative w-fit h-fit flex text-center">
              {CollectionType.Digital}
            </div>
            <div className="relative w-fit h-fit flex">
              <div
                className={`relative w-40 h-40 rounded-md cursor-canP hover:opacity-50 flex bg-windows ${
                  mintData.collectionType == CollectionType.Digital &&
                  "opacity-70 border border-pink"
                }`}
                onClick={() => {
                  setMintData({
                    ...mintData,
                    collectionType: CollectionType.Digital,
                  });
                  setMintSwitcher(MintSwitcher.Collection);
                }}
                title={CollectionType.Digital}
              >
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/QmeJcAuo8Q8zhXXt9Zy9mbDBY2guRpLKSDrudYgi7r8tHP`}
                  objectFit="contain"
                  layout="fill"
                  className="rounded-md"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default MintSwitch;
