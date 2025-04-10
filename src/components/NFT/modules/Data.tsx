import { INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/legacy/image";
import { FunctionComponent, JSX, useContext } from "react";
import { DataProps } from "../types/nft.types";
import { ModalContext } from "@/app/providers";

const Data: FunctionComponent<DataProps> = ({ url, id }): JSX.Element => {
  const context = useContext(ModalContext);
  return (
    <div className="relative w-5/6 h-[30rem] md:h-full flex">
      {url && (
        <Image
          alt={id?.toString() || ""}
          src={`${INFURA_GATEWAY}/ipfs/${url?.split("ipfs://")?.[1]}`}
          draggable={false}
          layout="fill"
          objectFit="contain"
          className="cursor-canP"
          onClick={() =>
            context?.setImageView(
              `${INFURA_GATEWAY}/ipfs/${url?.split("ipfs://")?.[1]}`
            )
          }
        />
      )}
    </div>
  );
};

export default Data;
