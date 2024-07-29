export const WorldIDIdentityManager2 = [
	{ inputs: [], name: "CannotRenounceOwnership", type: "error" },
	{ inputs: [], name: "ExpiredRoot", type: "error" },
	{ inputs: [], name: "ImplementationNotInitialized", type: "error" },
	{
		inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
		name: "InvalidCommitment",
		type: "error",
	},
	{ inputs: [], name: "InvalidDeletionIndices", type: "error" },
	{ inputs: [], name: "InvalidStateBridgeAddress", type: "error" },
	{ inputs: [], name: "InvalidVerifier", type: "error" },
	{ inputs: [], name: "InvalidVerifierLUT", type: "error" },
	{ inputs: [], name: "MismatchedInputLengths", type: "error" },
	{ inputs: [], name: "NonExistentRoot", type: "error" },
	{
		inputs: [
			{ internalType: "uint256", name: "providedRoot", type: "uint256" },
			{ internalType: "uint256", name: "latestRoot", type: "uint256" },
		],
		name: "NotLatestRoot",
		type: "error",
	},
	{ inputs: [], name: "ProofValidationFailure", type: "error" },
	{ inputs: [], name: "StateBridgeAlreadyDisabled", type: "error" },
	{ inputs: [], name: "StateBridgeAlreadyEnabled", type: "error" },
	{
		inputs: [{ internalType: "address", name: "user", type: "address" }],
		name: "Unauthorized",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "enum WorldIDIdentityManagerImplV1.UnreducedElementType",
				name: "elementType",
				type: "uint8",
			},
			{ internalType: "uint256", name: "element", type: "uint256" },
		],
		name: "UnreducedElement",
		type: "error",
	},
	{
		inputs: [{ internalType: "uint8", name: "depth", type: "uint8" }],
		name: "UnsupportedTreeDepth",
		type: "error",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "previousAdmin",
				type: "address",
			},
			{
				indexed: false,
				internalType: "address",
				name: "newAdmin",
				type: "address",
			},
		],
		name: "AdminChanged",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "beacon",
				type: "address",
			},
		],
		name: "BeaconUpgraded",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "enum WorldIDIdentityManagerImplV1.Dependency",
				name: "kind",
				type: "uint8",
			},
			{
				indexed: true,
				internalType: "address",
				name: "oldAddress",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newAddress",
				type: "address",
			},
		],
		name: "DependencyUpdated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "oldOperator",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOperator",
				type: "address",
			},
		],
		name: "IdentityOperatorChanged",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: "uint8", name: "version", type: "uint8" },
		],
		name: "Initialized",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "OwnershipTransferStarted",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "OwnershipTransferred",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "oldExpiryTime",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "newExpiryTime",
				type: "uint256",
			},
		],
		name: "RootHistoryExpirySet",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "bool", name: "isEnabled", type: "bool" },
		],
		name: "StateBridgeStateChange",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "preRoot",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "enum WorldIDIdentityManagerImplV1.TreeChange",
				name: "kind",
				type: "uint8",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "postRoot",
				type: "uint256",
			},
		],
		name: "TreeChanged",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "implementation",
				type: "address",
			},
		],
		name: "Upgraded",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint8",
				name: "_treeDepth",
				type: "uint8",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "initialRoot",
				type: "uint256",
			},
		],
		name: "WorldIDIdentityManagerImplInitialized",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [],
		name: "WorldIDIdentityManagerImplV2Initialized",
		type: "event",
	},
	{
		inputs: [],
		name: "NO_SUCH_ROOT",
		outputs: [
			{
				components: [
					{ internalType: "uint256", name: "root", type: "uint256" },
					{
						internalType: "uint128",
						name: "supersededTimestamp",
						type: "uint128",
					},
					{ internalType: "bool", name: "isValid", type: "bool" },
				],
				internalType: "struct WorldIDIdentityManagerImplV1.RootInfo",
				name: "rootInfo",
				type: "tuple",
			},
		],
		stateMutability: "pure",
		type: "function",
	},
	{
		inputs: [],
		name: "acceptOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "bytes", name: "packedDeletionIndices", type: "bytes" },
			{ internalType: "uint256", name: "preRoot", type: "uint256" },
			{ internalType: "uint256", name: "postRoot", type: "uint256" },
			{ internalType: "uint32", name: "batchSize", type: "uint32" },
		],
		name: "calculateIdentityDeletionInputHash",
		outputs: [{ internalType: "bytes32", name: "hash", type: "bytes32" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint32", name: "startIndex", type: "uint32" },
			{ internalType: "uint256", name: "preRoot", type: "uint256" },
			{ internalType: "uint256", name: "postRoot", type: "uint256" },
			{
				internalType: "uint256[]",
				name: "identityCommitments",
				type: "uint256[]",
			},
		],
		name: "calculateIdentityRegistrationInputHash",
		outputs: [{ internalType: "bytes32", name: "hash", type: "bytes32" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256[8]", name: "deletionProof", type: "uint256[8]" },
			{ internalType: "bytes", name: "packedDeletionIndices", type: "bytes" },
			{ internalType: "uint256", name: "preRoot", type: "uint256" },
			{ internalType: "uint256", name: "postRoot", type: "uint256" },
		],
		name: "deleteIdentities",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getDeleteIdentitiesVerifierLookupTableAddress",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getRegisterIdentitiesVerifierLookupTableAddress",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getRootHistoryExpiry",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getSemaphoreVerifierAddress",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getTreeDepth",
		outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "identityOperator",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint8", name: "_treeDepth", type: "uint8" },
			{ internalType: "uint256", name: "initialRoot", type: "uint256" },
			{
				internalType: "contract VerifierLookupTable",
				name: "_batchInsertionVerifiers",
				type: "address",
			},
			{
				internalType: "contract VerifierLookupTable",
				name: "_batchUpdateVerifiers",
				type: "address",
			},
			{
				internalType: "contract ISemaphoreVerifier",
				name: "_semaphoreVerifier",
				type: "address",
			},
		],
		name: "initialize",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "contract VerifierLookupTable",
				name: "_batchDeletionVerifiers",
				type: "address",
			},
		],
		name: "initializeV2",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "latestRoot",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "pendingOwner",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "proxiableUUID",
		outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "root", type: "uint256" }],
		name: "queryRoot",
		outputs: [
			{
				components: [
					{ internalType: "uint256", name: "root", type: "uint256" },
					{
						internalType: "uint128",
						name: "supersededTimestamp",
						type: "uint128",
					},
					{ internalType: "bool", name: "isValid", type: "bool" },
				],
				internalType: "struct WorldIDIdentityManagerImplV1.RootInfo",
				name: "",
				type: "tuple",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256[8]",
				name: "insertionProof",
				type: "uint256[8]",
			},
			{ internalType: "uint256", name: "preRoot", type: "uint256" },
			{ internalType: "uint32", name: "startIndex", type: "uint32" },
			{
				internalType: "uint256[]",
				name: "identityCommitments",
				type: "uint256[]",
			},
			{ internalType: "uint256", name: "postRoot", type: "uint256" },
		],
		name: "registerIdentities",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "root", type: "uint256" }],
		name: "requireValidRoot",
		outputs: [],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "contract VerifierLookupTable",
				name: "newTable",
				type: "address",
			},
		],
		name: "setDeleteIdentitiesVerifierLookupTable",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "newIdentityOperator", type: "address" },
		],
		name: "setIdentityOperator",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "contract VerifierLookupTable",
				name: "newTable",
				type: "address",
			},
		],
		name: "setRegisterIdentitiesVerifierLookupTable",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "newExpiryTime", type: "uint256" },
		],
		name: "setRootHistoryExpiry",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "contract ISemaphoreVerifier",
				name: "newVerifier",
				type: "address",
			},
		],
		name: "setSemaphoreVerifier",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "newImplementation", type: "address" },
		],
		name: "upgradeTo",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "newImplementation", type: "address" },
			{ internalType: "bytes", name: "data", type: "bytes" },
		],
		name: "upgradeToAndCall",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "root", type: "uint256" },
			{ internalType: "uint256", name: "signalHash", type: "uint256" },
			{ internalType: "uint256", name: "nullifierHash", type: "uint256" },
			{
				internalType: "uint256",
				name: "externalNullifierHash",
				type: "uint256",
			},
			{ internalType: "uint256[8]", name: "proof", type: "uint256[8]" },
		],
		name: "verifyProof",
		outputs: [],
		stateMutability: "view",
		type: "function",
	},
] as const;