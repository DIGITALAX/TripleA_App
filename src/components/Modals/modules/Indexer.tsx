"use client";
import { ModalContext } from "@/app/providers";
import { FunctionComponent, useContext, useEffect } from "react";

const Indexer: FunctionComponent = () => {
  const context = useContext(ModalContext);
  useEffect(() => {
    if (context?.indexer) {
      setTimeout(() => {
        context?.setIndexer(undefined);
      }, 5000);
    }
  }, [context?.indexer]);

  return (
    <div className="fixed bottom-5 right-5 w-fit h-fit z-200">
      <div className="w-fit h-10 sm:h-16 flex items-center justify-center pixel-border-4 rounded-xl bg-morado text-black rounded-md">
        <div className="relative w-fit h-fit flex items-center justify-center px-4 py-2 text-xs font-jack">
          {context?.indexer}
        </div>
      </div>
    </div>
  );
};

export default Indexer;
