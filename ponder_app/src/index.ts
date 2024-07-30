import { ponder } from "@/generated";

ponder.on("WorldIDIdentityManager:TreeChanged", async ({ event, context }) => {
	const { Root } = context.db;
	await Root.create({
		id: String(event.args.postRoot),
		data: {
			kind: event.args.kind === 0 ? "Insert" : "Remove",
			preRoot: String(event.args.preRoot),
            createdTx: event.transaction.hash,
			timestamp: Number(event.block.timestamp),
			blockNumber: event.block.number
		},
	});
	try {
		await Root.update({
			id: String(event.args.preRoot),
			data: {
				postRoot: String(event.args.postRoot),
			},
		});
	} catch (error) {
		console.log("Root not found");
	}
});

ponder.on("WLD:Transfer", async ({ event, context }) => {
	const { Account, TransferEvent } = context.db;
  
	// Create an Account for the sender, or update the balance if it already exists.
	await Account.upsert({
	  id: event.args.from,
	  create: {
		balance: BigInt(0),
		isOwner: false,
	  },
	  update: ({ current }) => ({
		balance: current.balance - event.args.value,
	  }),
	});

// Create an Account for the recipient, or update the balance if it already exists.
	await Account.upsert({
	  id: event.args.to,
	  create: {
		balance: event.args.value,
		isOwner: false,
	  },
	  update: ({ current }) => ({
		balance: current.balance + event.args.value,
	  }),
	});
  
// Create a TransferEvent.
	await TransferEvent.create({
	  id: event.log.id,
	  data: {
		fromId: event.args.from,
		toId: event.args.to,
		amount: event.args.value,
		timestamp: Number(event.block.timestamp),
	  },
	});
  });
  
  ponder.on("WLD:Approval", async ({ event, context }) => {
	const { Allowance, ApprovalEvent } = context.db;
  
	const allowanceId = `${event.args.owner}-${event.args.spender}`;
  
// Create or update the Allowance.
	await Allowance.upsert({
	  id: allowanceId,
	  create: {
		ownerId: event.args.owner,
		spenderId: event.args.spender,
		amount: event.args.value,
	  },
	  update: {
		amount: event.args.value,
	  },
	});
  
// Create an ApprovalEvent.
	await ApprovalEvent.create({
	  id: event.log.id,
	  data: {
		ownerId: event.args.owner,
		spenderId: event.args.spender,
		amount: event.args.value,
		timestamp: Number(event.block.timestamp),
	  },
	});
  });