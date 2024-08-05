import { Node, Edge } from "@xyflow/react";

interface FlowGraphData {
  nodes: Node[];
  edges: Edge[];
}

interface TreeProps {
  data: FlowGraphData;
  firstBlock?: number;
  lastBlock?: number;
  firstDate?: number;
  lastDate?: number;
  isLoading?: boolean;
  numberOfNodes?: number;
  showLimitWarning?: boolean;
}

type CustomNodeProps = Node<
  { label: string; kind: string; createdTx: string; timestamp: number },
  "default"
>;

type CustomEdgeProps = Edge<{}, "default">;

export type { FlowGraphData, TreeProps, CustomNodeProps, CustomEdgeProps };
