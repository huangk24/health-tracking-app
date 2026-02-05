import { NutritionTotals } from '../types/nutrition';
import '../styles/nutrition.css';

interface NutritionSummaryProps {
  goals: NutritionTotals;
  actual: NutritionTotals;
  remaining: NutritionTotals;
}

export default function NutritionSummary({ goals, actual, remaining }: NutritionSummaryProps) {
  const getCalorieStatus = () => {
    if (remaining.calories > 0) {
      return `${remaining.calories.toFixed(0)} cal remaining`;
    } else {
      return `${Math.abs(remaining.calories).toFixed(0)} cal over`;
    }
  };

  const getMacroPercent = (actual: number, goal: number) => {
    return ((actual / goal) * 100).toFixed(0);
  };

  return (
    <div className="nutrition-summary">
      <div className="summary-card calories-card">
        <div className="calorie-display">
          <div className="calorie-number">{actual.calories.toFixed(0)}</div>
          <div className="calorie-label">/ {goals.calories.toFixed(0)} cal</div>
          <div className="calorie-status">{getCalorieStatus()}</div>
        </div>
      </div>

      <div className="macros-grid">
        <div className="macro-card">
          <div className="macro-label">Protein</div>
          <div className="macro-amount">{actual.protein_g.toFixed(1)}g</div>
          <div className="macro-goal">Goal: {goals.protein_g.toFixed(0)}g</div>
          <div className="macro-bar">
            <div
              className="macro-bar-fill protein-bar"
              style={{ width: `${Math.min(100, parseFloat(getMacroPercent(actual.protein_g, goals.protein_g)))}%` }}
            ></div>
          </div>
        </div>

        <div className="macro-card">
          <div className="macro-label">Carbs</div>
          <div className="macro-amount">{actual.carbs_g.toFixed(1)}g</div>
          <div className="macro-goal">Goal: {goals.carbs_g.toFixed(0)}g</div>
          <div className="macro-bar">
            <div
              className="macro-bar-fill carbs-bar"
              style={{ width: `${Math.min(100, parseFloat(getMacroPercent(actual.carbs_g, goals.carbs_g)))}%` }}
            ></div>
          </div>
        </div>

        <div className="macro-card">
          <div className="macro-label">Fat</div>
          <div className="macro-amount">{actual.fat_g.toFixed(1)}g</div>
          <div className="macro-goal">Goal: {goals.fat_g.toFixed(0)}g</div>
          <div className="macro-bar">
            <div
              className="macro-bar-fill fat-bar"
              style={{ width: `${Math.min(100, parseFloat(getMacroPercent(actual.fat_g, goals.fat_g)))}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
