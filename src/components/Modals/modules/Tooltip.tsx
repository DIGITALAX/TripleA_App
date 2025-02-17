import { FunctionComponent, JSX } from "react";
import { ToolTipProps } from "../types/modals.types";

const Tooltip: FunctionComponent<ToolTipProps> = ({
  setTooltip,
}): JSX.Element => {
  return (
    <div
      className="inset-0 justify-center fixed z-50 bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto cursor-canP items-center justify-center"
      onClick={() => setTooltip(false)}
    >
      <div
        className="pixel-border-5 rounded-md bg-viol text-windows font-nerd w-96 h-fit text-sm flex items-center justify-start p-3 cursor-default flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-1/2 py-3 h-fit flex items-center justify-center text-center">
          
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
