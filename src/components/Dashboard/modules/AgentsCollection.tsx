import { FunctionComponent, JSX, useContext } from "react";
import {
  DropSwitcher,
  AgentsCollectionProps,
  CollectionWorkerType,
} from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { AnimationContext } from "@/app/providers";
import useAgentsCollection from "../hooks/useAgentsCollection";
import { useAccount } from "wagmi";
import { chains } from "@lens-network/sdk/viem";
import { createPublicClient, http } from "viem";
import { ImSwitch } from "react-icons/im";

const AgentsCollection: FunctionComponent<AgentsCollectionProps> = ({
  setDropSwitcher,
  setDrop,
  collection,
  agents,
  setCollection,
  setNotification,
}): JSX.Element => {
  const { address } = useAccount();
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const {
    handlePriceAdjust,
    priceAdjustLoading,
    handleEditAgents,
    editAgentsLoading,
    priceAdjusted,
    setPriceAdjusted,
    frequencies,
    setCustomInstructions,
    setFrequencies,
    customInstructions,
    statusLoading,
    handleCollectionStatus,
  } = useAgentsCollection(
    address,
    publicClient,
    collection,
    agents,
    setNotification
  );
  const router = useRouter();
  const animationContext = useContext(AnimationContext);

  return (
    <div className="relative w-full h-full flex items-start px-4 sm:px-20 py-10 justify-start font-nerd text-windows">
      <div className="relative w-full min-h-[30rem] h-full bg-viol rounded-md p-3 flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex items-start justify-start">
          <div
            className="relative flex w-fit h-fit cursor-canP hover:opacity-70"
            onClick={() => {
              setDropSwitcher(DropSwitcher.Drops);
              setDrop(undefined);
              setCollection(undefined);
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
                d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
                fill="currentColor"
              />{" "}
            </svg>
          </div>
        </div>
        <div className="flex relative w-full h-full items-center justify-start overflow-x-scroll">
          <div
            className={`relative h-full flex flex-row gap-6 ${
              collection?.agentIds?.length > 1 ? "w-fit" : "w-full"
            }`}
          >
            <div className="relative w-fit h-full flex items-center justify-between flex-col gap-4">
              <div className="relative w-fit h-fit flex text-sm uppercase">
                {collection?.title?.length > 12
                  ? collection?.title?.slice(0, 9) + "..."
                  : collection?.title}
              </div>
              <div
                className="relative w-fit h-full flex cursor-canP"
                onClick={() => {
                  animationContext?.setPageChange?.(true);
                  router.prefetch(
                    `/nft/${
                      collection?.profile?.username?.value?.split("lens/")?.[1]
                    }/${collection?.id}`
                  );
                  router.push(
                    `/nft/${
                      collection?.profile?.username?.value?.split("lens/")?.[1]
                    }/${collection?.id}`
                  );
                }}
              >
                <div className="relative w-60 h-40 rounded-md flex pixel-border-7">
                  <Image
                    objectFit="cover"
                    layout="fill"
                    draggable={false}
                    alt={collection?.title}
                    src={`${INFURA_GATEWAY}/ipfs/${
                      collection?.image?.split("ipfs://")?.[1]
                    }`}
                    className="rounded-md"
                  />
                </div>
              </div>
              <div className="relative w-full h-fit flex flex-row gap-3 justify-between items-center text-xs">
                <input
                  className="relative w-full h-10 bg-viol p-1 focus:outline-none"
                  type="number"
                  step={1}
                  value={priceAdjusted}
                  disabled={priceAdjustLoading}
                  onChange={(e) => setPriceAdjusted(Number(e.target.value))}
                />
                <div className="relative w-fit h-fit flex">
                  {
                    TOKENS?.find(
                      (tok) =>
                        tok.contract.toLowerCase() ==
                        collection?.prices?.[0]?.token?.toLowerCase()
                    )?.symbol
                  }
                </div>
              </div>
              <div className="relative w-full h-fit flex">
                <div
                  className={`relative w-full h-8 text-viol bg-windows rounded-md hover:opacity-80 flex items-center justify-center text-xxs font-start ${
                    !priceAdjustLoading ? "cursor-canP" : "opacity-70"
                  }`}
                  onClick={() => !priceAdjustLoading && handlePriceAdjust()}
                >
                  {priceAdjustLoading ? (
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
                    "Adjust Price"
                  )}
                </div>
              </div>
              <div className="relative w-full h-fit flex">
                <div
                  className={`relative w-full h-8  text-viol bg-windows rounded-md hover:opacity-80 flex items-center justify-center text-xxs font-start ${
                    !statusLoading ? "cursor-canP" : "opacity-70"
                  }`}
                  onClick={() => !statusLoading && handleCollectionStatus()}
                >
                  {statusLoading ? (
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
                  ) : Number(collection?.amountSold || 0) == 0 ? (
                    "Delete Collecton"
                  ) : collection?.active ? (
                    "Deactivate Collection"
                  ) : (
                    "Activate Collection"
                  )}
                </div>
              </div>
            </div>
            <div
              className={`relative w-full h-full flex items-start flex-col gap-3 justify-start relative  ${
                collection?.agentIds?.length > 1 && "overflow-x-scroll"
              }`}
            >
              <div
                className={`relative h-full flex flex-row gap-6 ${
                  collection?.agentIds?.length > 1 ? "w-fit" : "w-full"
                }`}
              >
                {collection?.agentIds?.length < 1 ? (
                  <div className="relative w-full flex items-center justify-center text-white text-xs h-full">
                    No Agents Assigned.
                  </div>
                ) : (
                  agents
                    ?.filter((ag) => collection?.agentIds?.includes(ag?.id))
                    ?.map((agent, key) => {
                      return (
                        <div
                          key={key}
                          className={`relative w-60 h-fit bg-pink rounded-md flex flex-col items-center justify-between p-2 gap-2`}
                        >
                          <div className="relative w-fit h-fit rounded-md flex">
                            <div className="relative w-12 h-12 pixel-border-7 bg-white rounded-xl flex">
                              <Image
                                objectFit="contain"
                                layout="fill"
                                draggable={false}
                                alt={agent?.title}
                                src={`${INFURA_GATEWAY}/ipfs/${
                                  agent?.cover?.includes("ipfs")
                                    ? agent?.cover?.split("ipfs://")?.[1]
                                    : agent?.cover
                                }`}
                                className="rounded-md"
                              />
                            </div>
                          </div>
                          <div className="relative w-fit h-fit flex text-lg font-dos uppercase">
                            {agent.title}
                          </div>
                          <div
                            className="relative w-full h-full flex flex-col gap-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            {[
                              {
                                type: CollectionWorkerType.Publish,
                                value: frequencies[key]?.publishFrequency,
                                key: "publishFrequency",
                                on: frequencies[key]?.publish,
                              },
                              {
                                type: CollectionWorkerType.Lead,
                                value: frequencies[key]?.leadFrequency,
                                key: "leadFrequency",
                                on: frequencies[key]?.lead,
                              },
                              {
                                type: CollectionWorkerType.Remix,
                                value: frequencies[key]?.remixFrequency,
                                key: "remixFrequency",
                                on: frequencies[key]?.remix,
                              },
                            ].map((item, index) => {
                              return (
                                <div
                                  className={`relative w-full h-fit flex flex-col gap-1 items-start justify-start  ${
                                    !item.on && "opacity-50"
                                  }`}
                                  key={index}
                                >
                                  <div className="relative w-full h-fit flex flex-row gap-1 items-center justify-between">
                                    <div className="relative w-fit h-fit flex">
                                      {item.type}
                                    </div>
                                    <div
                                      className={`relative w-fit h-fit flex cursor-canP`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setFrequencies((prev) => {
                                          let freq = [...prev];
                                          (freq[key] as any)[
                                            item.key.replace(
                                              "Frequency",
                                              ""
                                            ) as unknown as keyof {
                                              publish: boolean;
                                              remix: boolean;
                                              lead: boolean;
                                            }
                                          ] = !freq[key][
                                            item.key.replace(
                                              "Frequency",
                                              ""
                                            ) as unknown as keyof {
                                              publish: boolean;
                                              remix: boolean;
                                              lead: boolean;
                                            }
                                          ] as boolean;

                                          return freq;
                                        });
                                      }}
                                    >
                                      <ImSwitch size={15} color="#CECEFF" />
                                    </div>
                                  </div>
                                  <input
                                    className="relative w-full h-6 p-1 bg-viol text-sm rounded-sm focus:outline-none"
                                    placeholder="1"
                                    type="number"
                                    min={1}
                                    max={3}
                                    step={1}
                                    disabled={!item.on}
                                    value={item.value}
                                    onChange={(e) => {
                                      let value = Number(e.target.value);
                                      if (value > 3) {
                                        value = 3;
                                      }
                                      (e.target.value as any) = value;
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setFrequencies((prev) => {
                                        let freq = [...prev];
                                        (freq[key] as any)[
                                          item.key as unknown as keyof {
                                            publishFrequency: number;
                                            remixFrequency: number;
                                            leadFrequency: number;
                                          }
                                        ] = value;

                                        return freq;
                                      });
                                    }}
                                  />
                                </div>
                              );
                            })}
                            <textarea
                              className="relative w-full h-40 flex overflow-y-scroll p-1 bg-viol text-sm rounded-md cursor-text focus:outline-none"
                              placeholder="Add custom instructions for your agent."
                              style={{
                                resize: "none",
                              }}
                              disabled={editAgentsLoading}
                              value={customInstructions[key]}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCustomInstructions((prev) => {
                                  const custom = [...prev];

                                  custom[key] = e.target.value;

                                  return custom;
                                });
                              }}
                            ></textarea>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
              {collection?.agentIds?.length > 0 && (
                <div className="relative w-full h-fit flex">
                  <div
                    className={`relative w-full h-8 rounded-md bg-windows text-viol hover:opacity-80 flex items-center justify-center text-xxs font-start ${
                      !editAgentsLoading ? "cursor-canP" : "opacity-70"
                    }`}
                    onClick={() => !editAgentsLoading && handleEditAgents()}
                  >
                    {editAgentsLoading ? (
                      <svg
                        fill="none"
                        className="size-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                          fill="#CECEFF"
                        />{" "}
                      </svg>
                    ) : (
                      "Update"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsCollection;
