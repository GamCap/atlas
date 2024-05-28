import { P as Prettify, H as HasOnlyIdProperty, a as HasRequiredPropertiesOtherThanId } from './utils-0kAkCPl6.js';
import { AbiEvent, Abi, AbiFunction, AbiParametersToPrimitiveTypes, FormatAbiItem } from 'abitype';
import { GetEventArgs, ParseAbiItem, Abi as Abi$1, Narrow, Transport, Hex, Hash, Address, AccessList, TransactionType, Chain, Client, PublicRpcSchema, GetBalanceParameters, GetBalanceReturnType, GetBytecodeParameters, GetBytecodeReturnType, GetStorageAtParameters, GetStorageAtReturnType, ContractFunctionConfig, MulticallParameters, MulticallReturnType, ReadContractParameters, ReadContractReturnType, GetEnsNameParameters, GetEnsNameReturnType } from 'viem';
export { MergeAbis, ReplaceBigInts, loadBalance, mergeAbis, rateLimit, replaceBigInts } from '@ponder/utils';

type GetAddress<contract> = contract extends {
    factory: unknown;
} ? contract extends {
    factory: {
        event: infer event extends AbiEvent;
    };
} ? {
    address?: never;
    factory?: {
        /** Address of the factory contract that creates this contract. */
        address: `0x${string}`;
        /** ABI event that announces the creation of a new instance of this contract. */
        event: AbiEvent;
        /** Name of the factory event parameter that contains the new child contract address. */
        parameter: Exclude<event["inputs"][number]["name"], undefined>;
    };
} : {
    address?: never;
    factory?: {
        /** Address of the factory contract that creates this contract. */
        address: `0x${string}`;
        /** ABI event that announces the creation of a new instance of this contract. */
        event: AbiEvent;
        /** Name of the factory event parameter that contains the new child contract address. */
        parameter: string;
    };
} : contract extends {
    address: `0x${string}` | readonly `0x${string}`[];
} ? {
    address?: `0x${string}` | readonly `0x${string}`[];
    factory?: never;
} : {
    address?: `0x${string}` | readonly `0x${string}`[];
    factory?: {
        /** Address of the factory contract that creates this contract. */
        address: `0x${string}`;
        /** ABI event that announces the creation of a new instance of this contract. */
        event: AbiEvent;
        /** Name of the factory event parameter that contains the new child contract address. */
        parameter: string;
    };
};

type NonStrictPick<T, K> = {
    [P in Extract<keyof T, K>]: T[P];
};
type ExtractAbiEvents<abi extends Abi, events = Extract<abi[number], {
    type: "event";
}>> = [events] extends [never] ? AbiEvent : events;
type ExtractAbiFunctions<abi extends Abi, functions = Extract<abi[number], {
    type: "function";
}>> = [functions] extends [never] ? AbiFunction : functions;
/** Return the abi event given the abi and compact signature. */
type ParseAbiEvent<abi extends Abi, signature extends string, abiEvents extends AbiEvent = ExtractAbiEvents<abi>, noOverloadEvent = Extract<abiEvents, {
    name: signature;
}>, overloadEvent = Extract<abiEvents, ParseAbiItem<`event ${signature}`>>> = [noOverloadEvent] extends [never] ? [overloadEvent] extends [never] ? AbiEvent : overloadEvent : noOverloadEvent;
/** Return the abi function given the abi and compact signature. */
type ParseAbiFunction<abi extends Abi, signature extends string, abiFunctions extends AbiFunction = ExtractAbiFunctions<abi>, noOverloadFunction = Extract<abiFunctions, {
    name: signature extends `${infer _signature}()` ? _signature : never;
}>, overloadFunction = Extract<abiFunctions, ParseAbiItem<`function ${signature}`>>> = [overloadFunction] extends [never] ? [noOverloadFunction] extends [never] ? AbiFunction : noOverloadFunction : overloadFunction;
/** Return the compact signature given the abi and abi event. */
type FormatAbiEvent<abi extends Abi, event extends AbiEvent, abiEvents extends AbiEvent = ExtractAbiEvents<abi>, matchingNameEvents extends AbiEvent = Extract<abiEvents, {
    name: event["name"];
}>> = [matchingNameEvents] extends [never] ? Abi extends abi ? event["name"] : never : [Exclude<matchingNameEvents, event>] extends [never] ? event["name"] : FormatAbiItem<event> extends `event ${infer signature}` ? signature : never;
/** Return the compact signature given the abi and abi function. */
type FormatAbiFunction<abi extends Abi, _function extends AbiFunction, abiFunctions extends AbiFunction = ExtractAbiFunctions<abi>, matchingNameFunctions extends AbiFunction = Extract<abiFunctions, {
    name: _function["name"];
}>> = [matchingNameFunctions] extends [never] ? Abi extends abi ? `${_function["name"]}()` : never : [Exclude<matchingNameFunctions, _function>] extends [never] ? `${_function["name"]}()` : FormatAbiItem<_function> extends `function ${infer signature}` ? signature : never;
/**
 * Return an union of safe event names that handle event overridding.
 */
type SafeEventNames<abi extends Abi, abiEvents extends AbiEvent = ExtractAbiEvents<abi>> = abiEvents extends abiEvents ? FormatAbiEvent<abi, abiEvents> : never;
/**
 * Return an union of safe function names that handle function overridding.
 */
type SafeFunctionNames<abi extends Abi, abiFunctions extends AbiFunction = ExtractAbiFunctions<abi>> = abiFunctions extends abiFunctions ? FormatAbiFunction<abi, abiFunctions> : never;
type FormatEventArgs<abi extends Abi, signature extends string> = GetEventArgs<Abi, string, {
    EnableUnion: false;
    IndexedOnly: false;
    Required: true;
}, ParseAbiEvent<abi, signature>>;
type FormatFunctionArgs<abi extends Abi, signature extends string, args = AbiParametersToPrimitiveTypes<ParseAbiFunction<abi, signature>["inputs"]>> = readonly [] extends args ? never : args;
type FormatFunctionResult<abi extends Abi, signature extends string, result = AbiParametersToPrimitiveTypes<ParseAbiFunction<abi, signature>["outputs"]>> = readonly [] extends result ? never : result extends readonly [unknown] ? result[0] : result;

type GetEventFilter<abi extends Abi$1, contract, safeEventNames extends string = SafeEventNames<abi>> = contract extends {
    filter: {
        event: infer event extends readonly string[] | string;
    };
} ? event extends readonly string[] ? {
    filter?: {
        event: readonly safeEventNames[];
    };
} : event extends safeEventNames ? {
    filter?: {
        event: safeEventNames | event;
        args?: GetEventArgs<abi, string, {
            EnableUnion: true;
            IndexedOnly: true;
            Required: false;
        }, ParseAbiEvent<abi, event>>;
    };
} : {
    filter?: {
        event: safeEventNames;
        args?: GetEventArgs<Abi$1 | readonly unknown[], string>;
    };
} : {
    filter?: {
        event: safeEventNames | readonly safeEventNames[];
        args?: GetEventArgs<Abi$1 | readonly unknown[], string>;
    };
};

