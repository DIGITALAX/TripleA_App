import { createWalletClient as viemCreateWalletClient } from "viem";
import { CONTRACTS_PAUSED, CONTRACTS_PAUSED_EVENT } from "@/lib/constants";

export const blockIfPaused = (): void => {
  if (!CONTRACTS_PAUSED) return;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONTRACTS_PAUSED_EVENT));
  }
  throw new Error(CONTRACTS_PAUSED_EVENT);
};

export const createWalletClient = ((params: any) => {
  blockIfPaused();
  return viemCreateWalletClient(params);
}) as typeof viemCreateWalletClient;
