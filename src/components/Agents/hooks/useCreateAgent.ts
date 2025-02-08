import { chains } from "@lens-network/sdk/viem";
import { SetStateAction, useEffect, useState } from "react";
import { createWalletClient, custom, decodeEventLog, PublicClient } from "viem";
import { AgentDetails, CreateSwitcher } from "../types/agents.types";
import { SKYHUNTERS_AGENTS_MANAGER_CONTRACT } from "@/lib/constants";
import AgentManagerAbi from "@abis/AgentManagerAbi.json";
import { LensConnected } from "@/components/Common/types/common.types";
import { StorageClient } from "@lens-protocol/storage-node-client";
import { v4 as uuidv4 } from "uuid";
import {
  evmAddress,
  FeedsOrderBy,
  PublicClient as PublicClientLens,
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
} from "@lens-protocol/client/actions";

const useCreateAgent = (
  publicClient: PublicClient,
  address: `0x${string}` | undefined,
  setCreateSwitcher: (e: SetStateAction<CreateSwitcher>) => void,
  lensConnected: LensConnected | undefined,
  setIndexer: (e: SetStateAction<string | undefined>) => void,
  storageClient: StorageClient,
  setNotification: (e: SetStateAction<string | undefined>) => void,
  lensClient: PublicClientLens
) => {
  const [createAgentLoading, setCreateAgentLoading] = useState<boolean>(false);
  const [agentWallet, setAgentWallet] = useState<HDNodeWallet | undefined>();
  const [lensLoading, setLensLoading] = useState<boolean>(false);
  const [createFeedLoading, setCreateFeedLoading] = useState<boolean>(false);
  const [feedAdminLoading, setFeedAdminLoading] = useState<boolean[]>([]);
  const [id, setId] = useState<string | undefined>();
  const [feed, setFeed] = useState<{
    name: string;
    title: string;
    description: string;
  }>({
    name: "",
    title: "",
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
    feeds: [""],
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
    if (!address || !lensConnected?.sessionClient) return;
    setLensLoading(true);
    try {
      let picture = {};

      if (agentLensDetails?.pfp || agentDetails?.cover) {
        const res = await fetch("/api/ipfs", {
          method: "POST",
          body: agentLensDetails?.pfp
            ? agentLensDetails?.pfp
            : agentDetails?.cover,
        });
        const json = await res.json();
        const { uri } = await storageClient.uploadAsJson({
          type: "image/png",
          item: "ipfs://" + json?.cid,
        });

        picture = {
          picture: uri,
        };
      }

      const { uri } = await storageClient.uploadAsJson({
        $schema: "https://json-schemas.lens.dev/account/1.0.0.json",
        lens: {
          id: uuidv4(),
          name:
            agentLensDetails?.localname?.trim() == ""
              ? agentDetails?.title
              : agentLensDetails?.localname,
          bio:
            agentLensDetails?.bio?.trim() == ""
              ? agentDetails?.bio
              : agentLensDetails?.bio,
          ...picture,
        },
      });

      const provider = new JsonRpcProvider(
        "https://rpc.testnet.lens.dev",
        37111
      );
      const agentWalletCreated = Wallet.createRandom(provider);

      const authenticatedOnboarding = await lensClient.login({
        onboardingUser: {
          app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
          wallet: agentWalletCreated.address,
        },
        signMessage: (message) => agentWalletCreated.signMessage(message),
      });

      if (authenticatedOnboarding.isOk()) {
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
            setNotification("Username Already Taken. Try something else?");
          } else {
            setNotification("Something went wrong. Try again? :/");
          }
          setLensLoading(false);
          return;
        }

        if ((accountResponse.value as any)?.hash) {
          const res = await pollResult(
            (accountResponse.value as any)?.hash,
            lensConnected?.sessionClient
          );
          if (res) {
            const newAcc = await fetchAccount(lensConnected?.sessionClient, {
              username: {
                localName: agentLensDetails?.username,
              },
            });

            if (newAcc.isErr()) {
              setLensLoading(false);
              return;
            }


            if (newAcc.value?.address) {
              const authenticated = await lensClient.login({
                accountOwner: {
                  app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
                  account: evmAddress(newAcc.value.address),
                  owner: agentWalletCreated.address?.toLowerCase(),
                },
                signMessage: (message) =>
                  agentWalletCreated.signMessage(message),
              });

              if (authenticated.isOk()) {
                const res = await enableSignless(authenticated.value);

                if (res.isErr()) {
                  console.error(res.error);

                  setIndexer?.("Error with Enabling Signless");
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
                      setCreateSwitcher(CreateSwitcher.Create);
                      setAgentWallet(agentWalletCreated);
                      setAgentAccountAddress(newAcc.value?.address);
                    } else {
                      setIndexer?.("Error with Enabling Signless");
                      setLensLoading(false);
                      return;
                    }
                  } else {
                    setIndexer?.("Error with Enabling Signless");
                    setLensLoading(false);
                    return;
                  }
                }
              } else {
                console.error(accountResponse);
                setIndexer?.("Error Enabling Signless Transactions.");
                setLensLoading(false);
                return;
              }
            } else {
              console.error(accountResponse);
              setIndexer?.("Error with Fetching New Account");
              setLensLoading(false);
              return;
            }
          } else {
            console.error(accountResponse);
            setIndexer?.("Error with Account Creation");
            setLensLoading(false);
            return;
          }
        } else {
          console.error(accountResponse);
          setIndexer?.("Error with Account Creation");
          setLensLoading(false);
          return;
        }
      } else {
        setNotification("Error creating Lens Account. Try again?");
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
      !address ||
      agentDetails?.title?.trim() == "" ||
      agentDetails?.bio?.trim() == "" ||
      agentDetails?.customInstructions?.trim() == "" ||
      !agentDetails?.cover
    )
      return;

    if (!agentAccountAddress || !agentWallet) {
      setNotification?.("Create your Agent's Lens Account!");
      return;
    }
    setCreateAgentLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
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
          feeds: agentDetails.feeds?.filter((fe) => fe.trim() !== ""),
        }),
      });

      let responseJSON = await response.json();

      const { request } = await publicClient.simulateContract({
        address: SKYHUNTERS_AGENTS_MANAGER_CONTRACT,
        abi: AgentManagerAbi,
        functionName: "createAgent",
        chain: chains.testnet,
        args: [
          [agentWallet.address],
          [address, ...agentDetails.owners?.filter((o) => o.trim() !== "")],
          "ipfs://" + responseJSON?.cid,
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

      // const data = {
      //   publicAddress: agentWallet.address,
      //   encryptionDetails: responseKeyJSON.encryptionDetails,
      //   id: agentId,
      //   title: agentDetails.title,
      //   bio: agentDetails.bio,
      //   lore: agentDetails.lore,
      //   knowledge: agentDetails.knowledge,
      //   adjectives: agentDetails.adjectives,
      //   style: agentDetails.style,
      //   messageExamples: agentDetails.messageExamples,
      //   cover: "ipfs://" + responseImageJSON.cid,
      //   customInstructions: agentDetails.customInstructions,
      //   accountAddress: agentAccountAddress,
      // };

      // const newSocket = new WebSocket(
      //   // `ws://127.0.0.1:10000?key=${process.env.NEXT_PUBLIC_RENDER_KEY}`
      //   `wss://aaa-6t0j.onrender.com?key=${process.env.NEXT_PUBLIC_RENDER_KEY}`
      // );

      // newSocket.onerror = (error) => {
      //   console.error("WebSocket error:", error);
      // };

      // newSocket.onopen = () => {
      //   newSocket.send(JSON.stringify(data));
      // };
      setCreateSwitcher(CreateSwitcher.Success);
    } catch (err: any) {
      console.error(err.message);
    }
    setCreateAgentLoading(false);
  };

  const handleCreateFeed = async () => {
    if (
      feed.name.trim() == "" ||
      feed.title.trim() == "" ||
      feed.description.trim() == "" ||
      agentWallet?.address
    )
      return;
    setCreateFeedLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
        account: address,
      });

      const builder = await lensClient.login({
        builder: {
          address,
        },
        signMessage: (message) => clientWallet.signMessage({ message } as any),
      });

      if (builder.isOk()) {
        const { uri } = await storageClient.uploadAsJson({
          $schema: "https://json-schemas.lens.dev/feed/1.0.0.json",
          lens: {
            id: uuidv4(),
            name: feed.name,
            title: feed.title,
            description: feed.description,
          },
        });

        const resFeed = await createFeed(builder.value, {
          metadataUri: uri,
          admins: [address, agentWallet?.address],
        });

        if (resFeed.isOk()) {
          const feeds = await fetchFeeds(lensConnected?.sessionClient!, {
            orderBy: FeedsOrderBy.LatestFirst,
            filter: {
              managedBy: {
                includeOwners: true,
                address,
              },
            },
          });

          if (feeds.isOk()) {
            setAgentDetails({
              ...agentDetails,
              feeds: [feeds?.value?.items?.[0]?.address, ...agentDetails.feeds],
            });
            setFeed({
              title: "",
              description: "",
              name: "",
            });
          }
        }
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setCreateFeedLoading(false);
  };

  const addFeedAdmin = async (index: number) => {
    setFeedAdminLoading((prev) => {
      let feeds = [...prev];

      feeds[index] = true;
      return feeds;
    });
    try {
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
    addFeedAdmin,
    feedAdminLoading,
  };
};

export default useCreateAgent;
