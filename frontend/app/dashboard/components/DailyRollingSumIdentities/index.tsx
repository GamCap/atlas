import { MultiSeriesChart } from "@/components/Chart";
import { Series } from "@/components/Chart/types";
import { ChartZoom } from "@/components/ChartZoom";
import { DashboardItem } from "@/components/Dashboard/DashboardItem";
import { Spinner } from "@/components/ui/Spinner";
import { supabase } from "@/supabase/supabaseClient";
import { useCallback, useEffect, useState } from "react";
import { bigNumberFormatter, customDateFormat } from "../utils";

type NumTypeOption = 30 | 90 | 365 | "All";
export const DailyRollingSumIdentities = () => {
  const [data, setData] = useState<Series[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numDays, setNumDays] = useState<NumTypeOption>(90);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    let query = supabase
      .schema("ponder_data")
      .from("DailyStats")
      .select("*")
      .order("date", { ascending: false });

    if (numDays !== "All") {
      query = query.limit(numDays);
    }

    const { data } = await query;

    if (data) {
      const series1: Series = {
        name: "Total Identities",
        type: "line",
        data: data.reverse().map((d) => ({
          x: new Date(d.date).getTime(),
          y: d.rollingTotalIdentities,
        })),
        filled: true,
      };

      const processedData = [series1];
      setData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(processedData)) {
          return processedData;
        }
        return prevData;
      });
    }
    setIsLoading(false);
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
      title="Total Identities"
      zoomProps={
        <ChartZoom
          items={[
            { label: "1M" },
            { label: "3M" },
            { label: "1Y" },
            { label: "All" },
          ]}
          onChange={handleZoomChange}
          initialIndex={1}
        />
      }
    >
      {!data ? (
        <Spinner />
      ) : (
        <MultiSeriesChart
          data={data}
          axisFormat={{
            x: customDateFormat,
            y: bigNumberFormatter,
          }}
          axisTicks={{ x: 100, y: 50 }}
          gridConfig={{
            horizontal: {
              show: true,
              dashed: true,
            },
          }}
          shouldFormatTooltip={{
            x: true,
            y: false,
          }}
        />
      )}
    </DashboardItem>
  );
};
