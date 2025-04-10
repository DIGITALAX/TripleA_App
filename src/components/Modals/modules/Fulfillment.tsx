import { FunctionComponent, JSX, useContext } from "react";
import { FulfillmentProps } from "../types/modals.types";
import useFulfillment from "../hooks/useFulfillment";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-chain/sdk/viem";
import { ModalContext } from "@/app/providers";

const Fulfillment: FunctionComponent<FulfillmentProps> = ({
  address,
}): JSX.Element => {
  const publicClient = createPublicClient({
    chain: chains.mainnet,
    transport: http(
      "https://rpc.lens.xyz"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const context = useContext(ModalContext);
  const {
    purchaseLoading,
    handlePurchase,
    handleFulfillmentEncrypt,
    fulfillmentInfo,
    setFulfillmentInfo,
    fulfillmentEncrypted,
  } = useFulfillment(address, publicClient);
  return (
    <div
      className="inset-0 justify-center fixed z-50 bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto cursor-canP items-center justify-center"
      onClick={() => context?.setFulfillmentOpen(undefined)}
    >
      <div
        className="rounded-2xl w-96 h-fit text-sm text-viol bg-windows rounded-md pixel-border-5 flex items-center justify-start p-3 cursor-default flex-col gap-6 font-nerd"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-fit pb-3 h-fit flex items-center justify-center">
          Fulfillment Details
        </div>
        <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-center">
          <div className="relative w-full h-fit flex items-start justify-between flex-row gap-3">
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Name</div>
              <input
                disabled={purchaseLoading}
                onChange={(e) =>
                  setFulfillmentInfo({
                    ...fulfillmentInfo,
                    name: e.target.value,
                  })
                }
                className="relative w-full text-windows bg-viol h-8 border border-black focus:outline-none p-1"
                value={fulfillmentInfo?.name}
              />
            </div>
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Address</div>
              <input
                disabled={purchaseLoading}
                onChange={(e) =>
                  setFulfillmentInfo({
                    ...fulfillmentInfo,
                    address: e.target.value,
                  })
                }
                className="relative w-full text-windows  bg-viol h-8 border border-black focus:outline-none p-1"
                value={fulfillmentInfo?.address}
              />
            </div>
          </div>
          <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
            <div className="relative w-fit h-fit flex">Country</div>
            <input
              disabled={purchaseLoading}
              onChange={(e) =>
                setFulfillmentInfo({
                  ...fulfillmentInfo,
                  country: e.target.value,
                })
              }
              className="relative w-full text-windows bg-viol h-8 border border-black focus:outline-none p-1"
              value={fulfillmentInfo?.country}
            />
          </div>
          <div className="relative w-full h-fit flex items-start justify-between flex-row gap-3">
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">State</div>
              <input
                disabled={purchaseLoading}
                onChange={(e) =>
                  setFulfillmentInfo({
                    ...fulfillmentInfo,
                    state: e.target.value,
                  })
                }
                className="relative w-full text-windows bg-viol h-8 border border-black focus:outline-none p-1"
                value={fulfillmentInfo?.state}
              />
            </div>
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Zip</div>
              <input
                disabled={purchaseLoading}
                onChange={(e) =>
                  setFulfillmentInfo({
                    ...fulfillmentInfo,
                    zip: e.target.value,
                  })
                }
                className="relative w-full text-windows bg-viol h-8 border border-black focus:outline-none p-1"
                value={fulfillmentInfo?.zip}
              />
            </div>
          </div>
        </div>
        <div
          className={`relative px-3 py-1 flex items-center justify-center rounded-md w-28 text-windows bg-viol h-8 ${
            !purchaseLoading && "cursor-canP active:scale-95 hover:opacity-70"
          }`}
          onClick={() =>
            !purchaseLoading &&
            (fulfillmentEncrypted?.trim() !== ""
              ? handlePurchase()
              : handleFulfillmentEncrypt())
          }
        >
          {purchaseLoading ? (
            <svg
              fill="none"
              className="size-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                fill="currentColor"
              />{" "}
            </svg>
          ) : fulfillmentEncrypted?.trim() !== "" ? (
            "Collect"
          ) : (
            "Encrypt"
          )}
        </div>
      </div>
    </div>
  );
};

export default Fulfillment;
