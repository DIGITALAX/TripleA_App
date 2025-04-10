import { chains } from "@lens-chain/sdk/viem";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { createWalletClient, custom, decodeEventLog, PublicClient } from "viem";
import { AgentDetails, CreateSwitcher } from "../types/agents.types";
import {
  SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
  AGENT_FEED_RULE,
} from "@/lib/constants";
import AgentManagerAbi from "@abis/AgentManagerAbi.json";
import {
  evmAddress,
  FeedRuleExecuteOn,
  FeedsOrderBy,
} from "@lens-protocol/client";
import pollResult from "@/lib/helpers/pollResult";
import { Wallet, HDNodeWallet, JsonRpcProvider } from "ethers";
import forge from "node-forge";
import {
  createAccountWithUsername,
  createFeed,
  enableSignless,
  fetchAccount,
  fetchFeeds,
  updateFeedRules,
} from "@lens-protocol/client/actions";
import { account, feed as feedMetadata } from "@lens-protocol/metadata";
import { immutable } from "@lens-chain/storage-client";
import { ModalContext } from "@/app/providers";

const useCreateAgent = (
  publicClient: PublicClient,
  address: `0x${string}` | undefined,
  setCreateSwitcher: (e: SetStateAction<CreateSwitcher>) => void
) => {
  const context = useContext(ModalContext);
  const [createAgentLoading, setCreateAgentLoading] = useState<boolean>(false);
  const [agentWallet, setAgentWallet] = useState<HDNodeWallet | undefined>();
  const [lensLoading, setLensLoading] = useState<boolean>(false);
  const [createFeedLoading, setCreateFeedLoading] = useState<boolean>(false);
  const [feedAdminLoading, setFeedAdminLoading] = useState<boolean[]>([]);
  const [id, setId] = useState<string | undefined>();
  const [feed, setFeed] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });
  const [agentAccountAddress, setAgentAccountAddress] = useState<
    string | undefined
  >();
  const [agentDetails, setAgentDetails] = useState<AgentDetails>({
    title: "",
    cover: undefined,
    owners: [""],
    lore: "",
    bio: "",
    knowledge: "",
    model: "llama-3.3-70b",
    modelsOpen: false,
    messageExamples: [
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
    customInstructions: "",
    style: "",
    adjectives: "",
    feeds: [],
  });
  const [agentLensDetails, setAgentLensDetails] = useState<{
    localname: string;
    bio: string;
    username: string;
    pfp?: Blob;
  }>({
    localname: agentDetails?.title,
    bio: agentDetails?.bio,
    username: "",
    pfp: agentDetails?.cover,
  });

  const handleCreateAccount = async () => {
    if (!address || !context?.lensConnected?.sessionClient) return;
    setLensLoading(true);
    try {
      let picture = undefined;

      if (agentLensDetails?.pfp || agentDetails?.cover) {
        const res = await fetch("/api/ipfs", {
          method: "POST",
          body: agentLensDetails?.pfp
            ? agentLensDetails?.pfp
            : agentDetails?.cover,
        });
        const json = await res.json();

        picture = "ipfs://" + json?.cid;
      }

      const schema = account({
        name:
          agentLensDetails?.localname?.trim() == ""
            ? agentDetails?.title
            : agentLensDetails?.localname,
        bio:
          agentLensDetails?.bio?.trim() == ""
            ? agentDetails?.bio
            : agentLensDetails?.bio,
        picture,
      });
      const acl = immutable(chains.mainnet.id);
      const { uri } = await context?.storageClient?.uploadAsJson(schema, {
        acl,
      })!;

      const provider = new JsonRpcProvider(
        "https://rpc.lens.xyz",
        Number(chains.mainnet)
      );
      const agentWalletCreated = Wallet.createRandom(provider);

  

      const authenticatedOnboarding = await context?.lensClient?.login({
        onboardingUser: {
          wallet: agentWalletCreated.address,
        },
        signMessage: (message) => agentWalletCreated.signMessage(message),
      });

      if (authenticatedOnboarding?.isOk()) {
        const accountResponse = await createAccountWithUsername(
          authenticatedOnboarding.value,
          {
            accountManager: [evmAddress(agentWalletCreated.address)],
            username: {
              localName: agentLensDetails?.username,
            },
            metadataUri: uri,
          }
        );

        if (accountResponse.isErr()) {
          if (accountResponse.error.message.includes("The username already")) {
            context?.setNotification(
              "Username Already Taken. Try something else?"
            );
          } else {
            context?.setNotification("Something went wrong. Try again? :/");
          }
          setLensLoading(false);
          return;
        }

        if ((accountResponse.value as any)?.hash) {
          const res = await pollResult(
            (accountResponse.value as any)?.hash,
            context?.lensConnected?.sessionClient
          );
          if (res) {
            const newAcc = await fetchAccount(
              context?.lensConnected?.sessionClient,
              {
                username: {
                  localName: agentLensDetails?.username,
                },
              }
            );

            if (newAcc.isErr()) {
              setLensLoading(false);
              return;
            }

            if (newAcc.value?.address) {
              const authenticated = await context?.lensClient?.login({
                accountOwner: {
                  account: evmAddress(newAcc.value.address),
                  owner: agentWalletCreated.address?.toLowerCase(),
                },
                signMessage: (message) =>
                  agentWalletCreated.signMessage(message),
              });

              if (authenticated?.isOk()) {
                const res = await enableSignless(authenticated.value);

                if (res.isErr()) {
                  console.error(res.error);

                  context?.setIndexer?.("Error with Enabling Signless");
                  setLensLoading(false);
                } else {
                  const responseKey = await fetch("/api/faucet", {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    body: JSON.stringify({
                      address: agentWalletCreated.address,
                    }),
                  });

                  let tx_res = await responseKey.json();

                  if (tx_res?.tx) {
                    const tx = {
                      chainId: (res.value.__typename as any)?.raw?.chainId,
                      from: (res.value as any)?.raw?.from,
                      to: (res.value as any)?.raw?.to,
                      nonce: (res.value as any)?.raw?.nonce,
                      gasLimit: (res.value as any)?.raw?.gasLimit,
                      maxFeePerGas: (res.value as any)?.raw?.maxFeePerGas,
                      maxPriorityFeePerGas: (res.value as any)?.raw
                        ?.maxPriorityFeePerGas,
                      value: (res.value as any)?.raw?.value,
                      data: (res.value as any)?.raw?.data,
                    };
                    const txResponse = await agentWalletCreated.sendTransaction(
                      tx
                    );
                    await txResponse.wait();
                    if (txResponse) {
                      setCreateSwitcher(CreateSwitcher.Feeds);
                      setAgentWallet(agentWalletCreated);
                      setAgentAccountAddress(newAcc.value?.address);
                    } else {
                      context?.setIndexer?.("Error with Enabling Signless");
                      setLensLoading(false);
                      return;
                    }
                  } else {
                    context?.setIndexer?.("Error with Enabling Signless");
                    setLensLoading(false);
                    return;
                  }
                }
              } else {
                console.error(accountResponse);
                context?.setIndexer?.("Error Enabling Signless Transactions.");
                setLensLoading(false);
                return;
              }
            } else {
              console.error(accountResponse);
              context?.setIndexer?.("Error with Fetching New Account");
              setLensLoading(false);
              return;
            }
          } else {
            console.error(accountResponse);
            context?.setIndexer?.("Error with Account Creation");
            setLensLoading(false);
            return;
          }
        } else {
          console.error(accountResponse);
          context?.setIndexer?.("Error with Account Creation");
          setLensLoading(false);
          return;
        }
      } else {
        context?.setNotification("Error creating Lens Account. Try again?");
        setLensLoading(false);
        return;
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setLensLoading(false);
  };

  const handleCreateAgent = async () => {
    if (
      agentDetails?.feeds?.filter((f) => !f?.added || f?.address?.trim() == "")
        ?.length > 0
    ) {
      context?.setNotification?.("Add Agentic Rules to All Feeds!");
      return;
    }

    if (
      !address ||
      agentDetails?.title?.trim() == "" ||
      agentDetails?.bio?.trim() == "" ||
      agentDetails?.customInstructions?.trim() == "" ||
      !agentDetails?.cover ||
      !agentWallet
    ) {
      context?.setNotification?.("Fill Out All Details!");
      return;
    }
    if (!agentAccountAddress || !agentWallet) {
      context?.setNotification?.("Create your Agent's Lens Account!");
      return;
    }
    setCreateAgentLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      const responseImage = await fetch("/api/ipfs", {
        method: "POST",
        body: agentDetails?.cover,
      });

      if (!responseImage.ok) {
        const errorText = await responseImage.text();
        console.error("Error from API:", errorText);
        setCreateAgentLoading(false);
        return;
      }

      const responseImageJSON = await responseImage.json();

      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: agentDetails.title,
          bio: agentDetails.bio,
          lore: agentDetails.lore,
          knowledge: agentDetails.knowledge,
          messageExamples: agentDetails.messageExamples
            ?.map((con) =>
              JSON.stringify(
                con
                  ?.map((msg) =>
                    msg.user
                      .replace("User", "{{user1}}")
                      .replace("Agent", agentDetails.title)
                  )
                  ?.filter((con) => con.length > 0)
              )
            )
            .filter(Boolean),
          style: agentDetails.style,
          adjectives: agentDetails.adjectives,
          cover: "ipfs://" + responseImageJSON.cid,
          customInstructions: agentDetails.customInstructions,
          feeds: agentDetails.feeds
            ?.filter((f) => f && f.address && f.address.trim() !== "")
            ?.filter(Boolean)
            ?.map((ad) => ad?.address),
          model: agentDetails.model,
        }),
      });

      let responseJSON = await response.json();

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "createAgent",
        chain: chains.mainnet,
        args: [
          [agentWallet.address],
          [address, ...agentDetails.owners?.filter((o) => o.trim() !== "")],
          "ipfs://" + responseJSON?.cid,
          false,
          false,
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: res,
      });
      const logs = receipt.logs;
      let agentId: number = 0;

      logs
        .map((log) => {
          try {
            const event = decodeEventLog({
              abi: AgentManagerAbi,
              data: log.data,
              topics: log.topics,
            });
            if (event.eventName == "AgentCreated") {
              agentId = Number((event.args as any)?.id);
              setId(Number((event.args as any)?.id).toString());
            }
          } catch (err) {
            return null;
          }
        })
        .filter((event) => event !== null);

      const responsePublicKey = await fetch("/api/public-key");
      const { publicKey } = await responsePublicKey.json();

      const rsaPublicKey = forge.pki.publicKeyFromPem(publicKey);
      const encryptedPrivateKey = forge.util.encode64(
        rsaPublicKey.encrypt(agentWallet.privateKey, "RSA-OAEP")
      );

      const responseKey = await fetch("/api/encrypt", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          encryptedPrivateKey,
        }),
      });

      let responseKeyJSON = await responseKey.json();

      const data = {
        publicAddress: agentWallet.address,
        encryptionDetails: responseKeyJSON.encryptionDetails,
        id: agentId,
        title: agentDetails.title,
        bio: agentDetails.bio,
        lore: agentDetails.lore,
        knowledge: agentDetails.knowledge,
        adjectives: agentDetails.adjectives,
        style: agentDetails.style,
        messageExamples: agentDetails.messageExamples,
        cover: "ipfs://" + responseImageJSON.cid,
        customInstructions: agentDetails.customInstructions,
        accountAddress: agentAccountAddress,
      };

      const newSocket = new WebSocket(
        // `ws://127.0.0.1:10000?key=${process.env.NEXT_PUBLIC_RENDER_KEY}`
        `wss://triplea-66ij.onrender.com?key=${process.env.NEXT_PUBLIC_RENDER_KEY}`
      );

      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      newSocket.onopen = () => {
        newSocket.send(JSON.stringify(data));
      };
      setCreateSwitcher(CreateSwitcher.Success);
    } catch (err: any) {
      console.error(err.message);
    }
    setCreateAgentLoading(false);
  };

  const handleCreateFeed = async () => {
    if (
      feed.name.trim() == "" ||
      feed.description.trim() == ""
      //  ||
      // !agentWallet
    )
      return;
    setCreateFeedLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
        account: address,
      });

      const builder = await context?.lensClient?.login({
        builder: {
          address,
        },
        signMessage: (message) => clientWallet.signMessage({ message } as any),
      });

      if (builder?.isOk()) {
        const schema = feedMetadata({
          name: feed.name,
          description: feed.description,
        });

        const acl = immutable(chains.mainnet.id);
        const { uri } = await context?.storageClient?.uploadAsJson(schema, {
          acl,
        })!;

        const resFeed = await createFeed(builder.value, {
          metadataUri: uri,
          admins: [
            address,
            // , agentWallet?.address
          ],
          rules: {
            required: [
              {
                unknownRule: {
                  executeOn: [FeedRuleExecuteOn.CreatingPost],
                  address: AGENT_FEED_RULE,
                },
              },
            ],
          },
        });
       
        if (resFeed.isOk()) {
          const feeds = await fetchFeeds(
            context?.lensConnected?.sessionClient!,
            {
              orderBy: FeedsOrderBy.LatestFirst,
              filter: {
                managedBy: {
                  includeOwners: true,
                  address,
                },
              },
            }
          );


          if (feeds.isOk()) {
            if (feeds?.value?.items?.[0]?.address) {
              setAgentDetails({
                ...agentDetails,
                feeds: [
                  {
                    address: feeds?.value?.items?.[0]?.address,
                    added: true,
                  },
                  ...agentDetails.feeds,
                ],
              });
              setFeed({
                description: "",
                name: "",
              });
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setCreateFeedLoading(false);
  };

  const addFeedRule = async (index: number) => {
    if (agentDetails.feeds?.[index]?.address?.trim() == "") return;

    setFeedAdminLoading((prev) => {
      let feeds = [...prev];

      feeds[index] = true;
      return feeds;
    });
    try {
      const res = await updateFeedRules(
        context?.lensConnected?.sessionClient!,
        {
          toAdd: {
            required: [
              {
                unknownRule: {
                  executeOn: [FeedRuleExecuteOn.CreatingPost],
                  address: AGENT_FEED_RULE,
                },
              },
            ],
          },
          feed: agentDetails.feeds?.[index]?.address,
        }
      );

      if (res.isErr()) {
        setFeedAdminLoading((prev) => {
          let feeds = [...prev];

          feeds[index] = true;
          return feeds;
        });
        context?.setNotification("Something went wrong. Try again? :/");
        return;
      }

      setAgentDetails((prev) => ({
        ...prev,
        feeds: agentDetails.feeds?.map((feed, i) =>
          i == index
            ? {
                ...feed,
                added: true,
              }
            : feed
        ),
      }));
      context?.setNotification("Agentic Feed Rule Added!");
    } catch (err: any) {
      console.error(err.message);
    }
    setFeedAdminLoading((prev) => {
      let feeds = [...prev];

      feeds[index] = false;
      return feeds;
    });
  };

  useEffect(() => {
    setFeedAdminLoading(
      Array.from({ length: agentDetails?.feeds?.length }, () => false)
    );
  }, [agentDetails?.feeds]);

  return {
    createAgentLoading,
    handleCreateAgent,
    id,
    agentDetails,
    setAgentDetails,
    agentLensDetails,
    setAgentLensDetails,
    lensLoading,
    handleCreateAccount,
    agentWallet,
    handleCreateFeed,
    createFeedLoading,
    feed,
    setFeed,
    addFeedRule,
    feedAdminLoading,
  };
};

export default useCreateAgent;
