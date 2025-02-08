import { LensConnected } from "@/components/Common/types/common.types";
import { SetStateAction, useState } from "react";
import pollResult from "@/lib/helpers/pollResult";
import { v4 as uuidv4 } from "uuid";
import { StorageClient } from "@lens-protocol/storage-node-client";
import { STORAGE_NODE } from "@/lib/constants";
import {
  fetchAccount,
  setAccountMetadata,
} from "@lens-protocol/client/actions";

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
      let picture = {};

      if (newAccount?.pfp && newAccount.pfp instanceof Blob) {
        const res = await fetch("/api/ipfs", {
          method: "POST",
          body: newAccount?.pfp,
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
          name: newAccount?.localname,
          bio: newAccount?.bio,
          ...picture,
        },
      });

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

          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${
              result.value?.metadata?.picture?.split("lens://")?.[1]
            }`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          if (result.value?.__typename == "Account") {
            setLensConnected?.({
              ...lensConnected,
              profile: {
                ...result.value,
                metadata: {
                  ...result.value?.metadata!,
                  picture,
                },
              },
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
