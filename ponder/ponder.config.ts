import { createConfig, loadBalance } from "@ponder/core";
import { http, webSocket } from "viem";
import { OptimismMintableERC20 } from "./abis/OptimismMintableERC20";
import { WLDERC20 } from "./abis/WLDERC20";
import { WorldIDIdentityManager2 } from "./abis/WorldIDIdentityManager2";

export default createConfig({
  //database: {
  //  kind: "postgres",
  //  poolConfig: {
  //    max: 300
  //  },
  //  schema: "ponder_data",
  //},
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
    //WLD_Optimism: {
    //  network: "optimism",
    //  abi: OptimismMintableERC20,
    //  address: "0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1",
    //  startBlock: 107087966,
    //  endBlock: 107088066,
    //  filter: {
    //    event: "Transfer"
    //  }
    //},
    //WLD_Ethereum: {
    //  network: "mainnet",
    //  abi: WLDERC20,
    //  address: "0x163f8C2467924be0ae7B5347228CABF260318753",
    //  startBlock: 17714705,
    //  endBlock: 17784805,
    //  filter: {
    //    event: "Transfer"
    //  }
    //},
    WorldIDIdentityManager2: {
      network: "mainnet",
      abi: WorldIDIdentityManager2,
      address: "0xf7134CE138832c1456F2a91D64621eE90c2bddEa",
      startBlock: 17634324,
      endBlock: 17646832,
      filter: {
        event: "TreeChanged",
        args: {
          from: "0x9ad4EFAF9E326c17c3A7be6F5D167843Af0eb30A",
          to: ["0xf7134CE138832c1456F2a91D64621eE90c2bddEa", "0x316350D3EC608fFc30b01DcB7475De1C676cE910"]
        },
      }
    },
  },
});
