import { chains } from "@lens-chain/sdk/viem";
import { Account, evmAddress, PageSize } from "@lens-protocol/client";
import { useContext, useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { NFTData } from "../types/common.types";
import { getCollectionSearch } from "./../../../../../graphql/queries/getCollectionSearch";
import { INFURA_GATEWAY } from "@/lib/constants";
import {
  fetchAccounts,
  fetchAccountsAvailable,
  revokeAuthentication,
} from "@lens-protocol/client/actions";
import { getFulfillers } from "./../../../../../graphql/queries/getFulfillers";
import { ModalContext } from "@/providers";

const useHeader = (address: `0x${string}` | undefined) => {
  const context = useContext(ModalContext);
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
            const result = await fetchAccountsAvailable(context?.lensClient!, {
              managedBy: artistAddress,
              includeOwned: true,
            });

            if (result.isErr()) {
              setSearchLoading(false);
              return;
            }

            profileCache.set(artistAddress, result.value.items?.[0]?.account);
          }

          const profile = profileCache.get(artistAddress);

          return {
            id: collection?.collectionId,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
            description: collection?.metadata?.description,
            artist: collection?.artist,
            profile,
          };
        })
      );

      const res = await fetchAccounts(
        context?.lensConnected?.sessionClient || context?.lensClient!,
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
    if (!address || !context?.lensClient) return;
    setLensLoading(true);
    try {
      const signer = createWalletClient({
        chain: chains.mainnet,
        transport: custom(window.ethereum!),
        account: address,
      });
      const accounts = await fetchAccountsAvailable(context?.lensClient!, {
        managedBy: evmAddress(signer.account.address),
        includeOwned: true,
      });

      if (accounts.isErr()) {
        setLensLoading(false);
        return;
      }

      if (accounts.value.items?.[0]?.account?.address) {
        const authenticated = await context?.lensClient?.login({
          accountOwner: {
            account: evmAddress(accounts.value.items?.[0]?.account?.address),
            owner: signer.account.address?.toLowerCase(),
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (!authenticated?.isOk()) {
          console.error((authenticated as any)?.error);
          context?.setIndexer?.("Error Authenticating");
          setLensLoading(false);
          return;
        }

        const sessionClient = authenticated.value;

        context?.setLensConnected?.({
          sessionClient,
          profile: accounts.value.items?.[0]?.account,
        });
      } else {
        const authenticatedOnboarding = await context?.lensClient?.login({
          onboardingUser: {
            wallet: signer.account.address,
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (!authenticatedOnboarding?.isOk()) {
          console.error((authenticatedOnboarding as any).error);
          context?.setIndexer?.("Error Onboarding");

          setLensLoading(false);
          return;
        }

        const sessionClient = authenticatedOnboarding.value;

        context?.setLensConnected?.({
          sessionClient,
        });

        context?.setCreateAccount?.(true);
      }
    } catch (err: any) {
      console.error(err.message);
    }

    setLensLoading(false);
  };

  const resumeLensSession = async () => {
    try {
      const resumed = await context?.lensClient?.resumeSession();

      if (resumed?.isOk()) {
        const accounts = await fetchAccountsAvailable(context?.lensClient!, {
          managedBy: evmAddress(address!),
          includeOwned: true,
        });

        if (accounts.isErr()) {
          return;
        }

        context?.setLensConnected?.((prev) => ({
          ...prev,
          profile: accounts.value.items?.[0]?.account,
          sessionClient: resumed?.value,
        }));
      }
    } catch (err) {
      console.error("Error al reanudar la sesión:", err);
      return null;
    }
  };

  const logout = async () => {
    setLensLoading(true);
    try {
      const auth =
        await context?.lensConnected?.sessionClient?.getAuthenticatedUser();

      if (auth?.isOk()) {
        const res = await revokeAuthentication(
          context?.lensConnected?.sessionClient!,
          {
            authenticationId: auth.value?.authenticationId,
          }
        );

        context?.setLensConnected?.(undefined);
        window.localStorage.removeItem("lens.mainnet.credentials");
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

      context?.setFulfillers(fulfillers);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (address && context?.lensClient && !context?.lensConnected?.profile) {
      resumeLensSession();
    }
  }, [address, context?.lensClient]);

  useEffect(() => {
    if (!address && context?.lensConnected?.profile && context?.lensClient) {
      logout();
    }
  }, [address]);

  useEffect(() => {
    if (Number(context?.fulfillers?.length) < 1) {
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
