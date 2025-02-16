import { FunctionComponent, JSX, useContext } from "react";
import AgentGallery from "./AgentGallery";
import {
  AgentSwitcher,
  AgentSwitchProps,
  CreateSwitcher,
} from "../types/agents.types";
import CreateSwitch from "./CreateSwitch";
import { ModalContext } from "@/app/providers";

const AgentSwitch: FunctionComponent<AgentSwitchProps> = ({
  agentSwitcher,
  createSwitcher,
  setCreateSwitcher,
}): JSX.Element => {
  const context = useContext(ModalContext);
  switch (agentSwitcher) {
    case AgentSwitcher.Create:
      return (
        <div className="relative w-full h-fit flex items-start justify-end">
          <div className="relative xl:w-3/4 w-full h-[40rem] flex flex-col gap-6 bg-viol rounded-md p-2">
            <CreateSwitch
              createSwitcher={createSwitcher}
              setCreateSwitcher={setCreateSwitcher}
              setIndexer={context?.setIndexer!}
              storageClient={context?.storageClient!}
              lensConnected={context?.lensConnected}
              setNotifcation={context?.setNotification!}
              lensClient={context?.lensClient!}
            />
            <div className="relative w-full h-fit flex items-end justify-between flex-row gap-4">
              <div
                className={`relative flex w-fit h-fit  ${
                  createSwitcher > 0
                    ? "cursor-canP hover:opacity-70"
                    : "opacity-70"
                }`}
                onClick={() =>
                  setCreateSwitcher(
                    createSwitcher !== CreateSwitcher.Success
                      ? createSwitcher > 0
                        ? createSwitcher - 1
                        : createSwitcher
                      : 0
                  )
                }
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
                    fill="#0000f5"
                  />{" "}
                </svg>
              </div>
              <div
                className={`relative flex w-fit h-fit  ${
                  createSwitcher < 5
                    ? "cursor-canP hover:opacity-70"
                    : "opacity-70"
                }`}
                onClick={() =>
                  setCreateSwitcher(
                    createSwitcher < 5 ? createSwitcher + 1 : createSwitcher
                  )
                }
              >
                <svg
                  className="size-6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z"
                    fill="#0000f5"
                  />{" "}
                </svg>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return <AgentGallery />;
  }
};

export default AgentSwitch;
