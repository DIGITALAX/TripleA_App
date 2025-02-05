import { FunctionComponent, JSX } from "react";
import { AgentProps, Switcher } from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import useUserAgents from "../hooks/useUserAgents";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-network/sdk/viem";
import AgentEditSwitch from "./AgentEditSwitch";

const Agents: FunctionComponent<AgentProps> = ({
  setSwitcher,
  lensClient,
  setNotification,
  address,
}): JSX.Element => {
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const {
    agentsLoading,
    userAgents,
    handleEditAgent,
    currentAgent,
    setCurrentAgent,
    agentEditLoading,
    agentMetadata,
    setAgentMetadata,
    agentEdit,
    setAgentEdit,
    setAgentOwners,
    addLoading,
    addOwner,
    agentOwners,
    revokeLoading,
    revokeOwner,
    feedsLoading,
    handleNewFeeds,
    setAgentFeeds,
    agentFeeds,
    isAdmin,
    changeFeedAdmin,
    adminLoading,
  } = useUserAgents(lensClient, publicClient, address, setNotification);

  switch (currentAgent) {
    case undefined:
      return (
        <div className="relative w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start font-nerd text-windows">
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
                  !agentsLoading && userAgents?.length < 1 ? "w-full" : "w-fit"
                }`}
              >
                {agentsLoading ? (
                  Array.from({ length: 10 }).map((_, key) => {
                    return (
                      <div
                        key={key}
                        className="relative w-60 h-96 bg-pink rounded-md animate-pulse rounded-xl"
                      ></div>
                    );
                  })
                ) : userAgents?.length < 1 ? (
                  <div className="relative w-full h-96 flex items-center justify-center text-sm text-gray-600 font-jack">
                    No Agents Yet.
                  </div>
                ) : (
                  userAgents?.map((agent, key) => {
                    return (
                      <div
                        key={key}
                        className={`relative w-60 h-96 bg-pink rounded-md flex flex-col items-center justify-between p-2 font-nerd`}
                        onClick={() => {
                          setCurrentAgent(agent);

                          setAgentMetadata({
                            title: agent?.title,
                            cover: agent?.cover,
                            bio: agent?.bio,
                            customInstructions: agent?.customInstructions,
                            lore: agent?.lore,
                            style: agent?.style,
                            knowledge: agent?.knowledge,
                            adjectives: agent?.adjectives,
                          });
                        }}
                      >
                        <div className="relative bg-white pixel-border-7 rounded-xl w-full h-full rounded-md flex">
                          <Image
                            objectFit="contain"
                            layout="fill"
                            className="rounded-xl"
                            draggable={false}
                            alt={agent?.title}
                            src={`${INFURA_GATEWAY}/ipfs/${
                              agent?.cover?.includes("ipfs")
                                ? agent?.cover?.split("ipfs://")?.[1]
                                : agent?.cover
                            }`}
                          />
                        </div>
                        <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3 pt-4">
                          <div className="relative w-fit h-fit flex text-lg uppercase">
                            {agent.title}
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

    default:
      return (
        <div className="relative w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start font-nerd text-windows">
          <div className="relative w-full min-h-80 h-full bg-viol rounded-md p-3 flex flex-col items-center justify-between gap-6">
            <div className="relative w-full h-fit flex items-start justify-between flex-row gap-2">
              <div
                className="relative flex w-fit h-fit cursor-canP hover:opacity-70"
                onClick={() => {
                  if (agentEdit == 0) {
                    setCurrentAgent(undefined);
                  } else {
                    setAgentEdit(agentEdit - 1);
                  }
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
              <div
                className={`relative flex w-fit h-fit ${
                  agentEdit < 2 ? "cursor-canP hover:opacity-70" : "opacity-70"
                }`}
                onClick={() =>
                  setAgentEdit(agentEdit < 2 ? agentEdit + 1 : agentEdit)
                }
              >
                <svg
                  className="size-6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z"
                    fill="currentColor"
                  />{" "}
                </svg>
              </div>
            </div>
            <AgentEditSwitch
              agentEdit={agentEdit}
              handleEditAgent={handleEditAgent}
              agentEditLoading={agentEditLoading}
              agentMetadata={agentMetadata}
              setAgentMetadata={setAgentMetadata}
              setAgentOwners={setAgentOwners}
              addLoading={addLoading}
              addOwner={addOwner}
              agentOwners={agentOwners}
              revokeLoading={revokeLoading}
              revokeOwner={revokeOwner}
              handleNewFeeds={handleNewFeeds}
              feedsLoading={feedsLoading}
              setAgentFeeds={setAgentFeeds}
              agentFeeds={agentFeeds}
              isAdmin={isAdmin}
              changeFeedAdmin={changeFeedAdmin}
              adminLoading={adminLoading}
            />
          </div>
        </div>
      );
  }
};

export default Agents;
