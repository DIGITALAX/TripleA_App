"use client";
import { ModalContext } from "@/providers";
import { FunctionComponent, JSX, useContext } from "react";
import ImageViewer from "./ImageViewer";
import { useAccount } from "wagmi";
import CreateAccount from "./CreateAccount";
import Indexer from "./Indexer";
import Notification from "./Notification";
import Signless from "./Signless";
import Fulfillment from "./Fulfillment";
import Tooltip from "./Tooltip";

const Modals: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  const { address } = useAccount();
  return (
    <>
      {context?.toolTip && <Tooltip />}
      {context?.indexer && <Indexer />}
      {context?.imageView && <ImageViewer />}
      {context?.createAccount && <CreateAccount address={address} />}
      {context?.fulfillmentOpen && <Fulfillment address={address} />}
      {context?.signless && <Signless />}
      {context?.notification && <Notification />}
    </>
  );
};

export default Modals;
