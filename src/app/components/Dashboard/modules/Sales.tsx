import { FunctionComponent, JSX, useContext } from "react";
import { SalesProps, Switcher } from "../types/dashboard.types";
import useSales from "../hooks/useSales";
import { useRouter } from "next/navigation";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useAccount } from "wagmi";
import moment from "moment";
import { AnimationContext } from "@/providers";

const Sales: FunctionComponent<SalesProps> = ({
  setSwitcher,
}): JSX.Element => {
  const { address } = useAccount();
  const animationContext = useContext(AnimationContext);
  const { salesLoading, allSales } = useSales(address);
  const router = useRouter();
  return (
    <div className="relative w-full h-full flex items-start px-4 sm:px-20 py-10 justify-start font-nerd text-windows">
      <div className="relative w-full min-h-80 h-full bg-viol rounded-md p-3 flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex items-start justify-start">
          <div
            className="relative flex w-fit h-fit cursor-canP hover:opacity-70"
            onClick={() => setSwitcher(Switcher.Home)}
          >
            <svg
              className="size-6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {" "}
              <path
                d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
                fill="currentColor"
              />{" "}
            </svg>
          </div>
        </div>
        <div className="flex relative w-full h-full items-center justify-start overflow-x-scroll">
          <div
            className={`relative h-full flex flex-row gap-6 ${
              !salesLoading && allSales?.length < 1 ? "w-full" : "w-fit"
            }`}
          >
            {salesLoading ? (
              Array.from({ length: 10 }).map((_, key) => {
                return (
                  <div
                    key={key}
                    className="relative w-60 h-96 bg-pink rounded-md animate-pulse rounded-xl"
                  ></div>
                );
              })
            ) : allSales?.length < 1 ? (
              <div className="relative w-full h-96 flex items-center justify-center text-sm text-gray-600 font-jack">
                No Sales Yet.
              </div>
            ) : (
              allSales?.map((sale, key) => {
                return (
                  <div
                    key={key}
                    className={`relative w-60 h-96 bg-pink rounded-md flex flex-col items-center justify-between p-2 font-nerd`}
                  >
                    <div
                      className="relative w-full h-full flex cursor-canP pixel-border-7"
                      onClick={() => {
                        animationContext?.setPageChange?.(true);
                        router.prefetch(
                          `/nft/${
                            (sale as any)?.profile?.username?.value?.split(
                              "lens/"
                            )?.[1]
                          }/${sale?.collection?.id}`
                        );
                        router.push(
                          `/nft/${
                            (sale as any)?.profile?.username?.value?.split(
                              "lens/"
                            )?.[1]
                          }/${sale?.collection?.id}`
                        );
                      }}
                    >
                      <Image
                        objectFit="cover"
                        layout="fill"
                        draggable={false}
                        alt={sale?.collection?.title}
                        src={`${INFURA_GATEWAY}/ipfs/${
                          sale?.collection?.image?.split("ipfs://")?.[1]
                        }`}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3 pt-4">
                      <div className="relative w-fit h-fit flex text-xs">
                        {sale?.collection?.title}
                      </div>
                      <div
                        className="relative w-full h-fit flex cursor-canP justify-between items-center flex-row gap-2 text-sm"
                        onClick={() =>
                          window.open(
                            `https://explorer.lens.xyz/tx/${sale?.transactionHash}`
                          )
                        }
                      >
                        <div className="relative w-fit h-fit flex items-center justify-center text-white">
                          X {sale?.amount}
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-center text-white">
                          {moment.unix(Number(sale?.blockTimestamp)).fromNow()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
