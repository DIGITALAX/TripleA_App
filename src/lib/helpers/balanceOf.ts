import { SetStateAction } from "react";
import { PublicClient } from "viem";
import { MONA } from "../constants";

export const balanceOf = async (
  publicClient: PublicClient,
  address: `0x${string}` | undefined,
  setNotification: (e: SetStateAction<string | undefined>) => void,
  mint?: boolean
): Promise<boolean> => {
  try {
    const balance = await publicClient.readContract({
      address: MONA,
      abi: [
        {
          constant: true,
          inputs: [
            {
              name: "_owner",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              name: "balance",
              type: "uint256",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "balanceOf",
      args: [address as `0x${string}`],
      account: address,
    });

    if (balance < BigInt(5 * 10 ** 18)) {
      setNotification?.(
        "Hold at least 5 $MONA to " + mint ? "mint  :)" : "create an agent :)"
      );

      return false;
    } else {
      return true;
    }
  } catch (err: any) {
    console.error(err.message);
    return false;
  }
};
