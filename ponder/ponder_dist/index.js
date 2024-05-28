// src/config/config.ts
import "viem";
var createConfig = (config) => config;

// src/schema/columns.ts
var optional = (col) => (
  // @ts-expect-error
  () => {
    const newCol = {
      " type": col[" type"],
      " scalar": col[" scalar"],
      " optional": true,
      " list": col[" list"]
    };
    if (newCol[" list"]) {
      return newCol;
    } else {
      return {
        ...newCol,
        list: list(newCol),
        references: references(newCol)
      };
    }
  }
);
var list = (col) => (
  // @ts-expect-error
  () => {
    const newCol = {
      " type": col[" type"],
      " scalar": col[" scalar"],
      " optional": col[" optional"],
      " list": true
    };
    if (newCol[" optional"]) {
      return newCol;
    } else {
      return {
        ...newCol,
        optional: optional(newCol)
      };
    }
  }
);
var enumOptional = (col) => (
  // @ts-expect-error
  () => {
    const newCol = {
      " type": col[" type"],
      " enum": col[" enum"],
      " optional": true,
      " list": col[" list"]
    };
    if (newCol[" list"]) {
      return newCol;
    } else {
      return {
        ...newCol,
        list: enumList(newCol)
      };
    }
  }
);
var enumList = (col) => (
  // @ts-expect-error
  () => {
    const newCol = {
      " type": col[" type"],
      " enum": col[" enum"],
      " optional": col[" optional"],
      " list": true
    };
    if (newCol[" optional"]) {
      return newCol;
    } else {
      return {
        ...newCol,
        optional: enumOptional(newCol)
      };
    }
  }
);
var asc = (i) => (
  // @ts-expect-error
  () => {
    const newIndex = {
      " type": i[" type"],
      " column": i[" column"],
      " order": "asc",
      " nulls": i[" nulls"]
    };
    if (newIndex[" nulls"] === void 0) {
      return {
        ...newIndex,
        nullsFirst: nullsFirst(newIndex),
        nullsLast: nullsLast(newIndex)
      };
    } else {
      return newIndex;
    }
  }
);
var desc = (i) => (
  // @ts-expect-error
  () => {
    const newIndex = {
      " type": i[" type"],
      " column": i[" column"],
      " order": "desc",
      " nulls": i[" nulls"]
    };
    if (newIndex[" nulls"] === void 0) {
      return {
        ...newIndex,
        nullsFirst: nullsFirst(newIndex),
        nullsLast: nullsLast(newIndex)
      };
    } else {
      return newIndex;
    }
  }
);
var nullsFirst = (i) => (
  // @ts-expect-error
  () => {
    const newIndex = {
      " type": i[" type"],
      " column": i[" column"],
      " order": i[" order"],
      " nulls": "first"
    };
    if (newIndex[" order"] === void 0) {
      return {
        ...newIndex,
        asc: asc(newIndex),
        desc: desc(newIndex)
      };
    } else {
      return newIndex;
    }
  }
);
var nullsLast = (i) => (
  // @ts-expect-error
  () => {
    const newIndex = {
      " type": i[" type"],
      " column": i[" column"],
      " order": i[" order"],
      " nulls": "last"
    };
    if (newIndex[" order"] === void 0) {
      return {
        ...newIndex,
        asc: asc(newIndex),
        desc: desc(newIndex)
      };
    } else {
      return newIndex;
    }
  }
);
var referenceOptional = (col) => () => {
  return {
    " type": col[" type"],
    " scalar": col[" scalar"],
    " optional": true,
    " reference": col[" reference"]
  };
};
var references = (col) => (
  // @ts-expect-error
  (ref) => {
    const newCol = {
      " type": "reference",
      " scalar": col[" scalar"],
      " optional": col[" optional"],
      " reference": ref
    };
    if (newCol[" optional"]) {
      return newCol;
    } else {
      return { ...newCol, optional: referenceOptional(newCol) };
    }
  }
);
var jsonOptional = (col) => () => {
  return {
    " type": "json",
    " json": {},
    " optional": true
  };
};
var scalarColumn = (_scalar) => () => {
  const column = {
    " type": "scalar",
    " scalar": _scalar,
    " optional": false,
    " list": false
  };
  return {
    ...column,
    optional: optional(column),
    list: list(column),
    references: references(column)
  };
};
var string = scalarColumn("string");
var int = scalarColumn("int");
var float = scalarColumn("float");
var boolean = scalarColumn("boolean");
var hex = scalarColumn("hex");
var bigint = scalarColumn("bigint");
var json = () => {
  const column = {
    " type": "json",
    " json": {},
    " optional": false
  };
  return {
    ...column,
    optional: jsonOptional(column)
  };
};
var one = (ref) => ({
  " type": "one",
  " reference": ref
});
var many = (ref) => ({
  " type": "many",
  " referenceTable": ref.split(".")[0],
  " referenceColumn": ref.split(".")[1]
});
var _enum = (__enum) => {
  const column = {
    " type": "enum",
    " enum": __enum,
    " optional": false,
    " list": false
  };
  return {
    ...column,
    optional: enumOptional(column),
    list: enumList(column)
  };
};
var index = (c) => {
  const index2 = {
    " type": "index",
    " column": c,
    " order": void 0,
    " nulls": void 0
  };
  return {
    ...index2,
    asc: asc(index2),
    desc: desc(index2),
    nullsFirst: nullsFirst(index2),
    nullsLast: nullsLast(index2)
  };
};

// src/schema/schema.ts
var createTable = (t, c) => ({
  table: t,
  constraints: c
});
var createEnum = (e) => e;
var P = {
  createTable,
  createEnum,
  string,
  bigint,
  int,
  float,
  hex,
  boolean,
  json,
  one,
  many,
  enum: _enum,
  index
};
var createSchema = (_schema) => {
  return _schema(P);
};

// src/index.ts
import {
  mergeAbis,
  loadBalance,
  rateLimit,
  replaceBigInts
} from "@ponder/utils";
export {
  createConfig,
  createSchema,
  loadBalance,
  mergeAbis,
  rateLimit,
  replaceBigInts
};
//# sourceMappingURL=index.js.map