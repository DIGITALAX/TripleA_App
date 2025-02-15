import { chains } from "@lens-network/sdk/viem";
import {
  Account,
  Context,
  evmAddress,
  PageSize,
  PublicClient,
} from "@lens-protocol/client";
import { SetStateAction, useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { Fulfiller, LensConnected, NFTData } from "../types/common.types";
import { getCollectionSearch } from "../../../../graphql/queries/getCollectionSearch";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import {
  fetchAccounts,
  fetchAccountsAvailable,
  revokeAuthentication,
} from "@lens-protocol/client/actions";
import { getFulfillers } from "../../../../graphql/queries/getFulfillers";

const useHeader = (
  address: `0x${string}` | undefined,
  lensClient: PublicClient<Context> | undefined,
  setIndexer: ((e: SetStateAction<string | undefined>) => void) | undefined,
  setCreateAccount: ((e: SetStateAction<boolean>) => void) | undefined,
  setLensConnected:
    | ((e: SetStateAction<LensConnected | undefined>) => void)
    | undefined,
  lensConnected: LensConnected | undefined,
  setFulfillers: (e: SetStateAction<Fulfiller[]>) => void,
  fulfillers: Fulfiller[]
) => {
  const [openAccount, setOpenAccount] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [lensLoading, setLensLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchItems, setSearchItems] = useState<{
    nfts: NFTData[];
    handles: Account[];
  }>({
    nfts: [],
    handles: [],
  });
  const handleSearch = async () => {
    if (search?.trim() == "") return;
    setSearchLoading(true);
    try {
      const data = await getCollectionSearch(search);

      const metadataCache = new Map<string, any>();
      const profileCache = new Map<string, Account>();
      const pictureCache = new Map<string, string>();

      const colls: NFTData[] = await Promise.all(
        data?.data?.collectionCreateds?.map(async (collection: any) => {
          if (!collection.metadata) {
            if (!metadataCache.has(collection.uri)) {
              const response = await fetch(
                `${INFURA_GATEWAY}/ipfs/${collection.uri.split("ipfs://")?.[1]}`
              );
              metadataCache.set(collection.uri, await response.json());
            }
            collection.metadata = metadataCache.get(collection.uri);
          }
          const artistAddress = evmAddress(collection?.artist);
          if (!profileCache.has(artistAddress)) {
            const result = await fetchAccountsAvailable(lensClient!, {
              managedBy: artistAddress,
              includeOwned: true,
            });

            if (result.isErr()) {
              setSearchLoading(false);
              return;
            }

            profileCache.set(artistAddress, result.value.items?.[0]?.account);
          }

          let picture = "";
          const profile = profileCache.get(artistAddress);

          if (profile?.metadata?.picture) {
            const pictureKey = profile.metadata.picture.split("lens://")?.[1];
            if (!pictureCache.has(pictureKey)) {
              const response = await fetch(`${STORAGE_NODE}/${pictureKey}`);
              const json = await response.json();
              pictureCache.set(pictureKey, json.item);
            }
            picture = pictureCache.get(pictureKey) || "";
          }

          return {
            id: collection?.collectionId,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
            description: collection?.metadata?.description,
            artist: collection?.artist,
            profile: {
              ...profile,
              metadata: {
                ...profile?.metadata,
                picture,
              },
            },
          };
        })
      );

      const res = await fetchAccounts(
        lensConnected?.sessionClient || lensClient!,
        {
          pageSize: PageSize.Ten,
          filter: {
            searchBy: {
              localNameQuery: search,
            },
          },
        }
      );
      let handles: Account[] = [];

      if (res.isOk()) {
        handles = res.value?.items as Account[];
      }

      handles = await Promise.all(
        handles?.map(async (han) => {
          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${han?.metadata?.picture?.split("lens://")?.[1]}`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          return {
            ...han,
            metadata: {
              ...han?.metadata,
              picture,
            },
          } as Account;
        })
      );

      setSearchItems({
        nfts: colls,
        handles,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setSearchLoading(false);
  };

  const handleLensConnect = async () => {
    if (!address || !lensClient) return;
    setLensLoading(true);
    try {
      const signer = createWalletClient({
        chain: chains.testnet,
        transport: custom(window.ethereum!),
        account: address,
      });
      const accounts = await fetchAccountsAvailable(lensClient, {
        managedBy: evmAddress(signer.account.address),
        includeOwned: true,
      });

      if (accounts.isErr()) {
        setLensLoading(false);
        return;
      }

      if (accounts.value.items?.[0]?.account?.address) {
        const authenticated = await lensClient.login({
          accountOwner: {
            account: evmAddress(accounts.value.items?.[0]?.account?.address),
            owner: signer.account.address?.toLowerCase(),
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (authenticated.isErr()) {
          console.error(authenticated.error);
          setIndexer?.("Error Authenticating");
          setLensLoading(false);
          return;
        }

        const sessionClient = authenticated.value;

        let picture = "";
        const cadena = await fetch(
          `${STORAGE_NODE}/${
            accounts.value.items?.[0]?.account?.metadata?.picture?.split(
              "lens://"
            )?.[1]
          }`
        );

        if (cadena) {
          const json = await cadena.json();
          picture = json.item;
        }

        setLensConnected?.({
          sessionClient,
          profile: {
            ...accounts.value.items?.[0]?.account,
            metadata: {
              ...accounts.value.items?.[0]?.account?.metadata!,
              picture,
            },
          },
        });
      } else {
        const authenticatedOnboarding = await lensClient.login({
          onboardingUser: {
            wallet: signer.account.address,
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (authenticatedOnboarding.isErr()) {
          console.error(authenticatedOnboarding.error);
          setIndexer?.("Error Onboarding");

          setLensLoading(false);
          return;
        }

        const sessionClient = authenticatedOnboarding.value;

        setLensConnected?.({
          sessionClient,
        });

        setCreateAccount?.(true);
      }
    } catch (err: any) {
      console.error(err.message);
    }

    setLensLoading(false);
  };

  const resumeLensSession = async () => {
    try {
      const resumed = await lensClient?.resumeSession();

      if (resumed?.isOk()) {
        const accounts = await fetchAccountsAvailable(lensClient!, {
          managedBy: evmAddress(address!),
          includeOwned: true,
        });

        if (accounts.isErr()) {
          return;
        }

        let picture = "";
        const cadena = await fetch(
          `${STORAGE_NODE}/${
            accounts.value.items?.[0]?.account?.metadata?.picture?.split(
              "lens://"
            )?.[1]
          }`
        );

        if (cadena) {
          const json = await cadena.json();
          picture = json.item;
        }

        setLensConnected?.({
          ...lensConnected,
          profile: {
            ...accounts.value.items?.[0]?.account,
            metadata: {
              ...accounts.value.items?.[0]?.account?.metadata!,
              picture,
            },
          },
          sessionClient: resumed?.value,
        });
      }
    } catch (err) {
      console.error("Error al reanudar la sesión:", err);
      return null;
    }
  };

  const logout = async () => {
    setLensLoading(true);
    try {
      const auth = await lensConnected?.sessionClient?.getAuthenticatedUser();

      if (auth?.isOk()) {
        const res = await revokeAuthentication(lensConnected?.sessionClient!, {
          authenticationId: auth.value?.authenticationId,
        });

        setLensConnected?.(undefined);
        window.localStorage.removeItem("lens.testnet.credentials");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setLensLoading(false);
  };

  const handleFulfillers = async () => {
    try {
      const data = await getFulfillers();

      const fulfillers = await Promise.all(
        data?.data?.fulfillerCreateds?.map(async (ful: any) => {
          if (!ful.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${ful.uri.split("ipfs://")?.[1]}`
            );
            ful.metadata = await cadena.json();
          }

          return {
            ...ful,
            ...ful.metadata,
          };
        })
      );

      setFulfillers(fulfillers);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (address && lensClient && !lensConnected?.profile) {
      resumeLensSession();
    }
  }, [address, lensClient]);

  useEffect(() => {
    if (!address && lensConnected?.profile && lensClient) {
      logout();
    }
  }, [address]);

  useEffect(() => {
    if (fulfillers?.length < 1) {
      handleFulfillers();
    }
  }, []);

  return {
    openAccount,
    setOpenAccount,
    searchItems,
    searchLoading,
    handleLensConnect,
    lensLoading,
    search,
    setSearch,
    handleSearch,
    setSearchItems,
    logout,
  };
};

export default useHeader;
