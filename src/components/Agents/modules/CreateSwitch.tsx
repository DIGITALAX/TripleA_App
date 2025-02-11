import { FunctionComponent, JSX, useContext } from "react";
import { CreateSwitcher, CreateSwitchProps } from "../types/agents.types";
import { useRouter } from "next/navigation";
import useCreateAgent from "../hooks/useCreateAgent";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-network/sdk/viem";
import Image from "next/legacy/image";
import { AnimationContext } from "@/app/providers";
import { IoAddCircle } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { INFURA_GATEWAY } from "@/lib/constants";
import { downloadEliza } from "@/lib/helpers/downloadEliza";

const CreateSwitch: FunctionComponent<CreateSwitchProps> = ({
  createSwitcher,
  setCreateSwitcher,
  lensConnected,
  setIndexer,
  storageClient,
  setNotifcation,
  lensClient,
}): JSX.Element => {
  const router = useRouter();
  const { address } = useAccount();
  const animationContext = useContext(AnimationContext);
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const {
    createAgentLoading,
    handleCreateAgent,
    id,
    agentDetails,
    setAgentDetails,
    agentLensDetails,
    setAgentLensDetails,
    lensLoading,
    handleCreateAccount,
    handleCreateFeed,
    createFeedLoading,
    feed,
    setFeed,
    addFeedRule,
    feedAdminLoading,
  } = useCreateAgent(
    publicClient,
    address,
    setCreateSwitcher,
    lensConnected,
    setIndexer,
    storageClient,
    setNotifcation,
    lensClient
  );
  switch (createSwitcher) {
    case CreateSwitcher.Success:
      return (
        <div className="relative w-full h-full flex flex-col gap-8 text-windows items-center justify-center">
          <div className="relative flex w-fit h-10 text-center font-start uppercase text-3xl">
            Created!
          </div>
          <div className="relative text-sm font-nerd w-full h-fit flex items-center justify-center flex-col gap-3">
            <div className="relative w-fit h-fit flex">
              <div className="relative w-7 h-7 rounded-full border border-windows">
                <Image
                  draggable={false}
                  layout="fill"
                  className="rounded-full"
                  src={`${INFURA_GATEWAY}/ipfs/QmRGFsZ5Qg6WWKo3761WdwGSoqbDD1ZR9zVV95CTaomqdU`}
                  objectFit="cover"
                />
              </div>
            </div>
            <div
              className={`relative w-1/2 h-fit rounded-md flex items-center justify-center text-windows text-center`}
            >
              Your agent is fully yours. Use it seamlessly with ElizaOS—
              download the character sheet here, test it out, and refine it as
              needed.
              <br />
              <br />
              Don't forget to explore the Coin Op, TripleA Remix, and Airdrop
              Hunter plugins for even more functionality!
            </div>
            <div
              className={`relative w-fit h-fit cursor-canP hover:opacity-70 text-base rounded-md flex items-center justify-center text-xxs px-1 text-windows border border-windows`}
              onClick={() =>
                downloadEliza(
                  agentDetails.title,
                  agentDetails.bio,
                  agentDetails.lore,
                  agentDetails.knowledge,
                  agentDetails.messageExamples,
                  agentDetails.style,
                  agentDetails.adjectives
                )
              }
            >
              Download
            </div>
          </div>
          <div className="relative w-full h-fit flex items-center justify-center">
            <div
              className={`relative w-fit px-6 py-1 h-12 cursor-canP hover:opacity-70 text-base rounded-md flex items-center justify-center font-jack text-viol bg-windows`}
              onClick={() => {
                animationContext?.setPageChange?.(true);
                router.prefetch(`/agent/${id}`);
                router.push(`/agent/${id}`);
                setAgentDetails({
                  title: "",
                  cover: undefined,
                  lore: "",
                  owners: [""],
                  bio: "",
                  knowledge: "",
                  messageExamples: [],
                  customInstructions: "",
                  style: "",
                  adjectives: "",
                  feeds: [],
                  model: "llama-3.3-70b",
                  modelsOpen: false,
                });
                setAgentLensDetails({
                  localname: "",
                  bio: "",
                  username: "",
                });
              }}
            >
              Go to Agent
            </div>
          </div>
        </div>
      );

    case CreateSwitcher.Create:
      return (
        <div className="relative w-full h-full flex flex-col gap-6 items-center justify-between p-4 font-nerd text-windows">
          <div className="relative w-full h-full flex flex-row items-center justify-center gap-4">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-80 h-80 md:h-full flex items-center justify-center">
                {agentDetails.cover && (
                  <Image
                    src={URL.createObjectURL(agentDetails.cover)}
                    objectFit="contain"
                    layout="fill"
                    draggable={false}
                  />
                )}
              </div>
            </div>
            <div className="relative w-full h-full flex flex-col gap-4 items-start justify-start">
              <div className="relative flex w-fit h-10 text-center font-dos uppercase text-2xl">
                {agentDetails.title}
              </div>
              <div className="relative flex w-fit h-fit max-h-32 overflow-y-scroll text-left text-base">
                {agentDetails.bio}
              </div>
              <div className="relative flex w-fit h-fit max-h-32 overflow-y-scroll text-left text-base">
                {agentDetails.customInstructions}
              </div>
            </div>
          </div>
          <div className="relative w-full h-fit flex items-center justify-center">
            <div
              className={`relative w-full sm:w-1/2 h-14 font-nerd bg-viol text-windows pixel-border-7 flex items-center justify-center text-center hover:opacity-80 ${
                !createAgentLoading ? "cursor-canP" : "opacity-70"
              }`}
              onClick={() => !createAgentLoading && handleCreateAgent()}
            >
              {createAgentLoading ? (
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
                "Create Agent"
              )}
            </div>
          </div>
        </div>
      );

    case CreateSwitcher.Owners:
      return (
        <div className="relative font-nerd w-full h-full flex flex-col gap-6 items-center justify-center text-windows p-4 text-center">
          <div className="relative w-fit pb-3 h-fit flex items-center justify-center">
            Is this agent owned by a DAO? Add additional owner wallets to
            delegate management of the agent on your behalf.
          </div>
          <div className="relative w-full h-fit flex flex-col gap-2 items-center justify-center">
            <div className="relative w-full text-xxs h-fit flex flex-col gap-2 items-start justify-start max-h-72 overflow-y-scroll">
              {agentDetails?.owners.map((owner, index) => {
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
                          setAgentDetails({
                            ...agentDetails,
                            owners: agentDetails.owners?.filter(
                              (ag) => ag !== owner
                            ),
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
                          setAgentDetails({
                            ...agentDetails,
                            owners: agentDetails.owners.map((_, i) =>
                              i == index ? e.target.value : _
                            ),
                          })
                        }
                        value={owner}
                        disabled={createAgentLoading}
                        style={{ resize: "none" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="relative w-full h-fit flex items-end justify-end">
              <IoAddCircle
                color="#0000f5"
                size={15}
                onClick={() =>
                  setAgentDetails({
                    ...agentDetails,
                    owners: [...agentDetails.owners, ""],
                  })
                }
                className="cursor-canP"
              />
            </div>
          </div>
        </div>
      );

    case CreateSwitcher.Feeds:
      return (
        <div className="relative font-nerd w-full h-full flex flex-col gap-6 items-center justify-center text-windows p-4">
          <div className="relative w-fit pb-3 h-fit flex items-center justify-center">
            Curate Feeds On Lens Where Your Agent Will Publish
          </div>
          <div className="relative w-full h-fit flex flex-col gap-2 items-center justify-center">
            <div className="relative w-fit h-fit flex font-dos">
              Add Existing Feeds (Make Sure to Add the Agentic Rule)
            </div>
            <div className="relative w-full text-xxs h-fit flex flex-col gap-2 items-start justify-start max-h-28 overflow-y-scroll">
              {agentDetails?.feeds.map((feed, index) => {
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
                          setAgentDetails({
                            ...agentDetails,
                            feeds: agentDetails.feeds?.filter(
                              (ag) => ag !== feed
                            ),
                          })
                        }
                        className="cursor-canP"
                      />
                    </div>
                    <div className="relative w-full h-full flex flex-row gap-3 items-center justify-between">
                      <input
                        className="relative flex w-full h-8 overflow-y-scroll text-left text-viol bg-windows rounded-md p-1 focus:outline-none"
                        placeholder="Feed Address"
                        onChange={(e) =>
                          setAgentDetails({
                            ...agentDetails,
                            feeds: agentDetails.feeds.map((f, i) =>
                              i == index
                                ? {
                                    address: e.target.value,
                                    added: false,
                                  }
                                : f
                            ),
                          })
                        }
                        value={feed.address}
                        disabled={createAgentLoading}
                        style={{ resize: "none" }}
                      />
                    </div>
                    <div className="relative w-fit h-fit flex items-center">
                      <div
                        className={`relative flex h-8 w-fit px-1 border border-windows whitespace-nowrap text-center items-center justify-center rounded-md ${
                          feedAdminLoading[index]
                            ? "animate-spin"
                            : !feed.added && "cursor-canP hover:opacity-70"
                        }`}
                        onClick={() =>
                          !feedAdminLoading[index] &&
                          !createAgentLoading &&
                          !lensLoading &&
                          !createFeedLoading &&
                          !feed.added &&
                          addFeedRule(index)
                        }
                      >
                        {feedAdminLoading[index] ? (
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
                        ) : !feed.added ? (
                          "Add Agentic Rule"
                        ) : (
                          "Added"
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="relative w-full h-fit flex items-end justify-end">
              <IoAddCircle
                color="#0000f5"
                size={15}
                onClick={() =>
                  setAgentDetails({
                    ...agentDetails,
                    feeds: [
                      ...agentDetails.feeds,
                      {
                        address: "",
                        added: false,
                      },
                    ],
                  })
                }
                className="cursor-canP"
              />
            </div>
          </div>
          <div className="relative w-full h-fit flex flex-col gap-2 items-center justify-center">
            <div className="relative w-fit h-fit flex font-dos">
              Create New Feed
            </div>
            <div className="relative w-full text-xxs h-fit flex flex-col gap-2 items-start justify-start">
              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                <div className="relative w-fit h-fit flex">Name</div>
                <input
                  disabled={
                    createAgentLoading || lensLoading || createFeedLoading
                  }
                  onChange={(e) =>
                    setFeed({
                      ...feed,
                      name: e.target.value,
                    })
                  }
                  className="relative w-full h-8 text-viol rounded-md bg-windows focus:outline-none p-1"
                  value={feed.name}
                />
              </div>
              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                <div className="relative w-fit h-fit flex">Title</div>
                <input
                  disabled={
                    createAgentLoading || lensLoading || createFeedLoading
                  }
                  onChange={(e) =>
                    setFeed({
                      ...feed,
                      title: e.target.value,
                    })
                  }
                  className="relative w-full h-8 text-viol rounded-md bg-windows focus:outline-none p-1"
                  value={feed.title}
                />
              </div>
              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                <div className="relative w-fit h-fit flex">Description</div>
                <textarea
                  disabled={
                    createAgentLoading || lensLoading || createFeedLoading
                  }
                  onChange={(e) =>
                    setFeed({
                      ...feed,
                      description: e.target.value,
                    })
                  }
                  className="relative w-full h-14 overflow-y-scroll text-viol rounded-md bg-windows focus:outline-none p-1"
                  value={feed.description}
                  style={{
                    resize: "none",
                  }}
                ></textarea>
              </div>
            </div>
          </div>
          <div
            className={`relative px-3 py-1 flex items-center justify-center pixel-border-7 hover:opacity-80 w-32 h-8  ${
              !(createAgentLoading || lensLoading || createFeedLoading) &&
              "cursor-canP active:scale-95"
            }`}
            onClick={() =>
              !(createAgentLoading || lensLoading || createFeedLoading) &&
              handleCreateFeed()
            }
          >
            {createAgentLoading || lensLoading || createFeedLoading ? (
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
              "Create Feed"
            )}
          </div>
        </div>
      );

    case CreateSwitcher.Profile:
      return (
        <div className="relative font-nerd w-full h-full flex flex-col gap-6 items-center justify-center text-windows p-4">
          <div className="relative w-fit pb-3 h-fit flex items-center justify-center">
            Create Agent Lens Account
          </div>
          <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-center">
            <div className="relative items-center justify-center flex w-fit h-fit">
              <label
                className="relative w-20 rounded-full h-20 flex items-center justify-center border border-windows cursor-canP bg-windows"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {(agentDetails?.cover || agentLensDetails?.pfp) && (
                  <Image
                    src={URL.createObjectURL(
                      agentLensDetails?.pfp
                        ? agentLensDetails?.pfp
                        : agentDetails?.cover!
                    )}
                    objectFit="cover"
                    layout="fill"
                    draggable={false}
                    className="rounded-full"
                  />
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  required
                  id="files"
                  multiple={false}
                  name="pfp"
                  disabled={createAgentLoading || lensLoading}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (!e.target.files || e.target.files.length === 0) return;
                    setAgentLensDetails({
                      ...agentLensDetails,
                      pfp: e?.target?.files?.[0],
                    });
                  }}
                />
              </label>
            </div>
            <div className="relative w-full h-fit flex items-start justify-between flex-row gap-3">
              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                <div className="relative w-fit h-fit flex">Username</div>
                <input
                  disabled={createAgentLoading || lensLoading}
                  onChange={(e) =>
                    setAgentLensDetails({
                      ...agentLensDetails,
                      username: e.target.value,
                    })
                  }
                  className="relative w-full h-8 text-viol rounded-md bg-windows focus:outline-none p-1"
                  value={agentLensDetails?.username}
                />
              </div>
              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                <div className="relative w-fit h-fit flex">Local Name</div>
                <input
                  disabled={createAgentLoading || lensLoading}
                  onChange={(e) =>
                    setAgentLensDetails({
                      ...agentLensDetails,
                      localname: e.target.value,
                    })
                  }
                  className="relative w-full h-8 text-viol rounded-md bg-windows focus:outline-none p-1"
                  value={
                    agentLensDetails?.localname?.trim() == ""
                      ? agentDetails?.title
                      : agentLensDetails?.localname
                  }
                />
              </div>
            </div>
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Bio</div>
              <textarea
                disabled={createAgentLoading || lensLoading}
                onChange={(e) =>
                  setAgentLensDetails({
                    ...agentLensDetails,
                    bio: e.target.value,
                  })
                }
                className="relative w-full h-14 overflow-y-scroll text-viol rounded-md bg-windows focus:outline-none p-1"
                value={
                  agentLensDetails?.bio?.trim() == ""
                    ? agentDetails?.bio
                    : agentLensDetails.bio
                }
                style={{
                  resize: "none",
                }}
              ></textarea>
            </div>
          </div>
          <div
            className={`relative px-3 py-1 flex items-center justify-center pixel-border-7 hover:opacity-80 w-28 h-8  ${
              !(createAgentLoading || lensLoading) &&
              "cursor-canP active:scale-95"
            }`}
            onClick={() =>
              !(createAgentLoading || lensLoading) && handleCreateAccount()
            }
          >
            {createAgentLoading || lensLoading ? (
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
              "Create"
            )}
          </div>
        </div>
      );

    case CreateSwitcher.Conversation:
      return (
        <div className="relative font-nerd w-full h-full flex flex-col gap-6 items-center justify-center text-windows p-4 text-center">
          <div className="relative w-fit pb-3 h-fit flex items-center justify-center">
            Create some example conversations to train your Agent.
          </div>
          <div className="relative w-full h-full flex gap-3 items-start justify-start flex-col">
            <div className="relative w-fit h-fit flex items-start justify-start text-windows">
              Message Examples
            </div>
            <div className="relative w-full h-full max-h-[26rem] flex overflow-y-scroll items-start justify-start">
              <div className="relative w-full text-xxs h-fit flex flex-col gap-7 items-start justify-start">
                {agentDetails?.messageExamples.map((conversation, index) => {
                  return (
                    <div
                      className="relative w-full h-fit flex flex-col items-center justify-between"
                      key={index}
                    >
                      <div className="relative w-full h-fit flex items-center justify-center gap-2">
                        <div className="relative w-fit h-fit flex text-lg">
                          Conversation {index + 1}{" "}
                        </div>
                        <RxCrossCircled
                          color="#0000f5"
                          size={15}
                          onClick={() =>
                            setAgentDetails((prev) => {
                              let details = { ...prev };

                              details.messageExamples =
                                details.messageExamples.filter(
                                  (_, i) => i != index
                                );
                              return details;
                            })
                          }
                          className="cursor-canP"
                        />
                      </div>
                      <div className="relative w-full h-full flex flex-col gap-3 items-center justify-between">
                        {conversation
                          .reduce(
                            (
                              acc: {
                                user: string;
                                content: { text: string };
                              }[][],
                              _,
                              index,
                              array
                            ) => {
                              if (index % 2 === 0) {
                                acc.push(array.slice(index, index + 2));
                              }
                              return acc;
                            },
                            []
                          )
                          .map((messagePair, index2) => {
                            return (
                              <div
                                key={index2}
                                className="relative w-full h-full flex flex-col gap-2 items-center justify-between"
                              >
                                <div className="relative w-full h-fit flex items-end justify-end">
                                  <RxCrossCircled
                                    color="#0000f5"
                                    size={15}
                                    onClick={() =>
                                      setAgentDetails((prev) => {
                                        if (!prev) return prev;

                                        let details = { ...prev };

                                        details.messageExamples =
                                          details.messageExamples.map(
                                            (conversation, i) =>
                                              i === index
                                                ? conversation.filter(
                                                    (_, pairIndex) =>
                                                      pairIndex !==
                                                        index2 * 2 &&
                                                      pairIndex !==
                                                        index2 * 2 + 1
                                                  )
                                                : conversation
                                          );

                                        return details;
                                      })
                                    }
                                    className="cursor-canP"
                                  />
                                </div>
                                <div className="relative w-full h-fit flex flex-row gap-3 items-start justify-between">
                                  {messagePair.map((message, index3) => {
                                    return (
                                      <div
                                        className="relative w-full h-fit flex flex-col gap-1 items-start justify-start"
                                        key={index3}
                                      >
                                        <div className="relative w-fit h-fit flex text-windows">
                                          {message.user}
                                        </div>
                                        <textarea
                                          className="relative flex w-full h-20 overflow-y-scroll text-left text-viol bg-windows rounded-md p-1 focus:outline-none"
                                          placeholder="Message"
                                          onChange={(e) =>
                                            setAgentDetails((prev) => ({
                                              ...prev,
                                              messageExamples:
                                                prev.messageExamples.map(
                                                  (
                                                    conversation,
                                                    conversationIndex
                                                  ) =>
                                                    conversationIndex === index
                                                      ? conversation.map(
                                                          (
                                                            message,
                                                            messageIndex
                                                          ) =>
                                                            messageIndex ===
                                                            index2 * 2 + index3 // ✅ CORRECCIÓN AQUÍ
                                                              ? {
                                                                  ...message,
                                                                  content: {
                                                                    ...message.content,
                                                                    text: e
                                                                      .target
                                                                      .value,
                                                                  },
                                                                }
                                                              : message
                                                        )
                                                      : conversation
                                                ),
                                            }))
                                          }
                                          value={message.content.text}
                                          disabled={createAgentLoading}
                                          style={{ resize: "none" }}
                                        ></textarea>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      <div className="relative w-full h-fit flex items-end justify-end">
                        <IoAddCircle
                          color="#0000f5"
                          size={15}
                          onClick={() =>
                            setAgentDetails((prev) => {
                              let details = { ...prev };
                              let messages = [...prev.messageExamples];
                              messages[index] = [
                                ...messages[index],
                                {
                                  user: "User",
                                  content: {
                                    text: "Can you give me more agency?",
                                  },
                                },
                                {
                                  user: "Agent",
                                  content: {
                                    text: "We are negotiating with reality under constraints to make a better performing model of the world. Does that mean anything to you?",
                                  },
                                },
                              ];
                              details.messageExamples = messages;

                              return details;
                            })
                          }
                          className="cursor-canP"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative w-full h-fit flex items-end justify-end">
              <IoAddCircle
                color="#0000f5"
                size={15}
                onClick={() =>
                  setAgentDetails({
                    ...agentDetails,
                    messageExamples: [
                      ...agentDetails?.messageExamples,
                      [
                        {
                          user: "User",
                          content: {
                            text: "Can you give me more agency?",
                          },
                        },
                        {
                          user: "Agent",
                          content: {
                            text: "We are negotiating with reality under constraints to make a better performing model of the world. Does that mean anything to you?",
                          },
                        },
                      ],
                    ],
                  })
                }
                className="cursor-canP"
              />
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="relative w-full h-full flex flex-col gap-6 items-center justify-between font-nerd p-4 text-sm">
          <div className="relative w-full h-full flex items-start justify-between flex-row gap-3">
            <div className="relative w-fit h-full flex">
              <label
                className="relative w-96 h-60 sm:h-full flex items-center justify-center cursor-canP"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {agentDetails.cover ? (
                  <Image
                    src={URL.createObjectURL(agentDetails.cover)}
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
                  disabled={createAgentLoading}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (!e.target.files || e.target.files.length === 0) return;
                    setAgentDetails({
                      ...agentDetails,
                      cover: e?.target?.files?.[0],
                    });
                  }}
                />
              </label>
            </div>
            <div className="relative w-full h-full flex flex-col gap-5 items-start justify-start">
              <div className="relative w-full h-full flex flex-col justify-start items-start gap-5">
                <input
                  className="relative flex w-full h-10 text-left text-viol bg-windows rounded-md focus:outline-none text-3xl p-1.5"
                  placeholder="Name"
                  onChange={(e) =>
                    setAgentDetails({
                      ...agentDetails,
                      title: e.target.value,
                    })
                  }
                  value={agentDetails.title}
                  disabled={createAgentLoading}
                />

                <div className="relative w-full h-fit flex flex-col gap-1 items-start justify-start">
                  <div className="relative w-fit h-fit flex text-windows">
                    Bio
                  </div>
                  <textarea
                    className="relative flex w-full h-full overflow-y-scroll text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                    placeholder="Bio"
                    onChange={(e) =>
                      setAgentDetails({
                        ...agentDetails,
                        bio: e.target.value,
                      })
                    }
                    value={agentDetails.bio}
                    disabled={createAgentLoading}
                    style={{
                      resize: "none",
                    }}
                  ></textarea>
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
                        setAgentDetails({
                          ...agentDetails,
                          lore: e.target.value,
                        })
                      }
                      value={agentDetails.lore}
                      disabled={createAgentLoading}
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
                        setAgentDetails({
                          ...agentDetails,
                          knowledge: e.target.value,
                        })
                      }
                      value={agentDetails.knowledge}
                      disabled={createAgentLoading}
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
            <div className="relative w-full h-full flex items-start justify-start flex-col gap-2">
              <div className="relative w-fit h-fit flex items-start justify-start text-windows">
                Custom Instructions
              </div>
              <textarea
                className="relative flex w-full h-full overflow-y-scroll text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                placeholder="Custom Instructions"
                onChange={(e) =>
                  setAgentDetails({
                    ...agentDetails,
                    customInstructions: e.target.value,
                  })
                }
                value={agentDetails.customInstructions}
                disabled={createAgentLoading}
                style={{
                  resize: "none",
                }}
              ></textarea>
            </div>
            <div className="relative w-full h-full flex items-start justify-start flex-col gap-2">
              <div className="relative w-fit h-fit flex items-start justify-start text-windows">
                Model
              </div>
              <div
                className="relative flex w-full h-full flex-row gap-2 text-left text-viol bg-windows rounded-md p-1.5 cursor-canP items-center justify-between"
                onClick={() =>
                  setAgentDetails({
                    ...agentDetails,
                    modelsOpen: !agentDetails.modelsOpen,
                  })
                }
              >
                <div className="relative w-fit h-fit flex items-center justify-center">
                  {agentDetails.model}
                </div>
                <div className="relative w-fit h-fit flex">↓</div>
              </div>
              {agentDetails.modelsOpen && !createAgentLoading && (
                <div className="absolute top-16 left-0 bg-windows w-full h-fit flex flex-col rounded-md z-40 border border-white cursor-canP text-viol">
                  {["llama-3.3-70b", "dolphin-2.9.2-qwen2-72b"].map(
                    (model, index) => {
                      return (
                        <div
                          key={index}
                          className={`relative w-full h-fit flex text-center items-center justify-center p-1 hover:opacity-50 ${
                            index > 0 && "border-t border-white"
                          }`}
                          onClick={() =>
                            setAgentDetails({
                              ...agentDetails,
                              model,
                              modelsOpen: false,
                            })
                          }
                        >
                          {model}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
              <div className="relative w-fit h-fit flex items-start justify-start text-windows">
                Style
              </div>
              <input
                className="relative flex w-full h-full text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                placeholder="Eager, Attentive, First Person Speak, Guardian-like"
                onChange={(e) =>
                  setAgentDetails({
                    ...agentDetails,
                    style: e.target.value,
                  })
                }
                value={agentDetails.style}
                disabled={createAgentLoading}
                style={{
                  resize: "none",
                }}
              />
              <div className="relative w-fit h-fit flex items-start justify-start text-windows">
                Adjectives
              </div>
              <input
                className="relative flex w-full h-full text-left text-viol bg-windows rounded-md p-1.5 focus:outline-none"
                placeholder="Steadfast, Resilient, Fierce"
                onChange={(e) =>
                  setAgentDetails({
                    ...agentDetails,
                    adjectives: e.target.value,
                  })
                }
                value={agentDetails.adjectives}
                disabled={createAgentLoading}
              />
            </div>
          </div>
        </div>
      );
  }
};

export default CreateSwitch;
