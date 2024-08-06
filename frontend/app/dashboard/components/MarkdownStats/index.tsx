import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabase/supabaseClient";
import { DashboardItem } from "@/components/Dashboard/DashboardItem";
import { Spinner } from "@/components/ui/Spinner";
import { Database } from "@/supabase/database.types";
import { PostgrestError } from "@supabase/supabase-js";

export const MarkdownStats = () => {
  const [totalData, setTotalData] =
    useState<Database["ponder_data"]["Tables"]["TotalStats"]["Row"]>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .schema("ponder_data")
        .from("TotalStats")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching total stats:", error);
        setError(error);
      }

      if (data) {
        setTotalData(data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Define individual components using useMemo
  const TotalIdentities = useMemo(() => {
    return (
      <DashboardItem>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div>Error loading data</div>
        ) : (
          <div className="singleDataContainer">
            <p className="singleDataTitle">Total Identities</p>
            <p className="singleDataPoint">
              {totalData?.totalIdentities ?? "N/A"}
            </p>
          </div>
        )}
      </DashboardItem>
    );
  }, [totalData, isLoading, error]);

  const TotalInsertions = useMemo(() => {
    return (
      <DashboardItem>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div>Error loading data</div>
        ) : (
          <div className="singleDataContainer">
            <p className="singleDataTitle">Total Insertions</p>
            <p className="singleDataPoint">
              {totalData?.totalInsertions ?? "N/A"}
            </p>
          </div>
        )}
      </DashboardItem>
    );
  }, [totalData, isLoading, error]);

  const TotalDeletions = useMemo(() => {
    return (
      <DashboardItem>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div>Error loading data</div>
        ) : (
          <div className="singleDataContainer">
            <p className="singleDataTitle">Total Deletions</p>
            <p className="singleDataPoint">
              {totalData?.totalDeletions ?? "N/A"}
            </p>
          </div>
        )}
      </DashboardItem>
    );
  }, [totalData, isLoading, error]);

  const TotalRoots = useMemo(() => {
    return (
      <DashboardItem>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div>Error loading data</div>
        ) : (
          <div className="singleDataContainer">
            <p className="singleDataTitle">Total Roots</p>
            <p className="singleDataPoint">{totalData?.totalRoots ?? "N/A"}</p>
          </div>
        )}
      </DashboardItem>
    );
  }, [totalData, isLoading, error]);

  const AvgIdentitiesPerRoot = useMemo(() => {
    return (
      <DashboardItem>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div>Error loading data</div>
        ) : (
          <div className="singleDataContainer">
            <p className="singleDataTitle">Mean Identities Per Root</p>
            <p className="singleDataPoint">
              {totalData?.avgIdentitiesPerRoot ?? "N/A"}
            </p>
          </div>
        )}
      </DashboardItem>
    );
  }, [totalData, isLoading, error]);

  const GasSpent = useMemo(() => {
    return (
      <DashboardItem>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div>Error loading data</div>
        ) : (
          <div className="singleDataContainer">
            <p className="singleDataTitle">Gas Spent</p>
            <p className="singleDataPoint">{totalData?.gasSpent ?? "N/A"}</p>
          </div>
        )}
      </DashboardItem>
    );
  }, [totalData, isLoading, error]);

  // Return all components
  return {
    TotalIdentities,
    TotalInsertions,
    TotalDeletions,
    TotalRoots,
    AvgIdentitiesPerRoot,
    GasSpent,
  };
};