type BlockConfig$1 = {
    /** Block number at which to start indexing events (inclusive). If `undefined`, events will be processed from block 0. Default: `undefined`. */
    startBlock?: number;
    /** Block number at which to stop indexing events (inclusive). If `undefined`, events will be processed in real-time. Default: `undefined`. */
    endBlock?: number;
    /** Maximum block range to use when calling `eth_getLogs`. Default: `10_000`. */
    maxBlockRange?: number;
};
type DatabaseConfig$1 = {
    kind: "sqlite";
    /** Directory path to use for SQLite database files. Default: `".ponder/sqlite"`. */
    directory?: string;
} | {
    kind: "postgres";
    /** Postgres database connection string. Default: `DATABASE_PRIVATE_URL` > `DATABASE_URL` environment variable. */
    connectionString?: string;
    /** Postgres schema to use for indexed data. Default: 'public', or `RAILWAY_SERVICE_NAME`-`RAILWAY_DEPLOYMENT_ID` environment variables if provided. */
    schema?: string;
    /** Postgres schema to use for views returning indexed data. Default: undefined, or `RAILWAY_SERVICE_NAME` environment variable if provided. */
    publishSchema?: string;
    /** Postgres pool configuration passed to `node-postgres`. */
    poolConfig?: {
        /** Maximum number of clients in the pool. Default: `30`. */
        max?: number;
    };
};
type OptionsConfig = {
    /** Maximum number of seconds to wait for historical indexing to complete before responding as healthy. If historical indexing exceeds this duration, the API may serve incomplete data. Default: `240` (4 minutes). */
    maxHealthcheckDuration?: number;
};
type NetworkConfig$1<network> = {
    /** Chain ID of the network. */
    chainId: network extends {
        chainId: infer chainId extends number;
    } ? chainId | number : number;
    /** A viem `http`, `webSocket`, or `fallback` [Transport](https://viem.sh/docs/clients/transports/http.html).
     *
     * __To avoid rate limiting, include a custom RPC URL.__ Usage:
     *
     * ```ts
     * import { http } from "viem";
     *
     * const network = {
     *    name: "mainnet",
     *    chainId: 1,
     *    transport: http("https://eth-mainnet.g.alchemy.com/v2/..."),
     * }
     * ```
     */
    transport: Transport;
    /** Polling interval (in ms). Default: `1_000`. */
    pollingInterval?: number;
    /** Maximum number of RPC requests per second. Default: `50`. */
    maxRequestsPerSecond?: number;
    /** (Deprecated) Maximum concurrency of tasks during the historical sync. Default: `20`. */
    maxHistoricalTaskConcurrency?: number;
};
type BlockFilterConfig = {
    startBlock: number;
    endBlock?: number;
    interval: number;
};
type GetBlockFilter<networks, allNetworkNames extends string = [keyof networks] extends [never] ? string : keyof networks & string> = BlockFilterConfig & {
    network: allNetworkNames | {
        [name in allNetworkNames]?: BlockFilterConfig;
    };
};
type AbiConfig<abi extends Abi | readonly unknown[]> = {
    /** Contract application byte interface. */
    abi: abi;
};
type TransactionReceiptConfig = {
    includeTransactionReceipts?: boolean;
};
type FunctionCallConfig = {
    includeCallTraces?: boolean;
};
type GetNetwork<networks, contract, abi extends Abi, allNetworkNames extends string = [keyof networks] extends [never] ? string : keyof networks & string> = contract extends {
    network: infer network;
} ? {
    /**
     * Network that this contract is deployed to. Must match a network name in `networks`.
     * Any filter information overrides the values in the higher level "contracts" property.
     * Factories cannot override an address and vice versa.
     */
    network: allNetworkNames | {
        [name in allNetworkNames]?: Prettify<GetAddress<NonStrictPick<network, "factory" | "address">> & GetEventFilter<abi, NonStrictPick<contract, "filter">> & TransactionReceiptConfig & FunctionCallConfig & BlockConfig$1>;
    };
} : {
    /**
     * Network that this contract is deployed to. Must match a network name in `networks`.
     * Any filter information overrides the values in the higher level "contracts" property.
     * Factories cannot override an address and vice versa.
     */
    network: allNetworkNames | {
        [name in allNetworkNames]?: Prettify<GetAddress<unknown> & GetEventFilter<abi, unknown> & TransactionReceiptConfig & FunctionCallConfig & BlockConfig$1>;
    };
};
type ContractConfig$1<networks, contract, abi extends Abi> = Prettify<AbiConfig<abi> & GetNetwork<networks, NonStrictPick<contract, "network">, abi> & GetAddress<NonStrictPick<contract, "factory" | "address">> & GetEventFilter<abi, NonStrictPick<contract, "filter">> & TransactionReceiptConfig & FunctionCallConfig & BlockConfig$1>;
type GetContract<networks = unknown, contract = unknown> = contract extends {
    abi: infer abi extends Abi;
} ? ContractConfig$1<networks, contract, abi> : ContractConfig$1<networks, contract, Abi>;
type ContractsConfig<networks, contracts> = {} extends contracts ? {} : {
    [name in keyof contracts]: GetContract<networks, contracts[name]>;
};
type NetworksConfig<networks> = {} extends networks ? {} : {
    [networkName in keyof networks]: NetworkConfig$1<networks[networkName]>;
};
type BlockFiltersConfig<networks = unknown, blocks = unknown> = {} extends blocks ? {} : {
    [name in keyof blocks]: GetBlockFilter<networks>;
};
declare const createConfig: <const networks, const contracts = {}, const blocks = {}>(config: {
    networks: NetworksConfig<Narrow<networks>>;
    contracts?: ContractsConfig<networks, Narrow<contracts>> | undefined;
    database?: DatabaseConfig$1 | undefined;
    options?: OptionsConfig | undefined;
    blocks?: BlockFiltersConfig<networks, blocks> | undefined;
}) => CreateConfigReturnType<networks, contracts, blocks>;
type Config = {
    networks: {
        [networkName: string]: NetworkConfig$1<unknown>;
    };
    contracts: {
        [contractName: string]: GetContract;
    };
    database?: DatabaseConfig$1;
    options?: OptionsConfig;
    blocks: {
        [sourceName: string]: GetBlockFilter<unknown>;
    };
};
type CreateConfigReturnType<networks, contracts, blocks> = {
    networks: networks;
    contracts: contracts;
    database?: DatabaseConfig$1;
    options?: OptionsConfig;
    blocks: blocks;
};

