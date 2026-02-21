import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { NutritionTotals } from "../types/nutrition";
import "../styles/nutrition.css";

interface NutritionSummaryProps {
  goals: NutritionTotals;
  actual: NutritionTotals;
  remaining: NutritionTotals;
  consumption: NutritionTotals; // calories burned from exercise
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  goals,
  actual,
  remaining,
  consumption,
}) => {
  // Calculate adjusted calorie goal: base goal + exercise burned
  const adjustedGoal = goals.calories + consumption.calories;
  const safeGoal = adjustedGoal > 0 ? adjustedGoal : 1;
  const proteinPercent = (actual.protein_g / goals.protein_g) * 100;
  const carbsPercent = (actual.carbs_g / goals.carbs_g) * 100;
  const fatPercent = (actual.fat_g / goals.fat_g) * 100;
  const caloriesOver = Math.max(actual.calories - safeGoal, 0);
  const caloriesRemaining = Math.max(safeGoal - actual.calories, 0);
  const isCaloriesOver = actual.calories > safeGoal;
  const isProteinOver = actual.protein_g > goals.protein_g;
  const isCarbsOver = actual.carbs_g > goals.carbs_g;
  const isFatOver = actual.fat_g > goals.fat_g;

  const macroTotals = actual.protein_g + actual.carbs_g + actual.fat_g;
  const macroDataBase = macroTotals > 0
    ? {
        protein: actual.protein_g,
        carbs: actual.carbs_g,
        fat: actual.fat_g,
      }
    : {
        protein: 0,
        carbs: 0,
        fat: 0,
      };
  const macroTotalBase =
    macroDataBase.protein + macroDataBase.carbs + macroDataBase.fat;

  const macroChartData = [
    { name: "Protein", value: macroDataBase.protein, color: "#4C8DFF" },
    { name: "Carbs", value: macroDataBase.carbs, color: "#FF8A3D" },
    { name: "Fat", value: macroDataBase.fat, color: "#22C55E" },
  ];

  const calorieChartData = [
    { name: "Consumed", value: Math.min(actual.calories, safeGoal), color: "#7C6BFF" },
    {
      name: caloriesOver > 0 ? "Over" : "Remaining",
      value: caloriesOver > 0 ? caloriesOver : caloriesRemaining,
      color: caloriesOver > 0 ? "#FF6B6B" : "#CFE3FF",
    },
  ];

  return (
    <div className="nutrition-summary">
      {/* Calories Card */}
      <div className="summary-card calories-card">
        <div className="calories-header">
          <div>
            <h3>Calories</h3>
            <p className="calorie-subtitle">Fuel balance today</p>
          </div>
          <div className="calorie-badge">
            {caloriesRemaining > 0
              ? `${Math.round(caloriesRemaining)} left`
              : `${Math.round(caloriesOver)} over`}
          </div>
        </div>

        {isCaloriesOver && (
          <div className="over-warning">
            Over daily calories
          </div>
        )}

        <div className="calorie-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={calorieChartData}
                dataKey="value"
                innerRadius={40}
                outerRadius={55}
                startAngle={90}
                endAngle={450}
                paddingAngle={0}
              >
                {calorieChartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="calorie-chart-value"
              >
                {Math.round(actual.calories)}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="calorie-chart-label"
              >
                of {Math.round(safeGoal)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="calorie-metrics">
          <div className="metric-row">
            <span className="metric-label">Consumed</span>
            <span className="metric-value">{Math.round(actual.calories)} kcal</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Exercise</span>
            <span className="metric-value">+{Math.round(consumption.calories)} kcal</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Base goal</span>
            <span className="metric-value">{Math.round(goals.calories)} kcal</span>
          </div>
        </div>
      </div>

      {/* Macro Chart */}
      <div className="macro-chart-card">
        <div className="macro-chart-header">
          <div>
            <h3>Macros</h3>
            <p>Distribution of intake</p>
          </div>
          <span className="macro-total">{Math.round(macroTotalBase)}g</span>
        </div>

        <div className="macro-donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={macroChartData}
                dataKey="value"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
              >
                {macroChartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="macro-legend">
          {macroChartData.map((macro) => (
            <div key={macro.name} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: macro.color }} />
              <div>
                <span className="legend-title">{macro.name}</span>
                <span className="legend-value">
                  {Math.round(macro.value)}g • {Math.round((macro.value / (macroTotalBase || 1)) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Macro Cards Stack */}
      <div className="macros-grid">
        {/* Protein */}
        <div className="macro-card protein">
          <h4>Protein</h4>
          <div className="macro-number">{Math.round(actual.protein_g)}g</div>
          <div className="macro-goal">Goal: {Math.round(goals.protein_g)}g</div>
          {isProteinOver && <div className="over-warning">Over target</div>}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(proteinPercent, 100)}%` }}
            />
          </div>
          <div className="macro-percent">{Math.round(proteinPercent)}%</div>
        </div>

        {/* Carbs */}
        <div className="macro-card carbs">
          <h4>Carbs</h4>
          <div className="macro-number">{Math.round(actual.carbs_g)}g</div>
          <div className="macro-goal">Goal: {Math.round(goals.carbs_g)}g</div>
          {isCarbsOver && <div className="over-warning">Over target</div>}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(carbsPercent, 100)}%` }}
            />
          </div>
          <div className="macro-percent">{Math.round(carbsPercent)}%</div>
        </div>

        {/* Fat */}
        <div className="macro-card fat">
          <h4>Fat</h4>
          <div className="macro-number">{Math.round(actual.fat_g)}g</div>
          <div className="macro-goal">Goal: {Math.round(goals.fat_g)}g</div>
          {isFatOver && <div className="over-warning">Over target</div>}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(fatPercent, 100)}%` }}
            />
          </div>
          <div className="macro-percent">{Math.round(fatPercent)}%</div>
        </div>
      </div>
    </div>
  );
};

export default NutritionSummary;
