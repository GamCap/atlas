import { createConfig, loadBalance, mergeAbis } from "@ponder/core";
import { http, webSocket } from "viem";
import { WorldIDIdentityManager1 } from "./abis/WorldIDIdentityManager1";
import { WorldIDIdentityManager2 } from "./abis/WorldIDIdentityManager2";

export default createConfig({
	database: {
		kind: "postgres",
		poolConfig: {
			max: 200,
		},
		schema: "ponder_data",
		publishSchema: "atlas",
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
				"0x3310846ee4250603e6aC6e4904E7E1667A1B248A",
				"0xf7134CE138832c1456F2a91D64621eE90c2bddEa",
			],
			startBlock: 17634324,
			filter: {
				event: "TreeChanged",
			},
		},
	},
});