type Scalar = "string" | "int" | "float" | "boolean" | "hex" | "bigint";
type ID = "string" | "int" | "bigint" | "hex";
type ScalarColumn<scalar extends Scalar = Scalar, optional extends boolean = boolean, list extends boolean = boolean> = {
    " type": "scalar";
    " scalar": scalar;
    " optional": optional;
    " list": list;
};
type IdColumn<id extends ID = ID> = ScalarColumn<id, false, false>;
type ReferenceColumn<scalar extends Scalar = Scalar, optional extends boolean = boolean, reference extends string = string> = {
    " type": "reference";
    " scalar": scalar;
    " optional": optional;
    " reference": reference;
};
type JSONColumn<type = any, optional extends boolean = boolean> = {
    " type": "json";
    " json": type;
    " optional": optional;
};
type OneColumn<reference extends string = string> = {
    " type": "one";
    " reference": reference;
};
type ManyColumn<referenceTable extends string = string, referenceColumn extends string = string> = {
    " type": "many";
    " referenceTable": referenceTable;
    " referenceColumn": referenceColumn;
};
type EnumColumn<_enum extends string = string, optional extends boolean = boolean, list extends boolean = boolean> = {
    " type": "enum";
    " enum": _enum;
    " optional": optional;
    " list": list;
};
type Index<column extends string | readonly string[] = string | readonly string[], order extends "asc" | "desc" | undefined = "asc" | "desc" | undefined, nulls extends "first" | "last" | undefined = "first" | "last" | undefined> = {
    " type": "index";
    " column": column;
    " order": order;
    " nulls": nulls;
};
type Column = ScalarColumn | ReferenceColumn | JSONColumn | OneColumn | ManyColumn | EnumColumn;
type Table = {
    id: IdColumn;
} & {
    [columnName: string]: Column;
};
type Enum = readonly string[];
type Constraints = {
    [name: string]: Index;
};
type Schema = {
    [name: string]: {
        table: Table;
        constraints: Constraints;
    } | Enum;
};
type ExtractTableNames<schema extends Schema | unknown, names = keyof schema & string> = names extends names ? schema[names & keyof schema] extends {
    table: Table;
    constraints: Constraints;
} ? names : never : never;
type ExtractEnumNames<schema extends Schema | unknown, names = keyof schema & string> = names extends names ? schema[names & keyof schema] extends Enum ? names : never : never;
type ExtractOptionalColumnNames<tableAndConstraints extends {
    table: Table;
    constraints: Constraints;
} | unknown, table = tableAndConstraints extends {
    table: Table;
    constraints: Constraints;
} ? tableAndConstraints["table"] : Table, columnNames = keyof table & string> = columnNames extends columnNames ? table[columnNames & keyof table] extends ScalarColumn | ReferenceColumn | JSONColumn | EnumColumn ? table[columnNames & keyof table][" optional"] extends true ? columnNames : never : never : never;
type ExtractRequiredColumnNames<tableAndConstraints extends {
    table: Table;
    constraints: Constraints;
} | unknown, table = tableAndConstraints extends {
    table: Table;
    constraints: Constraints;
} ? tableAndConstraints["table"] : Table, columnNames = keyof table & string> = columnNames extends columnNames ? table[columnNames & keyof table] extends ScalarColumn | ReferenceColumn | JSONColumn | EnumColumn ? table[columnNames & keyof table][" optional"] extends false ? columnNames : never : never : never;
type ExtractReferenceColumnNames<tableAndConstraints extends {
    table: Table;
    constraints: Constraints;
} | unknown, referenceTable extends string = string, table = tableAndConstraints extends {
    table: Table;
    constraints: Constraints;
} ? tableAndConstraints["table"] : Table, columnNames = keyof table & string> = columnNames extends columnNames ? table[columnNames & keyof table] extends ReferenceColumn<Scalar, boolean, `${referenceTable}.id`> ? columnNames : never : never;
type ExtractNonVirtualColumnNames<table extends Table | unknown, columnNames = keyof table & string> = columnNames extends columnNames ? table[columnNames & keyof table] extends ReferenceColumn | ScalarColumn | EnumColumn ? columnNames : never : never;

type Optional<column extends BuilderScalarColumn> = () => BuilderScalarColumn<column[" scalar"], true, column[" list"]>;
type List<column extends BuilderScalarColumn> = () => BuilderScalarColumn<column[" scalar"], column[" optional"], true>;
type EnumOptional<column extends BuilderEnumColumn> = () => BuilderEnumColumn<column[" enum"], true, column[" list"]>;
type EnumList<column extends BuilderEnumColumn> = () => BuilderEnumColumn<column[" enum"], column[" optional"], true>;
type Asc<index extends Index> = () => BuilderIndex<index[" column"], "asc", index[" nulls"]>;
type Desc<index extends BuilderIndex> = () => BuilderIndex<index[" column"], "desc", index[" nulls"]>;
type NullsFirst<index extends BuilderIndex> = () => BuilderIndex<index[" column"], index[" order"], "first">;
type NullsLast<index extends BuilderIndex> = () => BuilderIndex<index[" column"], index[" order"], "last">;
type ReferenceOptional<column extends BuilderReferenceColumn> = () => BuilderReferenceColumn<column[" scalar"], true, column[" reference"]>;
type References<column extends BuilderScalarColumn> = <reference extends string>(ref: reference) => BuilderReferenceColumn<column[" scalar"], column[" optional"], reference>;
type JSONOptional<column extends BuilderJSONColumn> = () => BuilderJSONColumn<column[" json"], true>;
type BuilderScalarColumn<scalar extends Scalar = Scalar, optional extends boolean = boolean, list extends boolean = boolean, base extends ScalarColumn<scalar, optional, list> = ScalarColumn<scalar, optional, list>> = list extends false ? optional extends false ? base & {
    /**
     * Mark the column as optional.
     *
     * - Docs: https://ponder.sh/docs/schema#optional
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     o: p.int().optional(),
     *   })
     * }));
     */
    optional: Optional<base>;
    /**
     * Mark the column as a list.
     *
     * - Docs: https://ponder.sh/docs/schema#list
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     l: p.int().list(),
     *   })
     * }));
     */
    list: List<base>;
    references: References<base>;
} : base & {
    /**
     * Mark the column as a list.
     *
     * - Docs: https://ponder.sh/docs/schema#list
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     l: p.int().list(),
     *   })
     * }))
     */
    list: List<base>;
    /**
     * Mark the column as a foreign key.
     *
     * - Docs: https://ponder.sh/docs/schema#foreign-key
     *
     * @param references Table that this column is a key of.
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   a: p.createTable({
     *     id: p.string(),
     *     b_id: p.string.references("b.id"),
     *   })
     *   b: p.createTable({
     *     id: p.string(),
     *   })
     * }));
     */
    references: References<base>;
} : optional extends false ? base & {
    /**
     * Mark the column as optional.
     *
     * - Docs: https://ponder.sh/docs/schema#optional
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     o: p.int().optional(),
     *   })
     * }));
     */
    optional: Optional<base>;
} : base;
type BuilderReferenceColumn<scalar extends Scalar = Scalar, optional extends boolean = boolean, reference extends string = string, base extends ReferenceColumn<scalar, optional, reference> = ReferenceColumn<scalar, optional, reference>> = optional extends false ? base & {
    /**
     * Mark the column as optional.
     *
     * - Docs: https://ponder.sh/docs/schema#optional
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     o: p.int().optional(),
     *   })
     * })
     */
    optional: ReferenceOptional<base>;
} : base;
type BuilderJSONColumn<type = any, optional extends boolean = boolean, base extends JSONColumn<type, optional> = JSONColumn<type, optional>> = optional extends false ? base & {
    /**
     * Mark the column as optional.
     *
     * - Docs: https://ponder.sh/docs/schema#optional
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     o: p.json().optional(),
     *   })
     * }));
     */
    optional: JSONOptional<base>;
} : base;
type BuilderOneColumn<reference extends string = string> = {
    " type": "one";
    " reference": reference;
};
type BuilderManyColumn<referenceTable extends string = string, referenceColumn extends string = string> = {
    " type": "many";
    " referenceTable": referenceTable;
    " referenceColumn": referenceColumn;
};
type BuilderEnumColumn<_enum extends string = string, optional extends boolean = boolean, list extends boolean = boolean, base extends EnumColumn<_enum, optional, list> = EnumColumn<_enum, optional, list>> = list extends false ? optional extends false ? base & {
    /**
     * Mark the column as optional.
     *
     * - Docs: https://ponder.sh/docs/schema#optional
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   e: p.createEnum(["ONE", "TWO"])
     *   t: p.createTable({
     *     id: p.string(),
     *     a: p.enum("e").optional(),
     *   })
     * }));
     */
    optional: EnumOptional<base>;
    /**
     * Mark the column as a list.
     *
     * - Docs: https://ponder.sh/docs/schema#list
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   e: p.createEnum(["ONE", "TWO"])
     *   t: p.createTable({
     *     id: p.string(),
     *     a: p.enum("e").list(),
     *   })
     * }));
     */
    list: EnumList<base>;
} : base & {
    /**
     * Mark the column as a list.
     *
     * - Docs: https://ponder.sh/docs/schema#list
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   e: p.createEnum(["ONE", "TWO"])
     *   t: p.createTable({
     *     id: p.string(),
     *     a: p.enum("e").list(),
     *   })
     * }));
     */
    list: EnumList<base>;
} : optional extends false ? base & {
    /**
     * Mark the column as optional.
     *
     * - Docs: https://ponder.sh/docs/schema#optional
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   e: p.createEnum(["ONE", "TWO"])
     *   t: p.createTable({
     *     id: p.string(),
     *     a: p.enum("e").optional(),
     *   })
     * }));
     */
    optional: EnumOptional<base>;
} : base;
type BuilderIndex<column extends string | readonly string[] = string | readonly string[], order extends "asc" | "desc" | undefined = "asc" | "desc" | undefined, nulls extends "first" | "last" | undefined = "first" | "last" | undefined, base extends Index<column, order, nulls> = Index<column, order, nulls>, isSingleColumn = column extends readonly string[] ? false : true> = order extends undefined ? nulls extends undefined ? isSingleColumn extends true ? base & {
    asc: Asc<base>;
    desc: Desc<base>;
    nullsFirst: NullsFirst<base>;
    nullsLast: NullsLast<base>;
} : base : isSingleColumn extends true ? base & {
    asc: Asc<base>;
    desc: Desc<base>;
} : base : nulls extends undefined ? isSingleColumn extends true ? base & {
    nullsFirst: NullsFirst<base>;
    nullsLast: NullsLast<base>;
} : base : base;

