import { ponder } from "@/generated";

ponder.on("WorldIDIdentityManager:TreeChanged", async ({ event, context }) => {
	const { Root, Stats } = context.db;

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

			await Stats.upsert({
				id: "total",
				create: {
					numIdentitiesTotal: BigInt(numIdentities),
				},
				update: ({ current }) => ({
					numIdentitiesTotal:
						current.numIdentitiesTotal + BigInt(numIdentities),
				}),
			});

			await Root.create({
				id: String(event.args.postRoot),
				data: {
					kind: "Insert",
					parent: String(event.args.preRoot),
					createdTx: event.transaction.hash,
					numIdentities: BigInt(numIdentities),
					proof: insertionProof,
					commitments: identityCommitments,
					timestamp: Number(event.block.timestamp),
					blockNumber: event.block.number,
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

			await Stats.upsert({
				id: "total",
				create: {
					numIdentitiesTotal: BigInt(-1) * BigInt(batchSize),
				},
				update: ({ current }) => ({
					numIdentitiesTotal: current.numIdentitiesTotal - BigInt(batchSize),
				}),
			});

			await Root.create({
				id: String(event.args.postRoot),
				data: {
					kind: "Remove",
					parent: String(event.args.preRoot),
					createdTx: event.transaction.hash,
					numIdentities: BigInt(batchSize),
					proof: deletionProof,
					commitments: deletionIndices,
					timestamp: Number(event.block.timestamp),
					blockNumber: event.block.number,
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

// ponder.on("WLD:Transfer", async ({ event, context }) => {
// 	const { Account, TransferEvent } = context.db;
//
// 	// Create an Account for the sender, or update the balance if it already exists.
// 	await Account.upsert({
// 	  id: event.args.from,
// 	  create: {
// 		balance: BigInt(0),
// 		isOwner: false,
// 	  },
// 	  update: ({ current }) => ({
// 		balance: current.balance - event.args.value,
// 	  }),
// 	});
//
// // Create an Account for the recipient, or update the balance if it already exists.
// 	await Account.upsert({
// 	  id: event.args.to,
// 	  create: {
// 		balance: event.args.value,
// 		isOwner: false,
// 	  },
// 	  update: ({ current }) => ({
// 		balance: current.balance + event.args.value,
// 	  }),
// 	});
//
// // Create a TransferEvent.
// 	await TransferEvent.create({
// 	  id: event.log.id,
// 	  data: {
// 		fromId: event.args.from,
// 		toId: event.args.to,
// 		amount: event.args.value,
// 		timestamp: Number(event.block.timestamp),
// 	  },
// 	});
//   });
//
//   ponder.on("WLD:Approval", async ({ event, context }) => {
// 	const { Allowance, ApprovalEvent } = context.db;
//
// 	const allowanceId = `${event.args.owner}-${event.args.spender}`;
//
// // Create or update the Allowance.
// 	await Allowance.upsert({
// 	  id: allowanceId,
// 	  create: {
// 		ownerId: event.args.owner,
// 		spenderId: event.args.spender,
// 		amount: event.args.value,
// 	  },
// 	  update: {
// 		amount: event.args.value,
// 	  },
// 	});
//
// // Create an ApprovalEvent.
// 	await ApprovalEvent.create({
// 	  id: event.log.id,
// 	  data: {
// 		ownerId: event.args.owner,
// 		spenderId: event.args.spender,
// 		amount: event.args.value,
// 		timestamp: Number(event.block.timestamp),
// 	  },
// 	});
//   });
