import { FunctionComponent, JSX } from "react";
import { MetadataProps } from "../types/nft.types";
import { ImageMetadata } from "@lens-protocol/client";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import descriptionRegex from "@/lib/helpers/descriptionRegex";

const Metadata: FunctionComponent<MetadataProps> = ({
  metadata,
  data,
  setImageView,
  post,
}): JSX.Element => {
  switch (metadata) {
    case "ImageMetadata":
      return (
        <div
          className={`relative w-full flex flex-col gap-2 items-start justify-start h-full`}
        >
          <div
            className={`relative w-full flex items-center justify-center h-full`}
          >
            <div
              className={`"relative flex items-start justify-start cursor-canP ${
                post ? " w-full sm:w-1/2 h-full" : "w-full h-60"
              }`}
              onClick={() =>
                setImageView(
                  `${INFURA_GATEWAY}/ipfs/${
                    ((data as ImageMetadata)?.image?.item as string)?.split(
                      "ipfs://"
                    )?.[1]
                  }`
                )
              }
            >
              <Image
                layout="fill"
                className="rounded-sm"
                src={`${INFURA_GATEWAY}/ipfs/${
                  ((data as ImageMetadata)?.image?.item as string)?.split(
                    "ipfs://"
                  )?.[1]
                }`}
                objectFit="cover"
                draggable={false}
              />
            </div>
          </div>
          <div
            className={`relative w-full p-1.5 items-start justify-start text-xs pixel-border-7 bg-pink rounded-lg break-all h-full`}
          >
            <div
              className="relative overflow-y-scroll w-full h-full flex p-1.5 items-start justify-start break-all rounded-md bg-white font-nerd text-black" 
              dangerouslySetInnerHTML={{
                __html: descriptionRegex(
                  (data as ImageMetadata)?.content as string,
                  false
                ),
              }}
            ></div>
          </div>
        </div>
      );

    case "TextOnlyMetadata":
      return (
        <div
          className={`relative w-full overflow-y-scroll p-1.5 items-start justify-start text-xs pixel-border-7 bg-pink rounded-lg break-all ${
            post ? "h-full" : "h-full max-h-32"
          }`}
        >
          <div
            className="relative w-full h-full flex p-1.5 items-start justify-start break-all rounded-md bg-white font-nerd text-black"
            dangerouslySetInnerHTML={{
              __html: descriptionRegex(
                (data as ImageMetadata)?.content as string,
                false
              ),
            }}
          ></div>
        </div>
      );

    default:
      return <div></div>;
  }
};

export default Metadata;
