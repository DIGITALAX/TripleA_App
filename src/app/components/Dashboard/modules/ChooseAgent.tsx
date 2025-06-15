import { FunctionComponent, JSX, useContext } from "react";
import {
  ChooseAgentProps,
  CollectionType,
  CollectionWorkerType,
} from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import { ImSwitch } from "react-icons/im";
import calculateRent from "@/lib/helpers/calculateRent";
import { CiCircleQuestion } from "react-icons/ci";
import { ModalContext } from "@/providers";

const ChooseAgent: FunctionComponent<ChooseAgentProps> = ({
  setMintData,
  mintData,
}): JSX.Element => {
  const context = useContext(ModalContext);
  return (
    <div
      className={`flex relative w-full h-[32rem] items-center justify-start ${
        Number(mintData?.amount || 0) <= 2 ||
        mintData?.prices?.filter(
          (price, index) =>
            price * 10 ** 18 >=
            Number(
              context?.tokenThresholds?.find(
                (t) =>
                  t?.token?.toLowerCase() ==
                  mintData?.tokens?.[index]?.toLowerCase()
              )?.threshold
            )
        )?.length < 1
          ? "overflow-hidden"
          : "overflow-x-scroll"
      }`}
    >
      <div className="relative w-fit h-full flex flex-row gap-6">
        {Number(context?.agents?.length) < 1
          ? Array.from({ length: 10 }).map((_, key) => {
              return (
                <div
                  key={key}
                  className="relative w-60 h-full bg-pink rounded-md animate-pulse"
                ></div>
              );
            })
          : context?.agents?.map((agent, key) => {
              return (
                <div
                  key={key}
                  className={`relative w-60 h-full bg-pink rounded-md flex flex-col items-center justify-between cursor-canP p-2 ${
                    mintData.agents
                      ?.map((ag) => ag?.agent?.id)
                      .includes(agent?.id) && "border border-windows"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMintData((prev) => {
                      const newMintData = {
                        ...prev,
                      };

                      if (
                        newMintData.agents
                          ?.map((ag) => ag?.agent?.id)
                          .includes(agent?.id)
                      ) {
                        newMintData.agents = newMintData.agents?.filter(
                          (ag) => ag?.agent?.id !== agent.id
                        );
                      } else if (newMintData.agents?.length < 3) {
                        newMintData.agents = [
                          ...newMintData.agents,
                          {
                            agent: agent,
                            customInstructions: "",
                            publishFrequency: 1,
                            leadFrequency: 1,
                            remixFrequency: 1,
                            publish: true,
                            lead: true,
                            remix: true,
                            mint: true,
                            mintFrequency: 1,
                          },
                        ];
                      }

                      return newMintData;
                    });
                  }}
                >
                  {!mintData.agents
                    ?.map((ag) => ag?.agent?.id)
                    .includes(agent?.id) && (
                    <div className="relative w-full h-fit flex">
                      <div className="relative w-full h-28 rounded-lg flex bg-windows pixel-border-7">
                        <Image
                          objectFit="cover"
                          layout="fill"
                          draggable={false}
                          alt={agent?.title}
                          src={`${INFURA_GATEWAY}/ipfs/${
                            agent?.cover?.includes("ipfs")
                              ? agent?.cover?.split("ipfs://")?.[1]
                              : agent?.cover
                          }`}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                  {mintData.agents
                    ?.map((ag) => ag?.agent?.id)
                    .includes(agent?.id) && (
                    <div className="relative w-full h-fit flex items-center justify-center">
                      <CiCircleQuestion
                        size={20}
                        className="cursor-canP"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          context?.setToolTip(true);
                        }}
                        color="#0000f5"
                      />
                    </div>
                  )}
                  <div className="relative w-full h-full flex flex-col items-start justify-start gap-3 pt-4">
                    <div className="relative w-fit h-fit flex text-lg uppercase">
                      {agent.title}
                    </div>

                    {!mintData.agents
                      ?.map((ag) => ag?.agent?.id)
                      .includes(agent?.id) ? (
                      <div
                        className={`relative w-fit overflow-y-scroll max-h-44 flex text-xs`}
                      >
                        {agent.bio}
                      </div>
                    ) : (
                      <div
                        className={`relative w-full h-fit flex text-xxs flex-col items-center justify-center gap-2`}
                      >
                        <div className="relative w-fit h-fit flex">
                          Total Rent:
                        </div>
                        <div className="relative w-full h-fit flex flex-wrap gap-1 items-center justify-center">
                          {mintData?.tokens?.map((token, index) => {
                            return (
                              <div
                                key={index}
                                className="relative w-fit h-fit flex"
                              >
                                {`${calculateRent(
                                  context?.tokenThresholds?.find(
                                    (tok) =>
                                      tok.token?.toLowerCase() ==
                                      token?.toLowerCase()
                                  )!,
                                  mintData?.agents?.find(
                                    (ag) => ag?.agent?.id == agent?.id
                                  ) as any
                                )} ${
                                  TOKENS?.find(
                                    (tok) =>
                                      tok.contract?.toLowerCase() ==
                                      token?.toLowerCase()
                                  )?.symbol
                                } ${
                                  index != mintData?.tokens?.length - 1
                                    ? "|"
                                    : ""
                                }`}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {mintData.agents
                    ?.map((ag) => ag?.agent?.id)
                    .includes(agent?.id) && (
                    <div
                      className="relative w-full h-fit flex pt-4 flex-col gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      {[
                        {
                          type: CollectionWorkerType.Publish,
                          value: mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.publishFrequency,
                          key: "publishFrequency",
                          on: mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.publish,
                        },
                        {
                          type: CollectionWorkerType.Lead,
                          value: mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.leadFrequency,
                          key: "leadFrequency",
                          on: mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.lead,
                        },
                        {
                          type: CollectionWorkerType.Remix,
                          value: mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.remixFrequency,
                          key: "remixFrequency",
                          on: mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.remix,
                        },
                        {
                          type: CollectionWorkerType.Mint,
                          value: mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.mintFrequency,
                          key: "mintFrequency",
                          on: mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.mint,
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
                                onClick={() =>
                                  setMintData((prev) => {
                                    const data = { ...prev };

                                    let agents = [...data.agents];

                                    data.agents = agents.map((ag) => {
                                      if (ag?.agent?.id == agent?.id) {
                                        (ag as any)[
                                          item.key.replace("Frequency", "")
                                        ] = !ag[
                                          item.key.replace(
                                            "Frequency",
                                            ""
                                          ) as keyof typeof ag
                                        ] as unknown as boolean;
                                        return ag;
                                      } else {
                                        return ag;
                                      }
                                    });
                                    return data;
                                  })
                                }
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
                                setMintData((prev) => {
                                  const newMint = { ...prev };

                                  let newAgents = [...newMint?.agents];
                                  const newIndex = newAgents?.findIndex(
                                    (ag) => ag?.agent?.id == agent?.id
                                  );

                                  newAgents[newIndex] = {
                                    ...newAgents[newIndex],
                                    [item.key]: value,
                                  };

                                  newMint.agents = newAgents;
                                  return newMint;
                                });
                              }}
                            />
                          </div>
                        );
                      })}
                      <textarea
                        className="relative w-full h-32 flex overflow-y-scroll p-1 bg-viol rounded-sm text-sm cursor-text focus:outline-none"
                        placeholder="Add custom instructions for your agent to guide it's personality and style when publishing."
                        style={{
                          resize: "none",
                        }}
                        value={
                          mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.customInstructions
                        }
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMintData((prev) => {
                            const newMint = { ...prev };

                            let newAgents = [...newMint?.agents];
                            const newIndex = newAgents?.findIndex(
                              (ag) => ag?.agent?.id == agent?.id
                            );

                            newAgents[newIndex] = {
                              ...newAgents[newIndex],
                              customInstructions: e.target.value,
                            };

                            newMint.agents = newAgents;
                            return newMint;
                          });
                        }}
                      ></textarea>
                    </div>
                  )}
                </div>
              );
            })}
      </div>
      {(Number(mintData?.amount || 0) <= 2 ||
        mintData?.prices?.filter(
          (price, index) =>
            price * 10 ** 18 >=
            Number(
              context?.tokenThresholds?.find(
                (t) =>
                  t?.token?.toLowerCase() ==
                  mintData?.tokens?.[index]?.toLowerCase()
              )?.threshold
            )
        )?.length < 1) && (
        <div className="absolute top-0 left-0 flex items-center justify-center bg-viol/90 w-full h-full text-windows text-center rounded-sm">
          <div className="relative sm:w-1/2 w-full flex items-center justify-center">
            {mintData?.collectionType !== CollectionType.IRL
              ? "A minimum edition of 3 AND at least one price above the token threshold are required to activate Agents for this collection."
              : "A minimum edition of 3, at least one price above the token threshold AND all prices above the token base are required to activate Agents for this collection."}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseAgent;
