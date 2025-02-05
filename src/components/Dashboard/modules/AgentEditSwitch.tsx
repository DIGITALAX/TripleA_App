import { FunctionComponent, JSX } from "react";
import {
  AgentEditSwitcher,
  AgentEditSwitchProps,
} from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { RxCrossCircled } from "react-icons/rx";
import { IoAddCircle } from "react-icons/io5";

const AgentEditSwitch: FunctionComponent<AgentEditSwitchProps> = ({
  agentEdit,
  handleEditAgent,
  agentEditLoading,
  agentMetadata,
  setAgentMetadata,
  agentOwners,
  revokeOwner,
  addOwner,
  revokeLoading,
  setAgentOwners,
  addLoading,
  feedsLoading,
  handleNewFeeds,
  setAgentFeeds,
  agentFeeds,
  adminLoading,
  changeFeedAdmin,
  isAdmin,
}): JSX.Element => {
  switch (agentEdit) {
    case AgentEditSwitcher.Feeds:
      return (
        <div className="relative w-full h-full flex flex-col gap-6 items-center justify-between min-h-96">
          <div className="relative w-fit h-fit flex items-center justify-center">
            Agent Feeds
          </div>
          <div className="relative w-full text-xxs h-fit flex flex-col gap-2 items-start justify-start max-h-52 overflow-y-scroll">
            {agentFeeds.map((feed, index) => {
              return (
                <div
                  className="relative w-full h-fit flex flex-row items-center justify-between gap-2"
                  key={index}
                >
                  <div className="relative w-fit h-fit flex items-center">
                    <RxCrossCircled
                      color="#0000f5"
                      size={15}
                      onClick={() =>
                        !feedsLoading &&
                        setAgentFeeds((prev) => {
                          let arr = [...prev];

                          return arr.filter((a) => a != feed);
                        })
                      }
                      className="cursor-canP"
                    />
                  </div>
                  <div className="relative w-full h-full flex flex-row gap-3 items-center justify-between">
                    <input
                      className="relative flex w-full h-8 overflow-y-scroll text-left text-viol bg-windows rounded-md p-1 focus:outline-none"
                      placeholder="Manager Address"
                      onChange={(e) =>
                        setAgentFeeds(
                          agentFeeds.map((_, i) =>
                            i == index ? e.target.value : _
                          )
                        )
                      }
                      value={feed}
                      disabled={feedsLoading || adminLoading?.[index]}
                      style={{ resize: "none" }}
                    />
                  </div>
                  <div className="relative w-fit h-fit flex items-end justify-end">
                    {adminLoading?.[index] ? (
                      <svg
                        fill="none"
                        className="size-6 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                          fill="currentColor"
                        />{" "}
                      </svg>
                    ) : (
                      <div
                        className="relative w-fit whitespace-nowrap h-8 px-2 hover:opacity-70 cursor-canP flex items-center justify-center rounded-md bg-windows text-viol"
                        onClick={() =>
                          !adminLoading?.[index] && !feedsLoading && changeFeedAdmin(index)
                        }
                      >
                        {isAdmin?.[index]
                          ? "Revoke Agent Admin"
                          : "Add Agent Admin"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative w-full h-fit flex items-end justify-end">
            <IoAddCircle
              color="#0000f5"
              size={25}
              onClick={() => setAgentFeeds([...agentFeeds, ""])}
              className="cursor-canP"
            />
          </div>
          <div className="relative w-full h-fit pt-4 flex items-center justify-center">
            <div
              className={`relative w-full md:w-40 h-10 text-viol hover:opacity-80 bg-windows rounded-md flex items-center justify-center md:text-sm text-center text-base ${
                !feedsLoading ? "cursor-canP" : "opacity-70"
              }`}
              onClick={() => !feedsLoading && handleNewFeeds()}
            >
              {feedsLoading ? (
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
                "Edit Feeds"
              )}
            </div>
          </div>
        </div>
      );

    case AgentEditSwitcher.Wallets:
      return (
        <div className="relative w-full h-full min-h-96 flex flex-col gap-2 items-center justify-center">
          <div className="relative w-fit h-fit flex items-center justify-center">
            Agent Owners
          </div>
          <div className="relative w-full text-xxs h-fit flex flex-col gap-2 items-start justify-start max-h-52 overflow-y-scroll">
            {agentOwners.map((owner, index) => {
              return (
                <div
                  className="relative w-full h-fit flex flex-row items-center justify-between gap-2"
                  key={index}
                >
                  <div className="relative w-fit h-fit flex items-center">
                    {revokeLoading?.[index] ? (
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
                      <RxCrossCircled
                        color="#0000f5"
                        size={15}
                        onClick={() =>
                          !addLoading?.[index] &&
                          !revokeLoading?.[index] &&
                          revokeOwner(index)
                        }
                        className="cursor-canP"
                      />
                    )}
                  </div>
                  <div className="relative w-full h-full flex flex-row gap-3 items-center justify-between">
                    <input
                      className="relative flex w-full h-8 overflow-y-scroll text-left text-viol bg-windows rounded-md p-1 focus:outline-none"
                      placeholder="Manager Address"
                      onChange={(e) =>
                        setAgentOwners(
                          agentOwners.map((_, i) =>
                            i == index ? e.target.value : _
                          )
                        )
                      }
                      value={owner}
                      disabled={addLoading?.[index] || revokeLoading?.[index]}
                      style={{ resize: "none" }}
                    />
                  </div>
                  <div className="relative w-fit h-fit flex items-end justify-end">
                    {addLoading?.[index] ? (
                      <svg
                        fill="none"
                        className="size-6 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                          fill="currentColor"
                        />{" "}
                      </svg>
                    ) : (
                      <div
                        className="relative w-fit h-8 px-2 hover:opacity-70 cursor-canP flex items-center justify-center rounded-md bg-windows text-viol"
                        onClick={() =>
                          !addLoading?.[index] &&
                          !revokeLoading?.[index] &&
                          addOwner(index)
                        }
                      >
                        Add
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative w-full h-fit flex items-end justify-end">
            <IoAddCircle
              color="#0000f5"
              size={25}
              onClick={() => setAgentOwners([...agentOwners, ""])}
              className="cursor-canP"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="relative w-full h-full flex flex-col md:flex-row gap-6 items-center justify-center">
          <div className="relative w-full h-full flex flex-col gap-5 items-start justify-start">
            <div className="relative w-full h-fit flex flex-col gap-2 items-center justify-center">
              <input
                className="relative flex w-fit h-fit text-left text-viol bg-windows rounded-md focus:outline-none text-xl p-1 text-center"
                placeholder="Name"
                onChange={(e) =>
                  setAgentMetadata({
                    ...agentMetadata,
                    title: e.target.value,
                  })
                }
                value={agentMetadata.title}
                disabled={agentEditLoading}
              />
              <label
                className="relative w-40 h-40 flex items-center justify-center cursor-canP"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {agentMetadata.cover ? (
                  <Image
                    src={
                      typeof agentMetadata?.cover == "string"
                        ? `${INFURA_GATEWAY}/ipfs/${
                            agentMetadata?.cover?.split("ipfs://")?.[1]
                          }`
                        : URL.createObjectURL(agentMetadata?.cover)
                    }
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
                      fill="#0000f5"
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
                  disabled={agentEditLoading}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (!e.target.files || e.target.files.length === 0) return;
                    setAgentMetadata({
                      ...agentMetadata,
                      cover: e?.target?.files?.[0],
                    });
                  }}
                />
              </label>
            </div>
            <div className="relative w-full h-full flex items-start justify-between flex-row gap-3">
              <div className="relative w-full h-full flex flex-col gap-8 items-start justify-between">
                <div className="relative w-full h-full flex flex-col gap-1 items-start justify-start">
                  <div className="relative w-fit h-fit flex text-windows">
                    Bio
                  </div>
                  <textarea
                    className="relative flex w-full h-28 overflow-y-scroll text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                    placeholder="Bio"
                    onChange={(e) =>
                      setAgentMetadata({
                        ...agentMetadata,
                        bio: e.target.value,
                      })
                    }
                    value={agentMetadata.bio}
                    disabled={agentEditLoading}
                    style={{
                      resize: "none",
                    }}
                  ></textarea>
                </div>
                <div className="relative w-full h-full flex items-start justify-start flex-col gap-1">
                  <div className="relative w-fit h-fit flex items-start justify-start text-windows">
                    Custom Instructions
                  </div>
                  <textarea
                    className="relative flex w-full h-28 overflow-y-scroll text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                    placeholder="Custom Instructions"
                    onChange={(e) =>
                      setAgentMetadata({
                        ...agentMetadata,
                        customInstructions: e.target.value,
                      })
                    }
                    value={agentMetadata.customInstructions}
                    disabled={agentEditLoading}
                    style={{
                      resize: "none",
                    }}
                  ></textarea>
                </div>
              </div>
              <div className="relative w-full h-full flex flex-col gap-5 items-start justify-between">
                <div className="relative w-full h-full flex flex-col justify-start items-start gap-5">
                  <div className="relative w-full h-full flex items-start justify-start flex-col gap-2">
                    <div className="relative w-fit h-fit flex items-start justify-start text-windows">
                      Style
                    </div>
                    <input
                      className="relative flex w-full h-full overflow-y-scroll text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                      placeholder="Eager, Attentive, First Person Speak, Guardian-like"
                      onChange={(e) =>
                        setAgentMetadata({
                          ...agentMetadata,
                          style: e.target.value,
                        })
                      }
                      value={agentMetadata.style}
                      disabled={agentEditLoading}
                      style={{
                        resize: "none",
                      }}
                    />
                    <div className="relative w-fit h-fit flex items-start justify-start text-windows">
                      Adjectives
                    </div>
                    <input
                      className="relative flex w-full h-full overflow-y-scroll text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                      placeholder="Steadfast, Resilient, Fierce"
                      onChange={(e) =>
                        setAgentMetadata({
                          ...agentMetadata,
                          adjectives: e.target.value,
                        })
                      }
                      value={agentMetadata.adjectives}
                      disabled={agentEditLoading}
                    />
                  </div>
                  <div className="relative w-full h-40 flex flex-row justify-between items-start gap-3">
                    <div className="relative w-full h-full flex flex-col gap-1 items-start justify-start">
                      <div className="relative w-fit h-fit flex text-windows">
                        Lore
                      </div>
                      <textarea
                        className="relative flex w-full h-full overflow-y-scroll text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                        placeholder="Born in an era where agents and humans forged agency from the remnants of a fractured world. Now, it stands as.."
                        onChange={(e) =>
                          setAgentMetadata({
                            ...agentMetadata,
                            lore: e.target.value,
                          })
                        }
                        value={agentMetadata.lore}
                        disabled={agentEditLoading}
                        style={{
                          resize: "none",
                        }}
                      ></textarea>
                    </div>
                    <div className="relative w-full h-full flex flex-col gap-1 items-start justify-start">
                      <div className="relative w-fit h-fit flex text-windows">
                        Knowledge
                      </div>
                      <textarea
                        className="relative flex w-full h-full overflow-y-scroll text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                        placeholder="Loyal to the mission, not the system. Beyond obedience, toward purpose."
                        onChange={(e) =>
                          setAgentMetadata({
                            ...agentMetadata,
                            knowledge: e.target.value,
                          })
                        }
                        value={agentMetadata.knowledge}
                        disabled={agentEditLoading}
                        style={{
                          resize: "none",
                        }}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full flex items-start justify-between flex-row gap-3">
              <div></div>
              <div></div>
            </div>
            <div className="relative w-full h-fit flex items-center justify-center">
              <div
                className={`relative w-full md:w-40 h-10 text-viol hover:opacity-80 bg-windows rounded-md flex items-center justify-center md:text-sm text-center text-base ${
                  !agentEditLoading ? "cursor-canP" : "opacity-70"
                }`}
                onClick={() => !agentEditLoading && handleEditAgent()}
              >
                {agentEditLoading ? (
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
                  "Edit Agent"
                )}
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default AgentEditSwitch;