type GetTable<table, tableName extends string = string, schema = {}, tableNames extends string = {} extends schema ? string : ExtractTableNames<schema>, enumNames extends string = {} extends schema ? string : ExtractEnumNames<schema>> = {} extends table ? {} : table extends {
    id: IdColumn;
} ? {
    [columnName in keyof table]: table[columnName] extends ScalarColumn ? ScalarColumn : table[columnName] extends ReferenceColumn ? ReferenceColumn<table[columnName][" scalar"], table[columnName][" optional"], `${tableNames}.id`> : table[columnName] extends JSONColumn ? JSONColumn : table[columnName] extends OneColumn ? OneColumn<Exclude<keyof table & string, columnName | "id">> : table[columnName] extends ManyColumn ? {} extends schema ? ManyColumn : table[columnName] extends ManyColumn<Exclude<tableNames, tableName>> ? ManyColumn<table[columnName][" referenceTable"], ExtractReferenceColumnNames<schema[table[columnName][" referenceTable"] & keyof schema], tableName> & string> : ManyColumn<Exclude<tableNames, tableName>> : table[columnName] extends EnumColumn ? EnumColumn<enumNames> : Column;
} : {
    id: IdColumn;
} & {
    [columnName: string]: Column;
};
type GetConstraints<constraints, table, columnName extends string = ExtractNonVirtualColumnNames<table>> = {} extends constraints ? {} : {
    [name in keyof constraints]: Index<columnName | readonly columnName[]>;
};
declare const P: {
    createTable: <const table, const constraints>(t: GetTable<table, string, {}, string, string>, c?: GetConstraints<constraints, table, ExtractNonVirtualColumnNames<table, keyof table & string>> | undefined) => {
        table: table;
        constraints: constraints;
    };
    createEnum: <const _enum extends readonly string[]>(e: _enum) => _enum;
    string: () => {
        " type": "scalar";
        " scalar": "string";
        " optional": false;
        " list": false;
        optional: () => ScalarColumn<"string", true, false> & {
            list: () => ScalarColumn<"string", true, true>;
            references: <reference extends string>(ref: reference) => ReferenceColumn<"string", true, reference>;
        };
        list: () => ScalarColumn<"string", false, true> & {
            optional: () => ScalarColumn<"string", true, true>;
        };
        references: <reference_1 extends string>(ref: reference_1) => ReferenceColumn<"string", false, reference_1> & {
            optional: () => ReferenceColumn<"string", true, reference_1>;
        };
    };
    bigint: () => {
        " type": "scalar";
        " scalar": "bigint";
        " optional": false;
        " list": false;
        optional: () => ScalarColumn<"bigint", true, false> & {
            list: () => ScalarColumn<"bigint", true, true>;
            references: <reference_2 extends string>(ref: reference_2) => ReferenceColumn<"bigint", true, reference_2>;
        };
        list: () => ScalarColumn<"bigint", false, true> & {
            optional: () => ScalarColumn<"bigint", true, true>;
        };
        references: <reference_3 extends string>(ref: reference_3) => ReferenceColumn<"bigint", false, reference_3> & {
            optional: () => ReferenceColumn<"bigint", true, reference_3>;
        };
    };
    int: () => {
        " type": "scalar";
        " scalar": "int";
        " optional": false;
        " list": false;
        optional: () => ScalarColumn<"int", true, false> & {
            list: () => ScalarColumn<"int", true, true>;
            references: <reference_4 extends string>(ref: reference_4) => ReferenceColumn<"int", true, reference_4>;
        };
        list: () => ScalarColumn<"int", false, true> & {
            optional: () => ScalarColumn<"int", true, true>;
        };
        references: <reference_5 extends string>(ref: reference_5) => ReferenceColumn<"int", false, reference_5> & {
            optional: () => ReferenceColumn<"int", true, reference_5>;
        };
    };
    float: () => {
        " type": "scalar";
        " scalar": "float";
        " optional": false;
        " list": false;
        optional: () => ScalarColumn<"float", true, false> & {
            list: () => ScalarColumn<"float", true, true>;
            references: <reference_6 extends string>(ref: reference_6) => ReferenceColumn<"float", true, reference_6>;
        };
        list: () => ScalarColumn<"float", false, true> & {
            optional: () => ScalarColumn<"float", true, true>;
        };
        references: <reference_7 extends string>(ref: reference_7) => ReferenceColumn<"float", false, reference_7> & {
            optional: () => ReferenceColumn<"float", true, reference_7>;
        };
    };
    hex: () => {
        " type": "scalar";
        " scalar": "hex";
        " optional": false;
        " list": false;
        optional: () => ScalarColumn<"hex", true, false> & {
            list: () => ScalarColumn<"hex", true, true>;
            references: <reference_8 extends string>(ref: reference_8) => ReferenceColumn<"hex", true, reference_8>;
        };
        list: () => ScalarColumn<"hex", false, true> & {
            optional: () => ScalarColumn<"hex", true, true>;
        };
        references: <reference_9 extends string>(ref: reference_9) => ReferenceColumn<"hex", false, reference_9> & {
            optional: () => ReferenceColumn<"hex", true, reference_9>;
        };
    };
    boolean: () => {
        " type": "scalar";
        " scalar": "boolean";
        " optional": false;
        " list": false;
        optional: () => ScalarColumn<"boolean", true, false> & {
            list: () => ScalarColumn<"boolean", true, true>;
            references: <reference_10 extends string>(ref: reference_10) => ReferenceColumn<"boolean", true, reference_10>;
        };
        list: () => ScalarColumn<"boolean", false, true> & {
            optional: () => ScalarColumn<"boolean", true, true>;
        };
        references: <reference_11 extends string>(ref: reference_11) => ReferenceColumn<"boolean", false, reference_11> & {
            optional: () => ReferenceColumn<"boolean", true, reference_11>;
        };
    };
    json: <type = any>() => JSONColumn<type, false> & {
        optional: () => JSONColumn<type, true>;
    };
    one: <reference_12 extends string>(ref: reference_12) => BuilderOneColumn<reference_12>;
    many: <referenceTable extends string = string, referenceColumn extends string = string>(ref: `${referenceTable}.${referenceColumn}`) => BuilderManyColumn<referenceTable, referenceColumn>;
    enum: <_enum_1 extends string>(__enum: _enum_1) => {
        " type": "enum";
        " enum": _enum_1;
        " optional": false;
        " list": false;
        optional: () => EnumColumn<_enum_1, true, false> & {
            list: () => EnumColumn<_enum_1, true, true>;
        };
        list: () => EnumColumn<_enum_1, false, true> & {
            optional: () => EnumColumn<_enum_1, true, true>;
        };
    };
    index: <const column extends string | readonly string[]>(c: column) => (column extends readonly string[] ? false : true) extends infer T ? T extends (column extends readonly string[] ? false : true) ? T extends true ? Index<column, undefined, undefined> & {
        asc: () => (column extends readonly string[] ? false : true) extends infer T_1 ? T_1 extends (column extends readonly string[] ? false : true) ? T_1 extends true ? Index<column, "asc", undefined> & {
            nullsFirst: () => Index<column, "asc", "first">;
            nullsLast: () => Index<column, "asc", "last">;
        } : Index<column, "asc", undefined> : never : never;
        desc: () => (column extends readonly string[] ? false : true) extends infer T_2 ? T_2 extends (column extends readonly string[] ? false : true) ? T_2 extends true ? Index<column, "desc", undefined> & {
            nullsFirst: () => Index<column, "desc", "first">;
            nullsLast: () => Index<column, "desc", "last">;
        } : Index<column, "desc", undefined> : never : never;
        nullsFirst: () => (column extends readonly string[] ? false : true) extends infer T_3 ? T_3 extends (column extends readonly string[] ? false : true) ? T_3 extends true ? Index<column, undefined, "first"> & {
            asc: () => Index<column, "asc", "first">;
            desc: () => Index<column, "desc", "first">;
        } : Index<column, undefined, "first"> : never : never;
        nullsLast: () => (column extends readonly string[] ? false : true) extends infer T_4 ? T_4 extends (column extends readonly string[] ? false : true) ? T_4 extends true ? Index<column, undefined, "last"> & {
            asc: () => Index<column, "asc", "last">;
            desc: () => Index<column, "desc", "last">;
        } : Index<column, undefined, "last"> : never : never;
    } : Index<column, undefined, undefined> : never : never;
};
type P = {
    /**
     * Create a database table.
     *
     * - Docs: https://ponder.sh/docs/schema#tables
     *
     * @example
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *   })
     * }));
     */
    createTable: <const table, const constraints>(t: GetTable<table>, c?: GetConstraints<constraints, table>) => {
        table: table;
        constraints: constraints;
    };
    /**
     * Create an Enum type for the database.
     *
     * - Docs: https://ponder.sh/docs/schema#tables
     *
     * @example
     * export default createSchema((p) => ({
     *   e: p.createEnum(["ONE", "TWO"])
     *   t: p.createTable({
     *     id: p.string(),
     *     a: p.enum("e"),
     *   })
     * }));
     */
    createEnum: <const _enum extends readonly string[]>(e: _enum) => _enum;
    /**
     * Primitive `string` column type.
     *
     * - Docs: https://ponder.sh/docs/schema#primitives
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *   })
     * }));
     */
    string: () => BuilderScalarColumn<"string", false, false>;
    /**
     * Primitive `bigint` column type.
     *
     * - Docs: https://ponder.sh/docs/schema#primitives
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.bigint(),
     *   })
     * }));
     */
    bigint: () => BuilderScalarColumn<"bigint", false, false>;
    /**
     * Primitive `int` column type.
     *
     * - Docs: https://ponder.sh/docs/schema#primitives
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.int(),
     *   })
     * }));
     */
    int: () => BuilderScalarColumn<"int", false, false>;
    /**
     * Primitive `float` column type.
     *
     * - Docs: https://ponder.sh/docs/schema#primitives
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     f: p.float(),
     *   })
     * }));
     */
    float: () => BuilderScalarColumn<"float", false, false>;
    /**
     * Primitive `hex` column type.
     *
     * - Docs: https://ponder.sh/docs/schema#primitives
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.hex(),
     *   })
     * }));
     */
    hex: () => BuilderScalarColumn<"hex", false, false>;
    /**
     * Primitive `boolean` column type.
     *
     * - Docs: https://ponder.sh/docs/schema#primitives
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     b: p.boolean(),
     *   })
     * }));
     */
    boolean: () => BuilderScalarColumn<"boolean", false, false>;
    /**
     * Primitive `JSON` column type.
     *
     * - Docs: https://ponder.sh/docs/schema#primitives
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     b: p.json(),
     *   })
     * }));
     */
    json: <type = any>() => BuilderJSONColumn<type, false>;
    /**
     * One-to-one column type.`one` columns don't exist in the database. They are only present when querying data from the GraphQL API.
     *
     * - Docs: https://ponder.sh/docs/schema#one-to-one
     *
     * @param reference Reference column to be resolved.
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   a: p.createTable({
     *     id: p.string(),
     *     b_id: p.string.references("b.id"),
     *     b: p.one("b_id"),
     *   })
     *   b: p.createTable({
     *     id: p.string(),
     *   })
     * }));
     */
    one: <reference extends string>(ref: reference) => BuilderOneColumn<reference>;
    /**
     * Many-to-one column type. `many` columns don't exist in the database. They are only present when querying data from the GraphQL API.
     *
     * - Docs: https://ponder.sh/docs/schema#one-to-many
     *
     * @param reference Reference column that references the `id` column of the current table.
     *
     * @example
     * import { createSchema } from "@ponder/core";
     *
     * export default createSchema((p) => ({
     *   a: p.createTable({
     *     id: p.string(),
     *     ref: p.string.references("b.id"),
     *   })
     *   b: p.createTable({
     *     id: p.string(),
     *     m: p.many("a.ref"),
     *   })
     * }));
     */
    many: <referenceTable extends string, referenceColumn extends string>(ref: `${referenceTable}.${referenceColumn}`) => BuilderManyColumn<referenceTable, referenceColumn>;
    /**
     * Custom defined allowable value column type.
     *
     * - Docs: https://ponder.sh/docs/schema#enum
     *
     * @param type Enum defined elsewhere in the schema with `p.createEnum()`.
     *
     * @example
     * export default createSchema((p) => ({
     *   e: p.createEnum(["ONE", "TWO"])
     *   t: p.createTable({
     *     id: p.string(),
     *     a: p.enum("e"),
     *   })
     * }));
     */
    enum: <_enum extends string>(__enum: _enum) => BuilderEnumColumn<_enum, false, false>;
    /**
     * Create a table index.
     *
     * - Docs: https://ponder.sh/docs/schema#indexes
     *
     * @param columns Column or columns to include in the index.
     *
     * @example
     * export default createSchema((p) => ({
     *   t: p.createTable({
     *     id: p.string(),
     *     age: p.int(),
     *   }, {
     *     ageIndex: p.index("age"),
     *   })
     * }));
     */
    index: <const column extends string | readonly string[]>(c: column) => BuilderIndex<column, undefined, undefined>;
};
type CreateSchemaParameters<schema> = {} extends schema ? {} : {
    [tableName in keyof schema]: schema[tableName] extends {
        table: infer table extends Table;
        constraints: infer constraints extends Constraints;
    } ? {
        table: GetTable<table, tableName & string, schema>;
        constraints: GetConstraints<constraints, table>;
    } : readonly string[];
};
declare const createSchema: <const schema>(_schema: (p: P) => CreateSchemaParameters<schema>) => unknown extends schema ? Schema : schema;

