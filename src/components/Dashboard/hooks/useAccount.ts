import { LensConnected } from "@/components/Common/types/common.types";
import { SetStateAction, useState } from "react";
import pollResult from "@/lib/helpers/pollResult";
import { StorageClient } from "@lens-chain/storage-client";
import {
  fetchAccount,
  setAccountMetadata,
} from "@lens-protocol/client/actions";
import { account } from "@lens-protocol/metadata";
import { immutable } from "@lens-chain/storage-client";
import { chains } from "@lens-network/sdk/viem";

const useAccount = (
  lensConnected: LensConnected | undefined,
  setLensConnected: (e: SetStateAction<LensConnected | undefined>) => void,
  storageClient: StorageClient,
  setSignless: (e: SetStateAction<boolean>) => void
) => {
  const [accountLoading, setAccountLoading] = useState<boolean>(false);
  const [newAccount, setNewAccount] = useState<{
    localname: string;
    bio: string;
    pfp?: Blob | string;
  }>({
    pfp: lensConnected?.profile?.metadata?.picture,
    localname: lensConnected?.profile?.metadata?.name || "",
    bio: lensConnected?.profile?.metadata?.bio || "",
  });

  const handleUpdateAccount = async () => {
    if (!lensConnected?.sessionClient) return;
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
      const acl = immutable(chains.testnet.id);
      const { uri } = await storageClient?.uploadAsJson(schema, { acl })!;

      const accountResponse = await setAccountMetadata(
        lensConnected?.sessionClient,
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
            lensConnected?.sessionClient
          )
        ) {
          const result = await fetchAccount(lensConnected?.sessionClient, {
            address: lensConnected?.profile?.address,
          });

          if (result.isErr()) {
            setAccountLoading(false);
            return;
          }

         
          if (result.value?.__typename == "Account") {
            setLensConnected?.({
              ...lensConnected,
              profile: result.value,
            });
          }
        } else {
          setSignless?.(true);
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
