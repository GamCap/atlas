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
    blockNumber: p.bigint(),
  }),
  
  // Account: p.createTable({
  //   id: p.hex(),
  //   balance: p.bigint(),
  //   isOwner: p.boolean(),
  //   allowances: p.many("Allowance.ownerId"),
  //   approvalOwnerEvents: p.many("ApprovalEvent.ownerId"),
  //   approvalSpenderEvents: p.many("ApprovalEvent.spenderId"),
  //   transferFromEvents: p.many("TransferEvent.fromId"),
  //   transferToEvents: p.many("TransferEvent.toId"),
  // }),
  // Allowance: p.createTable({
  //   id: p.string(),
  //   amount: p.bigint(),
  //   ownerId: p.hex().references("Account.id"),
  //   spenderId: p.hex().references("Account.id"),
  //   owner: p.one("ownerId"),
  //   spender: p.one("spenderId"),
  // }),
  // TransferEvent: p.createTable(
  //   {
  //     id: p.string(),
  //     amount: p.bigint(),
  //     timestamp: p.int(),
  //     fromId: p.hex().references("Account.id"),
  //     toId: p.hex().references("Account.id"),
  //     from: p.one("fromId"),
  //     to: p.one("toId"),
  //   },
  //   { fromIdIndex: p.index("fromId") },
  // ),
  // ApprovalEvent: p.createTable({
  //   id: p.string(),
  //   amount: p.bigint(),
  //   timestamp: p.int(),
  //   ownerId: p.hex().references("Account.id"),
  //   spenderId: p.hex().references("Account.id"),
  //   owner: p.one("ownerId"),
  //   spender: p.one("spenderId"),
  // }),
}));