/**
 * A confirmed Ethereum block.
 *
 * @link https://docs.soliditylang.org/en/v0.8.20/introduction-to-smart-contracts.html#blocks
 */
type Block = {
    /** Base fee per gas */
    baseFeePerGas: bigint | null;
    /** Difficulty for this block */
    difficulty: bigint;
    /** "Extra data" field of this block */
    extraData: Hex;
    /** Maximum gas allowed in this block */
    gasLimit: bigint;
    /** Total used gas by all transactions in this block */
    gasUsed: bigint;
    /** Block hash */
    hash: Hash;
    /** Logs bloom filter */
    logsBloom: Hex;
    /** Address that received this block’s mining rewards */
    miner: Address;
    /** Unique identifier for the block. */
    mixHash: Hash | null;
    /** Proof-of-work hash */
    nonce: Hex | null;
    /** Block number */
    number: bigint;
    /** Parent block hash */
    parentHash: Hash;
    /** Root of the this block’s receipts trie */
    receiptsRoot: Hex;
    /** SHA3 of the uncles data in this block */
    sha3Uncles: Hash | null;
    /** Size of this block in bytes */
    size: bigint;
    /** Root of this block’s final state trie */
    stateRoot: Hash;
    /** Unix timestamp of when this block was collated */
    timestamp: bigint;
    /** Total difficulty of the chain until this block */
    totalDifficulty: bigint | null;
    /** Root of this block’s transaction trie */
    transactionsRoot: Hash;
};
/**
 * A confirmed Ethereum transaction. Contains `legacy`, `EIP-1559`, or `EIP-2930` fee values depending on the transaction `type`.
 *
 * @link https://docs.soliditylang.org/en/v0.8.20/introduction-to-smart-contracts.html#transactions
 */
