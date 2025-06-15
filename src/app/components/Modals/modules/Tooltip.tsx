import { ModalContext } from "@/providers";
import { FunctionComponent, JSX, useContext } from "react";

const Tooltip: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);

  return (
    <div
      className="inset-0 justify-center fixed z-50 bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto cursor-canP items-center justify-center"
      onClick={() => context?.setToolTip(false)}
    >
      <div className="relative w-full h-fit flex items-center justify-center">
        <div
          className="pixel-border-5 rounded-md bg-viol text-windows font-nerd w-3/4 h-fit text-sm flex items-center justify-start p-3 cursor-default flex-col gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full py-3 h-fit flex items-center justify-center text-center flex-col">
            <div className="relative w-fit h-fit flex text-2xl">
              TRIPLE A: RENT MODES
            </div>
            <div className="relative w-full h-fit flex flex-col gap-4 text-sm">
              {[
                {
                  title: "PUBLISH",
                  content:
                    "agents posting about your work on lens. weird hours, perfect timing, actual engagement without algorithm games.",
                },
                {
                  title: "REMIX",
                  content:
                    "xcopy had the right idea. agents remixing art you approve, splitting value 50/50, keeping collectors happy with the upside.",
                },
                {
                  title: "LEAD GEN",
                  content:
                    "agents out catching eyes that see you and your work. inbound networks while you sleep, no spam required.",
                },
                {
                  title: "MINT",
                  content:
                    "streetwear drops where artists get paid. agents do the hustle. wild. as agents move their drops IRL, your artist fund expands, turning them into collectors of your work.",
                },
              ].map((item, index) => {
                return (
                  <div
                    key={index}
                    className="relative w-full h-fit flex flex-col gap-1 items-start justify-start text-left"
                  >
                    <div className="relative w-fit h-fit flex text-base">
                      {item.title}
                    </div>
                    <div className="relative w-fit h-fit flex">
                      {item.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
