"use client";

import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Tree } from "@/components/Tree";
import { FlowGraphData } from "@/components/Tree/types";
import { Dropdown } from "@/components/ui/Dropdown";
import { Spinner } from "@/components/ui/Spinner";
import { Database } from "@/supabase/database.types";
import { supabase } from "@/supabase/supabaseClient";
import { type Node, type Edge } from "@xyflow/react";
import { useEffect, useState } from "react";
import { ExpandLeft } from "@/components/ui/Icon";

const convertTransactionsToGraphV2 = (
  transactions: Database["ponder_data"]["Tables"]["Root"]["Row"][]
): { nodes: Node[]; edges: Edge[] } => {
  const nodesMap = new Map<string, Node>();
  const edgesMap = new Map<string, Edge>();

  for (let index = 0; index < transactions.length; index++) {
    const tx = transactions[index];
    const currentNodeId = tx.id;
    const preRoot = tx.parent;
    const postRoot = tx.child;

    nodesMap.set(currentNodeId, {
      id: currentNodeId,
      data: {
        label: `${currentNodeId.slice(0, 5)}...`,
        kind: tx.kind,
        createdTx: "0" + tx.createdTx.substring(1),
        timestamp: tx.timestamp,
      },
      type: "default",
      position: { x: 0, y: 0 },
    });

    if (postRoot) {
      if (!nodesMap.has(postRoot)) {
        nodesMap.set(postRoot, {
          id: postRoot,
          data: {
            label: `${postRoot.slice(0, 5)}...`,
            timestamp: tx.timestamp,
          },
          type: "default",
          position: { x: 0, y: 0 },
        });
      }

      const edgeId = `edge-${currentNodeId}-${postRoot}`;
      if (!edgesMap.has(edgeId)) {
        edgesMap.set(edgeId, {
          id: edgeId,
          source: currentNodeId,
          target: postRoot,
        });
      }
    }

    const preEdgeId = `edge-${preRoot}-${currentNodeId}`;
    if (preRoot && !edgesMap.has(preEdgeId)) {
      if (!nodesMap.has(preRoot)) {
        nodesMap.set(preRoot, {
          id: preRoot,
          data: {
            label: `${preRoot.slice(0, 5)}...`,
            timestamp: tx.timestamp,
          },
          type: "default",
          position: { x: 0, y: 0 },
        });
      }

      edgesMap.set(preEdgeId, {
        id: preEdgeId,
        source: preRoot,
        target: currentNodeId,
      });
    }
  }

  // Determine root node
  const rootNodeCandidates = new Set(nodesMap.keys());
  for (const edge of edgesMap.values()) {
    rootNodeCandidates.delete(edge.target);
  }

  // Remove root node if it has no createdTx
  if (rootNodeCandidates.size > 0) {
    const rootNodeId = Array.from(rootNodeCandidates)[0];
    const rootNode = nodesMap.get(rootNodeId);
    if (rootNode && !rootNode.data.createdTx) {
      nodesMap.delete(rootNodeId);
      for (const edge of edgesMap.values()) {
        if (edge.source === rootNodeId || edge.target === rootNodeId) {
          edgesMap.delete(edge.id);
        }
      }
    }
  }

  // Determine and remove leaf nodes with no createdTx
  const leafNodes = new Set(nodesMap.keys());
  for (const edge of edgesMap.values()) {
    leafNodes.delete(edge.source);
  }

  for (const leafNodeId of leafNodes) {
    const leafNode = nodesMap.get(leafNodeId);
    if (leafNode && !leafNode.data.createdTx) {
      nodesMap.delete(leafNodeId);
      for (const edge of edgesMap.values()) {
        if (edge.source === leafNodeId || edge.target === leafNodeId) {
          edgesMap.delete(edge.id);
        }
      }
    }
  }

  const nodes = Array.from(nodesMap.values());
  const edges = Array.from(edgesMap.values());

  return { nodes, edges };
};