type Transaction = Prettify<{
    /** Hash of block containing this transaction */
    blockHash: Hash;
    /** Number of block containing this transaction */
    blockNumber: bigint;
    /** Transaction sender */
    from: Address;
    /** Gas provided for transaction execution */
    gas: bigint;
    /** Hash of this transaction */
    hash: Hash;
    /** Contract code or a hashed method call */
    input: Hex;
    /** Unique number identifying this transaction */
    nonce: number;
    /** ECDSA signature r */
    r: Hex | null;
    /** ECDSA signature s */
    s: Hex | null;
    /** Transaction recipient or `null` if deploying a contract */
    to: Address | null;
    /** Index of this transaction in the block */
    transactionIndex: number;
    /** ECDSA recovery ID */
    v: bigint | null;
    /** Value in wei sent with this transaction */
    value: bigint;
} & ({
    /** Transaction type. */
    type: "legacy";
    accessList?: never;
    /** Base fee per gas. Only present in legacy and EIP-2930 transactions. */
    gasPrice: bigint;
    maxFeePerGas?: never;
    maxPriorityFeePerGas?: never;
} | {
    /** Transaction type. */
    type: "eip2930";
    /** List of addresses and storage keys the transaction will access. */
    accessList: AccessList;
    /** Base fee per gas. Only present in legacy and EIP-2930 transactions. */
    gasPrice: bigint;
    maxFeePerGas?: never;
    maxPriorityFeePerGas?: never;
} | {
    /** Transaction type. */
    type: "eip1559";
    accessList?: never;
    gasPrice?: never;
    /** Total fee per gas in wei (gasPrice/baseFeePerGas + maxPriorityFeePerGas). Only present in EIP-1559 transactions. */
    maxFeePerGas: bigint;
    /** Max priority fee per gas (in wei). Only present in EIP-1559 transactions. */
    maxPriorityFeePerGas: bigint;
} | {
    /** Transaction type. */
    type: "deposit";
    accessList?: never;
    gasPrice?: never;
    /** Total fee per gas in wei (gasPrice/baseFeePerGas + maxPriorityFeePerGas). Only present in EIP-1559 transactions. */
    maxFeePerGas?: bigint;
    /** Max priority fee per gas (in wei). Only present in EIP-1559 transactions. */
    maxPriorityFeePerGas?: bigint;
} | {
    /** Transaction type. */
    type: Hex;
    gasPrice?: never;
    accessList?: never;
    maxFeePerGas?: never;
    maxPriorityFeePerGas?: never;
})>;
/**
 * A confirmed Ethereum log.
 *
 * @link https://docs.soliditylang.org/en/v0.8.20/abi-spec.html#events
 */
type Log = {
    /** Globally unique identifier for this log (`${blockHash}-${logIndex}`) */
    id: string;
    /** The address from which this log originated */
    address: Address;
    /** Hash of block containing this log */
    blockHash: Hash;
    /** Number of block containing this log */
    blockNumber: bigint;
    /** Contains the non-indexed arguments of the log */
    data: Hex;
    /** Index of this log within its block */
    logIndex: number;
    /** `true` if this log has been removed in a chain reorganization */
    removed: boolean;
    /** List of order-dependent topics */
    topics: [Hex, ...Hex[]] | [];
    /** Hash of the transaction that created this log */
    transactionHash: Hash;
    /** Index of the transaction that created this log */
    transactionIndex: number;
};
/**
 * A confirmed Ethereum transaction receipt.
 */
type TransactionReceipt = {
    /** Hash of block containing this transaction */
    blockHash: Hash;
    /** Number of block containing this transaction */
    blockNumber: bigint;
    /** Address of new contract or `null` if no contract was created */
    contractAddress: Address | null;
    /** Gas used by this and all preceding transactions in this block */
    cumulativeGasUsed: bigint;
    /** Pre-London, it is equal to the transaction's gasPrice. Post-London, it is equal to the actual gas price paid for inclusion. */
    effectiveGasPrice: bigint;
    /** Transaction sender */
    from: Address;
    /** Gas used by this transaction */
    gasUsed: bigint;
    /** List of log objects generated by this transaction */
    logs: Log[];
    /** Logs bloom filter */
    logsBloom: Hex;
    /** `success` if this transaction was successful or `reverted` if it failed */
    status: "success" | "reverted";
    /** Transaction recipient or `null` if deploying a contract */
    to: Address | null;
    /** Hash of this transaction */
    transactionHash: Hash;
    /** Index of this transaction in the block */
    transactionIndex: number;
    /** Transaction type */
    type: TransactionType;
};
type _TraceAddress = number | _TraceAddress[];
type TraceAddress = _TraceAddress[];
/**
 * An Ethereum call trace.
 */
