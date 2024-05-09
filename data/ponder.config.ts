import { createConfig, loadBalance } from "@ponder/core";
import { http, webSocket } from "viem";
import { OptimismMintableERC20 } from "./abis/OptimismMintableERC20";
import { WLDERC20 } from "./abis/WLDERC20";

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: loadBalance(
        process.env.PONDER_RPC_URLS_1!.split(",").map((url) => http(url))),
    },
    optimism: {
      chainId: 10,
      transport: loadBalance(
        process.env.PONDER_RPC_URLS_10!.split(",").map((url) => http(url))),
    },
  },
  contracts: {
    WLD_Optimism: {
      network: "optimism",
      abi: OptimismMintableERC20,
      address: "0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1",
      startBlock: 107087966,
      filter: {
        event: "Transfer"
      }
    },
    WLD_Ethereum: {
      network: "mainnet",
      abi: WLDERC20,
      address: "0x163f8C2467924be0ae7B5347228CABF260318753",
      startBlock: 17714705,
      filter: {
        event: "Transfer"
      }
    },
  },
});
