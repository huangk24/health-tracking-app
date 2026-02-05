import React from "react";
import { MealSummary, MealType } from "../types/nutrition";
import "../styles/meals.css";

const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍿",
  in_between: "☕",
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  in_between: "In Between",
};

interface MealSectionProps {
  meal: MealSummary;
}

const MealSection: React.FC<MealSectionProps> = ({ meal }) => {
  const emoji = MEAL_EMOJIS[meal.meal_type];
  const label = MEAL_LABELS[meal.meal_type];

  return (
    <div className="meal-section">
      <h3 className="meal-header">
        {emoji} {label}
      </h3>

      {meal.entries.length === 0 ? (
        <p className="no-items">No foods logged yet</p>
      ) : (
        <>
          <div className="meal-entries">
            {meal.entries.map((entry) => (
              <div key={entry.id} className="meal-entry">
                <div className="entry-info">
                  <div className="food-name">{entry.food_item.name}</div>
                  <div className="entry-details">
                    {entry.quantity} {entry.unit}
                  </div>
                </div>
                <div className="entry-calories">
                  {Math.round(entry.food_item.calories * entry.quantity)} cal
                </div>
              </div>
            ))}
          </div>

          <div className="meal-totals">
            <div className="total-item">
              <span>Calories:</span>
              <strong>{Math.round(meal.totals.calories)}</strong>
            </div>
            <div className="total-item">
              <span>Protein:</span>
              <strong>{Math.round(meal.totals.protein_g)}g</strong>
            </div>
            <div className="total-item">
              <span>Carbs:</span>
              <strong>{Math.round(meal.totals.carbs_g)}g</strong>
            </div>
            <div className="total-item">
              <span>Fat:</span>
              <strong>{Math.round(meal.totals.fat_g)}g</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MealSection;