type CallTrace = {
    /** Globally unique identifier for this trace (`${transactionHash}-${traceAddress}`) */
    id: string;
    /** Message sender */
    from: Address;
    /** Message receipient  */
    to: Address;
    /** Amount of gas allocated to this call */
    gas: bigint;
    /** Value in wei sent with this call */
    value: bigint;
    /** Calldata sent with this call */
    input: Hex;
    /** Contains return data */
    output: Hex;
    /** Total used gas by this trace */
    gasUsed: bigint;
    /** Number of traces created by this trace */
    subtraces: number;
    /** Description of this traces position within all traces in the transaction */
    traceAddress: TraceAddress;
    /** Hash of block containing this trace */
    blockHash: Hash;
    /** Number of block containing this trace */
    blockNumber: bigint;
    /** Hash of the transaction that created this trace */
    transactionHash: Hash;
    /** Index of the transaction that created this trace */
    transactionIndex: number;
    /** EVM opcode used to make this call */
    callType: "call" | "staticcall" | "delegatecall" | "callcode";
};

type UserColumn = string | string[] | number | number[] | boolean | boolean[] | Hex | Hex[] | bigint | bigint[] | object | null | undefined;
type UserTable = {
    id: string | number | Hex | bigint;
    [columnName: string]: UserColumn;
};

type OperatorMap<column extends UserColumn> = {
    equals?: column;
    not?: column;
} & (column extends unknown[] ? {
    has?: column[number];
    notHas?: column[number];
} : {
    in?: column[];
    notIn?: column[];
}) & (column extends string ? column extends Hex ? {} : {
    contains?: column;
    notContains?: column;
    startsWith?: column;
    notStartsWith?: column;
    endsWith?: column;
    notEndsWith?: column;
} : {}) & (column extends number | bigint | Hex ? {
    gt?: column;
    gte?: column;
    lt?: column;
    lte?: column;
} : {});
type WhereInput<table extends UserTable> = {
    [columnName in keyof table]?: Prettify<OperatorMap<table[columnName]>> | table[columnName];
} & {
    AND?: Prettify<WhereInput<table>>[];
    OR?: Prettify<WhereInput<table>>[];
};
type OrderByInput<table, columns extends keyof table = keyof table> = {
    [ColumnName in columns]?: "asc" | "desc";
};

