import { ponder } from "@/generated";

const CONTRACT_MAP = new Map([
	[
		"0x3310846ee4250603e6aC6e4904E7E1667A1B248A".toLowerCase(),
		"Worldcoin: World ID Identity Manager 1",
	],
	[
		"0xf7134CE138832c1456F2a91D64621eE90c2bddEa".toLowerCase(),
		"Worldcoin: World ID Identity Manager 2",
	],
]);

ponder.on("WorldIDIdentityManager:TreeChanged", async ({ event, context }) => {
	const { Root, TotalStats, DailyStats } = context.db;

	const contractName = CONTRACT_MAP.get(event.log.address.toLowerCase());
	const date = Number(event.block.timestamp) - (Number(event.block.timestamp) % 86400);

	if (event.args.kind === 0) {
		// Function: registerIdentities(uint256[8] insertionProof,uint256 preRoot,uint32 startIndex,uint256[] identityCommitments,uint256 postRoot)
		// MethodID: 0x2217b211
		const methodID = "0x2217b211";

		if (event.transaction.input.startsWith(methodID)) {
			const calldata = event.transaction.input.slice(10); // Remove method ID (4 bytes) and '0x' prefix

			// Extract insertionProof (first 8 * 32 bytes)
			const insertionProof = [];
			for (let i = 0; i < 8; i++) {
				insertionProof.push(
					BigInt(`0x${calldata.slice(i * 64, (i + 1) * 64)}`),
				);
			}

			const identityCommitmentsOffsetHex = calldata.slice(
				8 * 64 + 128,
				8 * 64 + 192,
			); // Offset for identityCommitments
			const identityCommitmentsOffset =
				Number.parseInt(identityCommitmentsOffsetHex, 16) * 2; // Convert offset to integer

			const identityCommitmentsLengthHex = calldata.slice(
				identityCommitmentsOffset,
				identityCommitmentsOffset + 64,
			);
			const identityCommitmentsLength = Number.parseInt(
				identityCommitmentsLengthHex,
				16,
			);

			const identityCommitments = [];
			for (let i = 0; i < identityCommitmentsLength; i++) {
				const start = identityCommitmentsOffset + 64 + i * 64;
				const end = start + 64;
				const identityCommitment = BigInt(`0x${calldata.slice(start, end)}`);
				if (identityCommitment !== 0n) {
					identityCommitments.push(identityCommitment);
				}
			}

			const numIdentities = identityCommitments.length;

			await TotalStats.upsert({
				id: "total",
				create: {
					totalIdentities: BigInt(numIdentities),
					totalInsertions: BigInt(numIdentities),
					totalDeletions: BigInt(0),
					totalRoots: BigInt(1),
					avgIdentitiesPerRoot: numIdentities,
					gasSpent: event.transaction.gas,
					churnRate: 0.0,
					gasSpentPerIdentityInsertion:
						numIdentities > 0
							? Number((event.transaction.gas * 100n) / BigInt(numIdentities)) /
								100
							: 0.0,
					gasSpentPerIdentityDeletion: 0.0,
				},
				update: ({ current }) => ({
					totalIdentities: current.totalIdentities + BigInt(numIdentities),
					totalInsertions: current.totalInsertions + BigInt(numIdentities),
					totalRoots: current.totalRoots + BigInt(1),
					avgIdentitiesPerRoot:
						Number(
							((current.totalIdentities + BigInt(numIdentities)) * 100n) /
								(current.totalRoots + BigInt(1)),
						) / 100,
					gasSpent: current.gasSpent + event.transaction.gas,
					churnRate:
						current.totalIdentities + BigInt(numIdentities) > 0n
							? Number(
									(current.totalDeletions * 100n) /
										(current.totalIdentities + BigInt(numIdentities)),
								) / 100
							: current.churnRate, // Avoid division by zero
					gasSpentPerIdentityInsertion:
						current.totalInsertions + BigInt(numIdentities) > 0n
							? Number(
									((current.gasSpent + event.transaction.gas) * 100n) /
										(current.totalInsertions + BigInt(numIdentities)),
								) / 100
							: current.gasSpentPerIdentityInsertion, // Avoid division by zero
				}),
			});
			
			await DailyStats.upsert({
				id: String(date),
				create: {
					date: date,
					totalIdentities: BigInt(numIdentities),
					totalInsertions: BigInt(numIdentities),
					totalDeletions: BigInt(0),
					totalRoots: BigInt(1),
					avgIdentitiesPerRoot: numIdentities,
					gasSpent: event.transaction.gas,
					churnRate: 0.0,
					gasSpentPerIdentityInsertion:
						numIdentities > 0
							? Number((event.transaction.gas * 100n) / BigInt(numIdentities)) /
								100
							: 0.0,
					gasSpentPerIdentityDeletion: 0.0,
				},
				update: ({ current }) => ({
					totalIdentities: current.totalIdentities + BigInt(numIdentities),
					totalInsertions: current.totalInsertions + BigInt(numIdentities),
					totalRoots: current.totalRoots + BigInt(1),
					avgIdentitiesPerRoot:
						Number(
							((current.totalIdentities + BigInt(numIdentities)) * 100n) /
								(current.totalRoots + BigInt(1)),
						) / 100,
					gasSpent: current.gasSpent + event.transaction.gas,
					churnRate:
						current.totalIdentities + BigInt(numIdentities) > 0n
							? Number(
									(current.totalDeletions * 100n) /
										(current.totalIdentities + BigInt(numIdentities)),
								) / 100
							: current.churnRate, // Avoid division by zero
					gasSpentPerIdentityInsertion:
						current.totalInsertions + BigInt(numIdentities) > 0n
							? Number(
									((current.gasSpent + event.transaction.gas) * 100n) /
										(current.totalInsertions + BigInt(numIdentities)),
								) / 100
							: current.gasSpentPerIdentityInsertion, // Avoid division by zero
				}),
			});

			await Root.create({
				id: String(event.args.postRoot),
				data: {
					kind: "Insert",
					parent: String(event.args.preRoot),
					createdTx: event.transaction.hash,
					batchSize: BigInt(numIdentities),
					proof: insertionProof,
					commitments: identityCommitments,
					timestamp: Number(event.block.timestamp),
					blockNumber: event.block.number,
					contractName: contractName,
					contractAddress: event.log.address,
				},
			});

			try {
				await Root.update({
					id: String(event.args.preRoot),
					data: {
						child: String(event.args.postRoot),
					},
				});
			} catch (error) {
				console.log("Root not found");
			}
		}
	} else if (event.args.kind === 1) {
		// Function: deleteIdentities(uint256[8] deletionProof,bytes packedDeletionIndices,uint256 preRoot,uint256 postRoot)
		// MethodID: 0xea10fbbe
		const methodID = "0xea10fbbe";

		if (event.transaction.input.startsWith(methodID)) {
			const calldata = event.transaction.input.slice(10); // Remove method ID (4 bytes) and '0x' prefix

			// Extract deletionProof (first 8 * 32 bytes)
			const deletionProof = [];
			for (let i = 0; i < 8; i++) {
				deletionProof.push(BigInt(`0x${calldata.slice(i * 64, (i + 1) * 64)}`));
			}
			const packedDeletionIndicesOffsetHex = calldata.slice(
				8 * 64,
				8 * 64 + 64,
			); // Offset for packedDeletionIndices
			const packedDeletionIndicesOffset =
				Number.parseInt(packedDeletionIndicesOffsetHex, 16) * 2; // Convert offset to integer

			const packedDeletionIndicesLengthHex = calldata.slice(
				packedDeletionIndicesOffset,
				packedDeletionIndicesOffset + 64,
			);
			const packedDeletionIndicesLength =
				Number.parseInt(packedDeletionIndicesLengthHex, 16) * 2; // Adjust the length correctly for hex

			const packedDeletionIndices = calldata.slice(
				packedDeletionIndicesOffset + 64,
				packedDeletionIndicesOffset + 64 + packedDeletionIndicesLength,
			); // Extract packedDeletionIndices

			// Calculate batch size
			const batchSize = packedDeletionIndicesLength / 8; // 4 bytes per index = 8 hex chars per index

			// Convert packedDeletionIndices into an array of BigInts
			const deletionIndices = [];
			for (let i = 0; i < packedDeletionIndices.length; i += 8) {
				// 8 hex chars = 32 bits (4 bytes)
				const indexHex = packedDeletionIndices.slice(i, i + 8);
				deletionIndices.push(BigInt(`0x${indexHex}`));
			}

			await TotalStats.upsert({
				id: "total",
				create: {
					totalIdentities: BigInt(-1) * BigInt(batchSize),
					totalInsertions: BigInt(0),
					totalDeletions: BigInt(batchSize),
					totalRoots: BigInt(1),
					avgIdentitiesPerRoot: -1.0 * Number(BigInt(batchSize)),
					gasSpent: event.transaction.gas,
					churnRate: 0.0,
					gasSpentPerIdentityInsertion: 0.0,
					gasSpentPerIdentityDeletion:
						batchSize > 0
							? Number((event.transaction.gas * 100n) / BigInt(batchSize)) / 100
							: 0.0,
				},
				update: ({ current }) => ({
					totalIdentities: current.totalIdentities - BigInt(batchSize),
					totalDeletions: current.totalDeletions + BigInt(batchSize),
					totalRoots: current.totalRoots + BigInt(1),
					avgIdentitiesPerRoot:
						Number(
							((current.totalIdentities - BigInt(batchSize)) * 100n) /
								(current.totalRoots + BigInt(1)),
						) / 100,
					gasSpent: current.gasSpent + event.transaction.gas,
					churnRate:
						current.totalIdentities - BigInt(batchSize) > 0n
							? Number(
									((current.totalDeletions + BigInt(batchSize)) * 100n) /
										(current.totalIdentities - BigInt(batchSize)),
								) / 100
							: current.churnRate, // Avoid division by zero
					gasSpentPerIdentityDeletion:
						current.totalDeletions + BigInt(batchSize) > 0n
							? Number(
									((current.gasSpent + event.transaction.gas) * 100n) /
										(current.totalDeletions + BigInt(batchSize)),
								) / 100
							: current.gasSpentPerIdentityDeletion, // Avoid division by zero
				}),
			});

			await DailyStats.upsert({
				id: String(date),
				create: {
					date: date,
					totalIdentities: BigInt(-1) * BigInt(batchSize),
					totalInsertions: BigInt(0),
					totalDeletions: BigInt(batchSize),
					totalRoots: BigInt(1),
					avgIdentitiesPerRoot: -1.0 * Number(BigInt(batchSize)),
					gasSpent: event.transaction.gas,
					churnRate: 0.0,
					gasSpentPerIdentityInsertion: 0.0,
					gasSpentPerIdentityDeletion:
						batchSize > 0
							? Number((event.transaction.gas * 100n) / BigInt(batchSize)) / 100
							: 0.0,
				},
				update: ({ current }) => ({
					totalIdentities: current.totalIdentities - BigInt(batchSize),
					totalDeletions: current.totalDeletions + BigInt(batchSize),
					totalRoots: current.totalRoots + BigInt(1),
					avgIdentitiesPerRoot:
						Number(
							((current.totalIdentities - BigInt(batchSize)) * 100n) /
								(current.totalRoots + BigInt(1)),
						) / 100,
					gasSpent: current.gasSpent + event.transaction.gas,
					churnRate:
						current.totalIdentities - BigInt(batchSize) > 0n
							? Number(
									((current.totalDeletions + BigInt(batchSize)) * 100n) /
										(current.totalIdentities - BigInt(batchSize)),
								) / 100
							: current.churnRate, // Avoid division by zero
					gasSpentPerIdentityDeletion:
						current.totalDeletions + BigInt(batchSize) > 0n
							? Number(
									((current.gasSpent + event.transaction.gas) * 100n) /
										(current.totalDeletions + BigInt(batchSize)),
								) / 100
							: current.gasSpentPerIdentityDeletion, // Avoid division by zero
				}),
			});

			await Root.create({
				id: String(event.args.postRoot),
				data: {
					kind: "Remove",
					parent: String(event.args.preRoot),
					createdTx: event.transaction.hash,
					batchSize: BigInt(batchSize),
					proof: deletionProof,
					commitments: deletionIndices,
					timestamp: Number(event.block.timestamp),
					blockNumber: event.block.number,
					contractName: contractName,
					contractAddress: event.log.address,
				},
			});

			try {
				await Root.update({
					id: String(event.args.preRoot),
					data: {
						child: String(event.args.postRoot),
					},
				});
			} catch (error) {
				console.log("Root not found");
			}
		}
	}
});