export default function Home() {
  const [data, setData] = useState<FlowGraphData | undefined>(undefined);
  const [controlType, setControlType] = useState<
    "default" | "blockRange" | "dateRange"
  >("default");

  const [limit, setLimit] = useState(100); // default limit
  const [startBlock, setStartBlock] = useState<number | null>(null);
  const [endBlock, setEndBlock] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [sortedBlockNumbers, setSortedBlockNumbers] = useState<number[]>([]);
  const [sortedDates, setSortedDates] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfNodes, setNumberOfNodes] = useState(0);

  const fetchData = async (params: {
    controlType: "default" | "blockRange" | "dateRange";
    limit: number;
    startBlock: number | null;
    endBlock: number | null;
    startDate: string | null;
    endDate: string | null;
  }) => {
    setIsLoading(true);
    let query = supabase
      .schema("ponder_data")
      .from("Root")
      .select("*")
      .order("blockNumber", { ascending: false });

    const { controlType, limit, startBlock, endBlock, startDate, endDate } =
      params;

    switch (controlType) {
      case "blockRange":
        if (startBlock !== null && endBlock !== null) {
          query = query
            .gte("blockNumber", startBlock)
            .lte("blockNumber", endBlock);
        } else if (startBlock !== null) {
          query = query.gte("blockNumber", startBlock);
        } else if (endBlock !== null) {
          query = query.lte("blockNumber", endBlock);
        }
        break;
      case "dateRange":
        if (startDate !== null && endDate !== null) {
          query = query
            .gte("timestamp", new Date(startDate).getTime() / 1000)
            .lte("timestamp", new Date(endDate).getTime() / 1000);
        } else if (startDate !== null) {
          query = query.gte("timestamp", new Date(startDate).getTime() / 1000);
        } else if (endDate !== null) {
          query = query.lte("timestamp", new Date(endDate).getTime() / 1000);
        }
        break;
      default:
        break;
    }

    query = query.limit(limit);

    const { data: initialData, error } = await query;
    setIsLoading(false);
    if (error) throw error;
    const reversed = initialData.reverse();
    const d = convertTransactionsToGraphV2(reversed);
    setData(d);
    const uniqueBlockNumbers = Array.from(
      new Set(reversed.map((tx) => tx.blockNumber))
    ).sort((a, b) => a - b);
    setSortedBlockNumbers(uniqueBlockNumbers);
    const uniqueDates = Array.from(
      new Set(reversed.map((tx) => tx.timestamp))
    ).sort((a, b) => a - b);
    setSortedDates(uniqueDates);
    setNumberOfNodes(reversed.length);
  };

  const handleNextBlock = () => {
    if (sortedBlockNumbers.length > 1) {
      const newStartBlock = sortedBlockNumbers[1];
      setStartBlock(newStartBlock);
      setEndBlock(null);
      fetchData({
        controlType: "blockRange",
        limit,
        startBlock: newStartBlock,
        endBlock: null,
        startDate,
        endDate,
      });
    }
  };

  const handleDate = (next: boolean) => {
    if (startDate === null && endDate === null) return;

    const localDateToUTCString = (date: Date) =>
      new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    let newStartDate = startDate ? new Date(startDate) : null;
    let newEndDate = endDate ? new Date(endDate) : null;

    if (newStartDate !== null) {
      newStartDate.setDate(newStartDate.getDate() + (next ? 1 : -1));
      setStartDate(localDateToUTCString(newStartDate));
    }

    if (newEndDate !== null) {
      newEndDate.setDate(newEndDate.getDate() + (next ? 1 : -1));
      setEndDate(localDateToUTCString(newEndDate));
    }

    fetchData({
      controlType: "dateRange",
      limit,
      startBlock,
      endBlock,
      startDate: newStartDate ? newStartDate.toString() : null,
      endDate: newEndDate ? newEndDate.toString() : null,
    });
  };

  const handlePreviousBlock = () => {
    if (sortedBlockNumbers.length >= 1) {
      const newEndBlockIndex =
        sortedBlockNumbers.length === 1 ? 0 : sortedBlockNumbers.length - 2;
      const newEndBlock = sortedBlockNumbers[newEndBlockIndex];
      setEndBlock(newEndBlock);
      setStartBlock(null);
      fetchData({
        controlType: "blockRange",
        limit,
        startBlock: null,
        endBlock: newEndBlock,
        startDate,
        endDate,
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const limitParam = params.get("limit");
    const startBlockParam = params.get("startBlock");
    const endBlockParam = params.get("endBlock");
    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");
    const controlTypeParam = params.get("controlType");

    const initialParams = {
      controlType:
        (controlTypeParam as "default" | "blockRange" | "dateRange") ||
        "default",
      limit: limitParam ? Number(limitParam) : 100,
      startBlock: startBlockParam ? Number(startBlockParam) : null,
      endBlock: endBlockParam ? Number(endBlockParam) : null,
      startDate: startDateParam || null,
      endDate: endDateParam || null,
    };

    if (limitParam) setLimit(Number(limitParam));
    if (startBlockParam) setStartBlock(Number(startBlockParam));
    if (endBlockParam) setEndBlock(Number(endBlockParam));
    if (startDateParam) setStartDate(startDateParam);
    if (endDateParam) setEndDate(endDateParam);
    if (controlTypeParam)
      setControlType(
        controlTypeParam as "default" | "blockRange" | "dateRange"
      );

    fetchData(initialParams);
  }, []);

  const updateQueryParams = () => {
    const params = new URLSearchParams();

    params.append("limit", limit.toString());
    if (startBlock !== null) params.append("startBlock", startBlock.toString());
    if (endBlock !== null) params.append("endBlock", endBlock.toString());
    if (startDate !== null) params.append("startDate", startDate);
    if (endDate !== null) params.append("endDate", endDate);
    params.append("controlType", controlType);

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  };

  return (
    <div
      className={`grow overflow-hidden flex flex-col items-center justify-center`}
    >
      <div className="w-full flex gap-2 items-center justify-between flex-col xl:flex-row pb-2">
        <div className="flex flex-col-reverse md:flex-row items-center gap-2">
          {controlType !== "default" && (
            <div className="flex flex-row items-center justify-center gap-2">
              <Button
                onClick={
                  controlType === "blockRange"
                    ? handlePreviousBlock
                    : () => handleDate(false)
                }
                variant="subtle"
                size="xsmall"
                className="whitespace-nowrap"
                title={
                  controlType === "blockRange"
                    ? "Previous Block"
                    : "Previous Day"
                }
                id={`ga-previous-${controlType}`}
              >
                <ExpandLeft className="w-6 h-6" />
              </Button>

              <Button
                onClick={
                  controlType === "blockRange"
                    ? handleNextBlock
                    : handleDate.bind(null, true)
                }
                variant="subtle"
                size="xsmall"
                className="whitespace-nowrap"
                title={controlType === "blockRange" ? "Next Block" : "Next Day"}
                id={`ga-next-${controlType}`}
              >
                <ExpandLeft className="w-6 h-6 rotate-180" />
              </Button>
            </div>
          )}
          {controlType === "blockRange" && (
            <>
              <TextInput
                leftSymbol="Start"
                type="number"
                value={startBlock ?? ""}
                onChange={(e) =>
                  setStartBlock(e.target.value ? Number(e.target.value) : null)
                }
                wrapperClassName="w-48"
              />
              <TextInput
                leftSymbol="End"
                type="number"
                value={endBlock ?? ""}
                onChange={(e) =>
                  setEndBlock(e.target.value ? Number(e.target.value) : null)
                }
                wrapperClassName="w-48"
              />
            </>
          )}

          {controlType === "dateRange" && (
            <div className=" flex flex-col md:flex-row items-center gap-2">
              <TextInput
                leftSymbol="Start"
                type="datetime-local"
                value={startDate ?? ""}
                onChange={(e) => setStartDate(e.target.value || null)}
              />
              <TextInput
                leftSymbol="End"
                type="datetime-local"
                value={endDate ?? ""}
                onChange={(e) => setEndDate(e.target.value || null)}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex flex-row items-center gap-2">
            <TextInput
              leftSymbol="Limit"
              type="number"
              value={limit}
              onChange={(e) =>
                setLimit(Math.min(200, Math.max(1, Number(e.target.value))))
              }
              onBlur={(e) => {
                const value = Number(e.target.value);
                if (value < 1 || isNaN(value)) {
                  setLimit(1);
                }
              }}
              wrapperClassName="w-32"
            />

            <Dropdown
              options={[
                { label: "Default", value: "default" },
                { label: "Block Range", value: "blockRange" },
                { label: "Date Range", value: "dateRange" },
              ]}
              value={controlType}
              onChange={(e) =>
                setControlType(
                  e.target.value as "default" | "blockRange" | "dateRange"
                )
              }
              optionClassName="dark:hover:bg-green-primary-dark dark:hover:text-black"
            />
          </div>
          <Button
            onClick={() => {
              updateQueryParams();
              fetchData({
                controlType,
                limit,
                startBlock,
                endBlock,
                startDate,
                endDate,
              });
            }}
            variant="subtle"
            className="whitespace-nowrap"
            id={`ga-apply-filters-${controlType}`}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="w-full grow h-1 bg-white dark:bg-black rounded-md flex flex-col items-center justify-center">
        {data === undefined ? (
          <Spinner />
        ) : (
          <Tree
            data={data}
            firstBlock={sortedBlockNumbers[0]}
            lastBlock={sortedBlockNumbers[sortedBlockNumbers.length - 1]}
            firstDate={sortedDates[0]}
            lastDate={sortedDates[sortedDates.length - 1]}
            isLoading={isLoading}
            numberOfNodes={numberOfNodes}
            showLimitWarning={
              controlType !== "default" && numberOfNodes >= limit
            }
          />
        )}
      </div>
    </div>
  );
}
