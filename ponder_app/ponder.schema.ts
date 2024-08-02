import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
	RootKind: p.createEnum(["Insert", "Remove"]),

	Root: p.createTable({
		id: p.string(),
		kind: p.enum("RootKind").optional(),
		parent: p.string().references("Root.id"),
		child: p.string().references("Root.id").optional(),
		createdTx: p.hex(),
		proof: p.bigint().list(),
		batchSize: p.bigint(),
		commitments: p.bigint().list(),
		timestamp: p.int(),
		blockNumber: p.bigint(),
    contractName: p.string().optional(),
    contractAddress: p.hex(),
	}),

	TotalStats: p.createTable({
		id: p.string(),
		totalIdentities: p.bigint(),
		totalInsertions: p.bigint(),
		totalDeletions: p.bigint(),
		totalRoots: p.bigint(),
		avgIdentitiesPerRoot: p.float(),
    gasSpent: p.bigint(),
    churnRate: p.float(),
    gasSpentPerIdentityInsertion: p.float(),
    gasSpentPerIdentityDeletion: p.float(),
	}),

	DailyStats: p.createTable(
		{
			id: p.string(),
			date: p.int(),
			totalIdentities: p.bigint(),
			totalInsertions: p.bigint(),
			totalDeletions: p.bigint(),
			totalRoots: p.bigint(),
			avgIdentitiesPerRoot: p.float(),
      gasSpent: p.bigint(),
      churnRate: p.float(),
      gasSpentPerIdentityInsertion: p.float(),
      gasSpentPerIdentityDeletion: p.float(),
		},
		{
			dateIndex: p.index("date"),
		},
	)
}));
