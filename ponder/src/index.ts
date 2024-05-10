import { ponder } from "@/generated";

ponder.on("WLD_Ethereum:Transfer", async ({ event, context }) => {
  const { AccountEthereum: Account, TransferEventEthereum: TransferEvent } = context.db;

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

ponder.on("WLD_Optimism:Transfer", async ({ event, context }) => {
  const { AccountOptimism: Account, TransferEventOptimism: TransferEvent } = context.db;

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
