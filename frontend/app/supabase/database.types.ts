export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  atlas: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      _ponder_meta: {
        Row: {
          key: string | null;
          value: Json | null;
        };
        Insert: {
          key?: string | null;
          value?: Json | null;
        };
        Update: {
          key?: string | null;
          value?: Json | null;
        };
        Relationships: [];
      };
      DailyStats: {
        Row: {
          avgIdentitiesPerRoot: number | null;
          churnRate: number | null;
          date: number | null;
          gasSpent: number | null;
          gasSpentPerIdentityDeletion: number | null;
          gasSpentPerIdentityInsertion: number | null;
          id: string | null;
          totalDeletions: number | null;
          totalIdentities: number | null;
          totalInsertions: number | null;
          totalRoots: number | null;
        };
        Insert: {
          avgIdentitiesPerRoot?: number | null;
          churnRate?: number | null;
          date?: number | null;
          gasSpent?: number | null;
          gasSpentPerIdentityDeletion?: number | null;
          gasSpentPerIdentityInsertion?: number | null;
          id?: string | null;
          totalDeletions?: number | null;
          totalIdentities?: number | null;
          totalInsertions?: number | null;
          totalRoots?: number | null;
        };
        Update: {
          avgIdentitiesPerRoot?: number | null;
          churnRate?: number | null;
          date?: number | null;
          gasSpent?: number | null;
          gasSpentPerIdentityDeletion?: number | null;
          gasSpentPerIdentityInsertion?: number | null;
          id?: string | null;
          totalDeletions?: number | null;
          totalIdentities?: number | null;
          totalInsertions?: number | null;
          totalRoots?: number | null;
        };
        Relationships: [];
      };
      Root: {
        Row: {
          batchSize: number | null;
          blockNumber: number | null;
          child: string | null;
          commitments: string | null;
          contractAddress: string | null;
          contractName: string | null;
          createdTx: string | null;
          id: string | null;
          kind: string | null;
          parent: string | null;
          proof: string | null;
          timestamp: number | null;
        };
        Insert: {
          batchSize?: number | null;
          blockNumber?: number | null;
          child?: string | null;
          commitments?: string | null;
          contractAddress?: string | null;
          contractName?: string | null;
          createdTx?: string | null;
          id?: string | null;
          kind?: string | null;
          parent?: string | null;
          proof?: string | null;
          timestamp?: number | null;
        };
        Update: {
          batchSize?: number | null;
          blockNumber?: number | null;
          child?: string | null;
          commitments?: string | null;
          contractAddress?: string | null;
          contractName?: string | null;
          createdTx?: string | null;
          id?: string | null;
          kind?: string | null;
          parent?: string | null;
          proof?: string | null;
          timestamp?: number | null;
        };
        Relationships: [];
      };
      TotalStats: {
        Row: {
          avgIdentitiesPerRoot: number | null;
          churnRate: number | null;
          gasSpent: number | null;
          gasSpentPerIdentityDeletion: number | null;
          gasSpentPerIdentityInsertion: number | null;
          id: string | null;
          totalDeletions: number | null;
          totalIdentities: number | null;
          totalInsertions: number | null;
          totalRoots: number | null;
        };
        Insert: {
          avgIdentitiesPerRoot?: number | null;
          churnRate?: number | null;
          gasSpent?: number | null;
          gasSpentPerIdentityDeletion?: number | null;
          gasSpentPerIdentityInsertion?: number | null;
          id?: string | null;
          totalDeletions?: number | null;
          totalIdentities?: number | null;
          totalInsertions?: number | null;
          totalRoots?: number | null;
        };
        Update: {
          avgIdentitiesPerRoot?: number | null;
          churnRate?: number | null;
          gasSpent?: number | null;
          gasSpentPerIdentityDeletion?: number | null;
          gasSpentPerIdentityInsertion?: number | null;
          id?: string | null;
          totalDeletions?: number | null;
          totalIdentities?: number | null;
          totalInsertions?: number | null;
          totalRoots?: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  pgtle: {
    Tables: {
      feature_info: {
        Row: {
          feature: Database["pgtle"]["Enums"]["pg_tle_features"];
          obj_identity: string;
          proname: string;
          schema_name: string;
        };
        Insert: {
          feature: Database["pgtle"]["Enums"]["pg_tle_features"];
          obj_identity: string;
          proname: string;
          schema_name: string;
        };
        Update: {
          feature?: Database["pgtle"]["Enums"]["pg_tle_features"];
          obj_identity?: string;
          proname?: string;
          schema_name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      available_extension_versions: {
        Args: Record<PropertyKey, never>;
        Returns: Record<string, unknown>[];
      };
      available_extensions: {
        Args: Record<PropertyKey, never>;
        Returns: Record<string, unknown>[];
      };
      create_base_type: {
        Args: {
          typenamespace: unknown;
          typename: unknown;
          infunc: unknown;
          outfunc: unknown;
          internallength: number;
        };
        Returns: undefined;
      };
      create_base_type_if_not_exists: {
        Args: {
          typenamespace: unknown;
          typename: unknown;
          infunc: unknown;
          outfunc: unknown;
          internallength: number;
        };
        Returns: boolean;
      };
      create_operator_func: {
        Args: {
          typenamespace: unknown;
          typename: unknown;
          opfunc: unknown;
        };
        Returns: undefined;
      };
      create_operator_func_if_not_exists: {
        Args: {
          typenamespace: unknown;
          typename: unknown;
          opfunc: unknown;
        };
        Returns: boolean;
      };
      create_shell_type: {
        Args: {
          typenamespace: unknown;
          typename: unknown;
        };
        Returns: undefined;
      };
      create_shell_type_if_not_exists: {
        Args: {
          typenamespace: unknown;
          typename: unknown;
        };
        Returns: boolean;
      };
      extension_update_paths: {
        Args: {
          name: unknown;
        };
        Returns: Record<string, unknown>[];
      };
      install_extension: {
        Args: {
          name: string;
          version: string;
          description: string;
          ext: string;
          requires?: string[];
        };
        Returns: boolean;
      };
      install_extension_version_sql: {
        Args: {
          name: string;
          version: string;
          ext: string;
        };
        Returns: boolean;
      };
      install_update_path: {
        Args: {
          name: string;
          fromvers: string;
          tovers: string;
          ext: string;
        };
        Returns: boolean;
      };
      "pgjwt--0.2.0.sql": {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      "pgjwt.control": {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      register_feature: {
        Args: {
          proc: unknown;
          feature: Database["pgtle"]["Enums"]["pg_tle_features"];
        };
        Returns: undefined;
      };
      register_feature_if_not_exists: {
        Args: {
          proc: unknown;
          feature: Database["pgtle"]["Enums"]["pg_tle_features"];
        };
        Returns: boolean;
      };
      set_default_version: {
        Args: {
          name: string;
          version: string;
        };
        Returns: boolean;
      };
      uninstall_extension:
        | {
            Args: {
              extname: string;
            };
            Returns: boolean;
          }
        | {
            Args: {
              extname: string;
              version: string;
            };
            Returns: boolean;
          };
      uninstall_extension_if_exists: {
        Args: {
          extname: string;
        };
        Returns: boolean;
      };
      uninstall_update_path: {
        Args: {
          extname: string;
          fromvers: string;
          tovers: string;
        };
        Returns: boolean;
      };
      uninstall_update_path_if_exists: {
        Args: {
          extname: string;
          fromvers: string;
          tovers: string;
        };
        Returns: boolean;
      };
      unregister_feature: {
        Args: {
          proc: unknown;
          feature: Database["pgtle"]["Enums"]["pg_tle_features"];
        };
        Returns: undefined;
      };
      unregister_feature_if_exists: {
        Args: {
          proc: unknown;
          feature: Database["pgtle"]["Enums"]["pg_tle_features"];
        };
        Returns: boolean;
      };
    };
    Enums: {
      password_types:
        | "PASSWORD_TYPE_PLAINTEXT"
        | "PASSWORD_TYPE_MD5"
        | "PASSWORD_TYPE_SCRAM_SHA_256";
      pg_tle_features: "passcheck";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  ponder: {
    Tables: {
      "02c2843a27": {
        Row: {
          avgIdentitiesPerRoot: number | null;
          checkpoint: string;
          churnRate: number | null;
          date: number | null;
          gasSpent: number | null;
          gasSpentPerIdentityDeletion: number | null;
          gasSpentPerIdentityInsertion: number | null;
          id: string;
          operation: number;
          operation_id: number;
          totalDeletions: number | null;
          totalIdentities: number | null;
          totalInsertions: number | null;
          totalRoots: number | null;
        };
        Insert: {
          avgIdentitiesPerRoot?: number | null;
          checkpoint: string;
          churnRate?: number | null;
          date?: number | null;
          gasSpent?: number | null;
          gasSpentPerIdentityDeletion?: number | null;
          gasSpentPerIdentityInsertion?: number | null;
          id: string;
          operation: number;
          operation_id?: number;
          totalDeletions?: number | null;
          totalIdentities?: number | null;
          totalInsertions?: number | null;
          totalRoots?: number | null;
        };
        Update: {
          avgIdentitiesPerRoot?: number | null;
          checkpoint?: string;
          churnRate?: number | null;
          date?: number | null;
          gasSpent?: number | null;
          gasSpentPerIdentityDeletion?: number | null;
          gasSpentPerIdentityInsertion?: number | null;
          id?: string;
          operation?: number;
          operation_id?: number;
          totalDeletions?: number | null;
          totalIdentities?: number | null;
          totalInsertions?: number | null;
          totalRoots?: number | null;
        };
        Relationships: [];
      };
      "5123b12363": {
        Row: {
          batchSize: number | null;
          blockNumber: number | null;
          checkpoint: string;
          child: string | null;
          commitments: string | null;
          contractAddress: string | null;
          contractName: string | null;
          createdTx: string | null;
          id: string;
          kind: string | null;
          operation: number;
          operation_id: number;
          parent: string | null;
          proof: string | null;
          timestamp: number | null;
        };
        Insert: {
          batchSize?: number | null;
          blockNumber?: number | null;
          checkpoint: string;
          child?: string | null;
          commitments?: string | null;
          contractAddress?: string | null;
          contractName?: string | null;
          createdTx?: string | null;
          id: string;
          kind?: string | null;
          operation: number;
          operation_id?: number;
          parent?: string | null;
          proof?: string | null;
          timestamp?: number | null;
        };
        Update: {
          batchSize?: number | null;
          blockNumber?: number | null;
          checkpoint?: string;
          child?: string | null;
          commitments?: string | null;
          contractAddress?: string | null;
          contractName?: string | null;
          createdTx?: string | null;
          id?: string;
          kind?: string | null;
          operation?: number;
          operation_id?: number;
          parent?: string | null;
          proof?: string | null;
          timestamp?: number | null;
        };
        Relationships: [];
      };
      d2b40ad033: {
        Row: {
          avgIdentitiesPerRoot: number | null;
          checkpoint: string;
          churnRate: number | null;
          gasSpent: number | null;
          gasSpentPerIdentityDeletion: number | null;
          gasSpentPerIdentityInsertion: number | null;
          id: string;
          operation: number;
          operation_id: number;
          totalDeletions: number | null;
          totalIdentities: number | null;
          totalInsertions: number | null;
          totalRoots: number | null;
        };
        Insert: {
          avgIdentitiesPerRoot?: number | null;
          checkpoint: string;
          churnRate?: number | null;
          gasSpent?: number | null;
          gasSpentPerIdentityDeletion?: number | null;
          gasSpentPerIdentityInsertion?: number | null;
          id: string;
          operation: number;
          operation_id?: number;
          totalDeletions?: number | null;
          totalIdentities?: number | null;
          totalInsertions?: number | null;
          totalRoots?: number | null;
        };
        Update: {
          avgIdentitiesPerRoot?: number | null;
          checkpoint?: string;
          churnRate?: number | null;
          gasSpent?: number | null;
          gasSpentPerIdentityDeletion?: number | null;
          gasSpentPerIdentityInsertion?: number | null;
          id?: string;
          operation?: number;
          operation_id?: number;
          totalDeletions?: number | null;
          totalIdentities?: number | null;
          totalInsertions?: number | null;
          totalRoots?: number | null;
        };
        Relationships: [];
      };
      kysely_migration: {
        Row: {
          name: string;
          timestamp: string;
        };
        Insert: {
          name: string;
          timestamp: string;
        };
        Update: {
          name?: string;
          timestamp?: string;
        };
        Relationships: [];
      };
      kysely_migration_lock: {
        Row: {
          id: string;
          is_locked: number;
        };
        Insert: {
          id: string;
          is_locked?: number;
        };
        Update: {
          id?: string;
          is_locked?: number;
        };
        Relationships: [];
      };
      namespace_lock: {
        Row: {
          build_id: string;
          finalized_checkpoint: string;
          heartbeat_at: number;
          is_locked: number;
          namespace: string;
          schema: Json;
        };
        Insert: {
          build_id: string;
          finalized_checkpoint: string;
          heartbeat_at: number;
          is_locked: number;
          namespace: string;
          schema: Json;
        };
        Update: {
          build_id?: string;
          finalized_checkpoint?: string;
          heartbeat_at?: number;
          is_locked?: number;
          namespace?: string;
          schema?: Json;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  ponder_data: {
    Tables: {
      _ponder_meta: {
        Row: {
          key: string;
          value: Json | null;
        };
        Insert: {
          key: string;
          value?: Json | null;
        };
        Update: {
          key?: string;
          value?: Json | null;
        };
        Relationships: [];
      };
      DailyStats: {
        Row: {
          avgIdentitiesPerRoot: number;
          churnRate: number;
          date: number;
          gasSpent: number;
          gasSpentPerIdentityDeletion: number;
          gasSpentPerIdentityInsertion: number;
          id: string;
          totalDeletions: number;
          totalIdentities: number;
          totalInsertions: number;
          totalRoots: number;
        };
        Insert: {
          avgIdentitiesPerRoot: number;
          churnRate: number;
          date: number;
          gasSpent: number;
          gasSpentPerIdentityDeletion: number;
          gasSpentPerIdentityInsertion: number;
          id: string;
          totalDeletions: number;
          totalIdentities: number;
          totalInsertions: number;
          totalRoots: number;
        };
        Update: {
          avgIdentitiesPerRoot?: number;
          churnRate?: number;
          date?: number;
          gasSpent?: number;
          gasSpentPerIdentityDeletion?: number;
          gasSpentPerIdentityInsertion?: number;
          id?: string;
          totalDeletions?: number;
          totalIdentities?: number;
          totalInsertions?: number;
          totalRoots?: number;
        };
        Relationships: [];
      };
      Root: {
        Row: {
          batchSize: number;
          blockNumber: number;
          child: string | null;
          commitments: string;
          contractAddress: string;
          contractName: string | null;
          createdTx: string;
          id: string;
          kind: string | null;
          parent: string;
          proof: string;
          timestamp: number;
        };
        Insert: {
          batchSize: number;
          blockNumber: number;
          child?: string | null;
          commitments: string;
          contractAddress: string;
          contractName?: string | null;
          createdTx: string;
          id: string;
          kind?: string | null;
          parent: string;
          proof: string;
          timestamp: number;
        };
        Update: {
          batchSize?: number;
          blockNumber?: number;
          child?: string | null;
          commitments?: string;
          contractAddress?: string;
          contractName?: string | null;
          createdTx?: string;
          id?: string;
          kind?: string | null;
          parent?: string;
          proof?: string;
          timestamp?: number;
        };
        Relationships: [];
      };
      TotalStats: {
        Row: {
          avgIdentitiesPerRoot: number;
          churnRate: number;
          gasSpent: number;
          gasSpentPerIdentityDeletion: number;
          gasSpentPerIdentityInsertion: number;
          id: string;
          totalDeletions: number;
          totalIdentities: number;
          totalInsertions: number;
          totalRoots: number;
        };
        Insert: {
          avgIdentitiesPerRoot: number;
          churnRate: number;
          gasSpent: number;
          gasSpentPerIdentityDeletion: number;
          gasSpentPerIdentityInsertion: number;
          id: string;
          totalDeletions: number;
          totalIdentities: number;
          totalInsertions: number;
          totalRoots: number;
        };
        Update: {
          avgIdentitiesPerRoot?: number;
          churnRate?: number;
          gasSpent?: number;
          gasSpentPerIdentityDeletion?: number;
          gasSpentPerIdentityInsertion?: number;
          id?: string;
          totalDeletions?: number;
          totalIdentities?: number;
          totalInsertions?: number;
          totalRoots?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      getrollingsumtotalidentities: {
        Args: {
          limit_rows?: number;
        };
        Returns: {
          date: number;
          rolling_sum_total_identities: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  ponder_sync: {
    Tables: {
      blockFilterIntervals: {
        Row: {
          blockFilterId: string;
          endBlock: number;
          id: number;
          startBlock: number;
        };
        Insert: {
          blockFilterId: string;
          endBlock: number;
          id?: number;
          startBlock: number;
        };
        Update: {
          blockFilterId?: string;
          endBlock?: number;
          id?: number;
          startBlock?: number;
        };
        Relationships: [
          {
            foreignKeyName: "blockFilterIntervals_blockFilterId_fkey";
            columns: ["blockFilterId"];
            referencedRelation: "blockFilters";
            referencedColumns: ["id"];
          },
        ];
      };
      blockFilters: {
        Row: {
          chainId: number;
          id: string;
          interval: number;
          offset: number;
        };
        Insert: {
          chainId: number;
          id: string;
          interval: number;
          offset: number;
        };
        Update: {
          chainId?: number;
          id?: string;
          interval?: number;
          offset?: number;
        };
        Relationships: [];
      };
      blocks: {
        Row: {
          baseFeePerGas: number | null;
          chainId: number;
          checkpoint: string;
          difficulty: number;
          extraData: string;
          gasLimit: number;
          gasUsed: number;
          hash: string;
          logsBloom: string;
          miner: string;
          mixHash: string | null;
          nonce: string | null;
          number: number;
          parentHash: string;
          receiptsRoot: string;
          sha3Uncles: string | null;
          size: number;
          stateRoot: string;
          timestamp: number;
          totalDifficulty: number | null;
          transactionsRoot: string;
        };
        Insert: {
          baseFeePerGas?: number | null;
          chainId: number;
          checkpoint: string;
          difficulty: number;
          extraData: string;
          gasLimit: number;
          gasUsed: number;
          hash: string;
          logsBloom: string;
          miner: string;
          mixHash?: string | null;
          nonce?: string | null;
          number: number;
          parentHash: string;
          receiptsRoot: string;
          sha3Uncles?: string | null;
          size: number;
          stateRoot: string;
          timestamp: number;
          totalDifficulty?: number | null;
          transactionsRoot: string;
        };
        Update: {
          baseFeePerGas?: number | null;
          chainId?: number;
          checkpoint?: string;
          difficulty?: number;
          extraData?: string;
          gasLimit?: number;
          gasUsed?: number;
          hash?: string;
          logsBloom?: string;
          miner?: string;
          mixHash?: string | null;
          nonce?: string | null;
          number?: number;
          parentHash?: string;
          receiptsRoot?: string;
          sha3Uncles?: string | null;
          size?: number;
          stateRoot?: string;
          timestamp?: number;
          totalDifficulty?: number | null;
          transactionsRoot?: string;
        };
        Relationships: [];
      };
      callTraces: {
        Row: {
          blockHash: string;
          blockNumber: number;
          callType: string;
          chainId: number;
          checkpoint: string;
          error: string | null;
          from: string;
          functionSelector: string;
          gas: number;
          gasUsed: number | null;
          id: string;
          input: string;
          output: string | null;
          subtraces: number;
          to: string;
          traceAddress: string;
          transactionHash: string;
          transactionPosition: number;
          value: number;
        };
        Insert: {
          blockHash: string;
          blockNumber: number;
          callType: string;
          chainId: number;
          checkpoint: string;
          error?: string | null;
          from: string;
          functionSelector: string;
          gas: number;
          gasUsed?: number | null;
          id: string;
          input: string;
          output?: string | null;
          subtraces: number;
          to: string;
          traceAddress: string;
          transactionHash: string;
          transactionPosition: number;
          value: number;
        };
        Update: {
          blockHash?: string;
          blockNumber?: number;
          callType?: string;
          chainId?: number;
          checkpoint?: string;
          error?: string | null;
          from?: string;
          functionSelector?: string;
          gas?: number;
          gasUsed?: number | null;
          id?: string;
          input?: string;
          output?: string | null;
          subtraces?: number;
          to?: string;
          traceAddress?: string;
          transactionHash?: string;
          transactionPosition?: number;
          value?: number;
        };
        Relationships: [];
      };
      factoryLogFilterIntervals: {
        Row: {
          endBlock: number;
          factoryId: string;
          id: number;
          startBlock: number;
        };
        Insert: {
          endBlock: number;
          factoryId: string;
          id?: number;
          startBlock: number;
        };
        Update: {
          endBlock?: number;
          factoryId?: string;
          id?: number;
          startBlock?: number;
        };
        Relationships: [];
      };
      factoryLogFilters: {
        Row: {
          address: string;
          chainId: number;
          childAddressLocation: string;
          eventSelector: string;
          id: string;
          includeTransactionReceipts: number;
          topic0: string | null;
          topic1: string | null;
          topic2: string | null;
          topic3: string | null;
        };
        Insert: {
          address: string;
          chainId: number;
          childAddressLocation: string;
          eventSelector: string;
          id: string;
          includeTransactionReceipts: number;
          topic0?: string | null;
          topic1?: string | null;
          topic2?: string | null;
          topic3?: string | null;
        };
        Update: {
          address?: string;
          chainId?: number;
          childAddressLocation?: string;
          eventSelector?: string;
          id?: string;
          includeTransactionReceipts?: number;
          topic0?: string | null;
          topic1?: string | null;
          topic2?: string | null;
          topic3?: string | null;
        };
        Relationships: [];
      };
      factoryTraceFilterIntervals: {
        Row: {
          endBlock: number;
          factoryId: string | null;
          id: number;
          startBlock: number;
        };
        Insert: {
          endBlock: number;
          factoryId?: string | null;
          id?: number;
          startBlock: number;
        };
        Update: {
          endBlock?: number;
          factoryId?: string | null;
          id?: number;
          startBlock?: number;
        };
        Relationships: [];
      };
      factoryTraceFilters: {
        Row: {
          address: string;
          chainId: number;
          childAddressLocation: string;
          eventSelector: string;
          fromAddress: string | null;
          id: string;
        };
        Insert: {
          address: string;
          chainId: number;
          childAddressLocation: string;
          eventSelector: string;
          fromAddress?: string | null;
          id: string;
        };
        Update: {
          address?: string;
          chainId?: number;
          childAddressLocation?: string;
          eventSelector?: string;
          fromAddress?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      kysely_migration: {
        Row: {
          name: string;
          timestamp: string;
        };
        Insert: {
          name: string;
          timestamp: string;
        };
        Update: {
          name?: string;
          timestamp?: string;
        };
        Relationships: [];
      };
      kysely_migration_lock: {
        Row: {
          id: string;
          is_locked: number;
        };
        Insert: {
          id: string;
          is_locked?: number;
        };
        Update: {
          id?: string;
          is_locked?: number;
        };
        Relationships: [];
      };
      logFilterIntervals: {
        Row: {
          endBlock: number;
          id: number;
          logFilterId: string;
          startBlock: number;
        };
        Insert: {
          endBlock: number;
          id?: number;
          logFilterId: string;
          startBlock: number;
        };
        Update: {
          endBlock?: number;
          id?: number;
          logFilterId?: string;
          startBlock?: number;
        };
        Relationships: [];
      };
      logFilters: {
        Row: {
          address: string | null;
          chainId: number;
          id: string;
          includeTransactionReceipts: number;
          topic0: string | null;
          topic1: string | null;
          topic2: string | null;
          topic3: string | null;
        };
        Insert: {
          address?: string | null;
          chainId: number;
          id: string;
          includeTransactionReceipts: number;
          topic0?: string | null;
          topic1?: string | null;
          topic2?: string | null;
          topic3?: string | null;
        };
        Update: {
          address?: string | null;
          chainId?: number;
          id?: string;
          includeTransactionReceipts?: number;
          topic0?: string | null;
          topic1?: string | null;
          topic2?: string | null;
          topic3?: string | null;
        };
        Relationships: [];
      };
      logs: {
        Row: {
          address: string;
          blockHash: string;
          blockNumber: number;
          chainId: number;
          checkpoint: string | null;
          data: string;
          id: string;
          logIndex: number;
          topic0: string | null;
          topic1: string | null;
          topic2: string | null;
          topic3: string | null;
          transactionHash: string;
          transactionIndex: number;
        };
        Insert: {
          address: string;
          blockHash: string;
          blockNumber: number;
          chainId: number;
          checkpoint?: string | null;
          data: string;
          id: string;
          logIndex: number;
          topic0?: string | null;
          topic1?: string | null;
          topic2?: string | null;
          topic3?: string | null;
          transactionHash: string;
          transactionIndex: number;
        };
        Update: {
          address?: string;
          blockHash?: string;
          blockNumber?: number;
          chainId?: number;
          checkpoint?: string | null;
          data?: string;
          id?: string;
          logIndex?: number;
          topic0?: string | null;
          topic1?: string | null;
          topic2?: string | null;
          topic3?: string | null;
          transactionHash?: string;
          transactionIndex?: number;
        };
        Relationships: [];
      };
      rpcRequestResults: {
        Row: {
          blockNumber: number;
          chainId: number;
          request: string;
          result: string;
        };
        Insert: {
          blockNumber: number;
          chainId: number;
          request: string;
          result: string;
        };
        Update: {
          blockNumber?: number;
          chainId?: number;
          request?: string;
          result?: string;
        };
        Relationships: [];
      };
      traceFilterIntervals: {
        Row: {
          endBlock: number;
          id: number;
          startBlock: number;
          traceFilterId: string;
        };
        Insert: {
          endBlock: number;
          id?: number;
          startBlock: number;
          traceFilterId: string;
        };
        Update: {
          endBlock?: number;
          id?: number;
          startBlock?: number;
          traceFilterId?: string;
        };
        Relationships: [];
      };
      traceFilters: {
        Row: {
          chainId: number;
          fromAddress: string | null;
          id: string;
          toAddress: string | null;
        };
        Insert: {
          chainId: number;
          fromAddress?: string | null;
          id: string;
          toAddress?: string | null;
        };
        Update: {
          chainId?: number;
          fromAddress?: string | null;
          id?: string;
          toAddress?: string | null;
        };
        Relationships: [];
      };
      transactionReceipts: {
        Row: {
          blockHash: string;
          blockNumber: number;
          chainId: number;
          contractAddress: string | null;
          cumulativeGasUsed: number;
          effectiveGasPrice: number;
          from: string;
          gasUsed: number;
          logs: string;
          logsBloom: string;
          status: string;
          to: string | null;
          transactionHash: string;
          transactionIndex: number;
          type: string;
        };
        Insert: {
          blockHash: string;
          blockNumber: number;
          chainId: number;
          contractAddress?: string | null;
          cumulativeGasUsed: number;
          effectiveGasPrice: number;
          from: string;
          gasUsed: number;
          logs: string;
          logsBloom: string;
          status: string;
          to?: string | null;
          transactionHash: string;
          transactionIndex: number;
          type: string;
        };
        Update: {
          blockHash?: string;
          blockNumber?: number;
          chainId?: number;
          contractAddress?: string | null;
          cumulativeGasUsed?: number;
          effectiveGasPrice?: number;
          from?: string;
          gasUsed?: number;
          logs?: string;
          logsBloom?: string;
          status?: string;
          to?: string | null;
          transactionHash?: string;
          transactionIndex?: number;
          type?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          accessList: string | null;
          blockHash: string;
          blockNumber: number;
          chainId: number;
          from: string;
          gas: number;
          gasPrice: number | null;
          hash: string;
          input: string;
          maxFeePerGas: number | null;
          maxPriorityFeePerGas: number | null;
          nonce: number;
          r: string | null;
          s: string | null;
          to: string | null;
          transactionIndex: number;
          type: string;
          v: number | null;
          value: number;
        };
        Insert: {
          accessList?: string | null;
          blockHash: string;
          blockNumber: number;
          chainId: number;
          from: string;
          gas: number;
          gasPrice?: number | null;
          hash: string;
          input: string;
          maxFeePerGas?: number | null;
          maxPriorityFeePerGas?: number | null;
          nonce: number;
          r?: string | null;
          s?: string | null;
          to?: string | null;
          transactionIndex: number;
          type: string;
          v?: number | null;
          value: number;
        };
        Update: {
          accessList?: string | null;
          blockHash?: string;
          blockNumber?: number;
          chainId?: number;
          from?: string;
          gas?: number;
          gasPrice?: number | null;
          hash?: string;
          input?: string;
          maxFeePerGas?: number | null;
          maxPriorityFeePerGas?: number | null;
          nonce?: number;
          r?: string | null;
          s?: string | null;
          to?: string | null;
          transactionIndex?: number;
          type?: string;
          v?: number | null;
          value?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey";
            columns: ["upload_id"];
            referencedRelation: "s3_multipart_uploads";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
        };
        Returns: {
          key: string;
          id: string;
          created_at: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          start_after?: string;
          next_token?: string;
        };
        Returns: {
          name: string;
          id: string;
          metadata: Json;
          updated_at: string;
        }[];
      };
      operation: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
