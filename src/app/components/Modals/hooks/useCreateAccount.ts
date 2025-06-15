import { useContext, useState } from "react";
import { Account, evmAddress } from "@lens-protocol/client";
import { createWalletClient, custom } from "viem";
import { chains } from "@lens-chain/sdk/viem";
import pollResult from "@/lib/helpers/pollResult";
import {
  createAccountWithUsername,
  fetchAccount,
} from "@lens-protocol/client/actions";
import { immutable } from "@lens-chain/storage-client";
import { account as accountMetadata } from "@lens-protocol/metadata";
import { ModalContext } from "@/providers";

const useCreateAccount = (address: `0x${string}` | undefined) => {
  const context = useContext(ModalContext);
  const [account, setAccount] = useState<{
    localname: string;
    bio: string;
    username: string;
    pfp?: Blob;
  }>({
    localname: "",
    bio: "",
    username: "",
  });
  const [accountLoading, setAccountLoading] = useState<boolean>(false);

  const handleCreateAccount = async () => {
    if (!address || !context?.lensConnected?.sessionClient) return;
    setAccountLoading(true);
    try {
      const signer = createWalletClient({
        chain: chains.mainnet,
        transport: custom(window.ethereum!),
        account: address,
      });

      let picture = undefined;

      if (account?.pfp) {
        const res = await fetch("/api/ipfs", {
          method: "POST",
          body: account?.pfp,
        });
        const json = await res.json();

        picture = "ipfs://" + json?.cid;
      }

      const schema = accountMetadata({
        name: account?.localname,
        bio: account?.bio,
        picture,
      });
      const acl = immutable(chains.mainnet.id);
      const { uri } = await context?.storageClient?.uploadAsJson(schema, {
        acl,
      })!;

      const accountResponse = await createAccountWithUsername(
        context?.lensConnected?.sessionClient,
        {
          accountManager: [evmAddress(signer.account.address)],
          username: {
            localName: account?.username,
          },
          metadataUri: uri,
        }
      );

      if (accountResponse.isErr()) {
        setAccountLoading(false);
        context?.setNotification("Something went wrong. Try again? :/");
        return;
      }

      if (
        (accountResponse.value as any)?.message?.includes(
          "username already exists"
        )
      ) {
        context?.setNotification("Username Already Taken. Try something else?");
        setAccountLoading(false);
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
                localName: account?.username,
              },
            }
          );

          if (newAcc.isErr()) {
            setAccountLoading(false);
            return;
          }

          if (newAcc.value?.address) {
            const ownerSigner =
              await context?.lensConnected?.sessionClient?.switchAccount({
                account: newAcc.value?.address,
              });

            if (ownerSigner?.isOk()) {
              context?.setLensConnected?.((prev) => ({
                ...(prev || {}),
                profile: newAcc.value as Account,
                sessionClient: ownerSigner?.value,
              }));
              context?.setCreateAccount(false);
              setAccount({
                localname: "",
                bio: "",
                username: "",
              });
            }
          } else {
            console.error(accountResponse);
            context?.setIndexer?.("Error with Fetching New Account");
            setAccountLoading(false);
            return;
          }
        } else {
          console.error(accountResponse);
          context?.setIndexer?.("Error with Account Creation");
          setAccountLoading(false);
          return;
        }
      } else {
        console.error(accountResponse);
        context?.setIndexer?.("Error with Account Creation");
        setAccountLoading(false);
        return;
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setAccountLoading(false);
  };

  return {
    account,
    setAccount,
    accountLoading,
    handleCreateAccount,
  };
};

export default useCreateAccount;
