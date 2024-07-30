import { createConfig, loadBalance, mergeAbis } from "@ponder/core";
import { http, webSocket } from "viem";
import { OptimismMintableERC20 } from "./abis/OptimismMintableERC20";
import { WLDERC20 } from "./abis/WLDERC20";
import { WorldIDIdentityManager1 } from "./abis/WorldIDIdentityManager1";
import { WorldIDIdentityManager2 } from "./abis/WorldIDIdentityManager2";

export default createConfig({
	database: {
		kind: "postgres",
		poolConfig: {
			max: 300,
		},
		schema: "ponder_data",
		publishSchema: "atlas",
	},
	options: {
		enableBigQueryAccelerator: false,
	},
	networks: {
		mainnet: {
			chainId: 1,
			transport: loadBalance(
				// biome-ignore lint/style/noNonNullAssertion: No need to check for null here
				process.env
					.PONDER_RPC_URLS_1!.split(",")
					.map((url) => http(url)),
			),
		},
		optimism: {
			chainId: 10,
			transport: loadBalance(
				// biome-ignore lint/style/noNonNullAssertion: No need to check for null here
				process.env
					.PONDER_RPC_URLS_10!.split(",")
					.map((url) => http(url)),
			),
		},
	},
	contracts: {
		WorldIDIdentityManager: {
			network: "mainnet",
			abi: mergeAbis([WorldIDIdentityManager1, WorldIDIdentityManager2]),
			address: [
				"0x316350D3EC608fFc30b01DcB7475De1C676cE910",
				"0xf7134CE138832c1456F2a91D64621eE90c2bddEa",
			],
			startBlock: 17634324,
			filter: {
				event: "TreeChanged",
			},
		},
		WLD: {
			network: {
				mainnet: {
				  address: "0x163f8C2467924be0ae7B5347228CABF260318753",
				  startBlock: 17714705,
				},
				optimism: {
				  address: "0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1",
				  startBlock: 107087966,
				  endBlock: 110000000,
				},
			},
			abi: mergeAbis([WLDERC20, OptimismMintableERC20]),
			filter: {
				event: ["Transfer", "Approval"],
			},
		},
	},
});
