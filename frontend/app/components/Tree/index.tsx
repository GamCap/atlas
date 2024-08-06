"use client";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  MiniMap,
  ControlButton,
  Node,
  Edge,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import {
  CustomEdge,
  CustomNode,
  getLayoutedElements,
  TreePanel,
} from "./utils";
import { TreeProps } from "./types";
import { useTheme } from "next-themes";
import { Spinner } from "@/components/ui/Spinner";
import { Layout } from "@/components/ui/Icon";

const LayoutedFlow: React.FC<TreeProps> = ({
  data,
  firstBlock,
  lastBlock,
  firstDate,
  lastDate,
  isLoading,
  numberOfNodes,
  showLimitWarning,
}) => {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(data.nodes);
  const [edges, setEdges] = useEdgesState<Edge>(data.edges);
  const theme = useTheme();

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  useEffect(() => {
    if (data) {
      setNodes(data.nodes);
      setEdges(data.edges);
    }
    const layoutTimeout = setTimeout(() => {
      if (data.nodes.length && data.edges.length) {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(data.nodes, data.edges);
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
        fitView({ duration: 800, maxZoom: 1 });
      }
    }, 0);

    return () => clearTimeout(layoutTimeout);
  }, [data, fitView, setEdges, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgesReconnectable={false}
      onNodesChange={onNodesChange}
      snapToGrid
      defaultEdgeOptions={{
        deletable: false,
        selectable: false,
        reconnectable: false,
        focusable: false,
      }}
      fitViewOptions={{
        duration: 800,
        nodes: nodes,
      }}
      nodesConnectable={false}
      proOptions={{
        hideAttribution: true,
      }}
      style={{ background: "#00000000" }}
      nodeTypes={{ default: CustomNode }}
      edgeTypes={{ default: CustomEdge }}
      colorMode={theme.theme === "dark" ? "dark" : "light"}
    >
      <TreePanel
        firstBlock={firstBlock}
        lastBlock={lastBlock}
        firstDate={firstDate}
        lastDate={lastDate}
        numberOfNodes={numberOfNodes}
        showLimitWarning={showLimitWarning}
      />
      <Controls
        showZoom={false}
        fitViewOptions={{
          duration: 800,
        }}
      >
        <ControlButton
          onClick={() => zoomIn({ duration: 800 })}
          title="zoom in"
        >
          +
        </ControlButton>
        <ControlButton
          onClick={() => zoomOut({ duration: 800 })}
          title="zoom out"
        >
          -
        </ControlButton>
        <ControlButton onClick={onLayout} title="fix layout">
          <Layout />
        </ControlButton>
      </Controls>
      <MiniMap
        nodeStrokeWidth={3}
        className="bg-neutral-600/40 dark:bg-neutral-900/40"
        nodeColor={theme.theme === "dark" ? "#909f9a66" : "#13282066"}
        pannable
      />
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10 bg-white dark:bg-black opacity-50">
          <Spinner />
        </div>
      )}
    </ReactFlow>
  );
};

export const Tree: React.FC<TreeProps> = ({
  data,
  firstBlock,
  lastBlock,
  firstDate,
  lastDate,
  isLoading,
  numberOfNodes,
  showLimitWarning,
}) => {
  return (
    <ReactFlowProvider>
      <LayoutedFlow
        data={data}
        firstBlock={firstBlock}
        lastBlock={lastBlock}
        firstDate={firstDate}
        lastDate={lastDate}
        isLoading={isLoading}
        numberOfNodes={numberOfNodes}
        showLimitWarning={showLimitWarning}
      />
    </ReactFlowProvider>
  );
};
