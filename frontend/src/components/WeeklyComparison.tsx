import React, { useEffect, useState } from "react";
import { profileApi } from "../services/api";

interface WeeklyAverages {
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  exercise: number;
}

interface WeeklyComparisonData {
  current_week: WeeklyAverages;
  last_week: WeeklyAverages;
  current_week_start: string;
  current_week_end: string;
  last_week_start: string;
  last_week_end: string;
}

interface WeeklyComparisonProps {
  token: string;
}

const WeeklyComparison: React.FC<WeeklyComparisonProps> = ({ token }) => {
  const [data, setData] = useState<WeeklyComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await profileApi.getWeeklyComparison(token);
        setData(result);
        setError(undefined);
      } catch (err: any) {
        setError(err.message || "Failed to load weekly comparison");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const renderComparisonRow = (
    label: string,
    currentValue: number,
    lastValue: number,
    unit: string
  ) => {
    const change = calculateChange(currentValue, lastValue);
    const isPositive = change > 0;
    const isNegative = change < 0;

    return (
      <div className="comparison-row">
        <div className="comparison-label">{label}</div>
        <div className="comparison-values">
          <div className="value-box">
            <div className="value-amount">
              {currentValue.toFixed(1)} {unit}
            </div>
            <div className="value-period">This week</div>
          </div>
          <div className="comparison-arrow">
            {isPositive && <span className="arrow-up">▲</span>}
            {isNegative && <span className="arrow-down">▼</span>}
            {!isPositive && !isNegative && <span className="arrow-neutral">−</span>}
            <span className={`change-percent ${isPositive ? "positive" : isNegative ? "negative" : "neutral"}`}>
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
          <div className="value-box">
            <div className="value-amount">
              {lastValue.toFixed(1)} {unit}
            </div>
            <div className="value-period">Last week</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="weekly-comparison">
        <h2>Weekly Comparison</h2>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-comparison">
        <h2>Weekly Comparison</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="weekly-comparison">
      <h2>Weekly Comparison</h2>
      <div className="week-labels">
        <div className="week-label current">
          <strong>Current Week:</strong> {formatDate(data.current_week_start)} - {formatDate(data.current_week_end)}
        </div>
        <div className="week-label last">
          <strong>Last Week:</strong> {formatDate(data.last_week_start)} - {formatDate(data.last_week_end)}
        </div>
      </div>

      <div className="comparison-grid">
        {renderComparisonRow("Calories", data.current_week.calories, data.last_week.calories, "cal")}
        {renderComparisonRow("Carbs", data.current_week.carbs, data.last_week.carbs, "g")}
        {renderComparisonRow("Protein", data.current_week.protein, data.last_week.protein, "g")}
        {renderComparisonRow("Fats", data.current_week.fats, data.last_week.fats, "g")}
        {renderComparisonRow("Exercise", data.current_week.exercise, data.last_week.exercise, "cal")}
      </div>
    </div>
  );
};

export default WeeklyComparison;
