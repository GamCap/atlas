import { ponder } from "@/generated";

ponder.on("WorldIDIdentityManager:TreeChanged", async ({ event, context }) => {
	const { Root } = context.db;
	await Root.create({
		id: event.args.postRoot,
		data: {
			kind: event.args.kind === 0 ? "Insert" : "Remove",
			preRoot: event.args.preRoot,
			timestamp: Number(event.block.timestamp),
		},
	});
	try {
		await Root.update({
			id: event.args.preRoot,
			data: {
				postRoot: event.args.postRoot,
			},
		});
	} catch (error) {
		console.log("Root not found");
	}
});
