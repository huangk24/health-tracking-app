import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { weightApi, WeightTrendData } from "../services/api";

interface WeightTrendProps {
  token: string;
}

type TimeRange = "date" | "weeks" | "month" | "quarter";

const WeightTrend: React.FC<WeightTrendProps> = ({ token }) => {
  const [data, setData] = useState<WeightTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  useEffect(() => {
    const fetchWeightHistory = async () => {
      try {
        setLoading(true);
        let history: WeightTrendData[];
        
        if (timeRange === "date") {
          // Get daily data for the last 7 days
          history = await weightApi.getWeightHistory({ days: 7 }, token);
        } else if (timeRange === "weeks") {
          // Get weekly aggregated data for last 8 weeks
          history = await weightApi.getWeightHistory({ aggregation: "week" }, token);
        } else if (timeRange === "month") {
          // Get monthly aggregated data for current year
          history = await weightApi.getWeightHistory({ aggregation: "month" }, token);
        } else {
          // Get quarterly aggregated data for prev/current/next year
          history = await weightApi.getWeightHistory({ aggregation: "quarter" }, token);
        }
        
        setData(history);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load weight history");
      } finally {
        setLoading(false);
      }
    };

    fetchWeightHistory();
  }, [token, timeRange]);

  const formatDate = (dateStr: string) => {
    // Parse date carefully to avoid timezone issues
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    if (timeRange === "date") {
      return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } else if (timeRange === "weeks") {
      // Display as "Feb 1 - Feb 8" for week range
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 6); // Add 6 days to get end of week (Mon-Sun)
      
      const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
      const startDay = startDate.getDate();
      const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
      const endDay = endDate.getDate();
      
      // If both dates are in the same month, show "Feb 1 - 8"
      if (startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}`;
      } else {
        // If dates span different months, show "Jan 29 - Feb 4"
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
      }
    } else if (timeRange === "month") {
      // Display as "Jan", "Feb", etc. - use the month directly
      return date.toLocaleDateString("en-US", { month: "short" });
    } else {
      // Display as "Q1 2026", "Q2 2026", etc.
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    }
  };

  const chartData = data.map((entry) => ({
    date: formatDate(entry.date),
    weight: entry.weight,
    fullDate: entry.date,
  }));

  const getStats = () => {
    if (data.length === 0) return null;

    const weights = data.map((d) => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const currentWeight = weights[weights.length - 1];
    const startWeight = weights[0];
    const totalChange = currentWeight - startWeight;

    return {
      min: minWeight,
      max: maxWeight,
      current: currentWeight,
      change: totalChange,
    };
  };

  const stats = getStats();

  return (
    <div className="weight-trend">
      <div className="trend-header">
        <h3>Weight Trend</h3>
        <div className="trend-controls">
          <button
            className={`trend-btn ${timeRange === "date" ? "active" : ""}`}
            onClick={() => setTimeRange("date")}
          >
            Date
          </button>
          <button
            className={`trend-btn ${timeRange === "weeks" ? "active" : ""}`}
            onClick={() => setTimeRange("weeks")}
          >
            Weeks
          </button>
          <button
            className={`trend-btn ${timeRange === "month" ? "active" : ""}`}
            onClick={() => setTimeRange("month")}
          >
            Month
          </button>
          <button
            className={`trend-btn ${timeRange === "quarter" ? "active" : ""}`}
            onClick={() => setTimeRange("quarter")}
          >
            Quarter
          </button>
        </div>
      </div>

      {loading && (
        <div className="trend-loading">
          <div className="spinner"></div>
        </div>
      )}

      {error && <div className="trend-error">{error}</div>}

      {!loading && !error && stats && data.length > 0 && (
        <>
          <div className="weight-stats">
            <div className="stat-card">
              <span className="stat-label">Current</span>
              <span className="stat-value">{stats.current.toFixed(1)} kg</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Change</span>
              <span className={`stat-value ${stats.change >= 0 ? "positive" : "negative"}`}>
                {stats.change >= 0 ? "+" : ""}{stats.change.toFixed(1)} kg
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Min</span>
              <span className="stat-value">{stats.min.toFixed(1)} kg</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Max</span>
              <span className="stat-value">{stats.max.toFixed(1)} kg</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  stroke="#666"
                  style={{ fontSize: "12px" }}
                  label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                  formatter={(value: any) => [`${Number(value).toFixed(1)} kg`, timeRange === "date" ? "Weight" : "Avg Weight"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#667eea"
                  strokeWidth={3}
                  dot={{ fill: "#667eea", r: 4 }}
                  activeDot={{ r: 6 }}
                  name={timeRange === "date" ? "Weight" : "Avg Weight"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="no-data">
          <p>No weight data available for this time range.</p>
          <p>Start logging your weight on the dashboard to see trends!</p>
        </div>
      )}
    </div>
  );
};

export default WeightTrend;
