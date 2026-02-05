import React from "react";
import { NutritionTotals } from "../types/nutrition";
import "../styles/nutrition.css";

interface NutritionSummaryProps {
  goals: NutritionTotals;
  actual: NutritionTotals;
  remaining: NutritionTotals;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  goals,
  actual,
  remaining,
}) => {
  const proteinPercent = (actual.protein_g / goals.protein_g) * 100;
  const carbsPercent = (actual.carbs_g / goals.carbs_g) * 100;
  const fatPercent = (actual.fat_g / goals.fat_g) * 100;

  return (
    <div className="nutrition-summary">
      {/* Calories Card */}
      <div className="summary-card calories-card">
        <h3>Calories</h3>
        <div className="calorie-display">
          <div className="calorie-number">{Math.round(actual.calories)}</div>
          <div className="calorie-goals">/ {Math.round(goals.calories)}</div>
        </div>
        <div className="calorie-remaining">
          {remaining.calories > 0
            ? `${Math.round(remaining.calories)} remaining`
            : `${Math.round(Math.abs(remaining.calories))} over`}
        </div>
      </div>

      {/* Macros Grid */}
      <div className="macros-grid">
        {/* Protein */}
        <div className="macro-card protein">
          <h4>Protein</h4>
          <div className="macro-number">{Math.round(actual.protein_g)}g</div>
          <div className="macro-goal">Goal: {Math.round(goals.protein_g)}g</div>
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
