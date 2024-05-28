#!/usr/bin/env node

// src/bin/ponder.ts
import { readFileSync as readFileSync5 } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "@commander-js/extra-typings";
import dotenv from "dotenv";

// src/utils/extend.ts
var extend = (create5, _methods) => {
  return (...params) => {
    const service = create5(...params);
    if (service instanceof Promise) {
      return service.then((s) => {
        const methods5 = {};
        for (const [methodName, method] of Object.entries(_methods)) {
          methods5[methodName] = (...params2) => method(s, ...params2);
        }
        return {
          ...s,
          ...methods5
        };
      });
    } else {
      const methods5 = {};
      for (const [methodName, method] of Object.entries(_methods)) {
        methods5[methodName] = (...params2) => method(service, ...params2);
      }
      return {
        ...service,
        ...methods5
      };
    }
  };
};

// src/build/service.ts
import { createHash } from "node:crypto";
import { readFileSync as readFileSync2 } from "node:fs";
import path2 from "node:path";

// src/schema/utils.ts
var isScalarColumn = (column) => column[" type"] === "scalar";
var isReferenceColumn = (column) => column[" type"] === "reference";
var isOneColumn = (column) => column[" type"] === "one";
var isManyColumn = (column) => column[" type"] === "many";
var isJSONColumn = (column) => column[" type"] === "json";
var isEnumColumn = (column) => column[" type"] === "enum";
var isOptionalColumn = (column) => {
  if (isManyColumn(column) || isOneColumn(column))
    return false;
  return column[" optional"];
};
var isListColumn = (column) => {
  if (isManyColumn(column) || isOneColumn(column) || isReferenceColumn(column) || isJSONColumn(column))
    return false;
  return column[" list"];
};
var isTable = (tableOrEnum) => !Array.isArray(tableOrEnum);
var isEnum = (tableOrEnum) => Array.isArray(tableOrEnum);
var getTables = (schema) => {
  const tables = {};
  for (const [name, tableOrEnum] of Object.entries(schema)) {
    if (isTable(tableOrEnum)) {
      tables[name] = tableOrEnum;
    }
  }
  return tables;
};
var getEnums = (schema) => {
  const enums = {};
  for (const [name, tableOrEnum] of Object.entries(schema)) {
    if (isEnum(tableOrEnum)) {
      enums[name] = tableOrEnum;
    }
  }
  return enums;
};
var extractReferenceTable = (ref) => {
  return ref[" reference"].split(".")[0];
};
var encodeSchema = (schema) => {
  return JSON.stringify({
    tables: getTables(schema),
    enums: getEnums(schema)
  });
};

// src/server/graphql/buildGraphqlSchema.ts
import {
  GraphQLObjectType as GraphQLObjectType3,
  GraphQLSchema
} from "graphql";

// src/server/graphql/entity.ts
import {
  GraphQLBoolean as GraphQLBoolean2
} from "graphql";
import {
  GraphQLInt as GraphQLInt2,
  GraphQLList as GraphQLList2,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString as GraphQLString2
} from "graphql";
import { GraphQLJSON } from "graphql-type-json";

// src/server/graphql/filter.ts
import {
  GraphQLInputObjectType
} from "graphql";
import { GraphQLList } from "graphql";

// src/server/graphql/scalar.ts
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLScalarType,
  GraphQLString
} from "graphql";
var GraphQLBigInt = new GraphQLScalarType({
  name: "BigInt",
  serialize: (value) => String(value),
  parseValue: (value) => BigInt(value),
  parseLiteral: (value) => {
    if (value.kind === "StringValue") {
      return BigInt(value.value);
    } else {
      throw new Error(
        `Invalid value kind provided for field of type BigInt: ${value.kind}. Expected: StringValue`
      );
    }
  }
});
var SCALARS = {
  int: GraphQLInt,
  float: GraphQLFloat,
  string: GraphQLString,
  boolean: GraphQLBoolean,
  bigint: GraphQLBigInt,
  hex: GraphQLString
};

// src/server/graphql/filter.ts
var filterOperators = {
  universal: ["", "_not"],
  singular: ["_in", "_not_in"],
  plural: ["_has", "_not_has"],
  numeric: ["_gt", "_lt", "_gte", "_lte"],
  string: [
    "_contains",
    "_not_contains",
    "_starts_with",
    "_ends_with",
    "_not_starts_with",
    "_not_ends_with"
  ]
};
var buildEntityFilterTypes = ({
  schema,
  enumTypes
}) => {
  const entityFilterTypes = {};
  for (const [tableName, { table }] of Object.entries(getTables(schema))) {
    const filterType = new GraphQLInputObjectType({
      name: `${tableName}Filter`,
      fields: () => {
        const filterFields = {
          // Logical operators
          AND: { type: new GraphQLList(filterType) },
          OR: { type: new GraphQLList(filterType) }
        };
        Object.entries(table).forEach(([columnName, column]) => {
          if (isOneColumn(column))
            return;
          if (isManyColumn(column))
            return;
          if (isJSONColumn(column))
            return;
          const type = isEnumColumn(column) ? enumTypes[column[" enum"]] : SCALARS[column[" scalar"]];
          if (isListColumn(column)) {
            filterOperators.universal.forEach((suffix) => {
              filterFields[`${columnName}${suffix}`] = {
                type: new GraphQLList(type)
              };
            });
            filterOperators.plural.forEach((suffix) => {
              filterFields[`${columnName}${suffix}`] = {
                type
              };
            });
          } else {
            filterOperators.universal.forEach((suffix) => {
              filterFields[`${columnName}${suffix}`] = {
                type
              };
            });
            filterOperators.singular.forEach((suffix) => {
              filterFields[`${columnName}${suffix}`] = {
                type: new GraphQLList(type)
              };
            });
            if ((isScalarColumn(column) || isReferenceColumn(column)) && ["int", "bigint", "float", "hex"].includes(column[" scalar"])) {
              filterOperators.numeric.forEach((suffix) => {
                filterFields[`${columnName}${suffix}`] = {
                  type
                };
              });
            }
            if ((isScalarColumn(column) || isReferenceColumn(column)) && "string" === column[" scalar"]) {
              filterOperators.string.forEach((suffix) => {
                filterFields[`${columnName}${suffix}`] = {
                  type
                };
              });
            }
          }
        });
        return filterFields;
      }
    });
    entityFilterTypes[tableName] = filterType;
  }
  return { entityFilterTypes };
};
var graphqlFilterToStoreCondition = {
  "": "equals",
  not: "not",
  in: "in",
  not_in: "notIn",
  has: "has",
  not_has: "notHas",
  gt: "gt",
  lt: "lt",
  gte: "gte",
  lte: "lte",
  contains: "contains",
  not_contains: "notContains",
  starts_with: "startsWith",
  not_starts_with: "notStartsWith",
  ends_with: "endsWith",
  not_ends_with: "notEndsWith"
};
function buildWhereObject(where) {
  const whereObject = {};
  for (const [whereKey, rawValue] of Object.entries(where)) {
    if (whereKey === "AND" || whereKey === "OR") {
      if (!Array.isArray(rawValue)) {
        throw new Error(
          `Invalid query: Expected an array for the ${whereKey} operator. Got: ${rawValue}`
        );
      }
      whereObject[whereKey] = rawValue.map(buildWhereObject);
      continue;
    }
    const [fieldName, condition_] = whereKey.split(/_(.*)/s);
    const condition = condition_ === void 0 ? "" : condition_;
    const storeCondition = graphqlFilterToStoreCondition[condition];
    if (!storeCondition) {
      throw new Error(
        `Invalid query: Unknown where condition: ${fieldName}_${condition}`
      );
    }
    whereObject[fieldName] ||= {};
    whereObject[fieldName][storeCondition] = rawValue;
  }
  return whereObject;
}

// src/server/graphql/entity.ts
var GraphQLPageInfo = new GraphQLObjectType({
  name: "PageInfo",
  fields: {
    hasNextPage: { type: new GraphQLNonNull(GraphQLBoolean2) },
    hasPreviousPage: { type: new GraphQLNonNull(GraphQLBoolean2) },
    startCursor: { type: GraphQLString2 },
    endCursor: { type: GraphQLString2 }
  }
});
var buildEntityTypes = ({
  schema,
  enumTypes,
  entityFilterTypes
}) => {
  const entityTypes = {};
  const entityPageTypes = {};
  for (const [tableName, { table }] of Object.entries(getTables(schema))) {
    entityTypes[tableName] = new GraphQLObjectType({
      name: tableName,
      fields: () => {
        const fieldConfigMap = {};
        Object.entries(table).forEach(([columnName, column]) => {
          if (isOneColumn(column)) {
            const referenceColumn = table[column[" reference"]];
            const referencedTable = extractReferenceTable(referenceColumn);
            const resolver = async (parent, _args, context) => {
              const relatedRecordId = parent[column[" reference"]];
              if (relatedRecordId === null || relatedRecordId === void 0)
                return null;
              const loader = context.getLoader({
                tableName: referencedTable
              });
              return await loader.load(relatedRecordId);
            };
            fieldConfigMap[columnName] = {
              type: isOptionalColumn(referenceColumn) ? entityTypes[referencedTable] : new GraphQLNonNull(entityTypes[referencedTable]),
              resolve: resolver
            };
          } else if (isManyColumn(column)) {
            const resolver = async (parent, args, context) => {
              const { where, orderBy, orderDirection, limit, after, before } = args;
              const whereObject = where ? buildWhereObject(where) : {};
              (whereObject[column[" referenceColumn"]] ??= {}).equals = parent.id;
              const orderByObject = orderBy ? { [orderBy]: orderDirection ?? "asc" } : void 0;
              const result = await context.store.findMany({
                tableName: column[" referenceTable"],
                where: whereObject,
                orderBy: orderByObject,
                limit,
                before,
                after
              });
              const loader = context.getLoader({
                tableName: column[" referenceTable"]
              });
              const ids = result.items.map((item) => item.id);
              const items = await loader.loadMany(ids);
              return { items, pageInfo: result.pageInfo };
            };
            fieldConfigMap[columnName] = {
              type: entityPageTypes[column[" referenceTable"]],
              args: {
                where: { type: entityFilterTypes[column[" referenceTable"]] },
                orderBy: { type: GraphQLString2 },
                orderDirection: { type: GraphQLString2 },
                before: { type: GraphQLString2 },
                after: { type: GraphQLString2 },
                limit: { type: GraphQLInt2 }
              },
              resolve: resolver
            };
          } else if (isJSONColumn(column)) {
            fieldConfigMap[columnName] = {
              type: isOptionalColumn(column) ? GraphQLJSON : new GraphQLNonNull(GraphQLJSON)
            };
          } else {
            const type = isEnumColumn(column) ? enumTypes[column[" enum"]] : SCALARS[column[" scalar"]];
            if (isListColumn(column)) {
              const listType = new GraphQLList2(new GraphQLNonNull(type));
              fieldConfigMap[columnName] = {
                type: isOptionalColumn(column) ? listType : new GraphQLNonNull(listType)
              };
            } else {
              fieldConfigMap[columnName] = {
                type: isOptionalColumn(column) ? type : new GraphQLNonNull(type)
              };
            }
          }
        });
        return fieldConfigMap;
      }
    });
    entityPageTypes[tableName] = new GraphQLObjectType({
      name: `${tableName}Page`,
      fields: () => ({
        items: {
          type: new GraphQLNonNull(
            new GraphQLList2(new GraphQLNonNull(entityTypes[tableName]))
          )
        },
        pageInfo: { type: new GraphQLNonNull(GraphQLPageInfo) }
      })
    });
  }
  return { entityTypes, entityPageTypes };
};

// src/server/graphql/enum.ts
import { GraphQLEnumType as GraphQLEnumType2 } from "graphql";
function buildEnumTypes({ schema }) {
  const enumTypes = {};
  for (const [enumName, _enum] of Object.entries(getEnums(schema))) {
    enumTypes[enumName] = new GraphQLEnumType2({
      name: enumName,
      values: _enum.reduce(
        (acc, cur) => ({ ...acc, [cur]: {} }),
        {}
      )
    });
  }
  return { enumTypes };
}

// src/server/graphql/plural.ts
import {
  GraphQLInt as GraphQLInt3,
  GraphQLNonNull as GraphQLNonNull2,
  GraphQLString as GraphQLString3
} from "graphql";
var buildPluralField = ({
  tableName,
  entityPageType,
  entityFilterType
}) => {
  const resolver = async (_, args, context) => {
    const { where, orderBy, orderDirection, before, limit, after } = args;
    const whereObject = where ? buildWhereObject(where) : {};
    const orderByObject = orderBy ? { [orderBy]: orderDirection || "asc" } : void 0;
    return await context.store.findMany({
      tableName,
      where: whereObject,
      orderBy: orderByObject,
      limit,
      before,
      after
    });
  };
  return {
    type: new GraphQLNonNull2(entityPageType),
    args: {
      where: { type: entityFilterType },
      orderBy: { type: GraphQLString3 },
      orderDirection: { type: GraphQLString3 },
      before: { type: GraphQLString3 },
      after: { type: GraphQLString3 },
      limit: { type: GraphQLInt3 }
    },
    resolve: resolver
  };
};

// src/server/graphql/singular.ts
import {
  GraphQLNonNull as GraphQLNonNull3
} from "graphql";
var buildSingularField = ({
  tableName,
  table,
  entityType
}) => {
  const resolver = async (_, args, context) => {
    const { id } = args;
    if (id === void 0)
      return null;
    const entityInstance = await context.store.findUnique({ tableName, id });
    return entityInstance;
  };
  return {
    type: entityType,
    args: {
      id: { type: new GraphQLNonNull3(SCALARS[table.id[" scalar"]]) }
    },
    resolve: resolver
  };
};

// src/server/graphql/buildGraphqlSchema.ts
var buildGraphqlSchema = (schema) => {
  const queryFields = {};
  const { enumTypes } = buildEnumTypes({ schema });
  const { entityFilterTypes } = buildEntityFilterTypes({ schema, enumTypes });
  const { entityTypes, entityPageTypes } = buildEntityTypes({
    schema,
    enumTypes,
    entityFilterTypes
  });
  for (const [tableName, { table }] of Object.entries(getTables(schema))) {
    const entityType = entityTypes[tableName];
    const entityPageType = entityPageTypes[tableName];
    const entityFilterType = entityFilterTypes[tableName];
    const singularFieldName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
    queryFields[singularFieldName] = buildSingularField({
      tableName,
      table,
      entityType
    });
    const pluralFieldName = `${singularFieldName}s`;
    queryFields[pluralFieldName] = buildPluralField({
      tableName,
      entityPageType,
      entityFilterType
    });
  }
  return new GraphQLSchema({
    query: new GraphQLObjectType3({
      name: "Query",
      fields: queryFields
    })
  });
};

// src/build/service.ts
import { glob } from "glob";
import { createServer } from "vite";
import { ViteNodeRunner } from "vite-node/client";
import { ViteNodeServer } from "vite-node/server";
import { installSourcemapsSupport } from "vite-node/source-map";
import { normalizeModuleId, toFilePath } from "vite-node/utils";
import viteTsconfigPathsPlugin from "vite-tsconfig-paths";

// src/build/configAndIndexingFunctions.ts
import path from "node:path";

// src/utils/duplicates.ts
function getDuplicateElements(arr) {
  const uniqueElements = /* @__PURE__ */ new Set();
  const duplicates = /* @__PURE__ */ new Set();
  arr.forEach((element) => {
    if (uniqueElements.has(element)) {
      duplicates.add(element);
    } else {
      uniqueElements.add(element);
    }
  });
  return duplicates;
}

// src/config/abi.ts
import {
  formatAbiItem
} from "abitype";
import {
  encodeEventTopics,
  getAbiItem,
  getEventSelector,
  getFunctionSelector,
  parseAbiItem
} from "viem";
var buildAbiEvents = ({ abi }) => {
  const abiEvents = abi.filter((item) => item.type === "event").filter((item) => item.anonymous === void 0 || item.anonymous === false);
  const overloadedEventNames = getDuplicateElements(
    abiEvents.map((item) => item.name)
  );
  return abiEvents.reduce(
    (acc, item) => {
      const signature = formatAbiItem(item);
      const safeName = overloadedEventNames.has(item.name) ? signature.split("event ")[1] : item.name;
      const selector = getEventSelector(item);
      const abiEventMeta = { safeName, signature, selector, item };
      acc.bySafeName[safeName] = abiEventMeta;
      acc.bySelector[selector] = abiEventMeta;
      return acc;
    },
    { bySafeName: {}, bySelector: {} }
  );
};
function buildTopics(abi, filter) {
  if (Array.isArray(filter.event)) {
    return [
      filter.event.map((event) => getEventSelector(findAbiEvent(abi, event)))
    ];
  } else {
    return encodeEventTopics({
      abi: [findAbiEvent(abi, filter.event)],
      args: filter.args
    });
  }
}
var findAbiEvent = (abi, eventName) => {
  if (eventName.includes("(")) {
    return parseAbiItem(`event ${eventName}`);
  } else {
    return getAbiItem({ abi, name: eventName });
  }
};
var buildAbiFunctions = ({ abi }) => {
  const abiFunctions = abi.filter(
    (item) => item.type === "function"
  );
  const overloadedFunctionNames = getDuplicateElements(
    abiFunctions.map((item) => item.name)
  );
  return abiFunctions.reduce(
    (acc, item) => {
      const signature = formatAbiItem(item);
      const safeName = overloadedFunctionNames.has(item.name) ? signature.split("function ")[1] : `${item.name}()`;
      const selector = getFunctionSelector(item);
      const abiEventMeta = { safeName, signature, selector, item };
      acc.bySafeName[safeName] = abiEventMeta;
      acc.bySelector[selector] = abiEventMeta;
      return acc;
    },
    { bySafeName: {}, bySelector: {} }
  );
};

// src/utils/lowercase.ts
function toLowerCase(value) {
  return value.toLowerCase();
}

// src/utils/offset.ts
import { InvalidAbiDecodingTypeError } from "viem";
function getBytesConsumedByParam(param) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, innerType] = arrayComponents;
    if (!length || hasDynamicChild(param)) {
      return 32;
    }
    const bytesConsumedByInnerType = getBytesConsumedByParam({
      ...param,
      type: innerType
    });
    return length * bytesConsumedByInnerType;
  }
  if (param.type === "tuple") {
    if (hasDynamicChild(param)) {
      return 32;
    }
    let consumed = 0;
    for (const component of param.components ?? []) {
      consumed += getBytesConsumedByParam(component);
    }
    return consumed;
  }
  if (param.type === "string" || param.type.startsWith("bytes") || param.type.startsWith("uint") || param.type.startsWith("int") || param.type === "address" || param.type === "bool") {
    return 32;
  }
  throw new InvalidAbiDecodingTypeError(param.type, {
    docsPath: "/docs/contract/decodeAbiParameters"
  });
}
function hasDynamicChild(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components?.some(hasDynamicChild);
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents && hasDynamicChild({ ...param, type: arrayComponents[1] }))
    return true;
  return false;
}
function getArrayComponents(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? (
    // Return `null` if the array is dynamic.
    [matches[2] ? Number(matches[2]) : null, matches[1]]
  ) : void 0;
}

// src/config/factories.ts
import { getEventSelector as getEventSelector2 } from "viem";
function buildChildAddressCriteria({
  address: _address,
  event,
  parameter
}) {
  const address = toLowerCase(_address);
  const eventSelector = getEventSelector2(event);
  const indexedInputPosition = event.inputs.filter((x) => "indexed" in x && x.indexed).findIndex((input) => input.name === parameter);
  if (indexedInputPosition > -1) {
    return {
      address,
      eventSelector,
      // Add 1 because inputs will not contain an element for topic0 (the signature).
      childAddressLocation: `topic${indexedInputPosition + 1}`
    };
  }
  const nonIndexedInputs = event.inputs.filter(
    (x) => !("indexed" in x && x.indexed)
  );
  const nonIndexedInputPosition = nonIndexedInputs.findIndex(
    (input) => input.name === parameter
  );
  if (nonIndexedInputPosition === -1) {
    throw new Error(
      `Factory event parameter not found in factory event signature. Got '${parameter}', expected one of [${event.inputs.map((i) => `'${i.name}'`).join(", ")}].`
    );
  }
  let offset = 0;
  for (let i = 0; i < nonIndexedInputPosition; i++) {
    offset += getBytesConsumedByParam(nonIndexedInputs[i]);
  }
  return {
    address,
    eventSelector,
    childAddressLocation: `offset${offset}`
  };
}

// src/utils/chains.ts
import * as _chains from "viem/chains";
var chains = _chains;

// src/config/networks.ts
function getDefaultMaxBlockRange({
  chainId,
  rpcUrls
}) {
  let maxBlockRange;
  switch (chainId) {
    case 1:
    case 3:
    case 4:
    case 5:
    case 42:
    case 11155111:
      maxBlockRange = 2e3;
      break;
    case 10:
    case 420:
      maxBlockRange = 5e4;
      break;
    case 137:
    case 80001:
      maxBlockRange = 5e4;
      break;
    case 42161:
    case 421613:
      maxBlockRange = 5e4;
      break;
    default:
      maxBlockRange = 5e4;
  }
  const isQuickNode = rpcUrls.filter((url) => url !== void 0).some((url) => url.includes("quiknode"));
  const isCloudflare = rpcUrls.filter((url) => url !== void 0).some((url) => url.includes("cloudflare-eth"));
  if (isQuickNode) {
    maxBlockRange = Math.min(maxBlockRange, 1e4);
  } else if (isCloudflare) {
    maxBlockRange = Math.min(maxBlockRange, 800);
  }
  return maxBlockRange;
}
function getFinalityBlockCount({ chainId }) {
  let finalityBlockCount;
  switch (chainId) {
    case 1:
    case 3:
    case 4:
    case 5:
    case 42:
    case 11155111:
      finalityBlockCount = 65;
      break;
    case 137:
    case 80001:
      finalityBlockCount = 200;
      break;
    case 42161:
    case 42170:
    case 421611:
    case 421613:
      finalityBlockCount = 240;
      break;
    default:
      finalityBlockCount = 30;
  }
  return finalityBlockCount;
}
async function getRpcUrlsForClient(parameters) {
  const { config, value } = parameters.transport({
    chain: parameters.chain,
    pollingInterval: 4e3,
    // default viem value
    retryCount: 0
  });
  const transport = { ...config, ...value };
  async function getRpcUrlsForTransport(transport2) {
    switch (transport2.type) {
      case "http": {
        return [transport2.url ?? parameters.chain.rpcUrls.default.http[0]];
      }
      case "webSocket": {
        try {
          const socket = await transport2.getSocket();
          return [socket.url];
        } catch (e) {
          const symbol = Object.getOwnPropertySymbols(e).find(
            (symbol2) => symbol2.toString() === "Symbol(kTarget)"
          );
          if (!symbol)
            return [];
          const url = e[symbol]?._url;
          if (!url)
            return [];
          return [url.replace(/\/$/, "")];
        }
      }
      case "fallback": {
        const fallbackTransports = transport2.transports.map((t) => ({
          ...t.config,
          ...t.value
        }));
        const urls = [];
        for (const fallbackTransport of fallbackTransports) {
          urls.push(...await getRpcUrlsForTransport(fallbackTransport));
        }
        return urls;
      }
      default: {
        return [];
      }
    }
  }
  return getRpcUrlsForTransport(transport);
}
var publicRpcUrls = void 0;
function isRpcUrlPublic(rpcUrl) {
  if (rpcUrl === void 0)
    return true;
  if (!publicRpcUrls) {
    publicRpcUrls = Object.values(chains).reduce((acc, chain) => {
      chain.rpcUrls.default.http.forEach((httpRpcUrl) => {
        acc.add(httpRpcUrl);
      });
      (chain.rpcUrls.default.webSocket ?? []).forEach((webSocketRpcUrl) => {
        acc.add(webSocketRpcUrl);
      });
      return acc;
    }, /* @__PURE__ */ new Set());
  }
  return publicRpcUrls.has(rpcUrl);
}

// src/config/sources.ts
var sourceIsLog = (source) => source.type === "log";
var sourceIsFactoryLog = (source) => source.type === "factoryLog";
var sourceIsCallTrace = (source) => source.type === "callTrace";
var sourceIsFactoryCallTrace = (source) => source.type === "factoryCallTrace";
var sourceIsBlock = (source) => source.type === "block";

// ../common/src/promiseWithResolvers.ts
var promiseWithResolvers = () => {
  let resolve2;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve2 = _resolve;
    reject = _reject;
  });
  return { resolve: resolve2, reject, promise };
};

// ../common/src/debounce.ts
function debounce(ms, fn) {
  let args;
  let timeoutSet = false;
  let timeout;
  return {
    call: (..._args) => {
      args = _args;
      if (!timeoutSet) {
        timeoutSet = true;
        timeout = setTimeout(() => {
          timeoutSet = false;
          fn(...args);
        }, ms);
      }
    },
    cancel: () => {
      clearTimeout(timeout);
    }
  };
}

// ../common/src/dedupe.ts
function dedupe(arr, getId) {
  const seen = /* @__PURE__ */ new Set();
  return arr.filter((x) => {
    if (seen.has(getId ? getId(x) : x))
      return false;
    seen.add(x);
    return true;
  });
}
dedupe(
  [
    { a: 1, b: 2 },
    { a: 1, b: 2 },
    { a: 2, b: 2 }
  ],
  (e) => `${e.a}_${e.b}`
);

// ../common/src/queue.ts
var validateParameters = ({
  concurrency,
  frequency
}) => {
  if (concurrency === void 0 && frequency === void 0) {
    throw Error(
      "Invalid queue configuration, must specify either 'concurrency' or 'frequency'."
    );
  }
  if (concurrency !== void 0 && concurrency <= 0) {
    throw Error(
      `Invalid value for queue 'concurrency' option. Got ${concurrency}, expected a number greater than zero.`
    );
  }
  if (frequency !== void 0 && frequency <= 0) {
    throw Error(
      `Invalid value for queue 'frequency' option. Got ${frequency}, expected a number greater than zero.`
    );
  }
};
var createQueue = ({
  worker,
  initialStart = false,
  browser = true,
  ..._parameters
}) => {
  validateParameters(_parameters);
  const parameters = _parameters;
  let queue = new Array();
  let pending = 0;
  let timestamp = 0;
  let requests = 0;
  let isStarted = initialStart;
  let timer;
  let emptyPromiseWithResolvers = void 0;
  let idlePromiseWithResolvers = void 0;
  const next = () => {
    if (!isStarted)
      return;
    const _timestamp = Date.now();
    if (Math.floor(_timestamp / 1e3) !== timestamp) {
      requests = 0;
      timestamp = Math.floor(_timestamp / 1e3);
    }
    if (timer)
      return;
    while ((parameters.frequency !== void 0 ? requests < parameters.frequency : true) && (parameters.concurrency !== void 0 ? pending < parameters.concurrency : true) && queue.length > 0) {
      const { task, resolve: resolve2, reject } = queue.shift();
      requests++;
      pending++;
      worker(task).then(resolve2).catch(reject).finally(() => {
        pending--;
        if (idlePromiseWithResolvers !== void 0 && queue.length === 0 && pending === 0) {
          idlePromiseWithResolvers.resolve();
          idlePromiseWithResolvers.completed = true;
        }
        browser ? next() : process.nextTick(next);
      });
      if (emptyPromiseWithResolvers !== void 0 && queue.length === 0) {
        emptyPromiseWithResolvers.resolve();
        emptyPromiseWithResolvers.completed = true;
      }
    }
    if (parameters.frequency !== void 0 && requests >= parameters.frequency) {
      timer = setTimeout(
        () => {
          timer = void 0;
          next();
        },
        1e3 - _timestamp % 1e3
      );
      return;
    }
  };
  return {
    size: () => queue.length,
    pending: () => {
      if (browser) {
        return new Promise(
          (resolve2) => setTimeout(() => resolve2(pending))
        );
      } else {
        return new Promise(
          (resolve2) => setImmediate(() => resolve2(pending))
        );
      }
    },
    add: (task) => {
      const { promise, resolve: resolve2, reject } = promiseWithResolvers();
      queue.push({ task, resolve: resolve2, reject });
      next();
      return promise;
    },
    clear: () => {
      queue = new Array();
      clearTimeout(timer);
      timer = void 0;
    },
    isStarted: () => isStarted,
    start: () => {
      if (browser) {
        return new Promise(
          (resolve2) => setTimeout(() => resolve2(pending))
        ).then(() => {
          isStarted = true;
          next();
        });
      } else {
        return new Promise(
          (resolve2) => process.nextTick(() => resolve2(pending))
        ).then(() => {
          isStarted = true;
          next();
        });
      }
    },
    pause: () => {
      isStarted = false;
    },
    onIdle: () => {
      if (idlePromiseWithResolvers === void 0 || idlePromiseWithResolvers.completed) {
        if (queue.length === 0 && pending === 0)
          return Promise.resolve();
        idlePromiseWithResolvers = {
          ...promiseWithResolvers(),
          completed: false
        };
      }
      return idlePromiseWithResolvers.promise;
    },
    onEmpty: () => {
      if (emptyPromiseWithResolvers === void 0 || emptyPromiseWithResolvers.completed) {
        if (queue.length === 0)
          return Promise.resolve();
        emptyPromiseWithResolvers = {
          ...promiseWithResolvers(),
          completed: false
        };
      }
      return emptyPromiseWithResolvers.promise;
    },
    setParameters: (_parameters2) => {
      validateParameters(_parameters2);
      if ("frequency" in _parameters2) {
        parameters.frequency = _parameters2.frequency;
      }
      if ("concurrency" in _parameters2) {
        parameters.concurrency = _parameters2.concurrency;
      }
    }
  };
};

// src/build/configAndIndexingFunctions.ts
import parse from "pg-connection-string";
async function buildConfigAndIndexingFunctions({
  config,
  rawIndexingFunctions,
  options: { rootDir, ponderDir }
}) {
  const logs = [];
  let databaseConfig;
  const sqliteDir = path.join(ponderDir, "sqlite");
  const sqlitePrintPath = path.relative(rootDir, sqliteDir);
  if (config.database?.kind) {
    if (config.database.kind === "postgres") {
      let connectionString = void 0;
      let source = void 0;
      if (config.database.connectionString) {
        connectionString = config.database.connectionString;
        source = "from ponder.config.ts";
      } else if (process.env.DATABASE_PRIVATE_URL) {
        connectionString = process.env.DATABASE_PRIVATE_URL;
        source = "from DATABASE_PRIVATE_URL env var";
      } else if (process.env.DATABASE_URL) {
        connectionString = process.env.DATABASE_URL;
        source = "from DATABASE_URL env var";
      } else {
        throw new Error(
          `Invalid database configuration: 'kind' is set to 'postgres' but no connection string was provided.`
        );
      }
      logs.push({
        level: "info",
        msg: `Using Postgres database '${getDatabaseName(
          connectionString
        )}' (${source})`
      });
      let schema = void 0;
      if (config.database.schema) {
        schema = config.database.schema;
        source = "from ponder.config.ts";
      } else if (process.env.RAILWAY_DEPLOYMENT_ID) {
        if (process.env.RAILWAY_SERVICE_NAME === void 0) {
          throw new Error(
            "Invalid database configuration: RAILWAY_DEPLOYMENT_ID env var is defined, but RAILWAY_SERVICE_NAME env var is not."
          );
        }
        schema = `${process.env.RAILWAY_SERVICE_NAME}_${process.env.RAILWAY_DEPLOYMENT_ID.slice(0, 8)}`;
        source = "from RAILWAY_DEPLOYMENT_ID env var";
      } else {
        schema = "public";
        source = "default";
      }
      logs.push({
        level: "info",
        msg: `Using '${schema}' database schema for indexed tables (${source})`
      });
      let publishSchema = void 0;
      if (config.database.publishSchema !== void 0) {
        publishSchema = config.database.publishSchema;
        source = "from ponder.config.ts";
      } else if (process.env.RAILWAY_DEPLOYMENT_ID !== void 0) {
        publishSchema = "public";
        source = "default for Railway deployment";
      }
      if (publishSchema !== void 0) {
        logs.push({
          level: "info",
          msg: `Using '${publishSchema}' database schema for published views (${source})`
        });
      } else {
        logs.push({
          level: "debug",
          msg: "Will not publish views (publish schema was not set in ponder.config.ts)"
        });
      }
      if (schema !== void 0 && schema === publishSchema) {
        throw new Error(
          `Invalid database configuration: 'publishSchema' cannot be the same as 'schema' ('${schema}').`
        );
      }
      const poolConfig = {
        max: config.database.poolConfig?.max ?? 30,
        connectionString
      };
      databaseConfig = {
        kind: "postgres",
        poolConfig,
        schema,
        publishSchema
      };
    } else {
      logs.push({
        level: "info",
        msg: `Using SQLite database in '${sqlitePrintPath}' (from ponder.config.ts)`
      });
      databaseConfig = { kind: "sqlite", directory: sqliteDir };
    }
  } else {
    let connectionString = void 0;
    let source = void 0;
    if (process.env.DATABASE_PRIVATE_URL) {
      connectionString = process.env.DATABASE_PRIVATE_URL;
      source = "from DATABASE_PRIVATE_URL env var";
    } else if (process.env.DATABASE_URL) {
      connectionString = process.env.DATABASE_URL;
      source = "from DATABASE_URL env var";
    }
    if (connectionString !== void 0) {
      logs.push({
        level: "info",
        msg: `Using Postgres database ${getDatabaseName(
          connectionString
        )} (${source})`
      });
      let schema = void 0;
      if (process.env.RAILWAY_DEPLOYMENT_ID !== void 0) {
        schema = process.env.RAILWAY_DEPLOYMENT_ID;
        if (process.env.RAILWAY_SERVICE_NAME === void 0) {
          throw new Error(
            "Invalid database configuration: RAILWAY_DEPLOYMENT_ID env var is defined, but RAILWAY_SERVICE_NAME env var is not."
          );
        }
        schema = `${process.env.RAILWAY_SERVICE_NAME}_${process.env.RAILWAY_DEPLOYMENT_ID.slice(0, 8)}`;
        source = "from RAILWAY_DEPLOYMENT_ID env var";
      } else {
        schema = "public";
        source = "default";
      }
      logs.push({
        level: "info",
        msg: `Using '${schema}' database schema for indexed tables (${source})`
      });
      let publishSchema = void 0;
      if (process.env.RAILWAY_DEPLOYMENT_ID !== void 0) {
        publishSchema = "public";
        source = "default for Railway deployment";
      }
      if (publishSchema !== void 0) {
        logs.push({
          level: "info",
          msg: `Using '${publishSchema}' database schema for published views (${source})`
        });
      } else {
        logs.push({
          level: "debug",
          msg: "Will not publish views (publish schema was not set in ponder.config.ts)"
        });
      }
      if (schema !== void 0 && schema === publishSchema) {
        throw new Error(
          `Invalid database configuration: 'publishSchema' cannot be the same as 'schema' ('${schema}').`
        );
      }
      const poolConfig = { max: 30, connectionString };
      databaseConfig = {
        kind: "postgres",
        poolConfig,
        schema,
        publishSchema
      };
    } else {
      logs.push({
        level: "info",
        msg: `Using SQLite database at ${sqlitePrintPath} (default)`
      });
      databaseConfig = { kind: "sqlite", directory: sqliteDir };
    }
  }
  const networks = await Promise.all(
    Object.entries(config.networks).map(async ([networkName, network]) => {
      const { chainId, transport } = network;
      const defaultChain = Object.values(chains).find(
        (c) => "id" in c ? c.id === chainId : false
      ) ?? chains.mainnet;
      const chain = { ...defaultChain, name: networkName, id: chainId };
      const rpcUrls = await getRpcUrlsForClient({ transport, chain });
      rpcUrls.forEach((rpcUrl) => {
        if (isRpcUrlPublic(rpcUrl)) {
          logs.push({
            level: "warn",
            msg: `Network '${networkName}' is using a public RPC URL (${rpcUrl}). Most apps require an RPC URL with a higher rate limit.`
          });
        }
      });
      return {
        name: networkName,
        chainId,
        chain,
        transport: network.transport({ chain }),
        maxRequestsPerSecond: network.maxRequestsPerSecond ?? 50,
        pollingInterval: network.pollingInterval ?? 1e3,
        defaultMaxBlockRange: getDefaultMaxBlockRange({ chainId, rpcUrls }),
        finalityBlockCount: getFinalityBlockCount({ chainId }),
        maxHistoricalTaskConcurrency: network.maxHistoricalTaskConcurrency ?? 20
      };
    })
  );
  let indexingFunctionCount = 0;
  const indexingFunctions = {};
  for (const { name: eventName, fn } of rawIndexingFunctions) {
    const eventNameComponents = eventName.includes(".") ? eventName.split(".") : eventName.split(":");
    const [sourceName, sourceEventName] = eventNameComponents;
    if (eventNameComponents.length !== 2 || !sourceName || !sourceEventName) {
      throw new Error(
        `Validation failed: Invalid event '${eventName}', expected format '{sourceName}:{eventName}' or '{sourceName}.{eventName}'.`
      );
    }
    if (eventName in indexingFunctions) {
      throw new Error(
        `Validation failed: Multiple indexing functions registered for event '${eventName}'.`
      );
    }
    const matchedSourceName = Object.keys({
      ...config.contracts ?? {},
      ...config.blocks ?? {}
    }).find((_sourceName) => _sourceName === sourceName);
    if (!matchedSourceName) {
      const uniqueSourceNames = dedupe(
        Object.keys({ ...config.contracts ?? {}, ...config.blocks ?? {} })
      );
      throw new Error(
        `Validation failed: Invalid source name '${sourceName}'. Got '${sourceName}', expected one of [${uniqueSourceNames.map((n) => `'${n}'`).join(", ")}].`
      );
    }
    indexingFunctions[eventName] = fn;
    indexingFunctionCount += 1;
  }
  if (indexingFunctionCount === 0) {
    logs.push({ level: "warn", msg: "No indexing functions were registered." });
  }
  const contractSources = Object.entries(config.contracts ?? {}).flatMap(([contractName, contract]) => {
    if (contract.network === null || contract.network === void 0) {
      throw new Error(
        `Validation failed: Network for contract '${contractName}' is null or undefined. Expected one of [${networks.map((n) => `'${n.name}'`).join(", ")}].`
      );
    }
    const startBlockMaybeNan = contract.startBlock ?? 0;
    const startBlock = Number.isNaN(startBlockMaybeNan) ? 0 : startBlockMaybeNan;
    const endBlockMaybeNan = contract.endBlock;
    const endBlock = Number.isNaN(endBlockMaybeNan) ? void 0 : endBlockMaybeNan;
    if (typeof contract.network === "string") {
      return {
        id: `log_${contractName}_${contract.network}`,
        contractName,
        networkName: contract.network,
        abi: contract.abi,
        address: "address" in contract ? contract.address : void 0,
        factory: "factory" in contract ? contract.factory : void 0,
        filter: contract.filter,
        includeTransactionReceipts: contract.includeTransactionReceipts ?? false,
        includeCallTraces: contract.includeCallTraces ?? false,
        startBlock,
        endBlock,
        maxBlockRange: contract.maxBlockRange
      };
    }
    return Object.entries(contract.network).filter((n) => !!n[1]).map(([networkName, overrides]) => {
      const startBlockMaybeNan2 = overrides.startBlock ?? contract.startBlock ?? 0;
      const startBlock2 = Number.isNaN(startBlockMaybeNan2) ? 0 : startBlockMaybeNan2;
      const endBlockMaybeNan2 = overrides.endBlock ?? contract.endBlock;
      const endBlock2 = Number.isNaN(endBlockMaybeNan2) ? void 0 : endBlockMaybeNan2;
      return {
        contractName,
        networkName,
        abi: contract.abi,
        address: ("address" in overrides ? overrides?.address : void 0) ?? ("address" in contract ? contract.address : void 0),
        factory: ("factory" in overrides ? overrides.factory : void 0) ?? ("factory" in contract ? contract.factory : void 0),
        filter: overrides.filter ?? contract.filter,
        includeTransactionReceipts: overrides.includeTransactionReceipts ?? contract.includeTransactionReceipts ?? false,
        includeCallTraces: overrides.includeCallTraces ?? contract.includeCallTraces ?? false,
        startBlock: startBlock2,
        endBlock: endBlock2,
        maxBlockRange: overrides.maxBlockRange ?? contract.maxBlockRange
      };
    });
  }).flatMap(
    (rawContract) => {
      const network = networks.find(
        (n) => n.name === rawContract.networkName
      );
      if (!network) {
        throw new Error(
          `Validation failed: Invalid network for contract '${rawContract.contractName}'. Got '${rawContract.networkName}', expected one of [${networks.map((n) => `'${n.name}'`).join(", ")}].`
        );
      }
      const registeredLogEvents = [];
      const registeredCallTraceEvents = [];
      for (const eventName of Object.keys(indexingFunctions)) {
        if (eventName.includes(":")) {
          const [logContractName, logEventName] = eventName.split(":");
          if (logContractName === rawContract.contractName && logEventName !== "setup") {
            registeredLogEvents.push(logEventName);
          }
        }
        if (eventName.includes(".")) {
          const [functionContractName, functionName] = eventName.split(".");
          if (functionContractName === rawContract.contractName) {
            registeredCallTraceEvents.push(functionName);
          }
        }
      }
      const abiEvents = buildAbiEvents({ abi: rawContract.abi });
      const abiFunctions = buildAbiFunctions({ abi: rawContract.abi });
      const registeredEventSelectors = [];
      for (const logEvent of registeredLogEvents) {
        const abiEvent = abiEvents.bySafeName[logEvent];
        if (abiEvent === void 0) {
          throw new Error(
            `Validation failed: Event name for event '${logEvent}' not found in the contract ABI. Got '${logEvent}', expected one of [${Object.keys(
              abiEvents.bySafeName
            ).map((eventName) => `'${eventName}'`).join(", ")}].`
          );
        }
        registeredEventSelectors.push(abiEvent.selector);
      }
      const registeredFunctionSelectors = [];
      for (const _function of registeredCallTraceEvents) {
        const abiFunction = abiFunctions.bySafeName[_function];
        if (abiFunction === void 0) {
          throw new Error(
            `Validation failed: Function name for function '${_function}' not found in the contract ABI. Got '${_function}', expected one of [${Object.keys(
              abiFunctions.bySafeName
            ).map((eventName) => `'${eventName}'`).join(", ")}].`
          );
        }
        registeredFunctionSelectors.push(abiFunction.selector);
      }
      let topics = [registeredEventSelectors];
      if (rawContract.filter !== void 0) {
        if (Array.isArray(rawContract.filter.event) && rawContract.filter.args !== void 0) {
          throw new Error(
            `Validation failed: Event filter for contract '${rawContract.contractName}' cannot contain indexed argument values if multiple events are provided.`
          );
        }
        const filterSafeEventNames = Array.isArray(rawContract.filter.event) ? rawContract.filter.event : [rawContract.filter.event];
        for (const filterSafeEventName of filterSafeEventNames) {
          const abiEvent = abiEvents.bySafeName[filterSafeEventName];
          if (!abiEvent) {
            throw new Error(
              `Validation failed: Invalid filter for contract '${rawContract.contractName}'. Got event name '${filterSafeEventName}', expected one of [${Object.keys(
                abiEvents.bySafeName
              ).map((n) => `'${n}'`).join(", ")}].`
            );
          }
        }
        const [topic0FromFilter, ...topicsFromFilter] = buildTopics(
          rawContract.abi,
          rawContract.filter
        );
        const filteredEventSelectors = Array.isArray(topic0FromFilter) ? topic0FromFilter : [topic0FromFilter];
        for (const registeredEventSelector of registeredEventSelectors) {
          if (!filteredEventSelectors.includes(registeredEventSelector)) {
            const logEventName = abiEvents.bySelector[registeredEventSelector].safeName;
            throw new Error(
              `Validation failed: Event '${logEventName}' is excluded by the event filter defined on the contract '${rawContract.contractName}'. Got '${logEventName}', expected one of [${filteredEventSelectors.map((s) => abiEvents.bySelector[s].safeName).map((eventName) => `'${eventName}'`).join(", ")}].`
            );
          }
        }
        topics = [registeredEventSelectors, ...topicsFromFilter];
      }
      const baseContract = {
        contractName: rawContract.contractName,
        networkName: rawContract.networkName,
        chainId: network.chainId,
        abi: rawContract.abi,
        startBlock: rawContract.startBlock,
        endBlock: rawContract.endBlock,
        maxBlockRange: rawContract.maxBlockRange
      };
      const resolvedFactory = rawContract?.factory;
      const resolvedAddress = rawContract?.address;
      if (resolvedFactory !== void 0 && resolvedAddress !== void 0) {
        throw new Error(
          `Validation failed: Contract '${baseContract.contractName}' cannot specify both 'factory' and 'address' options.`
        );
      }
      if (resolvedFactory) {
        const childAddressCriteria = buildChildAddressCriteria(resolvedFactory);
        const factoryLogSource = {
          ...baseContract,
          id: `log_${rawContract.contractName}_${rawContract.networkName}`,
          type: "factoryLog",
          abiEvents,
          criteria: {
            ...childAddressCriteria,
            includeTransactionReceipts: rawContract.includeTransactionReceipts,
            topics
          }
        };
        if (rawContract.includeCallTraces) {
          return [
            factoryLogSource,
            {
              ...baseContract,
              id: `callTrace_${rawContract.contractName}_${rawContract.networkName}`,
              type: "factoryCallTrace",
              abiFunctions,
              criteria: {
                ...childAddressCriteria,
                functionSelectors: registeredFunctionSelectors,
                includeTransactionReceipts: rawContract.includeTransactionReceipts
              }
            }
          ];
        }
        return [factoryLogSource];
      }
      const validatedAddress = Array.isArray(resolvedAddress) ? resolvedAddress.map((r) => toLowerCase(r)) : resolvedAddress ? toLowerCase(resolvedAddress) : void 0;
      if (validatedAddress !== void 0) {
        for (const address of Array.isArray(validatedAddress) ? validatedAddress : [validatedAddress]) {
          if (!address.startsWith("0x"))
            throw new Error(
              `Validation failed: Invalid prefix for address '${address}'. Got '${address.slice(
                0,
                2
              )}', expected '0x'.`
            );
          if (address.length !== 42)
            throw new Error(
              `Validation failed: Invalid length for address '${address}'. Got ${address.length}, expected 42 characters.`
            );
        }
      }
      const logSource = {
        ...baseContract,
        id: `log_${rawContract.contractName}_${rawContract.networkName}`,
        type: "log",
        abiEvents,
        criteria: {
          address: validatedAddress,
          topics,
          includeTransactionReceipts: rawContract.includeTransactionReceipts
        }
      };
      if (rawContract.includeCallTraces) {
        return [
          logSource,
          {
            ...baseContract,
            id: `callTrace_${rawContract.contractName}_${rawContract.networkName}`,
            type: "callTrace",
            abiFunctions,
            criteria: {
              toAddress: Array.isArray(validatedAddress) ? validatedAddress : validatedAddress === void 0 ? void 0 : [validatedAddress],
              functionSelectors: registeredFunctionSelectors,
              includeTransactionReceipts: rawContract.includeTransactionReceipts
            }
          }
        ];
      } else
        return [logSource];
    }
  ).filter((source) => {
    const hasRegisteredIndexingFunctions = sourceIsCallTrace(source) || sourceIsFactoryCallTrace(source) ? source.criteria.functionSelectors.length !== 0 : source.criteria.topics[0]?.length !== 0;
    if (!hasRegisteredIndexingFunctions) {
      logs.push({
        level: "debug",
        msg: `No indexing functions were registered for '${source.contractName}' ${sourceIsCallTrace(source) ? "call traces" : "logs"}`
      });
    }
    return hasRegisteredIndexingFunctions;
  });
  const blockSources = Object.entries(config.blocks ?? {}).flatMap(([sourceName, blockSourceConfig]) => {
    const startBlockMaybeNan = blockSourceConfig.startBlock ?? 0;
    const startBlock = Number.isNaN(startBlockMaybeNan) ? 0 : startBlockMaybeNan;
    const endBlockMaybeNan = blockSourceConfig.endBlock;
    const endBlock = Number.isNaN(endBlockMaybeNan) ? void 0 : endBlockMaybeNan;
    const intervalMaybeNan = blockSourceConfig.interval;
    const interval = Number.isNaN(intervalMaybeNan) ? 0 : intervalMaybeNan;
    if (!Number.isInteger(interval) || interval === 0) {
      throw Error(
        `Validation failed: Invalid interval for block source '${sourceName}'. Got ${interval}, expected a non-zero integer.`
      );
    }
    if (typeof blockSourceConfig.network === "string") {
      const network = networks.find(
        (n) => n.name === blockSourceConfig.network
      );
      if (!network) {
        throw new Error(
          `Validation failed: Invalid network for block source '${sourceName}'. Got '${blockSourceConfig.network}', expected one of [${networks.map((n) => `'${n.name}'`).join(", ")}].`
        );
      }
      return {
        type: "block",
        id: `block_${sourceName}_${blockSourceConfig.network}`,
        sourceName,
        networkName: blockSourceConfig.network,
        chainId: network.chainId,
        startBlock,
        endBlock,
        criteria: {
          interval,
          offset: startBlock % interval
        }
      };
    }
    return Object.entries(blockSourceConfig.network).filter((n) => !!n[1]).map(([networkName, overrides]) => {
      const network = networks.find((n) => n.name === networkName);
      if (!network) {
        throw new Error(
          `Validation failed: Invalid network for block source '${sourceName}'. Got '${networkName}', expected one of [${networks.map((n) => `'${n.name}'`).join(", ")}].`
        );
      }
      const startBlockMaybeNan2 = overrides.startBlock ?? blockSourceConfig.startBlock ?? 0;
      const startBlock2 = Number.isNaN(startBlockMaybeNan2) ? 0 : startBlockMaybeNan2;
      const endBlockMaybeNan2 = overrides.endBlock ?? blockSourceConfig.endBlock;
      const endBlock2 = Number.isNaN(endBlockMaybeNan2) ? void 0 : endBlockMaybeNan2;
      const intervalMaybeNan2 = overrides.interval ?? blockSourceConfig.interval;
      const interval2 = Number.isNaN(intervalMaybeNan2) ? 0 : intervalMaybeNan2;
      if (!Number.isInteger(interval2) || interval2 === 0) {
        throw Error(
          `Validation failed: Invalid interval for block source '${sourceName}'. Got ${interval2}, expected a non-zero integer.`
        );
      }
      return {
        type: "block",
        id: `block_${sourceName}_${networkName}`,
        sourceName,
        networkName,
        chainId: network.chainId,
        startBlock: startBlock2,
        endBlock: endBlock2,
        criteria: {
          interval: interval2,
          offset: startBlock2 % interval2
        }
      };
    });
  }).filter((blockSource) => {
    const hasRegisteredIndexingFunction = indexingFunctions[`${blockSource.sourceName}:block`] !== void 0;
    if (!hasRegisteredIndexingFunction) {
      logs.push({
        level: "debug",
        msg: `No indexing functions were registered for '${blockSource.sourceName}' blocks`
      });
    }
    return hasRegisteredIndexingFunction;
  });
  const sources = [...contractSources, ...blockSources];
  const networksWithSources = networks.filter((network) => {
    const hasSources = sources.some(
      (source) => source.networkName === network.name
    );
    if (!hasSources) {
      logs.push({
        level: "warn",
        msg: `No sources registered for network '${network.name}'`
      });
    }
    return hasSources;
  });
  const optionsConfig = {};
  if (config.options?.maxHealthcheckDuration !== void 0) {
    optionsConfig.maxHealthcheckDuration = config.options.maxHealthcheckDuration;
    logs.push({
      level: "info",
      msg: `Set max healthcheck duration to ${optionsConfig.maxHealthcheckDuration} seconds (from ponder.config.ts)`
    });
  }
  return {
    databaseConfig,
    optionsConfig,
    networks: networksWithSources,
    sources,
    indexingFunctions,
    logs
  };
}
async function safeBuildConfigAndIndexingFunctions({
  config,
  rawIndexingFunctions,
  options
}) {
  try {
    const result = await buildConfigAndIndexingFunctions({
      config,
      rawIndexingFunctions,
      options
    });
    return {
      status: "success",
      sources: result.sources,
      networks: result.networks,
      indexingFunctions: result.indexingFunctions,
      databaseConfig: result.databaseConfig,
      optionsConfig: result.optionsConfig,
      logs: result.logs
    };
  } catch (error_) {
    const error = error_;
    return { status: "error", error };
  }
}
function getDatabaseName(connectionString) {
  const parsed = parse(connectionString);
  return `${parsed.host}:${parsed.port}/${parsed.database}`;
}

// src/build/plugin.ts
import MagicString from "magic-string";
var regex = /^import\s+\{[^}]*\bponder\b[^}]*\}\s+from\s+["']@\/generated["'];?.*$/gm;
var shim = `export let ponder = {
  fns: [],
  on(name, fn) {
    this.fns.push({ name, fn });
  },
};
`;
function replaceStateless(code) {
  const s = new MagicString(code);
  regex.lastIndex = 0;
  s.replace(regex, shim);
  return s;
}
var vitePluginPonder = () => {
  return {
    name: "ponder",
    transform: (code, id) => {
      if (regex.test(code)) {
        const s = replaceStateless(code);
        const transformed = s.toString();
        const sourcemap = s.generateMap({ source: id });
        return { code: transformed, map: sourcemap };
      } else {
        return null;
      }
    }
  };
};

// src/build/schema.ts
var buildSchema = ({ schema }) => {
  const logs = [];
  Object.entries(getEnums(schema)).forEach(([name, _enum]) => {
    validateTableOrColumnName(name, "Enum");
    const enumValues = /* @__PURE__ */ new Set();
    for (const enumValue of _enum) {
      if (enumValues.has(enumValue)) {
        throw new Error(
          `Validation failed: Enum '${name}' contains duplicate value '${enumValue}'.`
        );
      }
      enumValues.add(enumValue);
    }
  });
  Object.entries(getTables(schema)).forEach(
    ([tableName, { table, constraints }]) => {
      validateTableOrColumnName(tableName, "Table");
      if (table.id === void 0)
        throw new Error(
          `Validation failed: Table '${tableName}' does not have an 'id' column.`
        );
      if (isJSONColumn(table.id))
        throw new Error(
          `Validation failed: Invalid type for ID column '${tableName}.id'. Got 'json', expected one of ['string', 'hex', 'bigint', 'int'].`
        );
      if (isEnumColumn(table.id))
        throw new Error(
          `Validation failed: Invalid type for ID column '${tableName}.id'. Got 'enum', expected one of ['string', 'hex', 'bigint', 'int'].`
        );
      if (isOneColumn(table.id))
        throw new Error(
          `Validation failed: Invalid type for ID column '${tableName}.id'. Got 'one', expected one of ['string', 'hex', 'bigint', 'int'].`
        );
      if (isManyColumn(table.id))
        throw new Error(
          `Validation failed: Invalid type for ID column '${tableName}.id'. Got 'many', expected one of ['string', 'hex', 'bigint', 'int'].`
        );
      if (isReferenceColumn(table.id))
        throw new Error(
          `Validation failed: Invalid type for ID column '${tableName}.id'. ID columns cannot use the '.references' modifier.`
        );
      if (table.id[" scalar"] !== "bigint" && table.id[" scalar"] !== "string" && table.id[" scalar"] !== "hex" && table.id[" scalar"] !== "int")
        throw new Error(
          `Validation failed: Invalid type for ID column '${tableName}.id'. Got '${table.id[" scalar"]}', expected one of ['string', 'hex', 'bigint', 'int'].`
        );
      if (isOptionalColumn(table.id))
        throw new Error(
          `Validation failed: Invalid type for ID column '${tableName}.id'. ID columns cannot be optional.`
        );
      if (isListColumn(table.id))
        throw new Error(
          `Validation failed: Invalid type for ID column '${tableName}.id'. ID columns cannot be a list.`
        );
      Object.entries(table).forEach(([columnName, column]) => {
        if (columnName === "id")
          return;
        validateTableOrColumnName(columnName, "Column");
        if (isOneColumn(column)) {
          const usedColumn = Object.entries(table).find(
            ([c]) => c === column[" reference"]
          );
          if (usedColumn === void 0) {
            const otherColumns = Object.keys(table).filter(
              (c) => c !== columnName
            );
            throw new Error(
              `Validation failed. Relationship column '${tableName}.${columnName}' uses a column that does not exist. Got '${column[" reference"]}', expected one of [${otherColumns.map((c) => `'${c}'`).join(", ")}].`
            );
          }
          if (!isReferenceColumn(usedColumn[1])) {
            const foreignKeyColumns = Object.keys(table).filter(
              (c) => c !== columnName && isReferenceColumn(table[c])
            );
            throw new Error(
              `Validation failed. Relationship column '${tableName}.${columnName}' uses a column that is not foreign key column. Got '${column[" reference"]}', expected one of [${foreignKeyColumns.map((c) => `'${c}'`).join(", ")}].`
            );
          }
        }
        if (isManyColumn(column)) {
          const usedTable = Object.entries(getTables(schema)).find(
            ([name]) => name === column[" referenceTable"]
          );
          if (usedTable === void 0) {
            const otherTables = Object.keys(getTables(schema)).filter(
              (t) => t !== tableName
            );
            throw new Error(
              `Validation failed. Relationship column '${tableName}.${columnName}' uses a table that does not exist. Got '${column[" referenceTable"]}', expected one of [${otherTables.map((t) => `'${t}'`).join(", ")}].`
            );
          }
          const usedTableColumns = Object.entries(usedTable[1].table);
          const usedColumn = usedTableColumns.find(
            ([columnName2]) => columnName2 === column[" referenceColumn"]
          );
          if (usedColumn === void 0) {
            throw new Error(
              `Validation failed. Relationship column '${tableName}.${columnName}' uses a column that does not exist. Got '${column[" referenceTable"]}.${column[" referenceTable"]}', expected one of [${usedTableColumns.map((c) => `'${usedTable[0]}.${c}'`).join(", ")}].`
            );
          }
          if (!isReferenceColumn(usedColumn[1])) {
            const foreignKeyColumnNames = usedTableColumns.filter(
              ([, c]) => isReferenceColumn(c)
            );
            throw new Error(
              `Validation failed. Relationship column '${tableName}.${columnName}' uses a column that is not foreign key column. Got '${column[" referenceTable"]}.${column[" referenceTable"]}', expected one of [${foreignKeyColumnNames.map((c) => `'${usedTable[0]}.${c}'`).join(", ")}].`
            );
          }
        }
        if (isEnumColumn(column)) {
          const referencedEnum = Object.entries(getEnums(schema)).find(
            ([enumName]) => enumName === column[" enum"]
          );
          if (referencedEnum === void 0) {
            throw new Error(
              `Validation failed: Enum column '${tableName}.${columnName}' doesn't reference a valid enum. Got '${column[" enum"]}', expected one of [${Object.keys(getEnums(schema)).map((e) => `'${e}'`).join(", ")}].`
            );
          }
        }
        if (isReferenceColumn(column)) {
          const referencedTable = Object.entries(getTables(schema)).find(
            ([tableName2]) => tableName2 === extractReferenceTable(column)
          );
          if (referencedTable === void 0) {
            throw new Error(
              `Validation failed: Foreign key column '${tableName}.${columnName}' does not reference a valid ID column. Got '${extractReferenceTable(
                column
              )}', expected one of [${Object.keys(getTables(schema)).map((t) => `'${t}.id'`).join(", ")}].`
            );
          }
          if (referencedTable[1].table.id[" scalar"] !== column[" scalar"]) {
            throw new Error(
              `Validation failed: Foreign key column '${tableName}.${columnName}' type does not match the referenced table's ID column type. Got '${column[" scalar"]}', expected '${referencedTable[1].table.id[" scalar"]}'.`
            );
          }
        }
      });
      if (constraints === void 0)
        return;
      for (const [name, index] of Object.entries(constraints)) {
        validateTableOrColumnName(name, "index");
        const column = index[" column"];
        if (Array.isArray(column)) {
          if (column.length === 0)
            throw new Error(
              `Validation failed: Index '${name}' cannot be empty.`
            );
          if (column.length !== dedupe(column).length)
            throw new Error(
              `Validation failed: Index '${name}' cannot contain duplicate columns.`
            );
          for (const c of column) {
            if (table[c] === void 0)
              throw new Error(
                `Validation failed: Index '${name}' does not reference a valid column. Got '${c}', expected one of [${Object.keys(
                  table
                ).join(", ")}].`
              );
            if (isJSONColumn(table[c]))
              throw new Error(
                `Validation failed: Invalid type for column '${column}' referenced by index '${name}'. Got 'json', expected one of ['string', 'hex', 'bigint', 'int', 'boolean', 'float'].`
              );
            if (isOneColumn(table[c]))
              throw new Error(
                `Validation failed: Invalid type for column '${column}' referenced by index '${name}'. Got 'one', expected one of ['string', 'hex', 'bigint', 'int', 'boolean', 'float'].`
              );
            if (isManyColumn(table[c]))
              throw new Error(
                `Validation failed: Invalid type for column '${column}' referenced by index '${name}'. Got 'many', expected one of ['string', 'hex', 'bigint', 'int', 'boolean', 'float'].`
              );
          }
        } else {
          if (column === "id") {
            logs.push({
              level: "warn",
              msg: `Ignoring index '${name}'. Column 'id' has a primary key constraint by default.`
            });
            delete constraints[name];
            continue;
          }
          if (table[column] === void 0)
            throw new Error(
              `Validation failed: Index '${name}' does not reference a valid column. Got '${column}', expected one of [${Object.entries(
                table
              ).filter(
                ([_, column2]) => !isOneColumn(column2) && !isManyColumn(column2)
              ).map(([columnName]) => columnName).join(", ")}].`
            );
          if (isJSONColumn(table[column]))
            throw new Error(
              `Validation failed: Invalid type for column '${column}' referenced by index '${name}'. Got 'json', expected one of ['string', 'hex', 'bigint', 'int', 'boolean', 'float'].`
            );
          if (isOneColumn(table[column]))
            throw new Error(
              `Validation failed: Invalid type for column '${column}' referenced by index '${name}'. Got 'one', expected one of ['string', 'hex', 'bigint', 'int', 'boolean', 'float'].`
            );
          if (isManyColumn(table[column]))
            throw new Error(
              `Validation failed: Invalid type for column '${column}' referenced by index '${name}'. Got 'many', expected one of ['string', 'hex', 'bigint', 'int', 'boolean', 'float'].`
            );
        }
      }
    }
  );
  return { schema, logs };
};
var validateTableOrColumnName = (key, type) => {
  if (key === "")
    throw new Error(
      `Validation failed: ${type} name can't be an empty string.`
    );
  if (!/^[a-z|A-Z|0-9]+$/.test(key))
    throw new Error(
      `Validation failed: ${type} name '${key}' contains an invalid character.`
    );
};
function safeBuildSchema({ schema }) {
  try {
    const result = buildSchema({ schema });
    return {
      status: "success",
      schema: result.schema,
      logs: result.logs
    };
  } catch (error_) {
    const error = error_;
    return { status: "error", error };
  }
}

// src/build/stacktrace.ts
import { readFileSync } from "node:fs";
import { codeFrameColumns } from "@babel/code-frame";
import { parse as parseStackTrace } from "stacktrace-parser";
var ESBuildTransformError = class extends Error {
  name = "ESBuildTransformError";
};
var ESBuildBuildError = class extends Error {
  name = "ESBuildBuildError";
};
var ESBuildContextError = class extends Error {
  name = "ESBuildContextError";
};
function parseViteNodeError(file, error) {
  let resolvedError;
  if (/^(Transform failed|Build failed|Context failed)/.test(error.message)) {
    const errorKind = error.message.split(" with ")[0];
    const innerError = error.message.split("\n").slice(1).map((message) => {
      let location = void 0;
      let detail = void 0;
      if (message.includes(": ERROR: ")) {
        const s = message.split(": ERROR: ");
        location = s[0];
        detail = s[1];
      } else {
        detail = message.slice(7);
      }
      return { location, detail };
    })[0];
    if (!innerError)
      return error;
    resolvedError = errorKind === "Transform failed" ? new ESBuildTransformError(innerError.detail) : errorKind === "Build failed" ? new ESBuildBuildError(innerError.detail) : new ESBuildContextError(innerError.detail);
    if (innerError.location)
      resolvedError.stack = `    at ${innerError.location}`;
  } else if (error.stack) {
    const stackFrames = parseStackTrace(error.stack);
    const userStackFrames = [];
    for (const rawStackFrame of stackFrames) {
      if (rawStackFrame.methodName.includes("ViteNodeRunner.runModule"))
        break;
      userStackFrames.push(rawStackFrame);
    }
    const userStack = userStackFrames.map(({ file: file2, lineNumber, column, methodName }) => {
      const prefix = "    at";
      const path11 = `${file2}${lineNumber !== null ? `:${lineNumber}` : ""}${column !== null ? `:${column}` : ""}`;
      if (methodName === null || methodName === "<unknown>") {
        return `${prefix} ${path11}`;
      } else {
        return `${prefix} ${methodName} (${path11})`;
      }
    }).join("\n");
    resolvedError = error;
    resolvedError.stack = userStack;
  } else {
    resolvedError = error;
  }
  if (resolvedError.stack) {
    const userStackFrames = parseStackTrace(resolvedError.stack);
    let codeFrame = void 0;
    for (const { file: file2, lineNumber, column } of userStackFrames) {
      if (file2 !== null && lineNumber !== null) {
        try {
          const sourceFileContents = readFileSync(file2, { encoding: "utf-8" });
          codeFrame = codeFrameColumns(
            sourceFileContents,
            { start: { line: lineNumber, column: column ?? void 0 } },
            { highlightCode: true }
          );
          break;
        } catch (err) {
        }
      }
    }
    resolvedError.stack = `${resolvedError.name}: ${resolvedError.message}
${resolvedError.stack}`;
    if (codeFrame)
      resolvedError.stack += `
${codeFrame}`;
  }
  const verb = resolvedError.name === "ESBuildTransformError" ? "transforming" : resolvedError.name === "ESBuildBuildError" || resolvedError.name === "ESBuildContextError" ? "building" : "executing";
  resolvedError.message = `Error while ${verb} ${file}: ${resolvedError.message}`;
  return resolvedError;
}

// src/build/service.ts
var BUILD_ID_VERSION = "1";
var create = async ({
  common
}) => {
  const escapeRegex = /[.*+?^${}()|[\]\\]/g;
  const escapedSrcDir = common.options.srcDir.replace(/\\/g, "/").replace(escapeRegex, "\\$&");
  const srcRegex = new RegExp(`^${escapedSrcDir}/.*\\.(ts|js)$`);
  const viteLogger = {
    warnedMessages: /* @__PURE__ */ new Set(),
    loggedErrors: /* @__PURE__ */ new WeakSet(),
    hasWarned: false,
    clearScreen() {
    },
    hasErrorLogged: (error) => viteLogger.loggedErrors.has(error),
    info: (msg) => {
      common.logger.trace({ service: "build(vite)", msg });
    },
    warn: (msg) => {
      viteLogger.hasWarned = true;
      common.logger.trace({ service: "build(vite)", msg });
    },
    warnOnce: (msg) => {
      if (viteLogger.warnedMessages.has(msg))
        return;
      viteLogger.hasWarned = true;
      common.logger.trace({ service: "build(vite)", msg });
      viteLogger.warnedMessages.add(msg);
    },
    error: (msg) => {
      viteLogger.hasWarned = true;
      common.logger.trace({ service: "build(vite)", msg });
    }
  };
  const viteDevServer = await createServer({
    root: common.options.rootDir,
    cacheDir: path2.join(common.options.ponderDir, "vite"),
    publicDir: false,
    customLogger: viteLogger,
    server: { hmr: false },
    plugins: [viteTsconfigPathsPlugin(), vitePluginPonder()]
  });
  await viteDevServer.pluginContainer.buildStart({});
  const viteNodeServer = new ViteNodeServer(viteDevServer);
  installSourcemapsSupport({
    getSourceMap: (source) => viteNodeServer.getSourceMap(source)
  });
  const viteNodeRunner = new ViteNodeRunner({
    root: viteDevServer.config.root,
    fetchModule: (id) => viteNodeServer.fetchModule(id, "ssr"),
    resolveId: (id, importer) => viteNodeServer.resolveId(id, importer, "ssr")
  });
  return {
    common,
    srcRegex,
    viteDevServer,
    viteNodeServer,
    viteNodeRunner
  };
};
var start = async (buildService, {
  watch,
  onBuild
}) => {
  const { common } = buildService;
  const [configResult, schemaResult, indexingFunctionsResult] = await Promise.all([
    executeConfig(buildService),
    executeSchema(buildService),
    executeIndexingFunctions(buildService)
  ]);
  if (configResult.status === "error") {
    return { status: "error", error: configResult.error };
  }
  if (schemaResult.status === "error") {
    return { status: "error", error: schemaResult.error };
  }
  if (indexingFunctionsResult.status === "error") {
    return { status: "error", error: indexingFunctionsResult.error };
  }
  const rawBuild = {
    config: configResult,
    schema: schemaResult,
    indexingFunctions: indexingFunctionsResult
  };
  const buildResult = await validateAndBuild(buildService, rawBuild);
  if (watch) {
    const ignoredDirs = [common.options.generatedDir, common.options.ponderDir];
    const ignoredFiles = [
      path2.join(common.options.rootDir, "ponder-env.d.ts"),
      path2.join(common.options.rootDir, ".env.local")
    ];
    const isFileIgnored = (filePath) => {
      const isInIgnoredDir = ignoredDirs.some((dir) => {
        const rel = path2.relative(dir, filePath);
        return !rel.startsWith("..") && !path2.isAbsolute(rel);
      });
      const isIgnoredFile = ignoredFiles.includes(filePath);
      return isInIgnoredDir || isIgnoredFile;
    };
    const onFileChange = async (_file) => {
      if (isFileIgnored(_file))
        return;
      const file = toFilePath(
        normalizeModuleId(_file),
        common.options.rootDir
      ).path;
      const invalidated = [
        ...buildService.viteNodeRunner.moduleCache.invalidateDepTree([file])
      ];
      if (invalidated.length === 0)
        return;
      const hasConfigUpdate = invalidated.includes(
        common.options.configFile.replace(/\\/g, "/")
      );
      const hasSchemaUpdate = invalidated.includes(
        common.options.schemaFile.replace(/\\/g, "/")
      );
      const hasIndexingFunctionUpdate = invalidated.some(
        (file2) => buildService.srcRegex.test(file2)
      );
      if (!hasConfigUpdate && !hasSchemaUpdate && !hasIndexingFunctionUpdate) {
        return;
      }
      common.logger.info({
        service: "build",
        msg: `Hot reload ${invalidated.map((f) => `'${path2.relative(common.options.rootDir, f)}'`).join(", ")}`
      });
      if (hasConfigUpdate) {
        const result = await executeConfig(buildService);
        if (result.status === "error") {
          onBuild({ status: "error", error: result.error });
          return;
        }
        rawBuild.config = result;
      }
      if (hasSchemaUpdate) {
        const result = await executeSchema(buildService);
        if (result.status === "error") {
          onBuild({ status: "error", error: result.error });
          return;
        }
        rawBuild.schema = result;
      }
      if (hasIndexingFunctionUpdate) {
        const result = await executeIndexingFunctions(buildService);
        if (result.status === "error") {
          onBuild({ status: "error", error: result.error });
          return;
        }
        rawBuild.indexingFunctions = result;
      }
      const buildResult2 = await validateAndBuild(buildService, rawBuild);
      onBuild(buildResult2);
    };
    buildService.viteDevServer.watcher.on("change", onFileChange);
  }
  return buildResult;
};
var kill = async (buildService) => {
  await buildService.viteDevServer?.close();
  buildService.common.logger.debug({
    service: "build",
    msg: "Killed build service"
  });
};
var executeConfig = async (buildService) => {
  const executeResult = await executeFile(buildService, {
    file: buildService.common.options.configFile
  });
  if (executeResult.status === "error") {
    buildService.common.logger.error({
      service: "build",
      msg: "Error while executing 'ponder.config.ts':",
      error: executeResult.error
    });
    return executeResult;
  }
  const config = executeResult.exports.default;
  const contentHash = createHash("sha256").update(JSON.stringify(config)).digest("hex");
  return { status: "success", config, contentHash };
};
var executeSchema = async (buildService) => {
  const executeResult = await executeFile(buildService, {
    file: buildService.common.options.schemaFile
  });
  if (executeResult.status === "error") {
    buildService.common.logger.error({
      service: "build",
      msg: "Error while executing 'ponder.schema.ts':",
      error: executeResult.error
    });
    return executeResult;
  }
  const schema = executeResult.exports.default;
  const contentHash = createHash("sha256").update(JSON.stringify(schema)).digest("hex");
  return { status: "success", schema, contentHash };
};
var executeIndexingFunctions = async (buildService) => {
  const pattern = path2.join(buildService.common.options.srcDir, "**/*.{js,mjs,ts,mts}").replace(/\\/g, "/");
  const files = glob.sync(pattern);
  const executeResults = await Promise.all(
    files.map(async (file) => ({
      ...await executeFile(buildService, { file }),
      file
    }))
  );
  const indexingFunctions = [];
  for (const executeResult of executeResults) {
    if (executeResult.status === "error") {
      buildService.common.logger.error({
        service: "build",
        msg: `Error while executing '${path2.relative(
          buildService.common.options.rootDir,
          executeResult.file
        )}':`,
        error: executeResult.error
      });
      return executeResult;
    }
    indexingFunctions.push(...executeResult.exports?.ponder?.fns ?? []);
  }
  const hash2 = createHash("sha256");
  for (const file of files) {
    try {
      const contents = readFileSync2(file, "utf-8");
      hash2.update(contents);
    } catch (e) {
      buildService.common.logger.warn({
        service: "build",
        msg: `Unable to read contents of file '${file}' while constructin build ID`
      });
      hash2.update(file);
    }
  }
  const contentHash = hash2.digest("hex");
  return { status: "success", indexingFunctions, contentHash };
};
var validateAndBuild = async ({ common }, rawBuild) => {
  const buildSchemaResult = safeBuildSchema({
    schema: rawBuild.schema.schema
  });
  if (buildSchemaResult.status === "error") {
    common.logger.error({
      service: "build",
      msg: "Error while building schema:",
      error: buildSchemaResult.error
    });
    return buildSchemaResult;
  }
  for (const log of buildSchemaResult.logs) {
    common.logger[log.level]({ service: "build", msg: log.msg });
  }
  const graphqlSchema = buildGraphqlSchema(buildSchemaResult.schema);
  const buildConfigAndIndexingFunctionsResult = await safeBuildConfigAndIndexingFunctions({
    config: rawBuild.config.config,
    rawIndexingFunctions: rawBuild.indexingFunctions.indexingFunctions,
    options: common.options
  });
  if (buildConfigAndIndexingFunctionsResult.status === "error") {
    common.logger.error({
      service: "build",
      msg: "Failed build with error:",
      error: buildConfigAndIndexingFunctionsResult.error
    });
    return buildConfigAndIndexingFunctionsResult;
  }
  for (const log of buildConfigAndIndexingFunctionsResult.logs) {
    common.logger[log.level]({ service: "build", msg: log.msg });
  }
  const buildId = createHash("sha256").update(BUILD_ID_VERSION).update(rawBuild.config.contentHash).update(rawBuild.schema.contentHash).update(rawBuild.indexingFunctions.contentHash).digest("hex").slice(0, 10);
  common.logger.debug({
    service: "build",
    msg: `Completed build with ID '${buildId}' (hash of project file contents)`
  });
  return {
    status: "success",
    build: {
      buildId,
      databaseConfig: buildConfigAndIndexingFunctionsResult.databaseConfig,
      optionsConfig: buildConfigAndIndexingFunctionsResult.optionsConfig,
      networks: buildConfigAndIndexingFunctionsResult.networks,
      sources: buildConfigAndIndexingFunctionsResult.sources,
      schema: buildSchemaResult.schema,
      graphqlSchema,
      indexingFunctions: buildConfigAndIndexingFunctionsResult.indexingFunctions
    }
  };
};
var executeFile = async ({ common, viteNodeRunner }, { file }) => {
  try {
    const exports = await viteNodeRunner.executeFile(file);
    return { status: "success", exports };
  } catch (error_) {
    const relativePath = path2.relative(common.options.rootDir, file);
    const error = parseViteNodeError(relativePath, error_);
    return { status: "error", error };
  }
};

// src/build/index.ts
var methods = {
  start,
  kill
};
var createBuildService = extend(create, methods);

// src/common/codegen.ts
import { mkdirSync, writeFileSync } from "node:fs";
import path3 from "node:path";
import { printSchema } from "graphql";
var ponderEnv = `// This file enables type checking and editor autocomplete for this Ponder project.
// After upgrading, you may find that changes have been made to this file.
// If this happens, please commit the changes. Do not manually edit this file.
// See https://ponder.sh/docs/guides/typescript for more information.

declare module "@/generated" {
  import type { Virtual } from "@ponder/core";

  type config = typeof import("./ponder.config.ts").default;
  type schema = typeof import("./ponder.schema.ts").default;

  export const ponder: Virtual.Registry<config, schema>;

  export type EventNames = Virtual.EventNames<config>;
  export type Event<name extends EventNames = EventNames> = Virtual.Event<
    config,
    name
  >;
  export type Context<name extends EventNames = EventNames> = Virtual.Context<
    config,
    schema,
    name
  >;
  export type IndexingFunctionArgs<name extends EventNames = EventNames> =
    Virtual.IndexingFunctionArgs<config, schema, name>;
  export type Schema = Virtual.Schema<schema>;
}
`;
function runCodegen({
  common,
  graphqlSchema
}) {
  writeFileSync(
    path3.join(common.options.rootDir, "ponder-env.d.ts"),
    ponderEnv,
    "utf8"
  );
  common.logger.debug({
    service: "codegen",
    msg: "Wrote new file at ponder-env.d.ts"
  });
  mkdirSync(common.options.generatedDir, { recursive: true });
  writeFileSync(
    path3.join(common.options.generatedDir, "schema.graphql"),
    printSchema(graphqlSchema),
    "utf-8"
  );
  common.logger.debug({
    service: "codegen",
    msg: "Wrote new file at generated/schema.graphql"
  });
}

// src/common/logger.ts
import pc from "picocolors";
import { pino } from "pino";
function createLogger({
  level,
  mode = "pretty"
}) {
  const stream = {
    write(logString) {
      if (mode === "structured") {
        console.log(logString.trimEnd());
        return;
      }
      const log = JSON.parse(logString);
      const prettyLog = format(log);
      console.log(prettyLog);
      if (log.error) {
        const message = log.error.stack ?? log.error.message ?? log.error;
        console.log(message);
        if (typeof log.error?.meta === "string")
          console.log(log.error.meta);
        if (Array.isArray(log.error?.meta))
          console.log(log.error.meta.join("\n"));
      }
    }
  };
  const logger = pino(
    {
      level,
      serializers: { error: pino.stdSerializers.errWithCause },
      // Removes "pid" and "hostname" properties from the log.
      base: void 0
    },
    stream
  );
  return {
    fatal(options) {
      logger.fatal(options);
    },
    error(options) {
      logger.error(options);
    },
    warn(options) {
      logger.warn(options);
    },
    info(options) {
      logger.info(options);
    },
    debug(options) {
      logger.debug(options);
    },
    trace(options) {
      logger.trace(options);
    },
    async kill() {
    }
  };
}
var levels = {
  60: { label: "FATAL", colorLabel: pc.bgRed("FATAL") },
  50: { label: "ERROR", colorLabel: pc.red("ERROR") },
  40: { label: "WARN ", colorLabel: pc.yellow("WARN ") },
  30: { label: "INFO ", colorLabel: pc.green("INFO ") },
  20: { label: "DEBUG", colorLabel: pc.blue("DEBUG") },
  10: { label: "TRACE", colorLabel: pc.gray("TRACE") }
};
var timeFormatter = new Intl.DateTimeFormat(void 0, {
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
});
var format = (log) => {
  const time = timeFormatter.format(new Date(log.time));
  const message = log.msg ?? log.error?.message;
  const levelObject = levels[log.level ?? 30] ?? levels[30];
  if (pc.isColorSupported) {
    const level = levelObject.colorLabel;
    const service = log.service ? pc.cyan(log.service.padEnd(10, " ")) : "";
    const messageText = pc.reset(message);
    return `${pc.gray(time)} ${level} ${service} ${messageText}`;
  } else {
    const level = levelObject.label;
    const service = log.service ? log.service.padEnd(10, " ") : "";
    return `${time} ${level} ${service} ${message}`;
  }
};

// src/common/metrics.ts
import prometheus from "prom-client";
var databaseQueryDurationMs = [
  0.05,
  0.1,
  1,
  5,
  10,
  25,
  50,
  75,
  100,
  250,
  500,
  750,
  1e3,
  2500,
  5e3,
  7500,
  1e4,
  25e3
];
var httpRequestDurationMs = [
  5,
  10,
  25,
  50,
  75,
  100,
  250,
  500,
  750,
  1e3,
  2500,
  5e3,
  7500,
  1e4,
  25e3
];
var httpRequestSizeBytes = [
  10,
  100,
  1e3,
  5e3,
  1e4,
  5e4,
  1e5,
  5e5,
  1e6,
  5e6,
  1e7
];
var MetricsService = class {
  registry;
  ponder_indexing_total_seconds;
  ponder_indexing_completed_seconds;
  ponder_indexing_completed_events;
  ponder_indexing_completed_timestamp;
  ponder_indexing_has_error;
  ponder_indexing_function_duration;
  ponder_indexing_function_error_total;
  ponder_historical_start_timestamp;
  ponder_historical_total_blocks;
  ponder_historical_cached_blocks;
  ponder_historical_completed_blocks;
  ponder_realtime_is_connected;
  ponder_realtime_latest_block_number;
  ponder_realtime_latest_block_timestamp;
  ponder_realtime_reorg_total;
  ponder_database_method_duration;
  ponder_database_method_error_total;
  ponder_http_server_port;
  ponder_http_server_active_requests;
  ponder_http_server_request_duration_ms;
  ponder_http_server_request_size_bytes;
  ponder_http_server_response_size_bytes;
  ponder_rpc_request_duration;
  ponder_rpc_request_lag;
  ponder_postgres_pool_connections = null;
  ponder_postgres_query_queue_size = null;
  ponder_postgres_query_total = null;
  ponder_sqlite_query_total = null;
  constructor() {
    this.registry = new prometheus.Registry();
    this.ponder_indexing_total_seconds = new prometheus.Gauge({
      name: "ponder_indexing_total_seconds",
      help: "Total number of seconds that are required",
      registers: [this.registry]
    });
    this.ponder_indexing_completed_seconds = new prometheus.Gauge({
      name: "ponder_indexing_completed_seconds",
      help: "Number of seconds that have been completed",
      registers: [this.registry]
    });
    this.ponder_indexing_completed_events = new prometheus.Gauge({
      name: "ponder_indexing_completed_events",
      help: "Number of events that have been processed",
      labelNames: ["network", "event"],
      registers: [this.registry]
    });
    this.ponder_indexing_completed_timestamp = new prometheus.Gauge({
      name: "ponder_indexing_completed_timestamp",
      help: "Timestamp through which all events have been completed",
      registers: [this.registry]
    });
    this.ponder_indexing_has_error = new prometheus.Gauge({
      name: "ponder_indexing_has_error",
      help: "Boolean (0 or 1) indicating if there is an indexing error",
      registers: [this.registry]
    });
    this.ponder_indexing_function_duration = new prometheus.Histogram({
      name: "ponder_indexing_function_duration",
      help: "Duration of indexing function execution",
      labelNames: ["network", "event"],
      buckets: databaseQueryDurationMs,
      registers: [this.registry]
    });
    this.ponder_indexing_function_error_total = new prometheus.Counter({
      name: "ponder_indexing_function_error_total",
      help: "Total number of errors encountered during indexing function execution",
      labelNames: ["network", "event"],
      registers: [this.registry]
    });
    this.ponder_historical_start_timestamp = new prometheus.Gauge({
      name: "ponder_historical_start_timestamp",
      help: "Unix timestamp (ms) when the historical sync service started",
      labelNames: ["network"],
      registers: [this.registry]
    });
    this.ponder_historical_total_blocks = new prometheus.Gauge({
      name: "ponder_historical_total_blocks",
      help: "Number of blocks required for the historical sync",
      labelNames: ["network", "source", "type"],
      registers: [this.registry]
    });
    this.ponder_historical_cached_blocks = new prometheus.Gauge({
      name: "ponder_historical_cached_blocks",
      help: "Number of blocks that were found in the cache for the historical sync",
      labelNames: ["network", "source", "type"],
      registers: [this.registry]
    });
    this.ponder_historical_completed_blocks = new prometheus.Gauge({
      name: "ponder_historical_completed_blocks",
      help: "Number of blocks that have been processed for the historical sync",
      labelNames: ["network", "source", "type"],
      registers: [this.registry]
    });
    this.ponder_realtime_is_connected = new prometheus.Gauge({
      name: "ponder_realtime_is_connected",
      help: "Boolean (0 or 1) indicating if the historical sync service is connected",
      labelNames: ["network"],
      registers: [this.registry]
    });
    this.ponder_realtime_latest_block_number = new prometheus.Gauge({
      name: "ponder_realtime_latest_block_number",
      help: "Block number of the latest synced block",
      labelNames: ["network"],
      registers: [this.registry]
    });
    this.ponder_realtime_latest_block_timestamp = new prometheus.Gauge({
      name: "ponder_realtime_latest_block_timestamp",
      help: "Block timestamp of the latest synced block",
      labelNames: ["network"],
      registers: [this.registry]
    });
    this.ponder_realtime_reorg_total = new prometheus.Counter({
      name: "ponder_realtime_reorg_total",
      help: "Count of how many re-orgs have occurred.",
      labelNames: ["network"],
      registers: [this.registry]
    });
    this.ponder_database_method_duration = new prometheus.Histogram({
      name: "ponder_database_method_duration",
      help: "Duration of database operations",
      labelNames: ["service", "method"],
      buckets: databaseQueryDurationMs,
      registers: [this.registry]
    });
    this.ponder_database_method_error_total = new prometheus.Counter({
      name: "ponder_database_method_error_total",
      help: "Total number of errors encountered during database operations",
      labelNames: ["service", "method"],
      registers: [this.registry]
    });
    this.ponder_http_server_port = new prometheus.Gauge({
      name: "ponder_http_server_port",
      help: "Port that the server is listening on",
      registers: [this.registry]
    });
    this.ponder_http_server_active_requests = new prometheus.Gauge({
      name: "ponder_http_server_active_requests",
      help: "Number of active HTTP server requests",
      labelNames: ["method", "path"],
      registers: [this.registry]
    });
    this.ponder_http_server_request_duration_ms = new prometheus.Histogram({
      name: "ponder_http_server_request_duration_ms",
      help: "Duration of HTTP responses served the server",
      labelNames: ["method", "path", "status"],
      buckets: httpRequestDurationMs,
      registers: [this.registry]
    });
    this.ponder_http_server_request_size_bytes = new prometheus.Histogram({
      name: "ponder_http_server_request_size_bytes",
      help: "Size of HTTP requests received by the server",
      labelNames: ["method", "path", "status"],
      buckets: httpRequestSizeBytes,
      registers: [this.registry]
    });
    this.ponder_http_server_response_size_bytes = new prometheus.Histogram({
      name: "ponder_http_server_response_size_bytes",
      help: "Size of HTTP responses served the server",
      labelNames: ["method", "path", "status"],
      buckets: httpRequestSizeBytes,
      registers: [this.registry]
    });
    this.ponder_rpc_request_duration = new prometheus.Histogram({
      name: "ponder_rpc_request_duration",
      help: "Duration of RPC requests",
      labelNames: ["network", "method"],
      buckets: httpRequestDurationMs,
      registers: [this.registry]
    });
    this.ponder_rpc_request_lag = new prometheus.Histogram({
      name: "ponder_rpc_request_lag",
      help: "Time RPC requests spend waiting in the request queue",
      labelNames: ["network", "method"],
      buckets: databaseQueryDurationMs,
      registers: [this.registry]
    });
    prometheus.collectDefaultMetrics({ register: this.registry });
  }
  /**
   * Get string representation for all metrics.
   * @returns Metrics encoded using Prometheus v0.0.4 format.
   */
  async getMetrics() {
    return await this.registry.metrics();
  }
  resetMetrics() {
    this.registry.resetMetrics();
  }
};
async function getHistoricalSyncProgress(metrics) {
  const startTimestampMetric = (await metrics.ponder_historical_start_timestamp.get()).values?.[0]?.value ?? Date.now();
  const reduceBlockMetrics = (values) => values.reduce((acc, cur) => {
    const id = `${cur.labels.source}_${cur.labels.network}_${cur.labels.type === "block" ? "block" : "contract"}`;
    if (acc[id] === void 0) {
      acc[id] = {
        labels: {
          source: cur.labels.source,
          network: cur.labels.network
        },
        value: cur.value
      };
    } else {
      acc[id].value = Math.min(acc[id].value, cur.value);
    }
    return acc;
  }, {});
  const cachedBlocksMetric = await metrics.ponder_historical_cached_blocks.get().then(({ values }) => reduceBlockMetrics(values));
  const totalBlocksMetric = await metrics.ponder_historical_total_blocks.get().then(({ values }) => reduceBlockMetrics(values));
  const completedBlocksMetric = await metrics.ponder_historical_completed_blocks.get().then(({ values }) => reduceBlockMetrics(values));
  const sources = Object.entries(totalBlocksMetric).map(
    ([
      id,
      {
        labels: { source, network },
        value: totalBlocks2
      }
    ]) => {
      const cachedBlocks2 = cachedBlocksMetric[id]?.value;
      const completedBlocks2 = completedBlocksMetric[id]?.value ?? 0;
      if (cachedBlocks2 === void 0) {
        return {
          sourceName: source,
          networkName: network,
          totalBlocks: totalBlocks2,
          completedBlocks: completedBlocks2
        };
      }
      const progress2 = (completedBlocks2 + cachedBlocks2) / totalBlocks2;
      const elapsed = Date.now() - startTimestampMetric;
      const total = elapsed / (completedBlocks2 / (totalBlocks2 - cachedBlocks2));
      const eta = completedBlocks2 >= 3 ? total - elapsed : void 0;
      return {
        sourceName: source,
        networkName: network,
        totalBlocks: totalBlocks2,
        cachedBlocks: cachedBlocks2,
        completedBlocks: completedBlocks2,
        progress: progress2,
        eta
      };
    }
  );
  const totalBlocks = sources.reduce((a, c) => a + c.totalBlocks, 0);
  const cachedBlocks = sources.reduce((a, c) => a + (c.cachedBlocks ?? 0), 0);
  const completedBlocks = sources.reduce(
    (a, c) => a + (c.completedBlocks ?? 0),
    0
  );
  const progress = totalBlocks === 0 ? 0 : (completedBlocks + cachedBlocks) / totalBlocks;
  return {
    overall: { totalBlocks, cachedBlocks, completedBlocks, progress },
    sources
  };
}
async function getIndexingProgress(metrics) {
  const hasErrorMetric = (await metrics.ponder_indexing_has_error.get()).values[0]?.value;
  const hasError = hasErrorMetric === 1;
  const totalSeconds = (await metrics.ponder_indexing_total_seconds.get()).values[0]?.value ?? 0;
  const completedSeconds = (await metrics.ponder_indexing_completed_seconds.get()).values[0]?.value ?? 0;
  const completedToTimestamp = (await metrics.ponder_indexing_completed_timestamp.get()).values[0].value ?? 0;
  const progress = totalSeconds === 0 ? 0 : completedSeconds / totalSeconds;
  const indexingCompletedEventsMetric = (await metrics.ponder_indexing_completed_events.get()).values;
  const indexingFunctionErrorMetric = (await metrics.ponder_indexing_function_error_total.get()).values;
  const indexingFunctionDurationMetric = (await metrics.ponder_indexing_function_duration.get()).values;
  const indexingDurationSum = {};
  const indexingDurationCount = {};
  for (const m of indexingFunctionDurationMetric) {
    if (m.metricName === "ponder_indexing_function_duration_sum")
      (indexingDurationSum[m.labels.event] ??= {})[m.labels.network] = m.value;
    if (m.metricName === "ponder_indexing_function_duration_count")
      (indexingDurationCount[m.labels.event] ??= {})[m.labels.network] = m.value;
  }
  const events = indexingCompletedEventsMetric.map((m) => {
    const eventName = m.labels.event;
    const networkName = m.labels.network;
    const count = m.value;
    const durationSum = indexingDurationSum[eventName]?.[networkName] ?? 0;
    const durationCount = indexingDurationCount[eventName]?.[networkName] ?? 0;
    const averageDuration = durationCount === 0 ? 0 : durationSum / durationCount;
    const errorCount = indexingFunctionErrorMetric.find(
      (e) => e.labels.event === eventName && e.labels.network === networkName
    )?.value ?? 0;
    return { eventName, networkName, count, averageDuration, errorCount };
  });
  const totalEvents = events.reduce((a, e) => a + e.count, 0);
  return {
    hasError,
    overall: {
      completedSeconds,
      totalSeconds,
      progress,
      completedToTimestamp,
      totalEvents
    },
    events
  };
}

// src/common/options.ts
import path4 from "node:path";
var buildOptions = ({ cliOptions }) => {
  let rootDir;
  if (cliOptions.root !== void 0) {
    rootDir = path4.resolve(cliOptions.root);
  } else {
    rootDir = path4.resolve(".");
  }
  let logLevel;
  if (cliOptions.trace === true) {
    logLevel = "trace";
  } else if (cliOptions.debug === true) {
    logLevel = "debug";
  } else if (process.env.PONDER_LOG_LEVEL !== void 0 && ["silent", "fatal", "error", "warn", "info", "debug", "trace"].includes(
    process.env.PONDER_LOG_LEVEL
  )) {
    logLevel = process.env.PONDER_LOG_LEVEL;
  } else {
    logLevel = "info";
  }
  const port = process.env.PORT !== void 0 ? Number(process.env.PORT) : cliOptions.port !== void 0 ? cliOptions.port : 42069;
  const hostname = cliOptions.hostname;
  return {
    command: cliOptions.command,
    rootDir,
    configFile: path4.join(rootDir, cliOptions.config),
    schemaFile: path4.join(rootDir, "ponder.schema.ts"),
    srcDir: path4.join(rootDir, "src"),
    generatedDir: path4.join(rootDir, "generated"),
    ponderDir: path4.join(rootDir, ".ponder"),
    logDir: path4.join(rootDir, ".ponder", "logs"),
    port,
    hostname,
    maxHealthcheckDuration: 240,
    // 4 minutes
    // Default limits are from Apollo:
    // https://www.apollographql.com/blog/prevent-graph-misuse-with-operation-size-and-complexity-limits
    graphqlMaxOperationTokens: 1e3,
    graphqlMaxOperationDepth: 100,
    graphqlMaxOperationAliases: 30,
    telemetryUrl: "https://ponder.sh/api/telemetry",
    telemetryDisabled: Boolean(process.env.PONDER_TELEMETRY_DISABLED),
    telemetryConfigDir: void 0,
    logLevel,
    databaseHeartbeatInterval: 10 * 1e3,
    databaseHeartbeatTimeout: 25 * 1e3
  };
};

// src/common/telemetry.ts
import { exec } from "child_process";
import { createHash as createHash2, randomBytes } from "node:crypto";
import { existsSync, readFileSync as readFileSync3 } from "node:fs";
import os from "node:os";
import path5 from "node:path";
import { promisify } from "util";

// src/utils/timer.ts
function startClock() {
  const start4 = process.hrtime();
  return () => hrTimeToMs(process.hrtime(start4));
}
function hrTimeToMs(diff) {
  return Math.round(diff[0] * 1e3 + diff[1] / 1e3) / 1e3;
}

// src/utils/wait.ts
async function wait(milliseconds) {
  return new Promise((res) => setTimeout(res, milliseconds));
}

// src/common/telemetry.ts
import Conf from "conf";
import { detect, getNpmVersion } from "detect-package-manager";
var HEARTBEAT_INTERVAL_MS = 6e4;
function createTelemetry({
  options,
  logger
}) {
  if (options.telemetryDisabled) {
    return { record: (_event) => {
    }, kill: async () => {
    } };
  }
  const conf = new Conf({
    projectName: "ponder",
    cwd: options.telemetryConfigDir
  });
  if (conf.get("notifiedAt") === void 0) {
    conf.set("notifiedAt", Date.now().toString());
    logger.info({
      service: "telemetry",
      msg: "Ponder collects anonymous telemetry data to identify issues and prioritize features. See https://ponder.sh/advanced/telemetry for more information."
    });
  }
  const sessionId = randomBytes(8).toString("hex");
  let anonymousId = conf.get("anonymousId");
  if (anonymousId === void 0) {
    anonymousId = randomBytes(8).toString("hex");
    conf.set("anonymousId", anonymousId);
  }
  if (anonymousId.length > 16)
    anonymousId = anonymousId.slice(0, 16);
  let salt = conf.get("salt");
  if (salt === void 0) {
    salt = randomBytes(8).toString("hex");
    conf.set("salt", salt);
  }
  const oneWayHash = (value) => {
    const hash2 = createHash2("sha256");
    hash2.update(salt);
    hash2.update(value);
    return hash2.digest("hex").slice(0, 16);
  };
  const buildContext = async () => {
    const gitRemoteUrl = await getGitRemoteUrl();
    const projectIdRaw = gitRemoteUrl ?? process.cwd();
    const projectId = oneWayHash(projectIdRaw);
    const { packageManager, packageManagerVersion } = await getPackageManager();
    const packageJson2 = getPackageJson(options.rootDir);
    const ponderCoreVersion = packageJson2?.dependencies?.["@ponder/core"] ?? "unknown";
    const viemVersion = packageJson2?.dependencies?.viem ?? "unknown";
    const isInternal = ponderCoreVersion === "workspace:*";
    const cpus = os.cpus();
    return {
      common: {
        session_id: sessionId,
        project_id: projectId,
        is_internal: isInternal
      },
      session: {
        ponder_core_version: ponderCoreVersion,
        viem_version: viemVersion,
        package_manager: packageManager,
        package_manager_version: packageManagerVersion,
        node_version: process.versions.node,
        system_platform: os.platform(),
        system_release: os.release(),
        system_architecture: os.arch(),
        cpu_count: cpus.length,
        cpu_model: cpus.length > 0 ? cpus[0].model : "unknown",
        cpu_speed: cpus.length > 0 ? cpus[0].speed : 0,
        total_memory_bytes: os.totalmem()
      }
    };
  };
  let context = void 0;
  const contextPromise = buildContext();
  const controller = new AbortController();
  let isKilled = false;
  const queue = createQueue({
    initialStart: true,
    concurrency: 10,
    worker: async (event) => {
      const endClock = startClock();
      try {
        if (context === void 0)
          context = await contextPromise;
        const properties = event.name === "lifecycle:session_start" ? { ...event.properties, ...context.common, ...context.session } : { ...event.properties, ...context.common };
        const body = JSON.stringify({
          distinctId: anonymousId,
          event: event.name,
          properties
        });
        await fetch(options.telemetryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: controller.signal
        });
        logger.trace({
          service: "telemetry",
          msg: `Sent '${event.name}' event in ${endClock()}ms`
        });
      } catch (error_) {
        const error = error_;
        logger.trace({
          service: "telemetry",
          msg: `Failed to send '${event.name}' event after ${endClock()}ms due to error: ${error.message}`
        });
      }
    }
  });
  const record = (event) => {
    if (isKilled)
      return;
    queue.add(event);
  };
  const heartbeatInterval = setInterval(() => {
    record({
      name: "lifecycle:heartbeat_send",
      properties: { duration_seconds: process.uptime() }
    });
  }, HEARTBEAT_INTERVAL_MS);
  const kill5 = async () => {
    clearInterval(heartbeatInterval);
    isKilled = true;
    queue.clear();
    await Promise.race([queue.onIdle(), wait(1e3)]);
  };
  return { record, kill: kill5 };
}
async function getPackageManager() {
  let packageManager = "unknown";
  let packageManagerVersion = "unknown";
  try {
    packageManager = await detect();
    packageManagerVersion = await getNpmVersion(packageManager);
  } catch (e) {
  }
  return { packageManager, packageManagerVersion };
}
var execa = promisify(exec);
async function getGitRemoteUrl() {
  const result = await execa("git config --local --get remote.origin.url", {
    timeout: 250,
    windowsHide: true
  }).catch(() => void 0);
  return result?.stdout.trim();
}
function getPackageJson(rootDir) {
  try {
    const rootPath = path5.join(rootDir, "package.json");
    const cwdPath = path5.join(process.cwd(), "package.json");
    const packageJsonPath2 = existsSync(rootPath) ? rootPath : existsSync(cwdPath) ? cwdPath : void 0;
    if (packageJsonPath2 === void 0)
      return void 0;
    const packageJsonString = readFileSync3(packageJsonPath2, "utf8");
    const packageJson2 = JSON.parse(packageJsonString);
    return packageJson2;
  } catch (e) {
    return void 0;
  }
}
function buildPayload(build) {
  const table_count = Object.keys(getTables(build.schema)).length;
  const indexing_function_count = Object.values(build.indexingFunctions).reduce(
    (acc, f) => acc + Object.keys(f).length,
    0
  );
  return {
    database_kind: build.databaseConfig.kind,
    contract_count: build.sources.length,
    network_count: build.networks.length,
    table_count,
    indexing_function_count
  };
}

// src/bin/utils/shutdown.ts
import os2 from "node:os";
import readline from "node:readline";

// src/common/errors.ts
var BaseError = class _BaseError extends Error {
  name = "BaseError";
  meta = [];
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, _BaseError.prototype);
  }
};
function getBaseError(err) {
  if (err instanceof BaseError)
    return err;
  if (err instanceof Error)
    return new BaseError(err.message);
  if (typeof err?.message === "string")
    return new BaseError(err.message);
  if (typeof err === "string")
    return new BaseError(err);
  return new BaseError("unknown error");
}
var NonRetryableError = class _NonRetryableError extends BaseError {
  name = "NonRetryableError";
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, _NonRetryableError.prototype);
  }
};
var IgnorableError = class _IgnorableError extends BaseError {
  name = "IgnorableError";
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, _IgnorableError.prototype);
  }
};
var StoreError = class _StoreError extends NonRetryableError {
  name = "StoreError";
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, _StoreError.prototype);
  }
};
var UniqueConstraintError = class _UniqueConstraintError extends NonRetryableError {
  name = "UniqueConstraintError";
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, _UniqueConstraintError.prototype);
  }
};
var NotNullConstraintError = class _NotNullConstraintError extends NonRetryableError {
  name = "NotNullConstraintError";
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, _NotNullConstraintError.prototype);
  }
};
var RecordNotFoundError = class _RecordNotFoundError extends NonRetryableError {
  name = "RecordNotFoundError";
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, _RecordNotFoundError.prototype);
  }
};
var CheckConstraintError = class _CheckConstraintError extends NonRetryableError {
  name = "CheckConstraintError";
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, _CheckConstraintError.prototype);
  }
};
var BigIntSerializationError = class _BigIntSerializationError extends NonRetryableError {
  name = "BigIntSerializationError";
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, _BigIntSerializationError.prototype);
  }
};

// src/bin/utils/shutdown.ts
var SHUTDOWN_GRACE_PERIOD_MS = 5e3;
function setupShutdown({
  common,
  cleanup
}) {
  let isShuttingDown = false;
  const shutdown = async ({
    reason,
    code
  }) => {
    if (isShuttingDown)
      return;
    isShuttingDown = true;
    setTimeout(async () => {
      common.logger.fatal({
        service: "process",
        msg: "Failed to shutdown within 5 seconds, terminating (exit code 1)"
      });
      await common.logger.kill();
      process.exit(1);
    }, SHUTDOWN_GRACE_PERIOD_MS);
    if (reason !== void 0) {
      common.logger.warn({
        service: "process",
        msg: `${reason}, starting shutdown sequence`
      });
    }
    common.telemetry.record({
      name: "lifecycle:session_end",
      properties: { duration_seconds: process.uptime() }
    });
    await cleanup();
    const level = code === 0 ? "info" : "fatal";
    common.logger[level]({
      service: "process",
      msg: `Finished shutdown sequence, terminating (exit code ${code})`
    });
    await common.logger.kill();
    process.exit(code);
  };
  if (os2.platform() === "win32") {
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    readlineInterface.on(
      "SIGINT",
      () => shutdown({ reason: "Received SIGINT", code: 0 })
    );
  }
  process.on("SIGINT", () => shutdown({ reason: "Received SIGINT", code: 0 }));
  process.on(
    "SIGTERM",
    () => shutdown({ reason: "Received SIGTERM", code: 0 })
  );
  process.on(
    "SIGQUIT",
    () => shutdown({ reason: "Received SIGQUIT", code: 0 })
  );
  process.on("uncaughtException", (error) => {
    if (error instanceof IgnorableError)
      return;
    common.logger.error({
      service: "process",
      msg: "Caught uncaughtException event with error:",
      error
    });
    shutdown({ reason: "Received uncaughtException", code: 1 });
  });
  process.on("unhandledRejection", (error) => {
    if (error instanceof IgnorableError)
      return;
    common.logger.error({
      service: "process",
      msg: "Caught unhandledRejection event with error:",
      error
    });
    shutdown({ reason: "Received unhandledRejection", code: 1 });
  });
  return shutdown;
}

// src/bin/commands/codegen.ts
async function codegen({ cliOptions }) {
  const options = buildOptions({ cliOptions });
  const logger = createLogger({ level: options.logLevel });
  const [major, minor, _patch] = process.versions.node.split(".").map(Number);
  if (major < 18 || major === 18 && minor < 14) {
    logger.fatal({
      service: "process",
      msg: `Invalid Node.js version. Expected >=18.14, detected ${major}.${minor}.`
    });
    await logger.kill();
    process.exit(1);
  }
  const metrics = new MetricsService();
  const telemetry = createTelemetry({ options, logger });
  const common = { options, logger, metrics, telemetry };
  const buildService = await createBuildService({ common });
  const cleanup = async () => {
    await buildService.kill();
    await telemetry.kill();
  };
  const shutdown = setupShutdown({ common, cleanup });
  const buildResult = await buildService.start({ watch: false });
  if (buildResult.status === "error") {
    logger.error({
      service: "process",
      msg: "Failed schema build with error:",
      error: buildResult.error
    });
    await shutdown({ reason: "Failed schema build", code: 1 });
    return;
  }
  telemetry.record({
    name: "lifecycle:session_start",
    properties: { cli_command: "codegen" }
  });
  runCodegen({ common, graphqlSchema: buildResult.build.graphqlSchema });
  logger.info({ service: "codegen", msg: "Wrote ponder-env.d.ts" });
  logger.info({ service: "codegen", msg: "Wrote schema.graphql" });
  await shutdown({ reason: "Success", code: 0 });
}

// src/bin/commands/dev.ts
import { existsSync as existsSync4 } from "node:fs";
import path8 from "node:path";

// src/utils/format.ts
var formatEta = (ms) => {
  if (ms < 1e3)
    return `${Math.round(ms)}ms`;
  const seconds = Math.floor(ms / 1e3);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds - h * 3600) / 60);
  const s = seconds - h * 3600 - m * 60;
  const hstr = h > 0 ? `${h}h ` : "";
  const mstr = m > 0 || h > 0 ? `${m}m ` : "";
  const sstr = s > 0 || m > 0 ? `${s}s` : "";
  return `${hstr}${mstr}${sstr}`;
};
var formatPercentage = (cacheRate) => {
  const decimal = Math.round(cacheRate * 1e3) / 10;
  return Number.isInteger(decimal) && decimal < 100 ? `${decimal}.0%` : `${decimal}%`;
};

// src/ui/app.tsx
import { Box as Box2, Text as Text3, render as inkRender } from "ink";
import React3 from "react";

// src/ui/ProgressBar.tsx
import { Text } from "ink";
import React from "react";
var ProgressBar = ({ current = 5, end = 10, width = 36 }) => {
  const maxCount = width || process.stdout.columns || 80;
  const fraction = current / end;
  const count = Math.min(Math.floor(maxCount * fraction), maxCount);
  return /* @__PURE__ */ React.createElement(Text, null, /* @__PURE__ */ React.createElement(Text, null, "\u2588".repeat(count)), /* @__PURE__ */ React.createElement(Text, null, "\u2591".repeat(maxCount - count)));
};

// src/ui/Table.tsx
import { Box, Text as Text2 } from "ink";
import React2 from "react";
var MAX_COLUMN_WIDTH = 24;
function Table(props) {
  const { columns, rows } = props;
  const formattedRows = rows.map(
    (row) => columns.reduce(
      (acc, column) => ({
        ...acc,
        [column.key.toString()]: column.format ? column.format(row[column.key], row) : row[column.key]
      }),
      {}
    )
  );
  const columnWidths = columns.map((column) => {
    let maxWidth = Math.max(
      ...formattedRows.map(
        (row) => row[column.key] !== void 0 ? row[column.key].toString().length : 9
      ),
      column.title.length
    );
    maxWidth = Math.min(maxWidth, MAX_COLUMN_WIDTH);
    return maxWidth;
  });
  return /* @__PURE__ */ React2.createElement(Box, { flexDirection: "column" }, /* @__PURE__ */ React2.createElement(Box, { flexDirection: "row", key: "title" }, columns.map(({ title, align }, index) => /* @__PURE__ */ React2.createElement(React2.Fragment, { key: `title-${index}` }, /* @__PURE__ */ React2.createElement(Text2, null, "\u2502"), /* @__PURE__ */ React2.createElement(
    Box,
    {
      width: columnWidths[index],
      justifyContent: align === "left" ? "flex-start" : "flex-end",
      marginX: 1
    },
    /* @__PURE__ */ React2.createElement(Text2, { bold: true, wrap: "truncate-end" }, title)
  ))), /* @__PURE__ */ React2.createElement(Text2, null, "\u2502")), /* @__PURE__ */ React2.createElement(Box, { flexDirection: "row", key: "border" }, /* @__PURE__ */ React2.createElement(Text2, null, "\u251C"), columnWidths.map((width, index) => /* @__PURE__ */ React2.createElement(Text2, { key: `separator-${index}` }, "\u2500".repeat(width + 2), index < columns.length - 1 ? "\u253C" : "\u2524"))), formattedRows.map((row, rowIndex) => /* @__PURE__ */ React2.createElement(Box, { flexDirection: "row", key: `row-${rowIndex}` }, columns.map(({ key, align }, index) => /* @__PURE__ */ React2.createElement(React2.Fragment, { key: `cell-${rowIndex}-${index}` }, /* @__PURE__ */ React2.createElement(Text2, null, "\u2502"), /* @__PURE__ */ React2.createElement(
    Box,
    {
      width: columnWidths[index],
      justifyContent: align === "left" ? "flex-start" : "flex-end",
      marginX: 1
    },
    /* @__PURE__ */ React2.createElement(Text2, { wrap: "truncate-end" }, row[key])
  ))), /* @__PURE__ */ React2.createElement(Text2, null, "\u2502"))));
}
var Table_default = Table;

// src/ui/app.tsx
var buildUiState = () => {
  const ui = {
    historical: {
      overall: {
        totalBlocks: 0,
        cachedBlocks: 0,
        completedBlocks: 0,
        progress: 0
      },
      sources: []
    },
    realtimeSyncNetworks: [],
    indexing: {
      hasError: false,
      overall: {
        completedSeconds: 0,
        totalSeconds: 0,
        progress: 0,
        completedToTimestamp: 0,
        totalEvents: 0
      },
      events: []
    },
    port: 0
  };
  return ui;
};
var App = (ui) => {
  const { historical, indexing, port } = ui;
  if (indexing.hasError) {
    return /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "column" }, /* @__PURE__ */ React3.createElement(Text3, null, " "), /* @__PURE__ */ React3.createElement(Text3, { color: "cyan" }, "Resolve the error and save your changes to reload the server."));
  }
  let historicalElement;
  if (historical.overall.progress === 0) {
    historicalElement = /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement(Text3, { bold: true }, "Historical sync"), /* @__PURE__ */ React3.createElement(Text3, null, "Waiting to start..."), /* @__PURE__ */ React3.createElement(Text3, null, " "));
  } else if (historical.overall.progress === 1) {
    historicalElement = /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement(Text3, null, /* @__PURE__ */ React3.createElement(Text3, { bold: true }, "Historical sync "), "(", /* @__PURE__ */ React3.createElement(Text3, { color: "greenBright" }, "done"), ")"), /* @__PURE__ */ React3.createElement(Text3, null, " "));
  } else {
    historicalElement = /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement(Text3, null, /* @__PURE__ */ React3.createElement(Text3, { bold: true }, "Historical sync "), "(", /* @__PURE__ */ React3.createElement(Text3, { color: "yellowBright" }, "in progress"), ")"), /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "row" }, /* @__PURE__ */ React3.createElement(
      ProgressBar,
      {
        current: historical.overall.progress,
        end: 1,
        width: 50
      }
    ), /* @__PURE__ */ React3.createElement(Text3, null, " ", historical.overall.progress === 1 ? /* @__PURE__ */ React3.createElement(Text3, { color: "greenBright" }, "done") : formatPercentage(historical.overall.progress), " ", "(", historical.overall.cachedBlocks + historical.overall.completedBlocks, " ", "blocks)")), /* @__PURE__ */ React3.createElement(Text3, null, " "), /* @__PURE__ */ React3.createElement(
      Table_default,
      {
        rows: historical.sources,
        columns: [
          { title: "Source", key: "sourceName", align: "left" },
          { title: "Network", key: "networkName", align: "left" },
          {
            title: "Cached",
            key: "cachedBlocks",
            align: "right",
            format: (_, row) => row.cachedBlocks !== void 0 ? row.cachedBlocks : "-"
          },
          {
            title: "Completed",
            key: "completedBlocks",
            align: "right"
          },
          { title: "Total", key: "totalBlocks", align: "right" },
          {
            title: "Progress",
            key: "progress",
            align: "right",
            format: (v) => v ? formatPercentage(v) : "-"
          },
          {
            title: "ETA",
            key: "eta",
            align: "right",
            format: (v) => v ? formatEta(v) : "-"
          }
        ]
      }
    ), /* @__PURE__ */ React3.createElement(Text3, null, " "));
  }
  let indexingElement;
  if (indexing.overall.progress === 0) {
    indexingElement = /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement(Text3, { bold: true }, "Indexing "), /* @__PURE__ */ React3.createElement(Text3, null, "Waiting to start..."), /* @__PURE__ */ React3.createElement(Text3, null, " "));
  } else {
    const effectiveProgress = indexing.overall.progress * historical.overall.progress;
    indexingElement = /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement(Text3, null, /* @__PURE__ */ React3.createElement(Text3, { bold: true }, "Indexing "), "(", effectiveProgress === 1 ? /* @__PURE__ */ React3.createElement(Text3, { color: "greenBright" }, "done") : /* @__PURE__ */ React3.createElement(Text3, { color: "yellowBright" }, "in progress"), ")"), /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "row" }, /* @__PURE__ */ React3.createElement(ProgressBar, { current: effectiveProgress, end: 1, width: 50 }), /* @__PURE__ */ React3.createElement(Text3, null, " (", indexing.overall.totalEvents, " events)")), /* @__PURE__ */ React3.createElement(Text3, null, " "), /* @__PURE__ */ React3.createElement(
      Table_default,
      {
        rows: indexing.events,
        columns: [
          { title: "Event", key: "eventName", align: "left" },
          { title: "Network", key: "networkName", align: "left" },
          { title: "Count", key: "count", align: "right" },
          {
            title: "Error count",
            key: "errorCount",
            align: "right",
            format: (v, row) => row.count > 0 ? v : "-"
          },
          {
            title: "Duration (avg)",
            key: "averageDuration",
            align: "right",
            format: (v) => v > 0 ? `${v.toFixed(2)}ms` : "-"
          }
        ]
      }
    ), /* @__PURE__ */ React3.createElement(Text3, null, " "));
  }
  return /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "column" }, /* @__PURE__ */ React3.createElement(Text3, null, " "), historicalElement, indexingElement, /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "column" }, /* @__PURE__ */ React3.createElement(Text3, { bold: true }, "GraphQL "), /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "row" }, /* @__PURE__ */ React3.createElement(Text3, null, "Server live at http://localhost:", port))));
};
var setupInkApp = (ui) => {
  const { rerender, unmount: inkUnmount, clear } = inkRender(/* @__PURE__ */ React3.createElement(App, { ...ui }));
  const render = (ui2) => {
    rerender(/* @__PURE__ */ React3.createElement(App, { ...ui2 }));
  };
  const unmount = () => {
    clear();
    inkUnmount();
  };
  return { render, unmount };
};

// src/ui/service.ts
var UiService = class {
  common;
  ui = buildUiState();
  renderInterval;
  render;
  unmount;
  isKilled = false;
  constructor({ common }) {
    this.common = common;
    const { render, unmount } = setupInkApp(this.ui);
    this.render = () => render(this.ui);
    this.unmount = unmount;
  }
  reset() {
    this.ui = buildUiState();
    const metrics = this.common.metrics;
    this.renderInterval = setInterval(async () => {
      this.ui.historical = await getHistoricalSyncProgress(metrics);
      this.ui.indexing = await getIndexingProgress(metrics);
      const port = (await metrics.ponder_http_server_port.get()).values[0].value;
      this.ui.port = port;
      if (this.isKilled)
        return;
      this.render?.();
    }, 17);
  }
  setReloadableError() {
    this.ui.indexing.hasError = true;
    this.render?.();
  }
  kill() {
    this.isKilled = true;
    clearInterval(this.renderInterval);
    this.unmount?.();
  }
};

// src/sync-store/postgres/migrations.ts
import { sql } from "kysely";
var migrations = {
  "2023_05_15_0_initial": {
    async up(db) {
      await db.schema.createTable("blocks").addColumn("baseFeePerGas", sql`bytea`).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("difficulty", sql`bytea`, (col) => col.notNull()).addColumn("extraData", "text", (col) => col.notNull()).addColumn("finalized", "integer", (col) => col.notNull()).addColumn("gasLimit", sql`bytea`, (col) => col.notNull()).addColumn("gasUsed", sql`bytea`, (col) => col.notNull()).addColumn("hash", "text", (col) => col.notNull().primaryKey()).addColumn("logsBloom", "text", (col) => col.notNull()).addColumn("miner", "text", (col) => col.notNull()).addColumn("mixHash", "text", (col) => col.notNull()).addColumn("nonce", "text", (col) => col.notNull()).addColumn("number", sql`bytea`, (col) => col.notNull()).addColumn("parentHash", "text", (col) => col.notNull()).addColumn("receiptsRoot", "text", (col) => col.notNull()).addColumn("sha3Uncles", "text", (col) => col.notNull()).addColumn("size", sql`bytea`, (col) => col.notNull()).addColumn("stateRoot", "text", (col) => col.notNull()).addColumn("timestamp", sql`bytea`, (col) => col.notNull()).addColumn("totalDifficulty", sql`bytea`, (col) => col.notNull()).addColumn("transactionsRoot", "text", (col) => col.notNull()).execute();
      await db.schema.createTable("transactions").addColumn("accessList", "text").addColumn("blockHash", "text", (col) => col.notNull()).addColumn("blockNumber", sql`bytea`, (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("finalized", "integer", (col) => col.notNull()).addColumn("from", "text", (col) => col.notNull()).addColumn("gas", sql`bytea`, (col) => col.notNull()).addColumn("gasPrice", sql`bytea`).addColumn("hash", "text", (col) => col.notNull().primaryKey()).addColumn("input", "text", (col) => col.notNull()).addColumn("maxFeePerGas", sql`bytea`).addColumn("maxPriorityFeePerGas", sql`bytea`).addColumn("nonce", "integer", (col) => col.notNull()).addColumn("r", "text", (col) => col.notNull()).addColumn("s", "text", (col) => col.notNull()).addColumn("to", "text").addColumn("transactionIndex", "integer", (col) => col.notNull()).addColumn("type", "text", (col) => col.notNull()).addColumn("value", sql`bytea`, (col) => col.notNull()).addColumn("v", sql`bytea`, (col) => col.notNull()).execute();
      await db.schema.createTable("logs").addColumn("address", "text", (col) => col.notNull()).addColumn("blockHash", "text", (col) => col.notNull()).addColumn("blockNumber", sql`bytea`, (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("data", "text", (col) => col.notNull()).addColumn("finalized", "integer", (col) => col.notNull()).addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("logIndex", "integer", (col) => col.notNull()).addColumn("topic0", "text").addColumn("topic1", "text").addColumn("topic2", "text").addColumn("topic3", "text").addColumn("transactionHash", "text", (col) => col.notNull()).addColumn("transactionIndex", "integer", (col) => col.notNull()).execute();
      await db.schema.createTable("contractReadResults").addColumn("address", "text", (col) => col.notNull()).addColumn("blockNumber", sql`bytea`, (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("data", "text", (col) => col.notNull()).addColumn("finalized", "integer", (col) => col.notNull()).addColumn("result", "text", (col) => col.notNull()).addPrimaryKeyConstraint("contractReadResultPrimaryKey", [
        "chainId",
        "blockNumber",
        "address",
        "data"
      ]).execute();
      await db.schema.createTable("logFilterCachedRanges").addColumn("endBlock", sql`bytea`, (col) => col.notNull()).addColumn("endBlockTimestamp", sql`bytea`, (col) => col.notNull()).addColumn("filterKey", "text", (col) => col.notNull()).addColumn("id", "serial", (col) => col.notNull().primaryKey()).addColumn("startBlock", sql`bytea`, (col) => col.notNull()).execute();
    }
  },
  "2023_06_20_0_indices": {
    async up(db) {
      await db.schema.createIndex("log_events_index").on("logs").columns(["address", "chainId", "blockHash"]).execute();
      await db.schema.createIndex("blocks_index").on("blocks").columns(["timestamp", "number"]).execute();
      await db.schema.createIndex("logFilterCachedRanges_index").on("logFilterCachedRanges").columns(["filterKey"]).execute();
    }
  },
  "2023_07_18_0_better_indices": {
    async up(db) {
      await db.schema.dropIndex("log_events_index").execute();
      await db.schema.dropIndex("blocks_index").execute();
      await db.schema.createIndex("log_block_hash_index").on("logs").column("blockHash").execute();
      await db.schema.createIndex("log_chain_id_index").on("logs").column("chainId").execute();
      await db.schema.createIndex("log_address_index").on("logs").column("address").execute();
      await db.schema.createIndex("log_topic0_index").on("logs").column("topic0").execute();
      await db.schema.createIndex("block_timestamp_index").on("blocks").column("timestamp").execute();
      await db.schema.createIndex("block_number_index").on("blocks").column("number").execute();
    }
  },
  "2023_07_24_0_drop_finalized": {
    async up(db) {
      await db.schema.alterTable("blocks").dropColumn("finalized").execute();
      await db.schema.alterTable("transactions").dropColumn("finalized").execute();
      await db.schema.alterTable("logs").dropColumn("finalized").execute();
      await db.schema.alterTable("contractReadResults").dropColumn("finalized").execute();
    }
  },
  "2023_09_19_0_new_sync_design": {
    async up(db) {
      await db.schema.dropTable("logFilterCachedRanges").execute();
      await db.schema.dropTable("blocks").execute();
      await db.schema.createTable("blocks").addColumn("baseFeePerGas", "numeric(78, 0)").addColumn("chainId", "integer", (col) => col.notNull()).addColumn("difficulty", "numeric(78, 0)", (col) => col.notNull()).addColumn("extraData", "text", (col) => col.notNull()).addColumn("gasLimit", "numeric(78, 0)", (col) => col.notNull()).addColumn("gasUsed", "numeric(78, 0)", (col) => col.notNull()).addColumn("hash", "varchar(66)", (col) => col.notNull().primaryKey()).addColumn("logsBloom", "varchar(514)", (col) => col.notNull()).addColumn("miner", "varchar(42)", (col) => col.notNull()).addColumn("mixHash", "varchar(66)", (col) => col.notNull()).addColumn("nonce", "varchar(18)", (col) => col.notNull()).addColumn("number", "numeric(78, 0)", (col) => col.notNull()).addColumn("parentHash", "varchar(66)", (col) => col.notNull()).addColumn("receiptsRoot", "varchar(66)", (col) => col.notNull()).addColumn("sha3Uncles", "varchar(66)", (col) => col.notNull()).addColumn("size", "numeric(78, 0)", (col) => col.notNull()).addColumn("stateRoot", "varchar(66)", (col) => col.notNull()).addColumn("timestamp", "numeric(78, 0)", (col) => col.notNull()).addColumn("totalDifficulty", "numeric(78, 0)", (col) => col.notNull()).addColumn("transactionsRoot", "varchar(66)", (col) => col.notNull()).execute();
      await db.schema.createIndex("blockTimestampIndex").on("blocks").column("timestamp").execute();
      await db.schema.createIndex("blockNumberIndex").on("blocks").column("number").execute();
      await db.schema.dropTable("transactions").execute();
      await db.schema.createTable("transactions").addColumn("accessList", "text").addColumn("blockHash", "varchar(66)", (col) => col.notNull()).addColumn("blockNumber", "numeric(78, 0)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("from", "varchar(42)", (col) => col.notNull()).addColumn("gas", "numeric(78, 0)", (col) => col.notNull()).addColumn("gasPrice", "numeric(78, 0)").addColumn("hash", "varchar(66)", (col) => col.notNull().primaryKey()).addColumn("input", "text", (col) => col.notNull()).addColumn("maxFeePerGas", "numeric(78, 0)").addColumn("maxPriorityFeePerGas", "numeric(78, 0)").addColumn("nonce", "integer", (col) => col.notNull()).addColumn("r", "varchar(66)", (col) => col.notNull()).addColumn("s", "varchar(66)", (col) => col.notNull()).addColumn("to", "varchar(42)").addColumn("transactionIndex", "integer", (col) => col.notNull()).addColumn("type", "text", (col) => col.notNull()).addColumn("value", "numeric(78, 0)", (col) => col.notNull()).addColumn("v", "numeric(78, 0)", (col) => col.notNull()).execute();
      await db.schema.dropTable("logs").execute();
      await db.schema.createTable("logs").addColumn("address", "varchar(42)", (col) => col.notNull()).addColumn("blockHash", "varchar(66)", (col) => col.notNull()).addColumn("blockNumber", "numeric(78, 0)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("data", "text", (col) => col.notNull()).addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("logIndex", "integer", (col) => col.notNull()).addColumn("topic0", "varchar(66)").addColumn("topic1", "varchar(66)").addColumn("topic2", "varchar(66)").addColumn("topic3", "varchar(66)").addColumn("transactionHash", "varchar(66)", (col) => col.notNull()).addColumn("transactionIndex", "integer", (col) => col.notNull()).execute();
      await db.schema.createIndex("logBlockHashIndex").on("logs").column("blockHash").execute();
      await db.schema.createIndex("logChainIdIndex").on("logs").column("chainId").execute();
      await db.schema.createIndex("logAddressIndex").on("logs").column("address").execute();
      await db.schema.createIndex("logTopic0Index").on("logs").column("topic0").execute();
      await db.schema.dropTable("contractReadResults").execute();
      await db.schema.createTable("contractReadResults").addColumn("address", "varchar(42)", (col) => col.notNull()).addColumn("blockNumber", "numeric(78, 0)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("data", "text", (col) => col.notNull()).addColumn("result", "text", (col) => col.notNull()).addPrimaryKeyConstraint("contractReadResultPrimaryKey", [
        "chainId",
        "blockNumber",
        "address",
        "data"
      ]).execute();
      await db.schema.createTable("logFilters").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("address", "varchar(66)").addColumn("topic0", "varchar(66)").addColumn("topic1", "varchar(66)").addColumn("topic2", "varchar(66)").addColumn("topic3", "varchar(66)").execute();
      await db.schema.createTable("logFilterIntervals").addColumn("id", "serial", (col) => col.notNull().primaryKey()).addColumn(
        "logFilterId",
        "text",
        (col) => col.notNull().references("logFilters.id")
      ).addColumn("startBlock", "numeric(78, 0)", (col) => col.notNull()).addColumn("endBlock", "numeric(78, 0)", (col) => col.notNull()).execute();
      await db.schema.createIndex("logFilterIntervalsLogFilterId").on("logFilterIntervals").column("logFilterId").execute();
      await db.schema.createTable("factories").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("address", "varchar(42)", (col) => col.notNull()).addColumn("eventSelector", "varchar(66)", (col) => col.notNull()).addColumn("childAddressLocation", "text", (col) => col.notNull()).addColumn("topic0", "varchar(66)").addColumn("topic1", "varchar(66)").addColumn("topic2", "varchar(66)").addColumn("topic3", "varchar(66)").execute();
      await db.schema.createTable("factoryLogFilterIntervals").addColumn("id", "serial", (col) => col.notNull().primaryKey()).addColumn(
        "factoryId",
        "text",
        (col) => col.notNull().references("factories.id")
      ).addColumn("startBlock", "numeric(78, 0)", (col) => col.notNull()).addColumn("endBlock", "numeric(78, 0)", (col) => col.notNull()).execute();
      await db.schema.createIndex("factoryLogFilterIntervalsFactoryId").on("factoryLogFilterIntervals").column("factoryId").execute();
    }
  },
  "2023_11_06_0_new_rpc_cache_design": {
    async up(db) {
      await db.schema.dropTable("contractReadResults").execute();
      await db.schema.createTable("rpcRequestResults").addColumn("request", "text", (col) => col.notNull()).addColumn("blockNumber", "numeric(78, 0)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("result", "text", (col) => col.notNull()).addPrimaryKeyConstraint("rpcRequestResultPrimaryKey", [
        "request",
        "chainId",
        "blockNumber"
      ]).execute();
    }
  },
  "2024_01_30_0_change_chain_id_type": {
    async up(db) {
      await db.schema.alterTable("blocks").alterColumn("chainId", (col) => col.setDataType("int8")).execute();
      await db.schema.alterTable("transactions").alterColumn("chainId", (col) => col.setDataType("int8")).execute();
      await db.schema.alterTable("logs").alterColumn("chainId", (col) => col.setDataType("int8")).execute();
      await db.schema.alterTable("logFilters").alterColumn("chainId", (col) => col.setDataType("int8")).execute();
      await db.schema.alterTable("factories").alterColumn("chainId", (col) => col.setDataType("int8")).execute();
      await db.schema.alterTable("rpcRequestResults").alterColumn("chainId", (col) => col.setDataType("int8")).execute();
    }
  },
  "2024_02_1_0_nullable_block_columns": {
    async up(db) {
      await db.schema.alterTable("blocks").alterColumn("mixHash", (col) => col.dropNotNull()).execute();
      await db.schema.alterTable("blocks").alterColumn("nonce", (col) => col.dropNotNull()).execute();
    }
  },
  "2024_03_00_0_log_transaction_hash_index": {
    async up(db) {
      await db.schema.createIndex("log_transaction_hash_index").on("logs").column("transactionHash").execute();
    }
  },
  "2024_03_13_0_nullable_block_columns_sha3uncles": {
    async up(db) {
      await db.schema.alterTable("blocks").alterColumn("sha3Uncles", (col) => col.dropNotNull()).execute();
    }
  },
  "2024_03_14_0_nullable_transaction_rsv": {
    async up(db) {
      await db.schema.alterTable("transactions").alterColumn("r", (col) => col.dropNotNull()).execute();
      await db.schema.alterTable("transactions").alterColumn("s", (col) => col.dropNotNull()).execute();
      await db.schema.alterTable("transactions").alterColumn("v", (col) => col.dropNotNull()).execute();
    }
  },
  "2024_03_20_0_checkpoint_in_logs_table": {
    async up(_db) {
      return;
    }
  },
  "2024_04_04_0_log_events_indexes": {
    async up(db) {
      await db.schema.dropIndex("blockNumberIndex").ifExists().execute();
      await db.schema.dropIndex("blockTimestampIndex").ifExists().execute();
      await db.schema.createIndex("logBlockNumberIndex").on("logs").column("blockNumber").execute();
    }
  },
  "2024_04_14_0_nullable_block_total_difficulty": {
    async up(db) {
      await db.schema.alterTable("blocks").alterColumn("totalDifficulty", (col) => col.dropNotNull()).execute();
    }
  },
  "2024_04_14_1_add_checkpoint_column_to_logs_table": {
    async up(db) {
      await db.executeQuery(
        sql`
        ALTER TABLE ponder_sync.logs 
        ADD COLUMN IF NOT EXISTS 
        checkpoint varchar(75)`.compile(db)
      );
    }
  },
  "2024_04_14_2_set_checkpoint_in_logs_table": {
    async up(db) {
      await db.executeQuery(sql`SET statement_timeout = 3600000;`.compile(db));
      await db.executeQuery(
        sql`
        CREATE TEMP TABLE cp_vals AS 
        SELECT
          logs.id,
          (lpad(blocks.timestamp::text, 10, '0') ||
          lpad(blocks."chainId"::text, 16, '0') ||
          lpad(blocks.number::text, 16, '0') ||
          lpad(logs."transactionIndex"::text, 16, '0') ||
          '5' ||
          lpad(logs."logIndex"::text, 16, '0')) AS checkpoint
        FROM ponder_sync.logs logs
        JOIN ponder_sync.blocks blocks ON logs."blockHash" = blocks.hash;
        `.compile(db)
      );
      await db.executeQuery(
        sql`
        CREATE INDEX ON cp_vals(id)
        `.compile(db)
      );
      await db.executeQuery(
        sql`
          UPDATE ponder_sync.logs
          SET checkpoint=cp_vals.checkpoint
          FROM cp_vals
          WHERE ponder_sync.logs.id = cp_vals.id
        `.compile(db)
      );
    }
  },
  "2024_04_14_3_index_on_logs_checkpoint": {
    async up(db) {
      await db.schema.createIndex("logs_checkpoint_index").ifNotExists().on("logs").column("checkpoint").execute();
    }
  },
  "2024_04_22_0_transaction_receipts": {
    async up(db) {
      await db.schema.alterTable("logFilterIntervals").dropConstraint("logFilterIntervals_logFilterId_fkey").execute();
      await db.updateTable("logFilters").set({ id: sql`"id" || '_0'` }).execute();
      await db.updateTable("logFilterIntervals").set({ logFilterId: sql`"logFilterId" || '_0'` }).execute();
      await db.schema.alterTable("logFilters").addColumn(
        "includeTransactionReceipts",
        "integer",
        (col) => col.notNull().defaultTo(0)
      ).execute();
      await db.schema.alterTable("logFilters").alterColumn("includeTransactionReceipts", (col) => col.dropDefault()).execute();
      await db.schema.alterTable("factoryLogFilterIntervals").dropConstraint("factoryLogFilterIntervals_factoryId_fkey").execute();
      await db.updateTable("factories").set({ id: sql`"id" || '_0'` }).execute();
      await db.updateTable("factoryLogFilterIntervals").set({ factoryId: sql`"factoryId" || '_0'` }).execute();
      await db.schema.alterTable("factories").addColumn(
        "includeTransactionReceipts",
        "integer",
        (col) => col.notNull().defaultTo(0)
      ).execute();
      await db.schema.alterTable("factories").alterColumn("includeTransactionReceipts", (col) => col.dropDefault()).execute();
      await db.schema.createTable("transactionReceipts").addColumn("blockHash", "varchar(66)", (col) => col.notNull()).addColumn("blockNumber", "numeric(78, 0)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("contractAddress", "varchar(66)").addColumn(
        "cumulativeGasUsed",
        "numeric(78, 0)",
        (col) => col.notNull()
      ).addColumn(
        "effectiveGasPrice",
        "numeric(78, 0)",
        (col) => col.notNull()
      ).addColumn("from", "varchar(42)", (col) => col.notNull()).addColumn("gasUsed", "numeric(78, 0)", (col) => col.notNull()).addColumn("logs", "text", (col) => col.notNull()).addColumn("logsBloom", "varchar(514)", (col) => col.notNull()).addColumn("status", "text", (col) => col.notNull()).addColumn("to", "varchar(42)").addColumn(
        "transactionHash",
        "varchar(66)",
        (col) => col.notNull().primaryKey()
      ).addColumn("transactionIndex", "integer", (col) => col.notNull()).addColumn("type", "text", (col) => col.notNull()).execute();
    }
  },
  "2024_04_23_0_block_filters": {
    async up(db) {
      await db.schema.createTable("blockFilters").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("interval", "integer", (col) => col.notNull()).addColumn("offset", "integer", (col) => col.notNull()).execute();
      await db.schema.createTable("blockFilterIntervals").addColumn("id", "serial", (col) => col.notNull().primaryKey()).addColumn(
        "blockFilterId",
        "text",
        (col) => col.notNull().references("blockFilters.id")
      ).addColumn("startBlock", "numeric(78, 0)", (col) => col.notNull()).addColumn("endBlock", "numeric(78, 0)", (col) => col.notNull()).execute();
      await db.schema.createIndex("blockFilterIntervalsBlockFilterId").on("blockFilterIntervals").column("blockFilterId").execute();
      await db.schema.alterTable("blocks").addColumn("checkpoint", "varchar(75)").execute();
      await db.executeQuery(
        sql`
          CREATE TEMP TABLE bcp_vals AS 
          SELECT
            blocks.hash,
            (lpad(blocks.timestamp::text, 10, '0') ||
            lpad(blocks."chainId"::text, 16, '0') ||
            lpad(blocks.number::text, 16, '0') ||
            '9999999999999999' ||
            '5' ||
            '0000000000000000') AS checkpoint
          FROM ponder_sync.blocks
          `.compile(db)
      );
      await db.executeQuery(
        sql`
          UPDATE ponder_sync.blocks
          SET checkpoint=bcp_vals.checkpoint
          FROM bcp_vals
          WHERE ponder_sync.blocks.hash = bcp_vals.hash
        `.compile(db)
      );
      await db.schema.alterTable("blocks").alterColumn("checkpoint", (col) => col.setNotNull()).execute();
      await db.schema.createIndex("blockNumberIndex").on("blocks").column("number").execute();
      await db.schema.createIndex("blockChainIdIndex").on("blocks").column("chainId").execute();
      await db.schema.createIndex("blockCheckpointIndex").on("blocks").column("checkpoint").execute();
    }
  },
  "2024_05_07_0_trace_filters": {
    async up(db) {
      await db.schema.createTable("traceFilters").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("fromAddress", "varchar(42)").addColumn("toAddress", "varchar(42)").execute();
      await db.schema.createTable("traceFilterIntervals").addColumn("id", "serial", (col) => col.notNull().primaryKey()).addColumn("traceFilterId", "text", (col) => col.notNull()).addColumn("startBlock", "numeric(78, 0)", (col) => col.notNull()).addColumn("endBlock", "numeric(78, 0)", (col) => col.notNull()).execute();
      await db.schema.createIndex("traceFilterIntervalsTraceFilterId").on("traceFilterIntervals").column("traceFilterId").execute();
      await db.schema.createTable("callTraces").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("callType", "text", (col) => col.notNull()).addColumn("from", "varchar(42)", (col) => col.notNull()).addColumn("gas", "numeric(78, 0)", (col) => col.notNull()).addColumn("input", "text", (col) => col.notNull()).addColumn("to", "varchar(42)", (col) => col.notNull()).addColumn("value", "numeric(78, 0)", (col) => col.notNull()).addColumn("blockHash", "varchar(66)", (col) => col.notNull()).addColumn("blockNumber", "numeric(78, 0)", (col) => col.notNull()).addColumn("error", "text").addColumn("gasUsed", "numeric(78, 0)").addColumn("output", "text").addColumn("subtraces", "integer", (col) => col.notNull()).addColumn("traceAddress", "text", (col) => col.notNull()).addColumn("transactionHash", "varchar(66)", (col) => col.notNull()).addColumn("transactionPosition", "integer", (col) => col.notNull()).addColumn("functionSelector", "varchar(10)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("checkpoint", "varchar(75)", (col) => col.notNull()).execute();
      await db.schema.createIndex("callTracesBlockNumberIndex").on("callTraces").column("blockNumber").execute();
      await db.schema.createIndex("callTracesFunctionSelectorIndex").on("callTraces").column("functionSelector").execute();
      await db.schema.createIndex("callTracesErrorIndex").on("callTraces").column("error").execute();
      await db.schema.createIndex("callTracesBlockHashIndex").on("callTraces").column("blockHash").execute();
      await db.schema.createIndex("callTracesTransactionHashIndex").on("callTraces").column("transactionHash").execute();
      await db.schema.createIndex("callTracesCheckpointIndex").on("callTraces").column("checkpoint").execute();
      await db.schema.createIndex("callTracesChainIdIndex").on("callTraces").column("chainId").execute();
      await db.schema.createIndex("callTracesFromIndex").on("callTraces").column("from").execute();
      await db.schema.createIndex("callTracesToIndex").on("callTraces").column("to").execute();
      await db.schema.alterTable("factories").renameTo("factoryLogFilters").execute();
      await db.schema.createTable("factoryTraceFilters").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("address", "varchar(42)", (col) => col.notNull()).addColumn("eventSelector", "varchar(66)", (col) => col.notNull()).addColumn("childAddressLocation", "text", (col) => col.notNull()).addColumn("fromAddress", "varchar(42)").execute();
      await db.schema.createTable("factoryTraceFilterIntervals").addColumn("id", "serial", (col) => col.notNull().primaryKey()).addColumn("factoryId", "text").addColumn("startBlock", "numeric(78, 0)", (col) => col.notNull()).addColumn("endBlock", "numeric(78, 0)", (col) => col.notNull()).execute();
      await db.schema.createIndex("factoryTraceFilterIntervalsFactoryId").on("factoryTraceFilterIntervals").column("factoryId").execute();
    }
  }
};
var StaticMigrationProvider = class {
  async getMigrations() {
    return migrations;
  }
};
var migrationProvider = new StaticMigrationProvider();
async function moveLegacyTables({
  common,
  db,
  newSchemaName
}) {
  let hasLegacyMigrations = false;
  try {
    const { rows } = await db.executeQuery(
      sql`SELECT * FROM public.kysely_migration LIMIT 1`.compile(db)
    );
    if (rows[0]?.name === "2023_05_15_0_initial")
      hasLegacyMigrations = true;
  } catch (e) {
    const error = e;
    if (!error.message.includes("does not exist"))
      throw error;
  }
  if (!hasLegacyMigrations)
    return;
  common.logger.warn({
    service: "database",
    msg: "Detected legacy sync migrations. Moving tables from 'public' schema to 'ponder_sync'."
  });
  async function moveOrDeleteTable(tableName) {
    try {
      await db.schema.alterTable(`public.${tableName}`).setSchema(newSchemaName).execute();
    } catch (e) {
      const error = e;
      switch (error.message) {
        case `relation "${tableName}" already exists in schema "${newSchemaName}"`: {
          await db.schema.dropTable(`public.${tableName}`).execute().catch(() => {
          });
          break;
        }
        case `relation "public.${tableName}" does not exist`: {
          break;
        }
        default: {
          common.logger.warn({
            service: "database",
            msg: `Failed to migrate table "${tableName}" to "ponder_sync" schema: ${error.message}`
          });
        }
      }
    }
    common.logger.warn({
      service: "database",
      msg: `Successfully moved 'public.${tableName}' table to 'ponder_sync' schema.`
    });
  }
  const tableNames = [
    "kysely_migration",
    "kysely_migration_lock",
    "blocks",
    "logs",
    "transactions",
    "rpcRequestResults",
    // Note that logFilterIntervals has a constraint that uses logFilters,
    // so the order here matters. Same story with factoryLogFilterIntervals.
    "logFilterIntervals",
    "logFilters",
    "factoryLogFilterIntervals",
    "factories",
    // Old ones that are no longer being used, but should still be moved
    // so that older migrations work as expected.
    "contractReadResults",
    "logFilterCachedRanges"
  ];
  for (const tableName of tableNames) {
    await moveOrDeleteTable(tableName);
  }
}

// src/utils/checkpoint.ts
var BLOCK_TIMESTAMP_DIGITS = 10;
var CHAIN_ID_DIGITS = 16;
var BLOCK_NUMBER_DIGITS = 16;
var TRANSACTION_INDEX_DIGITS = 16;
var EVENT_TYPE_DIGITS = 1;
var EVENT_INDEX_DIGITS = 16;
var CHECKPOINT_LENGTH = BLOCK_TIMESTAMP_DIGITS + CHAIN_ID_DIGITS + BLOCK_NUMBER_DIGITS + TRANSACTION_INDEX_DIGITS + EVENT_TYPE_DIGITS + EVENT_INDEX_DIGITS;
var EVENT_TYPES = {
  blocks: 5,
  logs: 5,
  callTraces: 7
};
var encodeCheckpoint = (checkpoint) => {
  const {
    blockTimestamp,
    chainId,
    blockNumber,
    transactionIndex,
    eventType,
    eventIndex
  } = checkpoint;
  if (eventType < 0 || eventType > 9)
    throw new Error(
      `Got invalid event type ${eventType}, expected a number from 0 to 9`
    );
  const result = blockTimestamp.toString().padStart(BLOCK_TIMESTAMP_DIGITS, "0") + chainId.toString().padStart(CHAIN_ID_DIGITS, "0") + blockNumber.toString().padStart(BLOCK_NUMBER_DIGITS, "0") + transactionIndex.toString().padStart(TRANSACTION_INDEX_DIGITS, "0") + eventType.toString() + eventIndex.toString().padStart(EVENT_INDEX_DIGITS, "0");
  if (result.length !== CHECKPOINT_LENGTH)
    throw new Error(`Invalid stringified checkpoint: ${result}`);
  return result;
};
var decodeCheckpoint = (checkpoint) => {
  let offset = 0;
  const blockTimestamp = +checkpoint.slice(
    offset,
    offset + BLOCK_TIMESTAMP_DIGITS
  );
  offset += BLOCK_TIMESTAMP_DIGITS;
  const chainId = BigInt(checkpoint.slice(offset, offset + CHAIN_ID_DIGITS));
  offset += CHAIN_ID_DIGITS;
  const blockNumber = BigInt(
    checkpoint.slice(offset, offset + BLOCK_NUMBER_DIGITS)
  );
  offset += BLOCK_NUMBER_DIGITS;
  const transactionIndex = BigInt(
    checkpoint.slice(offset, offset + TRANSACTION_INDEX_DIGITS)
  );
  offset += TRANSACTION_INDEX_DIGITS;
  const eventType = +checkpoint.slice(offset, offset + EVENT_TYPE_DIGITS);
  offset += EVENT_TYPE_DIGITS;
  const eventIndex = BigInt(
    checkpoint.slice(offset, offset + EVENT_INDEX_DIGITS)
  );
  offset += EVENT_INDEX_DIGITS;
  return {
    blockTimestamp,
    chainId,
    blockNumber,
    transactionIndex,
    eventType,
    eventIndex
  };
};
var zeroCheckpoint = {
  blockTimestamp: 0,
  chainId: 0n,
  blockNumber: 0n,
  transactionIndex: 0n,
  eventType: 0,
  eventIndex: 0n
};
var maxCheckpoint = {
  blockTimestamp: 9999999999,
  chainId: 9999999999999999n,
  blockNumber: 9999999999999999n,
  transactionIndex: 9999999999999999n,
  eventType: 9,
  eventIndex: 9999999999999999n
};
var isCheckpointEqual = (a, b) => encodeCheckpoint(a) === encodeCheckpoint(b);
var isCheckpointGreaterThan = (a, b) => encodeCheckpoint(a) > encodeCheckpoint(b);
var checkpointMin = (...checkpoints) => checkpoints.reduce((min, checkpoint) => {
  return isCheckpointGreaterThan(min, checkpoint) ? checkpoint : min;
});
var LATEST = encodeCheckpoint(maxCheckpoint);

// src/utils/hash.ts
import { createHash as createHash3 } from "node:crypto";
function hash(value) {
  return createHash3("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 10);
}

// src/utils/pg.ts
import pg from "pg";

// src/utils/print.ts
function prettyPrint(args) {
  const entries = Object.entries(args).map(([key, value]) => {
    if (value === void 0)
      return null;
    const trimmedValue = typeof value === "string" && value.length > 80 ? value.slice(0, 80).concat("...") : value;
    return [key, trimmedValue];
  }).filter(Boolean);
  const maxLength = entries.reduce(
    (acc, [key]) => Math.max(acc, key.length),
    0
  );
  return entries.map(([key, value]) => `  ${`${key}`.padEnd(maxLength + 1)}  ${value}`).join("\n");
}

// src/utils/pg.ts
pg.types.setTypeParser(pg.types.builtins.NUMERIC, BigInt);
pg.types.setTypeParser(pg.types.builtins.INT8, Number);
var originalClientQuery = pg.Client.prototype.query;
pg.Client.prototype.query = function query(...args) {
  try {
    return originalClientQuery.apply(this, args);
  } catch (error_) {
    const error = error_;
    const [statement, parameters_] = args ?? ["empty", []];
    error.name = "PostgresError";
    let parameters = parameters_ ?? [];
    parameters = parameters.length <= 25 ? parameters : parameters.slice(0, 26).concat(["..."]);
    const params = parameters.reduce(
      (acc, parameter, idx) => {
        acc[idx + 1] = parameter;
        return acc;
      },
      {}
    );
    const metaMessages = [];
    if (error.detail)
      metaMessages.push(`Detail:
  ${error.detail}`);
    metaMessages.push(`Statement:
  ${statement}`);
    metaMessages.push(`Parameters:
${prettyPrint(params)}`);
    error.meta = metaMessages.join("\n");
    throw error;
  }
};
function createPool(config) {
  return new pg.Pool({
    // https://stackoverflow.com/questions/59155572/how-to-set-query-timeout-in-relation-to-statement-timeout
    statement_timeout: 2 * 60 * 1e3,
    // 2 minutes
    ...config
  });
}

// src/database/postgres/service.ts
import {
  Migrator,
  PostgresDialect,
  WithSchemaPlugin,
  sql as sql2
} from "kysely";
import prometheus2 from "prom-client";

// src/database/kysely.ts
import { Kysely } from "kysely";
var RETRY_COUNT = 9;
var BASE_DURATION = 125;
var HeadlessKysely = class extends Kysely {
  common;
  name;
  isKilled = false;
  constructor({
    common,
    name,
    ...args
  }) {
    super(args);
    this.common = common;
    this.name = name;
  }
  async destroy() {
    this.isKilled = true;
  }
  wrap = async (options, fn) => {
    let firstError;
    let hasError = false;
    for (let i = 0; i <= RETRY_COUNT; i++) {
      const endClock = startClock();
      try {
        const result = await fn();
        this.common.metrics.ponder_database_method_duration.observe(
          { service: this.name, method: options.method },
          endClock()
        );
        return result;
      } catch (_error) {
        const error = _error;
        this.common.metrics.ponder_database_method_duration.observe(
          { service: this.name, method: options.method },
          endClock()
        );
        this.common.metrics.ponder_database_method_error_total.inc({
          service: this.name,
          method: options.method
        });
        if (this.isKilled) {
          this.common.logger.trace({
            service: this.name,
            msg: `Ignored error during '${options.method}' database method (service is killed)`
          });
          throw new IgnorableError();
        }
        if (!hasError) {
          hasError = true;
          firstError = error;
        }
        if (error instanceof NonRetryableError) {
          this.common.logger.warn({
            service: this.name,
            msg: `Failed '${options.method}' database method with non-retryable error: ${firstError.message}`
          });
          throw error;
        }
        if (i === RETRY_COUNT) {
          this.common.logger.warn({
            service: this.name,
            msg: `Failed '${options.method}' database method after '${i + 1}' attempts with error: ${firstError.message}`
          });
          throw firstError;
        }
        const duration = BASE_DURATION * 2 ** i;
        this.common.logger.debug({
          service: this.name,
          msg: `Failed '${options.method}' database method, retrying after ${duration} milliseconds. Error: ${error.message}`
        });
        await wait(duration);
      }
    }
  };
};

// src/database/revert.ts
var revertIndexingTables = async ({
  checkpoint,
  namespaceInfo,
  db
}) => {
  await db.wrap({ method: "revert" }, async () => {
    const encodedCheckpoint = encodeCheckpoint(checkpoint);
    await Promise.all(
      Object.entries(namespaceInfo.internalTableIds).map(
        async ([tableName, tableId]) => {
          await db.transaction().execute(async (tx) => {
            const rows = await tx.withSchema(namespaceInfo.internalNamespace).deleteFrom(tableId).returningAll().where("checkpoint", ">", encodedCheckpoint).execute();
            const reversed = rows.sort(
              (a, b) => b.operation_id - a.operation_id
            );
            for (const log of reversed) {
              if (log.operation === 0) {
                await tx.withSchema(namespaceInfo.userNamespace).deleteFrom(tableName).where("id", "=", log.id).execute();
              } else if (log.operation === 1) {
                log.operation_id = void 0;
                log.checkpoint = void 0;
                log.operation = void 0;
                await tx.withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(log).where("id", "=", log.id).execute();
              } else {
                log.operation_id = void 0;
                log.checkpoint = void 0;
                log.operation = void 0;
                await tx.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(log).execute();
              }
            }
          });
        }
      )
    );
  });
};

// src/database/postgres/migrations.ts
import "kysely";
import "kysely";
var migrations2 = {
  "2024_03_28_0_initial": {
    async up(db) {
      await db.schema.createTable("namespace_lock").ifNotExists().addColumn("namespace", "text", (col) => col.notNull().primaryKey()).addColumn("is_locked", "integer", (col) => col.notNull()).addColumn("heartbeat_at", "bigint", (col) => col.notNull()).addColumn("build_id", "text", (col) => col.notNull()).addColumn(
        "finalized_checkpoint",
        "varchar(75)",
        (col) => col.notNull()
      ).addColumn("schema", "jsonb", (col) => col.notNull()).execute();
    }
  }
};
var StaticMigrationProvider2 = class {
  async getMigrations() {
    return migrations2;
  }
};
var migrationProvider2 = new StaticMigrationProvider2();

// src/database/postgres/service.ts
var PostgresDatabaseService = class {
  kind = "postgres";
  internalNamespace = "ponder";
  common;
  userNamespace;
  publishSchema;
  db;
  syncDb;
  indexingDb;
  readonlyDb;
  schema = null;
  buildId = null;
  heartbeatInterval;
  // Only need these for metrics.
  internalPool;
  syncPool;
  indexingPool;
  readonlyPool;
  constructor({
    common,
    poolConfig,
    userNamespace,
    publishSchema,
    isReadonly = false
  }) {
    this.common = common;
    this.userNamespace = userNamespace;
    this.publishSchema = publishSchema;
    const internalMax = 2;
    const equalMax = Math.floor((poolConfig.max - internalMax) / 3);
    const [readonlyMax, indexingMax, syncMax] = isReadonly ? [poolConfig.max - internalMax, 0, 0] : [equalMax, equalMax, equalMax];
    this.internalPool = createPool({
      ...poolConfig,
      application_name: `${userNamespace}_internal`,
      max: internalMax,
      statement_timeout: 10 * 60 * 1e3
      // 10 minutes to accommodate slow sync store migrations.
    });
    this.syncPool = createPool({
      ...poolConfig,
      application_name: `${userNamespace}_sync`,
      max: readonlyMax
    });
    this.indexingPool = createPool({
      ...poolConfig,
      application_name: `${userNamespace}_indexing`,
      max: indexingMax
    });
    this.readonlyPool = createPool({
      ...poolConfig,
      application_name: `${userNamespace}_readonly`,
      max: syncMax
    });
    this.db = new HeadlessKysely({
      name: "internal",
      common,
      dialect: new PostgresDialect({ pool: this.internalPool }),
      log(event) {
        if (event.level === "query") {
          common.metrics.ponder_postgres_query_total.inc({ pool: "internal" });
        }
      }
    });
    this.syncDb = new HeadlessKysely({
      name: "sync",
      common,
      dialect: new PostgresDialect({ pool: this.syncPool }),
      log(event) {
        if (event.level === "query") {
          common.metrics.ponder_postgres_query_total.inc({ pool: "sync" });
        }
      },
      plugins: [new WithSchemaPlugin("ponder_sync")]
    });
    this.indexingDb = new HeadlessKysely({
      name: "indexing",
      common,
      dialect: new PostgresDialect({ pool: this.indexingPool }),
      log(event) {
        if (event.level === "query") {
          common.metrics.ponder_postgres_query_total.inc({ pool: "indexing" });
        }
      }
    });
    this.readonlyDb = new HeadlessKysely({
      name: "readonly",
      common,
      dialect: new PostgresDialect({ pool: this.readonlyPool }),
      log(event) {
        if (event.level === "query") {
          common.metrics.ponder_postgres_query_total.inc({ pool: "readonly" });
        }
      }
    });
    this.registerMetrics();
  }
  async setup({ schema, buildId }) {
    this.schema = schema;
    this.buildId = buildId;
    await this.db.schema.createSchema(this.userNamespace).ifNotExists().execute();
    await this.db.schema.createSchema(this.internalNamespace).ifNotExists().execute();
    const migrator = new Migrator({
      db: this.db.withPlugin(new WithSchemaPlugin(this.internalNamespace)),
      provider: migrationProvider2,
      migrationTableSchema: this.internalNamespace
    });
    const result = await migrator.migrateToLatest();
    if (result.error)
      throw result.error;
    const namespaceInfo = {
      userNamespace: this.userNamespace,
      internalNamespace: this.internalNamespace,
      internalTableIds: Object.keys(getTables(schema)).reduce(
        (acc, tableName) => {
          acc[tableName] = hash([this.userNamespace, this.buildId, tableName]);
          return acc;
        },
        {}
      )
    };
    return this.db.wrap({ method: "setup" }, async () => {
      const attemptSetup = async () => {
        return await this.db.transaction().execute(async (tx) => {
          const previousLockRow = await tx.withSchema(this.internalNamespace).selectFrom("namespace_lock").selectAll().where("namespace", "=", this.userNamespace).executeTakeFirst();
          const newLockRow = {
            namespace: this.userNamespace,
            is_locked: 1,
            heartbeat_at: Date.now(),
            build_id: this.buildId,
            finalized_checkpoint: encodeCheckpoint(zeroCheckpoint),
            // Schema is encoded to be backwards compatible with old versions.
            // `schema` should have to properties "tables" and "enums".
            schema: encodeSchema(schema)
          };
          const createTables = async () => {
            for (const [tableName, table] of Object.entries(
              getTables(schema)
            )) {
              const tableId = namespaceInfo.internalTableIds[tableName];
              await tx.schema.withSchema(this.internalNamespace).createTable(tableId).$call(
                (builder) => this.buildOperationLogColumns(builder, table.table)
              ).execute();
              await tx.schema.withSchema(this.internalNamespace).createIndex(`${tableId}_checkpointIndex`).on(tableId).column("checkpoint").execute();
              try {
                await tx.schema.withSchema(this.userNamespace).createTable(tableName).$call(
                  (builder) => this.buildColumns(builder, schema, table.table)
                ).execute();
              } catch (err) {
                const error = err;
                if (!error.message.includes("already exists"))
                  throw error;
                throw new NonRetryableError(
                  `Unable to create table '${this.userNamespace}'.'${tableName}' because a table with that name already exists. Is there another application using the '${this.userNamespace}' database schema?`
                );
              }
              this.common.logger.info({
                service: "database",
                msg: `Created table '${this.userNamespace}'.'${tableName}'`
              });
            }
          };
          if (previousLockRow === void 0) {
            await tx.withSchema(this.internalNamespace).insertInto("namespace_lock").values(newLockRow).execute();
            this.common.logger.debug({
              service: "database",
              msg: `Acquired lock on new schema '${this.userNamespace}'`
            });
            await createTables();
            return { status: "success", checkpoint: zeroCheckpoint };
          }
          const expiresAt = previousLockRow.heartbeat_at + this.common.options.databaseHeartbeatTimeout;
          if (previousLockRow.is_locked === 1 && Date.now() <= expiresAt) {
            const expiresInMs = expiresAt - Date.now();
            return { status: "locked", expiresInMs };
          }
          if (this.common.options.command === "start" && previousLockRow.build_id === this.buildId && previousLockRow.finalized_checkpoint !== encodeCheckpoint(zeroCheckpoint)) {
            this.common.logger.info({
              service: "database",
              msg: `Detected cache hit for build '${this.buildId}' in schema '${this.userNamespace}' last active ${formatEta(
                Date.now() - previousLockRow.heartbeat_at
              )} ago`
            });
            for (const [tableName, table] of Object.entries(
              getTables(schema)
            )) {
              if (table.constraints === void 0)
                continue;
              for (const name of Object.keys(table.constraints)) {
                await tx.schema.withSchema(this.userNamespace).dropIndex(`${tableName}_${name}`).ifExists().execute();
                this.common.logger.info({
                  service: "database",
                  msg: `Dropped index '${tableName}_${name}' in schema '${this.userNamespace}'`
                });
              }
            }
            await tx.withSchema(this.internalNamespace).updateTable("namespace_lock").set({ is_locked: 1, heartbeat_at: Date.now() }).execute();
            this.common.logger.debug({
              service: "database",
              msg: `Acquired lock on schema '${this.userNamespace}'`
            });
            const finalizedCheckpoint2 = decodeCheckpoint(
              previousLockRow.finalized_checkpoint
            );
            this.common.logger.info({
              service: "database",
              msg: `Reverting operations prior to finalized checkpoint (timestamp=${finalizedCheckpoint2.blockTimestamp} chainId=${finalizedCheckpoint2.chainId} block=${finalizedCheckpoint2.blockNumber})`
            });
            const tx_ = tx;
            for (const [tableName, tableId] of Object.entries(
              namespaceInfo.internalTableIds
            )) {
              const rows = await tx_.withSchema(namespaceInfo.internalNamespace).deleteFrom(tableId).returningAll().where("checkpoint", ">", previousLockRow.finalized_checkpoint).execute();
              const reversed = rows.sort(
                (a, b) => b.operation_id - a.operation_id
              );
              for (const log of reversed) {
                if (log.operation === 0) {
                  await tx_.withSchema(namespaceInfo.userNamespace).deleteFrom(tableName).where("id", "=", log.id).execute();
                } else if (log.operation === 1) {
                  log.operation_id = void 0;
                  log.checkpoint = void 0;
                  log.operation = void 0;
                  await tx_.withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(log).where("id", "=", log.id).execute();
                } else {
                  log.operation_id = void 0;
                  log.checkpoint = void 0;
                  log.operation = void 0;
                  await tx_.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(log).execute();
                }
              }
              this.common.logger.info({
                service: "database",
                msg: `Reverted ${rows.length} unfinalized operations from existing '${tableName}' table`
              });
            }
            return {
              status: "success",
              checkpoint: finalizedCheckpoint2
            };
          }
          const previousBuildId = previousLockRow.build_id;
          const previousSchema = previousLockRow.schema;
          await tx.withSchema(this.internalNamespace).updateTable("namespace_lock").where("namespace", "=", this.userNamespace).set(newLockRow).execute();
          this.common.logger.debug({
            service: "database",
            msg: `Acquired lock on schema '${this.userNamespace}' previously used by build '${previousBuildId}'`
          });
          for (const tableName of Object.keys(previousSchema.tables)) {
            const tableId = hash([
              this.userNamespace,
              previousBuildId,
              tableName
            ]);
            await tx.schema.withSchema(this.internalNamespace).dropTable(tableId).ifExists().execute();
            await tx.schema.withSchema(this.userNamespace).dropTable(tableName).cascade().ifExists().execute();
            this.common.logger.debug({
              service: "database",
              msg: `Dropped '${tableName}' table left by previous build`
            });
          }
          await createTables();
          return { status: "success", checkpoint: zeroCheckpoint };
        });
      };
      const result2 = await attemptSetup();
      let finalizedCheckpoint;
      if (result2.status === "success") {
        finalizedCheckpoint = result2.checkpoint;
      } else {
        const { expiresInMs } = result2;
        this.common.logger.warn({
          service: "database",
          msg: `Schema '${this.userNamespace}' is locked by a different Ponder app`
        });
        this.common.logger.warn({
          service: "database",
          msg: `Waiting ${formatEta(expiresInMs)} for lock on schema '${this.userNamespace}' to expire...`
        });
        await wait(expiresInMs);
        const resultTwo = await attemptSetup();
        if (resultTwo.status === "locked") {
          throw new NonRetryableError(
            `Failed to acquire lock on schema '${this.userNamespace}'. A different Ponder app is actively using this schema.`
          );
        }
        finalizedCheckpoint = resultTwo.checkpoint;
      }
      this.heartbeatInterval = setInterval(async () => {
        try {
          const lockRow = await this.db.withSchema(this.internalNamespace).updateTable("namespace_lock").where("namespace", "=", this.userNamespace).set({ heartbeat_at: Date.now() }).returningAll().executeTakeFirst();
          this.common.logger.debug({
            service: "database",
            msg: `Updated heartbeat timestamp to ${lockRow?.heartbeat_at} for current build '${this.buildId}'`
          });
        } catch (err) {
          const error = err;
          this.common.logger.error({
            service: "database",
            msg: `Failed to update heartbeat timestamp, retrying in ${formatEta(
              this.common.options.databaseHeartbeatInterval
            )}`,
            error
          });
        }
      }, this.common.options.databaseHeartbeatInterval);
      return { checkpoint: finalizedCheckpoint, namespaceInfo };
    });
  }
  async revert({
    checkpoint,
    namespaceInfo
  }) {
    await revertIndexingTables({
      db: this.indexingDb,
      checkpoint,
      namespaceInfo
    });
  }
  async updateFinalizedCheckpoint({
    checkpoint
  }) {
    await this.db.wrap({ method: "updateFinalizedCheckpoint" }, async () => {
      await this.db.withSchema(this.internalNamespace).updateTable("namespace_lock").where("namespace", "=", this.userNamespace).set({ finalized_checkpoint: encodeCheckpoint(checkpoint) }).execute();
      this.common.logger.debug({
        service: "database",
        msg: `Updated finalized checkpoint to (timestamp=${checkpoint.blockTimestamp} chainId=${checkpoint.chainId} block=${checkpoint.blockNumber})`
      });
    });
  }
  async publish() {
    await this.db.wrap({ method: "publish" }, async () => {
      const publishSchema = this.publishSchema;
      if (publishSchema === void 0) {
        this.common.logger.debug({
          service: "database",
          msg: "Not publishing views, publish schema was not defined"
        });
        return;
      }
      await this.db.transaction().execute(async (tx) => {
        await tx.schema.createSchema(publishSchema).ifNotExists().execute();
        for (const tableName of Object.keys(getTables(this.schema))) {
          const result = await tx.executeQuery(
            sql2`
              SELECT table_type
              FROM information_schema.tables
              WHERE table_schema = '${sql2.raw(publishSchema)}'
              AND table_name = '${sql2.raw(tableName)}'
            `.compile(tx)
          );
          const isTable2 = result.rows[0]?.table_type === "BASE TABLE";
          if (isTable2) {
            this.common.logger.warn({
              service: "database",
              msg: `Unable to publish view '${publishSchema}'.'${tableName}' because a table with that name already exists`
            });
            continue;
          }
          const isView = result.rows[0]?.table_type === "VIEW";
          if (isView) {
            await tx.schema.withSchema(publishSchema).dropView(tableName).ifExists().execute();
            this.common.logger.debug({
              service: "database",
              msg: `Dropped existing view '${publishSchema}'.'${tableName}'`
            });
          }
          await tx.schema.withSchema(publishSchema).createView(tableName).as(
            tx.withSchema(this.userNamespace).selectFrom(tableName).selectAll()
          ).execute();
          this.common.logger.info({
            service: "database",
            msg: `Created view '${publishSchema}'.'${tableName}' serving data from '${this.userNamespace}'.'${tableName}'`
          });
        }
      });
    });
  }
  async createIndexes({ schema }) {
    await Promise.all(
      Object.entries(getTables(schema)).flatMap(([tableName, table]) => {
        if (table.constraints === void 0)
          return [];
        return Object.entries(table.constraints).map(async ([name, index]) => {
          await this.db.wrap({ method: "createIndexes" }, async () => {
            const indexName = `${tableName}_${name}`;
            const indexColumn = index[" column"];
            const order = index[" order"];
            const nulls = index[" nulls"];
            const columns = Array.isArray(indexColumn) ? indexColumn.map((ic) => `"${ic}"`).join(", ") : `"${indexColumn}" ${order === "asc" ? "ASC" : order === "desc" ? "DESC" : ""} ${nulls === "first" ? "NULLS FIRST" : nulls === "last" ? "NULLS LAST" : ""}`;
            await this.db.executeQuery(
              sql2`CREATE INDEX ${sql2.ref(indexName)} ON ${sql2.table(
                `${this.userNamespace}.${tableName}`
              )} (${sql2.raw(columns)})`.compile(this.db)
            );
          });
          this.common.logger.info({
            service: "database",
            msg: `Created index '${tableName}_${name}' on columns (${Array.isArray(index[" column"]) ? index[" column"].join(", ") : index[" column"]}) in schema '${this.userNamespace}'`
          });
        });
      })
    );
  }
  async kill() {
    await this.db.wrap({ method: "kill" }, async () => {
      clearInterval(this.heartbeatInterval);
      await this.db.withSchema(this.internalNamespace).updateTable("namespace_lock").where("namespace", "=", this.userNamespace).set({ is_locked: 0 }).returningAll().executeTakeFirst();
      this.common.logger.debug({
        service: "database",
        msg: `Released lock on namespace '${this.userNamespace}'`
      });
      await this.readonlyDb.destroy();
      await this.indexingDb.destroy();
      await this.syncDb.destroy();
      await this.db.destroy();
      await this.readonlyPool.end();
      await this.indexingPool.end();
      await this.syncPool.end();
      await this.internalPool.end();
      this.common.logger.debug({
        service: "database",
        msg: "Closed database connection pools"
      });
    });
  }
  async migrateSyncStore() {
    await this.db.wrap({ method: "migrateSyncStore" }, async () => {
      await moveLegacyTables({
        common: this.common,
        db: this.db,
        newSchemaName: "ponder_sync"
      });
      const migrator = new Migrator({
        db: this.db.withPlugin(new WithSchemaPlugin("ponder_sync")),
        provider: migrationProvider,
        migrationTableSchema: "ponder_sync"
      });
      const { error } = await migrator.migrateToLatest();
      if (error)
        throw error;
    });
  }
  buildColumns(builder, schema, table) {
    Object.entries(table).forEach(([columnName, column]) => {
      if (isOneColumn(column))
        return;
      if (isManyColumn(column))
        return;
      if (isEnumColumn(column)) {
        builder = builder.addColumn(columnName, "text", (col) => {
          if (isOptionalColumn(column) === false)
            col = col.notNull();
          if (isListColumn(column) === false) {
            col = col.check(
              sql2`${sql2.ref(columnName)} in (${sql2.join(
                getEnums(schema)[column[" enum"]].map((v) => sql2.lit(v))
              )})`
            );
          }
          return col;
        });
      } else if (isListColumn(column)) {
        builder = builder.addColumn(columnName, "text", (col) => {
          if (isOptionalColumn(column) === false)
            col = col.notNull();
          return col;
        });
      } else if (isJSONColumn(column)) {
        builder = builder.addColumn(columnName, "jsonb", (col) => {
          if (isOptionalColumn(column) === false)
            col = col.notNull();
          return col;
        });
      } else {
        builder = builder.addColumn(
          columnName,
          scalarToSqlType[column[" scalar"]],
          (col) => {
            if (isOptionalColumn(column) === false)
              col = col.notNull();
            if (columnName === "id")
              col = col.primaryKey();
            return col;
          }
        );
      }
    });
    return builder;
  }
  buildOperationLogColumns(builder, table) {
    Object.entries(table).forEach(([columnName, column]) => {
      if (isOneColumn(column))
        return;
      if (isManyColumn(column))
        return;
      if (isEnumColumn(column)) {
        builder = builder.addColumn(columnName, "text");
      } else if (isListColumn(column)) {
        builder = builder.addColumn(columnName, "text");
      } else if (isJSONColumn(column)) {
        builder = builder.addColumn(columnName, "jsonb");
      } else {
        builder = builder.addColumn(
          columnName,
          scalarToSqlType[column[" scalar"]],
          (col) => {
            if (columnName === "id")
              col = col.notNull();
            return col;
          }
        );
      }
    });
    builder = builder.addColumn("operation_id", "serial", (col) => col.notNull().primaryKey()).addColumn("checkpoint", "varchar(75)", (col) => col.notNull()).addColumn("operation", "integer", (col) => col.notNull());
    return builder;
  }
  registerMetrics() {
    const service = this;
    this.common.metrics.registry.removeSingleMetric(
      "ponder_postgres_query_total"
    );
    this.common.metrics.ponder_postgres_query_total = new prometheus2.Counter({
      name: "ponder_postgres_query_total",
      help: "Total number of queries submitted to the database",
      labelNames: ["pool"],
      registers: [this.common.metrics.registry]
    });
    this.common.metrics.registry.removeSingleMetric(
      "ponder_postgres_pool_connections"
    );
    this.common.metrics.ponder_postgres_pool_connections = new prometheus2.Gauge(
      {
        name: "ponder_postgres_pool_connections",
        help: "Number of connections in the pool",
        labelNames: ["pool", "kind"],
        registers: [this.common.metrics.registry],
        collect() {
          this.set(
            { pool: "internal", kind: "idle" },
            service.internalPool.idleCount
          );
          this.set(
            { pool: "internal", kind: "total" },
            service.internalPool.totalCount
          );
          this.set({ pool: "sync", kind: "idle" }, service.syncPool.idleCount);
          this.set(
            { pool: "sync", kind: "total" },
            service.syncPool.totalCount
          );
          this.set(
            { pool: "indexing", kind: "idle" },
            service.indexingPool.idleCount
          );
          this.set(
            { pool: "indexing", kind: "total" },
            service.indexingPool.totalCount
          );
          this.set(
            { pool: "readonly", kind: "idle" },
            service.readonlyPool.idleCount
          );
          this.set(
            { pool: "readonly", kind: "total" },
            service.readonlyPool.totalCount
          );
        }
      }
    );
    this.common.metrics.registry.removeSingleMetric(
      "ponder_postgres_query_queue_size"
    );
    this.common.metrics.ponder_postgres_query_queue_size = new prometheus2.Gauge(
      {
        name: "ponder_postgres_query_queue_size",
        help: "Number of query requests waiting for an available connection",
        labelNames: ["pool"],
        registers: [this.common.metrics.registry],
        collect() {
          this.set({ pool: "internal" }, service.internalPool.waitingCount);
          this.set({ pool: "sync" }, service.syncPool.waitingCount);
          this.set({ pool: "indexing" }, service.indexingPool.waitingCount);
          this.set({ pool: "readonly" }, service.readonlyPool.waitingCount);
        }
      }
    );
  }
};
var scalarToSqlType = {
  boolean: "integer",
  int: "integer",
  float: "float8",
  string: "text",
  bigint: "numeric(78, 0)",
  hex: "bytea"
};

// src/database/sqlite/service.ts
import { existsSync as existsSync3, rmSync } from "node:fs";
import path7 from "node:path";

// src/sync-store/sqlite/migrations.ts
import { sql as sql3 } from "kysely";
var migrations3 = {
  "2023_05_15_0_initial": {
    async up(db) {
      await db.schema.createTable("blocks").addColumn("baseFeePerGas", "blob").addColumn("chainId", "integer", (col) => col.notNull()).addColumn("difficulty", "blob", (col) => col.notNull()).addColumn("extraData", "text", (col) => col.notNull()).addColumn("finalized", "integer", (col) => col.notNull()).addColumn("gasLimit", "blob", (col) => col.notNull()).addColumn("gasUsed", "blob", (col) => col.notNull()).addColumn("hash", "text", (col) => col.notNull().primaryKey()).addColumn("logsBloom", "text", (col) => col.notNull()).addColumn("miner", "text", (col) => col.notNull()).addColumn("mixHash", "text", (col) => col.notNull()).addColumn("nonce", "text", (col) => col.notNull()).addColumn("number", "blob", (col) => col.notNull()).addColumn("parentHash", "text", (col) => col.notNull()).addColumn("receiptsRoot", "text", (col) => col.notNull()).addColumn("sha3Uncles", "text", (col) => col.notNull()).addColumn("size", "blob", (col) => col.notNull()).addColumn("stateRoot", "text", (col) => col.notNull()).addColumn("timestamp", "blob", (col) => col.notNull()).addColumn("totalDifficulty", "blob", (col) => col.notNull()).addColumn("transactionsRoot", "text", (col) => col.notNull()).execute();
      await db.schema.createTable("transactions").addColumn("accessList", "text").addColumn("blockHash", "text", (col) => col.notNull()).addColumn("blockNumber", "blob", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("finalized", "integer", (col) => col.notNull()).addColumn("from", "text", (col) => col.notNull()).addColumn("gas", "blob", (col) => col.notNull()).addColumn("gasPrice", "blob").addColumn("hash", "text", (col) => col.notNull().primaryKey()).addColumn("input", "text", (col) => col.notNull()).addColumn("maxFeePerGas", "blob").addColumn("maxPriorityFeePerGas", "blob").addColumn("nonce", "integer", (col) => col.notNull()).addColumn("r", "text", (col) => col.notNull()).addColumn("s", "text", (col) => col.notNull()).addColumn("to", "text").addColumn("transactionIndex", "integer", (col) => col.notNull()).addColumn("type", "text", (col) => col.notNull()).addColumn("value", "blob", (col) => col.notNull()).addColumn("v", "blob", (col) => col.notNull()).execute();
      await db.schema.createTable("logs").addColumn("address", "text", (col) => col.notNull()).addColumn("blockHash", "text", (col) => col.notNull()).addColumn("blockNumber", "blob", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("data", "text", (col) => col.notNull()).addColumn("finalized", "integer", (col) => col.notNull()).addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("logIndex", "integer", (col) => col.notNull()).addColumn("topic0", "text").addColumn("topic1", "text").addColumn("topic2", "text").addColumn("topic3", "text").addColumn("transactionHash", "text", (col) => col.notNull()).addColumn("transactionIndex", "integer", (col) => col.notNull()).execute();
      await db.schema.createTable("contractReadResults").addColumn("address", "text", (col) => col.notNull()).addColumn("blockNumber", "blob", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("data", "text", (col) => col.notNull()).addColumn("finalized", "integer", (col) => col.notNull()).addColumn("result", "text", (col) => col.notNull()).addPrimaryKeyConstraint("contractReadResultPrimaryKey", [
        "chainId",
        "blockNumber",
        "address",
        "data"
      ]).execute();
      await db.schema.createTable("logFilterCachedRanges").addColumn("endBlock", "blob", (col) => col.notNull()).addColumn("endBlockTimestamp", "blob", (col) => col.notNull()).addColumn("filterKey", "text", (col) => col.notNull()).addColumn("id", "integer", (col) => col.notNull().primaryKey()).addColumn("startBlock", "blob", (col) => col.notNull()).execute();
    }
  },
  "2023_06_20_0_indices": {
    async up(db) {
      await db.schema.createIndex("log_events_index").on("logs").columns(["address", "chainId", "blockHash"]).execute();
      await db.schema.createIndex("blocks_index").on("blocks").columns(["timestamp", "number"]).execute();
      await db.schema.createIndex("logFilterCachedRanges_index").on("logFilterCachedRanges").columns(["filterKey"]).execute();
    }
  },
  "2023_07_18_0_better_indices": {
    async up(db) {
      await db.schema.dropIndex("log_events_index").execute();
      await db.schema.dropIndex("blocks_index").execute();
      await db.schema.createIndex("log_block_hash_index").on("logs").column("blockHash").execute();
      await db.schema.createIndex("log_chain_id_index").on("logs").column("chainId").execute();
      await db.schema.createIndex("log_address_index").on("logs").column("address").execute();
      await db.schema.createIndex("log_topic0_index").on("logs").column("topic0").execute();
      await db.schema.createIndex("block_timestamp_index").on("blocks").column("timestamp").execute();
      await db.schema.createIndex("block_number_index").on("blocks").column("number").execute();
    }
  },
  "2023_07_24_0_drop_finalized": {
    async up(db) {
      await db.schema.alterTable("blocks").dropColumn("finalized").execute();
      await db.schema.alterTable("transactions").dropColumn("finalized").execute();
      await db.schema.alterTable("logs").dropColumn("finalized").execute();
      await db.schema.alterTable("contractReadResults").dropColumn("finalized").execute();
    }
  },
  "2023_09_19_0_new_sync_design": {
    async up(db) {
      await db.schema.dropTable("logFilterCachedRanges").execute();
      await db.schema.dropTable("blocks").execute();
      await db.schema.createTable("blocks").addColumn("baseFeePerGas", "varchar(79)").addColumn("chainId", "integer", (col) => col.notNull()).addColumn("difficulty", "varchar(79)", (col) => col.notNull()).addColumn("extraData", "text", (col) => col.notNull()).addColumn("gasLimit", "varchar(79)", (col) => col.notNull()).addColumn("gasUsed", "varchar(79)", (col) => col.notNull()).addColumn("hash", "varchar(66)", (col) => col.notNull().primaryKey()).addColumn("logsBloom", "varchar(514)", (col) => col.notNull()).addColumn("miner", "varchar(42)", (col) => col.notNull()).addColumn("mixHash", "varchar(66)", (col) => col.notNull()).addColumn("nonce", "varchar(18)", (col) => col.notNull()).addColumn("number", "varchar(79)", (col) => col.notNull()).addColumn("parentHash", "varchar(66)", (col) => col.notNull()).addColumn("receiptsRoot", "varchar(66)", (col) => col.notNull()).addColumn("sha3Uncles", "varchar(66)", (col) => col.notNull()).addColumn("size", "varchar(79)", (col) => col.notNull()).addColumn("stateRoot", "varchar(66)", (col) => col.notNull()).addColumn("timestamp", "varchar(79)", (col) => col.notNull()).addColumn("totalDifficulty", "varchar(79)", (col) => col.notNull()).addColumn("transactionsRoot", "varchar(66)", (col) => col.notNull()).execute();
      await db.schema.createIndex("blockTimestampIndex").on("blocks").column("timestamp").execute();
      await db.schema.createIndex("blockNumberIndex").on("blocks").column("number").execute();
      await db.schema.dropTable("transactions").execute();
      await db.schema.createTable("transactions").addColumn("accessList", "text").addColumn("blockHash", "varchar(66)", (col) => col.notNull()).addColumn("blockNumber", "varchar(79)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("from", "varchar(42)", (col) => col.notNull()).addColumn("gas", "varchar(79)", (col) => col.notNull()).addColumn("gasPrice", "varchar(79)").addColumn("hash", "varchar(66)", (col) => col.notNull().primaryKey()).addColumn("input", "text", (col) => col.notNull()).addColumn("maxFeePerGas", "varchar(79)").addColumn("maxPriorityFeePerGas", "varchar(79)").addColumn("nonce", "integer", (col) => col.notNull()).addColumn("r", "varchar(66)", (col) => col.notNull()).addColumn("s", "varchar(66)", (col) => col.notNull()).addColumn("to", "varchar(42)").addColumn("transactionIndex", "integer", (col) => col.notNull()).addColumn("type", "text", (col) => col.notNull()).addColumn("value", "varchar(79)", (col) => col.notNull()).addColumn("v", "varchar(79)", (col) => col.notNull()).execute();
      await db.schema.dropTable("logs").execute();
      await db.schema.createTable("logs").addColumn("address", "varchar(42)", (col) => col.notNull()).addColumn("blockHash", "varchar(66)", (col) => col.notNull()).addColumn("blockNumber", "varchar(79)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("data", "text", (col) => col.notNull()).addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("logIndex", "integer", (col) => col.notNull()).addColumn("topic0", "varchar(66)").addColumn("topic1", "varchar(66)").addColumn("topic2", "varchar(66)").addColumn("topic3", "varchar(66)").addColumn("transactionHash", "varchar(66)", (col) => col.notNull()).addColumn("transactionIndex", "integer", (col) => col.notNull()).execute();
      await db.schema.createIndex("logBlockHashIndex").on("logs").column("blockHash").execute();
      await db.schema.createIndex("logChainIdIndex").on("logs").column("chainId").execute();
      await db.schema.createIndex("logAddressIndex").on("logs").column("address").execute();
      await db.schema.createIndex("logTopic0Index").on("logs").column("topic0").execute();
      await db.schema.dropTable("contractReadResults").execute();
      await db.schema.createTable("contractReadResults").addColumn("address", "varchar(42)", (col) => col.notNull()).addColumn("blockNumber", "varchar(79)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("data", "text", (col) => col.notNull()).addColumn("result", "text", (col) => col.notNull()).addPrimaryKeyConstraint("contractReadResultPrimaryKey", [
        "chainId",
        "blockNumber",
        "address",
        "data"
      ]).execute();
      await db.schema.createTable("logFilters").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("address", "varchar(66)").addColumn("topic0", "varchar(66)").addColumn("topic1", "varchar(66)").addColumn("topic2", "varchar(66)").addColumn("topic3", "varchar(66)").execute();
      await db.schema.createTable("logFilterIntervals").addColumn("id", "integer", (col) => col.notNull().primaryKey()).addColumn(
        "logFilterId",
        "text",
        (col) => col.notNull().references("logFilters.id")
      ).addColumn("startBlock", "varchar(79)", (col) => col.notNull()).addColumn("endBlock", "varchar(79)", (col) => col.notNull()).execute();
      await db.schema.createIndex("logFilterIntervalsLogFilterId").on("logFilterIntervals").column("logFilterId").execute();
      await db.schema.createTable("factories").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("address", "varchar(42)", (col) => col.notNull()).addColumn("eventSelector", "varchar(66)", (col) => col.notNull()).addColumn("childAddressLocation", "text", (col) => col.notNull()).addColumn("topic0", "varchar(66)").addColumn("topic1", "varchar(66)").addColumn("topic2", "varchar(66)").addColumn("topic3", "varchar(66)").execute();
      await db.schema.createTable("factoryLogFilterIntervals").addColumn("id", "integer", (col) => col.notNull().primaryKey()).addColumn(
        "factoryId",
        "text",
        (col) => col.notNull().references("factories.id")
      ).addColumn("startBlock", "varchar(79)", (col) => col.notNull()).addColumn("endBlock", "varchar(79)", (col) => col.notNull()).execute();
      await db.schema.createIndex("factoryLogFilterIntervalsFactoryId").on("factoryLogFilterIntervals").column("factoryId").execute();
    }
  },
  "2023_11_06_0_new_rpc_cache_design": {
    async up(db) {
      await db.schema.dropTable("contractReadResults").execute();
      await db.schema.createTable("rpcRequestResults").addColumn("request", "text", (col) => col.notNull()).addColumn("blockNumber", "varchar(79)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("result", "text", (col) => col.notNull()).addPrimaryKeyConstraint("rpcRequestResultPrimaryKey", [
        "request",
        "chainId",
        "blockNumber"
      ]).execute();
    }
  },
  "2024_02_1_0_nullable_block_columns": {
    async up(db) {
      await db.schema.alterTable("blocks").addColumn("mixHash_temp_null", "varchar(66)").execute();
      await db.updateTable("blocks").set((eb) => ({
        mixHash_temp_null: eb.selectFrom("blocks").select("mixHash")
      })).execute();
      await db.schema.alterTable("blocks").dropColumn("mixHash").execute();
      await db.schema.alterTable("blocks").renameColumn("mixHash_temp_null", "mixHash").execute();
      await db.schema.alterTable("blocks").addColumn("nonce_temp_null", "varchar(18)").execute();
      await db.updateTable("blocks").set((eb) => ({
        nonce_temp_null: eb.selectFrom("blocks").select("nonce")
      })).execute();
      await db.schema.alterTable("blocks").dropColumn("nonce").execute();
      await db.schema.alterTable("blocks").renameColumn("nonce_temp_null", "nonce").execute();
    }
  },
  "2024_03_00_0_log_transaction_hash_index": {
    async up(db) {
      await db.schema.createIndex("log_transaction_hash_index").on("logs").column("transactionHash").execute();
    }
  },
  "2024_03_13_0_nullable_block_columns_sha3uncles": {
    async up(db) {
      await columnDropNotNull({
        db,
        table: "blocks",
        column: "sha3Uncles",
        columnType: "varchar(66)"
      });
    }
  },
  "2024_03_14_0_nullable_transaction_rsv": {
    async up(db) {
      await columnDropNotNull({
        db,
        table: "transactions",
        column: "r",
        columnType: "varchar(66)"
      });
      await columnDropNotNull({
        db,
        table: "transactions",
        column: "s",
        columnType: "varchar(66)"
      });
      await columnDropNotNull({
        db,
        table: "transactions",
        column: "v",
        columnType: "varchar(79)"
      });
    }
  },
  "2024_03_20_0_checkpoint_in_logs_table": {
    async up(_db) {
      return;
    }
  },
  "2024_04_04_0_log_events_indexes": {
    async up(db) {
      await db.schema.dropIndex("blockNumberIndex").ifExists().execute();
      await db.schema.dropIndex("blockTimestampIndex").ifExists().execute();
      await db.schema.createIndex("logBlockNumberIndex").on("logs").column("blockNumber").execute();
    }
  },
  "2024_04_14_0_nullable_block_total_difficulty": {
    async up(db) {
      await columnDropNotNull({
        db,
        table: "blocks",
        column: "totalDifficulty",
        columnType: "varchar(79)"
      });
    }
  },
  "2024_04_14_1_add_checkpoint_column_to_logs_table": {
    async up(db) {
      if (await hasCheckpointCol(db)) {
        return;
      }
      await db.schema.alterTable("logs").addColumn("checkpoint", "varchar(75)").execute();
    }
  },
  "2024_04_14_2_set_checkpoint_in_logs_table": {
    async up(db) {
      await db.executeQuery(
        sql3`
        CREATE TEMPORARY TABLE cp_vals AS
        SELECT 
          logs.id,
          substr(blocks.timestamp, -10, 10) ||
            substr('0000000000000000' || blocks.chainId, -16, 16) ||
            substr(blocks.number, -16, 16) ||
            substr('0000000000000000' || logs.transactionIndex, -16, 16) ||
            '5' ||
            substr('0000000000000000' || logs.logIndex, -16, 16) as checkpoint
          FROM logs
          JOIN blocks ON logs."blockHash" = blocks.hash
      `.compile(db)
      );
      await db.executeQuery(
        sql3`
        UPDATE logs 
        SET checkpoint=cp_vals.checkpoint
        FROM cp_vals
        WHERE logs.id = cp_vals.id
      `.compile(db)
      );
    }
  },
  "2024_04_14_3_index_on_logs_checkpoint": {
    async up(db) {
      await db.schema.createIndex("logs_checkpoint_index").ifNotExists().on("logs").column("checkpoint").execute();
    }
  },
  "2024_04_22_0_transaction_receipts": {
    async up(db) {
      await db.executeQuery(sql3`PRAGMA foreign_keys = 0`.compile(db));
      await db.schema.alterTable("logFilters").renameTo("logFilters_temp").execute();
      await db.updateTable("logFilters_temp").set({ id: sql3`"id" || '_0'` }).execute();
      await db.schema.alterTable("logFilters_temp").addColumn(
        "includeTransactionReceipts",
        "integer",
        (col) => col.notNull().defaultTo(0)
      ).execute();
      await db.schema.alterTable("logFilterIntervals").renameTo("logFilterIntervals_temp").execute();
      await db.updateTable("logFilterIntervals_temp").set({ logFilterId: sql3`"logFilterId" || '_0'` }).execute();
      await db.schema.createTable("logFilters").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("address", "varchar(66)").addColumn("topic0", "varchar(66)").addColumn("topic1", "varchar(66)").addColumn("topic2", "varchar(66)").addColumn("topic3", "varchar(66)").addColumn(
        "includeTransactionReceipts",
        "integer",
        (col) => col.notNull()
      ).execute();
      await db.schema.createTable("logFilterIntervals").addColumn("id", "integer", (col) => col.notNull().primaryKey()).addColumn("logFilterId", "text", (col) => col.notNull()).addColumn("startBlock", "varchar(79)", (col) => col.notNull()).addColumn("endBlock", "varchar(79)", (col) => col.notNull()).execute();
      await db.executeQuery(
        sql3`INSERT INTO "logFilters" SELECT * FROM "logFilters_temp"`.compile(
          db
        )
      );
      await db.executeQuery(
        sql3`INSERT INTO "logFilterIntervals" SELECT * FROM "logFilterIntervals_temp"`.compile(
          db
        )
      );
      await db.schema.dropTable("logFilters_temp").execute();
      await db.schema.dropTable("logFilterIntervals_temp").execute();
      await db.schema.createIndex("logFilterIntervalsLogFilterId").on("logFilterIntervals").column("logFilterId").execute();
      await db.schema.alterTable("factories").renameTo("factories_temp").execute();
      await db.updateTable("factories_temp").set({ id: sql3`"id" || '_0'` }).execute();
      await db.schema.alterTable("factories_temp").addColumn(
        "includeTransactionReceipts",
        "integer",
        (col) => col.notNull().defaultTo(0)
      ).execute();
      await db.schema.alterTable("factoryLogFilterIntervals").renameTo("factoryLogFilterIntervals_temp").execute();
      await db.updateTable("factoryLogFilterIntervals_temp").set({ factoryId: sql3`"factoryId" || '_0'` }).execute();
      await db.schema.createTable("factories").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("address", "varchar(42)", (col) => col.notNull()).addColumn("eventSelector", "varchar(66)", (col) => col.notNull()).addColumn("childAddressLocation", "text", (col) => col.notNull()).addColumn("topic0", "varchar(66)").addColumn("topic1", "varchar(66)").addColumn("topic2", "varchar(66)").addColumn("topic3", "varchar(66)").addColumn(
        "includeTransactionReceipts",
        "integer",
        (col) => col.notNull()
      ).execute();
      await db.schema.createTable("factoryLogFilterIntervals").addColumn("id", "integer", (col) => col.notNull().primaryKey()).addColumn("factoryId", "text", (col) => col.notNull()).addColumn("startBlock", "varchar(79)", (col) => col.notNull()).addColumn("endBlock", "varchar(79)", (col) => col.notNull()).execute();
      await db.executeQuery(
        sql3`INSERT INTO "factories" SELECT * FROM "factories_temp"`.compile(db)
      );
      await db.executeQuery(
        sql3`INSERT INTO "factoryLogFilterIntervals" SELECT * FROM "factoryLogFilterIntervals_temp"`.compile(
          db
        )
      );
      await db.schema.dropTable("factories_temp").execute();
      await db.schema.dropTable("factoryLogFilterIntervals_temp").execute();
      await db.schema.createIndex("factoryLogFilterIntervalsFactoryId").on("factoryLogFilterIntervals").column("factoryId").execute();
      await db.schema.createTable("transactionReceipts").addColumn("blockHash", "varchar(66)", (col) => col.notNull()).addColumn("blockNumber", "varchar(79)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("contractAddress", "varchar(66)").addColumn("cumulativeGasUsed", "varchar(79)", (col) => col.notNull()).addColumn("effectiveGasPrice", "varchar(79)", (col) => col.notNull()).addColumn("from", "varchar(42)", (col) => col.notNull()).addColumn("gasUsed", "varchar(79)", (col) => col.notNull()).addColumn("logs", "text", (col) => col.notNull()).addColumn("logsBloom", "varchar(514)", (col) => col.notNull()).addColumn("status", "text", (col) => col.notNull()).addColumn("to", "varchar(42)").addColumn(
        "transactionHash",
        "varchar(66)",
        (col) => col.notNull().primaryKey()
      ).addColumn("transactionIndex", "integer", (col) => col.notNull()).addColumn("type", "text", (col) => col.notNull()).execute();
      await db.executeQuery(sql3`PRAGMA foreign_keys = 1`.compile(db));
    }
  },
  "2024_04_23_0_block_filters": {
    async up(db) {
      await db.schema.createTable("blockFilters").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("interval", "integer", (col) => col.notNull()).addColumn("offset", "integer", (col) => col.notNull()).execute();
      await db.schema.createTable("blockFilterIntervals").addColumn("id", "integer", (col) => col.notNull().primaryKey()).addColumn(
        "blockFilterId",
        "text",
        (col) => col.notNull().references("blockFilters.id")
      ).addColumn("startBlock", "varchar(79)", (col) => col.notNull()).addColumn("endBlock", "varchar(79)", (col) => col.notNull()).execute();
      await db.schema.createIndex("blockFilterIntervalsBlockFilterId").on("blockFilterIntervals").column("blockFilterId").execute();
      await db.schema.alterTable("blocks").addColumn("checkpoint", "varchar(75)").execute();
      await db.executeQuery(
        sql3`
          CREATE TEMPORARY TABLE bcp_vals AS
          SELECT 
            blocks.hash,
            substr(blocks.timestamp, -10, 10) ||
              substr('0000000000000000' || blocks.chainId, -16, 16) ||
              substr(blocks.number, -16, 16) ||
              '9999999999999999' ||
              '5' ||
              '0000000000000000' as checkpoint
            FROM blocks
        `.compile(db)
      );
      await db.executeQuery(
        sql3`
          UPDATE blocks 
          SET checkpoint=bcp_vals.checkpoint
          FROM bcp_vals
          WHERE blocks.hash = bcp_vals.hash
        `.compile(db)
      );
      await db.schema.alterTable("blocks").renameTo("blocks_temp").execute();
      await db.schema.createTable("blocks").addColumn("baseFeePerGas", "varchar(79)").addColumn("difficulty", "varchar(79)", (col) => col.notNull()).addColumn("extraData", "text", (col) => col.notNull()).addColumn("gasLimit", "varchar(79)", (col) => col.notNull()).addColumn("gasUsed", "varchar(79)", (col) => col.notNull()).addColumn("hash", "varchar(66)", (col) => col.notNull().primaryKey()).addColumn("logsBloom", "varchar(514)", (col) => col.notNull()).addColumn("miner", "varchar(42)", (col) => col.notNull()).addColumn("mixHash", "varchar(66)", (col) => col.notNull()).addColumn("nonce", "varchar(18)", (col) => col.notNull()).addColumn("number", "varchar(79)", (col) => col.notNull()).addColumn("parentHash", "varchar(66)", (col) => col.notNull()).addColumn("receiptsRoot", "varchar(66)", (col) => col.notNull()).addColumn("sha3Uncles", "varchar(66)", (col) => col.notNull()).addColumn("size", "varchar(79)", (col) => col.notNull()).addColumn("stateRoot", "varchar(66)", (col) => col.notNull()).addColumn("timestamp", "varchar(79)", (col) => col.notNull()).addColumn("totalDifficulty", "varchar(79)", (col) => col.notNull()).addColumn("transactionsRoot", "varchar(66)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("checkpoint", "varchar(75)", (col) => col.notNull()).execute();
      await db.executeQuery(
        sql3`INSERT INTO "blocks" SELECT * FROM "blocks_temp"`.compile(db)
      );
      await db.schema.dropTable("blocks_temp").execute();
      await db.schema.createIndex("blockNumberIndex").on("blocks").column("number").execute();
      await db.schema.createIndex("blockChainIdIndex").on("blocks").column("chainId").execute();
      await db.schema.createIndex("blockCheckpointIndex").on("blocks").column("checkpoint").execute();
    }
  },
  "2024_05_06_0_drop_not_null_block_columns": {
    async up(db) {
      await columnDropNotNull({
        db,
        table: "blocks",
        column: "baseFeePerGas",
        columnType: "varchar(79)"
      });
      await columnDropNotNull({
        db,
        table: "blocks",
        column: "mixHash",
        columnType: "varchar(66)"
      });
      await columnDropNotNull({
        db,
        table: "blocks",
        column: "nonce",
        columnType: "varchar(18)"
      });
      await columnDropNotNull({
        db,
        table: "blocks",
        column: "sha3Uncles",
        columnType: "varchar(66)"
      });
      await columnDropNotNull({
        db,
        table: "blocks",
        column: "totalDifficulty",
        columnType: "varchar(79)"
      });
    }
  },
  "2024_05_07_0_trace_filters": {
    async up(db) {
      await db.schema.createTable("traceFilters").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("fromAddress", "varchar(42)").addColumn("toAddress", "varchar(42)").execute();
      await db.schema.createTable("traceFilterIntervals").addColumn("id", "integer", (col) => col.notNull().primaryKey()).addColumn("traceFilterId", "text", (col) => col.notNull()).addColumn("startBlock", "varchar(79)", (col) => col.notNull()).addColumn("endBlock", "varchar(79)", (col) => col.notNull()).execute();
      await db.schema.createIndex("traceFilterIntervalsTraceFilterId").on("traceFilterIntervals").column("traceFilterId").execute();
      await db.schema.createTable("callTraces").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("callType", "text", (col) => col.notNull()).addColumn("from", "varchar(42)", (col) => col.notNull()).addColumn("gas", "varchar(79)", (col) => col.notNull()).addColumn("input", "text", (col) => col.notNull()).addColumn("to", "varchar(42)", (col) => col.notNull()).addColumn("value", "varchar(79)", (col) => col.notNull()).addColumn("blockHash", "varchar(66)", (col) => col.notNull()).addColumn("blockNumber", "varchar(79)", (col) => col.notNull()).addColumn("error", "text").addColumn("gasUsed", "varchar(79)").addColumn("output", "text").addColumn("subtraces", "integer", (col) => col.notNull()).addColumn("traceAddress", "text", (col) => col.notNull()).addColumn("transactionHash", "varchar(66)", (col) => col.notNull()).addColumn("transactionPosition", "integer", (col) => col.notNull()).addColumn("functionSelector", "varchar(10)", (col) => col.notNull()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("checkpoint", "varchar(75)", (col) => col.notNull()).execute();
      await db.schema.createIndex("callTracesBlockNumberIndex").on("callTraces").column("blockNumber").execute();
      await db.schema.createIndex("callTracesFunctionSelectorIndex").on("callTraces").column("functionSelector").execute();
      await db.schema.createIndex("callTracesErrorIndex").on("callTraces").column("error").execute();
      await db.schema.createIndex("callTracesBlockHashIndex").on("callTraces").column("blockHash").execute();
      await db.schema.createIndex("callTracesTransactionHashIndex").on("callTraces").column("transactionHash").execute();
      await db.schema.createIndex("callTracesCheckpointIndex").on("callTraces").column("checkpoint").execute();
      await db.schema.createIndex("callTracesChainIdIndex").on("callTraces").column("chainId").execute();
      await db.schema.createIndex("callTracesFromIndex").on("callTraces").column("from").execute();
      await db.schema.createIndex("callTracesToIndex").on("callTraces").column("to").execute();
      await db.schema.alterTable("factories").renameTo("factoryLogFilters").execute();
      await db.schema.createTable("factoryTraceFilters").addColumn("id", "text", (col) => col.notNull().primaryKey()).addColumn("chainId", "integer", (col) => col.notNull()).addColumn("address", "varchar(42)", (col) => col.notNull()).addColumn("eventSelector", "varchar(66)", (col) => col.notNull()).addColumn("childAddressLocation", "text", (col) => col.notNull()).addColumn("fromAddress", "varchar(42)").execute();
      await db.schema.createTable("factoryTraceFilterIntervals").addColumn("id", "integer", (col) => col.notNull().primaryKey()).addColumn("factoryId", "text").addColumn("startBlock", "varchar(79)", (col) => col.notNull()).addColumn("endBlock", "varchar(79)", (col) => col.notNull()).execute();
      await db.schema.createIndex("factoryTraceFilterIntervalsFactoryId").on("factoryTraceFilterIntervals").column("factoryId").execute();
    }
  }
};
async function hasCheckpointCol(db) {
  const res = await db.executeQuery(sql3`PRAGMA table_info("logs")`.compile(db));
  return res.rows.some((x) => x.name === "checkpoint");
}
var columnDropNotNull = async ({
  db,
  table,
  column,
  columnType
}) => {
  const tempName = `${column}_temp_null`;
  await db.schema.alterTable(table).addColumn(tempName, columnType).execute();
  await db.updateTable(table).set((eb) => ({ [tempName]: eb.selectFrom(table).select(column) })).execute();
  await db.schema.alterTable(table).dropColumn(column).execute();
  await db.schema.alterTable(table).renameColumn(tempName, column).execute();
};
var StaticMigrationProvider3 = class {
  async getMigrations() {
    return migrations3;
  }
};
var migrationProvider3 = new StaticMigrationProvider3();

// src/utils/sqlite.ts
import BetterSqlite3 from "better-sqlite3";

// src/utils/exists.ts
import { existsSync as existsSync2, mkdirSync as mkdirSync2 } from "node:fs";
import path6 from "node:path";
var ensureDirExists = (filePath) => {
  const dirname2 = path6.dirname(filePath);
  if (existsSync2(dirname2)) {
    return;
  }
  mkdirSync2(dirname2, { recursive: true });
};

// src/utils/sqlite.ts
function improveSqliteErrors(database) {
  const originalPrepare = database.prepare;
  database.prepare = (source) => {
    let statement;
    try {
      statement = originalPrepare.apply(database, [source]);
    } catch (error_) {
      const error = error_;
      error.name = "SqliteError";
      Error.captureStackTrace(error);
      const metaMessages = [];
      if (error.detail)
        metaMessages.push(`Detail:
  ${error.detail}`);
      metaMessages.push(`Statement:
  ${source}`);
      error.meta = metaMessages.join("\n");
      throw error;
    }
    const wrapper = (fn) => (...args) => {
      try {
        return fn.apply(statement, args);
      } catch (error_) {
        const error = error_;
        error.name = "SqliteError";
        let parameters = args[0] ?? [];
        parameters = parameters.length <= 25 ? parameters : parameters.slice(0, 26).concat(["..."]);
        const params = parameters.reduce(
          (acc, parameter, idx) => {
            acc[idx + 1] = parameter;
            return acc;
          },
          {}
        );
        const metaMessages = [];
        if (error.detail)
          metaMessages.push(`Detail:
  ${error.detail}`);
        metaMessages.push(`Statement:
  ${source}`);
        metaMessages.push(`Parameters:
${prettyPrint(params)}`);
        error.meta = metaMessages.join("\n");
        throw error;
      }
    };
    for (const method of ["run", "get", "all"]) {
      statement[method] = wrapper(statement[method]);
    }
    return statement;
  };
}
function createSqliteDatabase(file, options) {
  ensureDirExists(file);
  const database = new BetterSqlite3(file, options);
  improveSqliteErrors(database);
  database.pragma("journal_mode = WAL");
  return database;
}

// src/database/sqlite/service.ts
import {
  Migrator as Migrator2,
  SqliteDialect,
  WithSchemaPlugin as WithSchemaPlugin2,
  sql as sql4
} from "kysely";
import prometheus3 from "prom-client";

// src/database/sqlite/migrations.ts
import "kysely";
import "kysely";
var migrations4 = {
  "2024_03_28_0_initial": {
    async up(db) {
      await db.schema.createTable("namespace_lock").ifNotExists().addColumn("namespace", "text", (col) => col.notNull().primaryKey()).addColumn("is_locked", "integer", (col) => col.notNull()).addColumn("heartbeat_at", "integer", (col) => col.notNull()).addColumn("build_id", "text", (col) => col.notNull()).addColumn(
        "finalized_checkpoint",
        "varchar(75)",
        (col) => col.notNull()
      ).addColumn("schema", "jsonb", (col) => col.notNull()).execute();
    }
  }
};
var StaticMigrationProvider4 = class {
  async getMigrations() {
    return migrations4;
  }
};
var migrationProvider4 = new StaticMigrationProvider4();

// src/database/sqlite/service.ts
var SqliteDatabaseService = class {
  kind = "sqlite";
  common;
  directory;
  userNamespace;
  internalNamespace;
  internalDatabase;
  syncDatabase;
  db;
  readonlyDb;
  indexingDb;
  syncDb;
  buildId = null;
  heartbeatInterval;
  constructor({
    common,
    directory,
    userNamespace = "public"
  }) {
    this.common = common;
    this.directory = directory;
    this.deleteV3DatabaseFiles();
    this.userNamespace = userNamespace;
    const userDatabaseFile = path7.join(directory, `${userNamespace}.db`);
    this.internalNamespace = "main";
    const internalDatabaseFile = path7.join(directory, "ponder.db");
    this.internalDatabase = createSqliteDatabase(internalDatabaseFile);
    this.internalDatabase.exec(
      `ATTACH DATABASE '${userDatabaseFile}' AS ${this.userNamespace}`
    );
    this.db = new HeadlessKysely({
      name: "internal",
      common,
      dialect: new SqliteDialect({ database: this.internalDatabase }),
      log(event) {
        if (event.level === "query") {
          common.metrics.ponder_sqlite_query_total.inc({
            database: "internal"
          });
        }
      }
    });
    const syncDatabaseFile = path7.join(directory, "ponder_sync.db");
    this.syncDatabase = createSqliteDatabase(syncDatabaseFile);
    this.syncDb = new HeadlessKysely({
      name: "sync",
      common,
      dialect: new SqliteDialect({ database: this.syncDatabase }),
      log(event) {
        if (event.level === "query") {
          common.metrics.ponder_sqlite_query_total.inc({ database: "sync" });
        }
      }
    });
    this.indexingDb = new HeadlessKysely({
      name: "indexing",
      common,
      dialect: new SqliteDialect({ database: this.internalDatabase }),
      log(event) {
        if (event.level === "query") {
          common.metrics.ponder_sqlite_query_total.inc({
            database: "indexing"
          });
        }
      }
    });
    this.readonlyDb = new HeadlessKysely({
      name: "readonly",
      common,
      dialect: new SqliteDialect({ database: this.internalDatabase }),
      log(event) {
        if (event.level === "query") {
          common.metrics.ponder_sqlite_query_total.inc({
            database: "readonly"
          });
        }
      }
    });
    this.registerMetrics();
  }
  async setup({ schema, buildId }) {
    this.buildId = buildId;
    const migrator = new Migrator2({
      db: this.db.withPlugin(new WithSchemaPlugin2(this.internalNamespace)),
      provider: migrationProvider4
    });
    const result = await migrator.migrateToLatest();
    if (result.error)
      throw result.error;
    const namespaceInfo = {
      userNamespace: this.userNamespace,
      internalNamespace: this.internalNamespace,
      internalTableIds: Object.keys(getTables(schema)).reduce(
        (acc, tableName) => {
          acc[tableName] = hash([this.userNamespace, this.buildId, tableName]);
          return acc;
        },
        {}
      )
    };
    return this.db.wrap({ method: "setup" }, async () => {
      const attemptSetup = async () => {
        return await this.db.transaction().execute(async (tx) => {
          const previousLockRow = await tx.withSchema(this.internalNamespace).selectFrom("namespace_lock").selectAll().where("namespace", "=", this.userNamespace).executeTakeFirst();
          const newLockRow = {
            namespace: this.userNamespace,
            is_locked: 1,
            heartbeat_at: Date.now(),
            build_id: this.buildId,
            finalized_checkpoint: encodeCheckpoint(zeroCheckpoint),
            // Schema is encoded to be backwards compatible with old versions.
            // `schema` should have to properties "tables" and "enums".
            schema: encodeSchema(schema)
          };
          const createTables = async () => {
            for (const [tableName, table] of Object.entries(
              getTables(schema)
            )) {
              const tableId = namespaceInfo.internalTableIds[tableName];
              await tx.schema.withSchema(this.internalNamespace).createTable(tableId).$call(
                (builder) => this.buildOperationLogColumns(builder, table.table)
              ).execute();
              await tx.schema.createIndex(`${tableId}_checkpointIndex`).on(tableId).column("checkpoint").execute();
              try {
                await tx.schema.withSchema(this.userNamespace).createTable(tableName).$call(
                  (builder) => this.buildColumns(builder, schema, table.table)
                ).execute();
              } catch (err) {
                const error = err;
                if (!error.message.includes("already exists"))
                  throw error;
                throw new NonRetryableError(
                  `Unable to create table '${tableName}' in '${this.userNamespace}.db' because a table with that name already exists. Is there another application using the '${this.userNamespace}.db' database file?`
                );
              }
              this.common.logger.info({
                service: "database",
                msg: `Created table '${tableName}' in '${this.userNamespace}.db'`
              });
            }
          };
          if (previousLockRow === void 0) {
            await tx.withSchema(this.internalNamespace).insertInto("namespace_lock").values(newLockRow).execute();
            this.common.logger.debug({
              service: "database",
              msg: `Acquired lock on database file '${this.userNamespace}.db'`
            });
            await createTables();
            return { status: "success", checkpoint: zeroCheckpoint };
          }
          const expiresAt = previousLockRow.heartbeat_at + this.common.options.databaseHeartbeatTimeout;
          if (previousLockRow.is_locked === 1 && Date.now() <= expiresAt) {
            const expiresInMs = expiresAt - Date.now();
            return { status: "locked", expiresInMs };
          }
          if (this.common.options.command === "start" && previousLockRow.build_id === this.buildId && previousLockRow.finalized_checkpoint !== encodeCheckpoint(zeroCheckpoint)) {
            this.common.logger.info({
              service: "database",
              msg: `Detected cache hit for build '${this.buildId}' in database file '${this.userNamespace}.db' last active ${formatEta(
                Date.now() - previousLockRow.heartbeat_at
              )} ago`
            });
            for (const [tableName, table] of Object.entries(
              getTables(schema)
            )) {
              if (table.constraints === void 0)
                continue;
              for (const name of Object.keys(table.constraints)) {
                await tx.schema.withSchema(this.userNamespace).dropIndex(`${tableName}_${name}`).ifExists().execute();
                this.common.logger.info({
                  service: "database",
                  msg: `Dropped index '${tableName}_${name}' in schema '${this.userNamespace}'`
                });
              }
            }
            await tx.withSchema(this.internalNamespace).updateTable("namespace_lock").set({ is_locked: 1, heartbeat_at: Date.now() }).execute();
            this.common.logger.debug({
              service: "database",
              msg: `Acquired lock on schema '${this.userNamespace}'`
            });
            const finalizedCheckpoint2 = decodeCheckpoint(
              previousLockRow.finalized_checkpoint
            );
            this.common.logger.info({
              service: "database",
              msg: `Reverting operations prior to finalized checkpoint (timestamp=${finalizedCheckpoint2.blockTimestamp} chainId=${finalizedCheckpoint2.chainId} block=${finalizedCheckpoint2.blockNumber})`
            });
            const tx_ = tx;
            for (const [tableName, tableId] of Object.entries(
              namespaceInfo.internalTableIds
            )) {
              const rows = await tx_.withSchema(namespaceInfo.internalNamespace).deleteFrom(tableId).returningAll().where("checkpoint", ">", previousLockRow.finalized_checkpoint).execute();
              const reversed = rows.sort(
                (a, b) => b.operation_id - a.operation_id
              );
              for (const log of reversed) {
                if (log.operation === 0) {
                  await tx_.withSchema(namespaceInfo.userNamespace).deleteFrom(tableName).where("id", "=", log.id).execute();
                } else if (log.operation === 1) {
                  log.operation_id = void 0;
                  log.checkpoint = void 0;
                  log.operation = void 0;
                  await tx_.withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(log).where("id", "=", log.id).execute();
                } else {
                  log.operation_id = void 0;
                  log.checkpoint = void 0;
                  log.operation = void 0;
                  await tx_.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(log).execute();
                }
              }
              this.common.logger.info({
                service: "database",
                msg: `Reverted ${rows.length} unfinalized operations from existing '${tableName}' table`
              });
            }
            return {
              status: "success",
              checkpoint: finalizedCheckpoint2
            };
          }
          const previousBuildId = previousLockRow.build_id;
          const previousSchema = JSON.parse(previousLockRow.schema);
          await tx.withSchema(this.internalNamespace).updateTable("namespace_lock").where("namespace", "=", this.userNamespace).set(newLockRow).execute();
          this.common.logger.debug({
            service: "database",
            msg: `Acquired lock on schema '${this.userNamespace}' previously used by build '${previousBuildId}'`
          });
          for (const tableName of Object.keys(previousSchema.tables)) {
            const tableId = hash([
              this.userNamespace,
              previousBuildId,
              tableName
            ]);
            await tx.schema.withSchema(this.internalNamespace).dropTable(tableId).ifExists().execute();
            await tx.schema.withSchema(this.userNamespace).dropTable(tableName).ifExists().execute();
            this.common.logger.debug({
              service: "database",
              msg: `Dropped '${tableName}' table left by previous build`
            });
          }
          await createTables();
          return { status: "success", checkpoint: zeroCheckpoint };
        });
      };
      const result2 = await attemptSetup();
      let finalizedCheckpoint;
      if (result2.status === "success") {
        finalizedCheckpoint = result2.checkpoint;
      } else {
        const { expiresInMs } = result2;
        this.common.logger.warn({
          service: "database",
          msg: `Database file '${this.userNamespace}.db' is locked by a different Ponder app`
        });
        this.common.logger.warn({
          service: "database",
          msg: `Waiting ${formatEta(expiresInMs)} for lock on database file '${this.userNamespace}.db' to expire...`
        });
        await wait(expiresInMs);
        const resultTwo = await attemptSetup();
        if (resultTwo.status === "locked") {
          throw new NonRetryableError(
            `Failed to acquire lock on database file '${this.userNamespace}.db'. A different Ponder app is actively using this database.`
          );
        }
        finalizedCheckpoint = resultTwo.checkpoint;
      }
      this.heartbeatInterval = setInterval(async () => {
        try {
          const lockRow = await this.db.withSchema(this.internalNamespace).updateTable("namespace_lock").where("namespace", "=", this.userNamespace).set({ heartbeat_at: Date.now() }).returningAll().executeTakeFirst();
          this.common.logger.debug({
            service: "database",
            msg: `Updated heartbeat timestamp to ${lockRow?.heartbeat_at} (build_id=${this.buildId})`
          });
        } catch (err) {
          const error = err;
          this.common.logger.error({
            service: "database",
            msg: `Failed to update heartbeat timestamp, retrying in ${formatEta(
              this.common.options.databaseHeartbeatInterval
            )}`,
            error
          });
        }
      }, this.common.options.databaseHeartbeatInterval);
      return { checkpoint: finalizedCheckpoint, namespaceInfo };
    });
  }
  async revert({
    checkpoint,
    namespaceInfo
  }) {
    await revertIndexingTables({
      db: this.indexingDb,
      checkpoint,
      namespaceInfo
    });
  }
  async updateFinalizedCheckpoint({
    checkpoint
  }) {
    await this.db.wrap({ method: "updateFinalizedCheckpoint" }, async () => {
      await this.db.withSchema(this.internalNamespace).updateTable("namespace_lock").where("namespace", "=", this.userNamespace).set({ finalized_checkpoint: encodeCheckpoint(checkpoint) }).execute();
      this.common.logger.debug({
        service: "database",
        msg: `Updated finalized checkpoint to (timestamp=${checkpoint.blockTimestamp} chainId=${checkpoint.chainId} block=${checkpoint.blockNumber})`
      });
    });
  }
  async createIndexes({ schema }) {
    await Promise.all(
      Object.entries(getTables(schema)).flatMap(([tableName, table]) => {
        if (table.constraints === void 0)
          return [];
        return Object.entries(table.constraints).map(async ([name, index]) => {
          await this.db.wrap({ method: "createIndexes" }, async () => {
            const indexName = `${tableName}_${name}`;
            const indexColumn = index[" column"];
            const order = index[" order"];
            const columns = Array.isArray(indexColumn) ? indexColumn.map((ic) => `"${ic}"`).join(", ") : `"${indexColumn}" ${order === "asc" ? "ASC" : order === "desc" ? "DESC" : ""}`;
            await this.db.executeQuery(
              sql4`CREATE INDEX ${sql4.ref(this.userNamespace)}.${sql4.ref(
                indexName
              )} ON ${sql4.table(tableName)} (${sql4.raw(columns)})`.compile(
                this.db
              )
            );
          });
          this.common.logger.info({
            service: "database",
            msg: `Created index '${tableName}_${name}' on columns (${Array.isArray(index[" column"]) ? index[" column"].join(", ") : index[" column"]}) in '${this.userNamespace}.db'`
          });
        });
      })
    );
  }
  async kill() {
    await this.db.wrap({ method: "kill" }, async () => {
      clearInterval(this.heartbeatInterval);
      await this.db.withSchema(this.internalNamespace).updateTable("namespace_lock").where("namespace", "=", this.userNamespace).set({ is_locked: 0 }).returningAll().executeTakeFirst();
      this.common.logger.debug({
        service: "database",
        msg: `Released lock on namespace '${this.userNamespace}'`
      });
      await this.readonlyDb.destroy();
      await this.indexingDb.destroy();
      await this.syncDb.destroy();
      await this.db.destroy();
      this.syncDatabase.close();
      this.internalDatabase.close();
      this.common.logger.debug({
        service: "database",
        msg: "Closed connection to database"
      });
    });
  }
  async migrateSyncStore() {
    await this.db.wrap({ method: "migrateSyncStore" }, async () => {
      const migrator = new Migrator2({
        db: this.syncDb,
        provider: migrationProvider3
      });
      const { error } = await migrator.migrateToLatest();
      if (error)
        throw error;
    });
  }
  buildColumns(builder, schema, table) {
    Object.entries(table).forEach(([columnName, column]) => {
      if (isOneColumn(column))
        return;
      if (isManyColumn(column))
        return;
      if (isEnumColumn(column)) {
        builder = builder.addColumn(columnName, "text", (col) => {
          if (isOptionalColumn(column) === false)
            col = col.notNull();
          if (isListColumn(column) === false) {
            col = col.check(
              sql4`${sql4.ref(columnName)} in (${sql4.join(
                getEnums(schema)[column[" enum"]].map((v) => sql4.lit(v))
              )})`
            );
          }
          return col;
        });
      } else if (isListColumn(column)) {
        builder = builder.addColumn(columnName, "text", (col) => {
          if (isOptionalColumn(column) === false)
            col = col.notNull();
          return col;
        });
      } else if (isJSONColumn(column)) {
        builder = builder.addColumn(columnName, "jsonb", (col) => {
          if (isOptionalColumn(column) === false)
            col = col.notNull();
          return col;
        });
      } else {
        builder = builder.addColumn(
          columnName,
          scalarToSqlType2[column[" scalar"]],
          (col) => {
            if (isOptionalColumn(column) === false)
              col = col.notNull();
            if (columnName === "id")
              col = col.primaryKey();
            return col;
          }
        );
      }
    });
    return builder;
  }
  buildOperationLogColumns(builder, table) {
    Object.entries(table).forEach(([columnName, column]) => {
      if (isOneColumn(column))
        return;
      if (isManyColumn(column))
        return;
      if (isEnumColumn(column)) {
        builder = builder.addColumn(columnName, "text");
      } else if (isListColumn(column)) {
        builder = builder.addColumn(columnName, "text");
      } else if (isJSONColumn(column)) {
        builder = builder.addColumn(columnName, "jsonb");
      } else {
        builder = builder.addColumn(
          columnName,
          scalarToSqlType2[column[" scalar"]],
          (col) => {
            if (columnName === "id")
              col = col.notNull();
            return col;
          }
        );
      }
    });
    builder = builder.addColumn("operation_id", "integer", (col) => col.notNull().primaryKey()).addColumn("checkpoint", "varchar(75)", (col) => col.notNull()).addColumn("operation", "integer", (col) => col.notNull());
    return builder;
  }
  registerMetrics() {
    this.common.metrics.registry.removeSingleMetric(
      "ponder_sqlite_query_total"
    );
    this.common.metrics.ponder_sqlite_query_total = new prometheus3.Counter({
      name: "ponder_sqlite_query_total",
      help: "Number of queries submitted to the database",
      labelNames: ["database"],
      registers: [this.common.metrics.registry]
    });
  }
  async deleteV3DatabaseFiles() {
    const hasV3Files = existsSync3(path7.join(this.directory, "ponder_cache.db"));
    if (!hasV3Files)
      return;
    this.common.logger.debug({
      service: "database",
      msg: "Migrating '.ponder/sqlite' database from 0.3.x to 0.4.x"
    });
    rmSync(path7.join(this.directory, "ponder_cache.db"), { force: true });
    rmSync(path7.join(this.directory, "ponder_cache.db-shm"), { force: true });
    rmSync(path7.join(this.directory, "ponder_cache.db-wal"), { force: true });
    this.common.logger.debug({
      service: "database",
      msg: `Removed '.ponder/sqlite/ponder_cache.db' file`
    });
    rmSync(path7.join(this.directory, "ponder.db"), { force: true });
    rmSync(path7.join(this.directory, "ponder.db-shm"), { force: true });
    rmSync(path7.join(this.directory, "ponder.db-wal"), { force: true });
    this.common.logger.debug({
      service: "database",
      msg: `Removed '.ponder/sqlite/ponder.db' file`
    });
  }
};
var scalarToSqlType2 = {
  boolean: "integer",
  int: "integer",
  float: "real",
  string: "text",
  bigint: "varchar(79)",
  hex: "blob"
};

// src/indexing-store/historical.ts
import { sql as sql5 } from "kysely";

// src/utils/encoding.ts
var EVM_MAX_UINT = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;
var EVM_MIN_INT = -57896044618658097711785492504343953926634992332820282019728792003956564819968n;
function encodeAsText(value) {
  if (typeof value === "string" || typeof value === "number")
    value = BigInt(value);
  if (value > EVM_MAX_UINT)
    throw new Error(`Value cannot be greater than EVM_MAX_UINT (${value})`);
  if (value < EVM_MIN_INT)
    throw new Error(`Value cannot be less than EVM_MIN_INT (${value})`);
  const signChar = value >= 0n ? "0" : "-";
  if (value < 0n)
    value = value - EVM_MIN_INT;
  const chars = value.toString(10);
  return signChar + chars.padStart(78, "0");
}
function decodeToBigInt(text) {
  if (typeof text === "bigint")
    return text;
  const signChar = text.at(0);
  let valueChars = text.substring(1).replace(/^0+/, "");
  if (valueChars.length === 0)
    valueChars = "0";
  let value = BigInt(valueChars);
  if (signChar === "-")
    value = value + EVM_MIN_INT;
  return value;
}

// src/indexing-store/utils/encoding.ts
import { bytesToHex, hexToBytes, isHex } from "viem";
var scalarToTsType = {
  int: "number",
  float: "number",
  bigint: "bigint",
  boolean: "boolean",
  string: "string",
  hex: "`0x${string}`"
};
function encodeRow(data, table, encoding) {
  const instance = {};
  for (const [columnName, value] of Object.entries(data)) {
    const column = table[columnName];
    if (!column) {
      throw new StoreError(
        `Invalid record: Column does not exist. Got ${columnName}, expected one of [${Object.keys(
          table
        ).filter(
          (column2) => isScalarColumn(table[column2]) || isReferenceColumn(table[column2]) || isEnumColumn(table[column2]) || isJSONColumn(table[column2])
        ).join(", ")}]`
      );
    }
    instance[columnName] = encodeValue(value, column, encoding);
  }
  return instance;
}
function encodeValue(value, column, encoding) {
  if (isEnumColumn(column)) {
    if (isOptionalColumn(column) && (value === void 0 || value === null)) {
      return null;
    }
    if (isListColumn(column)) {
      if (!Array.isArray(value)) {
        throw new StoreError(
          `Unable to encode ${value} as a list. Got type '${typeof value}' but expected type 'string[]'.`
        );
      }
      return JSON.stringify(value);
    } else if (typeof value !== "string") {
      throw new StoreError(
        `Unable to encode ${value} as an enum. Got type '${typeof value}' but expected type 'string'.`
      );
    }
    return value;
  } else if (isJSONColumn(column)) {
    if (encoding === "postgres")
      return value;
    try {
      return JSON.stringify(value);
    } catch (_error) {
      const error = new BigIntSerializationError(_error.message);
      error.meta.push(
        "Hint:\n  The JSON column type does not support BigInt values.\n  Use the replaceBigInts() helper function before inserting into the database. Docs: https://ponder.sh/docs/utilities/replace-bigints"
      );
      throw error;
    }
  } else if (isScalarColumn(column) || isReferenceColumn(column)) {
    if (isOptionalColumn(column) && (value === void 0 || value === null)) {
      return null;
    }
    if (isListColumn(column)) {
      if (!Array.isArray(value)) {
        throw new StoreError(
          `Unable to encode ${value} as a list. Got type '${typeof value}' but expected type '${scalarToTsType[column[" scalar"]]}[]'.`
        );
      }
      if (column[" scalar"] === "bigint") {
        return JSON.stringify(value.map(String));
      } else if (column[" scalar"] === "hex") {
        return JSON.stringify(value.map((v) => v.toLowerCase()));
      } else {
        return JSON.stringify(value);
      }
    }
    if (column[" scalar"] === "string") {
      if (typeof value !== "string") {
        throw new StoreError(
          `Unable to encode ${value} as a string. Got type '${typeof value}' but expected type 'string'.`
        );
      }
      return value;
    } else if (column[" scalar"] === "hex") {
      if (typeof value !== "string" || !isHex(value)) {
        throw new StoreError(
          `Unable to encode ${value} as a hex. Got type '${typeof value}' but expected type '\`0x\${string}\`'.`
        );
      }
      return Buffer.from(hexToBytes(value));
    } else if (column[" scalar"] === "int") {
      if (typeof value !== "number") {
        throw new StoreError(
          `Unable to encode ${value} as an int. Got type '${typeof value}' but expected type 'number'.`
        );
      }
      return value;
    } else if (column[" scalar"] === "float") {
      if (typeof value !== "number") {
        throw new StoreError(
          `Unable to encode ${value} as a float. Got type '${typeof value}' but expected type 'number'.`
        );
      }
      return value;
    } else if (column[" scalar"] === "bigint") {
      if (typeof value !== "bigint") {
        throw new StoreError(
          `Unable to encode ${value} as a bigint. Got type '${typeof value}' but expected type 'bigint'.`
        );
      }
      return encoding === "sqlite" ? encodeAsText(value) : value;
    } else if (column[" scalar"] === "boolean") {
      if (typeof value !== "boolean") {
        throw new StoreError(
          `Unable to encode ${value} as a boolean. Got type '${typeof value}' but expected type 'boolean'.`
        );
      }
      return value ? 1 : 0;
    }
    throw new StoreError(
      `Unable to encode ${value} as type ${column[" scalar"]}. Please report this issue (https://github.com/ponder-sh/ponder/issues/new)`
    );
  }
  throw new StoreError(
    `Unable to encode ${value} into a "${isManyColumn(column) ? "many" : "one"}" column. "${isManyColumn(column) ? "many" : "one"}" columns are virtual and therefore should not be given a value.`
  );
}
function decodeRow(data, table, encoding) {
  const instance = {};
  for (const [columnName, column] of Object.entries(table)) {
    if (isScalarColumn(column) || isReferenceColumn(column) || isEnumColumn(column) || isJSONColumn(column)) {
      instance[columnName] = decodeValue(data[columnName], column, encoding);
    }
  }
  return instance;
}
function decodeValue(value, column, encoding) {
  if (value === null)
    return null;
  else if (isEnumColumn(column)) {
    if (isListColumn(column)) {
      return JSON.parse(value);
    }
    return value;
  } else if (isJSONColumn(column)) {
    return encoding === "postgres" ? value : JSON.parse(value);
  } else if (isListColumn(column)) {
    return column[" scalar"] === "bigint" ? JSON.parse(value).map(BigInt) : JSON.parse(value);
  } else if (column[" scalar"] === "boolean") {
    return value === 1 ? true : false;
  } else if (column[" scalar"] === "hex") {
    return bytesToHex(value);
  } else if (column[" scalar"] === "bigint" && encoding === "sqlite") {
    return decodeToBigInt(value);
  } else {
    return value;
  }
}

// src/indexing-store/utils/errors.ts
function parseStoreError(err, args) {
  let error = getBaseError(err);
  if (error.message?.includes("no result")) {
    error = new RecordNotFoundError(
      "No existing record was found with the specified ID"
    );
  } else if (error.message?.includes("UNIQUE constraint failed") || error.message?.includes("violates unique constraint")) {
    error = new UniqueConstraintError(error.message);
    error.meta.push(
      "Hints:\n  Did you forget to await the promise returned by a store method?\n  Did you mean to do an upsert?"
    );
  } else if (error.message?.includes("NOT NULL constraint failed") || error.message?.includes("violates not-null constraint")) {
    error = new NotNullConstraintError(error.message);
  } else if (error.message?.includes("CHECK constraint failed") || error.message?.includes("violates check constraint")) {
    error = new CheckConstraintError(error.message);
  } else if (error.message?.includes("Do not know how to serialize a BigInt")) {
    error = new BigIntSerializationError(error.message);
    error.meta.push(
      "Hint:\n  The JSON column type does not support BigInt values.\n  Use the replaceBigInts helper function before inserting into the database. Docs: https://ponder.sh/docs/utilities/replace-bigints"
    );
  }
  if (error.meta.length !== 0) {
    error.meta.push("");
  }
  error.meta.push(`Store method arguments:
${prettyPrint(args)}`);
  return error;
}

// src/indexing-store/utils/filter.ts
var filterValidityMap = {
  boolean: {
    singular: ["equals", "not", "in", "notIn"],
    list: ["equals", "not", "has", "notHas"]
  },
  string: {
    singular: [
      "equals",
      "not",
      "in",
      "notIn",
      "contains",
      "notContains",
      "startsWith",
      "notStartsWith",
      "endsWith",
      "notEndsWith"
    ],
    list: ["equals", "not", "has", "notHas"]
  },
  hex: {
    singular: ["equals", "not", "in", "notIn", "gt", "lt", "gte", "lte"],
    list: ["equals", "not", "has", "notHas"]
  },
  int: {
    singular: ["equals", "not", "in", "notIn", "gt", "lt", "gte", "lte"],
    list: ["equals", "not", "has", "notHas"]
  },
  bigint: {
    singular: ["equals", "not", "in", "notIn", "gt", "lt", "gte", "lte"],
    list: ["equals", "not", "has", "notHas"]
  },
  float: {
    singular: ["equals", "not", "in", "notIn", "gt", "lt", "gte", "lte"],
    list: ["equals", "not", "has", "notHas"]
  }
};
var filterEncodingMap = {
  // Universal
  equals: (value, encode) => value === null ? ["is", null] : ["=", encode(value)],
  not: (value, encode) => value === null ? ["is not", null] : ["!=", encode(value)],
  // Singular
  in: (value, encode) => ["in", value.map(encode)],
  notIn: (value, encode) => ["not in", value.map(encode)],
  // Plural/list
  has: (value, encode) => ["like", `%${encode(value)}%`],
  notHas: (value, encode) => ["not like", `%${encode(value)}%`],
  // Numeric
  gt: (value, encode) => [">", encode(value)],
  lt: (value, encode) => ["<", encode(value)],
  gte: (value, encode) => [">=", encode(value)],
  lte: (value, encode) => ["<=", encode(value)],
  // String
  contains: (value, encode) => ["like", `%${encode(value)}%`],
  notContains: (value, encode) => ["not like", `%${encode(value)}%`],
  startsWith: (value, encode) => ["like", `${encode(value)}%`],
  notStartsWith: (value, encode) => ["not like", `${encode(value)}%`],
  endsWith: (value, encode) => ["like", `%${encode(value)}`],
  notEndsWith: (value, encode) => ["not like", `%${encode(value)}`]
};
function buildWhereConditions({
  eb,
  where,
  table,
  encoding
}) {
  const exprs = [];
  for (const [columnName, rhs] of Object.entries(where)) {
    if (columnName === "AND" || columnName === "OR") {
      if (!Array.isArray(rhs)) {
        throw new StoreError(
          `Invalid filter. Expected an array for logical operator '${columnName}', got '${rhs}'.`
        );
      }
      const nestedExprs = rhs.map(
        (nestedWhere) => buildWhereConditions({ eb, where: nestedWhere, table, encoding })
      );
      exprs.push(eb[columnName === "AND" ? "and" : "or"](nestedExprs));
      continue;
    }
    const column = table[columnName];
    if (!column) {
      throw new StoreError(
        `Invalid filter. Column does not exist. Got '${columnName}', expected one of [${Object.keys(
          table
        ).filter(
          (columnName2) => isScalarColumn(table[columnName2]) || isReferenceColumn(table[columnName2]) || isEnumColumn(table[columnName2]) || isJSONColumn(table[columnName2])
        ).map((c) => `'${c}'`).join(", ")}]`
      );
    }
    if (isOneColumn(column) || isManyColumn(column)) {
      throw new StoreError(
        `Invalid filter. Cannot filter on virtual column '${columnName}'.`
      );
    }
    if (isJSONColumn(column)) {
      throw new StoreError(
        `Invalid filter. Cannot filter on json column '${columnName}'.`
      );
    }
    const conditionsForColumn = Array.isArray(rhs) || typeof rhs !== "object" ? { equals: rhs } : rhs;
    for (const [condition, value] of Object.entries(conditionsForColumn)) {
      const filterType = isEnumColumn(column) ? "string" : column[" scalar"];
      const allowedConditions = filterValidityMap[filterType]?.[isListColumn(column) ? "list" : "singular"];
      if (!allowedConditions.includes(condition)) {
        throw new StoreError(
          `Invalid filter condition for column '${columnName}'. Got '${condition}', expected one of [${allowedConditions.map((c) => `'${c}'`).join(", ")}]`
        );
      }
      const filterEncodingFn = filterEncodingMap[condition];
      const encode = (v) => {
        const isListCondition = isListColumn(column) && (condition === "has" || condition === "notHas");
        if (isListCondition) {
          if (column[" scalar"] === "bigint") {
            return String(v);
          } else if (column[" scalar"] === "hex") {
            return v.toLowerCase();
          }
          return v;
        }
        return encodeValue(v, column, encoding);
      };
      const [comparator, encodedValue] = filterEncodingFn(value, encode);
      exprs.push(eb.eb(columnName, comparator, encodedValue));
    }
  }
  return eb.and(exprs);
}

// src/indexing-store/historical.ts
var MAX_BATCH_SIZE = 1e3;
var getHistoricalStore = ({
  kind,
  schema,
  namespaceInfo,
  db
}) => ({
  create: async ({
    tableName,
    id,
    data = {}
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.create` }, async () => {
      const createRow = encodeRow({ id, ...data }, table, kind);
      const row = await db.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(createRow).returningAll().executeTakeFirstOrThrow().catch((err) => {
        throw parseStoreError(err, { id, ...data });
      });
      return decodeRow(row, table, kind);
    });
  },
  createMany: async ({
    tableName,
    data
  }) => {
    const table = schema[tableName].table;
    const rows = [];
    for (let i = 0, len = data.length; i < len; i += MAX_BATCH_SIZE) {
      await db.wrap({ method: `${tableName}.createMany` }, async () => {
        const createRows = data.slice(i, i + MAX_BATCH_SIZE).map((d) => encodeRow(d, table, kind));
        const _rows = await db.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(createRows).returningAll().execute().catch((err) => {
          throw parseStoreError(err, data.length > 0 ? data[0] : {});
        });
        rows.push(..._rows);
      });
    }
    return rows.map((row) => decodeRow(row, table, kind));
  },
  update: async ({
    tableName,
    id,
    data = {}
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.update` }, async () => {
      const encodedId = encodeValue(id, table.id, kind);
      let updateObject;
      if (typeof data === "function") {
        const latestRow = await db.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).selectAll().where("id", "=", encodedId).executeTakeFirstOrThrow().catch((err) => {
          throw parseStoreError(err, { id, data: "(function)" });
        });
        updateObject = data({ current: decodeRow(latestRow, table, kind) });
      } else {
        updateObject = data;
      }
      const updateRow = encodeRow({ id, ...updateObject }, table, kind);
      const row = await db.withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(updateRow).where("id", "=", encodedId).returningAll().executeTakeFirstOrThrow().catch((err) => {
        throw parseStoreError(err, { id, ...updateObject });
      });
      return decodeRow(row, table, kind);
    });
  },
  updateMany: async ({
    tableName,
    where,
    data = {}
  }) => {
    const table = schema[tableName].table;
    if (typeof data === "function") {
      const query2 = db.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).selectAll().where(
        (eb) => buildWhereConditions({
          eb,
          where,
          table,
          encoding: kind
        })
      ).orderBy("id", "asc");
      const rows = [];
      let cursor = null;
      while (true) {
        const _rows = await db.wrap(
          { method: `${tableName}.updateMany` },
          async () => {
            const latestRows = await query2.limit(MAX_BATCH_SIZE).$if(cursor !== null, (qb) => qb.where("id", ">", cursor)).execute();
            const rows2 = [];
            for (const latestRow of latestRows) {
              const current = decodeRow(latestRow, table, kind);
              const updateObject = data({ current });
              const updateRow = {
                id: latestRow.id,
                ...encodeRow(updateObject, table, kind)
              };
              const row = await db.withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(updateRow).where("id", "=", latestRow.id).returningAll().executeTakeFirstOrThrow().catch((err) => {
                throw parseStoreError(err, updateObject);
              });
              rows2.push(row);
            }
            return rows2.map((row) => decodeRow(row, table, kind));
          }
        );
        rows.push(..._rows);
        if (_rows.length === 0) {
          break;
        } else {
          cursor = encodeValue(_rows[_rows.length - 1].id, table.id, kind);
        }
      }
      return rows;
    } else {
      return db.wrap({ method: `${tableName}.updateMany` }, async () => {
        const updateRow = encodeRow(data, table, kind);
        const rows = await db.with(
          "latestRows(id)",
          (db2) => db2.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).select("id").where(
            (eb) => buildWhereConditions({
              eb,
              where,
              table,
              encoding: kind
            })
          )
        ).withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(updateRow).from("latestRows").where(`${tableName}.id`, "=", sql5.ref("latestRows.id")).returningAll().execute().catch((err) => {
          throw parseStoreError(err, data);
        });
        return rows.map((row) => decodeRow(row, table, kind));
      });
    }
  },
  upsert: async ({
    tableName,
    id,
    create: create5 = {},
    update = {}
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.upsert` }, async () => {
      const encodedId = encodeValue(id, table.id, kind);
      const createRow = encodeRow({ id, ...create5 }, table, kind);
      if (typeof update === "function") {
        const latestRow = await db.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).selectAll().where("id", "=", encodedId).executeTakeFirst();
        if (latestRow === void 0) {
          const row2 = await db.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(createRow).returningAll().executeTakeFirstOrThrow().catch((err) => {
            const prettyObject = { id };
            for (const [key, value] of Object.entries(create5))
              prettyObject[`create.${key}`] = value;
            prettyObject.update = "(function)";
            throw parseStoreError(err, prettyObject);
          });
          return decodeRow(row2, table, kind);
        }
        const current = decodeRow(latestRow, table, kind);
        const updateObject = update({ current });
        const updateRow = encodeRow({ id, ...updateObject }, table, kind);
        const row = await db.withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(updateRow).where("id", "=", encodedId).returningAll().executeTakeFirstOrThrow().catch((err) => {
          const prettyObject = { id };
          for (const [key, value] of Object.entries(create5))
            prettyObject[`create.${key}`] = value;
          for (const [key, value] of Object.entries(updateObject))
            prettyObject[`update.${key}`] = value;
          throw parseStoreError(err, prettyObject);
        });
        return decodeRow(row, table, kind);
      } else {
        const updateRow = encodeRow({ id, ...update }, table, kind);
        const row = await db.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(createRow).onConflict((oc) => oc.column("id").doUpdateSet(updateRow)).returningAll().executeTakeFirstOrThrow().catch((err) => {
          const prettyObject = { id };
          for (const [key, value] of Object.entries(create5))
            prettyObject[`create.${key}`] = value;
          for (const [key, value] of Object.entries(update))
            prettyObject[`update.${key}`] = value;
          throw parseStoreError(err, prettyObject);
        });
        return decodeRow(row, table, kind);
      }
    });
  },
  delete: async ({
    tableName,
    id
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.delete` }, async () => {
      const encodedId = encodeValue(id, table.id, kind);
      const deletedRow = await db.withSchema(namespaceInfo.userNamespace).deleteFrom(tableName).where("id", "=", encodedId).returning(["id"]).executeTakeFirst().catch((err) => {
        throw parseStoreError(err, { id });
      });
      return !!deletedRow;
    });
  }
});

// src/indexing-store/readonly.ts
import { sql as sql6 } from "kysely";

// src/utils/serialize.ts
function serialize(value) {
  return JSON.stringify(
    value,
    (_, v) => typeof v === "bigint" ? { __type: "bigint", value: v.toString() } : v
  );
}
function deserialize(value) {
  return JSON.parse(
    value,
    (_, value_) => value_?.__type === "bigint" ? BigInt(value_.value) : value_
  );
}

// src/indexing-store/utils/cursor.ts
function encodeCursor(record, orderByConditions) {
  const cursorValues = orderByConditions.map(([columnName]) => [
    columnName,
    record[columnName]
  ]);
  return Buffer.from(serialize(cursorValues)).toString("base64");
}
function decodeCursor(cursor, orderByConditions) {
  const cursorValues = deserialize(
    Buffer.from(cursor, "base64").toString()
  );
  if (cursorValues.length !== orderByConditions.length) {
    throw new StoreError(
      `Invalid cursor. Got ${cursorValues.length}, ${orderByConditions.length} conditions`
    );
  }
  for (const [index, [columnName]] of orderByConditions.entries()) {
    if (cursorValues[index][0] !== columnName) {
      throw new StoreError(
        `Invalid cursor. Got column '${cursorValues[index][0]}' at index ${index}, expected '${columnName}'.`
      );
    }
  }
  return cursorValues;
}
function buildCursorConditions(cursorValues, kind, direction, eb) {
  const comparator = kind === "after" ? direction === "asc" ? ">" : "<" : direction === "asc" ? "<" : ">";
  const comparatorOrEquals = `${comparator}=`;
  if (cursorValues.length === 1) {
    const [columnName, value] = cursorValues[0];
    return eb.eb(columnName, comparatorOrEquals, value);
  } else if (cursorValues.length === 2) {
    const [columnName1, value1] = cursorValues[0];
    const [columnName2, value2] = cursorValues[1];
    return eb.or([
      eb.eb(columnName1, comparator, value1),
      eb.and([
        eb.eb(columnName1, "=", value1),
        eb.eb(columnName2, comparatorOrEquals, value2)
      ])
    ]);
  } else {
    throw new StoreError(
      `Invalid cursor. Got ${cursorValues.length} value pairs, expected 1 or 2.`
    );
  }
}

// src/indexing-store/utils/sort.ts
function buildOrderByConditions({
  orderBy,
  table
}) {
  if (!orderBy) {
    return [["id", "asc"]];
  }
  const conditions = Object.entries(orderBy);
  if (conditions.length > 1)
    throw new StoreError("Invalid sort. Cannot sort by multiple columns.");
  const [columnName, orderDirection] = conditions[0];
  const column = table[columnName];
  if (!column) {
    throw new StoreError(
      `Invalid sort. Column does not exist. Got '${columnName}', expected one of [${Object.keys(
        table
      ).filter(
        (columnName2) => isScalarColumn(table[columnName2]) || isReferenceColumn(table[columnName2]) || isEnumColumn(table[columnName2]) || isJSONColumn(table[columnName2])
      ).map((c) => `'${c}'`).join(", ")}]`
    );
  }
  if (isOneColumn(column) || isManyColumn(column)) {
    throw new StoreError(
      `Invalid sort. Cannot sort on virtual column '${columnName}'.`
    );
  }
  if (isJSONColumn(column)) {
    throw new StoreError(
      `Invalid sort. Cannot sort on json column '${columnName}'.`
    );
  }
  if (orderDirection === void 0 || !["asc", "desc"].includes(orderDirection))
    throw new StoreError(
      `Invalid sort direction. Got '${orderDirection}', expected 'asc' or 'desc'.`
    );
  const orderByConditions = [[columnName, orderDirection]];
  if (columnName !== "id") {
    orderByConditions.push(["id", orderDirection]);
  }
  return orderByConditions;
}
function reverseOrderByConditions(orderByConditions) {
  return orderByConditions.map(([columnName, direction]) => [
    columnName,
    direction === "asc" ? "desc" : "asc"
  ]);
}

// src/indexing-store/readonly.ts
var DEFAULT_LIMIT = 50;
var MAX_LIMIT = 1e3;
var getReadonlyStore = ({
  kind,
  schema,
  namespaceInfo,
  db
}) => ({
  findUnique: async ({
    tableName,
    id
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.findUnique` }, async () => {
      const encodedId = encodeValue(id, table.id, kind);
      const row = await db.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).selectAll().where("id", "=", encodedId).executeTakeFirst();
      if (row === void 0)
        return null;
      return decodeRow(row, table, kind);
    });
  },
  findMany: async ({
    tableName,
    where,
    orderBy,
    before = null,
    after = null,
    limit = DEFAULT_LIMIT
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.findMany` }, async () => {
      let query2 = db.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).selectAll();
      if (where) {
        query2 = query2.where(
          (eb) => buildWhereConditions({ eb, where, table, encoding: kind })
        );
      }
      const orderByConditions = buildOrderByConditions({ orderBy, table });
      for (const [column, direction] of orderByConditions) {
        query2 = query2.orderBy(
          column,
          kind === "sqlite" ? direction : direction === "asc" ? sql6`asc nulls first` : sql6`desc nulls last`
        );
      }
      const orderDirection = orderByConditions[0][1];
      if (limit > MAX_LIMIT) {
        throw new StoreError(
          `Invalid limit. Got ${limit}, expected <=${MAX_LIMIT}.`
        );
      }
      if (after !== null && before !== null) {
        throw new StoreError("Cannot specify both before and after cursors.");
      }
      let startCursor = null;
      let endCursor = null;
      let hasPreviousPage = false;
      let hasNextPage = false;
      if (after === null && before === null) {
        query2 = query2.limit(limit + 1);
        const rows = await query2.execute();
        const records = rows.map((row) => decodeRow(row, table, kind));
        if (records.length === limit + 1) {
          records.pop();
          hasNextPage = true;
        }
        startCursor = records.length > 0 ? encodeCursor(records[0], orderByConditions) : null;
        endCursor = records.length > 0 ? encodeCursor(records[records.length - 1], orderByConditions) : null;
        return {
          items: records,
          pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor }
        };
      }
      if (after !== null) {
        const rawCursorValues = decodeCursor(after, orderByConditions);
        const cursorValues = rawCursorValues.map(([columnName, value]) => [
          columnName,
          encodeValue(value, table[columnName], kind)
        ]);
        query2 = query2.where(
          (eb) => buildCursorConditions(cursorValues, "after", orderDirection, eb)
        ).limit(limit + 2);
        const rows = await query2.execute();
        const records = rows.map((row) => decodeRow(row, table, kind));
        if (records.length === 0) {
          return {
            items: records,
            pageInfo: {
              hasNextPage,
              hasPreviousPage,
              startCursor,
              endCursor
            }
          };
        }
        if (encodeCursor(records[0], orderByConditions) === after) {
          records.shift();
          hasPreviousPage = true;
        } else {
          records.pop();
        }
        if (records.length === limit + 1) {
          records.pop();
          hasNextPage = true;
        }
        startCursor = records.length > 0 ? encodeCursor(records[0], orderByConditions) : null;
        endCursor = records.length > 0 ? encodeCursor(records[records.length - 1], orderByConditions) : null;
        return {
          items: records,
          pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor }
        };
      } else {
        const rawCursorValues = decodeCursor(before, orderByConditions);
        const cursorValues = rawCursorValues.map(([columnName, value]) => [
          columnName,
          encodeValue(value, table[columnName], kind)
        ]);
        query2 = query2.where(
          (eb) => buildCursorConditions(cursorValues, "before", orderDirection, eb)
        ).limit(limit + 2);
        query2 = query2.clearOrderBy();
        const reversedOrderByConditions = reverseOrderByConditions(orderByConditions);
        for (const [column, direction] of reversedOrderByConditions) {
          query2 = query2.orderBy(column, direction);
        }
        const rows = await query2.execute();
        const records = rows.map((row) => decodeRow(row, table, kind)).reverse();
        if (records.length === 0) {
          return {
            items: records,
            pageInfo: {
              hasNextPage,
              hasPreviousPage,
              startCursor,
              endCursor
            }
          };
        }
        if (encodeCursor(records[records.length - 1], orderByConditions) === before) {
          records.pop();
          hasNextPage = true;
        } else {
          records.shift();
        }
        if (records.length === limit + 1) {
          records.shift();
          hasPreviousPage = true;
        }
        startCursor = records.length > 0 ? encodeCursor(records[0], orderByConditions) : null;
        endCursor = records.length > 0 ? encodeCursor(records[records.length - 1], orderByConditions) : null;
        return {
          items: records,
          pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor }
        };
      }
    });
  }
});

// src/indexing-store/realtime.ts
var MAX_BATCH_SIZE2 = 1e3;
var getRealtimeStore = ({
  kind,
  schema,
  namespaceInfo,
  db
}) => ({
  create: ({
    tableName,
    encodedCheckpoint,
    id,
    data = {}
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.create` }, async () => {
      const createRow = encodeRow({ id, ...data }, table, kind);
      return await db.transaction().execute(async (tx) => {
        const row = await tx.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(createRow).returningAll().executeTakeFirstOrThrow().catch((err) => {
          throw parseStoreError(err, { id, ...data });
        });
        await tx.withSchema(namespaceInfo.internalNamespace).insertInto(namespaceInfo.internalTableIds[tableName]).values({
          operation: 0,
          id: createRow.id,
          checkpoint: encodedCheckpoint
        }).execute();
        return decodeRow(row, table, kind);
      });
    });
  },
  createMany: ({
    tableName,
    encodedCheckpoint,
    data
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.createMany` }, async () => {
      const rows = [];
      await db.transaction().execute(async (tx) => {
        for (let i = 0, len = data.length; i < len; i += MAX_BATCH_SIZE2) {
          const createRows = data.slice(i, i + MAX_BATCH_SIZE2).map((d) => encodeRow(d, table, kind));
          const _rows = await tx.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(createRows).returningAll().execute().catch((err) => {
            throw parseStoreError(err, data.length > 0 ? data[0] : {});
          });
          rows.push(..._rows);
          await tx.withSchema(namespaceInfo.internalNamespace).insertInto(namespaceInfo.internalTableIds[tableName]).values(
            createRows.map((row) => ({
              operation: 0,
              id: row.id,
              checkpoint: encodedCheckpoint
            }))
          ).execute();
        }
      });
      return rows.map((row) => decodeRow(row, table, kind));
    });
  },
  update: ({
    tableName,
    encodedCheckpoint,
    id,
    data = {}
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.update` }, async () => {
      const encodedId = encodeValue(id, table.id, kind);
      const row = await db.transaction().execute(async (tx) => {
        const latestRow = await tx.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).selectAll().where("id", "=", encodedId).executeTakeFirstOrThrow().catch((err) => {
          throw parseStoreError(err, { id, data: "(function)" });
        });
        const updateObject = typeof data === "function" ? data({ current: decodeRow(latestRow, table, kind) }) : data;
        const updateRow = encodeRow({ id, ...updateObject }, table, kind);
        const updateResult = await tx.withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(updateRow).where("id", "=", encodedId).returningAll().executeTakeFirstOrThrow().catch((err) => {
          throw parseStoreError(err, { id, ...updateObject });
        });
        await tx.withSchema(namespaceInfo.internalNamespace).insertInto(namespaceInfo.internalTableIds[tableName]).values({
          operation: 1,
          checkpoint: encodedCheckpoint,
          ...latestRow
        }).execute();
        return updateResult;
      });
      const result = decodeRow(row, table, kind);
      return result;
    });
  },
  updateMany: async ({
    tableName,
    encodedCheckpoint,
    where,
    data = {}
  }) => {
    const table = schema[tableName].table;
    const rows = [];
    let cursor = null;
    while (true) {
      const _rows = await db.wrap(
        { method: `${tableName}.updateMany` },
        () => db.transaction().execute(async (tx) => {
          const latestRows = await tx.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).selectAll().where(
            (eb) => buildWhereConditions({
              eb,
              where,
              table,
              encoding: kind
            })
          ).orderBy("id", "asc").limit(MAX_BATCH_SIZE2).$if(cursor !== null, (qb) => qb.where("id", ">", cursor)).execute();
          const rows2 = [];
          for (const latestRow of latestRows) {
            const updateObject = typeof data === "function" ? data({ current: decodeRow(latestRow, table, kind) }) : data;
            const updateRow = {
              id: latestRow.id,
              ...encodeRow(updateObject, table, kind)
            };
            const row = await tx.withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(updateRow).where("id", "=", latestRow.id).returningAll().executeTakeFirstOrThrow().catch((err) => {
              throw parseStoreError(err, updateObject);
            });
            rows2.push(row);
            await tx.withSchema(namespaceInfo.internalNamespace).insertInto(namespaceInfo.internalTableIds[tableName]).values({
              operation: 1,
              checkpoint: encodedCheckpoint,
              ...latestRow
            }).execute();
          }
          return rows2.map((row) => decodeRow(row, table, kind));
        })
      );
      rows.push(..._rows);
      if (_rows.length === 0) {
        break;
      } else {
        cursor = encodeValue(_rows[_rows.length - 1].id, table.id, kind);
      }
    }
    return rows;
  },
  upsert: ({
    tableName,
    encodedCheckpoint,
    id,
    create: create5 = {},
    update = {}
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.upsert` }, async () => {
      const encodedId = encodeValue(id, table.id, kind);
      const createRow = encodeRow({ id, ...create5 }, table, kind);
      const row = await db.transaction().execute(async (tx) => {
        const latestRow = await tx.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).selectAll().where("id", "=", encodedId).executeTakeFirst();
        if (latestRow === void 0) {
          const row3 = await tx.withSchema(namespaceInfo.userNamespace).insertInto(tableName).values(createRow).returningAll().executeTakeFirstOrThrow().catch((err) => {
            const prettyObject = { id };
            for (const [key, value] of Object.entries(create5))
              prettyObject[`create.${key}`] = value;
            if (typeof update === "function") {
              prettyObject.update = "(function)";
            } else {
              for (const [key, value] of Object.entries(update))
                prettyObject[`update.${key}`] = value;
            }
            throw parseStoreError(err, prettyObject);
          });
          await tx.withSchema(namespaceInfo.internalNamespace).insertInto(namespaceInfo.internalTableIds[tableName]).values({
            operation: 0,
            id: createRow.id,
            checkpoint: encodedCheckpoint
          }).execute();
          return row3;
        }
        const updateObject = typeof update === "function" ? update({ current: decodeRow(latestRow, table, kind) }) : update;
        const updateRow = encodeRow({ id, ...updateObject }, table, kind);
        const row2 = await tx.withSchema(namespaceInfo.userNamespace).updateTable(tableName).set(updateRow).where("id", "=", encodedId).returningAll().executeTakeFirstOrThrow().catch((err) => {
          const prettyObject = { id };
          for (const [key, value] of Object.entries(create5))
            prettyObject[`create.${key}`] = value;
          for (const [key, value] of Object.entries(updateObject))
            prettyObject[`update.${key}`] = value;
          throw parseStoreError(err, prettyObject);
        });
        await tx.withSchema(namespaceInfo.internalNamespace).insertInto(namespaceInfo.internalTableIds[tableName]).values({
          operation: 1,
          checkpoint: encodedCheckpoint,
          ...latestRow
        }).execute();
        return row2;
      });
      return decodeRow(row, table, kind);
    });
  },
  delete: ({
    tableName,
    encodedCheckpoint,
    id
  }) => {
    const table = schema[tableName].table;
    return db.wrap({ method: `${tableName}.delete` }, async () => {
      const encodedId = encodeValue(id, table.id, kind);
      const isDeleted = await db.transaction().execute(async (tx) => {
        const row = await tx.withSchema(namespaceInfo.userNamespace).selectFrom(tableName).selectAll().where("id", "=", encodedId).executeTakeFirst();
        const deletedRow = await tx.withSchema(namespaceInfo.userNamespace).deleteFrom(tableName).where("id", "=", encodedId).returning(["id"]).executeTakeFirst().catch((err) => {
          throw parseStoreError(err, { id });
        });
        if (row !== void 0) {
          await tx.withSchema(namespaceInfo.internalNamespace).insertInto(namespaceInfo.internalTableIds[tableName]).values({
            operation: 2,
            checkpoint: encodedCheckpoint,
            ...row
          }).execute();
        }
        return !!deletedRow;
      });
      return isDeleted;
    });
  }
});

// src/utils/never.ts
var never = (_x) => {
  throw "unreachable";
};

// src/indexing/service.ts
import { checksumAddress, createClient } from "viem";

// src/indexing/ponderActions.ts
import {
  getBalance as viemGetBalance,
  getBytecode as viemGetBytecode,
  getStorageAt as viemGetStorageAt,
  multicall as viemMulticall,
  readContract as viemReadContract
} from "viem/actions";
var buildCachedActions = (contextState) => {
  return (client) => ({
    getBalance: ({
      cache,
      blockNumber: userBlockNumber,
      ...args
    }) => viemGetBalance(client, {
      ...args,
      ...cache === "immutable" ? { blockTag: "latest" } : { blockNumber: userBlockNumber ?? contextState.blockNumber }
    }),
    getBytecode: ({
      cache,
      blockNumber: userBlockNumber,
      ...args
    }) => viemGetBytecode(client, {
      ...args,
      ...cache === "immutable" ? { blockTag: "latest" } : { blockNumber: userBlockNumber ?? contextState.blockNumber }
    }),
    getStorageAt: ({
      cache,
      blockNumber: userBlockNumber,
      ...args
    }) => viemGetStorageAt(client, {
      ...args,
      ...cache === "immutable" ? { blockTag: "latest" } : { blockNumber: userBlockNumber ?? contextState.blockNumber }
    }),
    multicall: ({
      cache,
      blockNumber: userBlockNumber,
      ...args
    }) => viemMulticall(client, {
      ...args,
      ...cache === "immutable" ? { blockTag: "latest" } : { blockNumber: userBlockNumber ?? contextState.blockNumber }
    }),
    // @ts-ignore
    readContract: ({
      cache,
      blockNumber: userBlockNumber,
      ...args
    }) => viemReadContract(client, {
      ...args,
      ...cache === "immutable" ? { blockTag: "latest" } : { blockNumber: userBlockNumber ?? contextState.blockNumber }
    })
  });
};
var buildDb = ({
  common,
  schema,
  indexingStore,
  contextState
}) => {
  return Object.keys(getTables(schema)).reduce((acc, tableName) => {
    acc[tableName] = {
      findUnique: async ({ id }) => {
        common.logger.trace({
          service: "store",
          msg: `${tableName}.findUnique(id=${id})`
        });
        return indexingStore.findUnique({
          tableName,
          id
        });
      },
      findMany: async ({ where, orderBy, limit, before, after } = {}) => {
        common.logger.trace({
          service: "store",
          msg: `${tableName}.findMany`
        });
        return indexingStore.findMany({
          tableName,
          where,
          orderBy,
          limit,
          before,
          after
        });
      },
      create: async ({ id, data }) => {
        common.logger.trace({
          service: "store",
          msg: `${tableName}.create(id=${id})`
        });
        return indexingStore.create({
          tableName,
          encodedCheckpoint: contextState.encodedCheckpoint,
          id,
          data
        });
      },
      createMany: async ({ data }) => {
        common.logger.trace({
          service: "store",
          msg: `${tableName}.createMany(count=${data.length})`
        });
        return indexingStore.createMany({
          tableName,
          encodedCheckpoint: contextState.encodedCheckpoint,
          data
        });
      },
      update: async ({ id, data }) => {
        common.logger.trace({
          service: "store",
          msg: `${tableName}.update(id=${id})`
        });
        return indexingStore.update({
          tableName,
          encodedCheckpoint: contextState.encodedCheckpoint,
          id,
          data
        });
      },
      updateMany: async ({ where, data }) => {
        common.logger.trace({
          service: "store",
          msg: `${tableName}.updateMany`
        });
        return indexingStore.updateMany({
          tableName,
          encodedCheckpoint: contextState.encodedCheckpoint,
          where,
          data
        });
      },
      upsert: async ({ id, create: create5, update }) => {
        common.logger.trace({
          service: "store",
          msg: `${tableName}.upsert(id=${id})`
        });
        return indexingStore.upsert({
          tableName,
          encodedCheckpoint: contextState.encodedCheckpoint,
          id,
          create: create5,
          update
        });
      },
      delete: async ({ id }) => {
        common.logger.trace({
          service: "store",
          msg: `${tableName}.delete(id=${id})`
        });
        return indexingStore.delete({
          tableName,
          encodedCheckpoint: contextState.encodedCheckpoint,
          id
        });
      }
    };
    return acc;
  }, {});
};

// src/indexing/trace.ts
import { readFileSync as readFileSync4 } from "node:fs";
import { codeFrameColumns as codeFrameColumns2 } from "@babel/code-frame";
import { parse as parseStackTrace2 } from "stacktrace-parser";
var addUserStackTrace = (error, options) => {
  if (!error.stack)
    return;
  const stackTrace = parseStackTrace2(error.stack);
  let codeFrame;
  let userStackTrace;
  const firstUserFrameIndex = stackTrace.findIndex(
    (frame) => frame.file?.includes(options.srcDir)
  );
  if (firstUserFrameIndex >= 0) {
    userStackTrace = stackTrace.filter(
      (frame) => frame.file?.includes(options.srcDir)
    );
    const firstUserFrame = stackTrace[firstUserFrameIndex];
    if (firstUserFrame?.file && firstUserFrame?.lineNumber) {
      try {
        const sourceContent = readFileSync4(firstUserFrame.file, {
          encoding: "utf-8"
        });
        codeFrame = codeFrameColumns2(
          sourceContent,
          {
            start: {
              line: firstUserFrame.lineNumber,
              column: firstUserFrame.column ?? void 0
            }
          },
          { highlightCode: true }
        );
      } catch (err) {
      }
    }
  } else {
    userStackTrace = stackTrace;
  }
  const formattedStackTrace = [
    `${error.name}: ${error.message}`,
    ...userStackTrace.map(({ file, lineNumber, column, methodName }) => {
      const prefix = "    at";
      const path11 = `${file}${lineNumber !== null ? `:${lineNumber}` : ""}${column !== null ? `:${column}` : ""}`;
      if (methodName === null || methodName === "<unknown>") {
        return `${prefix} ${path11}`;
      } else {
        return `${prefix} ${methodName} (${path11})`;
      }
    }),
    codeFrame
  ].join("\n");
  error.stack = formattedStackTrace;
};

// src/indexing/service.ts
var create2 = ({
  indexingFunctions,
  common,
  sources,
  networks,
  syncService,
  indexingStore,
  schema
}) => {
  const contextState = {
    encodedCheckpoint: void 0,
    blockNumber: void 0
  };
  const clientByChainId = {};
  const contractsByChainId = {};
  const networkByChainId = networks.reduce(
    (acc, cur) => {
      acc[cur.chainId] = cur;
      return acc;
    },
    {}
  );
  for (const source of sources) {
    if (source.type === "block")
      continue;
    const address = source.type === "factoryCallTrace" || source.type === "factoryLog" ? void 0 : source.type === "callTrace" ? source.criteria.toAddress.length === 1 ? source.criteria.toAddress[0] : void 0 : typeof source.criteria.address === "string" ? source.criteria.address : void 0;
    if (contractsByChainId[source.chainId] === void 0) {
      contractsByChainId[source.chainId] = {};
    }
    if (contractsByChainId[source.chainId][source.contractName] !== void 0)
      continue;
    contractsByChainId[source.chainId][source.contractName] = {
      abi: source.abi,
      address: address ? checksumAddress(address) : address,
      startBlock: source.startBlock,
      endBlock: source.endBlock,
      maxBlockRange: source.maxBlockRange
    };
  }
  const db = buildDb({ common, schema, indexingStore, contextState });
  const cachedActions = buildCachedActions(contextState);
  for (const network of networks) {
    const transport = syncService.getCachedTransport(network);
    clientByChainId[network.chainId] = createClient({
      transport,
      chain: network.chain
    }).extend(cachedActions);
  }
  const eventCount = {};
  for (const eventName of Object.keys(indexingFunctions)) {
    eventCount[eventName] = {};
    for (const network of networks) {
      eventCount[eventName][network.name] = 0;
    }
  }
  return {
    common,
    indexingFunctions,
    indexingStore,
    isKilled: false,
    eventCount,
    firstEventCheckpoint: void 0,
    lastEventCheckpoint: void 0,
    currentEvent: {
      contextState,
      context: {
        network: { name: void 0, chainId: void 0 },
        contracts: void 0,
        client: void 0,
        db
      }
    },
    networkByChainId,
    clientByChainId,
    contractsByChainId
  };
};
var updateIndexingStore = async (indexingService, { indexingStore, schema }) => {
  const db = buildDb({
    common: indexingService.common,
    schema,
    indexingStore,
    contextState: indexingService.currentEvent.contextState
  });
  indexingService.currentEvent.context.db = db;
};
var processSetupEvents = async (indexingService, {
  sources,
  networks
}) => {
  for (const eventName of Object.keys(indexingService.indexingFunctions)) {
    if (!eventName.endsWith(":setup"))
      continue;
    const [contractName] = eventName.split(":");
    for (const network of networks) {
      const source = sources.find(
        (s) => (sourceIsLog(s) || sourceIsFactoryLog(s)) && s.contractName === contractName && s.chainId === network.chainId
      );
      if (indexingService.isKilled)
        return { status: "killed" };
      indexingService.eventCount[eventName][source.networkName]++;
      const result = await executeSetup(indexingService, {
        event: {
          type: "setup",
          chainId: network.chainId,
          contractName: source.contractName,
          startBlock: BigInt(source.startBlock),
          encodedCheckpoint: encodeCheckpoint({
            ...zeroCheckpoint,
            chainId: BigInt(network.chainId),
            blockNumber: BigInt(source.startBlock)
          })
        }
      });
      if (result.status !== "success") {
        return result;
      }
    }
  }
  return { status: "success" };
};
var processEvents = async (indexingService, { events }) => {
  if (events.length > 0 && indexingService.firstEventCheckpoint === void 0) {
    indexingService.firstEventCheckpoint = decodeCheckpoint(
      events[0].encodedCheckpoint
    );
    if (indexingService.lastEventCheckpoint !== void 0) {
      indexingService.common.metrics.ponder_indexing_total_seconds.set(
        indexingService.lastEventCheckpoint.blockTimestamp - indexingService.firstEventCheckpoint.blockTimestamp
      );
    }
  }
  const eventCounts = {};
  for (let i = 0; i < events.length; i++) {
    if (indexingService.isKilled)
      return { status: "killed" };
    const event = events[i];
    switch (event.type) {
      case "log": {
        const eventName = `${event.contractName}:${event.logEventName}`;
        indexingService.eventCount[eventName][indexingService.networkByChainId[event.chainId].name]++;
        indexingService.common.logger.trace({
          service: "indexing",
          msg: `Started indexing function (event="${eventName}", checkpoint=${event.encodedCheckpoint})`
        });
        const result = await executeLog(indexingService, { event });
        if (result.status !== "success") {
          return result;
        }
        if (eventCounts[eventName] === void 0)
          eventCounts[eventName] = 0;
        eventCounts[eventName]++;
        indexingService.common.logger.trace({
          service: "indexing",
          msg: `Completed indexing function (event="${eventName}", checkpoint=${event.encodedCheckpoint})`
        });
        break;
      }
      case "block": {
        const eventName = `${event.sourceName}:block`;
        indexingService.eventCount[eventName][indexingService.networkByChainId[event.chainId].name]++;
        indexingService.common.logger.trace({
          service: "indexing",
          msg: `Started indexing function (event="${eventName}", checkpoint=${event.encodedCheckpoint})`
        });
        const result = await executeBlock(indexingService, { event });
        if (result.status !== "success") {
          return result;
        }
        if (eventCounts[eventName] === void 0)
          eventCounts[eventName] = 0;
        eventCounts[eventName]++;
        indexingService.common.logger.trace({
          service: "indexing",
          msg: `Completed indexing function (event="${eventName}", checkpoint=${event.encodedCheckpoint})`
        });
        break;
      }
      case "callTrace": {
        const eventName = `${event.contractName}.${event.functionName}`;
        indexingService.eventCount[eventName][indexingService.networkByChainId[event.chainId].name]++;
        indexingService.common.logger.trace({
          service: "indexing",
          msg: `Started indexing function (event="${eventName}", checkpoint=${event.encodedCheckpoint})`
        });
        const result = await executeCallTrace(indexingService, { event });
        if (result.status !== "success") {
          return result;
        }
        if (eventCounts[eventName] === void 0)
          eventCounts[eventName] = 0;
        eventCounts[eventName]++;
        indexingService.common.logger.trace({
          service: "indexing",
          msg: `Completed indexing function (event="${eventName}", checkpoint=${event.encodedCheckpoint})`
        });
        break;
      }
      default:
        never(event);
    }
    if (i % 93 === 0) {
      updateCompletedEvents(indexingService);
      const eventTimestamp = decodeCheckpoint(
        event.encodedCheckpoint
      ).blockTimestamp;
      indexingService.common.metrics.ponder_indexing_completed_seconds.set(
        eventTimestamp - indexingService.firstEventCheckpoint.blockTimestamp
      );
      indexingService.common.metrics.ponder_indexing_completed_timestamp.set(
        eventTimestamp
      );
      await new Promise(setImmediate);
    }
  }
  if (events.length > 0 && indexingService.firstEventCheckpoint !== void 0 && indexingService.lastEventCheckpoint !== void 0) {
    const lastEventInBatchTimestamp = decodeCheckpoint(
      events[events.length - 1].encodedCheckpoint
    ).blockTimestamp;
    indexingService.common.metrics.ponder_indexing_completed_seconds.set(
      lastEventInBatchTimestamp - indexingService.firstEventCheckpoint.blockTimestamp
    );
    indexingService.common.metrics.ponder_indexing_completed_timestamp.set(
      lastEventInBatchTimestamp
    );
  }
  updateCompletedEvents(indexingService);
  for (const [eventName, count] of Object.entries(eventCounts)) {
    if (count === 1) {
      indexingService.common.logger.info({
        service: "indexing",
        msg: `Indexed 1 '${eventName}' event`
      });
    } else {
      indexingService.common.logger.info({
        service: "indexing",
        msg: `Indexed ${count} '${eventName}' events`
      });
    }
  }
  return { status: "success" };
};
var kill2 = (indexingService) => {
  indexingService.common.logger.debug({
    service: "indexing",
    msg: "Killed indexing service"
  });
  indexingService.isKilled = true;
};
var updateLastEventCheckpoint = (indexingService, lastEventCheckpoint) => {
  indexingService.lastEventCheckpoint = lastEventCheckpoint;
  if (indexingService.firstEventCheckpoint !== void 0) {
    indexingService.common.metrics.ponder_indexing_total_seconds.set(
      indexingService.lastEventCheckpoint.blockTimestamp - indexingService.firstEventCheckpoint.blockTimestamp
    );
  }
};
var updateCompletedEvents = (indexingService) => {
  for (const event of Object.keys(indexingService.eventCount)) {
    for (const network of Object.keys(indexingService.eventCount[event])) {
      const metricLabel = {
        event,
        network
      };
      indexingService.common.metrics.ponder_indexing_completed_events.set(
        metricLabel,
        indexingService.eventCount[event][network]
      );
    }
  }
};
var executeSetup = async (indexingService, { event }) => {
  const {
    common,
    indexingFunctions,
    currentEvent,
    networkByChainId,
    contractsByChainId,
    clientByChainId
  } = indexingService;
  const eventName = `${event.contractName}:setup`;
  const indexingFunction = indexingFunctions[eventName];
  const networkName = networkByChainId[event.chainId].name;
  const metricLabel = { event: eventName, network: networkName };
  try {
    currentEvent.context.network.chainId = event.chainId;
    currentEvent.context.network.name = networkByChainId[event.chainId].name;
    currentEvent.context.client = clientByChainId[event.chainId];
    currentEvent.context.contracts = contractsByChainId[event.chainId];
    currentEvent.contextState.encodedCheckpoint = event.encodedCheckpoint;
    currentEvent.contextState.blockNumber = event.startBlock;
    const endClock = startClock();
    await indexingFunction({
      context: currentEvent.context
    });
    common.metrics.ponder_indexing_function_duration.observe(
      metricLabel,
      endClock()
    );
  } catch (error_) {
    if (indexingService.isKilled)
      return { status: "killed" };
    const error = error_;
    common.metrics.ponder_indexing_function_error_total.inc(metricLabel);
    const decodedCheckpoint = decodeCheckpoint(event.encodedCheckpoint);
    addUserStackTrace(error, common.options);
    common.metrics.ponder_indexing_has_error.set(1);
    common.logger.error({
      service: "indexing",
      msg: `Error while processing '${eventName}' event in '${networkName}' block ${decodedCheckpoint.blockNumber}`,
      error
    });
    return { status: "error", error };
  }
  return { status: "success" };
};
var executeLog = async (indexingService, { event }) => {
  const {
    common,
    indexingFunctions,
    currentEvent,
    networkByChainId,
    contractsByChainId,
    clientByChainId
  } = indexingService;
  const eventName = `${event.contractName}:${event.logEventName}`;
  const indexingFunction = indexingFunctions[eventName];
  const networkName = networkByChainId[event.chainId].name;
  const metricLabel = { event: eventName, network: networkName };
  try {
    currentEvent.context.network.chainId = event.chainId;
    currentEvent.context.network.name = networkByChainId[event.chainId].name;
    currentEvent.context.client = clientByChainId[event.chainId];
    currentEvent.context.contracts = contractsByChainId[event.chainId];
    currentEvent.contextState.encodedCheckpoint = event.encodedCheckpoint;
    currentEvent.contextState.blockNumber = event.event.block.number;
    const endClock = startClock();
    await indexingFunction({
      event: {
        name: event.logEventName,
        args: event.event.args,
        log: event.event.log,
        block: event.event.block,
        transaction: event.event.transaction,
        transactionReceipt: event.event.transactionReceipt
      },
      context: currentEvent.context
    });
    common.metrics.ponder_indexing_function_duration.observe(
      metricLabel,
      endClock()
    );
  } catch (error_) {
    if (indexingService.isKilled)
      return { status: "killed" };
    const error = error_;
    common.metrics.ponder_indexing_function_error_total.inc(metricLabel);
    const decodedCheckpoint = decodeCheckpoint(event.encodedCheckpoint);
    addUserStackTrace(error, common.options);
    common.logger.error({
      service: "indexing",
      msg: `Error while processing '${eventName}' event in '${networkName}' block ${decodedCheckpoint.blockNumber}`,
      error
    });
    common.metrics.ponder_indexing_has_error.set(1);
    return { status: "error", error };
  }
  return { status: "success" };
};
var executeBlock = async (indexingService, { event }) => {
  const {
    common,
    indexingFunctions,
    currentEvent,
    networkByChainId,
    contractsByChainId,
    clientByChainId
  } = indexingService;
  const eventName = `${event.sourceName}:block`;
  const indexingFunction = indexingFunctions[eventName];
  const metricLabel = {
    event: eventName,
    network: networkByChainId[event.chainId].name
  };
  try {
    currentEvent.context.network.chainId = event.chainId;
    currentEvent.context.network.name = networkByChainId[event.chainId].name;
    currentEvent.context.client = clientByChainId[event.chainId];
    currentEvent.context.contracts = contractsByChainId[event.chainId];
    currentEvent.contextState.encodedCheckpoint = event.encodedCheckpoint;
    currentEvent.contextState.blockNumber = event.event.block.number;
    const endClock = startClock();
    await indexingFunction({
      event: {
        block: event.event.block
      },
      context: currentEvent.context
    });
    common.metrics.ponder_indexing_function_duration.observe(
      metricLabel,
      endClock()
    );
  } catch (error_) {
    if (indexingService.isKilled)
      return { status: "killed" };
    const error = error_;
    common.metrics.ponder_indexing_function_error_total.inc(metricLabel);
    const decodedCheckpoint = decodeCheckpoint(event.encodedCheckpoint);
    addUserStackTrace(error, common.options);
    common.logger.error({
      service: "indexing",
      msg: `Error while processing ${eventName} event at chainId=${decodedCheckpoint.chainId}, block=${decodedCheckpoint.blockNumber}: `,
      error
    });
    common.metrics.ponder_indexing_has_error.set(1);
    return { status: "error", error };
  }
  return { status: "success" };
};
var executeCallTrace = async (indexingService, { event }) => {
  const {
    common,
    indexingFunctions,
    currentEvent,
    networkByChainId,
    contractsByChainId,
    clientByChainId
  } = indexingService;
  const eventName = `${event.contractName}.${event.functionName}`;
  const indexingFunction = indexingFunctions[eventName];
  const networkName = networkByChainId[event.chainId].name;
  const metricLabel = { event: eventName, network: networkName };
  try {
    currentEvent.context.network.chainId = event.chainId;
    currentEvent.context.network.name = networkByChainId[event.chainId].name;
    currentEvent.context.client = clientByChainId[event.chainId];
    currentEvent.context.contracts = contractsByChainId[event.chainId];
    currentEvent.contextState.encodedCheckpoint = event.encodedCheckpoint;
    currentEvent.contextState.blockNumber = event.event.block.number;
    const endClock = startClock();
    await indexingFunction({
      event: {
        args: event.event.args,
        result: event.event.result,
        trace: event.event.trace,
        block: event.event.block,
        transaction: event.event.transaction,
        transactionReceipt: event.event.transactionReceipt
      },
      context: currentEvent.context
    });
    common.metrics.ponder_indexing_function_duration.observe(
      metricLabel,
      endClock()
    );
  } catch (error_) {
    if (indexingService.isKilled)
      return { status: "killed" };
    const error = error_;
    common.metrics.ponder_indexing_function_error_total.inc(metricLabel);
    const decodedCheckpoint = decodeCheckpoint(event.encodedCheckpoint);
    addUserStackTrace(error, common.options);
    common.logger.error({
      service: "indexing",
      msg: `Error while processing '${eventName}' event in '${networkName}' block ${decodedCheckpoint.blockNumber}`,
      error
    });
    common.metrics.ponder_indexing_has_error.set(1);
    return { status: "error", error };
  }
  return { status: "success" };
};

// src/indexing/index.ts
var methods2 = {
  create: create2,
  kill: kill2,
  processEvents,
  processSetupEvents,
  updateIndexingStore,
  updateLastEventCheckpoint
};
var createIndexingService = extend(create2, methods2);

// src/server/service.ts
import http from "node:http";

// src/ui/graphiql.html.ts
var graphiQLHtml = (path11) => `<!--
 *  Copyright (c) 2021 GraphQL Contributors
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
-->
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Ponder Playground</title>
    <style>
      body {
        height: 100%;
        margin: 0;
        width: 100%;
        overflow: hidden;
      }
      #graphiql {
        height: 100vh;
      }
      *::-webkit-scrollbar {
        height: 0.3rem;
        width: 0.5rem;
      }
      *::-webkit-scrollbar-track {
        -ms-overflow-style: none;
        overflow: -moz-scrollbars-none;
      }
      *::-webkit-scrollbar-thumb {
        -ms-overflow-style: none;
        overflow: -moz-scrollbars-none;
      }
    </style>
    <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/@graphiql/plugin-explorer/dist/style.css" />
  </head>
  <body>
    <div id="graphiql">Loading...</div>
    <script crossorigin src="https://unpkg.com/react/umd/react.development.js"></script>1
    <script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/graphiql/graphiql.min.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/@graphiql/plugin-explorer/dist/index.umd.js" crossorigin="anonymous"></script>
    <script>
      const fetcher = GraphiQL.createFetcher({ url: "${path11}" });
      const explorerPlugin = GraphiQLPluginExplorer.explorerPlugin();
      const root = ReactDOM.createRoot(document.getElementById("graphiql"));
      root.render(
        React.createElement(GraphiQL, {
          fetcher,
          plugins: [explorerPlugin],
          defaultEditorToolsVisibility: false,
        })
      );
    </script>
  </body>
</html>`;

// src/server/service.ts
import { maxAliasesPlugin } from "@escape.tech/graphql-armor-max-aliases";
import { maxDepthPlugin } from "@escape.tech/graphql-armor-max-depth";
import { maxTokensPlugin } from "@escape.tech/graphql-armor-max-tokens";
import { serve } from "@hono/node-server";
import { GraphQLError } from "graphql";
import { createYoga } from "graphql-yoga";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { createHttpTerminator } from "http-terminator";

// src/server/graphql/buildLoaderCache.ts
import DataLoader from "dataloader";
function buildLoaderCache({ store }) {
  const loaderCache = {};
  return ({ tableName }) => {
    const loader = loaderCache[tableName] ??= new DataLoader(
      async (ids) => {
        const rows = await store.findMany({
          tableName,
          where: { id: { in: ids } },
          limit: ids.length
        });
        return ids.map((id) => rows.items.find((row) => row.id === id));
      },
      { maxBatchSize: 1e3 }
    );
    return loader;
  };
}

// src/server/service.ts
async function createServer2({
  graphqlSchema,
  readonlyStore,
  common
}) {
  const hono = new Hono();
  let port = common.options.port;
  let isHealthy = false;
  const startTime = Date.now();
  const metricsMiddleware = createMiddleware(async (c, next) => {
    const commonLabels = { method: c.req.method, path: c.req.path };
    common.metrics.ponder_http_server_active_requests.inc(commonLabels);
    const endClock = startClock();
    try {
      await next();
    } finally {
      const requestSize = Number(c.req.header("Content-Length") ?? 0);
      const responseSize = Number(c.res.headers.get("Content-Length") ?? 0);
      const responseDuration = endClock();
      const status = c.res.status >= 200 && c.res.status < 300 ? "2XX" : c.res.status >= 300 && c.res.status < 400 ? "3XX" : c.res.status >= 400 && c.res.status < 500 ? "4XX" : "5XX";
      common.metrics.ponder_http_server_active_requests.dec(commonLabels);
      common.metrics.ponder_http_server_request_size_bytes.observe(
        { ...commonLabels, status },
        requestSize
      );
      common.metrics.ponder_http_server_response_size_bytes.observe(
        { ...commonLabels, status },
        responseSize
      );
      common.metrics.ponder_http_server_request_duration_ms.observe(
        { ...commonLabels, status },
        responseDuration
      );
    }
  });
  const createGraphqlYoga = (path11) => createYoga({
    schema: graphqlSchema,
    context: () => {
      const getLoader = buildLoaderCache({ store: readonlyStore });
      return { store: readonlyStore, getLoader };
    },
    graphqlEndpoint: path11,
    maskedErrors: process.env.NODE_ENV === "production",
    logging: false,
    graphiql: false,
    parserAndValidationCache: false,
    plugins: [
      maxTokensPlugin({ n: common.options.graphqlMaxOperationTokens }),
      maxDepthPlugin({
        n: common.options.graphqlMaxOperationDepth,
        ignoreIntrospection: false
      }),
      maxAliasesPlugin({
        n: common.options.graphqlMaxOperationAliases,
        allowList: []
      })
    ]
  });
  const rootYoga = createGraphqlYoga("/");
  const rootGraphiql = graphiQLHtml("/");
  const prodYoga = createGraphqlYoga("/graphql");
  const prodGraphiql = graphiQLHtml("/graphql");
  hono.use(cors()).use(metricsMiddleware).get("/metrics", async (c) => {
    try {
      const metrics = await common.metrics.getMetrics();
      return c.text(metrics);
    } catch (error) {
      return c.json(error, 500);
    }
  }).get("/health", async (c) => {
    if (isHealthy) {
      return c.text("", 200);
    }
    const elapsed = (Date.now() - startTime) / 1e3;
    const max = common.options.maxHealthcheckDuration;
    if (elapsed > max) {
      common.logger.warn({
        service: "server",
        msg: `Historical indexing duration has exceeded the max healthcheck duration of ${max} seconds (current: ${elapsed}). Sevice is now responding as healthy and may serve incomplete data.`
      });
      return c.text("", 200);
    }
    return c.text("Historical indexing is not complete.", 503);
  }).get("/graphql", (c) => c.html(prodGraphiql)).post("/graphql", (c) => {
    if (isHealthy === false) {
      return c.json(
        { errors: [new GraphQLError("Historical indexing is not complete")] },
        503
      );
    }
    return prodYoga.handle(c.req.raw);
  }).get("/", (c) => c.html(rootGraphiql)).post("/", (c) => rootYoga.handle(c.req.raw));
  const createServerWithNextAvailablePort = (...args) => {
    const httpServer2 = http.createServer(...args);
    const errorHandler = (error) => {
      if (error.code === "EADDRINUSE") {
        common.logger.warn({
          service: "server",
          msg: `Port ${port} was in use, trying port ${port + 1}`
        });
        port += 1;
        setTimeout(() => {
          httpServer2.close();
          httpServer2.listen(port, common.options.hostname);
        }, 5);
      }
    };
    const listenerHandler = () => {
      common.metrics.ponder_http_server_port.set(port);
      common.logger.info({
        service: "server",
        msg: `Started listening on port ${port}`
      });
      httpServer2.off("error", errorHandler);
    };
    httpServer2.on("error", errorHandler);
    httpServer2.on("listening", listenerHandler);
    return httpServer2;
  };
  const httpServer = await new Promise((resolve2, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("HTTP server failed to start within 5 seconds."));
    }, 5e3);
    const httpServer2 = serve(
      {
        fetch: hono.fetch,
        createServer: createServerWithNextAvailablePort,
        port,
        // Note that common.options.hostname can be undefined if the user did not specify one.
        // In this case, Node.js uses `::` if IPv6 is available and `0.0.0.0` otherwise.
        // https://nodejs.org/api/net.html#serverlistenport-host-backlog-callback
        hostname: common.options.hostname
      },
      () => {
        clearTimeout(timeout);
        resolve2(httpServer2);
      }
    );
  });
  const terminator = createHttpTerminator({
    server: httpServer,
    gracefulTerminationTimeout: 1e3
  });
  return {
    hono,
    port,
    setHealthy: () => {
      isHealthy = true;
    },
    kill: () => terminator.terminate()
  };
}

// src/utils/fragments.ts
function buildLogFilterFragments({
  address,
  topics,
  includeTransactionReceipts,
  chainId
}) {
  return buildLogFragments({
    address,
    topics,
    includeTransactionReceipts,
    chainId,
    idCallback: (address_, topic0_, topic1_, topic2_, topic3_) => `${chainId}_${address_}_${topic0_}_${topic1_}_${topic2_}_${topic3_}_${includeTransactionReceipts ? 1 : 0}`
  });
}
function buildFactoryLogFragments({
  address,
  eventSelector,
  childAddressLocation,
  topics,
  includeTransactionReceipts,
  chainId
}) {
  const fragments = buildLogFragments({
    address,
    topics,
    includeTransactionReceipts,
    chainId,
    childAddressLocation,
    eventSelector,
    idCallback: (address_, topic0_, topic1_, topic2_, topic3_) => `${chainId}_${address_}_${eventSelector}_${childAddressLocation}_${topic0_}_${topic1_}_${topic2_}_${topic3_}_${includeTransactionReceipts ? 1 : 0}`
  });
  return fragments;
}
function buildLogFragments({
  address,
  topics,
  chainId,
  idCallback,
  includeTransactionReceipts,
  ...rest
}) {
  const fragments = [];
  const { topic0, topic1, topic2, topic3 } = parseTopics(topics);
  for (const address_ of Array.isArray(address) ? address : [address ?? null]) {
    for (const topic0_ of Array.isArray(topic0) ? topic0 : [topic0]) {
      for (const topic1_ of Array.isArray(topic1) ? topic1 : [topic1]) {
        for (const topic2_ of Array.isArray(topic2) ? topic2 : [topic2]) {
          for (const topic3_ of Array.isArray(topic3) ? topic3 : [topic3]) {
            fragments.push({
              id: idCallback(address_, topic0_, topic1_, topic2_, topic3_),
              ...rest,
              chainId,
              address: address_,
              topic0: topic0_,
              topic1: topic1_,
              topic2: topic2_,
              topic3: topic3_,
              includeTransactionReceipts: includeTransactionReceipts ? 1 : 0
            });
          }
        }
      }
    }
  }
  return fragments;
}
function parseTopics(topics) {
  return {
    topic0: topics?.[0] ?? null,
    topic1: topics?.[1] ?? null,
    topic2: topics?.[2] ?? null,
    topic3: topics?.[3] ?? null
  };
}
function buildTraceFragments({
  fromAddress,
  toAddress,
  chainId
}) {
  const fragments = [];
  for (const _fromAddress of Array.isArray(fromAddress) ? fromAddress : [null]) {
    for (const _toAddress of Array.isArray(toAddress) ? toAddress : [null]) {
      fragments.push({
        id: `${chainId}_${_fromAddress}_${_toAddress}`,
        chainId,
        fromAddress: _fromAddress,
        toAddress: _toAddress
      });
    }
  }
  return fragments;
}
function buildFactoryTraceFragments({
  address,
  eventSelector,
  childAddressLocation,
  fromAddress,
  chainId
}) {
  const fragments = [];
  for (const _fromAddress of Array.isArray(fromAddress) ? fromAddress : [null]) {
    fragments.push({
      id: `${chainId}_${address}_${eventSelector}_${childAddressLocation}_${_fromAddress}`,
      chainId,
      address,
      eventSelector,
      childAddressLocation,
      fromAddress: _fromAddress
    });
  }
  return fragments;
}

// src/utils/interval.ts
function intervalSum(intervals) {
  let totalSum = 0;
  for (const [start4, end] of intervals) {
    totalSum += end - start4 + 1;
  }
  return totalSum;
}
function intervalUnion(intervals_) {
  if (intervals_.length === 0)
    return [];
  const intervals = intervals_.map(
    (interval) => [...interval]
  );
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [];
  let currentInterval = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const nextInterval = intervals[i];
    if (currentInterval[1] >= nextInterval[0] - 1) {
      currentInterval[1] = Math.max(currentInterval[1], nextInterval[1]);
    } else {
      result.push(currentInterval);
      currentInterval = nextInterval;
    }
  }
  result.push(currentInterval);
  return result;
}
function intervalIntersection(list1, list2) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < list1.length && j < list2.length) {
    const [start1, end1] = list1[i];
    const [start22, end2] = list2[j];
    const intersectionStart = Math.max(start1, start22);
    const intersectionEnd = Math.min(end1, end2);
    if (intersectionStart <= intersectionEnd) {
      result.push([intersectionStart, intersectionEnd]);
    }
    if (end1 < end2) {
      i++;
    } else {
      j++;
    }
  }
  return intervalUnion(result);
}
function intervalIntersectionMany(lists) {
  if (lists.length === 0)
    return [];
  if (lists.length === 1)
    return lists[0];
  let result = lists[0];
  for (let i = 1; i < lists.length; i++) {
    result = intervalIntersection(result, lists[i]);
  }
  return intervalUnion(result);
}
function intervalDifference(initial, remove) {
  const initial_ = initial.map((interval) => [...interval]);
  const remove_ = remove.map((interval) => [...interval]);
  const result = [];
  let i = 0;
  let j = 0;
  while (i < initial.length && j < remove.length) {
    const interval1 = initial_[i];
    const interval2 = remove_[j];
    if (interval1[1] < interval2[0]) {
      result.push(interval1);
      i++;
    } else if (interval2[1] < interval1[0]) {
      j++;
    } else {
      if (interval1[0] < interval2[0]) {
        result.push([interval1[0], interval2[0] - 1]);
      }
      if (interval1[1] > interval2[1]) {
        interval1[0] = interval2[1] + 1;
        j++;
      } else {
        i++;
      }
    }
  }
  while (i < initial_.length) {
    result.push(initial_[i]);
    i++;
  }
  return result;
}
function getChunks({
  intervals,
  maxChunkSize
}) {
  const _chunks = [];
  for (const interval of intervals) {
    const [startBlock, endBlock] = interval;
    let fromBlock = startBlock;
    let toBlock = Math.min(fromBlock + maxChunkSize - 1, endBlock);
    while (fromBlock <= endBlock) {
      _chunks.push([fromBlock, toBlock]);
      fromBlock = toBlock + 1;
      toBlock = Math.min(fromBlock + maxChunkSize - 1, endBlock);
    }
  }
  return _chunks;
}
var ProgressTracker = class {
  target;
  _completed;
  _required = null;
  _checkpoint = null;
  /**
     * Constructs a new ProgressTracker object.
  
     * @throws Will throw an error if the target interval is invalid.
     */
  constructor({
    target,
    completed
  }) {
    if (target[0] > target[1])
      throw new Error(
        `Invalid interval: start (${target[0]}) is greater than end (${target[1]})`
      );
    this.target = target;
    this._completed = completed;
  }
  /**
   * Adds a completed interval.
   *
   * @throws Will throw an error if the new interval is invalid.
   */
  addCompletedInterval(interval) {
    if (interval[0] > interval[1])
      throw new Error(
        `Invalid interval: start (${interval[0]}) is greater than end (${interval[1]})`
      );
    const prevCheckpoint = this.getCheckpoint();
    this._completed = intervalUnion([...this._completed, interval]);
    this.invalidateCache();
    const newCheckpoint = this.getCheckpoint();
    return {
      isUpdated: newCheckpoint > prevCheckpoint,
      prevCheckpoint,
      newCheckpoint
    };
  }
  /**
   * Returns the remaining required intervals.
   */
  getRequired() {
    if (this._required === null) {
      this._required = intervalDifference([this.target], this._completed);
    }
    return this._required;
  }
  /**
   * Returns the checkpoint value. If no progress has been made, the checkpoint
   * is equal to the target start minus one.
   */
  getCheckpoint() {
    if (this._checkpoint !== null)
      return this._checkpoint;
    const completedIntervalIncludingTargetStart = this._completed.sort((a, b) => a[0] - b[0]).find((i) => i[0] <= this.target[0] && i[1] >= this.target[0]);
    if (completedIntervalIncludingTargetStart) {
      this._checkpoint = completedIntervalIncludingTargetStart[1];
    } else {
      this._checkpoint = this.target[0] - 1;
    }
    return this._checkpoint;
  }
  invalidateCache() {
    this._required = null;
    this._checkpoint = null;
  }
};
var BlockProgressTracker = class {
  pendingBlocks = [];
  completedBlocks = [];
  checkpoint = null;
  addPendingBlocks({ blockNumbers }) {
    if (blockNumbers.length === 0)
      return;
    const maxPendingBlock = this.pendingBlocks[this.pendingBlocks.length - 1];
    const sorted = blockNumbers.sort((a, b) => a - b);
    const minNewPendingBlock = sorted[0];
    if (this.pendingBlocks.length > 0 && minNewPendingBlock <= maxPendingBlock) {
      throw new Error(
        `New pending block number ${minNewPendingBlock} was added out of order. Already added block number ${maxPendingBlock}.`
      );
    }
    sorted.forEach((blockNumber) => {
      this.pendingBlocks.push(blockNumber);
    });
  }
  /**
   * Add a new completed block. If adding this block moves the checkpoint, returns the
   * new checkpoint. Otherwise, returns null.
   */
  addCompletedBlock({
    blockNumber,
    blockTimestamp
  }) {
    const pendingBlockIndex = this.pendingBlocks.findIndex(
      (pendingBlock) => pendingBlock === blockNumber
    );
    if (pendingBlockIndex === -1) {
      throw new Error(
        `Block number ${blockNumber} was not pending. Ensure to add blocks as pending before marking them as completed.`
      );
    }
    this.pendingBlocks.splice(pendingBlockIndex, 1);
    this.completedBlocks.push({ blockNumber, blockTimestamp });
    this.completedBlocks.sort((a, b) => a.blockNumber - b.blockNumber);
    if (this.pendingBlocks.length === 0) {
      this.checkpoint = this.completedBlocks[this.completedBlocks.length - 1];
      return this.checkpoint;
    }
    const safeCompletedBlocks = this.completedBlocks.filter(
      ({ blockNumber: blockNumber2 }) => blockNumber2 < this.pendingBlocks[0]
    );
    if (safeCompletedBlocks.length === 0)
      return null;
    const maximumSafeCompletedBlock = safeCompletedBlocks[safeCompletedBlocks.length - 1];
    this.completedBlocks = this.completedBlocks.filter(
      ({ blockNumber: blockNumber2 }) => blockNumber2 >= maximumSafeCompletedBlock.blockNumber
    );
    if (!this.checkpoint || maximumSafeCompletedBlock.blockNumber > this.checkpoint.blockNumber) {
      this.checkpoint = maximumSafeCompletedBlock;
      return this.checkpoint;
    }
    return null;
  }
};

// src/utils/range.ts
var range = (start4, stop) => Array.from({ length: stop - start4 }, (_, i) => start4 + i);

// src/sync-store/postgres/store.ts
import {
  sql as sql7
} from "kysely";
import {
  checksumAddress as checksumAddress2,
  hexToBigInt as hexToBigInt2,
  hexToNumber as hexToNumber2
} from "viem";

// src/sync-store/postgres/encoding.ts
import {
  hexToBigInt
} from "viem";
import {
  hexToNumber
} from "viem";
function rpcToPostgresBlock(block) {
  return {
    baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    difficulty: BigInt(block.difficulty),
    extraData: block.extraData,
    gasLimit: BigInt(block.gasLimit),
    gasUsed: BigInt(block.gasUsed),
    hash: block.hash,
    logsBloom: block.logsBloom,
    miner: toLowerCase(block.miner),
    mixHash: block.mixHash ?? null,
    nonce: block.nonce ?? null,
    number: BigInt(block.number),
    parentHash: block.parentHash,
    receiptsRoot: block.receiptsRoot,
    sha3Uncles: block.sha3Uncles ?? null,
    size: BigInt(block.size),
    stateRoot: block.stateRoot,
    timestamp: BigInt(block.timestamp),
    totalDifficulty: block.totalDifficulty ? BigInt(block.totalDifficulty) : null,
    transactionsRoot: block.transactionsRoot
  };
}
function rpcToPostgresTransaction(transaction) {
  return {
    accessList: transaction.accessList ? JSON.stringify(transaction.accessList) : void 0,
    blockHash: transaction.blockHash,
    blockNumber: BigInt(transaction.blockNumber),
    from: toLowerCase(transaction.from),
    gas: BigInt(transaction.gas),
    gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : null,
    hash: transaction.hash,
    input: transaction.input,
    maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : null,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : null,
    nonce: hexToNumber(transaction.nonce),
    r: transaction.r ?? null,
    s: transaction.s ?? null,
    to: transaction.to ? toLowerCase(transaction.to) : null,
    transactionIndex: Number(transaction.transactionIndex),
    type: transaction.type ?? "0x0",
    value: BigInt(transaction.value),
    v: transaction.v ? BigInt(transaction.v) : null
  };
}
function rpcToPostgresTransactionReceipt(transactionReceipt) {
  return {
    blockHash: transactionReceipt.blockHash,
    blockNumber: BigInt(transactionReceipt.blockNumber),
    contractAddress: transactionReceipt.contractAddress ? toLowerCase(transactionReceipt.contractAddress) : null,
    cumulativeGasUsed: BigInt(transactionReceipt.cumulativeGasUsed),
    effectiveGasPrice: BigInt(transactionReceipt.effectiveGasPrice),
    from: toLowerCase(transactionReceipt.from),
    gasUsed: BigInt(transactionReceipt.gasUsed),
    logs: JSON.stringify(transactionReceipt.logs),
    logsBloom: transactionReceipt.logsBloom,
    status: transactionReceipt.status,
    to: transactionReceipt.to ? toLowerCase(transactionReceipt.to) : null,
    transactionHash: transactionReceipt.transactionHash,
    transactionIndex: Number(transactionReceipt.transactionIndex),
    type: transactionReceipt.type
  };
}
function rpcToPostgresLog(log) {
  return {
    address: toLowerCase(log.address),
    blockHash: log.blockHash,
    blockNumber: BigInt(log.blockNumber),
    data: log.data,
    id: `${log.blockHash}-${log.logIndex}`,
    logIndex: Number(log.logIndex),
    topic0: log.topics[0] ? log.topics[0] : null,
    topic1: log.topics[1] ? log.topics[1] : null,
    topic2: log.topics[2] ? log.topics[2] : null,
    topic3: log.topics[3] ? log.topics[3] : null,
    transactionHash: log.transactionHash,
    transactionIndex: Number(log.transactionIndex)
  };
}
function rpcToPostgresTrace(trace) {
  return {
    id: `${trace.transactionHash}-${JSON.stringify(trace.traceAddress)}`,
    callType: trace.action.callType,
    from: toLowerCase(trace.action.from),
    gas: hexToBigInt(trace.action.gas),
    input: trace.action.input,
    to: toLowerCase(trace.action.to),
    value: hexToBigInt(trace.action.value),
    blockHash: trace.blockHash,
    blockNumber: hexToBigInt(trace.blockNumber),
    error: trace.error ?? null,
    gasUsed: trace.result ? hexToBigInt(trace.result.gasUsed) : null,
    output: trace.result ? trace.result.output : null,
    subtraces: trace.subtraces,
    traceAddress: JSON.stringify(trace.traceAddress),
    transactionHash: trace.transactionHash,
    transactionPosition: trace.transactionPosition,
    functionSelector: trace.action.input.slice(0, 10).toLowerCase()
  };
}

// src/sync-store/postgres/store.ts
var PostgresSyncStore = class {
  kind = "postgres";
  db;
  constructor({ db }) {
    this.db = db;
  }
  insertLogFilterInterval = async ({
    chainId,
    logFilter,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    logs: rpcLogs,
    interval
  }) => {
    return this.db.wrap({ method: "insertLogFilterInterval" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        await tx.insertInto("blocks").values({
          ...rpcToPostgresBlock(rpcBlock),
          chainId,
          checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
        }).onConflict((oc) => oc.column("hash").doNothing()).execute();
        if (rpcTransactions.length > 0) {
          const transactions = rpcTransactions.map((transaction) => ({
            ...rpcToPostgresTransaction(transaction),
            chainId
          }));
          await tx.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("hash").doNothing()).execute();
        }
        if (rpcTransactionReceipts.length > 0) {
          const transactionReceipts = rpcTransactionReceipts.map(
            (rpcTransactionReceipt) => ({
              ...rpcToPostgresTransactionReceipt(rpcTransactionReceipt),
              chainId
            })
          );
          await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict((oc) => oc.column("transactionHash").doNothing()).execute();
        }
        if (rpcLogs.length > 0) {
          const logs = rpcLogs.map((rpcLog) => ({
            ...rpcToPostgresLog(rpcLog),
            chainId,
            checkpoint: this.createLogCheckpoint(rpcLog, rpcBlock, chainId)
          }));
          await tx.insertInto("logs").values(logs).onConflict(
            (oc) => oc.column("id").doUpdateSet((eb) => ({
              checkpoint: eb.ref("excluded.checkpoint")
            }))
          ).execute();
        }
        await this._insertLogFilterInterval({
          tx,
          chainId,
          logFilters: [logFilter],
          interval
        });
      });
    });
  };
  getLogFilterIntervals = async ({
    chainId,
    logFilter
  }) => {
    return this.db.wrap({ method: "getLogFilterIntervals" }, async () => {
      const fragments = buildLogFilterFragments({ ...logFilter, chainId });
      await Promise.all(
        fragments.map(async (fragment) => {
          return await this.db.transaction().execute(async (tx) => {
            const { id: logFilterId } = await tx.insertInto("logFilters").values(fragment).onConflict((oc) => oc.column("id").doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
            const existingIntervalRows = await tx.deleteFrom("logFilterIntervals").where("logFilterId", "=", logFilterId).returningAll().execute();
            const mergedIntervals = intervalUnion(
              existingIntervalRows.map((i) => [
                Number(i.startBlock),
                Number(i.endBlock)
              ])
            );
            const mergedIntervalRows = mergedIntervals.map(
              ([startBlock, endBlock]) => ({
                logFilterId,
                startBlock: BigInt(startBlock),
                endBlock: BigInt(endBlock)
              })
            );
            if (mergedIntervalRows.length > 0) {
              await tx.insertInto("logFilterIntervals").values(mergedIntervalRows).execute();
            }
          });
        })
      );
      const intervals = await this.db.with(
        "logFilterFragments(fragmentId, fragmentAddress, fragmentTopic0, fragmentTopic1, fragmentTopic2, fragmentTopic3, fragmentIncludeTransactionReceipts)",
        () => sql7`( values ${sql7.join(
          fragments.map(
            (f) => sql7`( ${sql7.val(f.id)}, ${sql7.val(f.address)}, ${sql7.val(
              f.topic0
            )}, ${sql7.val(f.topic1)}, ${sql7.val(f.topic2)}, ${sql7.val(
              f.topic3
            )}, ${sql7.lit(f.includeTransactionReceipts)} )`
          )
        )} )`
      ).selectFrom("logFilterIntervals").innerJoin("logFilters", "logFilterId", "logFilters.id").innerJoin("logFilterFragments", (join) => {
        let baseJoin = join.on(
          (eb) => eb.or([
            eb("address", "is", null),
            eb("fragmentAddress", "=", sql7.ref("address"))
          ])
        );
        baseJoin = baseJoin.on(
          (eb) => eb(
            "fragmentIncludeTransactionReceipts",
            "<=",
            sql7.ref("includeTransactionReceipts")
          )
        );
        for (const idx_ of range(0, 4)) {
          baseJoin = baseJoin.on((eb) => {
            const idx = idx_;
            return eb.or([
              eb(`topic${idx}`, "is", null),
              eb(`fragmentTopic${idx}`, "=", sql7.ref(`topic${idx}`))
            ]);
          });
        }
        return baseJoin;
      }).select(["fragmentId", "startBlock", "endBlock"]).where("chainId", "=", chainId).execute();
      const intervalsByFragmentId = intervals.reduce(
        (acc, cur) => {
          const { fragmentId, startBlock, endBlock } = cur;
          (acc[fragmentId] ||= []).push([Number(startBlock), Number(endBlock)]);
          return acc;
        },
        {}
      );
      const intervalsForEachFragment = fragments.map(
        (f) => intervalUnion(intervalsByFragmentId[f.id] ?? [])
      );
      return intervalIntersectionMany(intervalsForEachFragment);
    });
  };
  insertFactoryChildAddressLogs = async ({
    chainId,
    logs: rpcLogs
  }) => {
    return this.db.wrap(
      { method: "insertFactoryChildAddressLogs" },
      async () => {
        if (rpcLogs.length > 0) {
          const logs = rpcLogs.map((rpcLog) => ({
            ...rpcToPostgresLog(rpcLog),
            chainId
          }));
          await this.db.insertInto("logs").values(logs).onConflict((oc) => oc.column("id").doNothing()).execute();
        }
      }
    );
  };
  async *getFactoryChildAddresses({
    chainId,
    fromBlock,
    toBlock,
    factory,
    pageSize = 500
  }) {
    const { address, eventSelector, childAddressLocation } = factory;
    const selectChildAddressExpression = buildFactoryChildAddressSelectExpression({ childAddressLocation });
    const baseQuery = this.db.selectFrom("logs").select(["id", selectChildAddressExpression.as("childAddress")]).where("chainId", "=", chainId).where("address", "=", address).where("topic0", "=", eventSelector).where("blockNumber", ">=", fromBlock).where("blockNumber", "<=", toBlock).orderBy("id", "asc").limit(pageSize);
    let cursor = void 0;
    while (true) {
      let query2 = baseQuery;
      if (cursor !== void 0)
        query2 = query2.where("id", ">", cursor);
      const batch = await this.db.wrap(
        { method: "getFactoryChildAddresses" },
        () => query2.execute()
      );
      if (batch.length > 0) {
        yield batch.map((a) => a.childAddress);
      }
      if (batch.length < pageSize)
        break;
      cursor = batch[batch.length - 1].id;
    }
  }
  insertFactoryLogFilterInterval = async ({
    chainId,
    factory,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    logs: rpcLogs,
    interval
  }) => {
    return this.db.wrap(
      { method: "insertFactoryLogFilterInterval" },
      async () => {
        await this.db.transaction().execute(async (tx) => {
          await tx.insertInto("blocks").values({
            ...rpcToPostgresBlock(rpcBlock),
            chainId,
            checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
          }).onConflict((oc) => oc.column("hash").doNothing()).execute();
          if (rpcTransactions.length > 0) {
            const transactions = rpcTransactions.map((transaction) => ({
              ...rpcToPostgresTransaction(transaction),
              chainId
            }));
            await tx.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("hash").doNothing()).execute();
          }
          if (rpcTransactionReceipts.length > 0) {
            const transactionReceipts = rpcTransactionReceipts.map(
              (rpcTransactionReceipt) => ({
                ...rpcToPostgresTransactionReceipt(rpcTransactionReceipt),
                chainId
              })
            );
            await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict((oc) => oc.column("transactionHash").doNothing()).execute();
          }
          if (rpcLogs.length > 0) {
            const logs = rpcLogs.map((rpcLog) => ({
              ...rpcToPostgresLog(rpcLog),
              chainId,
              checkpoint: this.createLogCheckpoint(rpcLog, rpcBlock, chainId)
            }));
            await tx.insertInto("logs").values(logs).onConflict(
              (oc) => oc.column("id").doUpdateSet((eb) => ({
                checkpoint: eb.ref("excluded.checkpoint")
              }))
            ).execute();
          }
          await this._insertFactoryLogFilterInterval({
            tx,
            chainId,
            factoryLogFilters: [factory],
            interval
          });
        });
      }
    );
  };
  getFactoryLogFilterIntervals = async ({
    chainId,
    factory
  }) => {
    return this.db.wrap(
      { method: "getFactoryLogFilterIntervals" },
      async () => {
        const fragments = buildFactoryLogFragments({ ...factory, chainId });
        await Promise.all(
          fragments.map(async (fragment) => {
            await this.db.transaction().execute(async (tx) => {
              const { id: factoryId } = await tx.insertInto("factoryLogFilters").values(fragment).onConflict((oc) => oc.column("id").doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
              const existingIntervals = await tx.deleteFrom("factoryLogFilterIntervals").where("factoryId", "=", factoryId).returningAll().execute();
              const mergedIntervals = intervalUnion(
                existingIntervals.map((i) => [
                  Number(i.startBlock),
                  Number(i.endBlock)
                ])
              );
              const mergedIntervalRows = mergedIntervals.map(
                ([startBlock, endBlock]) => ({
                  factoryId,
                  startBlock: BigInt(startBlock),
                  endBlock: BigInt(endBlock)
                })
              );
              if (mergedIntervalRows.length > 0) {
                await tx.insertInto("factoryLogFilterIntervals").values(mergedIntervalRows).execute();
              }
            });
          })
        );
        const intervals = await this.db.with(
          "factoryFilterFragments(fragmentId, fragmentAddress, fragmentEventSelector, fragmentChildAddressLocation, fragmentTopic0, fragmentTopic1, fragmentTopic2, fragmentTopic3, fragmentIncludeTransactionReceipts)",
          () => sql7`( values ${sql7.join(
            fragments.map(
              (f) => sql7`( ${sql7.val(f.id)}, ${sql7.val(f.address)}, ${sql7.val(
                f.eventSelector
              )}, ${sql7.val(f.childAddressLocation)}, ${sql7.val(
                f.topic0
              )}, ${sql7.val(f.topic1)}, ${sql7.val(f.topic2)}, ${sql7.val(
                f.topic3
              )}, ${sql7.lit(f.includeTransactionReceipts)} )`
            )
          )} )`
        ).selectFrom("factoryLogFilterIntervals").innerJoin("factoryLogFilters", "factoryId", "factoryLogFilters.id").innerJoin("factoryFilterFragments", (join) => {
          let baseJoin = join.on(
            (eb) => eb.and([
              eb("fragmentAddress", "=", sql7.ref("address")),
              eb("fragmentEventSelector", "=", sql7.ref("eventSelector")),
              eb(
                "fragmentChildAddressLocation",
                "=",
                sql7.ref("childAddressLocation")
              )
            ])
          );
          baseJoin = baseJoin.on(
            (eb) => eb(
              "fragmentIncludeTransactionReceipts",
              "<=",
              sql7.ref("includeTransactionReceipts")
            )
          );
          for (const idx_ of range(0, 4)) {
            baseJoin = baseJoin.on((eb) => {
              const idx = idx_;
              return eb.or([
                eb(`topic${idx}`, "is", null),
                eb(`fragmentTopic${idx}`, "=", sql7.ref(`topic${idx}`))
              ]);
            });
          }
          return baseJoin;
        }).select(["fragmentId", "startBlock", "endBlock"]).where("chainId", "=", chainId).execute();
        const intervalsByFragmentId = intervals.reduce(
          (acc, cur) => {
            const { fragmentId, startBlock, endBlock } = cur;
            (acc[fragmentId] ||= []).push([
              Number(startBlock),
              Number(endBlock)
            ]);
            return acc;
          },
          {}
        );
        const intervalsForEachFragment = fragments.map(
          (f) => intervalUnion(intervalsByFragmentId[f.id] ?? [])
        );
        return intervalIntersectionMany(intervalsForEachFragment);
      }
    );
  };
  insertBlockFilterInterval = async ({
    chainId,
    blockFilter,
    block: rpcBlock,
    interval
  }) => {
    return this.db.wrap({ method: "insertBlockFilterInterval" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        if (rpcBlock !== void 0) {
          await tx.insertInto("blocks").values({
            ...rpcToPostgresBlock(rpcBlock),
            chainId,
            checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
          }).onConflict((oc) => oc.column("hash").doNothing()).execute();
        }
        await this._insertBlockFilterInterval({
          tx,
          chainId,
          blockFilters: [blockFilter],
          interval
        });
      });
    });
  };
  getBlockFilterIntervals = async ({
    chainId,
    blockFilter
  }) => {
    return this.db.wrap({ method: "getBlockFilterIntervals" }, async () => {
      const fragment = {
        id: `${chainId}_${blockFilter.interval}_${blockFilter.offset}`,
        chainId,
        interval: blockFilter.interval,
        offset: blockFilter.offset
      };
      await this.db.transaction().execute(async (tx) => {
        const { id: blockFilterId } = await tx.insertInto("blockFilters").values(fragment).onConflict((oc) => oc.column("id").doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
        const existingIntervalRows = await tx.deleteFrom("blockFilterIntervals").where("blockFilterId", "=", blockFilterId).returningAll().execute();
        const mergedIntervals = intervalUnion(
          existingIntervalRows.map((i) => [
            Number(i.startBlock),
            Number(i.endBlock)
          ])
        );
        const mergedIntervalRows = mergedIntervals.map(
          ([startBlock, endBlock]) => ({
            blockFilterId,
            startBlock: BigInt(startBlock),
            endBlock: BigInt(endBlock)
          })
        );
        if (mergedIntervalRows.length > 0) {
          await tx.insertInto("blockFilterIntervals").values(mergedIntervalRows).execute();
        }
      });
      const intervals = await this.db.selectFrom("blockFilterIntervals").innerJoin("blockFilters", "blockFilterId", "blockFilters.id").select([
        "blockFilterIntervals.startBlock",
        "blockFilterIntervals.endBlock"
      ]).where("blockFilterId", "=", fragment.id).execute();
      return intervals.map(
        ({ startBlock, endBlock }) => [Number(startBlock), Number(endBlock)]
      );
    });
  };
  getBlock = async ({
    chainId,
    blockNumber
  }) => {
    const hasBlock = await this.db.selectFrom("blocks").select("hash").where("number", "=", BigInt(blockNumber)).where("chainId", "=", chainId).executeTakeFirst();
    return hasBlock !== void 0;
  };
  insertTraceFilterInterval = async ({
    chainId,
    traceFilter,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    traces: rpcTraces,
    interval
  }) => {
    return this.db.wrap({ method: "insertTraceFilterInterval" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        await tx.insertInto("blocks").values({
          ...rpcToPostgresBlock(rpcBlock),
          chainId,
          checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
        }).onConflict((oc) => oc.column("hash").doNothing()).execute();
        if (rpcTransactions.length > 0) {
          const transactions = rpcTransactions.map((transaction) => ({
            ...rpcToPostgresTransaction(transaction),
            chainId
          }));
          await tx.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("hash").doNothing()).execute();
        }
        if (rpcTransactionReceipts.length > 0) {
          const transactionReceipts = rpcTransactionReceipts.map(
            (rpcTransactionReceipt) => ({
              ...rpcToPostgresTransactionReceipt(rpcTransactionReceipt),
              chainId
            })
          );
          await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict((oc) => oc.column("transactionHash").doNothing()).execute();
        }
        const traceByTransactionHash = {};
        for (const trace of rpcTraces) {
          if (traceByTransactionHash[trace.transactionHash] === void 0) {
            traceByTransactionHash[trace.transactionHash] = [];
          }
          traceByTransactionHash[trace.transactionHash].push(trace);
        }
        for (const transactionHash of Object.keys(traceByTransactionHash)) {
          const traces = await tx.deleteFrom("callTraces").returningAll().where("transactionHash", "=", transactionHash).where("chainId", "=", chainId).execute();
          traces.push(
            ...traceByTransactionHash[transactionHash].map((trace) => ({
              ...rpcToPostgresTrace(trace),
              chainId
            }))
          );
          traces.sort((a, b) => {
            return a.traceAddress < b.traceAddress ? -1 : 1;
          });
          for (let i = 0; i < traces.length; i++) {
            const trace = traces[i];
            const checkpoint = encodeCheckpoint({
              blockTimestamp: hexToNumber2(rpcBlock.timestamp),
              chainId: BigInt(chainId),
              blockNumber: trace.blockNumber,
              transactionIndex: BigInt(trace.transactionPosition),
              eventType: EVENT_TYPES.callTraces,
              eventIndex: BigInt(i)
            });
            trace.checkpoint = checkpoint;
          }
          await tx.insertInto("callTraces").values(traces).onConflict((oc) => oc.column("id").doNothing()).execute();
        }
        await this._insertTraceFilterInterval({
          tx,
          chainId,
          traceFilters: [traceFilter],
          interval
        });
      });
    });
  };
  getTraceFilterIntervals = async ({
    traceFilter,
    chainId
  }) => {
    return this.db.wrap({ method: "getTraceFilterIntervals" }, async () => {
      const fragments = buildTraceFragments({ ...traceFilter, chainId });
      await Promise.all(
        fragments.map(async (fragment) => {
          return await this.db.transaction().execute(async (tx) => {
            const { id: traceFilterId } = await tx.insertInto("traceFilters").values(fragment).onConflict((oc) => oc.column("id").doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
            const existingIntervalRows = await tx.deleteFrom("traceFilterIntervals").where("traceFilterId", "=", traceFilterId).returningAll().execute();
            const mergedIntervals = intervalUnion(
              existingIntervalRows.map((i) => [
                Number(i.startBlock),
                Number(i.endBlock)
              ])
            );
            const mergedIntervalRows = mergedIntervals.map(
              ([startBlock, endBlock]) => ({
                traceFilterId,
                startBlock: BigInt(startBlock),
                endBlock: BigInt(endBlock)
              })
            );
            if (mergedIntervalRows.length > 0) {
              await tx.insertInto("traceFilterIntervals").values(mergedIntervalRows).execute();
            }
          });
        })
      );
      const intervals = await this.db.with(
        "traceFilterFragments(fragmentId, fragmentFromAddress, fragmentToAddress)",
        () => sql7`( values ${sql7.join(
          fragments.map(
            (f) => sql7`( ${sql7.val(f.id)}, ${sql7.val(f.fromAddress)}, ${sql7.val(
              f.toAddress
            )} )`
          )
        )} )`
      ).selectFrom("traceFilterIntervals").innerJoin("traceFilters", "traceFilterId", "traceFilters.id").innerJoin("traceFilterFragments", (join) => {
        return join.on(
          (eb) => eb.and([
            eb.or([
              eb("fromAddress", "is", null),
              eb("fragmentFromAddress", "=", sql7.ref("fromAddress"))
            ]),
            eb.or([
              eb("toAddress", "is", null),
              eb("fragmentToAddress", "=", sql7.ref("toAddress"))
            ])
          ])
        );
      }).select(["fragmentId", "startBlock", "endBlock"]).where("chainId", "=", chainId).execute();
      const intervalsByFragmentId = intervals.reduce(
        (acc, cur) => {
          const { fragmentId, startBlock, endBlock } = cur;
          (acc[fragmentId] ||= []).push([Number(startBlock), Number(endBlock)]);
          return acc;
        },
        {}
      );
      const intervalsForEachFragment = fragments.map(
        (f) => intervalUnion(intervalsByFragmentId[f.id] ?? [])
      );
      return intervalIntersectionMany(intervalsForEachFragment);
    });
  };
  insertFactoryTraceFilterInterval = async ({
    chainId,
    factory,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    traces: rpcTraces,
    interval
  }) => {
    return this.db.wrap(
      { method: "insertFactoryTraceFilterInterval" },
      async () => {
        await this.db.transaction().execute(async (tx) => {
          await tx.insertInto("blocks").values({
            ...rpcToPostgresBlock(rpcBlock),
            chainId,
            checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
          }).onConflict((oc) => oc.column("hash").doNothing()).execute();
          if (rpcTransactions.length > 0) {
            const transactions = rpcTransactions.map((rpcTransaction) => ({
              ...rpcToPostgresTransaction(rpcTransaction),
              chainId
            }));
            await tx.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("hash").doNothing()).execute();
          }
          if (rpcTransactionReceipts.length > 0) {
            const transactionReceipts = rpcTransactionReceipts.map(
              (rpcTransactionReceipt) => ({
                ...rpcToPostgresTransactionReceipt(rpcTransactionReceipt),
                chainId
              })
            );
            await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict((oc) => oc.column("transactionHash").doNothing()).execute();
          }
          const traceByTransactionHash = {};
          for (const trace of rpcTraces) {
            if (traceByTransactionHash[trace.transactionHash] === void 0) {
              traceByTransactionHash[trace.transactionHash] = [];
            }
            traceByTransactionHash[trace.transactionHash].push(trace);
          }
          for (const transactionHash of Object.keys(traceByTransactionHash)) {
            const traces = await tx.deleteFrom("callTraces").returningAll().where("transactionHash", "=", transactionHash).where("chainId", "=", chainId).execute();
            traces.push(
              ...traceByTransactionHash[transactionHash].map(
                (trace) => ({
                  ...rpcToPostgresTrace(trace),
                  chainId
                })
              )
            );
            traces.sort((a, b) => {
              return a.traceAddress < b.traceAddress ? -1 : 1;
            });
            for (let i = 0; i < traces.length; i++) {
              const trace = traces[i];
              const checkpoint = encodeCheckpoint({
                blockTimestamp: hexToNumber2(rpcBlock.timestamp),
                chainId: BigInt(chainId),
                blockNumber: trace.blockNumber,
                transactionIndex: BigInt(trace.transactionPosition),
                eventType: EVENT_TYPES.callTraces,
                eventIndex: BigInt(i)
              });
              trace.checkpoint = checkpoint;
            }
            await tx.insertInto("callTraces").values(traces).onConflict((oc) => oc.column("id").doNothing()).execute();
          }
          await this._insertFactoryTraceFilterInterval({
            tx,
            chainId,
            factoryTraceFilters: [factory],
            interval
          });
        });
      }
    );
  };
  getFactoryTraceFilterIntervals = async ({
    chainId,
    factory
  }) => {
    return this.db.wrap(
      { method: "getFactoryLogFilterIntervals" },
      async () => {
        const fragments = buildFactoryTraceFragments({ ...factory, chainId });
        await Promise.all(
          fragments.map(async (fragment) => {
            return await this.db.transaction().execute(async (tx) => {
              const { id: factoryId } = await tx.insertInto("factoryTraceFilters").values(fragment).onConflict((oc) => oc.column("id").doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
              const existingIntervals = await tx.deleteFrom("factoryTraceFilterIntervals").where("factoryId", "=", factoryId).returningAll().execute();
              const mergedIntervals = intervalUnion(
                existingIntervals.map((i) => [
                  Number(i.startBlock),
                  Number(i.endBlock)
                ])
              );
              const mergedIntervalRows = mergedIntervals.map(
                ([startBlock, endBlock]) => ({
                  factoryId,
                  startBlock: BigInt(startBlock),
                  endBlock: BigInt(endBlock)
                })
              );
              if (mergedIntervalRows.length > 0) {
                await tx.insertInto("factoryTraceFilterIntervals").values(mergedIntervalRows).execute();
              }
            });
          })
        );
        const intervals = await this.db.with(
          "factoryFilterFragments(fragmentId, fragmentAddress, fragmentEventSelector, fragmentChildAddressLocation, fragmentFromAddress)",
          () => sql7`( values ${sql7.join(
            fragments.map(
              (f) => sql7`( ${sql7.val(f.id)}, ${sql7.val(f.address)}, ${sql7.val(
                f.eventSelector
              )}, ${sql7.val(f.childAddressLocation)}, ${sql7.val(
                f.fromAddress
              )} )`
            )
          )} )`
        ).selectFrom("factoryTraceFilterIntervals").innerJoin(
          "factoryTraceFilters",
          "factoryId",
          "factoryTraceFilters.id"
        ).innerJoin(
          "factoryFilterFragments",
          (join) => join.on(
            (eb) => eb.and([
              eb("fragmentAddress", "=", sql7.ref("address")),
              eb("fragmentEventSelector", "=", sql7.ref("eventSelector")),
              eb(
                "fragmentChildAddressLocation",
                "=",
                sql7.ref("childAddressLocation")
              ),
              eb.or([
                eb("fromAddress", "is", null),
                eb("fragmentFromAddress", "=", sql7.ref("fromAddress"))
              ])
            ])
          )
        ).select(["fragmentId", "startBlock", "endBlock"]).where("chainId", "=", chainId).execute();
        const intervalsByFragmentId = intervals.reduce(
          (acc, cur) => {
            const { fragmentId, startBlock, endBlock } = cur;
            (acc[fragmentId] ||= []).push([
              Number(startBlock),
              Number(endBlock)
            ]);
            return acc;
          },
          {}
        );
        const intervalsForEachFragment = fragments.map(
          (f) => intervalUnion(intervalsByFragmentId[f.id] ?? [])
        );
        return intervalIntersectionMany(intervalsForEachFragment);
      }
    );
  };
  createLogCheckpoint = (rpcLog, block, chainId) => {
    if (block.number === null) {
      throw new Error("Number is missing from RPC block");
    }
    if (rpcLog.transactionIndex === null) {
      throw new Error("Transaction index is missing from RPC log");
    }
    if (rpcLog.logIndex === null) {
      throw new Error("Log index is missing from RPC log");
    }
    return encodeCheckpoint({
      blockTimestamp: Number(BigInt(block.timestamp)),
      chainId: BigInt(chainId),
      blockNumber: hexToBigInt2(block.number),
      transactionIndex: hexToBigInt2(rpcLog.transactionIndex),
      eventType: EVENT_TYPES.logs,
      eventIndex: hexToBigInt2(rpcLog.logIndex)
    });
  };
  createBlockCheckpoint = (block, chainId) => {
    if (block.number === null) {
      throw new Error("Number is missing from RPC block");
    }
    return encodeCheckpoint({
      blockTimestamp: hexToNumber2(block.timestamp),
      chainId: BigInt(chainId),
      blockNumber: hexToBigInt2(block.number),
      transactionIndex: maxCheckpoint.transactionIndex,
      eventType: EVENT_TYPES.blocks,
      eventIndex: zeroCheckpoint.eventIndex
    });
  };
  insertRealtimeBlock = async ({
    chainId,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    logs: rpcLogs,
    traces: rpcTraces
  }) => {
    return this.db.wrap({ method: "insertRealtimeBlock" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        await tx.insertInto("blocks").values({
          ...rpcToPostgresBlock(rpcBlock),
          chainId,
          checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
        }).onConflict((oc) => oc.column("hash").doNothing()).execute();
        if (rpcTransactions.length > 0) {
          const transactions = rpcTransactions.map((transaction) => ({
            ...rpcToPostgresTransaction(transaction),
            chainId
          }));
          await tx.insertInto("transactions").values(transactions).onConflict(
            (oc) => oc.column("hash").doUpdateSet((eb) => ({
              blockHash: eb.ref("excluded.blockHash"),
              blockNumber: eb.ref("excluded.blockNumber"),
              transactionIndex: eb.ref("excluded.transactionIndex")
            }))
          ).execute();
        }
        if (rpcTransactionReceipts.length > 0) {
          const transactionReceipts = rpcTransactionReceipts.map(
            (rpcTransactionReceipt) => ({
              ...rpcToPostgresTransactionReceipt(rpcTransactionReceipt),
              chainId
            })
          );
          await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict(
            (oc) => oc.column("transactionHash").doUpdateSet((eb) => ({
              blockHash: eb.ref("excluded.blockHash"),
              blockNumber: eb.ref("excluded.blockNumber"),
              contractAddress: eb.ref("excluded.contractAddress"),
              cumulativeGasUsed: eb.ref("excluded.cumulativeGasUsed"),
              effectiveGasPrice: eb.ref("excluded.effectiveGasPrice"),
              gasUsed: eb.ref("excluded.gasUsed"),
              logs: eb.ref("excluded.logs"),
              logsBloom: eb.ref("excluded.logsBloom"),
              transactionIndex: eb.ref("excluded.transactionIndex")
            }))
          ).execute();
        }
        if (rpcLogs.length > 0) {
          const logs = rpcLogs.map((rpcLog) => ({
            ...rpcToPostgresLog(rpcLog),
            chainId,
            checkpoint: this.createLogCheckpoint(rpcLog, rpcBlock, chainId)
          }));
          await tx.insertInto("logs").values(logs).onConflict(
            (oc) => oc.column("id").doUpdateSet((eb) => ({
              checkpoint: eb.ref("excluded.checkpoint")
            }))
          ).execute();
        }
        if (rpcTraces.length > 0) {
          const traces = rpcTraces.map((trace, i) => ({
            ...rpcToPostgresTrace(trace),
            chainId,
            checkpoint: encodeCheckpoint({
              blockTimestamp: hexToNumber2(rpcBlock.timestamp),
              chainId: BigInt(chainId),
              blockNumber: hexToBigInt2(trace.blockNumber),
              transactionIndex: BigInt(trace.transactionPosition),
              eventType: EVENT_TYPES.callTraces,
              eventIndex: BigInt(i)
            })
          })).sort((a, b) => {
            if (a.transactionHash < b.transactionHash)
              return -1;
            if (a.transactionHash > b.transactionHash)
              return 1;
            return a.traceAddress < b.traceAddress ? -1 : 1;
          });
          await tx.insertInto("callTraces").values(traces).onConflict((oc) => oc.column("id").doNothing()).execute();
        }
      });
    });
  };
  insertRealtimeInterval = async ({
    chainId,
    logFilters,
    factoryLogFilters,
    traceFilters,
    factoryTraceFilters,
    blockFilters,
    interval
  }) => {
    return this.db.wrap({ method: "insertRealtimeInterval" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        await this._insertLogFilterInterval({
          tx,
          chainId,
          logFilters: [
            ...logFilters,
            ...factoryLogFilters.map((f) => ({
              address: f.address,
              topics: [f.eventSelector],
              includeTransactionReceipts: f.includeTransactionReceipts
            })),
            ...factoryTraceFilters.map((f) => ({
              address: f.address,
              topics: [f.eventSelector],
              includeTransactionReceipts: f.includeTransactionReceipts
            }))
          ],
          interval
        });
        await this._insertFactoryLogFilterInterval({
          tx,
          chainId,
          factoryLogFilters,
          interval
        });
        await this._insertBlockFilterInterval({
          tx,
          chainId,
          blockFilters,
          interval
        });
        await this._insertTraceFilterInterval({
          tx,
          chainId,
          traceFilters,
          interval
        });
        await this._insertFactoryTraceFilterInterval({
          tx,
          chainId,
          factoryTraceFilters,
          interval
        });
      });
    });
  };
  deleteRealtimeData = async ({
    chainId,
    fromBlock
  }) => {
    return this.db.wrap({ method: "deleteRealtimeData" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        await tx.deleteFrom("logs").where("chainId", "=", chainId).where("blockNumber", ">", fromBlock).execute();
        await tx.deleteFrom("blocks").where("chainId", "=", chainId).where("number", ">", fromBlock).execute();
        await tx.deleteFrom("rpcRequestResults").where("chainId", "=", chainId).where("blockNumber", ">", fromBlock).execute();
        await tx.deleteFrom("callTraces").where("chainId", "=", chainId).where("blockNumber", ">", fromBlock).execute();
      });
    });
  };
  /** SYNC HELPER METHODS */
  _insertLogFilterInterval = async ({
    tx,
    chainId,
    logFilters,
    interval: { startBlock, endBlock }
  }) => {
    const logFilterFragments = logFilters.flatMap(
      (logFilter) => buildLogFilterFragments({ ...logFilter, chainId })
    );
    await Promise.all(
      logFilterFragments.map(async (logFilterFragment) => {
        const { id: logFilterId } = await tx.insertInto("logFilters").values(logFilterFragment).onConflict((oc) => oc.column("id").doUpdateSet(logFilterFragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("logFilterIntervals").values({ logFilterId, startBlock, endBlock }).execute();
      })
    );
  };
  _insertFactoryLogFilterInterval = async ({
    tx,
    chainId,
    factoryLogFilters,
    interval: { startBlock, endBlock }
  }) => {
    const factoryFragments = factoryLogFilters.flatMap(
      (factory) => buildFactoryLogFragments({ ...factory, chainId })
    );
    await Promise.all(
      factoryFragments.map(async (fragment) => {
        const { id: factoryId } = await tx.insertInto("factoryLogFilters").values(fragment).onConflict((oc) => oc.column("id").doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("factoryLogFilterIntervals").values({ factoryId, startBlock, endBlock }).execute();
      })
    );
  };
  _insertBlockFilterInterval = async ({
    tx,
    chainId,
    blockFilters,
    interval: { startBlock, endBlock }
  }) => {
    const blockFilterFragments = blockFilters.map((blockFilter) => {
      return {
        id: `${chainId}_${blockFilter.interval}_${blockFilter.offset}`,
        chainId,
        interval: blockFilter.interval,
        offset: blockFilter.offset
      };
    });
    await Promise.all(
      blockFilterFragments.map(async (blockFilterFragment) => {
        const { id: blockFilterId } = await tx.insertInto("blockFilters").values(blockFilterFragment).onConflict((oc) => oc.column("id").doUpdateSet(blockFilterFragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("blockFilterIntervals").values({ blockFilterId, startBlock, endBlock }).execute();
      })
    );
  };
  _insertTraceFilterInterval = async ({
    tx,
    chainId,
    traceFilters,
    interval: { startBlock, endBlock }
  }) => {
    const traceFilterFragments = traceFilters.flatMap(
      (traceFilter) => buildTraceFragments({ ...traceFilter, chainId })
    );
    await Promise.all(
      traceFilterFragments.map(async (traceFilterFragment) => {
        const { id: traceFilterId } = await tx.insertInto("traceFilters").values(traceFilterFragment).onConflict((oc) => oc.column("id").doUpdateSet(traceFilterFragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("traceFilterIntervals").values({ traceFilterId, startBlock, endBlock }).execute();
      })
    );
  };
  _insertFactoryTraceFilterInterval = async ({
    tx,
    chainId,
    factoryTraceFilters,
    interval: { startBlock, endBlock }
  }) => {
    const factoryFragments = factoryTraceFilters.flatMap(
      (factory) => buildFactoryTraceFragments({ ...factory, chainId })
    );
    await Promise.all(
      factoryFragments.map(async (fragment) => {
        const { id: factoryId } = await tx.insertInto("factoryTraceFilters").values(fragment).onConflict((oc) => oc.column("id").doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("factoryTraceFilterIntervals").values({
          factoryId,
          startBlock,
          endBlock
        }).execute();
      })
    );
  };
  insertRpcRequestResult = async ({
    request,
    blockNumber,
    chainId,
    result
  }) => {
    return this.db.wrap({ method: "insertRpcRequestResult" }, async () => {
      await this.db.insertInto("rpcRequestResults").values({ request, blockNumber, chainId, result }).onConflict(
        (oc) => oc.constraint("rpcRequestResultPrimaryKey").doUpdateSet({ result })
      ).execute();
    });
  };
  getRpcRequestResult = async ({
    request,
    blockNumber,
    chainId
  }) => {
    return this.db.wrap({ method: "getRpcRequestResult" }, async () => {
      const contractReadResult = await this.db.selectFrom("rpcRequestResults").selectAll().where("request", "=", request).where("blockNumber", "=", blockNumber).where("chainId", "=", chainId).executeTakeFirst();
      return contractReadResult ?? null;
    });
  };
  async *getEvents({
    sources,
    fromCheckpoint,
    toCheckpoint,
    limit
  }) {
    let cursor = encodeCheckpoint(fromCheckpoint);
    const encodedToCheckpoint = encodeCheckpoint(toCheckpoint);
    const sourcesById = sources.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});
    const logSources = sources.filter(
      (s) => sourceIsLog(s) || sourceIsFactoryLog(s)
    );
    const callTraceSources = sources.filter(
      (s) => sourceIsCallTrace(s) || sourceIsFactoryCallTrace(s)
    );
    const blockSources = sources.filter(sourceIsBlock);
    const shouldJoinLogs = logSources.length !== 0;
    const shouldJoinTransactions = logSources.length !== 0 || callTraceSources.length !== 0;
    const shouldJoinTraces = callTraceSources.length !== 0;
    const shouldJoinReceipts = logSources.some((source) => source.criteria.includeTransactionReceipts) || callTraceSources.some(
      (source) => source.criteria.includeTransactionReceipts
    );
    while (true) {
      const events = await this.db.wrap({ method: "getEvents" }, async () => {
        const requestedLogs = await this.db.with(
          "log_sources(source_id)",
          () => sql7`( values ${logSources.length === 0 ? sql7`( null )` : sql7.join(
            logSources.map(
              (source) => sql7`( ${sql7.val(source.id)} )`
            )
          )} )`
        ).with(
          "block_sources(source_id)",
          () => sql7`( values ${blockSources.length === 0 ? sql7`( null )` : sql7.join(
            blockSources.map(
              (source) => sql7`( ${sql7.val(source.id)} )`
            )
          )} )`
        ).with(
          "call_trace_sources(source_id)",
          () => sql7`( values ${callTraceSources.length === 0 ? sql7`( null )` : sql7.join(
            callTraceSources.map(
              (source) => sql7`( ${sql7.val(source.id)} )`
            )
          )} )`
        ).with(
          "log_checkpoints",
          (db) => db.selectFrom("logs").where("logs.checkpoint", ">", cursor).where("logs.checkpoint", "<=", encodedToCheckpoint).orderBy("logs.checkpoint", "asc").limit(limit).select("logs.checkpoint")
        ).with(
          "block_checkpoints",
          (db) => db.selectFrom("blocks").where("blocks.checkpoint", ">", cursor).where("blocks.checkpoint", "<=", encodedToCheckpoint).orderBy("blocks.checkpoint", "asc").limit(limit).select("blocks.checkpoint")
        ).with(
          "call_trace_checkpoints",
          (db) => db.selectFrom("callTraces").where("callTraces.checkpoint", ">", cursor).where("callTraces.checkpoint", "<=", encodedToCheckpoint).orderBy("callTraces.checkpoint", "asc").limit(limit).select("callTraces.checkpoint")
        ).with(
          "max_checkpoint",
          (db) => db.selectFrom(
            db.selectFrom("log_checkpoints").select("checkpoint").unionAll(
              db.selectFrom("block_checkpoints").select("checkpoint")
            ).unionAll(
              db.selectFrom("call_trace_checkpoints").select("checkpoint")
            ).as("all_checkpoints")
          ).select(
            sql7`COALESCE(max(checkpoint), ${encodedToCheckpoint})`.as(
              "max_checkpoint"
            )
          )
        ).with(
          "events",
          (db) => db.selectFrom("logs").innerJoin("log_sources", (join) => join.onTrue()).where((eb) => {
            const logFilterCmprs = sources.filter(sourceIsLog).map((logFilter) => {
              const exprs = this.buildLogFilterCmprs({
                eb,
                logFilter
              });
              exprs.push(eb("source_id", "=", logFilter.id));
              return eb.and(exprs);
            });
            const factoryCmprs = sources.filter(sourceIsFactoryLog).map((factory) => {
              const exprs = this.buildFactoryLogFilterCmprs({
                eb,
                factory
              });
              exprs.push(eb("source_id", "=", factory.id));
              return eb.and(exprs);
            });
            return eb.or([...logFilterCmprs, ...factoryCmprs]);
          }).select([
            "source_id",
            "checkpoint",
            "blockHash",
            "transactionHash",
            "logs.id as log_id",
            sql7`null`.as("callTrace_id")
          ]).unionAll(
            // @ts-ignore
            db.selectFrom("blocks").innerJoin("block_sources", (join) => join.onTrue()).where((eb) => {
              const exprs = [];
              for (const blockSource of blockSources) {
                exprs.push(
                  eb.and([
                    eb("chainId", "=", blockSource.chainId),
                    eb("number", ">=", BigInt(blockSource.startBlock)),
                    ...blockSource.endBlock !== void 0 ? [eb("number", "<=", BigInt(blockSource.endBlock))] : [],
                    sql7`(number - ${sql7.val(
                      blockSource.criteria.offset
                    )}) % ${sql7.val(blockSource.criteria.interval)} = 0`,
                    eb("source_id", "=", blockSource.id)
                  ])
                );
              }
              return eb.or(exprs);
            }).select([
              "block_sources.source_id",
              "checkpoint",
              "hash as blockHash",
              sql7`null`.as("transactionHash"),
              sql7`null`.as("log_id"),
              sql7`null`.as("callTrace_id")
            ])
          ).unionAll(
            // @ts-ignore
            db.selectFrom("callTraces").innerJoin("call_trace_sources", (join) => join.onTrue()).where((eb) => {
              const traceFilterCmprs = sources.filter(sourceIsCallTrace).map((callTraceSource) => {
                const exprs = this.buildTraceFilterCmprs({
                  eb,
                  callTraceSource
                });
                exprs.push(eb("source_id", "=", callTraceSource.id));
                return eb.and(exprs);
              });
              const factoryTraceFilterCmprs = sources.filter(sourceIsFactoryCallTrace).map((factory) => {
                const exprs = this.buildFactoryTraceFilterCmprs({
                  eb,
                  factory
                });
                exprs.push(eb("source_id", "=", factory.id));
                return eb.and(exprs);
              });
              return eb.or([
                ...traceFilterCmprs,
                ...factoryTraceFilterCmprs
              ]);
            }).select([
              "source_id",
              "checkpoint",
              "blockHash",
              "transactionHash",
              sql7`null`.as("log_id"),
              "callTraces.id as callTrace_id"
            ])
          )
        ).selectFrom("events").innerJoin("blocks", "blocks.hash", "events.blockHash").select([
          "events.source_id",
          "events.checkpoint",
          "blocks.baseFeePerGas as block_baseFeePerGas",
          "blocks.difficulty as block_difficulty",
          "blocks.extraData as block_extraData",
          "blocks.gasLimit as block_gasLimit",
          "blocks.gasUsed as block_gasUsed",
          "blocks.hash as block_hash",
          "blocks.logsBloom as block_logsBloom",
          "blocks.miner as block_miner",
          "blocks.mixHash as block_mixHash",
          "blocks.nonce as block_nonce",
          "blocks.number as block_number",
          "blocks.parentHash as block_parentHash",
          "blocks.receiptsRoot as block_receiptsRoot",
          "blocks.sha3Uncles as block_sha3Uncles",
          "blocks.size as block_size",
          "blocks.stateRoot as block_stateRoot",
          "blocks.timestamp as block_timestamp",
          "blocks.totalDifficulty as block_totalDifficulty",
          "blocks.transactionsRoot as block_transactionsRoot"
        ]).$if(
          shouldJoinLogs,
          (qb) => qb.leftJoin("logs", "logs.id", "events.log_id").select([
            "logs.address as log_address",
            "logs.blockHash as log_blockHash",
            "logs.blockNumber as log_blockNumber",
            "logs.chainId as log_chainId",
            "logs.data as log_data",
            "logs.id as log_id",
            "logs.logIndex as log_logIndex",
            "logs.topic0 as log_topic0",
            "logs.topic1 as log_topic1",
            "logs.topic2 as log_topic2",
            "logs.topic3 as log_topic3",
            "logs.transactionHash as log_transactionHash",
            "logs.transactionIndex as log_transactionIndex"
          ])
        ).$if(
          shouldJoinTransactions,
          (qb) => qb.leftJoin(
            "transactions",
            "transactions.hash",
            "events.transactionHash"
          ).select([
            "transactions.accessList as tx_accessList",
            "transactions.blockHash as tx_blockHash",
            "transactions.blockNumber as tx_blockNumber",
            "transactions.from as tx_from",
            "transactions.gas as tx_gas",
            "transactions.gasPrice as tx_gasPrice",
            "transactions.hash as tx_hash",
            "transactions.input as tx_input",
            "transactions.maxFeePerGas as tx_maxFeePerGas",
            "transactions.maxPriorityFeePerGas as tx_maxPriorityFeePerGas",
            "transactions.nonce as tx_nonce",
            "transactions.r as tx_r",
            "transactions.s as tx_s",
            "transactions.to as tx_to",
            "transactions.transactionIndex as tx_transactionIndex",
            "transactions.type as tx_type",
            "transactions.value as tx_value",
            "transactions.v as tx_v"
          ])
        ).$if(
          shouldJoinTraces,
          (qb) => qb.leftJoin("callTraces", "callTraces.id", "events.callTrace_id").select([
            "callTraces.id as callTrace_id",
            "callTraces.callType as callTrace_callType",
            "callTraces.from as callTrace_from",
            "callTraces.gas as callTrace_gas",
            "callTraces.input as callTrace_input",
            "callTraces.to as callTrace_to",
            "callTraces.value as callTrace_value",
            "callTraces.blockHash as callTrace_blockHash",
            "callTraces.blockNumber as callTrace_blockNumber",
            "callTraces.gasUsed as callTrace_gasUsed",
            "callTraces.output as callTrace_output",
            "callTraces.subtraces as callTrace_subtraces",
            "callTraces.traceAddress as callTrace_traceAddress",
            "callTraces.transactionHash as callTrace_transactionHash",
            "callTraces.transactionPosition as callTrace_transactionPosition",
            "callTraces.chainId as callTrace_chainId",
            "callTraces.checkpoint as callTrace_checkpoint"
          ])
        ).$if(
          shouldJoinReceipts,
          (qb) => qb.leftJoin(
            "transactionReceipts",
            "transactionReceipts.transactionHash",
            "events.transactionHash"
          ).select([
            "transactionReceipts.blockHash as txr_blockHash",
            "transactionReceipts.blockNumber as txr_blockNumber",
            "transactionReceipts.contractAddress as txr_contractAddress",
            "transactionReceipts.cumulativeGasUsed as txr_cumulativeGasUsed",
            "transactionReceipts.effectiveGasPrice as txr_effectiveGasPrice",
            "transactionReceipts.from as txr_from",
            "transactionReceipts.gasUsed as txr_gasUsed",
            "transactionReceipts.logs as txr_logs",
            "transactionReceipts.logsBloom as txr_logsBloom",
            "transactionReceipts.status as txr_status",
            "transactionReceipts.to as txr_to",
            "transactionReceipts.transactionHash as txr_transactionHash",
            "transactionReceipts.transactionIndex as txr_transactionIndex",
            "transactionReceipts.type as txr_type"
          ])
        ).where("events.checkpoint", ">", cursor).where(
          "events.checkpoint",
          "<=",
          // Get max checkpoint from all sources
          sql7`(
              select max_checkpoint
              from max_checkpoint
            )`
        ).orderBy("events.checkpoint", "asc").limit(limit + 1).execute();
        return requestedLogs.map((_row) => {
          const row = _row;
          const source = sourcesById[row.source_id];
          const shouldIncludeLog = sourceIsLog(source) || sourceIsFactoryLog(source);
          const shouldIncludeTransaction = sourceIsLog(source) || sourceIsFactoryLog(source) || sourceIsCallTrace(source) || sourceIsFactoryCallTrace(source);
          const shouldIncludeTrace = sourceIsCallTrace(source) || sourceIsFactoryCallTrace(source);
          const shouldIncludeTransactionReceipt = sourceIsLog(source) && source.criteria.includeTransactionReceipts || sourceIsFactoryLog(source) && source.criteria.includeTransactionReceipts;
          return {
            chainId: source.chainId,
            sourceId: row.source_id,
            encodedCheckpoint: row.checkpoint,
            log: shouldIncludeLog ? {
              address: checksumAddress2(row.log_address),
              blockHash: row.log_blockHash,
              blockNumber: row.log_blockNumber,
              data: row.log_data,
              id: row.log_id,
              logIndex: Number(row.log_logIndex),
              removed: false,
              topics: [
                row.log_topic0,
                row.log_topic1,
                row.log_topic2,
                row.log_topic3
              ].filter((t) => t !== null),
              transactionHash: row.log_transactionHash,
              transactionIndex: Number(row.log_transactionIndex)
            } : void 0,
            block: {
              baseFeePerGas: row.block_baseFeePerGas,
              difficulty: row.block_difficulty,
              extraData: row.block_extraData,
              gasLimit: row.block_gasLimit,
              gasUsed: row.block_gasUsed,
              hash: row.block_hash,
              logsBloom: row.block_logsBloom,
              miner: checksumAddress2(row.block_miner),
              mixHash: row.block_mixHash,
              nonce: row.block_nonce,
              number: row.block_number,
              parentHash: row.block_parentHash,
              receiptsRoot: row.block_receiptsRoot,
              sha3Uncles: row.block_sha3Uncles,
              size: row.block_size,
              stateRoot: row.block_stateRoot,
              timestamp: row.block_timestamp,
              totalDifficulty: row.block_totalDifficulty,
              transactionsRoot: row.block_transactionsRoot
            },
            transaction: shouldIncludeTransaction ? {
              blockHash: row.tx_blockHash,
              blockNumber: row.tx_blockNumber,
              from: checksumAddress2(row.tx_from),
              gas: row.tx_gas,
              hash: row.tx_hash,
              input: row.tx_input,
              nonce: Number(row.tx_nonce),
              r: row.tx_r,
              s: row.tx_s,
              to: row.tx_to ? checksumAddress2(row.tx_to) : row.tx_to,
              transactionIndex: Number(row.tx_transactionIndex),
              value: row.tx_value,
              v: row.tx_v,
              ...row.tx_type === "0x0" ? { type: "legacy", gasPrice: row.tx_gasPrice } : row.tx_type === "0x1" ? {
                type: "eip2930",
                gasPrice: row.tx_gasPrice,
                accessList: JSON.parse(row.tx_accessList)
              } : row.tx_type === "0x2" ? {
                type: "eip1559",
                maxFeePerGas: row.tx_maxFeePerGas,
                maxPriorityFeePerGas: row.tx_maxPriorityFeePerGas
              } : row.tx_type === "0x7e" ? {
                type: "deposit",
                maxFeePerGas: row.tx_maxFeePerGas ?? void 0,
                maxPriorityFeePerGas: row.tx_maxPriorityFeePerGas ?? void 0
              } : { type: row.tx_type }
            } : void 0,
            trace: shouldIncludeTrace ? {
              id: row.callTrace_id,
              from: checksumAddress2(row.callTrace_from),
              to: checksumAddress2(row.callTrace_to),
              gas: row.callTrace_gas,
              value: row.callTrace_value,
              input: row.callTrace_input,
              output: row.callTrace_output,
              gasUsed: row.callTrace_gasUsed,
              subtraces: row.callTrace_subtraces,
              traceAddress: JSON.parse(row.callTrace_traceAddress),
              blockHash: row.callTrace_blockHash,
              blockNumber: row.callTrace_blockNumber,
              transactionHash: row.callTrace_transactionHash,
              transactionIndex: row.callTrace_transactionPosition,
              callType: row.callTrace_callType
            } : void 0,
            transactionReceipt: shouldIncludeTransactionReceipt ? {
              blockHash: row.txr_blockHash,
              blockNumber: row.txr_blockNumber,
              contractAddress: row.txr_contractAddress ? checksumAddress2(row.txr_contractAddress) : null,
              cumulativeGasUsed: row.txr_cumulativeGasUsed,
              effectiveGasPrice: row.txr_effectiveGasPrice,
              from: checksumAddress2(row.txr_from),
              gasUsed: row.txr_gasUsed,
              logs: JSON.parse(row.txr_logs).map((log) => ({
                address: checksumAddress2(log.address),
                blockHash: log.blockHash,
                blockNumber: hexToBigInt2(log.blockNumber),
                data: log.data,
                logIndex: hexToNumber2(log.logIndex),
                removed: false,
                topics: [
                  log.topics[0] ?? null,
                  log.topics[1] ?? null,
                  log.topics[2] ?? null,
                  log.topics[3] ?? null
                ].filter((t) => t !== null),
                transactionHash: log.transactionHash,
                transactionIndex: hexToNumber2(log.transactionIndex)
              })),
              logsBloom: row.txr_logsBloom,
              status: row.txr_status === "0x1" ? "success" : row.txr_status === "0x0" ? "reverted" : row.txr_status,
              to: row.txr_to ? checksumAddress2(row.txr_to) : null,
              transactionHash: row.txr_transactionHash,
              transactionIndex: Number(row.txr_transactionIndex),
              type: row.txr_type === "0x0" ? "legacy" : row.txr_type === "0x1" ? "eip2930" : row.tx_type === "0x2" ? "eip1559" : row.tx_type === "0x7e" ? "deposit" : row.tx_type
            } : void 0
          };
        });
      });
      const hasNextPage = events.length === limit + 1;
      if (!hasNextPage) {
        yield events;
        break;
      } else {
        events.pop();
        cursor = events[events.length - 1].encodedCheckpoint;
        yield events;
      }
    }
  }
  async getLastEventCheckpoint({
    sources,
    fromCheckpoint,
    toCheckpoint
  }) {
    return this.db.wrap({ method: "getLastEventCheckpoint" }, async () => {
      const checkpoint = await this.db.selectFrom("logs").where((eb) => {
        const logFilterCmprs = sources.filter(sourceIsLog).map((logFilter) => {
          const exprs = this.buildLogFilterCmprs({ eb, logFilter });
          return eb.and(exprs);
        });
        const factoryCmprs = sources.filter(sourceIsFactoryLog).map((factory) => {
          const exprs = this.buildFactoryLogFilterCmprs({ eb, factory });
          return eb.and(exprs);
        });
        return eb.or([...logFilterCmprs, ...factoryCmprs]);
      }).select("checkpoint").unionAll(
        this.db.selectFrom("blocks").where((eb) => {
          const exprs = [];
          const blockFilters = sources.filter(sourceIsBlock);
          for (const blockFilter of blockFilters) {
            exprs.push(
              eb.and([
                eb("chainId", "=", blockFilter.chainId),
                eb("number", ">=", BigInt(blockFilter.startBlock)),
                ...blockFilter.endBlock !== void 0 ? [eb("number", "<=", BigInt(blockFilter.endBlock))] : [],
                sql7`(number - ${sql7.val(
                  BigInt(blockFilter.criteria.offset)
                )}) % ${sql7.val(
                  BigInt(blockFilter.criteria.interval)
                )} = 0`
              ])
            );
          }
          return eb.or(exprs);
        }).select("checkpoint")
      ).unionAll(
        this.db.selectFrom("callTraces").where((eb) => {
          const traceFilterCmprs = sources.filter(sourceIsCallTrace).map((callTraceSource) => {
            const exprs = this.buildTraceFilterCmprs({
              eb,
              callTraceSource
            });
            return eb.and(exprs);
          });
          const factoryCallTraceCmprs = sources.filter(sourceIsFactoryCallTrace).map((factory) => {
            const exprs = this.buildFactoryTraceFilterCmprs({
              eb,
              factory
            });
            return eb.and(exprs);
          });
          return eb.or([...traceFilterCmprs, ...factoryCallTraceCmprs]);
        }).select("checkpoint")
      ).where("checkpoint", ">", encodeCheckpoint(fromCheckpoint)).where("checkpoint", "<=", encodeCheckpoint(toCheckpoint)).orderBy("checkpoint", "desc").executeTakeFirst();
      return checkpoint ? checkpoint.checkpoint ? decodeCheckpoint(checkpoint.checkpoint) : void 0 : void 0;
    });
  }
  buildLogFilterCmprs = ({
    eb,
    logFilter
  }) => {
    const exprs = [];
    exprs.push(
      eb(
        "logs.chainId",
        "=",
        sql7`cast (${sql7.val(logFilter.chainId)} as numeric(16, 0))`
      )
    );
    if (logFilter.criteria.address) {
      const address = Array.isArray(logFilter.criteria.address) && logFilter.criteria.address.length === 1 ? logFilter.criteria.address[0] : logFilter.criteria.address;
      if (Array.isArray(address)) {
        exprs.push(eb.or(address.map((a) => eb("logs.address", "=", a))));
      } else {
        exprs.push(eb("logs.address", "=", address));
      }
    }
    if (logFilter.criteria.topics) {
      for (const idx_ of range(0, 4)) {
        const idx = idx_;
        const raw = logFilter.criteria.topics[idx] ?? null;
        if (raw === null)
          continue;
        const topic = Array.isArray(raw) && raw.length === 1 ? raw[0] : raw;
        if (Array.isArray(topic)) {
          exprs.push(eb.or(topic.map((a) => eb(`logs.topic${idx}`, "=", a))));
        } else {
          exprs.push(eb(`logs.topic${idx}`, "=", topic));
        }
      }
    }
    if (logFilter.startBlock !== void 0 && logFilter.startBlock !== 0)
      exprs.push(eb("logs.blockNumber", ">=", BigInt(logFilter.startBlock)));
    if (logFilter.endBlock)
      exprs.push(eb("logs.blockNumber", "<=", BigInt(logFilter.endBlock)));
    return exprs;
  };
  buildFactoryLogFilterCmprs = ({
    eb,
    factory
  }) => {
    const exprs = [];
    exprs.push(
      eb(
        "logs.chainId",
        "=",
        sql7`cast (${sql7.val(factory.chainId)} as numeric(16, 0))`
      )
    );
    const selectChildAddressExpression = buildFactoryChildAddressSelectExpression({
      childAddressLocation: factory.criteria.childAddressLocation
    });
    exprs.push(
      eb(
        "logs.address",
        "in",
        eb.selectFrom("logs").select(selectChildAddressExpression.as("childAddress")).where("chainId", "=", factory.chainId).where("address", "=", factory.criteria.address).where("topic0", "=", factory.criteria.eventSelector)
      )
    );
    if (factory.criteria.topics) {
      for (const idx_ of range(0, 4)) {
        const idx = idx_;
        const raw = factory.criteria.topics[idx] ?? null;
        if (raw === null)
          continue;
        const topic = Array.isArray(raw) && raw.length === 1 ? raw[0] : raw;
        if (Array.isArray(topic)) {
          exprs.push(eb.or(topic.map((a) => eb(`logs.topic${idx}`, "=", a))));
        } else {
          exprs.push(eb(`logs.topic${idx}`, "=", topic));
        }
      }
    }
    if (factory.startBlock !== void 0 && factory.startBlock !== 0)
      exprs.push(eb("logs.blockNumber", ">=", BigInt(factory.startBlock)));
    if (factory.endBlock)
      exprs.push(eb("logs.blockNumber", "<=", BigInt(factory.endBlock)));
    return exprs;
  };
  buildTraceFilterCmprs = ({
    eb,
    callTraceSource
  }) => {
    const exprs = [];
    exprs.push(
      eb(
        "callTraces.chainId",
        "=",
        sql7`cast (${sql7.val(callTraceSource.chainId)} as numeric(16, 0))`
      )
    );
    if (callTraceSource.criteria.fromAddress) {
      const fromAddress = Array.isArray(callTraceSource.criteria.fromAddress) && callTraceSource.criteria.fromAddress.length === 1 ? callTraceSource.criteria.fromAddress[0] : callTraceSource.criteria.fromAddress;
      if (Array.isArray(fromAddress)) {
        exprs.push(
          eb.or(fromAddress.map((a) => eb("callTraces.from", "=", a)))
        );
      } else {
        exprs.push(eb("callTraces.from", "=", fromAddress));
      }
    }
    if (callTraceSource.criteria.toAddress) {
      const toAddress = Array.isArray(callTraceSource.criteria.toAddress) && callTraceSource.criteria.toAddress.length === 1 ? callTraceSource.criteria.toAddress[0] : callTraceSource.criteria.toAddress;
      if (Array.isArray(toAddress)) {
        exprs.push(eb.or(toAddress.map((a) => eb("callTraces.to", "=", a))));
      } else {
        exprs.push(eb("callTraces.to", "=", toAddress));
      }
    }
    exprs.push(
      eb.or(
        callTraceSource.criteria.functionSelectors.map(
          (fs) => eb("callTraces.functionSelector", "=", fs)
        )
      )
    );
    exprs.push(
      sql7`${sql7.ref("callTraces.error")} IS NULL`
    );
    if (callTraceSource.startBlock !== void 0 && callTraceSource.startBlock !== 0)
      exprs.push(
        eb("callTraces.blockNumber", ">=", BigInt(callTraceSource.startBlock))
      );
    if (callTraceSource.endBlock)
      exprs.push(
        eb("callTraces.blockNumber", "<=", BigInt(callTraceSource.endBlock))
      );
    return exprs;
  };
  buildFactoryTraceFilterCmprs = ({
    eb,
    factory
  }) => {
    const exprs = [];
    exprs.push(
      eb(
        "callTraces.chainId",
        "=",
        sql7`cast (${sql7.val(factory.chainId)} as numeric(16, 0))`
      )
    );
    const selectChildAddressExpression = buildFactoryChildAddressSelectExpression({
      childAddressLocation: factory.criteria.childAddressLocation
    });
    exprs.push(
      eb(
        "callTraces.to",
        "in",
        eb.selectFrom("logs").select(selectChildAddressExpression.as("childAddress")).where("chainId", "=", factory.chainId).where("address", "=", factory.criteria.address).where("topic0", "=", factory.criteria.eventSelector)
      )
    );
    if (factory.criteria.fromAddress) {
      const fromAddress = Array.isArray(factory.criteria.fromAddress) && factory.criteria.fromAddress.length === 1 ? factory.criteria.fromAddress[0] : factory.criteria.fromAddress;
      if (Array.isArray(fromAddress)) {
        exprs.push(
          eb.or(fromAddress.map((a) => eb("callTraces.from", "=", a)))
        );
      } else {
        exprs.push(eb("callTraces.from", "=", fromAddress));
      }
    }
    exprs.push(
      eb.or(
        factory.criteria.functionSelectors.map(
          (fs) => eb("callTraces.functionSelector", "=", fs)
        )
      )
    );
    exprs.push(
      sql7`${sql7.ref("callTraces.error")} IS NULL`
    );
    if (factory.startBlock !== void 0 && factory.startBlock !== 0)
      exprs.push(
        eb("callTraces.blockNumber", ">=", BigInt(factory.startBlock))
      );
    if (factory.endBlock)
      exprs.push(eb("callTraces.blockNumber", "<=", BigInt(factory.endBlock)));
    return exprs;
  };
};
function buildFactoryChildAddressSelectExpression({
  childAddressLocation
}) {
  if (childAddressLocation.startsWith("offset")) {
    const childAddressOffset = Number(childAddressLocation.substring(6));
    const start4 = 2 + 12 * 2 + childAddressOffset * 2 + 1;
    const length = 20 * 2;
    return sql7`'0x' || substring(data from ${start4}::int for ${length}::int)`;
  } else {
    const start4 = 2 + 12 * 2 + 1;
    const length = 20 * 2;
    return sql7`'0x' || substring(${sql7.ref(
      childAddressLocation
    )} from ${start4}::integer for ${length}::integer)`;
  }
}

// src/sync-store/sqlite/store.ts
import {
  sql as sql8
} from "kysely";
import {
  checksumAddress as checksumAddress3,
  hexToBigInt as hexToBigInt3,
  hexToNumber as hexToNumber4
} from "viem";

// src/sync-store/sqlite/encoding.ts
import {
  hexToNumber as hexToNumber3
} from "viem";
function rpcToSqliteBlock(block) {
  return {
    baseFeePerGas: block.baseFeePerGas ? encodeAsText(block.baseFeePerGas) : null,
    difficulty: encodeAsText(block.difficulty),
    extraData: block.extraData,
    gasLimit: encodeAsText(block.gasLimit),
    gasUsed: encodeAsText(block.gasUsed),
    hash: block.hash,
    logsBloom: block.logsBloom,
    miner: toLowerCase(block.miner),
    mixHash: block.mixHash ?? null,
    nonce: block.nonce ?? null,
    number: encodeAsText(block.number),
    parentHash: block.parentHash,
    receiptsRoot: block.receiptsRoot,
    sha3Uncles: block.sha3Uncles ?? null,
    size: encodeAsText(block.size),
    stateRoot: block.stateRoot,
    timestamp: encodeAsText(block.timestamp),
    totalDifficulty: block.totalDifficulty ? encodeAsText(block.totalDifficulty) : null,
    transactionsRoot: block.transactionsRoot
  };
}
function rpcToSqliteTransaction(transaction) {
  return {
    accessList: transaction.accessList ? JSON.stringify(transaction.accessList) : void 0,
    blockHash: transaction.blockHash,
    blockNumber: encodeAsText(transaction.blockNumber),
    from: toLowerCase(transaction.from),
    gas: encodeAsText(transaction.gas),
    gasPrice: transaction.gasPrice ? encodeAsText(transaction.gasPrice) : null,
    hash: transaction.hash,
    input: transaction.input,
    maxFeePerGas: transaction.maxFeePerGas ? encodeAsText(transaction.maxFeePerGas) : null,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? encodeAsText(transaction.maxPriorityFeePerGas) : null,
    nonce: hexToNumber3(transaction.nonce),
    r: transaction.r ?? null,
    s: transaction.s ?? null,
    to: transaction.to ? toLowerCase(transaction.to) : null,
    transactionIndex: Number(transaction.transactionIndex),
    type: transaction.type ?? "0x0",
    value: encodeAsText(transaction.value),
    v: transaction.v ? encodeAsText(transaction.v) : null
  };
}
function rpcToSqliteTransactionReceipt(transactionReceipt) {
  return {
    blockHash: transactionReceipt.blockHash,
    blockNumber: encodeAsText(transactionReceipt.blockNumber),
    contractAddress: transactionReceipt.contractAddress ? toLowerCase(transactionReceipt.contractAddress) : null,
    cumulativeGasUsed: encodeAsText(transactionReceipt.cumulativeGasUsed),
    effectiveGasPrice: encodeAsText(transactionReceipt.effectiveGasPrice),
    from: toLowerCase(transactionReceipt.from),
    gasUsed: encodeAsText(transactionReceipt.gasUsed),
    logs: JSON.stringify(transactionReceipt.logs),
    logsBloom: transactionReceipt.logsBloom,
    status: transactionReceipt.status,
    to: transactionReceipt.to ? toLowerCase(transactionReceipt.to) : null,
    transactionHash: transactionReceipt.transactionHash,
    transactionIndex: Number(transactionReceipt.transactionIndex),
    type: transactionReceipt.type
  };
}
function rpcToSqliteLog(log) {
  return {
    address: toLowerCase(log.address),
    blockHash: log.blockHash,
    blockNumber: encodeAsText(log.blockNumber),
    data: log.data,
    id: `${log.blockHash}-${log.logIndex}`,
    logIndex: Number(log.logIndex),
    topic0: log.topics[0] ? log.topics[0] : null,
    topic1: log.topics[1] ? log.topics[1] : null,
    topic2: log.topics[2] ? log.topics[2] : null,
    topic3: log.topics[3] ? log.topics[3] : null,
    transactionHash: log.transactionHash,
    transactionIndex: Number(log.transactionIndex)
  };
}
function rpcToSqliteTrace(trace) {
  return {
    id: `${trace.transactionHash}-${JSON.stringify(trace.traceAddress)}`,
    callType: trace.action.callType,
    from: toLowerCase(trace.action.from),
    gas: encodeAsText(trace.action.gas),
    input: trace.action.input,
    to: toLowerCase(trace.action.to),
    value: encodeAsText(trace.action.value),
    blockHash: trace.blockHash,
    blockNumber: encodeAsText(trace.blockNumber),
    error: trace.error ?? null,
    gasUsed: trace.result ? encodeAsText(trace.result.gasUsed) : null,
    output: trace.result ? trace.result.output : null,
    subtraces: trace.subtraces,
    traceAddress: JSON.stringify(trace.traceAddress),
    transactionHash: trace.transactionHash,
    transactionPosition: trace.transactionPosition,
    functionSelector: trace.action.input.slice(0, 10).toLowerCase()
  };
}

// src/sync-store/sqlite/store.ts
var SqliteSyncStore = class {
  kind = "sqlite";
  db;
  constructor({ db }) {
    this.db = db;
  }
  insertLogFilterInterval = async ({
    chainId,
    logFilter,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    logs: rpcLogs,
    interval
  }) => {
    return this.db.wrap({ method: "insertLogFilterInterval" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        await tx.insertInto("blocks").values({
          ...rpcToSqliteBlock(rpcBlock),
          chainId,
          checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
        }).onConflict((oc) => oc.column("hash").doNothing()).execute();
        if (rpcTransactions.length > 0) {
          const transactions = rpcTransactions.map((rpcTransaction) => ({
            ...rpcToSqliteTransaction(rpcTransaction),
            chainId
          }));
          await tx.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("hash").doNothing()).execute();
        }
        if (rpcTransactionReceipts.length > 0) {
          const transactionReceipts = rpcTransactionReceipts.map(
            (rpcTransactionReceipt) => ({
              ...rpcToSqliteTransactionReceipt(rpcTransactionReceipt),
              chainId
            })
          );
          await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict((oc) => oc.column("transactionHash").doNothing()).execute();
        }
        if (rpcLogs.length > 0) {
          const logs = rpcLogs.map((rpcLog) => ({
            ...rpcToSqliteLog(rpcLog),
            chainId,
            checkpoint: this.createLogCheckpoint(rpcLog, rpcBlock, chainId)
          }));
          await tx.insertInto("logs").values(logs).onConflict(
            (oc) => oc.column("id").doUpdateSet((eb) => ({
              checkpoint: eb.ref("excluded.checkpoint")
            }))
          ).execute();
        }
        await this._insertLogFilterInterval({
          tx,
          chainId,
          logFilters: [logFilter],
          interval
        });
      });
    });
  };
  getLogFilterIntervals = async ({
    chainId,
    logFilter
  }) => {
    return this.db.wrap({ method: "getLogFilterIntervals" }, async () => {
      const fragments = buildLogFilterFragments({ ...logFilter, chainId });
      await Promise.all(
        fragments.map(async (fragment) => {
          return await this.db.transaction().execute(async (tx) => {
            const { id: logFilterId } = await tx.insertInto("logFilters").values(fragment).onConflict((oc) => oc.doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
            const existingIntervalRows = await tx.deleteFrom("logFilterIntervals").where("logFilterId", "=", logFilterId).returningAll().execute();
            const mergedIntervals = intervalUnion(
              existingIntervalRows.map((i) => [
                Number(decodeToBigInt(i.startBlock)),
                Number(decodeToBigInt(i.endBlock))
              ])
            );
            const mergedIntervalRows = mergedIntervals.map(
              ([startBlock, endBlock]) => ({
                logFilterId,
                startBlock: encodeAsText(startBlock),
                endBlock: encodeAsText(endBlock)
              })
            );
            if (mergedIntervalRows.length > 0) {
              await tx.insertInto("logFilterIntervals").values(mergedIntervalRows).execute();
            }
          });
        })
      );
      const intervals = await this.db.with(
        "logFilterFragments(fragmentId, fragmentAddress, fragmentTopic0, fragmentTopic1, fragmentTopic2, fragmentTopic3, fragmentIncludeTransactionReceipts)",
        () => sql8`( values ${sql8.join(
          fragments.map(
            (f) => sql8`( ${sql8.val(f.id)}, ${sql8.val(f.address)}, ${sql8.val(
              f.topic0
            )}, ${sql8.val(f.topic1)}, ${sql8.val(f.topic2)}, ${sql8.val(
              f.topic3
            )}, ${sql8.lit(f.includeTransactionReceipts)} )`
          )
        )} )`
      ).selectFrom("logFilterIntervals").innerJoin("logFilters", "logFilterId", "logFilters.id").innerJoin("logFilterFragments", (join) => {
        let baseJoin = join.on(
          (eb) => eb.or([
            eb("address", "is", null),
            eb("fragmentAddress", "=", sql8.ref("address"))
          ])
        );
        baseJoin = baseJoin.on(
          (eb) => eb(
            "fragmentIncludeTransactionReceipts",
            "<=",
            sql8.ref("includeTransactionReceipts")
          )
        );
        for (const idx_ of range(0, 4)) {
          baseJoin = baseJoin.on((eb) => {
            const idx = idx_;
            return eb.or([
              eb(`topic${idx}`, "is", null),
              eb(`fragmentTopic${idx}`, "=", sql8.ref(`topic${idx}`))
            ]);
          });
        }
        return baseJoin;
      }).select(["fragmentId", "startBlock", "endBlock"]).where("chainId", "=", chainId).execute();
      const intervalsByFragmentId = intervals.reduce(
        (acc, cur) => {
          const { fragmentId, startBlock, endBlock } = cur;
          (acc[fragmentId] ||= []).push([
            Number(decodeToBigInt(startBlock)),
            Number(decodeToBigInt(endBlock))
          ]);
          return acc;
        },
        {}
      );
      const intervalsForEachFragment = fragments.map(
        (f) => intervalUnion(intervalsByFragmentId[f.id] ?? [])
      );
      return intervalIntersectionMany(intervalsForEachFragment);
    });
  };
  insertFactoryChildAddressLogs = async ({
    chainId,
    logs: rpcLogs
  }) => {
    return this.db.wrap(
      { method: "insertFactoryChildAddressLogs" },
      async () => {
        if (rpcLogs.length > 0) {
          const logs = rpcLogs.map((rpcLog) => ({
            ...rpcToSqliteLog(rpcLog),
            chainId
          }));
          await this.db.insertInto("logs").values(logs).onConflict((oc) => oc.column("id").doNothing()).execute();
        }
      }
    );
  };
  async *getFactoryChildAddresses({
    chainId,
    fromBlock,
    toBlock,
    factory,
    pageSize = 500
  }) {
    const { address, eventSelector, childAddressLocation } = factory;
    const selectChildAddressExpression = buildFactoryChildAddressSelectExpression2({ childAddressLocation });
    const baseQuery = this.db.selectFrom("logs").select(["id", selectChildAddressExpression.as("childAddress")]).where("chainId", "=", chainId).where("address", "=", address).where("topic0", "=", eventSelector).where("blockNumber", ">=", encodeAsText(fromBlock)).where("blockNumber", "<=", encodeAsText(toBlock)).orderBy("id", "asc").limit(pageSize);
    let cursor = void 0;
    while (true) {
      let query2 = baseQuery;
      if (cursor !== void 0)
        query2 = query2.where("id", ">", cursor);
      const batch = await this.db.wrap(
        { method: "getFactoryChildAddresses" },
        () => query2.execute()
      );
      if (batch.length > 0) {
        yield batch.map((a) => a.childAddress);
      }
      if (batch.length < pageSize)
        break;
      cursor = batch[batch.length - 1].id;
    }
  }
  insertFactoryLogFilterInterval = async ({
    chainId,
    factory,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    logs: rpcLogs,
    interval
  }) => {
    return this.db.wrap(
      { method: "insertFactoryLogFilterInterval" },
      async () => {
        await this.db.transaction().execute(async (tx) => {
          await tx.insertInto("blocks").values({
            ...rpcToSqliteBlock(rpcBlock),
            chainId,
            checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
          }).onConflict((oc) => oc.column("hash").doNothing()).execute();
          if (rpcTransactions.length > 0) {
            const transactions = rpcTransactions.map((rpcTransaction) => ({
              ...rpcToSqliteTransaction(rpcTransaction),
              chainId
            }));
            await tx.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("hash").doNothing()).execute();
          }
          if (rpcTransactionReceipts.length > 0) {
            const transactionReceipts = rpcTransactionReceipts.map(
              (rpcTransactionReceipt) => ({
                ...rpcToSqliteTransactionReceipt(rpcTransactionReceipt),
                chainId
              })
            );
            await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict((oc) => oc.column("transactionHash").doNothing()).execute();
          }
          if (rpcLogs.length > 0) {
            const logs = rpcLogs.map((rpcLog) => ({
              ...rpcToSqliteLog(rpcLog),
              chainId,
              checkpoint: this.createLogCheckpoint(rpcLog, rpcBlock, chainId)
            }));
            await tx.insertInto("logs").values(logs).onConflict(
              (oc) => oc.column("id").doUpdateSet((eb) => ({
                checkpoint: eb.ref("excluded.checkpoint")
              }))
            ).execute();
          }
          await this._insertFactoryLogFilterInterval({
            tx,
            chainId,
            factoryLogFilters: [factory],
            interval
          });
        });
      }
    );
  };
  getFactoryLogFilterIntervals = async ({
    chainId,
    factory
  }) => {
    return this.db.wrap(
      { method: "getFactoryLogFilterIntervals" },
      async () => {
        const fragments = buildFactoryLogFragments({ ...factory, chainId });
        await Promise.all(
          fragments.map(async (fragment) => {
            return await this.db.transaction().execute(async (tx) => {
              const { id: factoryId } = await tx.insertInto("factoryLogFilters").values(fragment).onConflict((oc) => oc.doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
              const existingIntervals = await tx.deleteFrom("factoryLogFilterIntervals").where("factoryId", "=", factoryId).returningAll().execute();
              const mergedIntervals = intervalUnion(
                existingIntervals.map((i) => [
                  Number(decodeToBigInt(i.startBlock)),
                  Number(decodeToBigInt(i.endBlock))
                ])
              );
              const mergedIntervalRows = mergedIntervals.map(
                ([startBlock, endBlock]) => ({
                  factoryId,
                  startBlock: encodeAsText(startBlock),
                  endBlock: encodeAsText(endBlock)
                })
              );
              if (mergedIntervalRows.length > 0) {
                await tx.insertInto("factoryLogFilterIntervals").values(mergedIntervalRows).execute();
              }
            });
          })
        );
        const intervals = await this.db.with(
          "factoryFilterFragments(fragmentId, fragmentAddress, fragmentEventSelector, fragmentChildAddressLocation, fragmentTopic0, fragmentTopic1, fragmentTopic2, fragmentTopic3, fragmentIncludeTransactionReceipts)",
          () => sql8`( values ${sql8.join(
            fragments.map(
              (f) => sql8`( ${sql8.val(f.id)}, ${sql8.val(f.address)}, ${sql8.val(
                f.eventSelector
              )}, ${sql8.val(f.childAddressLocation)}, ${sql8.val(
                f.topic0
              )}, ${sql8.val(f.topic1)}, ${sql8.val(f.topic2)}, ${sql8.val(
                f.topic3
              )}, ${sql8.lit(f.includeTransactionReceipts)} )`
            )
          )} )`
        ).selectFrom("factoryLogFilterIntervals").innerJoin("factoryLogFilters", "factoryId", "factoryLogFilters.id").innerJoin("factoryFilterFragments", (join) => {
          let baseJoin = join.on(
            (eb) => eb.and([
              eb("fragmentAddress", "=", sql8.ref("address")),
              eb("fragmentEventSelector", "=", sql8.ref("eventSelector")),
              eb(
                "fragmentChildAddressLocation",
                "=",
                sql8.ref("childAddressLocation")
              )
            ])
          );
          baseJoin = baseJoin.on(
            (eb) => eb(
              "fragmentIncludeTransactionReceipts",
              "<=",
              sql8.ref("includeTransactionReceipts")
            )
          );
          for (const idx_ of range(0, 4)) {
            baseJoin = baseJoin.on((eb) => {
              const idx = idx_;
              return eb.or([
                eb(`topic${idx}`, "is", null),
                eb(`fragmentTopic${idx}`, "=", sql8.ref(`topic${idx}`))
              ]);
            });
          }
          return baseJoin;
        }).select(["fragmentId", "startBlock", "endBlock"]).where("chainId", "=", chainId).execute();
        const intervalsByFragmentId = intervals.reduce(
          (acc, cur) => {
            const { fragmentId, startBlock, endBlock } = cur;
            (acc[fragmentId] ||= []).push([
              Number(startBlock),
              Number(endBlock)
            ]);
            return acc;
          },
          {}
        );
        const intervalsForEachFragment = fragments.map(
          (f) => intervalUnion(intervalsByFragmentId[f.id] ?? [])
        );
        return intervalIntersectionMany(intervalsForEachFragment);
      }
    );
  };
  insertBlockFilterInterval = async ({
    chainId,
    blockFilter,
    block: rpcBlock,
    interval
  }) => {
    return this.db.wrap({ method: "insertBlockFilterInterval" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        if (rpcBlock !== void 0) {
          await tx.insertInto("blocks").values({
            ...rpcToSqliteBlock(rpcBlock),
            chainId,
            checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
          }).onConflict((oc) => oc.column("hash").doNothing()).execute();
        }
        await this._insertBlockFilterInterval({
          tx,
          chainId,
          blockFilters: [blockFilter],
          interval
        });
      });
    });
  };
  getBlockFilterIntervals = async ({
    chainId,
    blockFilter
  }) => {
    return this.db.wrap({ method: "getBlockFilterIntervals" }, async () => {
      const fragment = {
        id: `${chainId}_${blockFilter.interval}_${blockFilter.offset}`,
        chainId,
        interval: blockFilter.interval,
        offset: blockFilter.offset
      };
      await this.db.transaction().execute(async (tx) => {
        const { id: blockFilterId } = await tx.insertInto("blockFilters").values(fragment).onConflict((oc) => oc.doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
        const existingIntervalRows = await tx.deleteFrom("blockFilterIntervals").where("blockFilterId", "=", blockFilterId).returningAll().execute();
        const mergedIntervals = intervalUnion(
          existingIntervalRows.map((i) => [
            Number(decodeToBigInt(i.startBlock)),
            Number(decodeToBigInt(i.endBlock))
          ])
        );
        const mergedIntervalRows = mergedIntervals.map(
          ([startBlock, endBlock]) => ({
            blockFilterId,
            startBlock: encodeAsText(startBlock),
            endBlock: encodeAsText(endBlock)
          })
        );
        if (mergedIntervalRows.length > 0) {
          await tx.insertInto("blockFilterIntervals").values(mergedIntervalRows).execute();
        }
      });
      const intervals = await this.db.selectFrom("blockFilterIntervals").innerJoin("blockFilters", "blockFilterId", "blockFilters.id").select([
        "blockFilterIntervals.startBlock",
        "blockFilterIntervals.endBlock"
      ]).where("blockFilterId", "=", fragment.id).execute();
      return intervals.map(
        ({ startBlock, endBlock }) => [Number(startBlock), Number(endBlock)]
      );
    });
  };
  getBlock = async ({
    chainId,
    blockNumber
  }) => {
    const hasBlock = await this.db.selectFrom("blocks").select("hash").where("number", "=", encodeAsText(blockNumber)).where("chainId", "=", chainId).executeTakeFirst();
    return hasBlock !== void 0;
  };
  insertTraceFilterInterval = async ({
    chainId,
    traceFilter,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    traces: rpcTraces,
    interval
  }) => {
    return this.db.wrap({ method: "insertTraceFilterInterval" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        await tx.insertInto("blocks").values({
          ...rpcToSqliteBlock(rpcBlock),
          chainId,
          checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
        }).onConflict((oc) => oc.column("hash").doNothing()).execute();
        if (rpcTransactions.length > 0) {
          const transactions = rpcTransactions.map((transaction) => ({
            ...rpcToSqliteTransaction(transaction),
            chainId
          }));
          await tx.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("hash").doNothing()).execute();
        }
        if (rpcTransactionReceipts.length > 0) {
          const transactionReceipts = rpcTransactionReceipts.map(
            (rpcTransactionReceipt) => ({
              ...rpcToSqliteTransactionReceipt(rpcTransactionReceipt),
              chainId
            })
          );
          await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict((oc) => oc.column("transactionHash").doNothing()).execute();
        }
        const traceByTransactionHash = {};
        for (const trace of rpcTraces) {
          if (traceByTransactionHash[trace.transactionHash] === void 0) {
            traceByTransactionHash[trace.transactionHash] = [];
          }
          traceByTransactionHash[trace.transactionHash].push(trace);
        }
        for (const transactionHash of Object.keys(traceByTransactionHash)) {
          const traces = await tx.deleteFrom("callTraces").returningAll().where("transactionHash", "=", transactionHash).where("chainId", "=", chainId).execute();
          traces.push(
            ...traceByTransactionHash[transactionHash].map((trace) => ({
              ...rpcToSqliteTrace(trace),
              chainId
            }))
          );
          traces.sort((a, b) => {
            return a.traceAddress < b.traceAddress ? -1 : 1;
          });
          for (let i = 0; i < traces.length; i++) {
            const trace = traces[i];
            const checkpoint = encodeCheckpoint({
              blockTimestamp: hexToNumber4(rpcBlock.timestamp),
              chainId: BigInt(chainId),
              blockNumber: decodeToBigInt(trace.blockNumber),
              transactionIndex: BigInt(trace.transactionPosition),
              eventType: EVENT_TYPES.callTraces,
              eventIndex: BigInt(i)
            });
            trace.checkpoint = checkpoint;
          }
          await tx.insertInto("callTraces").values(traces).onConflict((oc) => oc.doNothing()).execute();
        }
        await this._insertTraceFilterInterval({
          tx,
          chainId,
          traceFilters: [traceFilter],
          interval
        });
      });
    });
  };
  getTraceFilterIntervals = async ({
    traceFilter,
    chainId
  }) => {
    return this.db.wrap({ method: "getTraceFilterIntervals" }, async () => {
      const fragments = buildTraceFragments({ ...traceFilter, chainId });
      await Promise.all(
        fragments.map(async (fragment) => {
          return await this.db.transaction().execute(async (tx) => {
            const { id: traceFilterId } = await tx.insertInto("traceFilters").values(fragment).onConflict((oc) => oc.column("id").doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
            const existingIntervalRows = await tx.deleteFrom("traceFilterIntervals").where("traceFilterId", "=", traceFilterId).returningAll().execute();
            const mergedIntervals = intervalUnion(
              existingIntervalRows.map((i) => [
                Number(decodeToBigInt(i.startBlock)),
                Number(decodeToBigInt(i.endBlock))
              ])
            );
            const mergedIntervalRows = mergedIntervals.map(
              ([startBlock, endBlock]) => ({
                traceFilterId,
                startBlock: encodeAsText(startBlock),
                endBlock: encodeAsText(endBlock)
              })
            );
            if (mergedIntervalRows.length > 0) {
              await tx.insertInto("traceFilterIntervals").values(mergedIntervalRows).execute();
            }
          });
        })
      );
      const intervals = await this.db.with(
        "traceFilterFragments(fragmentId, fragmentFromAddress, fragmentToAddress)",
        () => sql8`( values ${sql8.join(
          fragments.map(
            (f) => sql8`( ${sql8.val(f.id)}, ${sql8.val(f.fromAddress)}, ${sql8.val(
              f.toAddress
            )} )`
          )
        )} )`
      ).selectFrom("traceFilterIntervals").innerJoin("traceFilters", "traceFilterId", "traceFilters.id").innerJoin("traceFilterFragments", (join) => {
        return join.on(
          (eb) => eb.and([
            eb.or([
              eb("fromAddress", "is", null),
              eb("fragmentFromAddress", "=", sql8.ref("fromAddress"))
            ]),
            eb.or([
              eb("toAddress", "is", null),
              eb("fragmentToAddress", "=", sql8.ref("toAddress"))
            ])
          ])
        );
      }).select(["fragmentId", "startBlock", "endBlock"]).where("chainId", "=", chainId).execute();
      const intervalsByFragmentId = intervals.reduce(
        (acc, cur) => {
          const { fragmentId, startBlock, endBlock } = cur;
          (acc[fragmentId] ||= []).push([Number(startBlock), Number(endBlock)]);
          return acc;
        },
        {}
      );
      const intervalsForEachFragment = fragments.map(
        (f) => intervalUnion(intervalsByFragmentId[f.id] ?? [])
      );
      return intervalIntersectionMany(intervalsForEachFragment);
    });
  };
  insertFactoryTraceFilterInterval = async ({
    chainId,
    factory,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    traces: rpcTraces,
    interval
  }) => {
    return this.db.wrap(
      { method: "insertFactoryTraceFilterInterval" },
      async () => {
        await this.db.transaction().execute(async (tx) => {
          await tx.insertInto("blocks").values({
            ...rpcToSqliteBlock(rpcBlock),
            chainId,
            checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
          }).onConflict((oc) => oc.column("hash").doNothing()).execute();
          if (rpcTransactions.length > 0) {
            const transactions = rpcTransactions.map((rpcTransaction) => ({
              ...rpcToSqliteTransaction(rpcTransaction),
              chainId
            }));
            await tx.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("hash").doNothing()).execute();
          }
          if (rpcTransactionReceipts.length > 0) {
            const transactionReceipts = rpcTransactionReceipts.map(
              (rpcTransactionReceipt) => ({
                ...rpcToSqliteTransactionReceipt(rpcTransactionReceipt),
                chainId
              })
            );
            await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict((oc) => oc.column("transactionHash").doNothing()).execute();
          }
          const traceByTransactionHash = {};
          for (const trace of rpcTraces) {
            if (traceByTransactionHash[trace.transactionHash] === void 0) {
              traceByTransactionHash[trace.transactionHash] = [];
            }
            traceByTransactionHash[trace.transactionHash].push(trace);
          }
          for (const transactionHash of Object.keys(traceByTransactionHash)) {
            const traces = await tx.deleteFrom("callTraces").returningAll().where("transactionHash", "=", transactionHash).where("chainId", "=", chainId).execute();
            traces.push(
              ...traceByTransactionHash[transactionHash].map(
                (trace) => ({
                  ...rpcToSqliteTrace(trace),
                  chainId
                })
              )
            );
            traces.sort((a, b) => {
              return a.traceAddress < b.traceAddress ? -1 : 1;
            });
            for (let i = 0; i < traces.length; i++) {
              const trace = traces[i];
              const checkpoint = encodeCheckpoint({
                blockTimestamp: hexToNumber4(rpcBlock.timestamp),
                chainId: BigInt(chainId),
                blockNumber: decodeToBigInt(trace.blockNumber),
                transactionIndex: BigInt(trace.transactionPosition),
                eventType: EVENT_TYPES.callTraces,
                eventIndex: BigInt(i)
              });
              trace.checkpoint = checkpoint;
            }
            await tx.insertInto("callTraces").values(traces).onConflict((oc) => oc.column("id").doNothing()).execute();
          }
          await this._insertFactoryTraceFilterInterval({
            tx,
            chainId,
            factoryTraceFilters: [factory],
            interval
          });
        });
      }
    );
  };
  getFactoryTraceFilterIntervals = async ({
    chainId,
    factory
  }) => {
    return this.db.wrap(
      { method: "getFactoryTraceFilterIntervals" },
      async () => {
        const fragments = buildFactoryTraceFragments({ ...factory, chainId });
        await Promise.all(
          fragments.map(async (fragment) => {
            return await this.db.transaction().execute(async (tx) => {
              const { id: factoryId } = await tx.insertInto("factoryTraceFilters").values(fragment).onConflict((oc) => oc.doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
              const existingIntervals = await tx.deleteFrom("factoryTraceFilterIntervals").where("factoryId", "=", factoryId).returningAll().execute();
              const mergedIntervals = intervalUnion(
                existingIntervals.map((i) => [
                  Number(decodeToBigInt(i.startBlock)),
                  Number(decodeToBigInt(i.endBlock))
                ])
              );
              const mergedIntervalRows = mergedIntervals.map(
                ([startBlock, endBlock]) => ({
                  factoryId,
                  startBlock: encodeAsText(startBlock),
                  endBlock: encodeAsText(endBlock)
                })
              );
              if (mergedIntervalRows.length > 0) {
                await tx.insertInto("factoryTraceFilterIntervals").values(mergedIntervalRows).execute();
              }
            });
          })
        );
        const intervals = await this.db.with(
          "factoryFilterFragments(fragmentId, fragmentAddress, fragmentEventSelector, fragmentChildAddressLocation, fragmentFromAddress)",
          () => sql8`( values ${sql8.join(
            fragments.map(
              (f) => sql8`( ${sql8.val(f.id)}, ${sql8.val(f.address)}, ${sql8.val(
                f.eventSelector
              )}, ${sql8.val(f.childAddressLocation)}, ${sql8.val(
                f.fromAddress
              )} )`
            )
          )} )`
        ).selectFrom("factoryTraceFilterIntervals").innerJoin(
          "factoryTraceFilters",
          "factoryId",
          "factoryTraceFilters.id"
        ).innerJoin(
          "factoryFilterFragments",
          (join) => join.on(
            (eb) => eb.and([
              eb("fragmentAddress", "=", sql8.ref("address")),
              eb("fragmentEventSelector", "=", sql8.ref("eventSelector")),
              eb(
                "fragmentChildAddressLocation",
                "=",
                sql8.ref("childAddressLocation")
              ),
              eb.or([
                eb("fromAddress", "is", null),
                eb("fragmentFromAddress", "=", sql8.ref("fromAddress"))
              ])
            ])
          )
        ).select(["fragmentId", "startBlock", "endBlock"]).where("chainId", "=", chainId).execute();
        const intervalsByFragmentId = intervals.reduce(
          (acc, cur) => {
            const { fragmentId, startBlock, endBlock } = cur;
            (acc[fragmentId] ||= []).push([
              Number(startBlock),
              Number(endBlock)
            ]);
            return acc;
          },
          {}
        );
        const intervalsForEachFragment = fragments.map(
          (f) => intervalUnion(intervalsByFragmentId[f.id] ?? [])
        );
        return intervalIntersectionMany(intervalsForEachFragment);
      }
    );
  };
  insertRealtimeBlock = async ({
    chainId,
    block: rpcBlock,
    transactions: rpcTransactions,
    transactionReceipts: rpcTransactionReceipts,
    logs: rpcLogs,
    traces: rpcTraces
  }) => {
    return this.db.wrap({ method: "insertRealtimeBlock" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        await tx.insertInto("blocks").values({
          ...rpcToSqliteBlock(rpcBlock),
          chainId,
          checkpoint: this.createBlockCheckpoint(rpcBlock, chainId)
        }).onConflict((oc) => oc.column("hash").doNothing()).execute();
        if (rpcTransactions.length > 0) {
          const transactions = rpcTransactions.map((rpcTransaction) => ({
            ...rpcToSqliteTransaction(rpcTransaction),
            chainId
          }));
          await tx.insertInto("transactions").values(transactions).onConflict(
            (oc) => oc.column("hash").doUpdateSet((eb) => ({
              blockHash: eb.ref("excluded.blockHash"),
              blockNumber: eb.ref("excluded.blockNumber"),
              transactionIndex: eb.ref("excluded.transactionIndex")
            }))
          ).execute();
        }
        if (rpcTransactionReceipts.length > 0) {
          const transactionReceipts = rpcTransactionReceipts.map(
            (rpcTransactionReceipt) => ({
              ...rpcToSqliteTransactionReceipt(rpcTransactionReceipt),
              chainId
            })
          );
          await tx.insertInto("transactionReceipts").values(transactionReceipts).onConflict(
            (oc) => oc.column("transactionHash").doUpdateSet((eb) => ({
              blockHash: eb.ref("excluded.blockHash"),
              blockNumber: eb.ref("excluded.blockNumber"),
              contractAddress: eb.ref("excluded.contractAddress"),
              cumulativeGasUsed: eb.ref("excluded.cumulativeGasUsed"),
              effectiveGasPrice: eb.ref("excluded.effectiveGasPrice"),
              gasUsed: eb.ref("excluded.gasUsed"),
              logs: eb.ref("excluded.logs"),
              logsBloom: eb.ref("excluded.logsBloom"),
              transactionIndex: eb.ref("excluded.transactionIndex")
            }))
          ).execute();
        }
        if (rpcLogs.length > 0) {
          const logs = rpcLogs.map((rpcLog) => ({
            ...rpcToSqliteLog(rpcLog),
            chainId,
            checkpoint: this.createLogCheckpoint(rpcLog, rpcBlock, chainId)
          }));
          await tx.insertInto("logs").values(logs).onConflict(
            (oc) => oc.column("id").doUpdateSet((eb) => ({
              checkpoint: eb.ref("excluded.checkpoint")
            }))
          ).execute();
        }
        if (rpcTraces.length > 0) {
          const traces = rpcTraces.map((trace, i) => ({
            ...rpcToSqliteTrace(trace),
            chainId,
            checkpoint: encodeCheckpoint({
              blockTimestamp: hexToNumber4(rpcBlock.timestamp),
              chainId: BigInt(chainId),
              blockNumber: hexToBigInt3(trace.blockNumber),
              transactionIndex: BigInt(trace.transactionPosition),
              eventType: EVENT_TYPES.callTraces,
              eventIndex: BigInt(i)
            })
          })).sort((a, b) => {
            if (a.transactionHash < b.transactionHash)
              return -1;
            if (a.transactionHash > b.transactionHash)
              return 1;
            return a.traceAddress < b.traceAddress ? -1 : 1;
          });
          await tx.insertInto("callTraces").values(traces).onConflict((oc) => oc.column("id").doNothing()).execute();
        }
      });
    });
  };
  createLogCheckpoint = (rpcLog, block, chainId) => {
    if (block.number === null) {
      throw new Error("Number is missing from RPC block");
    }
    if (rpcLog.transactionIndex === null) {
      throw new Error("Transaction index is missing from RPC log");
    }
    if (rpcLog.logIndex === null) {
      throw new Error("Log index is missing from RPC log");
    }
    return encodeCheckpoint({
      blockTimestamp: Number(BigInt(block.timestamp)),
      chainId: BigInt(chainId),
      blockNumber: hexToBigInt3(block.number),
      transactionIndex: hexToBigInt3(rpcLog.transactionIndex),
      eventType: EVENT_TYPES.logs,
      eventIndex: hexToBigInt3(rpcLog.logIndex)
    });
  };
  createBlockCheckpoint = (block, chainId) => {
    if (block.number === null) {
      throw new Error("Number is missing from RPC block");
    }
    return encodeCheckpoint({
      blockTimestamp: hexToNumber4(block.timestamp),
      chainId: BigInt(chainId),
      blockNumber: hexToBigInt3(block.number),
      transactionIndex: maxCheckpoint.transactionIndex,
      eventType: EVENT_TYPES.blocks,
      eventIndex: zeroCheckpoint.eventIndex
    });
  };
  insertRealtimeInterval = async ({
    chainId,
    logFilters,
    factoryLogFilters,
    traceFilters,
    factoryTraceFilters,
    blockFilters,
    interval
  }) => {
    return this.db.wrap({ method: "insertRealtimeInterval" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        await this._insertLogFilterInterval({
          tx,
          chainId,
          logFilters: [
            ...logFilters,
            ...factoryLogFilters.map((f) => ({
              address: f.address,
              topics: [f.eventSelector],
              includeTransactionReceipts: f.includeTransactionReceipts
            })),
            ...factoryTraceFilters.map((f) => ({
              address: f.address,
              topics: [f.eventSelector],
              includeTransactionReceipts: f.includeTransactionReceipts
            }))
          ],
          interval
        });
        await this._insertFactoryLogFilterInterval({
          tx,
          chainId,
          factoryLogFilters,
          interval
        });
        await this._insertBlockFilterInterval({
          tx,
          chainId,
          blockFilters,
          interval
        });
        await this._insertTraceFilterInterval({
          tx,
          chainId,
          traceFilters,
          interval
        });
        await this._insertFactoryTraceFilterInterval({
          tx,
          chainId,
          factoryTraceFilters,
          interval
        });
      });
    });
  };
  deleteRealtimeData = async ({
    chainId,
    fromBlock: fromBlock_
  }) => {
    return this.db.wrap({ method: "deleteRealtimeData" }, async () => {
      await this.db.transaction().execute(async (tx) => {
        const fromBlock = encodeAsText(fromBlock_);
        await tx.deleteFrom("logs").where("chainId", "=", chainId).where("blockNumber", ">", fromBlock).execute();
        await tx.deleteFrom("blocks").where("chainId", "=", chainId).where("number", ">", fromBlock).execute();
        await tx.deleteFrom("rpcRequestResults").where("chainId", "=", chainId).where("blockNumber", ">", fromBlock).execute();
        await tx.deleteFrom("callTraces").where("chainId", "=", chainId).where("blockNumber", ">", fromBlock).execute();
      });
    });
  };
  /** SYNC HELPER METHODS */
  _insertLogFilterInterval = async ({
    tx,
    chainId,
    logFilters,
    interval: { startBlock, endBlock }
  }) => {
    const logFilterFragments = logFilters.flatMap(
      (logFilter) => buildLogFilterFragments({ ...logFilter, chainId })
    );
    await Promise.all(
      logFilterFragments.map(async (logFilterFragment) => {
        const { id: logFilterId } = await tx.insertInto("logFilters").values(logFilterFragment).onConflict((oc) => oc.doUpdateSet(logFilterFragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("logFilterIntervals").values({
          logFilterId,
          startBlock: encodeAsText(startBlock),
          endBlock: encodeAsText(endBlock)
        }).execute();
      })
    );
  };
  _insertFactoryLogFilterInterval = async ({
    tx,
    chainId,
    factoryLogFilters,
    interval: { startBlock, endBlock }
  }) => {
    const factoryFragments = factoryLogFilters.flatMap(
      (factory) => buildFactoryLogFragments({ ...factory, chainId })
    );
    await Promise.all(
      factoryFragments.map(async (fragment) => {
        const { id: factoryId } = await tx.insertInto("factoryLogFilters").values(fragment).onConflict((oc) => oc.doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("factoryLogFilterIntervals").values({
          factoryId,
          startBlock: encodeAsText(startBlock),
          endBlock: encodeAsText(endBlock)
        }).execute();
      })
    );
  };
  _insertBlockFilterInterval = async ({
    tx,
    chainId,
    blockFilters,
    interval: { startBlock, endBlock }
  }) => {
    const blockFilterFragments = blockFilters.flatMap((blockFilter) => {
      return {
        id: `${chainId}_${blockFilter.interval}_${blockFilter.offset}`,
        chainId,
        interval: blockFilter.interval,
        offset: blockFilter.offset
      };
    });
    await Promise.all(
      blockFilterFragments.map(async (blockFilterFragment) => {
        const { id: blockFilterId } = await tx.insertInto("blockFilters").values(blockFilterFragment).onConflict((oc) => oc.doUpdateSet(blockFilterFragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("blockFilterIntervals").values({
          blockFilterId,
          startBlock: encodeAsText(startBlock),
          endBlock: encodeAsText(endBlock)
        }).execute();
      })
    );
  };
  _insertTraceFilterInterval = async ({
    tx,
    chainId,
    traceFilters,
    interval: { startBlock, endBlock }
  }) => {
    const traceFilterFragments = traceFilters.flatMap(
      (traceFilter) => buildTraceFragments({ ...traceFilter, chainId })
    );
    await Promise.all(
      traceFilterFragments.map(async (traceFilterFragment) => {
        const { id: traceFilterId } = await tx.insertInto("traceFilters").values(traceFilterFragment).onConflict((oc) => oc.column("id").doUpdateSet(traceFilterFragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("traceFilterIntervals").values({
          traceFilterId,
          startBlock: encodeAsText(startBlock),
          endBlock: encodeAsText(endBlock)
        }).execute();
      })
    );
  };
  _insertFactoryTraceFilterInterval = async ({
    tx,
    chainId,
    factoryTraceFilters,
    interval: { startBlock, endBlock }
  }) => {
    const factoryFragments = factoryTraceFilters.flatMap(
      (factory) => buildFactoryTraceFragments({ ...factory, chainId })
    );
    await Promise.all(
      factoryFragments.map(async (fragment) => {
        const { id: factoryId } = await tx.insertInto("factoryTraceFilters").values(fragment).onConflict((oc) => oc.column("id").doUpdateSet(fragment)).returningAll().executeTakeFirstOrThrow();
        await tx.insertInto("factoryTraceFilterIntervals").values({
          factoryId,
          startBlock: encodeAsText(startBlock),
          endBlock: encodeAsText(endBlock)
        }).execute();
      })
    );
  };
  /** CONTRACT READS */
  insertRpcRequestResult = async ({
    blockNumber,
    chainId,
    request,
    result
  }) => {
    return this.db.wrap({ method: "insertRpcRequestResult" }, async () => {
      await this.db.insertInto("rpcRequestResults").values({
        request,
        blockNumber: encodeAsText(blockNumber),
        chainId,
        result
      }).onConflict((oc) => oc.doUpdateSet({ result })).execute();
    });
  };
  getRpcRequestResult = async ({
    blockNumber,
    chainId,
    request
  }) => {
    return this.db.wrap({ method: "getRpcRequestResult" }, async () => {
      const rpcRequestResult = await this.db.selectFrom("rpcRequestResults").selectAll().where("blockNumber", "=", encodeAsText(blockNumber)).where("chainId", "=", chainId).where("request", "=", request).executeTakeFirst();
      return rpcRequestResult ? {
        ...rpcRequestResult,
        blockNumber: decodeToBigInt(rpcRequestResult.blockNumber)
      } : null;
    });
  };
  async *getEvents({
    sources,
    fromCheckpoint,
    toCheckpoint,
    limit
  }) {
    let cursor = encodeCheckpoint(fromCheckpoint);
    const encodedToCheckpoint = encodeCheckpoint(toCheckpoint);
    const sourcesById = sources.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});
    const logSources = sources.filter(
      (s) => sourceIsLog(s) || sourceIsFactoryLog(s)
    );
    const callTraceSources = sources.filter(
      (s) => sourceIsCallTrace(s) || sourceIsFactoryCallTrace(s)
    );
    const blockSources = sources.filter(sourceIsBlock);
    const shouldJoinLogs = logSources.length !== 0;
    const shouldJoinTransactions = logSources.length !== 0 || callTraceSources.length !== 0;
    const shouldJoinTraces = callTraceSources.length !== 0;
    const shouldJoinReceipts = logSources.some((source) => source.criteria.includeTransactionReceipts) || callTraceSources.some(
      (source) => source.criteria.includeTransactionReceipts
    );
    while (true) {
      const events = await this.db.wrap({ method: "getEvents" }, async () => {
        const requestedLogs = await this.db.with(
          "log_sources(source_id)",
          () => sql8`( values ${logSources.length === 0 ? sql8`( null )` : sql8.join(
            logSources.map(
              (source) => sql8`( ${sql8.val(source.id)} )`
            )
          )} )`
        ).with(
          "block_sources(source_id)",
          () => sql8`( values ${blockSources.length === 0 ? sql8`( null )` : sql8.join(
            blockSources.map(
              (source) => sql8`( ${sql8.val(source.id)} )`
            )
          )} )`
        ).with(
          "call_traces_sources(source_id)",
          () => sql8`( values ${callTraceSources.length === 0 ? sql8`( null )` : sql8.join(
            callTraceSources.map(
              (source) => sql8`( ${sql8.val(source.id)} )`
            )
          )} )`
        ).with(
          "events",
          (db) => db.selectFrom("logs").innerJoin("log_sources", (join) => join.onTrue()).where((eb) => {
            const logFilterCmprs = sources.filter(sourceIsLog).map((logFilter) => {
              const exprs = this.buildLogFilterCmprs({ eb, logFilter });
              exprs.push(eb("source_id", "=", logFilter.id));
              return eb.and(exprs);
            });
            const factoryCmprs = sources.filter(sourceIsFactoryLog).map((factory) => {
              const exprs = this.buildFactoryLogFilterCmprs({
                eb,
                factory
              });
              exprs.push(eb("source_id", "=", factory.id));
              return eb.and(exprs);
            });
            return eb.or([...logFilterCmprs, ...factoryCmprs]);
          }).select([
            "source_id",
            "checkpoint",
            "blockHash",
            "transactionHash",
            "logs.id as log_id",
            sql8`null`.as("callTrace_id")
          ]).unionAll(
            // @ts-ignore
            db.selectFrom("blocks").innerJoin("block_sources", (join) => join.onTrue()).where((eb) => {
              const exprs = [];
              const blockFilters = sources.filter(sourceIsBlock);
              for (const blockFilter of blockFilters) {
                exprs.push(
                  eb.and([
                    eb("chainId", "=", blockFilter.chainId),
                    eb(
                      "number",
                      ">=",
                      encodeAsText(blockFilter.startBlock)
                    ),
                    ...blockFilter.endBlock !== void 0 ? [
                      eb(
                        "number",
                        "<=",
                        encodeAsText(blockFilter.endBlock)
                      )
                    ] : [],
                    sql8`(number - ${blockFilter.criteria.offset}) % ${blockFilter.criteria.interval} = 0`,
                    eb("source_id", "=", blockFilter.id)
                  ])
                );
              }
              return eb.or(exprs);
            }).select([
              "block_sources.source_id",
              "checkpoint",
              "hash as blockHash",
              sql8`null`.as("transactionHash"),
              sql8`null`.as("log_id"),
              sql8`null`.as("callTrace_id")
            ])
          ).unionAll(
            // @ts-ignore
            db.selectFrom("callTraces").innerJoin("call_traces_sources", (join) => join.onTrue()).where((eb) => {
              const traceFilterCmprs = sources.filter(sourceIsCallTrace).map((callTraceSource) => {
                const exprs = this.buildTraceFilterCmprs({
                  eb,
                  callTraceSource
                });
                exprs.push(eb("source_id", "=", callTraceSource.id));
                return eb.and(exprs);
              });
              const factoryTraceFilterCmprs = sources.filter(sourceIsFactoryCallTrace).map((factory) => {
                const exprs = this.buildFactoryTraceFilterCmprs({
                  eb,
                  factory
                });
                exprs.push(eb("source_id", "=", factory.id));
                return eb.and(exprs);
              });
              return eb.or([
                ...traceFilterCmprs,
                ...factoryTraceFilterCmprs
              ]);
            }).select([
              "source_id",
              "checkpoint",
              "blockHash",
              "transactionHash",
              sql8`null`.as("log_id"),
              "callTraces.id as callTrace_id"
            ])
          )
        ).selectFrom("events").innerJoin("blocks", "blocks.hash", "events.blockHash").select([
          "events.source_id",
          "events.checkpoint",
          "blocks.baseFeePerGas as block_baseFeePerGas",
          "blocks.difficulty as block_difficulty",
          "blocks.extraData as block_extraData",
          "blocks.gasLimit as block_gasLimit",
          "blocks.gasUsed as block_gasUsed",
          "blocks.hash as block_hash",
          "blocks.logsBloom as block_logsBloom",
          "blocks.miner as block_miner",
          "blocks.mixHash as block_mixHash",
          "blocks.nonce as block_nonce",
          "blocks.number as block_number",
          "blocks.parentHash as block_parentHash",
          "blocks.receiptsRoot as block_receiptsRoot",
          "blocks.sha3Uncles as block_sha3Uncles",
          "blocks.size as block_size",
          "blocks.stateRoot as block_stateRoot",
          "blocks.timestamp as block_timestamp",
          "blocks.totalDifficulty as block_totalDifficulty",
          "blocks.transactionsRoot as block_transactionsRoot"
        ]).$if(
          shouldJoinLogs,
          (qb) => qb.leftJoin("logs", "logs.id", "events.log_id").select([
            "logs.address as log_address",
            "logs.blockHash as log_blockHash",
            "logs.blockNumber as log_blockNumber",
            "logs.chainId as log_chainId",
            "logs.data as log_data",
            "logs.id as log_id",
            "logs.logIndex as log_logIndex",
            "logs.topic0 as log_topic0",
            "logs.topic1 as log_topic1",
            "logs.topic2 as log_topic2",
            "logs.topic3 as log_topic3",
            "logs.transactionHash as log_transactionHash",
            "logs.transactionIndex as log_transactionIndex"
          ])
        ).$if(
          shouldJoinTransactions,
          (qb) => qb.leftJoin(
            "transactions",
            "transactions.hash",
            "events.transactionHash"
          ).select([
            "transactions.accessList as tx_accessList",
            "transactions.blockHash as tx_blockHash",
            "transactions.blockNumber as tx_blockNumber",
            "transactions.from as tx_from",
            "transactions.gas as tx_gas",
            "transactions.gasPrice as tx_gasPrice",
            "transactions.hash as tx_hash",
            "transactions.input as tx_input",
            "transactions.maxFeePerGas as tx_maxFeePerGas",
            "transactions.maxPriorityFeePerGas as tx_maxPriorityFeePerGas",
            "transactions.nonce as tx_nonce",
            "transactions.r as tx_r",
            "transactions.s as tx_s",
            "transactions.to as tx_to",
            "transactions.transactionIndex as tx_transactionIndex",
            "transactions.type as tx_type",
            "transactions.value as tx_value",
            "transactions.v as tx_v"
          ])
        ).$if(
          shouldJoinTraces,
          (qb) => qb.leftJoin("callTraces", "callTraces.id", "events.callTrace_id").select([
            "callTraces.id as callTrace_id",
            "callTraces.callType as callTrace_callType",
            "callTraces.from as callTrace_from",
            "callTraces.gas as callTrace_gas",
            "callTraces.input as callTrace_input",
            "callTraces.to as callTrace_to",
            "callTraces.value as callTrace_value",
            "callTraces.blockHash as callTrace_blockHash",
            "callTraces.blockNumber as callTrace_blockNumber",
            "callTraces.gasUsed as callTrace_gasUsed",
            "callTraces.output as callTrace_output",
            "callTraces.subtraces as callTrace_subtraces",
            "callTraces.traceAddress as callTrace_traceAddress",
            "callTraces.transactionHash as callTrace_transactionHash",
            "callTraces.transactionPosition as callTrace_transactionPosition",
            "callTraces.chainId as callTrace_chainId",
            "callTraces.checkpoint as callTrace_checkpoint"
          ])
        ).$if(
          shouldJoinReceipts,
          (qb) => qb.leftJoin(
            "transactionReceipts",
            "transactionReceipts.transactionHash",
            "events.transactionHash"
          ).select([
            "transactionReceipts.blockHash as txr_blockHash",
            "transactionReceipts.blockNumber as txr_blockNumber",
            "transactionReceipts.contractAddress as txr_contractAddress",
            "transactionReceipts.cumulativeGasUsed as txr_cumulativeGasUsed",
            "transactionReceipts.effectiveGasPrice as txr_effectiveGasPrice",
            "transactionReceipts.from as txr_from",
            "transactionReceipts.gasUsed as txr_gasUsed",
            "transactionReceipts.logs as txr_logs",
            "transactionReceipts.logsBloom as txr_logsBloom",
            "transactionReceipts.status as txr_status",
            "transactionReceipts.to as txr_to",
            "transactionReceipts.transactionHash as txr_transactionHash",
            "transactionReceipts.transactionIndex as txr_transactionIndex",
            "transactionReceipts.type as txr_type"
          ])
        ).where("events.checkpoint", ">", cursor).where("events.checkpoint", "<=", encodedToCheckpoint).orderBy("events.checkpoint", "asc").limit(limit + 1).execute();
        return requestedLogs.map((_row) => {
          const row = _row;
          const source = sourcesById[row.source_id];
          const shouldIncludeLog = sourceIsLog(source) || sourceIsFactoryLog(source);
          const shouldIncludeTransaction = sourceIsLog(source) || sourceIsFactoryLog(source) || sourceIsCallTrace(source) || sourceIsFactoryCallTrace(source);
          const shouldIncludeTrace = sourceIsCallTrace(source) || sourceIsFactoryCallTrace(source);
          const shouldIncludeTransactionReceipt = sourceIsLog(source) && source.criteria.includeTransactionReceipts || sourceIsFactoryLog(source) && source.criteria.includeTransactionReceipts;
          return {
            chainId: source.chainId,
            sourceId: row.source_id,
            encodedCheckpoint: row.checkpoint,
            log: shouldIncludeLog ? {
              address: checksumAddress3(row.log_address),
              blockHash: row.log_blockHash,
              blockNumber: decodeToBigInt(row.log_blockNumber),
              data: row.log_data,
              id: row.log_id,
              logIndex: Number(row.log_logIndex),
              removed: false,
              topics: [
                row.log_topic0,
                row.log_topic1,
                row.log_topic2,
                row.log_topic3
              ].filter((t) => t !== null),
              transactionHash: row.log_transactionHash,
              transactionIndex: Number(row.log_transactionIndex)
            } : void 0,
            block: {
              baseFeePerGas: row.block_baseFeePerGas ? decodeToBigInt(row.block_baseFeePerGas) : null,
              difficulty: decodeToBigInt(row.block_difficulty),
              extraData: row.block_extraData,
              gasLimit: decodeToBigInt(row.block_gasLimit),
              gasUsed: decodeToBigInt(row.block_gasUsed),
              hash: row.block_hash,
              logsBloom: row.block_logsBloom,
              miner: checksumAddress3(row.block_miner),
              mixHash: row.block_mixHash,
              nonce: row.block_nonce,
              number: decodeToBigInt(row.block_number),
              parentHash: row.block_parentHash,
              receiptsRoot: row.block_receiptsRoot,
              sha3Uncles: row.block_sha3Uncles,
              size: decodeToBigInt(row.block_size),
              stateRoot: row.block_stateRoot,
              timestamp: decodeToBigInt(row.block_timestamp),
              totalDifficulty: row.block_totalDifficulty ? decodeToBigInt(row.block_totalDifficulty) : null,
              transactionsRoot: row.block_transactionsRoot
            },
            transaction: shouldIncludeTransaction ? {
              blockHash: row.tx_blockHash,
              blockNumber: decodeToBigInt(row.tx_blockNumber),
              from: checksumAddress3(row.tx_from),
              gas: decodeToBigInt(row.tx_gas),
              hash: row.tx_hash,
              input: row.tx_input,
              nonce: Number(row.tx_nonce),
              r: row.tx_r,
              s: row.tx_s,
              to: row.tx_to ? checksumAddress3(row.tx_to) : row.tx_to,
              transactionIndex: Number(row.tx_transactionIndex),
              value: decodeToBigInt(row.tx_value),
              v: row.tx_v ? decodeToBigInt(row.tx_v) : null,
              ...row.tx_type === "0x0" ? {
                type: "legacy",
                gasPrice: decodeToBigInt(row.tx_gasPrice)
              } : row.tx_type === "0x1" ? {
                type: "eip2930",
                gasPrice: decodeToBigInt(row.tx_gasPrice),
                accessList: JSON.parse(row.tx_accessList)
              } : row.tx_type === "0x2" ? {
                type: "eip1559",
                maxFeePerGas: decodeToBigInt(row.tx_maxFeePerGas),
                maxPriorityFeePerGas: decodeToBigInt(
                  row.tx_maxPriorityFeePerGas
                )
              } : row.tx_type === "0x7e" ? {
                type: "deposit",
                maxFeePerGas: row.tx_maxFeePerGas ? decodeToBigInt(row.tx_maxFeePerGas) : void 0,
                maxPriorityFeePerGas: row.tx_maxPriorityFeePerGas ? decodeToBigInt(row.tx_maxPriorityFeePerGas) : void 0
              } : {
                type: row.tx_type
              }
            } : void 0,
            trace: shouldIncludeTrace ? {
              id: row.callTrace_id,
              from: checksumAddress3(row.callTrace_from),
              to: checksumAddress3(row.callTrace_to),
              gas: decodeToBigInt(row.callTrace_gas),
              value: decodeToBigInt(row.callTrace_value),
              input: row.callTrace_input,
              output: row.callTrace_output,
              gasUsed: decodeToBigInt(row.callTrace_gasUsed),
              subtraces: row.callTrace_subtraces,
              traceAddress: JSON.parse(row.callTrace_traceAddress),
              blockHash: row.callTrace_blockHash,
              blockNumber: decodeToBigInt(row.callTrace_blockNumber),
              transactionHash: row.callTrace_transactionHash,
              transactionIndex: row.callTrace_transactionPosition,
              callType: row.callTrace_callType
            } : void 0,
            transactionReceipt: shouldIncludeTransactionReceipt ? {
              blockHash: row.txr_blockHash,
              blockNumber: decodeToBigInt(row.txr_blockNumber),
              contractAddress: row.txr_contractAddress ? checksumAddress3(row.txr_contractAddress) : null,
              cumulativeGasUsed: decodeToBigInt(row.txr_cumulativeGasUsed),
              effectiveGasPrice: decodeToBigInt(row.txr_effectiveGasPrice),
              from: checksumAddress3(row.txr_from),
              gasUsed: decodeToBigInt(row.txr_gasUsed),
              logs: JSON.parse(row.txr_logs).map((log) => ({
                address: checksumAddress3(log.address),
                blockHash: log.blockHash,
                blockNumber: hexToBigInt3(log.blockNumber),
                data: log.data,
                logIndex: hexToNumber4(log.logIndex),
                removed: false,
                topics: [
                  log.topics[0] ?? null,
                  log.topics[1] ?? null,
                  log.topics[2] ?? null,
                  log.topics[3] ?? null
                ].filter((t) => t !== null),
                transactionHash: log.transactionHash,
                transactionIndex: hexToNumber4(log.transactionIndex)
              })),
              logsBloom: row.txr_logsBloom,
              status: row.txr_status === "0x1" ? "success" : row.txr_status === "0x0" ? "reverted" : row.txr_status,
              to: row.txr_to ? checksumAddress3(row.txr_to) : null,
              transactionHash: row.txr_transactionHash,
              transactionIndex: Number(row.txr_transactionIndex),
              type: row.txr_type === "0x0" ? "legacy" : row.txr_type === "0x1" ? "eip2930" : row.tx_type === "0x2" ? "eip1559" : row.tx_type === "0x7e" ? "deposit" : row.tx_type
            } : void 0
          };
        });
      });
      const hasNextPage = events.length === limit + 1;
      if (!hasNextPage) {
        yield events;
        break;
      } else {
        events.pop();
        cursor = events[events.length - 1].encodedCheckpoint;
        yield events;
      }
    }
  }
  async getLastEventCheckpoint({
    sources,
    fromCheckpoint,
    toCheckpoint
  }) {
    return this.db.wrap({ method: "getLastEventCheckpoint" }, async () => {
      const checkpoint = await this.db.selectFrom("logs").where((eb) => {
        const logFilterCmprs = sources.filter(sourceIsLog).map((logFilter) => {
          const exprs = this.buildLogFilterCmprs({ eb, logFilter });
          return eb.and(exprs);
        });
        const factoryLogFilterCmprs = sources.filter(sourceIsFactoryLog).map((factory) => {
          const exprs = this.buildFactoryLogFilterCmprs({ eb, factory });
          return eb.and(exprs);
        });
        return eb.or([...logFilterCmprs, ...factoryLogFilterCmprs]);
      }).select("checkpoint").unionAll(
        this.db.selectFrom("blocks").where((eb) => {
          const exprs = [];
          const blockFilters = sources.filter(sourceIsBlock);
          for (const blockFilter of blockFilters) {
            exprs.push(
              eb.and([
                eb("chainId", "=", blockFilter.chainId),
                eb("number", ">=", encodeAsText(blockFilter.startBlock)),
                ...blockFilter.endBlock !== void 0 ? [eb("number", "<=", encodeAsText(blockFilter.endBlock))] : [],
                sql8`(number - ${blockFilter.criteria.offset}) % ${blockFilter.criteria.interval} = 0`
              ])
            );
          }
          return eb.or(exprs);
        }).select("checkpoint")
      ).unionAll(
        this.db.selectFrom("callTraces").where((eb) => {
          const traceFilterCmprs = sources.filter(sourceIsCallTrace).map((callTraceSource) => {
            const exprs = this.buildTraceFilterCmprs({
              eb,
              callTraceSource
            });
            return eb.and(exprs);
          });
          const factoryCallTraceCmprs = sources.filter(sourceIsFactoryCallTrace).map((factory) => {
            const exprs = this.buildFactoryTraceFilterCmprs({
              eb,
              factory
            });
            return eb.and(exprs);
          });
          return eb.or([...traceFilterCmprs, ...factoryCallTraceCmprs]);
        }).select("checkpoint")
      ).where("checkpoint", ">", encodeCheckpoint(fromCheckpoint)).where("checkpoint", "<=", encodeCheckpoint(toCheckpoint)).orderBy("checkpoint", "desc").executeTakeFirst();
      return checkpoint ? checkpoint.checkpoint ? decodeCheckpoint(checkpoint.checkpoint) : void 0 : void 0;
    });
  }
  buildLogFilterCmprs = ({
    eb,
    logFilter
  }) => {
    const exprs = [];
    exprs.push(eb("logs.chainId", "=", logFilter.chainId));
    if (logFilter.criteria.address) {
      const address = Array.isArray(logFilter.criteria.address) && logFilter.criteria.address.length === 1 ? logFilter.criteria.address[0] : logFilter.criteria.address;
      if (Array.isArray(address)) {
        exprs.push(eb.or(address.map((a) => eb("logs.address", "=", a))));
      } else {
        exprs.push(eb("logs.address", "=", address));
      }
    }
    if (logFilter.criteria.topics) {
      for (const idx_ of range(0, 4)) {
        const idx = idx_;
        const raw = logFilter.criteria.topics[idx] ?? null;
        if (raw === null)
          continue;
        const topic = Array.isArray(raw) && raw.length === 1 ? raw[0] : raw;
        if (Array.isArray(topic)) {
          exprs.push(eb.or(topic.map((a) => eb(`logs.topic${idx}`, "=", a))));
        } else {
          exprs.push(eb(`logs.topic${idx}`, "=", topic));
        }
      }
    }
    if (logFilter.startBlock !== void 0 && logFilter.startBlock !== 0)
      exprs.push(
        eb("logs.blockNumber", ">=", encodeAsText(logFilter.startBlock))
      );
    if (logFilter.endBlock)
      exprs.push(
        eb("logs.blockNumber", "<=", encodeAsText(logFilter.endBlock))
      );
    return exprs;
  };
  buildFactoryLogFilterCmprs = ({
    eb,
    factory
  }) => {
    const exprs = [];
    exprs.push(eb("logs.chainId", "=", factory.chainId));
    const selectChildAddressExpression = buildFactoryChildAddressSelectExpression2({
      childAddressLocation: factory.criteria.childAddressLocation
    });
    exprs.push(
      eb(
        "logs.address",
        "in",
        eb.selectFrom("logs").select(selectChildAddressExpression.as("childAddress")).where("chainId", "=", factory.chainId).where("address", "=", factory.criteria.address).where("topic0", "=", factory.criteria.eventSelector)
      )
    );
    if (factory.criteria.topics) {
      for (const idx_ of range(0, 4)) {
        const idx = idx_;
        const raw = factory.criteria.topics[idx] ?? null;
        if (raw === null)
          continue;
        const topic = Array.isArray(raw) && raw.length === 1 ? raw[0] : raw;
        if (Array.isArray(topic)) {
          exprs.push(eb.or(topic.map((a) => eb(`logs.topic${idx}`, "=", a))));
        } else {
          exprs.push(eb(`logs.topic${idx}`, "=", topic));
        }
      }
    }
    if (factory.startBlock !== void 0 && factory.startBlock !== 0)
      exprs.push(
        eb("logs.blockNumber", ">=", encodeAsText(factory.startBlock))
      );
    if (factory.endBlock)
      exprs.push(eb("logs.blockNumber", "<=", encodeAsText(factory.endBlock)));
    return exprs;
  };
  buildTraceFilterCmprs = ({
    eb,
    callTraceSource
  }) => {
    const exprs = [];
    exprs.push(eb("callTraces.chainId", "=", callTraceSource.chainId));
    if (callTraceSource.criteria.fromAddress) {
      const fromAddress = Array.isArray(callTraceSource.criteria.fromAddress) && callTraceSource.criteria.fromAddress.length === 1 ? callTraceSource.criteria.fromAddress[0] : callTraceSource.criteria.fromAddress;
      if (Array.isArray(fromAddress)) {
        exprs.push(
          eb.or(fromAddress.map((a) => eb("callTraces.from", "=", a)))
        );
      } else {
        exprs.push(eb("callTraces.from", "=", fromAddress));
      }
    }
    if (callTraceSource.criteria.toAddress) {
      const toAddress = Array.isArray(callTraceSource.criteria.toAddress) && callTraceSource.criteria.toAddress.length === 1 ? callTraceSource.criteria.toAddress[0] : callTraceSource.criteria.toAddress;
      if (Array.isArray(toAddress)) {
        exprs.push(eb.or(toAddress.map((a) => eb("callTraces.to", "=", a))));
      } else {
        exprs.push(eb("callTraces.to", "=", toAddress));
      }
    }
    exprs.push(
      eb.or(
        callTraceSource.criteria.functionSelectors.map(
          (fs) => eb("callTraces.functionSelector", "=", fs)
        )
      )
    );
    exprs.push(
      sql8`${sql8.ref("callTraces.error")} IS NULL`
    );
    if (callTraceSource.startBlock !== void 0 && callTraceSource.startBlock !== 0)
      exprs.push(
        eb(
          "callTraces.blockNumber",
          ">=",
          encodeAsText(callTraceSource.startBlock)
        )
      );
    if (callTraceSource.endBlock)
      exprs.push(
        eb(
          "callTraces.blockNumber",
          "<=",
          encodeAsText(callTraceSource.endBlock)
        )
      );
    return exprs;
  };
  buildFactoryTraceFilterCmprs = ({
    eb,
    factory
  }) => {
    const exprs = [];
    exprs.push(eb("callTraces.chainId", "=", factory.chainId));
    const selectChildAddressExpression = buildFactoryChildAddressSelectExpression2({
      childAddressLocation: factory.criteria.childAddressLocation
    });
    exprs.push(
      eb(
        "callTraces.to",
        "in",
        eb.selectFrom("logs").select(selectChildAddressExpression.as("childAddress")).where("chainId", "=", factory.chainId).where("address", "=", factory.criteria.address).where("topic0", "=", factory.criteria.eventSelector)
      )
    );
    if (factory.criteria.fromAddress) {
      const fromAddress = Array.isArray(factory.criteria.fromAddress) && factory.criteria.fromAddress.length === 1 ? factory.criteria.fromAddress[0] : factory.criteria.fromAddress;
      if (Array.isArray(fromAddress)) {
        exprs.push(
          eb.or(fromAddress.map((a) => eb("callTraces.from", "=", a)))
        );
      } else {
        exprs.push(eb("callTraces.from", "=", fromAddress));
      }
    }
    exprs.push(
      eb.or(
        factory.criteria.functionSelectors.map(
          (fs) => eb("callTraces.functionSelector", "=", fs)
        )
      )
    );
    exprs.push(
      sql8`${sql8.ref("callTraces.error")} IS NULL`
    );
    if (factory.startBlock !== void 0 && factory.startBlock !== 0)
      exprs.push(
        eb("callTraces.blockNumber", ">=", encodeAsText(factory.startBlock))
      );
    if (factory.endBlock)
      exprs.push(
        eb("callTraces.blockNumber", "<=", encodeAsText(factory.endBlock))
      );
    return exprs;
  };
};
function buildFactoryChildAddressSelectExpression2({
  childAddressLocation
}) {
  if (childAddressLocation.startsWith("offset")) {
    const childAddressOffset = Number(childAddressLocation.substring(6));
    const start4 = 2 + 12 * 2 + childAddressOffset * 2 + 1;
    const length = 20 * 2;
    return sql8`'0x' || substring(data, ${start4}, ${length})`;
  } else {
    const start4 = 2 + 12 * 2 + 1;
    const length = 20 * 2;
    return sql8`'0x' || substring(${sql8.ref(
      childAddressLocation
    )}, ${start4}, ${length})`;
  }
}

// src/sync/events.ts
import {
  decodeEventLog,
  decodeFunctionData,
  decodeFunctionResult
} from "viem";
var decodeEvents = ({ common, sourceById }, rawEvents) => {
  const events = [];
  for (const event of rawEvents) {
    const source = sourceById[event.sourceId];
    switch (source.type) {
      case "block": {
        events.push({
          type: "block",
          chainId: event.chainId,
          sourceName: source.sourceName,
          event: {
            block: event.block
          },
          encodedCheckpoint: event.encodedCheckpoint
        });
        break;
      }
      case "callTrace":
      case "factoryCallTrace": {
        try {
          const abi = source.abi;
          const data = decodeFunctionData({
            abi,
            data: event.trace.input
          });
          const result = decodeFunctionResult({
            abi,
            data: event.trace.output,
            functionName: data.functionName
          });
          const selector = event.trace.input.slice(0, 10);
          if (source.abiFunctions.bySelector[selector] === void 0) {
            throw new Error();
          }
          const functionName = source.abiFunctions.bySelector[selector].safeName;
          events.push({
            type: "callTrace",
            chainId: event.chainId,
            contractName: source.contractName,
            functionName,
            event: {
              args: data.args,
              result,
              trace: event.trace,
              block: event.block,
              transaction: event.transaction,
              transactionReceipt: event.transactionReceipt
            },
            encodedCheckpoint: event.encodedCheckpoint
          });
        } catch (err) {
          common.logger.debug({
            service: "app",
            msg: `Unable to decode trace, skipping it. id: ${event.trace?.id}, input: ${event.trace?.input}, output: ${event.trace?.output}`
          });
        }
        break;
      }
      case "log":
      case "factoryLog": {
        try {
          const abi = source.abi;
          const decodedLog = decodeEventLog({
            abi,
            data: event.log.data,
            topics: event.log.topics
          });
          if (event.log.topics[0] === void 0 || source.abiEvents.bySelector[event.log.topics[0]] === void 0) {
            throw new Error();
          }
          const logEventName = source.abiEvents.bySelector[event.log.topics[0]].safeName;
          events.push({
            type: "log",
            chainId: event.chainId,
            contractName: source.contractName,
            logEventName,
            event: {
              args: decodedLog.args,
              log: event.log,
              block: event.block,
              transaction: event.transaction,
              transactionReceipt: event.transactionReceipt
            },
            encodedCheckpoint: event.encodedCheckpoint
          });
        } catch (err) {
          common.logger.debug({
            service: "app",
            msg: `Unable to decode log, skipping it. id: ${event.log?.id}, data: ${event.log?.data}, topics: ${event.log?.topics}`
          });
        }
        break;
      }
      default:
        never(source);
    }
  }
  return events;
};

// src/sync/index.ts
import {
  BlockNotFoundError as BlockNotFoundError2,
  TransactionReceiptNotFoundError,
  numberToHex as numberToHex2
} from "viem";

// src/utils/queue.ts
import PQueue from "p-queue";
function createQueue2({
  worker,
  options,
  onError,
  onIdle
}) {
  const queue = new PQueue(options);
  if (onIdle) {
    queue.on("idle", () => onIdle());
  }
  queue.addTask = async (task, taskOptions) => {
    const priority = taskOptions?.priority ?? 0;
    try {
      await queue.add(
        () => {
          return worker({
            task,
            queue
          });
        },
        {
          priority
        }
      );
    } catch (error_) {
      await onError?.({ error: error_, task, queue });
    }
  };
  return queue;
}

// src/sync-historical/service.ts
import Emittery from "emittery";
import {
  hexToNumber as hexToNumber5,
  numberToHex,
  toHex
} from "viem";

// src/sync-historical/validateHistoricalBlockRange.ts
function validateHistoricalBlockRange({
  startBlock,
  endBlock: userDefinedEndBlock,
  finalizedBlockNumber,
  latestBlockNumber
}) {
  if (startBlock > latestBlockNumber) {
    throw new Error(
      `Start block number (${startBlock}) cannot be greater than latest block number (${latestBlockNumber}).
         Are you sure the RPC endpoint is for the correct network?`
    );
  }
  if (startBlock > finalizedBlockNumber) {
    return {
      isHistoricalSyncRequired: false,
      startBlock,
      endBlock: userDefinedEndBlock
    };
  }
  if (userDefinedEndBlock) {
    if (userDefinedEndBlock < startBlock) {
      throw new Error(
        `End block number (${userDefinedEndBlock}) cannot be less than start block number (${startBlock}).
           Are you sure the RPC endpoint is for the correct network?`
      );
    }
    if (userDefinedEndBlock > latestBlockNumber) {
      throw new Error(
        `End block number (${userDefinedEndBlock}) cannot be greater than latest block number (${latestBlockNumber}).
           Are you sure the RPC endpoint is for the correct network?`
      );
    }
    if (userDefinedEndBlock > finalizedBlockNumber) {
      throw new Error(
        `End block number (${userDefinedEndBlock}) cannot be greater than finalized block number (${finalizedBlockNumber}).
           Are you sure the RPC endpoint is for the correct network?`
      );
    }
  }
  const resolvedEndBlock = userDefinedEndBlock ?? finalizedBlockNumber;
  return {
    isHistoricalSyncRequired: true,
    startBlock,
    endBlock: resolvedEndBlock
  };
}

// src/sync-historical/service.ts
var HISTORICAL_CHECKPOINT_EMIT_INTERVAL = 500;
var TRACE_FILTER_CHUNK_SIZE = 10;
var HistoricalSyncService = class extends Emittery {
  common;
  syncStore;
  network;
  requestQueue;
  sources;
  /**
   * Block progress trackers for each task type.
   */
  logFilterProgressTrackers = {};
  factoryChildAddressProgressTrackers = {};
  factoryLogFilterProgressTrackers = {};
  traceFilterProgressTrackers = {};
  factoryTraceFilterProgressTrackers = {};
  blockFilterProgressTrackers = {};
  blockProgressTracker = new BlockProgressTracker();
  /**
   * Functions registered by log filter + child contract tasks. These functions accept
   * a raw block object, get required data from it, then insert data and cache metadata
   * into the sync store. The keys of this object are used to keep track of which blocks
   * must be fetched.
   */
  blockCallbacks = {};
  /**
   * Block tasks have been added to the queue up to and including this block number.
   * Used alongside blockCallbacks to keep track of which block tasks to add to the queue.
   */
  blockTasksEnqueuedCheckpoint = 0;
  queue;
  /** If true, failed tasks should not log errors or be retried. */
  isShuttingDown = false;
  progressLogInterval;
  constructor({
    common,
    syncStore,
    network,
    requestQueue,
    sources = []
  }) {
    super();
    this.common = common;
    this.syncStore = syncStore;
    this.network = network;
    this.requestQueue = requestQueue;
    this.sources = sources;
    this.queue = this.buildQueue();
  }
  async setup({
    latestBlockNumber,
    finalizedBlockNumber
  }) {
    this.isShuttingDown = false;
    this.blockTasksEnqueuedCheckpoint = 0;
    await Promise.all(
      this.sources.map(async (source) => {
        const { isHistoricalSyncRequired, startBlock, endBlock } = validateHistoricalBlockRange({
          startBlock: source.startBlock,
          endBlock: source.endBlock,
          finalizedBlockNumber,
          latestBlockNumber
        });
        switch (source.type) {
          case "log":
            {
              if (!isHistoricalSyncRequired) {
                this.logFilterProgressTrackers[source.id] = new ProgressTracker({
                  target: [startBlock, finalizedBlockNumber],
                  completed: [[startBlock, finalizedBlockNumber]]
                });
                this.common.metrics.ponder_historical_total_blocks.set(
                  {
                    network: this.network.name,
                    source: source.contractName,
                    type: "log"
                  },
                  0
                );
                this.common.logger.warn({
                  service: "historical",
                  msg: `Skipped syncing '${this.network.name}' logs for '${source.contractName}' because the start block is not finalized`
                });
                return;
              }
              const completedLogFilterIntervals = await this.syncStore.getLogFilterIntervals({
                chainId: source.chainId,
                logFilter: source.criteria
              });
              const logFilterProgressTracker = new ProgressTracker({
                target: [startBlock, endBlock],
                completed: completedLogFilterIntervals
              });
              this.logFilterProgressTrackers[source.id] = logFilterProgressTracker;
              const requiredLogFilterIntervals = logFilterProgressTracker.getRequired();
              const logFilterTaskChunks = getChunks({
                intervals: requiredLogFilterIntervals,
                maxChunkSize: source.maxBlockRange ?? this.network.defaultMaxBlockRange
              });
              for (const [fromBlock, toBlock] of logFilterTaskChunks) {
                this.queue.addTask(
                  {
                    kind: "LOG_FILTER",
                    logFilter: source,
                    fromBlock,
                    toBlock
                  },
                  { priority: Number.MAX_SAFE_INTEGER - fromBlock }
                );
              }
              if (logFilterTaskChunks.length > 0) {
                const total = intervalSum(requiredLogFilterIntervals);
                this.common.logger.debug({
                  service: "historical",
                  msg: `Added '${this.network.name}' LOG_FILTER tasks for '${source.contractName}' over a ${total} block range`
                });
              }
              const targetBlockCount = endBlock - startBlock + 1;
              const cachedBlockCount = targetBlockCount - intervalSum(requiredLogFilterIntervals);
              this.common.metrics.ponder_historical_total_blocks.set(
                {
                  network: this.network.name,
                  source: source.contractName,
                  type: "log"
                },
                targetBlockCount
              );
              this.common.metrics.ponder_historical_cached_blocks.set(
                {
                  network: this.network.name,
                  source: source.contractName,
                  type: "log"
                },
                cachedBlockCount
              );
              this.common.logger.info({
                service: "historical",
                msg: `Started syncing '${this.network.name}' logs for '${source.contractName}' with ${formatPercentage(
                  Math.min(1, cachedBlockCount / (targetBlockCount || 1))
                )} cached`
              });
            }
            break;
          case "factoryLog":
            {
              if (!isHistoricalSyncRequired) {
                this.factoryChildAddressProgressTrackers[source.id] = new ProgressTracker({
                  target: [startBlock, finalizedBlockNumber],
                  completed: [[startBlock, finalizedBlockNumber]]
                });
                this.factoryLogFilterProgressTrackers[source.id] = new ProgressTracker({
                  target: [startBlock, finalizedBlockNumber],
                  completed: [[startBlock, finalizedBlockNumber]]
                });
                this.common.metrics.ponder_historical_total_blocks.set(
                  {
                    network: this.network.name,
                    source: source.contractName,
                    type: "log"
                  },
                  0
                );
                this.common.logger.warn({
                  service: "historical",
                  msg: `Skipped syncing '${this.network.name}' logs for '${source.contractName}' because the start block is not finalized`
                });
                return;
              }
              const completedFactoryChildAddressIntervals = await this.syncStore.getLogFilterIntervals({
                chainId: source.chainId,
                logFilter: {
                  address: source.criteria.address,
                  topics: [source.criteria.eventSelector],
                  includeTransactionReceipts: false
                }
              });
              const factoryChildAddressProgressTracker = new ProgressTracker({
                target: [startBlock, endBlock],
                completed: completedFactoryChildAddressIntervals
              });
              this.factoryChildAddressProgressTrackers[source.id] = factoryChildAddressProgressTracker;
              const requiredFactoryChildAddressIntervals = factoryChildAddressProgressTracker.getRequired();
              const factoryChildAddressTaskChunks = getChunks({
                intervals: requiredFactoryChildAddressIntervals,
                maxChunkSize: source.maxBlockRange ?? this.network.defaultMaxBlockRange
              });
              for (const [fromBlock, toBlock] of factoryChildAddressTaskChunks) {
                this.queue.addTask(
                  {
                    kind: "FACTORY_CHILD_ADDRESS",
                    factory: source,
                    fromBlock,
                    toBlock
                  },
                  { priority: Number.MAX_SAFE_INTEGER - fromBlock }
                );
              }
              if (factoryChildAddressTaskChunks.length > 0) {
                const total = intervalSum(requiredFactoryChildAddressIntervals);
                this.common.logger.debug({
                  service: "historical",
                  msg: `Added '${this.network.name}' FACTORY_CHILD_ADDRESS tasks for '${source.contractName}' over a ${total} block range`
                });
              }
              const targetFactoryChildAddressBlockCount = endBlock - startBlock + 1;
              const cachedFactoryChildAddressBlockCount = targetFactoryChildAddressBlockCount - intervalSum(requiredFactoryChildAddressIntervals);
              this.common.metrics.ponder_historical_total_blocks.set(
                {
                  network: this.network.name,
                  source: `${source.contractName}_factory`,
                  type: "log"
                },
                targetFactoryChildAddressBlockCount
              );
              this.common.metrics.ponder_historical_cached_blocks.set(
                {
                  network: this.network.name,
                  source: `${source.contractName}_factory`,
                  type: "log"
                },
                cachedFactoryChildAddressBlockCount
              );
              const completedFactoryLogFilterIntervals = await this.syncStore.getFactoryLogFilterIntervals({
                chainId: source.chainId,
                factory: source.criteria
              });
              const factoryLogFilterProgressTracker = new ProgressTracker({
                target: [startBlock, endBlock],
                completed: completedFactoryLogFilterIntervals
              });
              this.factoryLogFilterProgressTrackers[source.id] = factoryLogFilterProgressTracker;
              const requiredFactoryLogFilterIntervals = factoryLogFilterProgressTracker.getRequired();
              const missingFactoryLogFilterIntervals = intervalDifference(
                requiredFactoryLogFilterIntervals,
                requiredFactoryChildAddressIntervals
              );
              const missingFactoryLogFilterTaskChunks = getChunks({
                intervals: missingFactoryLogFilterIntervals,
                maxChunkSize: source.maxBlockRange ?? this.network.defaultMaxBlockRange
              });
              for (const [
                fromBlock,
                toBlock
              ] of missingFactoryLogFilterTaskChunks) {
                this.queue.addTask(
                  {
                    kind: "FACTORY_LOG_FILTER",
                    factoryLogFilter: source,
                    fromBlock,
                    toBlock
                  },
                  { priority: Number.MAX_SAFE_INTEGER - fromBlock }
                );
              }
              if (missingFactoryLogFilterTaskChunks.length > 0) {
                const total = intervalSum(missingFactoryLogFilterIntervals);
                this.common.logger.debug({
                  service: "historical",
                  msg: `Added '${this.network.name}' FACTORY_LOG_FILTER tasks for '${source.contractName}' over a ${total} block range`
                });
              }
              const targetFactoryLogFilterBlockCount = endBlock - startBlock + 1;
              const cachedFactoryLogFilterBlockCount = targetFactoryLogFilterBlockCount - intervalSum(requiredFactoryLogFilterIntervals);
              this.common.metrics.ponder_historical_total_blocks.set(
                {
                  network: this.network.name,
                  source: source.contractName,
                  type: "log"
                },
                targetFactoryLogFilterBlockCount
              );
              this.common.metrics.ponder_historical_cached_blocks.set(
                {
                  network: this.network.name,
                  source: source.contractName,
                  type: "log"
                },
                cachedFactoryLogFilterBlockCount
              );
              const cacheRate = Math.min(
                1,
                cachedFactoryLogFilterBlockCount / (targetFactoryLogFilterBlockCount || 1)
              );
              this.common.logger.info({
                service: "historical",
                msg: `Started syncing '${this.network.name}' logs for '${source.contractName}' with ${formatPercentage(cacheRate)} cached`
              });
            }
            break;
          case "callTrace":
            {
              if (!isHistoricalSyncRequired) {
                this.traceFilterProgressTrackers[source.id] = new ProgressTracker(
                  {
                    target: [startBlock, finalizedBlockNumber],
                    completed: [[startBlock, finalizedBlockNumber]]
                  }
                );
                this.common.metrics.ponder_historical_total_blocks.set(
                  {
                    network: this.network.name,
                    source: source.contractName,
                    type: "trace"
                  },
                  0
                );
                this.common.logger.warn({
                  service: "historical",
                  msg: `Skipped syncing '${this.network.name}' call traces for '${source.contractName}' because the start block is not finalized`
                });
                return;
              }
              const completedTraceFilterIntervals = await this.syncStore.getTraceFilterIntervals({
                chainId: source.chainId,
                traceFilter: source.criteria
              });
              const traceFilterProgressTracker = new ProgressTracker({
                target: [startBlock, endBlock],
                completed: completedTraceFilterIntervals
              });
              this.traceFilterProgressTrackers[source.id] = traceFilterProgressTracker;
              const requiredTraceFilterIntervals = traceFilterProgressTracker.getRequired();
              const traceFilterTaskChunks = getChunks({
                intervals: requiredTraceFilterIntervals,
                maxChunkSize: TRACE_FILTER_CHUNK_SIZE
              });
              for (const [fromBlock, toBlock] of traceFilterTaskChunks) {
                this.queue.addTask(
                  {
                    kind: "TRACE_FILTER",
                    traceFilter: source,
                    fromBlock,
                    toBlock
                  },
                  { priority: Number.MAX_SAFE_INTEGER - fromBlock }
                );
              }
              if (traceFilterTaskChunks.length > 0) {
                const total = intervalSum(requiredTraceFilterIntervals);
                this.common.logger.debug({
                  service: "historical",
                  msg: `Added '${this.network.name}' TRACE_FILTER tasks for '${source.contractName}' over a ${total} block range`
                });
              }
              const targetBlockCount = endBlock - startBlock + 1;
              const cachedBlockCount = targetBlockCount - intervalSum(requiredTraceFilterIntervals);
              this.common.metrics.ponder_historical_total_blocks.set(
                {
                  network: this.network.name,
                  source: source.contractName,
                  type: "trace"
                },
                targetBlockCount
              );
              this.common.metrics.ponder_historical_cached_blocks.set(
                {
                  network: this.network.name,
                  source: source.contractName,
                  type: "trace"
                },
                cachedBlockCount
              );
              this.common.logger.info({
                service: "historical",
                msg: `Started syncing '${this.network.name}' call traces for '${source.contractName}' with ${formatPercentage(
                  Math.min(1, cachedBlockCount / (targetBlockCount || 1))
                )} cached`
              });
            }
            break;
          case "factoryCallTrace":
            {
              if (!isHistoricalSyncRequired) {
                this.factoryChildAddressProgressTrackers[source.id] = new ProgressTracker({
                  target: [startBlock, finalizedBlockNumber],
                  completed: [[startBlock, finalizedBlockNumber]]
                });
                this.factoryTraceFilterProgressTrackers[source.id] = new ProgressTracker({
                  target: [startBlock, finalizedBlockNumber],
                  completed: [[startBlock, finalizedBlockNumber]]
                });
                this.common.metrics.ponder_historical_total_blocks.set(
                  {
                    network: this.network.name,
                    source: source.contractName,
                    type: "trace"
                  },
                  0
                );
                this.common.logger.warn({
                  service: "historical",
                  msg: `Skipped syncing '${this.network.name}' call traces for '${source.contractName}' because the start block is not finalized`
                });
                return;
              }
              const completedFactoryChildAddressIntervals = await this.syncStore.getLogFilterIntervals({
                chainId: source.chainId,
                logFilter: {
                  address: source.criteria.address,
                  topics: [source.criteria.eventSelector],
                  includeTransactionReceipts: false
                }
              });
              const factoryChildAddressProgressTracker = new ProgressTracker({
                target: [startBlock, endBlock],
                completed: completedFactoryChildAddressIntervals
              });
              this.factoryChildAddressProgressTrackers[source.id] = factoryChildAddressProgressTracker;
              const requiredFactoryChildAddressIntervals = factoryChildAddressProgressTracker.getRequired();
              const factoryChildAddressTaskChunks = getChunks({
                intervals: requiredFactoryChildAddressIntervals,
                maxChunkSize: source.maxBlockRange ?? this.network.defaultMaxBlockRange
              });
              for (const [fromBlock, toBlock] of factoryChildAddressTaskChunks) {
                this.queue.addTask(
                  {
                    kind: "FACTORY_CHILD_ADDRESS",
                    factory: source,
                    fromBlock,
                    toBlock
                  },
                  { priority: Number.MAX_SAFE_INTEGER - fromBlock }
                );
              }
              if (factoryChildAddressTaskChunks.length > 0) {
                const total = intervalSum(requiredFactoryChildAddressIntervals);
                this.common.logger.debug({
                  service: "historical",
                  msg: `Added '${this.network.name}' FACTORY_CHILD_ADDRESS tasks for '${source.contractName}' over a ${total} block range`
                });
              }
              const targetFactoryChildAddressBlockCount = endBlock - startBlock + 1;
              const cachedFactoryChildAddressBlockCount = targetFactoryChildAddressBlockCount - intervalSum(requiredFactoryChildAddressIntervals);
              this.common.metrics.ponder_historical_total_blocks.set(
                {
                  network: this.network.name,
                  source: `${source.contractName}_factory`,
                  type: "trace"
                },
                targetFactoryChildAddressBlockCount
              );
              this.common.metrics.ponder_historical_cached_blocks.set(
                {
                  network: this.network.name,
                  source: `${source.contractName}_factory`,
                  type: "trace"
                },
                cachedFactoryChildAddressBlockCount
              );
              const completedFactoryTraceFilterIntervals = await this.syncStore.getFactoryTraceFilterIntervals({
                chainId: source.chainId,
                factory: source.criteria
              });
              const factoryTraceFilterProgressTracker = new ProgressTracker({
                target: [startBlock, endBlock],
                completed: completedFactoryTraceFilterIntervals
              });
              this.factoryTraceFilterProgressTrackers[source.id] = factoryTraceFilterProgressTracker;
              const requiredFactoryTraceFilterIntervals = factoryTraceFilterProgressTracker.getRequired();
              const missingFactoryTraceFilterIntervals = intervalDifference(
                requiredFactoryTraceFilterIntervals,
                requiredFactoryChildAddressIntervals
              );
              const missingFactoryTraceFilterTaskChunks = getChunks({
                intervals: missingFactoryTraceFilterIntervals,
                maxChunkSize: TRACE_FILTER_CHUNK_SIZE
              });
              for (const [
                fromBlock,
                toBlock
              ] of missingFactoryTraceFilterTaskChunks) {
                this.queue.addTask(
                  {
                    kind: "FACTORY_TRACE_FILTER",
                    factoryTraceFilter: source,
                    fromBlock,
                    toBlock
                  },
                  { priority: Number.MAX_SAFE_INTEGER - fromBlock }
                );
              }
              if (missingFactoryTraceFilterTaskChunks.length > 0) {
                const total = intervalSum(missingFactoryTraceFilterIntervals);
                this.common.logger.debug({
                  service: "historical",
                  msg: `Added '${this.network.name}' FACTORY_TRACE_FILTER tasks for '${source.contractName}' over a ${total} block range`
                });
              }
              const targetFactoryTraceFilterBlockCount = endBlock - startBlock + 1;
              const cachedFactoryTraceFilterBlockCount = targetFactoryTraceFilterBlockCount - intervalSum(requiredFactoryTraceFilterIntervals);
              this.common.metrics.ponder_historical_total_blocks.set(
                {
                  network: this.network.name,
                  source: source.contractName,
                  type: "trace"
                },
                targetFactoryTraceFilterBlockCount
              );
              this.common.metrics.ponder_historical_cached_blocks.set(
                {
                  network: this.network.name,
                  source: source.contractName,
                  type: "trace"
                },
                cachedFactoryTraceFilterBlockCount
              );
              const cacheRate = Math.min(
                1,
                cachedFactoryTraceFilterBlockCount / (targetFactoryTraceFilterBlockCount || 1)
              );
              this.common.logger.info({
                service: "historical",
                msg: `Started syncing '${this.network.name}' call traces for '${source.contractName}' with ${formatPercentage(cacheRate)} cached`
              });
            }
            break;
          case "block":
            {
              if (!isHistoricalSyncRequired) {
                this.blockFilterProgressTrackers[source.id] = new ProgressTracker(
                  {
                    target: [startBlock, finalizedBlockNumber],
                    completed: [[startBlock, finalizedBlockNumber]]
                  }
                );
                this.common.metrics.ponder_historical_total_blocks.set(
                  {
                    network: this.network.name,
                    source: source.sourceName,
                    type: "block"
                  },
                  0
                );
                this.common.logger.warn({
                  service: "historical",
                  msg: `Skipped syncing '${this.network.name}' blocks for '${source.sourceName}' because the start block is not finalized`
                });
                return;
              }
              const completedBlockFilterIntervals = await this.syncStore.getBlockFilterIntervals({
                chainId: source.chainId,
                blockFilter: source.criteria
              });
              const blockFilterProgressTracker = new ProgressTracker({
                target: [startBlock, endBlock],
                completed: completedBlockFilterIntervals
              });
              this.blockFilterProgressTrackers[source.id] = blockFilterProgressTracker;
              const requiredBlockFilterIntervals = blockFilterProgressTracker.getRequired();
              const blockFilterTaskChunks = getChunks({
                intervals: requiredBlockFilterIntervals,
                maxChunkSize: this.network.defaultMaxBlockRange
              });
              for (const [fromBlock, toBlock] of blockFilterTaskChunks) {
                this.queue.addTask(
                  {
                    kind: "BLOCK_FILTER",
                    blockFilter: source,
                    fromBlock,
                    toBlock
                  },
                  { priority: Number.MAX_SAFE_INTEGER - fromBlock }
                );
              }
              if (blockFilterTaskChunks.length > 0) {
                const total = intervalSum(requiredBlockFilterIntervals);
                this.common.logger.debug({
                  service: "historical",
                  msg: `Added '${this.network.name}' BLOCK_FILTER tasks for '${source.sourceName}' over a ${total} block range`
                });
              }
              const targetBlockCount = endBlock - startBlock + 1;
              const cachedBlockCount = targetBlockCount - intervalSum(requiredBlockFilterIntervals);
              this.common.metrics.ponder_historical_total_blocks.set(
                {
                  network: this.network.name,
                  source: source.sourceName,
                  type: "block"
                },
                targetBlockCount
              );
              this.common.metrics.ponder_historical_cached_blocks.set(
                {
                  network: this.network.name,
                  source: source.sourceName,
                  type: "block"
                },
                cachedBlockCount
              );
              this.common.logger.info({
                service: "historical",
                msg: `Started syncing '${this.network.name}' blocks for '${source.sourceName}' with ${formatPercentage(
                  Math.min(1, cachedBlockCount / (targetBlockCount || 1))
                )} cached`
              });
            }
            break;
          default:
            never(source);
        }
      })
    );
  }
  start() {
    this.common.metrics.ponder_historical_start_timestamp.set(Date.now());
    this.progressLogInterval = setInterval(async () => {
      const historical = await getHistoricalSyncProgress(this.common.metrics);
      historical.sources.forEach(
        ({ networkName, sourceName, progress, eta }) => {
          if (progress === 1 || networkName !== this.network.name)
            return;
          this.common.logger.info({
            service: "historical",
            msg: `Syncing '${this.network.name}' for '${sourceName}' with ${formatPercentage(
              progress ?? 0
            )} complete${eta !== void 0 ? ` and ~${formatEta(eta)} remaining` : ""}`
          });
        }
      );
    }, 1e4);
    if (this.queue.size === 0) {
      clearInterval(this.progressLogInterval);
      this.common.logger.info({
        service: "historical",
        msg: `Finished '${this.network.name}' historical sync`
      });
      this.emit("syncComplete");
    }
    this.queue.start();
  }
  kill = () => {
    this.isShuttingDown = true;
    clearInterval(this.progressLogInterval);
    this.queue.pause();
    this.queue.clear();
    this.common.logger.debug({
      service: "historical",
      msg: `Killed '${this.network.name}' historical sync`
    });
  };
  onIdle = () => new Promise(
    (resolve2) => setImmediate(() => this.queue.onIdle().then(resolve2))
  );
  buildQueue = () => {
    const worker = async ({ task, queue: queue2 }) => {
      switch (task.kind) {
        case "FACTORY_CHILD_ADDRESS": {
          await this.factoryChildAddressTaskWorker(task);
          break;
        }
        case "LOG_FILTER": {
          await this.logFilterTaskWorker(task);
          break;
        }
        case "FACTORY_LOG_FILTER": {
          await this.factoryLogFilterTaskWorker(task);
          break;
        }
        case "TRACE_FILTER": {
          await this.traceFilterTaskWorker(task);
          break;
        }
        case "FACTORY_TRACE_FILTER": {
          await this.factoryTraceFilterTaskWorker(task);
          break;
        }
        case "BLOCK_FILTER": {
          await this.blockFilterTaskWorker(task);
          break;
        }
        case "BLOCK": {
          await this.blockTaskWorker(task);
          break;
        }
        default:
          never(task);
      }
      if (queue2.size > 0 || queue2.pending > 1)
        return;
      if (this.isShuttingDown)
        return;
      clearInterval(this.progressLogInterval);
      const startTimestamp = (await this.common.metrics.ponder_historical_start_timestamp.get()).values?.[0]?.value ?? Date.now();
      const duration = Date.now() - startTimestamp;
      this.common.logger.info({
        service: "historical",
        msg: `Finished '${this.network.name}' historical sync in ${formatEta(
          duration
        )}`
      });
      this.emit("syncComplete");
    };
    const queue = createQueue2({
      worker,
      options: {
        concurrency: this.network.maxHistoricalTaskConcurrency,
        autoStart: false
      },
      onError: ({ error, task, queue: queue2 }) => {
        if (this.isShuttingDown)
          return;
        switch (task.kind) {
          case "FACTORY_CHILD_ADDRESS": {
            this.common.logger.warn({
              service: "historical",
              msg: `Failed to sync '${this.network.name}' child address logs for '${task.factory.contractName}' from block ${task.fromBlock} to ${task.toBlock} with error: ${error.message}`
            });
            const priority = Number.MAX_SAFE_INTEGER - task.fromBlock;
            queue2.addTask({ ...task }, { priority });
            break;
          }
          case "LOG_FILTER": {
            this.common.logger.warn({
              service: "historical",
              msg: `Failed to sync '${this.network.name}' logs for '${task.logFilter.contractName}' from block ${task.fromBlock} to ${task.toBlock} with error: ${error.message}`
            });
            const priority = Number.MAX_SAFE_INTEGER - task.fromBlock;
            queue2.addTask({ ...task }, { priority });
            break;
          }
          case "FACTORY_LOG_FILTER": {
            this.common.logger.warn({
              service: "historical",
              msg: `Failed to sync '${this.network.name}' logs for '${task.factoryLogFilter.contractName}' from block ${task.fromBlock} to ${task.toBlock} with error: ${error.message}`
            });
            const priority = Number.MAX_SAFE_INTEGER - task.fromBlock;
            queue2.addTask({ ...task }, { priority });
            break;
          }
          case "TRACE_FILTER": {
            this.common.logger.warn({
              service: "historical",
              msg: `Failed to sync '${this.network.name}' call traces for '${task.traceFilter.contractName}' from block ${task.fromBlock} to ${task.toBlock} with error: ${error.message}`
            });
            const priority = Number.MAX_SAFE_INTEGER - task.fromBlock;
            queue2.addTask({ ...task }, { priority });
            break;
          }
          case "FACTORY_TRACE_FILTER": {
            this.common.logger.warn({
              service: "historical",
              msg: `Failed to sync '${this.network.name}' call traces for '${task.factoryTraceFilter.contractName}' from block ${task.fromBlock} to ${task.toBlock} with error: ${error.message}`
            });
            const priority = Number.MAX_SAFE_INTEGER - task.fromBlock;
            queue2.addTask({ ...task }, { priority });
            break;
          }
          case "BLOCK_FILTER": {
            this.common.logger.warn({
              service: "historical",
              msg: `Failed to sync '${this.network.name}' blocks for '${task.blockFilter.sourceName}' from block ${task.fromBlock} to ${task.toBlock} with error: ${error.message}`
            });
            const priority = Number.MAX_SAFE_INTEGER - task.fromBlock;
            queue2.addTask({ ...task }, { priority });
            break;
          }
          case "BLOCK": {
            this.common.logger.warn({
              service: "historical",
              msg: `Failed to sync '${this.network.name}' block ${task.blockNumber} with error: ${error.message}`
            });
            const priority = Number.MAX_SAFE_INTEGER - task.blockNumber;
            queue2.addTask({ ...task }, { priority });
            break;
          }
          default:
            never(task);
        }
        this.common.logger.warn({
          service: "historical",
          msg: `Retrying failed '${this.network.name}' sync task`
        });
      }
    });
    return queue;
  };
  logFilterTaskWorker = async ({
    logFilter,
    fromBlock,
    toBlock
  }) => {
    this.common.logger.trace({
      service: "historical",
      msg: `Starting '${this.network.name}' LOG_FILTER task for '${logFilter.contractName}' from block ${fromBlock} to ${toBlock}`
    });
    const logs = await _eth_getLogs(
      { requestQueue: this.requestQueue },
      {
        address: logFilter.criteria.address,
        topics: logFilter.criteria.topics,
        fromBlock: toHex(fromBlock),
        toBlock: toHex(toBlock)
      }
    );
    const logIntervals = this.buildLogIntervals({ fromBlock, toBlock, logs });
    for (const logInterval of logIntervals) {
      const { startBlock, endBlock } = logInterval;
      if (this.blockCallbacks[endBlock] === void 0)
        this.blockCallbacks[endBlock] = [];
      this.blockCallbacks[endBlock].push(async (block) => {
        const { transactionHashes } = logInterval;
        const transactions = block.transactions.filter(
          (tx) => transactionHashes.has(tx.hash)
        );
        const transactionReceipts = logFilter.criteria.includeTransactionReceipts === true ? await Promise.all(
          transactions.map(
            (tx) => _eth_getTransactionReceipt(
              { requestQueue: this.requestQueue },
              { hash: tx.hash }
            )
          )
        ) : [];
        await this.syncStore.insertLogFilterInterval({
          logs: logInterval.logs,
          interval: {
            startBlock: BigInt(logInterval.startBlock),
            endBlock: BigInt(logInterval.endBlock)
          },
          logFilter: logFilter.criteria,
          chainId: logFilter.chainId,
          block,
          transactions,
          transactionReceipts
        });
        this.common.metrics.ponder_historical_completed_blocks.inc(
          {
            network: this.network.name,
            source: logFilter.contractName,
            type: "log"
          },
          endBlock - startBlock + 1
        );
      });
    }
    this.logFilterProgressTrackers[logFilter.id].addCompletedInterval([
      fromBlock,
      toBlock
    ]);
    this.enqueueBlockTasks();
    this.common.logger.trace({
      service: "historical",
      msg: `Completed '${this.network.name}' LOG_FILTER task for '${logFilter.contractName}' from block ${fromBlock} to ${toBlock}`
    });
  };
  factoryLogFilterTaskWorker = async ({
    factoryLogFilter,
    fromBlock,
    toBlock
  }) => {
    this.common.logger.trace({
      service: "historical",
      msg: `Starting '${this.network.name}' FACTORY_LOG_FILTER task for '${factoryLogFilter.contractName}' from block ${fromBlock} to ${toBlock}`
    });
    const iterator = this.syncStore.getFactoryChildAddresses({
      chainId: factoryLogFilter.chainId,
      factory: factoryLogFilter.criteria,
      fromBlock: BigInt(factoryLogFilter.startBlock),
      toBlock: BigInt(toBlock)
    });
    const logs = [];
    for await (const childContractAddressBatch of iterator) {
      const _logs = await _eth_getLogs(
        { requestQueue: this.requestQueue },
        {
          address: childContractAddressBatch,
          topics: factoryLogFilter.criteria.topics,
          fromBlock: numberToHex(fromBlock),
          toBlock: numberToHex(toBlock)
        }
      );
      logs.push(..._logs);
    }
    const logIntervals = this.buildLogIntervals({ fromBlock, toBlock, logs });
    for (const logInterval of logIntervals) {
      const { startBlock, endBlock, logs: logs2, transactionHashes } = logInterval;
      if (this.blockCallbacks[endBlock] === void 0)
        this.blockCallbacks[endBlock] = [];
      this.blockCallbacks[endBlock].push(async (block) => {
        const transactions = block.transactions.filter(
          (tx) => transactionHashes.has(tx.hash)
        );
        const transactionReceipts = factoryLogFilter.criteria.includeTransactionReceipts === true ? await Promise.all(
          transactions.map(
            (tx) => _eth_getTransactionReceipt(
              { requestQueue: this.requestQueue },
              { hash: tx.hash }
            )
          )
        ) : [];
        await this.syncStore.insertFactoryLogFilterInterval({
          chainId: factoryLogFilter.chainId,
          factory: factoryLogFilter.criteria,
          block,
          transactions,
          transactionReceipts,
          logs: logs2,
          interval: {
            startBlock: BigInt(startBlock),
            endBlock: BigInt(endBlock)
          }
        });
        this.common.metrics.ponder_historical_completed_blocks.inc(
          {
            network: this.network.name,
            source: factoryLogFilter.contractName,
            type: "log"
          },
          endBlock - startBlock + 1
        );
      });
    }
    this.factoryLogFilterProgressTrackers[factoryLogFilter.id].addCompletedInterval([fromBlock, toBlock]);
    this.enqueueBlockTasks();
    this.common.logger.trace({
      service: "historical",
      msg: `Completed '${this.network.name}' FACTORY_LOG_FILTER task for '${factoryLogFilter.contractName}' from block ${fromBlock} to ${toBlock}`
    });
  };
  factoryChildAddressTaskWorker = async ({
    factory,
    fromBlock,
    toBlock
  }) => {
    this.common.logger.trace({
      service: "historical",
      msg: `Starting '${this.network.name}' FACTORY_CHILD_ADDRESS task for '${factory.contractName}' from block ${fromBlock} to ${toBlock}`
    });
    const logs = await _eth_getLogs(
      { requestQueue: this.requestQueue },
      {
        address: factory.criteria.address,
        topics: [factory.criteria.eventSelector],
        fromBlock: toHex(fromBlock),
        toBlock: toHex(toBlock)
      }
    );
    await this.syncStore.insertFactoryChildAddressLogs({
      chainId: factory.chainId,
      logs
    });
    const logIntervals = this.buildLogIntervals({ fromBlock, toBlock, logs });
    for (const logInterval of logIntervals) {
      if (this.blockCallbacks[logInterval.endBlock] === void 0)
        this.blockCallbacks[logInterval.endBlock] = [];
      this.blockCallbacks[logInterval.endBlock].push(async (block) => {
        const { transactionHashes } = logInterval;
        const transactions = block.transactions.filter(
          (tx) => transactionHashes.has(tx.hash)
        );
        await this.syncStore.insertLogFilterInterval({
          logs: logInterval.logs,
          interval: {
            startBlock: BigInt(logInterval.startBlock),
            endBlock: BigInt(logInterval.endBlock)
          },
          logFilter: {
            address: factory.criteria.address,
            topics: [factory.criteria.eventSelector],
            includeTransactionReceipts: false
          },
          chainId: factory.chainId,
          block,
          transactions,
          transactionReceipts: []
        });
      });
    }
    const { isUpdated, prevCheckpoint, newCheckpoint } = this.factoryChildAddressProgressTrackers[factory.id].addCompletedInterval(
      [fromBlock, toBlock]
    );
    switch (factory.type) {
      case "factoryLog": {
        if (isUpdated) {
          const requiredIntervals = intervalIntersection(
            [[prevCheckpoint + 1, newCheckpoint]],
            this.factoryLogFilterProgressTrackers[factory.id].getRequired()
          );
          const factoryLogFilterChunks = getChunks({
            intervals: requiredIntervals,
            maxChunkSize: factory.maxBlockRange ?? this.network.defaultMaxBlockRange
          });
          for (const [fromBlock2, toBlock2] of factoryLogFilterChunks) {
            this.queue.addTask(
              {
                kind: "FACTORY_LOG_FILTER",
                factoryLogFilter: factory,
                fromBlock: fromBlock2,
                toBlock: toBlock2
              },
              { priority: Number.MAX_SAFE_INTEGER - fromBlock2 }
            );
          }
        }
        this.common.metrics.ponder_historical_completed_blocks.inc(
          {
            network: this.network.name,
            source: `${factory.contractName}_factory`,
            type: "log"
          },
          toBlock - fromBlock + 1
        );
        break;
      }
      case "factoryCallTrace": {
        if (isUpdated) {
          const requiredIntervals = intervalIntersection(
            [[prevCheckpoint + 1, newCheckpoint]],
            this.factoryTraceFilterProgressTrackers[factory.id].getRequired()
          );
          const factoryTraceFilterChunks = getChunks({
            intervals: requiredIntervals,
            maxChunkSize: TRACE_FILTER_CHUNK_SIZE
          });
          for (const [fromBlock2, toBlock2] of factoryTraceFilterChunks) {
            this.queue.addTask(
              {
                kind: "FACTORY_TRACE_FILTER",
                factoryTraceFilter: factory,
                fromBlock: fromBlock2,
                toBlock: toBlock2
              },
              { priority: Number.MAX_SAFE_INTEGER - fromBlock2 }
            );
          }
        }
        this.common.metrics.ponder_historical_completed_blocks.inc(
          {
            network: this.network.name,
            source: `${factory.contractName}_factory`,
            type: "trace"
          },
          toBlock - fromBlock + 1
        );
        break;
      }
      default:
        never(factory);
    }
    this.common.logger.trace({
      service: "historical",
      msg: `Completed '${this.network.name}' FACTORY_CHILD_ADDRESS task for '${factory.contractName}' from block ${fromBlock} to ${toBlock}`
    });
  };
  blockFilterTaskWorker = async ({
    blockFilter,
    fromBlock,
    toBlock
  }) => {
    this.common.logger.trace({
      service: "historical",
      msg: `Starting '${this.network.name}' BLOCK_FILTER task for '${blockFilter.sourceName}' from block ${fromBlock} to ${toBlock}`
    });
    const baseOffset = (fromBlock - blockFilter.criteria.offset) % blockFilter.criteria.interval;
    const offset = baseOffset === 0 ? 0 : blockFilter.criteria.interval - baseOffset;
    const requiredBlocks = [];
    for (let blockNumber = fromBlock + offset; blockNumber <= toBlock; blockNumber += blockFilter.criteria.interval) {
      requiredBlocks.push(blockNumber);
    }
    if (!requiredBlocks.includes(toBlock)) {
      requiredBlocks.push(toBlock);
    }
    let prevBlockNumber = fromBlock;
    for (const blockNumber of requiredBlocks) {
      const hasBlock = await this.syncStore.getBlock({
        chainId: blockFilter.chainId,
        blockNumber
      });
      const startBlock = prevBlockNumber;
      const endBlock = blockNumber;
      if (hasBlock) {
        await this.syncStore.insertBlockFilterInterval({
          chainId: blockFilter.chainId,
          blockFilter: blockFilter.criteria,
          interval: {
            startBlock: BigInt(startBlock),
            endBlock: BigInt(endBlock)
          }
        });
        this.common.metrics.ponder_historical_completed_blocks.inc(
          {
            network: this.network.name,
            source: blockFilter.sourceName,
            type: "block"
          },
          endBlock - startBlock + 1
        );
      } else {
        if (this.blockCallbacks[blockNumber] === void 0)
          this.blockCallbacks[blockNumber] = [];
        this.blockCallbacks[blockNumber].push(async (block) => {
          await this.syncStore.insertBlockFilterInterval({
            chainId: blockFilter.chainId,
            blockFilter: blockFilter.criteria,
            block,
            interval: {
              startBlock: BigInt(startBlock),
              endBlock: BigInt(endBlock)
            }
          });
          this.common.metrics.ponder_historical_completed_blocks.inc(
            {
              network: this.network.name,
              source: blockFilter.sourceName,
              type: "block"
            },
            endBlock - startBlock + 1
          );
        });
      }
      prevBlockNumber = blockNumber + 1;
    }
    this.blockFilterProgressTrackers[blockFilter.id].addCompletedInterval([
      fromBlock,
      toBlock
    ]);
    this.enqueueBlockTasks();
    this.common.logger.trace({
      service: "historical",
      msg: `Completed '${this.network.name}' BLOCK_FILTER task for '${blockFilter.sourceName}' from block ${fromBlock} to ${toBlock}`
    });
  };
  traceFilterTaskWorker = async ({
    traceFilter,
    fromBlock,
    toBlock
  }) => {
    this.common.logger.trace({
      service: "historical",
      msg: `Starting '${this.network.name}' TRACE_FILTER task for '${traceFilter.contractName}' from block ${fromBlock} to ${toBlock}`
    });
    const traces = await _trace_filter(
      { requestQueue: this.requestQueue },
      {
        fromBlock,
        toBlock,
        fromAddress: traceFilter.criteria.fromAddress,
        toAddress: traceFilter.criteria.toAddress
      }
    ).then(
      (traces2) => traces2.filter((t) => t.type === "call")
    );
    const transactionReceipts = await Promise.all(
      dedupe(traces.map((t) => t.transactionHash)).map(
        (hash2) => _eth_getTransactionReceipt(
          {
            requestQueue: this.requestQueue
          },
          {
            hash: hash2
          }
        )
      )
    );
    const revertedTransactions = /* @__PURE__ */ new Set();
    for (const receipt of transactionReceipts) {
      if (receipt.status === "0x0") {
        revertedTransactions.add(receipt.transactionHash);
      }
    }
    const persistentTraces = traces.filter(
      (trace) => revertedTransactions.has(trace.transactionHash) === false
    );
    const tracesByBlockNumber = {};
    const txHashesByBlockNumber = {};
    for (const trace of persistentTraces) {
      const blockNumber = hexToNumber5(trace.blockNumber);
      if (tracesByBlockNumber[blockNumber] === void 0) {
        tracesByBlockNumber[blockNumber] = [];
      }
      if (txHashesByBlockNumber[blockNumber] === void 0) {
        txHashesByBlockNumber[blockNumber] = /* @__PURE__ */ new Set();
      }
      tracesByBlockNumber[blockNumber].push(trace);
      txHashesByBlockNumber[blockNumber].add(trace.transactionHash);
    }
    const requiredBlocks = Object.keys(txHashesByBlockNumber).map(Number).sort((a, b) => a - b);
    if (!requiredBlocks.includes(toBlock)) {
      requiredBlocks.push(toBlock);
    }
    const traceIntervals = [];
    let prev = fromBlock;
    for (const blockNumber of requiredBlocks) {
      traceIntervals.push({
        startBlock: prev,
        endBlock: blockNumber,
        traces: tracesByBlockNumber[blockNumber] ?? [],
        transactionHashes: txHashesByBlockNumber[blockNumber] ?? /* @__PURE__ */ new Set()
      });
      prev = blockNumber + 1;
    }
    for (const traceInterval of traceIntervals) {
      const { startBlock, endBlock } = traceInterval;
      if (this.blockCallbacks[endBlock] === void 0)
        this.blockCallbacks[endBlock] = [];
      this.blockCallbacks[endBlock].push(async (block) => {
        const { transactionHashes } = traceInterval;
        const transactions = block.transactions.filter(
          (tx) => transactionHashes.has(tx.hash)
        );
        await this.syncStore.insertTraceFilterInterval({
          traces: traceInterval.traces,
          interval: {
            startBlock: BigInt(startBlock),
            endBlock: BigInt(endBlock)
          },
          traceFilter: traceFilter.criteria,
          chainId: traceFilter.chainId,
          block,
          transactions,
          // trace intervals always include transaction receipts because
          // the transactions receipts are already needed determine the
          // persistence of a trace.
          transactionReceipts: transactionReceipts.filter(
            (txr) => transactionHashes.has(txr.transactionHash)
          )
        });
        this.common.metrics.ponder_historical_completed_blocks.inc(
          {
            network: this.network.name,
            source: traceFilter.contractName,
            type: "trace"
          },
          endBlock - startBlock + 1
        );
      });
    }
    this.traceFilterProgressTrackers[traceFilter.id].addCompletedInterval([
      fromBlock,
      toBlock
    ]);
    this.enqueueBlockTasks();
    this.common.logger.trace({
      service: "historical",
      msg: `Completed '${this.network.name}' TRACE_FILTER task for '${traceFilter.contractName}' from block ${fromBlock} to ${toBlock}`
    });
  };
  factoryTraceFilterTaskWorker = async ({
    factoryTraceFilter,
    fromBlock,
    toBlock
  }) => {
    this.common.logger.trace({
      service: "historical",
      msg: `Starting '${this.network.name}' FACTORY_TRACE_FILTER task for '${factoryTraceFilter.contractName}' from block ${fromBlock} to ${toBlock}`
    });
    const iterator = this.syncStore.getFactoryChildAddresses({
      chainId: factoryTraceFilter.chainId,
      factory: factoryTraceFilter.criteria,
      fromBlock: BigInt(factoryTraceFilter.startBlock),
      toBlock: BigInt(toBlock)
    });
    const traces = [];
    for await (const childContractAddressBatch of iterator) {
      const _traces = await _trace_filter(
        { requestQueue: this.requestQueue },
        {
          fromBlock,
          toBlock,
          fromAddress: factoryTraceFilter.criteria.fromAddress,
          toAddress: childContractAddressBatch
        }
      ).then(
        (traces2) => traces2.filter((t) => t.type === "call")
      );
      traces.push(..._traces);
    }
    const transactionReceipts = await Promise.all(
      dedupe(traces.map((t) => t.transactionHash)).map(
        (hash2) => _eth_getTransactionReceipt(
          {
            requestQueue: this.requestQueue
          },
          {
            hash: hash2
          }
        )
      )
    );
    const revertedTransactions = /* @__PURE__ */ new Set();
    for (const receipt of transactionReceipts) {
      if (receipt.status === "0x0") {
        revertedTransactions.add(receipt.transactionHash);
      }
    }
    const persistentTraces = traces.filter(
      (trace) => revertedTransactions.has(trace.transactionHash) === false
    );
    const tracesByBlockNumber = {};
    const txHashesByBlockNumber = {};
    for (const trace of persistentTraces) {
      const blockNumber = hexToNumber5(trace.blockNumber);
      if (tracesByBlockNumber[blockNumber] === void 0) {
        tracesByBlockNumber[blockNumber] = [];
      }
      if (txHashesByBlockNumber[blockNumber] === void 0) {
        txHashesByBlockNumber[blockNumber] = /* @__PURE__ */ new Set();
      }
      tracesByBlockNumber[blockNumber].push(trace);
      txHashesByBlockNumber[blockNumber].add(trace.transactionHash);
    }
    const requiredBlocks = Object.keys(txHashesByBlockNumber).map(Number).sort((a, b) => a - b);
    if (!requiredBlocks.includes(toBlock)) {
      requiredBlocks.push(toBlock);
    }
    const traceIntervals = [];
    let prev = fromBlock;
    for (const blockNumber of requiredBlocks) {
      traceIntervals.push({
        startBlock: prev,
        endBlock: blockNumber,
        traces: tracesByBlockNumber[blockNumber] ?? [],
        transactionHashes: txHashesByBlockNumber[blockNumber] ?? /* @__PURE__ */ new Set()
      });
      prev = blockNumber + 1;
    }
    for (const traceInterval of traceIntervals) {
      const { startBlock, endBlock } = traceInterval;
      if (this.blockCallbacks[endBlock] === void 0)
        this.blockCallbacks[endBlock] = [];
      this.blockCallbacks[endBlock].push(async (block) => {
        const { transactionHashes } = traceInterval;
        const transactions = block.transactions.filter(
          (tx) => transactionHashes.has(tx.hash)
        );
        await this.syncStore.insertFactoryTraceFilterInterval({
          chainId: factoryTraceFilter.chainId,
          factory: factoryTraceFilter.criteria,
          block,
          transactions,
          // factory trace intervals always include transaction receipts because
          // the transactions receipts are already needed determine the
          // persistence of a trace.
          transactionReceipts: transactionReceipts.filter(
            (txr) => transactionHashes.has(txr.transactionHash)
          ),
          traces: traceInterval.traces,
          interval: {
            startBlock: BigInt(startBlock),
            endBlock: BigInt(endBlock)
          }
        });
        this.common.metrics.ponder_historical_completed_blocks.inc(
          {
            network: this.network.name,
            source: factoryTraceFilter.contractName,
            type: "trace"
          },
          endBlock - startBlock + 1
        );
      });
    }
    this.factoryTraceFilterProgressTrackers[factoryTraceFilter.id].addCompletedInterval([fromBlock, toBlock]);
    this.enqueueBlockTasks();
    this.common.logger.trace({
      service: "historical",
      msg: `Completed '${this.network.name}' FACTORY_TRACE_FILTER task for '${factoryTraceFilter.contractName}' from block ${fromBlock} to ${toBlock}`
    });
  };
  blockTaskWorker = async ({ blockNumber, callbacks }) => {
    this.common.logger.trace({
      service: "historical",
      msg: `Starting '${this.network.name}' BLOCK task for block ${blockNumber} with ${callbacks.length} callbacks`
    });
    const block = await _eth_getBlockByNumber(
      { requestQueue: this.requestQueue },
      {
        blockNumber
      }
    );
    for (const callback of callbacks) {
      await callback(block);
    }
    const newBlockCheckpoint = this.blockProgressTracker.addCompletedBlock({
      blockNumber,
      blockTimestamp: hexToNumber5(block.timestamp)
    });
    if (newBlockCheckpoint) {
      this.debouncedEmitCheckpoint.call({
        ...maxCheckpoint,
        blockTimestamp: newBlockCheckpoint.blockTimestamp,
        chainId: BigInt(this.network.chainId),
        blockNumber: BigInt(newBlockCheckpoint.blockNumber)
      });
    }
    this.common.logger.trace({
      service: "historical",
      msg: `Completed '${this.network.name}' BLOCK task for block ${blockNumber} with ${callbacks.length} callbacks`
    });
  };
  buildLogIntervals = ({
    fromBlock,
    toBlock,
    logs
  }) => {
    const logsByBlockNumber = {};
    const txHashesByBlockNumber = {};
    logs.forEach((log) => {
      const blockNumber = hexToNumber5(log.blockNumber);
      (txHashesByBlockNumber[blockNumber] ||= /* @__PURE__ */ new Set()).add(
        log.transactionHash
      );
      (logsByBlockNumber[blockNumber] ||= []).push(log);
    });
    const requiredBlocks = Object.keys(txHashesByBlockNumber).map(Number).sort((a, b) => a - b);
    if (!requiredBlocks.includes(toBlock)) {
      requiredBlocks.push(toBlock);
    }
    const requiredIntervals = [];
    let prev = fromBlock;
    for (const blockNumber of requiredBlocks) {
      requiredIntervals.push({
        startBlock: prev,
        endBlock: blockNumber,
        logs: logsByBlockNumber[blockNumber] ?? [],
        transactionHashes: txHashesByBlockNumber[blockNumber] ?? /* @__PURE__ */ new Set()
      });
      prev = blockNumber + 1;
    }
    return requiredIntervals;
  };
  enqueueBlockTasks = () => {
    const blockTasksCanBeEnqueuedTo = Math.min(
      ...[
        ...Object.values(this.logFilterProgressTrackers),
        ...Object.values(this.factoryChildAddressProgressTrackers),
        ...Object.values(this.factoryLogFilterProgressTrackers),
        ...Object.values(this.traceFilterProgressTrackers),
        ...Object.values(this.factoryTraceFilterProgressTrackers),
        ...Object.values(this.blockFilterProgressTrackers)
      ].filter((i) => i.getRequired().length > 0).map((i) => i.getCheckpoint())
    );
    if (blockTasksCanBeEnqueuedTo > this.blockTasksEnqueuedCheckpoint) {
      const newBlocks = Object.keys(this.blockCallbacks).map(Number).filter((blockNumber) => blockNumber <= blockTasksCanBeEnqueuedTo);
      this.blockProgressTracker.addPendingBlocks({ blockNumbers: newBlocks });
      for (const blockNumber of newBlocks) {
        this.queue.addTask(
          {
            kind: "BLOCK",
            blockNumber,
            callbacks: this.blockCallbacks[blockNumber]
          },
          { priority: Number.MAX_SAFE_INTEGER - blockNumber }
        );
        delete this.blockCallbacks[blockNumber];
      }
      this.blockTasksEnqueuedCheckpoint = blockTasksCanBeEnqueuedTo;
    }
  };
  debouncedEmitCheckpoint = debounce(
    HISTORICAL_CHECKPOINT_EMIT_INTERVAL,
    (checkpoint) => {
      this.emit("historicalCheckpoint", checkpoint);
    }
  );
};

// src/sync-realtime/service.ts
import { hexToNumber as hexToNumber7 } from "viem";

// src/sync-realtime/bloom.ts
import {
  isContractAddressInBloom,
  isTopicInBloom
} from "ethereum-bloom-filters";
var zeroLogsBloom = "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
function isMatchedLogInBloomFilter({
  bloom,
  logFilters
}) {
  const allAddresses = [];
  logFilters.forEach((logFilter) => {
    const address = logFilter.address === void 0 ? [] : Array.isArray(logFilter.address) ? logFilter.address : [logFilter.address];
    allAddresses.push(...address);
  });
  if (allAddresses.some((a) => isContractAddressInBloom(bloom, a))) {
    return true;
  }
  const allTopics = [];
  logFilters.forEach((logFilter) => {
    logFilter.topics?.forEach((topic) => {
      if (topic === null)
        return;
      if (Array.isArray(topic))
        allTopics.push(...topic);
      else
        allTopics.push(topic);
    });
  });
  if (allTopics.some((a) => isTopicInBloom(bloom, a))) {
    return true;
  }
  return false;
}

// src/sync-realtime/filter.ts
function filterLogs({
  logs,
  logFilters
}) {
  return logs.filter(
    (log) => logFilters.some((logFilter) => isLogMatchedByFilter({ log, logFilter }))
  );
}
function isLogMatchedByFilter({
  log,
  logFilter
}) {
  const logAddress = toLowerCase(log.address);
  if (logFilter.address !== void 0 && logFilter.address.length > 0) {
    if (Array.isArray(logFilter.address)) {
      if (!logFilter.address.includes(logAddress))
        return false;
    } else {
      if (logAddress !== logFilter.address)
        return false;
    }
  }
  if (logFilter.topics) {
    for (const [index, topic] of logFilter.topics.entries()) {
      if (topic === null || topic === void 0)
        continue;
      if (log.topics[index] === null || log.topics[index] === void 0)
        return false;
      if (Array.isArray(topic)) {
        if (!topic.includes(toLowerCase(log.topics[index])))
          return false;
      } else {
        if (toLowerCase(log.topics[index]) !== topic)
          return false;
      }
    }
  }
  return true;
}
function filterCallTraces({
  callTraces,
  callTraceFilters
}) {
  return callTraces.filter(
    (callTrace) => callTraceFilters.some(
      (callTraceFilter) => isCallTraceMatchedByFilter({ callTrace, callTraceFilter })
    )
  );
}
function isCallTraceMatchedByFilter({
  callTrace,
  callTraceFilter
}) {
  const fromAddress = toLowerCase(callTrace.action.from);
  const toAddress = toLowerCase(callTrace.action.to);
  if (callTraceFilter.fromAddress !== void 0 && callTraceFilter.fromAddress.length > 0) {
    if (!callTraceFilter.fromAddress.includes(fromAddress))
      return false;
  }
  if (callTraceFilter.toAddress !== void 0 && callTraceFilter.toAddress.length > 0) {
    if (!callTraceFilter.toAddress.includes(toAddress))
      return false;
  }
  return true;
}

// src/sync-realtime/format.ts
import { hexToNumber as hexToNumber6 } from "viem";
var syncBlockToLightBlock = ({
  hash: hash2,
  parentHash,
  number,
  timestamp
}) => ({
  hash: hash2,
  parentHash,
  number: hexToNumber6(number),
  timestamp: hexToNumber6(timestamp)
});

// src/sync-realtime/service.ts
var ERROR_TIMEOUT = [
  1,
  2,
  5,
  10,
  30,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60
];
var MAX_QUEUED_BLOCKS = 25;
var create3 = ({
  common,
  syncStore,
  network,
  requestQueue,
  sources,
  finalizedBlock,
  onEvent,
  onFatalError
}) => {
  const logSources = sources.filter(sourceIsLog);
  const factoryLogSources = sources.filter(sourceIsFactoryLog);
  const blockSources = sources.filter(sourceIsBlock);
  const callTraceSources = sources.filter(sourceIsCallTrace);
  const factoryCallTraceSources = sources.filter(sourceIsFactoryCallTrace);
  return {
    common,
    syncStore,
    network,
    requestQueue,
    sources,
    isKilled: false,
    finalizedBlock: syncBlockToLightBlock(finalizedBlock),
    localChain: [],
    queue: void 0,
    consecutiveErrors: 0,
    onEvent,
    onFatalError,
    hasTransactionReceiptSource: logSources.some((s) => s.criteria.includeTransactionReceipts) || factoryLogSources.some((s) => s.criteria.includeTransactionReceipts),
    logSources,
    factoryLogSources,
    callTraceSources,
    factoryCallTraceSources,
    blockSources
  };
};
var start2 = (service) => {
  const queue = createQueue({
    browser: false,
    concurrency: 1,
    initialStart: true,
    worker: async (newHeadBlock) => {
      const latestLocalBlock = getLatestLocalBlock(service);
      const newHeadBlockNumber = hexToNumber7(newHeadBlock.number);
      if (latestLocalBlock.hash === newHeadBlock.hash) {
        service.common.logger.trace({
          service: "realtime",
          msg: `Skipped processing '${service.network.name}' block ${newHeadBlockNumber}, already synced`
        });
        return;
      }
      try {
        if (latestLocalBlock.number >= newHeadBlockNumber) {
          await handleReorg(service, newHeadBlock);
          queue.clear();
          return;
        }
        if (latestLocalBlock.number + 1 < newHeadBlockNumber) {
          const missingBlockRange = range(
            latestLocalBlock.number + 1,
            Math.min(
              newHeadBlockNumber,
              latestLocalBlock.number + MAX_QUEUED_BLOCKS
            )
          );
          const pendingBlocks = await Promise.all(
            missingBlockRange.map(
              (blockNumber) => _eth_getBlockByNumber(service, { blockNumber })
            )
          );
          service.common.logger.debug({
            service: "realtime",
            msg: `Fetched ${missingBlockRange.length} missing '${service.network.name}' blocks from ${latestLocalBlock.number + 1} to ${Math.min(
              newHeadBlockNumber,
              latestLocalBlock.number + MAX_QUEUED_BLOCKS
            )}`
          });
          if (service.isKilled)
            return;
          queue.clear();
          for (const pendingBlock of pendingBlocks) {
            queue.add(pendingBlock);
          }
          queue.add(newHeadBlock);
          return;
        }
        if (newHeadBlock.parentHash !== latestLocalBlock.hash) {
          await handleReorg(service, newHeadBlock);
          queue.clear();
          return;
        }
        await handleBlock(service, { newHeadBlock });
        service.consecutiveErrors = 0;
        return;
      } catch (_error) {
        if (service.isKilled)
          return;
        const error = _error;
        service.common.logger.warn({
          service: "realtime",
          msg: `Failed to process '${service.network.name}' block ${newHeadBlockNumber} with error: ${error.message}`
        });
        const duration = ERROR_TIMEOUT[service.consecutiveErrors];
        service.common.logger.warn({
          service: "realtime",
          msg: `Retrying '${service.network.name}' sync after ${duration} ${duration === 1 ? "second" : "seconds"}.`
        });
        await wait(duration * 1e3);
        queue.clear();
        if (++service.consecutiveErrors === ERROR_TIMEOUT.length) {
          service.common.logger.error({
            service: "realtime",
            msg: `Fatal error: Unable to process '${service.network.name}' block ${newHeadBlockNumber} after ${ERROR_TIMEOUT.length} attempts.`,
            error
          });
          service.onFatalError(error);
        }
      }
    }
  });
  const enqueue = async () => {
    try {
      const block = await _eth_getBlockByNumber(service, {
        blockTag: "latest"
      });
      return queue.add(block);
    } catch (_error) {
      if (service.isKilled)
        return;
      const error = _error;
      service.common.logger.warn({
        service: "realtime",
        msg: `Failed to fetch latest '${service.network.name}' block with error: ${error.message}`
      });
    }
  };
  setInterval(enqueue, service.network.pollingInterval);
  service.queue = queue;
  return enqueue().then(() => queue);
};
var kill3 = async (service) => {
  service.isKilled = true;
  service.queue?.pause();
  service.queue?.clear();
  await service.queue?.onIdle();
};
var handleBlock = async (service, { newHeadBlock }) => {
  const newHeadBlockNumber = hexToNumber7(newHeadBlock.number);
  const newHeadBlockTimestamp = hexToNumber7(newHeadBlock.timestamp);
  service.common.logger.debug({
    service: "realtime",
    msg: `Started syncing '${service.network.name}' block ${newHeadBlockNumber}`
  });
  const shouldRequestLogs = service.factoryLogSources.length > 0 || newHeadBlock.logsBloom === zeroLogsBloom || isMatchedLogInBloomFilter({
    bloom: newHeadBlock.logsBloom,
    logFilters: service.logSources.map((s) => s.criteria)
  });
  const shouldRequestTraces = service.callTraceSources.length > 0 || service.factoryCallTraceSources.length > 0;
  const blockLogs = shouldRequestLogs ? await _eth_getLogs(service, { blockHash: newHeadBlock.hash }) : [];
  const newLogs = await getMatchedLogs(service, {
    logs: blockLogs,
    upToBlockNumber: BigInt(newHeadBlockNumber)
  });
  if (shouldRequestLogs && newHeadBlock.logsBloom !== zeroLogsBloom && blockLogs.length === 0) {
    throw new Error(
      `Detected invalid '${service.network.name}' eth_getLogs response.`
    );
  }
  if (shouldRequestLogs && (service.logSources.length > 0 || service.factoryLogSources.length > 0)) {
    service.common.logger.debug({
      service: "realtime",
      msg: `Skipped fetching logs for '${service.network.name}' block ${newHeadBlockNumber} due to bloom filter result`
    });
  }
  const blockTraces = shouldRequestTraces ? await _trace_block(service, {
    blockNumber: newHeadBlockNumber
  }) : [];
  const blockCallTraces = blockTraces.filter(
    (trace) => trace.type === "call"
  );
  const newCallTraces = await getMatchedCallTraces(service, {
    callTraces: blockCallTraces,
    logs: blockLogs,
    upToBlockNumber: BigInt(newHeadBlockNumber)
  });
  for (const callTrace of newCallTraces) {
    if (callTrace.blockHash !== newHeadBlock.hash) {
      throw new Error(
        `Received call trace with block hash '${callTrace.blockHash}' that does not match current head block '${newHeadBlock.hash}'`
      );
    }
  }
  if (shouldRequestTraces && newHeadBlock.transactions.length !== 0 && blockTraces.length === 0) {
    throw new Error(
      `Detected invalid '${service.network.name}' trace_block response.`
    );
  }
  const transactionHashes = /* @__PURE__ */ new Set();
  for (const log of newLogs) {
    transactionHashes.add(log.transactionHash);
  }
  for (const callTrace of newCallTraces) {
    transactionHashes.add(callTrace.transactionHash);
  }
  const transactions = newHeadBlock.transactions.filter(
    (t) => transactionHashes.has(t.hash)
  );
  const newTransactionReceipts = service.hasTransactionReceiptSource || newCallTraces.length > 0 ? await Promise.all(
    transactions.map(
      ({ hash: hash2 }) => _eth_getTransactionReceipt(service, { hash: hash2 })
    )
  ) : [];
  const revertedTransactions = /* @__PURE__ */ new Set();
  for (const receipt of newTransactionReceipts) {
    if (receipt.status === "0x0") {
      revertedTransactions.add(receipt.transactionHash);
    }
  }
  const newPersistentCallTraces = newCallTraces.filter(
    (trace) => revertedTransactions.has(trace.transactionHash) === false
  );
  const hasLogEvent = newLogs.length > 0;
  const hasCallTraceEvent = newPersistentCallTraces.length > 0;
  const hasBlockEvent = service.blockSources.some(
    (blockSource) => (newHeadBlockNumber - blockSource.criteria.offset) % blockSource.criteria.interval === 0
  );
  if (hasLogEvent || hasCallTraceEvent || hasBlockEvent) {
    await service.syncStore.insertRealtimeBlock({
      chainId: service.network.chainId,
      block: newHeadBlock,
      transactions,
      transactionReceipts: newTransactionReceipts,
      logs: newLogs,
      traces: newPersistentCallTraces
    });
  }
  if (hasLogEvent || hasCallTraceEvent) {
    const logCountText = newLogs.length === 1 ? "1 log" : `${newLogs.length} logs`;
    const traceCountText = newCallTraces.length === 1 ? "1 call trace" : `${newCallTraces.length} call traces`;
    const text = [logCountText, traceCountText].join(" and ");
    service.common.logger.info({
      service: "realtime",
      msg: `Synced ${text} from '${service.network.name}' block ${newHeadBlockNumber}`
    });
  } else if (hasBlockEvent) {
    service.common.logger.info({
      service: "realtime",
      msg: `Synced block ${newHeadBlockNumber} from '${service.network.name}' `
    });
  }
  service.onEvent({
    type: "checkpoint",
    chainId: service.network.chainId,
    checkpoint: {
      ...maxCheckpoint,
      blockTimestamp: newHeadBlockTimestamp,
      chainId: BigInt(service.network.chainId),
      blockNumber: BigInt(newHeadBlockNumber)
    }
  });
  service.localChain.push(syncBlockToLightBlock(newHeadBlock));
  service.common.metrics.ponder_realtime_latest_block_number.set(
    { network: service.network.name },
    newHeadBlockNumber
  );
  service.common.metrics.ponder_realtime_latest_block_timestamp.set(
    { network: service.network.name },
    newHeadBlockTimestamp
  );
  const blockMovesFinality = newHeadBlockNumber >= service.finalizedBlock.number + 2 * service.network.finalityBlockCount;
  if (blockMovesFinality) {
    const pendingFinalizedBlock = service.localChain.find(
      (block) => block.number === newHeadBlockNumber - service.network.finalityBlockCount
    );
    await service.syncStore.insertRealtimeInterval({
      chainId: service.network.chainId,
      logFilters: service.logSources.map((l) => l.criteria),
      factoryLogFilters: service.factoryLogSources.map((f) => f.criteria),
      blockFilters: service.blockSources.map((b) => b.criteria),
      traceFilters: service.callTraceSources.map((f) => f.criteria),
      factoryTraceFilters: service.factoryCallTraceSources.map(
        (f) => f.criteria
      ),
      interval: {
        startBlock: BigInt(service.finalizedBlock.number + 1),
        endBlock: BigInt(pendingFinalizedBlock.number)
      }
    });
    service.common.logger.debug({
      service: "realtime",
      msg: `Finalized ${pendingFinalizedBlock.number - service.finalizedBlock.number + 1} '${service.network.name}' blocks from ${service.finalizedBlock.number + 1} to ${pendingFinalizedBlock.number}`
    });
    service.localChain = service.localChain.filter(
      (block) => block.number > pendingFinalizedBlock.number
    );
    service.finalizedBlock = pendingFinalizedBlock;
    service.onEvent({
      type: "finalize",
      chainId: service.network.chainId,
      checkpoint: {
        ...maxCheckpoint,
        blockTimestamp: service.finalizedBlock.timestamp,
        chainId: BigInt(service.network.chainId),
        blockNumber: BigInt(service.finalizedBlock.number)
      }
    });
  }
  service.common.logger.debug({
    service: "realtime",
    msg: `Finished syncing '${service.network.name}' block ${newHeadBlockNumber}`
  });
};
var handleReorg = async (service, newHeadBlock) => {
  const forkedBlockNumber = hexToNumber7(newHeadBlock.number);
  service.common.logger.warn({
    service: "realtime",
    msg: `Detected forked '${service.network.name}' block at height ${forkedBlockNumber}`
  });
  const newLocalChain = service.localChain.filter(
    (block) => block.number < forkedBlockNumber
  );
  let remoteBlock = newHeadBlock;
  while (true) {
    const parentBlock = getLatestLocalBlock({
      localChain: newLocalChain,
      finalizedBlock: service.finalizedBlock
    });
    if (parentBlock.hash === remoteBlock.parentHash) {
      await service.syncStore.deleteRealtimeData({
        chainId: service.network.chainId,
        fromBlock: BigInt(parentBlock.number)
      });
      service.localChain = newLocalChain;
      service.onEvent({
        type: "reorg",
        chainId: service.network.chainId,
        safeCheckpoint: {
          ...maxCheckpoint,
          blockTimestamp: parentBlock.timestamp,
          chainId: BigInt(service.network.chainId),
          blockNumber: BigInt(parentBlock.number)
        }
      });
      service.common.logger.warn({
        service: "realtime",
        msg: `Reconciled ${forkedBlockNumber - parentBlock.number}-block reorg on '${service.network.name}' with common ancestor block ${parentBlock.number}`
      });
      return;
    }
    if (newLocalChain.length === 0)
      break;
    else {
      remoteBlock = await _eth_getBlockByHash(service, {
        blockHash: remoteBlock.parentHash
      });
      newLocalChain.pop();
    }
  }
  const msg = `Encountered unrecoverable '${service.network.name}' reorg beyond finalized block ${service.finalizedBlock.number}`;
  service.common.logger.warn({ service: "realtime", msg });
  service.onFatalError(new Error(msg));
  service.localChain = [];
};
var getMatchedLogs = async (service, {
  logs,
  upToBlockNumber
}) => {
  if (service.factoryLogSources.length === 0) {
    return filterLogs({
      logs,
      logFilters: service.logSources.map((s) => s.criteria)
    });
  } else {
    const matchedFactoryLogs = filterLogs({
      logs,
      logFilters: service.factoryLogSources.map((fs) => ({
        address: fs.criteria.address,
        topics: [fs.criteria.eventSelector]
      }))
    });
    await service.syncStore.insertFactoryChildAddressLogs({
      chainId: service.network.chainId,
      logs: matchedFactoryLogs
    });
    const factoryLogFilters = await Promise.all(
      service.factoryLogSources.map(async (factory) => {
        const iterator = service.syncStore.getFactoryChildAddresses({
          chainId: service.network.chainId,
          factory: factory.criteria,
          fromBlock: BigInt(factory.startBlock),
          toBlock: upToBlockNumber
        });
        const childContractAddresses = [];
        for await (const batch of iterator) {
          childContractAddresses.push(...batch);
        }
        return {
          address: childContractAddresses,
          topics: factory.criteria.topics
        };
      })
    );
    return filterLogs({
      logs,
      logFilters: [
        ...service.logSources.map((l) => l.criteria),
        ...factoryLogFilters.filter((f) => f.address.length !== 0)
      ]
    });
  }
};
var getMatchedCallTraces = async (service, {
  callTraces,
  logs,
  upToBlockNumber
}) => {
  if (service.factoryCallTraceSources.length === 0) {
    return filterCallTraces({
      callTraces,
      callTraceFilters: service.callTraceSources.map((s) => s.criteria)
    });
  } else {
    const matchedFactoryLogs = filterLogs({
      logs,
      logFilters: service.factoryLogSources.map((fs) => ({
        address: fs.criteria.address,
        topics: [fs.criteria.eventSelector]
      }))
    });
    await service.syncStore.insertFactoryChildAddressLogs({
      chainId: service.network.chainId,
      logs: matchedFactoryLogs
    });
    const factoryTraceFilters = await Promise.all(
      service.factoryCallTraceSources.map(async (factory) => {
        const iterator = service.syncStore.getFactoryChildAddresses({
          chainId: service.network.chainId,
          factory: factory.criteria,
          fromBlock: BigInt(factory.startBlock),
          toBlock: upToBlockNumber
        });
        const childContractAddresses = [];
        for await (const batch of iterator) {
          childContractAddresses.push(...batch);
        }
        return {
          toAddress: childContractAddresses,
          fromAddress: factory.criteria.fromAddress
        };
      })
    );
    return filterCallTraces({
      callTraces,
      callTraceFilters: [
        ...service.callTraceSources.map((s) => s.criteria),
        ...factoryTraceFilters.filter((f) => f.toAddress.length !== 0)
      ]
    });
  }
};
var getLatestLocalBlock = ({
  localChain,
  finalizedBlock
}) => {
  if (localChain.length === 0) {
    return finalizedBlock;
  } else
    return localChain[localChain.length - 1];
};

// src/sync-realtime/index.ts
var methods3 = {
  start: start2,
  kill: kill3
};
var createRealtimeSyncService = extend(create3, methods3);

// src/utils/requestQueue.ts
import {
  getLogsRetryHelper
} from "@ponder/utils";
import {
  BlockNotFoundError,
  HttpRequestError,
  InternalRpcError,
  InvalidInputRpcError,
  LimitExceededRpcError,
  hexToBigInt as hexToBigInt4,
  isHex as isHex2
} from "viem";
var RETRY_COUNT2 = 9;
var BASE_DURATION2 = 125;
var createRequestQueue = ({
  network,
  common
}) => {
  const fetchRequest = async (request) => {
    for (let i = 0; i <= RETRY_COUNT2; i++) {
      try {
        const stopClock = startClock();
        const response = await network.transport.request(request);
        common.metrics.ponder_rpc_request_duration.observe(
          { method: request.method, network: network.name },
          stopClock()
        );
        return response;
      } catch (_error) {
        const error = _error;
        if (request.method === "eth_getLogs" && isHex2(request.params[0].fromBlock) && isHex2(request.params[0].toBlock)) {
          const getLogsErrorResponse = getLogsRetryHelper({
            params: request.params,
            error
          });
          if (getLogsErrorResponse.shouldRetry === false)
            throw error;
          common.logger.debug({
            service: "sync",
            msg: `Caught eth_getLogs error on '${network.name}', retrying with ranges: [${getLogsErrorResponse.ranges.map(
              ({ fromBlock, toBlock }) => `[${hexToBigInt4(fromBlock).toString()}, ${hexToBigInt4(
                toBlock
              ).toString()}]`
            ).join(", ")}].`
          });
          const logs = [];
          for (const { fromBlock, toBlock } of getLogsErrorResponse.ranges) {
            const _logs = await fetchRequest({
              method: "eth_getLogs",
              params: [
                {
                  topics: request.params[0].topics,
                  address: request.params[0].address,
                  fromBlock,
                  toBlock
                }
              ]
            });
            logs.push(..._logs);
          }
          return logs;
        }
        if (shouldRetry(error) === false) {
          common.logger.warn({
            service: "sync",
            msg: `Failed '${request.method}' RPC request with non-retryable error: ${error.message}`
          });
          throw error;
        }
        if (i === RETRY_COUNT2) {
          common.logger.warn({
            service: "sync",
            msg: `Failed '${request.method}' RPC request after ${i + 1} attempts with error: ${error.message}`
          });
          throw error;
        }
        const duration = BASE_DURATION2 * 2 ** i;
        common.logger.debug({
          service: "sync",
          msg: `Failed '${request.method}' RPC request, retrying after ${duration} milliseconds. Error: ${error.message}`
        });
        await wait(duration);
      }
    }
  };
  const requestQueue = createQueue({
    frequency: network.maxRequestsPerSecond,
    concurrency: Math.ceil(network.maxRequestsPerSecond / 4),
    initialStart: true,
    browser: false,
    worker: async (task) => {
      common.metrics.ponder_rpc_request_lag.observe(
        { method: task.request.method, network: network.name },
        task.stopClockLag()
      );
      return await fetchRequest(task.request);
    }
  });
  return {
    ...requestQueue,
    request: (params) => {
      const stopClockLag = startClock();
      return requestQueue.add({ request: params, stopClockLag });
    }
  };
};
function shouldRetry(error) {
  if ("code" in error && typeof error.code === "number") {
    if (error.code === -1)
      return true;
    if (error.code === InvalidInputRpcError.code)
      return true;
    if (error.code === LimitExceededRpcError.code)
      return true;
    if (error.code === InternalRpcError.code)
      return true;
    return false;
  }
  if (error instanceof BlockNotFoundError)
    return true;
  if (error instanceof HttpRequestError && error.status) {
    if (error.status === 403)
      return true;
    if (error.status === 408)
      return true;
    if (error.status === 413)
      return true;
    if (error.status === 429)
      return true;
    if (error.status === 500)
      return true;
    if (error.status === 502)
      return true;
    if (error.status === 503)
      return true;
    if (error.status === 504)
      return true;
    return false;
  }
  return true;
}

// src/sync/service.ts
import { hexToBigInt as hexToBigInt6, hexToNumber as hexToNumber8 } from "viem";

// src/sync/transport.ts
import { custom, hexToBigInt as hexToBigInt5, maxUint256 } from "viem";
var cachedMethods = [
  "eth_call",
  "eth_getBalance",
  "eth_getCode",
  "eth_getStorageAt"
];
var cachedTransport = ({
  requestQueue,
  syncStore
}) => {
  return ({ chain }) => {
    const c = custom({
      async request({ method, params }) {
        const body = { method, params };
        if (cachedMethods.includes(method)) {
          let request = void 0;
          let blockNumber = void 0;
          if (method === "eth_call") {
            const [{ data, to }, _blockNumber] = params;
            request = `${method}_${toLowerCase(to)}_${toLowerCase(
              data
            )}`;
            blockNumber = _blockNumber;
          } else if (method === "eth_getBalance") {
            const [address, _blockNumber] = params;
            request = `${method}_${toLowerCase(address)}`;
            blockNumber = _blockNumber;
          } else if (method === "eth_getCode") {
            const [address, _blockNumber] = params;
            request = `${method}_${toLowerCase(address)}`;
            blockNumber = _blockNumber;
          } else if (method === "eth_getStorageAt") {
            const [address, slot, _blockNumber] = params;
            request = `${method}_${toLowerCase(
              address
            )}_${toLowerCase(slot)}`;
            blockNumber = _blockNumber;
          }
          const blockNumberBigInt = blockNumber === "latest" ? maxUint256 : hexToBigInt5(blockNumber);
          const cachedResult = await syncStore.getRpcRequestResult({
            blockNumber: blockNumberBigInt,
            chainId: chain.id,
            request
          });
          if (cachedResult?.result)
            return cachedResult.result;
          else {
            const response = await requestQueue.request(body);
            await syncStore.insertRpcRequestResult({
              blockNumber: blockNumberBigInt,
              chainId: chain.id,
              request,
              result: response
            });
            return response;
          }
        } else {
          return requestQueue.request(body);
        }
      }
    });
    return c({ chain, retryCount: 0 });
  };
};

// src/sync/service.ts
var HISTORICAL_CHECKPOINT_INTERVAL = 500;
var create4 = async ({
  common,
  syncStore,
  networks,
  sources,
  onRealtimeEvent,
  onFatalError,
  initialCheckpoint
}) => {
  const sourceById = sources.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});
  const onRealtimeSyncEvent = (realtimeSyncEvent) => {
    switch (realtimeSyncEvent.type) {
      case "checkpoint": {
        syncService.networkServices.find(
          (ns) => ns.network.chainId === realtimeSyncEvent.chainId
        ).realtime.checkpoint = realtimeSyncEvent.checkpoint;
        const newCheckpoint = checkpointMin(
          ...syncService.networkServices.filter((ns) => ns.realtime !== void 0).map((ns) => ns.realtime.checkpoint)
        );
        if (!isCheckpointGreaterThan(newCheckpoint, syncService.checkpoint))
          return;
        const fromCheckpoint = { ...syncService.checkpoint };
        const toCheckpoint = { ...newCheckpoint };
        syncService.checkpoint = newCheckpoint;
        onRealtimeEvent({
          type: "newEvents",
          fromCheckpoint,
          toCheckpoint
        });
        break;
      }
      case "reorg": {
        syncService.networkServices.find(
          (ns) => ns.network.chainId === realtimeSyncEvent.chainId
        ).realtime.checkpoint = realtimeSyncEvent.safeCheckpoint;
        if (isCheckpointGreaterThan(
          syncService.checkpoint,
          realtimeSyncEvent.safeCheckpoint
        )) {
          syncService.checkpoint = realtimeSyncEvent.safeCheckpoint;
        }
        onRealtimeEvent(realtimeSyncEvent);
        break;
      }
      case "finalize": {
        syncService.networkServices.find(
          (ns) => ns.network.chainId === realtimeSyncEvent.chainId
        ).realtime.finalizedCheckpoint = realtimeSyncEvent.checkpoint;
        const newFinalizedCheckpoint = checkpointMin(
          ...syncService.networkServices.filter((ns) => ns.realtime !== void 0).map((ns) => ns.realtime.finalizedCheckpoint)
        );
        if (isCheckpointGreaterThan(
          newFinalizedCheckpoint,
          syncService.finalizedCheckpoint
        )) {
          onRealtimeEvent({
            type: "finalize",
            checkpoint: newFinalizedCheckpoint
          });
          syncService.finalizedCheckpoint = newFinalizedCheckpoint;
        }
        break;
      }
      default:
        never(realtimeSyncEvent);
    }
  };
  const networkServices = await Promise.all(
    networks.map(async (network) => {
      const networkSources = sources.filter(
        (source) => source.networkName === network.name
      );
      const requestQueue = createRequestQueue({
        network,
        common
      });
      const [{ latestBlock, finalizedBlock }, remoteChainId] = await Promise.all([
        getLatestAndFinalizedBlocks({
          network,
          requestQueue
        }),
        requestQueue.request({ method: "eth_chainId" }).then(hexToNumber8)
      ]);
      if (network.chainId !== remoteChainId) {
        common.logger.warn({
          service: "sync",
          msg: `Remote chain ID (${remoteChainId}) does not match configured chain ID (${network.chainId}) for network "${network.name}"`
        });
      }
      const historicalSync = new HistoricalSyncService({
        common,
        syncStore,
        network,
        requestQueue,
        sources: networkSources
      });
      await historicalSync.setup({
        latestBlockNumber: hexToNumber8(latestBlock.number),
        finalizedBlockNumber: hexToNumber8(finalizedBlock.number)
      });
      const initialFinalizedCheckpoint = {
        ...maxCheckpoint,
        blockTimestamp: hexToNumber8(finalizedBlock.timestamp),
        chainId: BigInt(network.chainId),
        blockNumber: hexToBigInt6(finalizedBlock.number)
      };
      const canSkipRealtime = getCanSkipRealtime({
        sources: networkSources,
        finalizedBlock
      });
      if (canSkipRealtime) {
        return {
          network,
          sources: networkSources,
          requestQueue,
          cachedTransport: cachedTransport({ requestQueue, syncStore }),
          initialFinalizedCheckpoint,
          realtime: void 0,
          historical: {
            historicalSync,
            checkpoint: void 0,
            isHistoricalSyncComplete: false
          }
        };
      } else {
        const realtimeSync = createRealtimeSyncService({
          common,
          syncStore,
          network,
          requestQueue,
          sources: networkSources,
          finalizedBlock,
          onEvent: onRealtimeSyncEvent,
          onFatalError
        });
        return {
          network,
          sources: networkSources,
          requestQueue,
          cachedTransport: cachedTransport({ requestQueue, syncStore }),
          initialFinalizedCheckpoint,
          realtime: {
            realtimeSync,
            checkpoint: initialFinalizedCheckpoint,
            finalizedCheckpoint: initialFinalizedCheckpoint,
            finalizedBlock
          },
          historical: {
            historicalSync,
            checkpoint: void 0,
            isHistoricalSyncComplete: false
          }
        };
      }
    })
  );
  for (const networkService of networkServices) {
    networkService.historical.historicalSync.on(
      "historicalCheckpoint",
      (checkpoint) => {
        networkService.historical.checkpoint = checkpoint;
        common.logger.trace({
          service: "sync",
          msg: `New historical checkpoint (timestamp=${checkpoint.blockTimestamp} chainId=${checkpoint.chainId} blockNumber=${checkpoint.blockNumber})`
        });
      }
    );
    networkService.historical.historicalSync.on("syncComplete", () => {
      networkService.historical.isHistoricalSyncComplete = true;
      if (networkServices.every(
        ({ historical }) => historical.isHistoricalSyncComplete
      )) {
        common.logger.info({
          service: "sync",
          msg: "Completed historical sync across all networks"
        });
      }
    });
  }
  const syncService = {
    common,
    syncStore,
    sources,
    networkServices,
    isKilled: false,
    checkpoint: initialCheckpoint,
    finalizedCheckpoint: checkpointMin(
      ...networkServices.map((ns) => ns.initialFinalizedCheckpoint)
    ),
    sourceById
  };
  return syncService;
};
var startHistorical = (syncService) => {
  for (const { historical } of syncService.networkServices) {
    historical.historicalSync.start();
  }
};
var getHistoricalCheckpoint = async function* (syncService) {
  while (true) {
    if (syncService.isKilled)
      return;
    const isComplete = syncService.networkServices.every(
      (ns) => ns.historical.isHistoricalSyncComplete
    );
    if (isComplete) {
      const finalityCheckpoint = checkpointMin(
        ...syncService.networkServices.map(
          ({ initialFinalizedCheckpoint }) => initialFinalizedCheckpoint
        )
      );
      if (!isCheckpointGreaterThan(finalityCheckpoint, syncService.checkpoint))
        break;
      yield {
        fromCheckpoint: syncService.checkpoint,
        toCheckpoint: finalityCheckpoint
      };
      syncService.checkpoint = finalityCheckpoint;
      break;
    } else {
      await wait(HISTORICAL_CHECKPOINT_INTERVAL);
      const networkCheckpoints = syncService.networkServices.map(
        (ns) => ns.historical.checkpoint
      );
      if (networkCheckpoints.some((nc) => nc === void 0)) {
        continue;
      }
      const newCheckpoint = checkpointMin(
        ...networkCheckpoints
      );
      if (!isCheckpointGreaterThan(newCheckpoint, syncService.checkpoint)) {
        continue;
      }
      yield {
        fromCheckpoint: syncService.checkpoint,
        toCheckpoint: newCheckpoint
      };
      syncService.checkpoint = newCheckpoint;
    }
  }
};
var startRealtime = (syncService) => {
  for (const { realtime, network } of syncService.networkServices) {
    if (realtime === void 0) {
      syncService.common.logger.debug({
        service: "realtime",
        msg: `No realtime contracts (network=${network.name})`
      });
      syncService.common.metrics.ponder_realtime_is_connected.set(
        { network: network.name },
        0
      );
    } else {
      realtime.realtimeSync.start();
      syncService.common.metrics.ponder_realtime_is_connected.set(
        { network: network.name },
        1
      );
    }
  }
};
var kill4 = async (syncService) => {
  syncService.isKilled = true;
  const killPromise = [];
  for (const { historical, realtime } of syncService.networkServices) {
    historical.historicalSync.kill();
    if (realtime !== void 0)
      killPromise.push(realtime.realtimeSync.kill());
  }
  await Promise.all(killPromise);
};
var getCachedTransport = (syncService, network) => {
  const { requestQueue } = syncService.networkServices.find(
    (ns) => ns.network.chainId === network.chainId
  );
  return cachedTransport({ requestQueue, syncStore: syncService.syncStore });
};
var getLatestAndFinalizedBlocks = async ({
  network,
  requestQueue
}) => {
  const latestBlock = await _eth_getBlockByNumber(
    { requestQueue },
    { blockTag: "latest" }
  );
  const finalizedBlockNumber = Math.max(
    0,
    hexToNumber8(latestBlock.number) - network.finalityBlockCount
  );
  const finalizedBlock = await _eth_getBlockByNumber(
    { requestQueue },
    {
      blockNumber: finalizedBlockNumber
    }
  );
  return { latestBlock, finalizedBlock };
};
var getCanSkipRealtime = ({
  sources,
  finalizedBlock
}) => {
  const endBlocks = sources.map((f) => f.endBlock);
  return endBlocks.every(
    (b) => b !== void 0 && b <= hexToNumber8(finalizedBlock.number)
  );
};

// src/sync/index.ts
var methods4 = {
  startHistorical,
  getHistoricalCheckpoint,
  startRealtime,
  getCachedTransport,
  kill: kill4
};
var createSyncService = extend(create4, methods4);
var _eth_getBlockByNumber = ({ requestQueue }, {
  blockNumber,
  blockTag
}) => requestQueue.request({
  method: "eth_getBlockByNumber",
  params: [
    typeof blockNumber === "number" ? numberToHex2(blockNumber) : blockNumber ?? blockTag,
    true
  ]
}).then((_block) => {
  if (!_block)
    throw new BlockNotFoundError2({
      blockNumber: blockNumber ?? blockTag
    });
  return _block;
});
var _eth_getBlockByHash = ({ requestQueue }, { blockHash }) => requestQueue.request({
  method: "eth_getBlockByHash",
  params: [blockHash, true]
}).then((_block) => {
  if (!_block)
    throw new BlockNotFoundError2({
      blockHash
    });
  return _block;
});
var _eth_getLogs = async ({ requestQueue }, params) => {
  if ("blockHash" in params) {
    return requestQueue.request({
      method: "eth_getLogs",
      params: [
        {
          blockHash: params.blockHash,
          topics: params.topics,
          address: params.address ? Array.isArray(params.address) ? params.address.map((a) => toLowerCase(a)) : toLowerCase(params.address) : void 0
        }
      ]
    }).then((l) => l);
  }
  return requestQueue.request({
    method: "eth_getLogs",
    params: [
      {
        fromBlock: typeof params.fromBlock === "number" ? numberToHex2(params.fromBlock) : params.fromBlock,
        toBlock: typeof params.toBlock === "number" ? numberToHex2(params.toBlock) : params.toBlock,
        topics: params.topics,
        address: params.address ? Array.isArray(params.address) ? params.address.map((a) => toLowerCase(a)) : toLowerCase(params.address) : void 0
      }
    ]
  }).then((l) => l);
};
var _eth_getTransactionReceipt = ({ requestQueue }, { hash: hash2 }) => requestQueue.request({
  method: "eth_getTransactionReceipt",
  params: [hash2]
}).then((receipt) => {
  if (!receipt)
    throw new TransactionReceiptNotFoundError({
      hash: hash2
    });
  return receipt;
});
var _trace_filter = ({ requestQueue }, params) => requestQueue.request({
  method: "trace_filter",
  params: [
    {
      fromBlock: typeof params.fromBlock === "number" ? numberToHex2(params.fromBlock) : params.fromBlock,
      toBlock: typeof params.toBlock === "number" ? numberToHex2(params.toBlock) : params.toBlock,
      fromAddress: params.fromAddress ? params.fromAddress.map((a) => toLowerCase(a)) : void 0,
      toAddress: params.toAddress ? params.toAddress.map((a) => toLowerCase(a)) : void 0
    }
  ]
}).then((traces) => traces);
var _trace_block = ({ requestQueue }, params) => requestQueue.request({
  method: "trace_block",
  params: [
    typeof params.blockNumber === "number" ? numberToHex2(params.blockNumber) : params.blockNumber
  ]
}).then((traces) => traces);

// src/bin/utils/run.ts
async function run({
  common,
  build,
  onFatalError,
  onReloadableError
}) {
  const {
    buildId,
    databaseConfig,
    optionsConfig,
    networks,
    sources,
    schema,
    graphqlSchema,
    indexingFunctions
  } = build;
  common.options = { ...common.options, ...optionsConfig };
  let database;
  let syncStore;
  let namespaceInfo;
  let initialCheckpoint;
  if (databaseConfig.kind === "sqlite") {
    const { directory } = databaseConfig;
    database = new SqliteDatabaseService({ common, directory });
    [namespaceInfo, initialCheckpoint] = await database.setup({ schema, buildId }).then(({ namespaceInfo: namespaceInfo2, checkpoint }) => [namespaceInfo2, checkpoint]);
    syncStore = new SqliteSyncStore({ db: database.syncDb });
  } else {
    const { poolConfig, schema: userNamespace, publishSchema } = databaseConfig;
    database = new PostgresDatabaseService({
      common,
      poolConfig,
      userNamespace,
      publishSchema
    });
    [namespaceInfo, initialCheckpoint] = await database.setup({ schema, buildId }).then(({ namespaceInfo: namespaceInfo2, checkpoint }) => [namespaceInfo2, checkpoint]);
    syncStore = new PostgresSyncStore({ db: database.syncDb });
  }
  const readonlyStore = getReadonlyStore({
    kind: database.kind,
    schema,
    namespaceInfo,
    db: database.readonlyDb
  });
  const server = await createServer2({ common, graphqlSchema, readonlyStore });
  await database.migrateSyncStore();
  runCodegen({ common, graphqlSchema });
  const syncService = await createSyncService({
    common,
    syncStore,
    networks,
    sources,
    // Note: this is not great because it references the
    // `realtimeQueue` which isn't defined yet
    onRealtimeEvent: (realtimeEvent) => {
      realtimeQueue.add(realtimeEvent);
    },
    onFatalError,
    initialCheckpoint
  });
  const handleEvents = async (events, lastEventCheckpoint) => {
    if (lastEventCheckpoint !== void 0) {
      indexingService.updateLastEventCheckpoint(lastEventCheckpoint);
    }
    if (events.length === 0)
      return { status: "success" };
    return await indexingService.processEvents({ events });
  };
  const handleReorg2 = async (safeCheckpoint) => {
    await database.revert({
      checkpoint: safeCheckpoint,
      namespaceInfo
    });
  };
  const handleFinalize = async (checkpoint) => {
    await database.updateFinalizedCheckpoint({ checkpoint });
  };
  const realtimeQueue = createQueue({
    initialStart: true,
    browser: false,
    concurrency: 1,
    worker: async (event) => {
      switch (event.type) {
        case "newEvents": {
          const lastEventCheckpoint = await syncStore.getLastEventCheckpoint({
            sources,
            fromCheckpoint: event.fromCheckpoint,
            toCheckpoint: event.toCheckpoint
          });
          for await (const rawEvents of syncStore.getEvents({
            sources,
            fromCheckpoint: event.fromCheckpoint,
            toCheckpoint: event.toCheckpoint,
            limit: 1e3
          })) {
            const result = await handleEvents(
              decodeEvents(syncService, rawEvents),
              lastEventCheckpoint
            );
            if (result.status === "error")
              onReloadableError(result.error);
          }
          break;
        }
        case "reorg":
          await handleReorg2(event.safeCheckpoint);
          break;
        case "finalize":
          await handleFinalize(event.checkpoint);
          break;
        default:
          never(event);
      }
    }
  });
  let indexingStore = {
    ...getReadonlyStore({
      kind: database.kind,
      schema,
      namespaceInfo,
      db: database.indexingDb
    }),
    ...getHistoricalStore({
      kind: database.kind,
      schema,
      namespaceInfo,
      db: database.indexingDb
    })
  };
  const indexingService = createIndexingService({
    indexingFunctions,
    common,
    indexingStore,
    sources,
    networks,
    syncService,
    schema
  });
  const start4 = async () => {
    syncService.startHistorical();
    if (isCheckpointEqual(initialCheckpoint, zeroCheckpoint)) {
      const result = await indexingService.processSetupEvents({
        sources,
        networks
      });
      if (result.status === "killed") {
        return;
      } else if (result.status === "error") {
        onReloadableError(result.error);
        return;
      }
    }
    for await (const {
      fromCheckpoint,
      toCheckpoint
    } of syncService.getHistoricalCheckpoint()) {
      const lastEventCheckpoint = await syncStore.getLastEventCheckpoint({
        sources,
        fromCheckpoint,
        toCheckpoint
      });
      for await (const rawEvents of syncStore.getEvents({
        sources,
        fromCheckpoint,
        toCheckpoint,
        limit: 1e3
      })) {
        const result = await handleEvents(
          decodeEvents(syncService, rawEvents),
          lastEventCheckpoint
        );
        if (result.status === "killed") {
          return;
        } else if (result.status === "error") {
          onReloadableError(result.error);
          return;
        }
      }
    }
    common.logger.info({
      service: "indexing",
      msg: "Completed historical indexing"
    });
    if (database.kind === "postgres") {
      await database.publish();
    }
    await handleFinalize(syncService.finalizedCheckpoint);
    await database.createIndexes({ schema });
    server.setHealthy();
    common.logger.info({
      service: "server",
      msg: "Started responding as healthy"
    });
    indexingStore = {
      ...getReadonlyStore({
        kind: database.kind,
        schema,
        namespaceInfo,
        db: database.indexingDb
      }),
      ...getRealtimeStore({
        kind: database.kind,
        schema,
        namespaceInfo,
        db: database.indexingDb
      })
    };
    indexingService.updateIndexingStore({ indexingStore, schema });
    syncService.startRealtime();
  };
  const startPromise = start4();
  return async () => {
    const serverPromise = server.kill();
    indexingService.kill();
    await syncService.kill();
    realtimeQueue.pause();
    realtimeQueue.clear();
    await realtimeQueue.onIdle();
    await startPromise;
    await serverPromise;
    await database.kill();
  };
}

// src/bin/commands/dev.ts
async function dev({ cliOptions }) {
  const options = buildOptions({ cliOptions });
  const logger = createLogger({ level: options.logLevel });
  const [major, minor, _patch] = process.versions.node.split(".").map(Number);
  if (major < 18 || major === 18 && minor < 14) {
    logger.fatal({
      service: "process",
      msg: `Invalid Node.js version. Expected >=18.14, detected ${major}.${minor}.`
    });
    await logger.kill();
    process.exit(1);
  }
  if (!existsSync4(path8.join(options.rootDir, ".env.local"))) {
    logger.warn({
      service: "app",
      msg: "Local environment file (.env.local) not found"
    });
  }
  const configRelPath = path8.relative(options.rootDir, options.configFile);
  logger.debug({
    service: "app",
    msg: `Started using config file: ${configRelPath}`
  });
  const metrics = new MetricsService();
  const telemetry = createTelemetry({ options, logger });
  const common = { options, logger, metrics, telemetry };
  const buildService = await createBuildService({ common });
  const uiService = new UiService({ common });
  let cleanupReloadable = () => Promise.resolve();
  const cleanup = async () => {
    await cleanupReloadable();
    await buildService.kill();
    await telemetry.kill();
    uiService.kill();
  };
  const shutdown = setupShutdown({ common, cleanup });
  const buildQueue = createQueue({
    initialStart: true,
    concurrency: 1,
    worker: async (result) => {
      await cleanupReloadable();
      if (result.status === "success") {
        uiService.reset();
        metrics.resetMetrics();
        cleanupReloadable = await run({
          common,
          build: result.build,
          onFatalError: () => {
            shutdown({ reason: "Received fatal error", code: 1 });
          },
          onReloadableError: (error) => {
            buildQueue.clear();
            buildQueue.add({ status: "error", error });
          }
        });
      } else {
        uiService.setReloadableError();
        cleanupReloadable = () => Promise.resolve();
      }
    }
  });
  const initialResult = await buildService.start({
    watch: true,
    onBuild: (buildResult) => {
      buildQueue.clear();
      buildQueue.add(buildResult);
    }
  });
  if (initialResult.status === "error") {
    await shutdown({ reason: "Failed intial build", code: 1 });
    return cleanup;
  }
  telemetry.record({
    name: "lifecycle:session_start",
    properties: { cli_command: "dev", ...buildPayload(initialResult.build) }
  });
  buildQueue.add(initialResult);
  return async () => {
    buildQueue.pause();
    await cleanup();
  };
}

// src/bin/commands/serve.ts
import path9 from "node:path";
async function serve2({ cliOptions }) {
  const options = buildOptions({ cliOptions });
  const logger = createLogger({ level: options.logLevel });
  const [major, minor, _patch] = process.versions.node.split(".").map(Number);
  if (major < 18 || major === 18 && minor < 14) {
    logger.fatal({
      service: "process",
      msg: `Invalid Node.js version. Expected >=18.14, detected ${major}.${minor}.`
    });
    await logger.kill();
    process.exit(1);
  }
  const configRelPath = path9.relative(options.rootDir, options.configFile);
  logger.debug({
    service: "app",
    msg: `Started using config file: ${configRelPath}`
  });
  const metrics = new MetricsService();
  const telemetry = createTelemetry({ options, logger });
  const common = { options, logger, metrics, telemetry };
  const buildService = await createBuildService({ common });
  let cleanupReloadable = () => Promise.resolve();
  const cleanup = async () => {
    await cleanupReloadable();
    await telemetry.kill();
  };
  const shutdown = setupShutdown({ common, cleanup });
  const initialResult = await buildService.start({ watch: false });
  await buildService.kill();
  if (initialResult.status === "error") {
    await shutdown({ reason: "Failed intial build", code: 1 });
    return cleanup;
  }
  telemetry.record({
    name: "lifecycle:session_start",
    properties: { cli_command: "serve", ...buildPayload(initialResult.build) }
  });
  const { databaseConfig, optionsConfig, schema, graphqlSchema } = initialResult.build;
  common.options = { ...common.options, ...optionsConfig };
  if (databaseConfig.kind === "sqlite") {
    await shutdown({
      reason: "The 'ponder serve' command does not support SQLite",
      code: 1
    });
    return cleanup;
  }
  if (databaseConfig.publishSchema === void 0) {
    await shutdown({
      reason: "The 'ponder serve' command requires 'publishSchema' to be set",
      code: 1
    });
    return cleanup;
  }
  const { poolConfig, schema: userNamespace } = databaseConfig;
  const database = new PostgresDatabaseService({
    common,
    poolConfig,
    userNamespace,
    // Ensures that the `readonly` connection pool gets
    // allocated the maximum number of connections.
    isReadonly: true
  });
  const readonlyStore = getReadonlyStore({
    kind: "postgres",
    schema,
    // Note: `ponder serve` serves data from the `publishSchema`. Also, it does
    // not need the other fields in NamespaceInfo because it only uses findUnique
    // and findMany. We should ultimately add a PublicStore interface for this.
    namespaceInfo: {
      userNamespace: databaseConfig.publishSchema
    },
    db: database.readonlyDb
  });
  const server = await createServer2({ graphqlSchema, common, readonlyStore });
  server.setHealthy();
  cleanupReloadable = async () => {
    await server.kill();
    await database.kill();
  };
  return cleanup;
}

// src/bin/commands/start.ts
import path10 from "node:path";
async function start3({ cliOptions }) {
  const options = buildOptions({ cliOptions });
  const logger = createLogger({ level: options.logLevel });
  const [major, minor, _patch] = process.versions.node.split(".").map(Number);
  if (major < 18 || major === 18 && minor < 14) {
    logger.fatal({
      service: "process",
      msg: `Invalid Node.js version. Expected >=18.14, detected ${major}.${minor}.`
    });
    await logger.kill();
    process.exit(1);
  }
  const configRelPath = path10.relative(options.rootDir, options.configFile);
  logger.debug({
    service: "app",
    msg: `Started using config file: ${configRelPath}`
  });
  const metrics = new MetricsService();
  const telemetry = createTelemetry({ options, logger });
  const common = { options, logger, metrics, telemetry };
  const buildService = await createBuildService({ common });
  let cleanupReloadable = () => Promise.resolve();
  const cleanup = async () => {
    await cleanupReloadable();
    await telemetry.kill();
  };
  const shutdown = setupShutdown({ common, cleanup });
  const initialResult = await buildService.start({ watch: false });
  await buildService.kill();
  if (initialResult.status === "error") {
    await shutdown({ reason: "Failed intial build", code: 1 });
    return cleanup;
  }
  telemetry.record({
    name: "lifecycle:session_start",
    properties: { cli_command: "start", ...buildPayload(initialResult.build) }
  });
  cleanupReloadable = await run({
    common,
    build: initialResult.build,
    onFatalError: () => {
      shutdown({ reason: "Received fatal error", code: 1 });
    },
    onReloadableError: () => {
      shutdown({ reason: "Encountered indexing error", code: 1 });
    }
  });
  return cleanup;
}

// src/bin/ponder.ts
dotenv.config({ path: ".env.local" });
var __dirname = dirname(fileURLToPath(import.meta.url));
var packageJsonPath = resolve(__dirname, "../../package.json");
var packageJson = JSON.parse(
  readFileSync5(packageJsonPath, { encoding: "utf8" })
);
var ponder = new Command("ponder").usage("<command> [OPTIONS]").helpOption("-h, --help", "Show this help message").helpCommand(false).option(
  "--root <PATH>",
  "Path to the project root directory (default: working directory)"
).option(
  "--config <PATH>",
  "Path to the project config file",
  "ponder.config.ts"
).option(
  "-v, --debug",
  "Enable debug-level logs, e.g. realtime blocks, internal events"
).option(
  "-vv, --trace",
  "Enable trace-level logs, e.g. db queries, indexing checkpoints"
).version(packageJson.version, "-V, --version", "Show the version number").configureHelp({ showGlobalOptions: true }).allowExcessArguments(false).showHelpAfterError().enablePositionalOptions(false);
var devCommand = new Command("dev").description("Start the development server with hot reloading").option("-p, --port <PORT>", "Port for the web server", Number, 42069).option("-H, --hostname <HOSTNAME>", "Hostname for the web server", "0.0.0.0").action(async (_, command) => {
  const cliOptions = {
    ...command.optsWithGlobals(),
    command: command.name()
  };
  await dev({ cliOptions });
});
var startCommand = new Command("start").description("Start the production server").option("-p, --port <PORT>", "Port for the web server", Number, 42069).option("-H, --hostname <HOSTNAME>", "Hostname for the web server", "0.0.0.0").action(async (_, command) => {
  const cliOptions = {
    ...command.optsWithGlobals(),
    command: command.name()
  };
  await start3({ cliOptions });
});
var serveCommand = new Command("serve").description("Start the production HTTP server without the indexer").option("-p, --port <PORT>", "Port for the web server", Number, 42069).option("-H, --hostname <HOSTNAME>", "Hostname for the web server", "0.0.0.0").action(async (_, command) => {
  const cliOptions = {
    ...command.optsWithGlobals(),
    command: command.name()
  };
  await serve2({ cliOptions });
});
var codegenCommand = new Command("codegen").description("Generate the schema.graphql file, then exit").action(async (_, command) => {
  const cliOptions = {
    ...command.optsWithGlobals(),
    command: command.name()
  };
  await codegen({ cliOptions });
});
ponder.addCommand(devCommand);
ponder.addCommand(startCommand);
ponder.addCommand(serveCommand);
ponder.addCommand(codegenCommand);
await ponder.parseAsync();
//# sourceMappingURL=ponder.js.map