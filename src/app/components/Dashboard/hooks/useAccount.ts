import { useContext, useState } from "react";
import pollResult from "@/lib/helpers/pollResult";
import {
  fetchAccount,
  setAccountMetadata,
} from "@lens-protocol/client/actions";
import { account } from "@lens-protocol/metadata";
import { immutable } from "@lens-chain/storage-client";
import { chains } from "@lens-chain/sdk/viem";
import { ModalContext } from "@/providers";

const useAccount = () => {
  const context = useContext(ModalContext);
  const [accountLoading, setAccountLoading] = useState<boolean>(false);
  const [newAccount, setNewAccount] = useState<{
    localname: string;
    bio: string;
    pfp?: Blob | string;
  }>({
    pfp: context?.lensConnected?.profile?.metadata?.picture,
    localname: context?.lensConnected?.profile?.metadata?.name || "",
    bio: context?.lensConnected?.profile?.metadata?.bio || "",
  });

  const handleUpdateAccount = async () => {
    if (!context?.lensConnected?.sessionClient) return;
    setAccountLoading(true);
    try {
      let picture = undefined;

      if (newAccount?.pfp && newAccount.pfp instanceof Blob) {
        const res = await fetch("/api/ipfs", {
          method: "POST",
          body: newAccount?.pfp,
        });
        const json = await res.json();

        picture = "ipfs://" + json?.cid;
      }

      const schema = account({
        name: newAccount?.localname,
        bio: newAccount?.bio,
        picture,
      });
      const acl = immutable(chains.mainnet.id);
      const { uri } = await context?.storageClient?.uploadAsJson(schema, {
        acl,
      })!;

      const accountResponse = await setAccountMetadata(
        context?.lensConnected?.sessionClient,
        {
          metadataUri: uri,
        }
      );

      if (accountResponse.isErr()) {
        setAccountLoading(false);
        return;
      }

      if ((accountResponse.value as any)?.hash) {
        if (
          await pollResult(
            (accountResponse.value as any)?.hash,
            context?.lensConnected?.sessionClient
          )
        ) {
          const result = await fetchAccount(
            context?.lensConnected?.sessionClient,
            {
              address: context?.lensConnected?.profile?.address,
            }
          );

          if (result.isErr()) {
            setAccountLoading(false);
            return;
          }

          if (result.value?.__typename == "Account") {
            context?.setLensConnected?.({
              ...context?.lensConnected,
              profile: result.value,
            });
          }
        } else {
          context?.setSignless?.(true);
          console.error(accountResponse);
          setAccountLoading(false);
          return;
        }
      } else {
        console.error(accountResponse);
        setAccountLoading(false);
        return;
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setAccountLoading(false);
  };

  return { accountLoading, handleUpdateAccount, newAccount, setNewAccount };
};

export default useAccount;
