import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  RootKind: p.createEnum(["Insert", "Remove"]),

  Root: p.createTable({
    id: p.string(),
    kind: p.enum("RootKind").optional(),
    preRoot: p.string().references("Root.id"),
    postRoot: p.string().references("Root.id").optional(),
    createdTx: p.hex(),
    timestamp: p.int(),
  }),
  //TransferEventOptimism: p.createTable({
  //  id: p.string(),
  //  amount: p.bigint(),
  //  fromId: p.string().references("AccountOptimism.id"),
  //  toId: p.string().references("AccountOptimism.id"),
  //  timestamp: p.int(),
  //  from: p.one("fromId"),
  //  to: p.one("toId"),
  //}),
  //AccountOptimism: p.createTable({
  //  id: p.string(),
  //  balance: p.bigint(),
  //  isOwner: p.boolean(),
  //  transferFromEvents: p.many("TransferEventOptimism.fromId"),
  //  transferToEvents: p.many("TransferEventOptimism.toId"),
  //}),
  //TransferEventEthereum: p.createTable({
  //  id: p.string(),
  //  amount: p.bigint(),
  //  fromId: p.string().references("AccountEthereum.id"),
  //  toId: p.string().references("AccountEthereum.id"),
  //  timestamp: p.int(),
  //  from: p.one("fromId"),
  //  to: p.one("toId"),
  //}),
  //AccountEthereum: p.createTable({
  //  id: p.string(),
  //  balance: p.bigint(),
  //  isOwner: p.boolean(),
  //  transferFromEvents: p.many("TransferEventEthereum.fromId"),
  //  transferToEvents: p.many("TransferEventEthereum.toId"),
  //})
}));
