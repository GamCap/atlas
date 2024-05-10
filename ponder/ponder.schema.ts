import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  TransferEventOptimism: p.createTable({
    id: p.string(),
    fromId: p.hex(),
    toId: p.hex(),
    amount: p.bigint(),
    timestamp: p.int()
  }),
  AccountOptimism: p.createTable({
    id: p.hex(),
    balance: p.bigint(),
    isOwner: p.boolean()
  }),
  TransferEventEthereum: p.createTable({
    id: p.string(),
    fromId: p.hex(),
    toId: p.hex(),
    amount: p.bigint(),
    timestamp: p.int()
  }),
  AccountEthereum: p.createTable({
    id: p.hex(),
    balance: p.bigint(),
    isOwner: p.boolean()
  })
}));
