import { CalendarHeatmap } from "@/components/Chart/CalendarHeatmap";
import { CalendarHeatmapData } from "@/components/Chart/types";
import { ChartZoom } from "@/components/ChartZoom";
import { DashboardItem } from "@/components/Dashboard/DashboardItem";
import { Spinner } from "@/components/ui/Spinner";
import { supabase } from "@/supabase/supabaseClient";
import { useCallback, useEffect, useState } from "react";

type NumTypeOption = 30 | 90 | 365 | "All";
export const GrowthHeatmap = () => {
  const [data, setData] = useState<CalendarHeatmapData[] | null>(null);
  const [isFetched, setIsFetched] = useState(false);
  const [numDays, setNumDays] = useState<NumTypeOption>(365);

  const fetchData = useCallback(async () => {
    setIsFetched(false);
    const query = supabase
      .schema("ponder_data")
      .from("DailyStats")
      .select("*")
      .order("date", { ascending: false });

    if (numDays !== "All") {
      query.limit(numDays);
    }

    const { data } = await query;

    if (data) {
      const processedData = data.map((d) => ({
        date: d.date * 1000,
        change: d.totalIdentities,
        counts: {
          insert: d.totalInsertions,
          remove: d.totalDeletions,
        },
      }));
      setData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(processedData)) {
          return processedData;
        }
        return prevData;
      });
    }
    setIsFetched(true);
  }, [numDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleZoomChange = (data: { label: string }, index: number) => {
    switch (index) {
      case 0:
        setNumDays(30);
        break;
      case 1:
        setNumDays(90);
        break;
      case 2:
        setNumDays(365);
        break;
      case 3:
        setNumDays("All");
        break;
    }
  };

  return (
    <DashboardItem
      title="Growth Heatmap"
      zoomProps={
        <ChartZoom
          items={[
            { label: "1M" },
            { label: "3M" },
            { label: "1Y" },
            { label: "All" },
          ]}
          onChange={handleZoomChange}
          initialIndex={2}
          id="ga-growth-heatmap-zoom"
        />
      }
    >
      {isFetched && data ? (
        <CalendarHeatmap data={data} valueLabel="Insert Count" />
      ) : (
        <Spinner />
      )}
    </DashboardItem>
  );
};
