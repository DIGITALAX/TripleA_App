import { INFURA_GATEWAY, GROVE_GATEWAY } from "../constants";

export const handleImage = (pic: string): string => {
  if (pic?.includes("https://")) {
    return pic;
  } else if (pic?.includes("ipfs://")) {
    return `${INFURA_GATEWAY}/ipfs/${pic?.split("ipfs://")?.[1]}`;
  } else if (pic?.includes("lens://")) {
    return `${GROVE_GATEWAY}${pic?.split("lens://")?.[1]}`;
  }

  return `${INFURA_GATEWAY}/ipfs/QmeupDitCvCXPsq5KSDSdhLrRjcXvNhaqpyuUcGyeW918W`;
};
