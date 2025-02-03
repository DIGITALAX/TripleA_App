import { FunctionComponent, JSX, useContext } from "react";
import { MintSwitcher, MintSwitchProps } from "../types/dashboard.types";
import useMint from "../hooks/useMint";
import Mint from "./Mint";
import Drop from "./Drop";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import ChooseAgent from "./ChooseAgent";
import { createPublicClient, http } from "viem";
import { useAccount } from "wagmi";
import { chains } from "@lens-network/sdk/viem";
import { useRouter } from "next/navigation";
import { AnimationContext } from "@/app/providers";

const MintSwitch: FunctionComponent<MintSwitchProps> = ({
  mintSwitcher,
  setMintSwitcher,
  setAgents,
  agents,
  allDrops,
  lensConnected,
  tokenThresholds,
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
  const { handleMint, mintLoading, mintData, setMintData, agentsLoading, id } =
    useMint(
      agents,
      setAgents,
      publicClient,
      address,
      setMintSwitcher,
      lensConnected?.sessionClient!
    );
  switch (mintSwitcher) {
    case MintSwitcher.Agent:
      return (
        <ChooseAgent
          mintData={mintData}
          setMintData={setMintData}
          agents={agents}
          agentsLoading={agentsLoading}
          tokenThresholds={tokenThresholds}
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
                router.push(
                  `/nft/${
                    lensConnected?.profile?.username?.value?.split(
                      "lens://"
                    )?.[1]
                  }/${id}`
                );
              }}
            >
              Go to NFT
            </div>
          </div>
        </div>
      );

    default:
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
                className="relative flex w-full h-1/2 overflow-y-scroll text-left p-1.5 focus:outline-none text-lg pixel-border-7 bg-viol"
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
            </div>
            <div className="relative w-full h-full flex items-start justify-start flex-col gap-2">
              <div className="relative w-fit h-fit flex items-start justify-start">
                Set Tokens
              </div>
              <div>
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
                            !mintData.tokens?.includes(token.contract) ||
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

                              const index = newMintData.tokens.findIndex(
                                (tok) => tok == token.contract
                              );

                              const prices = [...newMintData.prices];
                              prices[index] = Number(e.target.value);

                              newMintData.prices = prices;

                              return newMintData;
                            })
                          }
                        />
                        <div className="relative w-fit h-fit flex text-sm">
                          {token.symbol}
                        </div>
                      </div>
                      <div className="flex relative w-full h-fit items-center justify-center gap-2 flex-row text-sm text-left">
                        <div className="relative w-full h-fit flex flex-col gap-1 items-start justify-start">
                          <div className="relative flex w-fit h-fit">
                            Token Rent
                          </div>
                          <div className="relative flex w-fit h-fit">
                            {Number(
                              tokenThresholds?.find(
                                (t) =>
                                  t.token?.toLowerCase() ==
                                  token.contract?.toLowerCase()
                              )?.rent || 0
                            ) /
                              10 ** 18}
                            {" " + token.symbol}
                          </div>
                        </div>
                        <div
                          className={`relative w-full h-fit flex flex-col gap-1 items-start justify-start ${
                            Number(mintData?.prices?.[0]) * 10 ** 18 >=
                            Number(
                              tokenThresholds?.find(
                                (t) =>
                                  t.token?.toLowerCase() ==
                                  token.contract?.toLowerCase()
                              )?.threshold || 0
                            )
                              ? "text-pink"
                              : "text-black"
                          }`}
                        >
                          <div className="relative flex w-fit h-fit">
                            Token Agent Threshold
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default MintSwitch;
