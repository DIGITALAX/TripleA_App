import Image from "next/legacy/image";
import { FunctionComponent, JSX, useContext } from "react";
import { CreateAccountProps } from "../types/modals.types";
import useCreateAccount from "../hooks/useCreateAccount";
import { ModalContext } from "@/providers";

const CreateAccount: FunctionComponent<CreateAccountProps> = ({
  address,
}): JSX.Element => {
  const context = useContext(ModalContext);
  const { account, accountLoading, setAccount, handleCreateAccount } =
    useCreateAccount(address);
  return (
    <div
      className="inset-0 justify-center fixed z-50 bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto cursor-canP items-center justify-center"
      onClick={() => context?.setCreateAccount(false)}
    >
      <div
        className="pixel-border-5 rounded-md text-windows bg-viol w-96 h-fit text-sm flex items-center justify-start p-3 cursor-default flex-col gap-6 font-nerd"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-fit pb-3 h-fit flex items-center justify-center">
          Create Lens Account
        </div>
        <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-center">
          <div className="relative items-center justify-center flex w-fit h-fit">
            <label
              className="relative w-20 rounded-full h-20 flex items-center justify-center border border-windows cursor-canP bg-windows"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {account?.pfp && (
                <Image
                  src={URL.createObjectURL(account.pfp)}
                  objectFit="cover"
                  layout="fill"
                  draggable={false}
                  className="rounded-full"
                />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg"
                hidden
                required
                id="files"
                multiple={false}
                name="pfp"
                disabled={accountLoading}
                onChange={(e) => {
                  e.stopPropagation();
                  if (!e.target.files || e.target.files.length === 0) return;
                  setAccount({
                    ...account,
                    pfp: e?.target?.files?.[0],
                  });
                }}
              />
            </label>
          </div>
          <div className="relative w-full h-fit flex items-start justify-between flex-row gap-3">
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Username</div>
              <input
                disabled={accountLoading}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    username: e.target.value,
                  })
                }
                className="relative w-full text-viol bg-windows h-8 border border-windows focus:outline-none p-1"
                value={account?.username}
              />
            </div>
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Local Name</div>
              <input
                disabled={accountLoading}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    localname: e.target.value,
                  })
                }
                className="relative w-full text-viol bg-windows h-8 border border-windows focus:outline-none p-1"
                value={account?.localname}
              />
            </div>
          </div>
          <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
            <div className="relative w-fit h-fit flex">Bio</div>
            <textarea
              disabled={accountLoading}
              onChange={(e) =>
                setAccount({
                  ...account,
                  bio: e.target.value,
                })
              }
              className="relative w-full text-viol bg-windows h-14 overflow-y-scroll border border-windows focus:outline-none p-1"
              value={account?.bio}
              style={{
                resize: "none",
              }}
            ></textarea>
          </div>
        </div>
        <div
          className={`relative px-3 py-1 flex items-center justify-center rounded-md bg-windows text-viol w-28 h-8 ${
            !accountLoading && "cursor-canP active:scale-95 hover:opacity-70"
          }`}
          onClick={() => !accountLoading && handleCreateAccount()}
        >
          {accountLoading ? (
            <svg
              fill="none"
              className="size-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                fill="currentColor"
              />{" "}
            </svg>
          ) : (
            "Create"
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