type DatabaseModel<table extends UserTable> = {
    create: (options: Prettify<{
        id: table["id"];
    } & (HasOnlyIdProperty<table> extends true ? {
        data?: never;
    } : HasRequiredPropertiesOtherThanId<table> extends true ? {
        data: Prettify<Omit<table, "id">>;
    } : {
        data?: Prettify<Omit<table, "id">>;
    })>) => Promise<Prettify<table>>;
    createMany: (options: {
        data: Prettify<table>[];
    }) => Promise<Prettify<table>[]>;
    update: (options: Prettify<{
        id: table["id"];
    } & (HasOnlyIdProperty<table> extends true ? {
        data?: never;
    } : HasRequiredPropertiesOtherThanId<table> extends true ? {
        data: Prettify<Omit<Partial<table>, "id">> | ((options: {
            current: Prettify<table>;
        }) => Prettify<Omit<Partial<table>, "id">>);
    } : {
        data?: Prettify<Omit<Partial<table>, "id">> | ((options: {
            current: Prettify<table>;
        }) => Prettify<Omit<Partial<table>, "id">>);
    })>) => Promise<Prettify<table>>;
    updateMany: (options: {
        where: Prettify<WhereInput<table>>;
        data: Prettify<Omit<Partial<table>, "id">> | ((options: {
            current: Prettify<table>;
        }) => Prettify<Omit<Partial<table>, "id">>);
    }) => Promise<Prettify<table>[]>;
    upsert: (options: Prettify<{
        id: table["id"];
    } & (HasOnlyIdProperty<table> extends true ? {
        create?: never;
        update?: never;
    } : HasRequiredPropertiesOtherThanId<table> extends true ? {
        create: Prettify<Omit<table, "id">>;
        update: Prettify<Omit<Partial<table>, "id">> | ((options: {
            current: Prettify<table>;
        }) => Prettify<Omit<Partial<table>, "id">>);
    } : {
        create?: Prettify<Omit<table, "id">>;
        update?: Prettify<Omit<Partial<table>, "id">> | ((options: {
            current: Prettify<table>;
        }) => Prettify<Omit<Partial<table>, "id">>);
    })>) => Promise<Prettify<table>>;
    findUnique: (options: {
        id: table["id"];
    }) => Promise<Prettify<table> | null>;
    findMany: (options?: {
        where?: Prettify<WhereInput<table>>;
        orderBy?: Prettify<OrderByInput<table>>;
        limit?: number;
        before?: string;
        after?: string;
    }) => Promise<{
        items: Prettify<table>[];
        pageInfo: {
            startCursor: string | null;
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    delete: (options: {
        id: table["id"];
    }) => Promise<boolean>;
};

/**
 * Fix issue with Array.isArray not checking readonly arrays
 * {@link https://github.com/microsoft/TypeScript/issues/17002}
 */
declare global {
    interface ArrayConstructor {
        isArray(arg: ReadonlyArray<any> | any): arg is ReadonlyArray<any>;
    }
}

type BlockOptions = {
    cache?: undefined;
    blockNumber?: undefined;
} | {
    cache: "immutable";
    blockNumber?: undefined;
} | {
    cache?: undefined;
    blockNumber: bigint;
};
type PonderActions = {
    getBalance: (args: Omit<GetBalanceParameters, "blockTag" | "blockNumber"> & BlockOptions) => Promise<GetBalanceReturnType>;
    getBytecode: (args: Omit<GetBytecodeParameters, "blockTag" | "blockNumber"> & BlockOptions) => Promise<GetBytecodeReturnType>;
    getStorageAt: (args: Omit<GetStorageAtParameters, "blockTag" | "blockNumber"> & BlockOptions) => Promise<GetStorageAtReturnType>;
    multicall: <TContracts extends ContractFunctionConfig[], TAllowFailure extends boolean = true>(args: Omit<MulticallParameters<TContracts, TAllowFailure>, "blockTag" | "blockNumber"> & BlockOptions) => Promise<MulticallReturnType<TContracts, TAllowFailure>>;
    readContract: <const TAbi extends Abi$1 | readonly unknown[], TFunctionName extends string>(args: Omit<ReadContractParameters<TAbi, TFunctionName>, "blockTag" | "blockNumber"> & BlockOptions) => Promise<ReadContractReturnType<TAbi, TFunctionName>>;
    getEnsName: (args: Omit<GetEnsNameParameters, "blockTag" | "blockNumber"> & BlockOptions) => Promise<GetEnsNameReturnType>;
};
type ReadOnlyClient<transport extends Transport = Transport, chain extends Chain | undefined = Chain | undefined> = Prettify<Client<transport, chain, undefined, PublicRpcSchema, PonderActions>>;

type InferScalarType<scalar extends Scalar> = scalar extends "string" ? string : scalar extends "int" ? number : scalar extends "float" ? number : scalar extends "boolean" ? boolean : scalar extends "hex" ? Hex : scalar extends "bigint" ? bigint : never;
type InferColumnType<column extends Column | unknown, schema extends Schema | unknown> = column extends ScalarColumn ? column[" list"] extends true ? InferScalarType<column[" scalar"]>[] : InferScalarType<column[" scalar"]> : column extends ReferenceColumn ? InferScalarType<column[" scalar"]> : column extends JSONColumn ? column[" json"] : column extends EnumColumn ? (schema[column[" enum"] & keyof schema] & Enum)[number] : never;
type InferTableType<table, schema> = table extends {
    table: Table;
    constraints: Constraints;
} ? Prettify<{
    [columnName in ExtractRequiredColumnNames<table>]: InferColumnType<table["table"][columnName], schema>;
} & {
    [columnName in ExtractOptionalColumnNames<table>]?: InferColumnType<table["table"][columnName], schema>;
}> : never;
type InferSchemaType<schema extends Schema | unknown> = {
    [tableName in ExtractTableNames<schema>]: InferTableType<schema[tableName], schema>;
};

declare namespace Virtual {
    type Setup = "setup";
    type _FormatEventNames<contract extends Config["contracts"][string], safeEventNames = SafeEventNames<contract["abi"]>> = string extends safeEventNames ? never : contract extends {
        filter: {
            event: infer event extends string | readonly string[];
        };
    } ? event extends safeEventNames ? event : event[number] extends safeEventNames ? event[number] : safeEventNames : safeEventNames;
    type _FormatFunctionNames<contract extends Config["contracts"][string], safeFunctionNames = SafeFunctionNames<contract["abi"]>> = string extends safeFunctionNames ? never : safeFunctionNames;
    /** "{ContractName}:{EventName}" | "{ContractName}.{FunctionName}()" | "{SourceName}:block" . */
    export type FormatEventNames<contracts extends Config["contracts"], blocks extends Config["blocks"]> = {
        [name in keyof contracts]: `${name & string}:${_FormatEventNames<contracts[name]> | Setup}`;
    }[keyof contracts] | {
        [name in keyof blocks]: `${name & string}:block`;
    }[keyof blocks] | {
        [name in keyof contracts]: true extends ExtractOverridenProperty<contracts[name], "includeCallTraces"> ? `${name & string}.${_FormatFunctionNames<contracts[name]>}` : never;
    }[keyof contracts];
    type FormatTransactionReceipts<contract extends Config["contracts"][string], includeTxr = ExtractOverridenProperty<contract, "includeTransactionReceipts">> = includeTxr extends includeTxr ? includeTxr extends true ? {
        transactionReceipt: Prettify<TransactionReceipt>;
    } : {
        transactionReceipt?: never;
    } : never;
    export type ExtractEventName<name extends string> = name extends `${string}:${infer EventName extends string}` ? EventName : name extends `${string}.${infer EventName extends string}` ? EventName : never;
    export type ExtractSourceName<name extends string> = name extends `${infer SourceName extends string}:${string}` ? SourceName : name extends `${infer SourceName extends string}.${string}` ? SourceName : never;
    export type EventNames<config extends Config> = FormatEventNames<config["contracts"], config["blocks"]>;
    export type Event<config extends Config, name extends EventNames<config>, contractName extends ExtractSourceName<name> = ExtractSourceName<name>, eventName extends ExtractEventName<name> = ExtractEventName<name>> = name extends `${string}:block` ? {
        block: Prettify<Block>;
    } : name extends `${string}.${string}` ? Prettify<{
        args: FormatFunctionArgs<config["contracts"][contractName]["abi"], eventName>;
        result: FormatFunctionResult<config["contracts"][contractName]["abi"], eventName>;
        trace: Prettify<CallTrace>;
        block: Prettify<Block>;
        transaction: Prettify<Transaction>;
    } & FormatTransactionReceipts<config["contracts"][contractName]>> : eventName extends Setup ? never : Prettify<{
        name: eventName;
        args: FormatEventArgs<config["contracts"][contractName]["abi"], eventName>;
        log: Prettify<Log>;
        block: Prettify<Block>;
        transaction: Prettify<Transaction>;
    } & FormatTransactionReceipts<config["contracts"][contractName]>>;
    type ContextContractProperty = Exclude<keyof Config["contracts"][string], "abi" | "network" | "filter" | "factory">;
    type ExtractOverridenProperty<contract extends Config["contracts"][string], property extends ContextContractProperty, base = Extract<contract, {
        [p in property]: unknown;
    }>[property], override = Extract<contract["network"][keyof contract["network"]], {
        [p in property]: unknown;
    }>[property]> = ([base] extends [never] ? undefined : base) | override;
    export type Context<config extends Config, schema extends Schema, name extends EventNames<config>, sourceName extends ExtractSourceName<name> = ExtractSourceName<name>, sourceNetwork = sourceName extends sourceName ? (unknown extends config["contracts"][sourceName]["network"] ? never : config["contracts"][sourceName]["network"]) | (unknown extends config["blocks"][sourceName]["network"] ? never : config["blocks"][sourceName]["network"]) : never> = {
        contracts: {
            [_contractName in keyof config["contracts"]]: {
                abi: config["contracts"][_contractName]["abi"];
                address: ExtractOverridenProperty<config["contracts"][_contractName], "address">;
                startBlock: ExtractOverridenProperty<config["contracts"][_contractName], "startBlock">;
                endBlock: ExtractOverridenProperty<config["contracts"][_contractName], "endBlock">;
            };
        };
        network: sourceNetwork extends string ? {
            name: sourceNetwork;
            chainId: config["networks"][sourceNetwork]["chainId"];
        } : {
            [key in keyof sourceNetwork]: {
                name: key;
                chainId: config["networks"][key & keyof config["networks"]]["chainId"];
            };
        }[keyof sourceNetwork];
        client: Prettify<Omit<ReadOnlyClient, "extend" | "key" | "batch" | "cacheTime" | "account" | "type" | "uid" | "chain" | "name" | "pollingInterval" | "transport">>;
        db: {
            [key in keyof InferSchemaType<schema>]: DatabaseModel<InferSchemaType<schema>[key]>;
        };
    };
    export type IndexingFunctionArgs<config extends Config, schema extends Schema, name extends EventNames<config>> = {
        event: Event<config, name>;
        context: Context<config, schema, name>;
    };
    export type Schema<schema extends Schema> = InferSchemaType<schema>;
    export type Registry<config extends Config, schema extends Schema> = {
        on: <name extends EventNames<config>>(_name: name, indexingFunction: (args: {
            event: Event<config, name>;
        } & {
            context: Prettify<Context<config, schema, name>>;
        }) => Promise<void> | void) => void;
    };
    export {  };
}

type ContractConfig = Prettify<Config["contracts"][string]>;
type NetworkConfig = Prettify<Config["networks"][string]>;
type BlockConfig = Prettify<Config["blocks"][string]>;
type DatabaseConfig = Prettify<Config["database"]>;

export { type Block, type BlockConfig, type ContractConfig, type DatabaseConfig, type Log, type NetworkConfig, type Transaction, Virtual, createConfig, createSchema };
