import { ModalContext } from "@/providers";
import Image from "next/legacy/image";
import { FunctionComponent, JSX, useContext } from "react";

const ImageViewer: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  return (
    <div className="inset-0 justify-center fixed z-200 bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto">
      <div
        className="relative w-screen h-full col-start-1 justify-self-center grid grid-flow-col auto-cols-auto self-start cursor-canP"
        onClick={() => context?.setImageView(undefined)}
      >
        <div className="relative w-full h-full flex py-8 flex items-center justify-center">
          <div className="relative w-5/6 sm:w-4/5 h-4/5 justify-center flex items-center">
            <div className="relative w-full h-full row-start-1 grid grid-flow-col auto-cols-auto px-4">
              <Image
                src={context?.imageView!}
                layout="fill"
                objectFit="contain"
                draggable={false}
                alt={context?.imageView}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
