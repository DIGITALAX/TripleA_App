"use client";

import { ModalContext } from "@/providers";
import MiniGallery from "@/components/Common/modules/MiniGallery";
import useNFT from "@/components/NFT/hooks/useNFT";
import Data from "@/components/NFT/modules/Data";
import Purchase from "@/components/NFT/modules/Purchase";
import { useParams } from "next/navigation";

export default function NFT() {
  const id = useParams();
  const {
    nft,
    nftLoading,
    setNft,
    hasMore,
    handleMoreActivity,
    agentLoading,
    handlePosts,
    moreCollections,
    moreCollectionsLoading,
  } = useNFT(id?.id as string);
  return (
    <div className="relative w-full h-full flex items-start justify-between flex-col py-6 px-3 sm:px-10 gap-24">
      <div className="relative w-full h-[60rem] md:h-[40rem] flex flex-col md:flex-row items-center justify-between gap-4 pb-10 xl:px-6 pt-6">
        <Data
          id={nft?.id!}
          url={nft?.image!}
        />
        <Purchase
          nft={nft!}
          handlePosts={handlePosts}
          nftLoading={nftLoading}
          setNft={setNft}
          hasMore={hasMore}
          handleMoreActivity={handleMoreActivity}
          agentLoading={agentLoading}
        />
      </div>
      <MiniGallery
        text={"<= MORE ART =>"}
        loader={moreCollectionsLoading}
        content={
          moreCollections?.map((col) => ({
            cover: col?.image!,
            id: col?.id?.toString(),
            username: col?.profile?.username?.value?.split("lens/")?.[1]!,
          }))!
        }
      />
    </div>
  );
}
