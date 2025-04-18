import { NextResponse } from "next/server";
import { Contract, Wallet, JsonRpcProvider } from "ethers";
import { ACCESS_CONTROLS_CONTRACT } from "@/lib/constants";
import AccessControlsAbi from "@abis/AccessControlsAbi.json";
import { chains } from "@lens-chain/sdk/viem";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    const provider = new JsonRpcProvider("https://rpc.lens.xyz", Number(chains.mainnet));
    const feeData = await provider.getFeeData();

    const accessControls = new Contract(
      ACCESS_CONTROLS_CONTRACT,
      AccessControlsAbi,
      new Wallet(process.env.FAUCET_KEY!, provider)
    );

    const tx = await accessControls.faucet(
      address,
      BigInt("200000000000000000"),
      22000,
      {
        gasLimit: 1000000,
        maxFeePerGas: feeData?.gasPrice,
        maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
      }
    );
    await tx.wait();

    return NextResponse.json({
      tx,
    });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
