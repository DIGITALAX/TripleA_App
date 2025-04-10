import { SetStateAction, useContext, useEffect, useState } from "react";
import {
  CollectionType,
  Format,
  MintData,
  MintSwitcher,
} from "../types/dashboard.types";
import {
  COLLECTION_MANAGER_CONTRACT,
  INFURA_GATEWAY,
  TOKENS,
  ZERO_ADDRESS,
} from "@/lib/constants";
import CollectionManagerAbi from "@abis/CollectionManagerAbi.json";
import { createWalletClient, custom, decodeEventLog, PublicClient } from "viem";
import { chains } from "@lens-chain/sdk/viem";
import { getCollectionSearch } from "../../../../graphql/queries/getCollectionSearch";
import { ModalContext } from "@/app/providers";

const useMint = (
  publicClient: PublicClient,
  address: `0x${string}` | undefined,
  setMintSwitcher: (e: SetStateAction<MintSwitcher>) => void
) => {
  const context = useContext(ModalContext);
  const [mintLoading, setMintLoading] = useState<boolean>(false);
  const [id, setId] = useState<string | undefined>();
  const [remixSearchLoading, setRemixSearchLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [remixSearch, setRemixSearch] = useState<
    {
      id: string;
      image: string;
      title: string;
    }[]
  >([]);
  const [mintData, setMintData] = useState<MintData>({
    agents: [],
    prices: Array.from({ length: TOKENS.length }, () => 0),
    tokens: TOKENS?.map((item) => item.contract),
    dropId: 0,
    dropCover: undefined,
    dropTitle: "",
    title: "",
    description: "",
    image: undefined,
    amount: 2,
    sizes: [],
    colors: [],
    format: Format.Hoodie,
    collectionType: CollectionType.Digital,
    fulfiller: 0,
    remixable: true,
    remixId: 0,
  });

  const handleMint = async () => {
    if (
      !mintData.image ||
      mintData.prices?.length < 1 ||
      mintData.tokens?.length < 1 ||
      (mintData.dropId === 0 &&
        (!mintData?.dropCover || mintData?.dropTitle?.trim() == ""))
    )
      return;
    setMintLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.mainnet,
        transport: custom((window as any).ethereum),
      });

      let dropMetadata = "";

      if (
        mintData?.dropCover &&
        mintData?.dropId == 0 &&
        mintData?.dropTitle?.trim() !== ""
      ) {
        const responseCover = await fetch("/api/ipfs", {
          method: "POST",
          body: mintData?.dropCover,
        });

        if (!responseCover.ok) {
          const errorText = await responseCover.text();
          console.error("Error from API:", errorText);
          setMintLoading(false);
          return;
        }

        const responseCoverJSON = await responseCover.json();
        const response = await fetch("/api/ipfs", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            cover: "ipfs://" + responseCoverJSON.cid,
            title: mintData?.dropTitle,
          }),
        });

        let responseJSON = await response.json();
        dropMetadata = "ipfs://" + responseJSON?.cid;
      }

      const responseImage = await fetch("/api/ipfs", {
        method: "POST",
        body: mintData?.image,
      });

      if (!responseImage.ok) {
        const errorText = await responseImage.text();
        console.error("Error from API:", errorText);
        setMintLoading(false);
        return;
      }

      const responseImageJSON = await responseImage.json();

      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body:
          mintData.collectionType == CollectionType.IRL
            ? JSON.stringify({
                title: mintData.title,
                description: mintData.description,
                image: "ipfs://" + responseImageJSON.cid,
                sizes: mintData.sizes,
                colors: mintData.colors,
                format: mintData.format,
              })
            : JSON.stringify({
                title: mintData.title,
                description: mintData.description,
                image: "ipfs://" + responseImageJSON.cid,
              }),
      });

      let responseJSON = await response.json();

      const filteredTokensAndPrices =
        mintData?.prices
          ?.map((price, index) => ({ price, token: mintData?.tokens?.[index] }))
          ?.filter(({ price }) => price > 0) ?? [];

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: "create",
        chain: chains.mainnet,
        args: [
          {
            tokens: filteredTokensAndPrices?.map(({ token }) => token),
            prices: filteredTokensAndPrices?.map(
              ({ price }) => Number(price) * 10 ** 18
            ),
            agentIds: mintData?.agents?.map((ag) => Number(ag?.agent?.id)),
            metadata: "ipfs://" + responseJSON?.cid,
            collectionType:
              mintData.collectionType == CollectionType?.IRL ? 1 : 0,
            amount: Number(mintData?.amount),
            fulfillerId:
              mintData.collectionType == CollectionType?.IRL
                ? mintData.fulfiller
                : 0,
            remixId: mintData.remixId,
            remixable: mintData.remixable,
            forArtist: ZERO_ADDRESS,
          },
          mintData?.agents?.map((ag) => ({
            publishFrequency: Number(ag.publishFrequency),
            remixFrequency: Number(ag.remixFrequency),
            leadFrequency: Number(ag.leadFrequency),
            mintFrequency: Number(ag.mintFrequency),
            publish: ag.publish,
            remix: ag.remix,
            lead: ag.lead,
            mint: ag.mint,
            instructions: ag.customInstructions,
          })),
          dropMetadata,
          mintData?.dropId,
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: res,
      });
      const logs = receipt.logs;

      logs
        .map((log) => {
          try {
            const event = decodeEventLog({
              abi: CollectionManagerAbi,
              data: log.data,
              topics: log.topics,
            });
            if (event.eventName == "CollectionCreated") {
              setId(Number((event.args as any)?.collectionId).toString());
            }
          } catch (err) {
            return null;
          }
        })
        .filter((event) => event !== null);

      setMintData({
        agents: [],
        prices: Array.from({ length: TOKENS.length }, () => 0),
        tokens: TOKENS?.map((item) => item.contract),
        dropId: 0,
        dropCover: undefined,
        dropTitle: "",
        title: "",
        description: "",
        image: undefined,
        amount: 2,
        sizes: [],
        colors: [],
        format: Format.Hoodie,
        collectionType: CollectionType.Digital,
        fulfiller: 0,
        remixable: true,
        remixId: 0,
      });
      setMintSwitcher(MintSwitcher.Success);
    } catch (err: any) {
      if (err.message?.includes("PriceTooLow")) {
        context?.setNotification("Update prices to activate agents.");
      }
      console.error(err.message);
    }
    setMintLoading(false);
  };

  const handleRemixSearch = async () => {
    if (title.trim() == "") return;
    setRemixSearchLoading(true);
    try {
      const data = await getCollectionSearch(title);
      const colls: {
        id: string;
        image: string;
        title: string;
      }[] = await Promise.all(
        data?.data?.collectionCreateds?.map(async (collection: any) => {
          if (!collection.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${collection.uri.split("ipfs://")?.[1]}`
            );
            collection.metadata = await cadena.json();
          }

          return {
            id: collection?.collectionId,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
          };
        })
      );

      setRemixSearch(colls);
    } catch (err: any) {
      console.error(err.message);
    }
    setRemixSearchLoading(false);
  };

  useEffect(() => {
    if (mintData.collectionType == CollectionType.IRL) {
      setMintData({
        ...mintData,
        sizes: [],
        colors: [],
      });
    }
  }, [mintData.format]);

  return {
    mintLoading,
    handleMint,
    mintData,
    setMintData,
    id,
    remixSearch,
    handleRemixSearch,
    remixSearchLoading,
    title,
    setTitle,
  };
};

export default useMint;
