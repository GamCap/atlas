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
