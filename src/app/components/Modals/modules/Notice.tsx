import { ModalContext } from "@/providers";
import { NOTICE_TEXT, NOTICE_URL, NOTICE_URL_LABEL } from "@/lib/constants";
import { FunctionComponent, JSX, useContext } from "react";

const Notice: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  return (
    <div
      className="inset-0 justify-center fixed z-[60] bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto cursor-canP items-center justify-center"
      onClick={() => context?.hideNotice()}
    >
      <div
        className="pixel-border-5 rounded-md bg-viol text-windows font-nerd w-96 max-w-[90vw] h-fit text-sm flex items-center justify-start p-3 cursor-default flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full px-3 py-3 h-fit flex items-center justify-center text-center">
          <p className="relative w-full break-words">
            {NOTICE_TEXT}{" "}
            <a
              href={NOTICE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline cursor-canP"
            >
              {NOTICE_URL_LABEL}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notice;
