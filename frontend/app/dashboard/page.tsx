"use client";
import { useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { GrowthHeatmap } from "./components/GrowthHeatmap";
import { DailyInsertions } from "./components/DailyInsertions";
import { DailyGasSpent } from "./components/DailyGasSpent";
import { DailyRollingSumIdentities } from "./components/DailyRollingSumIdentities";
import { MarkdownStats } from "./components/MarkdownStats";
import { DailyDeletions } from "./components/DailyDeletions";

const WorldcoinDashboard = () => {
  const ResponsiveGridLayout = useMemo(() => WidthProvider(Responsive), []);
  const {
    TotalIdentities,
    TotalInsertions,
    TotalDeletions,
    TotalRoots,
    AvgIdentitiesPerRoot,
    GasSpent,
  } = MarkdownStats();

  return (
    <div className="absolute left-0 right-0 top-0 bottom-0">
      <ResponsiveGridLayout
        className="layout"
        layouts={{
          large: [
            { i: "total-identities", x: 0, y: 0, w: 4, h: 3 },
            { i: "total-insertions", x: 4, y: 0, w: 4, h: 3 },
            { i: "total-deletions", x: 8, y: 0, w: 4, h: 3 },
            { i: "total-roots", x: 12, y: 0, w: 4, h: 3 },
            { i: "avg-identities-per-root", x: 16, y: 0, w: 4, h: 3 },
            { i: "gas-spent", x: 20, y: 0, w: 4, h: 3 },

            { i: "growth-heatmap", x: 0, y: 3, w: 24, h: 10 },

            { i: "daily-insertions", x: 0, y: 13, w: 12, h: 10 },
            { i: "daily-deletions", x: 12, y: 13, w: 12, h: 10 },

            { i: "daily-rolling-sum-identities", x: 0, y: 23, w: 12, h: 10 },
            { i: "daily-gas-spent", x: 12, y: 23, w: 12, h: 10 },
          ],
          medium: [
            { i: "total-identities", x: 0, y: 0, w: 4, h: 3 },
            { i: "total-insertions", x: 4, y: 0, w: 4, h: 3 },
            { i: "total-deletions", x: 8, y: 0, w: 4, h: 3 },
            { i: "total-roots", x: 0, y: 3, w: 4, h: 3 },
            { i: "avg-identities-per-root", x: 4, y: 3, w: 4, h: 3 },
            { i: "gas-spent", x: 8, y: 3, w: 4, h: 3 },

            { i: "growth-heatmap", x: 0, y: 6, w: 12, h: 10 },

            { i: "daily-insertions", x: 0, y: 16, w: 12, h: 10 },

            { i: "daily-deletions", x: 0, y: 26, w: 12, h: 10 },

            { i: "daily-rolling-sum-identities", x: 0, y: 36, w: 12, h: 10 },

            { i: "daily-gas-spent", x: 0, y: 46, w: 12, h: 10 },
          ],
          small: [
            { i: "total-identities", x: 0, y: 0, w: 4, h: 3 },
            { i: "total-insertions", x: 4, y: 0, w: 4, h: 3 },
            { i: "total-deletions", x: 0, y: 3, w: 4, h: 3 },
            { i: "total-roots", x: 4, y: 3, w: 4, h: 3 },
            { i: "avg-identities-per-root", x: 0, y: 6, w: 4, h: 3 },
            { i: "gas-spent", x: 4, y: 6, w: 4, h: 3 },
            { i: "growth-heatmap", x: 0, y: 9, w: 8, h: 8 },
            { i: "daily-insertions", x: 0, y: 17, w: 8, h: 8 },
            { i: "daily-deletions", x: 0, y: 25, w: 8, h: 8 },
            { i: "daily-rolling-sum-identities", x: 0, y: 32, w: 8, h: 8 },
            { i: "daily-gas-spent", x: 0, y: 40, w: 8, h: 8 },
          ],
        }}
        breakpoints={{ large: 1200, medium: 768, small: 480 }}
        cols={{ large: 24, medium: 12, small: 8 }}
        margin={[20, 10]}
        rowHeight={30}
        isDraggable={false}
        isResizable={false}
      >
        <div key="total-identities">{TotalIdentities}</div>
        <div key="total-insertions">{TotalInsertions}</div>
        <div key="total-deletions">{TotalDeletions}</div>
        <div key="total-roots">{TotalRoots}</div>
        <div key="avg-identities-per-root">{AvgIdentitiesPerRoot}</div>
        <div key="gas-spent">{GasSpent}</div>
        <div key="growth-heatmap">
          <GrowthHeatmap />
        </div>
        <div key="daily-insertions">
          <DailyInsertions />
        </div>
        <div key="daily-deletions">
          <DailyDeletions />
        </div>
        <div key="daily-rolling-sum-identities">
          <DailyRollingSumIdentities />
        </div>
        <div key="daily-gas-spent">
          <DailyGasSpent />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default WorldcoinDashboard;
