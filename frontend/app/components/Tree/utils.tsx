import {
  BaseEdge,
  Edge,
  EdgeProps,
  getBezierPath,
  Handle,
  Node,
  NodeProps,
  Panel,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { tree, stratify, HierarchyNode } from "d3";
import { CustomEdgeProps, CustomNodeProps } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Explore, InfoCircle } from "@/components/ui/Icon";

const g = tree();

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (nodes.length === 0) return { nodes, edges };
  const nodeElement = document.querySelector(`[data-id="${nodes[0].id}"]`);
  if (!nodeElement) {
    console.error(`Node element with ID ${nodes[0].id} not found.`);
    return { nodes, edges };
  }
  const { width, height } = nodeElement.getBoundingClientRect();
  const hierarchy = stratify<Node>()
    .id((node) => node.id)
    .parentId((node) => edges.find((edge) => edge.target === node.id)?.source);
  const root = hierarchy(nodes) as HierarchyNode<Node>;
  const layout = g.nodeSize([width * 2, height * 2])(
    root as unknown as HierarchyNode<unknown>
  );

  return {
    nodes: layout.descendants().map((node) => ({
      ...(node.data as Node),
      position: { x: node.x, y: node.y },
    })),
    edges,
  };
};

const CustomNode = (props: NodeProps<CustomNodeProps>) => {
  const { id, data } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCopiedLabel, setShowCopiedLabel] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (nodeRef.current) {
      const leftClickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      nodeRef.current.dispatchEvent(leftClickEvent);

      setMenuOpen(true);
    }
  };

  const handleClickOutside = useCallback(
    (e: any) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target) &&
        nodeRef.current &&
        !nodeRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    },
    [nodeRef, contextMenuRef]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(data?.createdTx);
    setShowCopiedLabel(true);
    setTimeout(() => {
      setShowCopiedLabel(false);
    }, 2000);
  };

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen, handleClickOutside]);

  return (
    <div
      ref={nodeRef}
      onContextMenu={handleRightClick}
      className={`relative rounded-md text-white ${data?.kind === "Insert" ? "bg-green-primary" : data?.kind === "Remove" ? "bg-accent-red" : "bg-accent-blue"} flex flex-col items-center`}
    >
      <Handle type="target" position={Position.Top} id="target" />
      <p className="truncate w-full p-4">{id}</p>
      <Handle type="source" position={Position.Bottom} id="source" />

      {menuOpen && data?.createdTx && (
        <div
          ref={contextMenuRef}
          className={
            "absolute overflow-hidden dark:bg-neutral-900 flex flex-col rounded-md text-white dark:text-neutral-200 bg-green-primary top-1/2 -translate-y-1/2"
          }
        >
          <button
            disabled={showCopiedLabel}
            onClick={handleCopy}
            className="whitespace-nowrap flex flex-row gap-1 items-center w-full text-left px-4 py-3 border-b border-neutral-600 hover:bg-green-primary-dark hover:text-black relative"
          >
            <Copy />
            <p>Copy Txn</p>
            {showCopiedLabel && (
              <div className="absolute top-0 bottom-0 left-0 right-0 backdrop-blur-sm flex items-center justify-center">
                <p>Copied</p>
              </div>
            )}
          </button>
          <button
            onClick={() => {
              window.open(`https://etherscan.io/tx/${data?.createdTx}`);
            }}
            className="whitespace-nowrap flex flex-row gap-1 items-center w-full text-left px-4 py-3 hover:bg-green-primary-dark hover:text-black"
          >
            <Explore />
            <p>View on Etherscan</p>
          </button>
        </div>
      )}
    </div>
  );
};

const CustomEdge = (props: EdgeProps<CustomEdgeProps>) => {
  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  });

  return (
    <BaseEdge
      id={props.id}
      path={edgePath}
      className=" stroke-black dark:stroke-neutral-700"
    />
  );
};

interface TreePanelProps {
  firstBlock?: number;
  lastBlock?: number;
  firstDate?: number;
  lastDate?: number;
  numberOfNodes?: number;
  showLimitWarning?: boolean;
}
const TreePanel = ({
  firstBlock,
  lastBlock,
  firstDate,
  lastDate,
  numberOfNodes,
  showLimitWarning,
}: TreePanelProps) => {
  return (
    <Panel className=" flex flex-row justify-between w-full m-0 p-4 text-basic-10-auto-regular sm:text-basic-12-auto-regular lg:text-basic-14-auto-regular">
      <div className="flex flex-col items-start text-neutral-600 dark:text-neutral-500 bg-neutral-400 dark:bg-[#000] p-2 rounded-md bg-opacity-20 dark:bg-opacity-20">
        <p>Tree Information</p>
        {numberOfNodes && (
          <div className="flex flex-row gap-1 items-center">
            <p>
              Number of Nodes:{" "}
              <span className={`${showLimitWarning && "text-accent-red"}`}>
                {numberOfNodes}
              </span>
            </p>
            {showLimitWarning && (
              <div
                className="cursor-pointer"
                title="The selected data period exceeds the allowable limit. Displaying only the maximum permitted data."
              >
                <InfoCircle className="text-accent-red w-4 h-4" />
              </div>
            )}
          </div>
        )}
        <p>
          {firstBlock &&
            lastBlock &&
            `Block Number: ${firstBlock} - ${lastBlock}`}
        </p>
        <p>
          {firstDate &&
            lastDate &&
            `Date: ${new Date(firstDate * 1000).toLocaleDateString()} - ${new Date(
              lastDate * 1000
            ).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex flex-col items-start text-neutral-600 dark:text-neutral-500 bg-neutral-400 dark:bg-[#000] p-2 rounded-md bg-opacity-20 dark:bg-opacity-20 h-fit">
        <div className=" flex flex-row gap-1 items-center">
          <div className="w-4 h-4 rounded-full bg-green-primary" />
          <p>Register Identities</p>
        </div>
        <div className=" flex flex-row gap-1 items-center">
          <div className="w-4 h-4 rounded-full bg-accent-red" />
          <p>Delete Identities</p>
        </div>
      </div>
    </Panel>
  );
};

export { getLayoutedElements, CustomNode, CustomEdge, TreePanel };
