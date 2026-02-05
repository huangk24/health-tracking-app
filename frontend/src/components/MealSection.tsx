import { MealType } from '../types/nutrition';
import '../styles/meals.css';

interface FoodEntry {
  id: number;
  food_item: {
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  quantity: number;
  unit: string;
}

interface MealSectionProps {
  mealType: MealType;
  entries: FoodEntry[];
  onAddFood?: () => void;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '🥗 Lunch',
  dinner: '🍽️ Dinner',
  snack: '🍿 Snack',
  in_between: '☕ In Between',
};

export default function MealSection({ mealType, entries, onAddFood }: MealSectionProps) {
  const totalCalories = entries.reduce((sum, entry) => sum + entry.food_item.calories * entry.quantity, 0);
  const totalProtein = entries.reduce((sum, entry) => sum + entry.food_item.protein_g * entry.quantity, 0);
  const totalCarbs = entries.reduce((sum, entry) => sum + entry.food_item.carbs_g * entry.quantity, 0);
  const totalFat = entries.reduce((sum, entry) => sum + entry.food_item.fat_g * entry.quantity, 0);

  return (
    <div className="meal-section">
      <div className="meal-header">
        <h3 className="meal-title">{MEAL_LABELS[mealType]}</h3>
        <button className="add-food-btn" onClick={onAddFood}>
          + Add Food
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="meal-empty">No foods logged yet</div>
      ) : (
        <>
          <div className="meal-entries">
            {entries.map((entry) => (
              <div key={entry.id} className="meal-entry">
                <div className="entry-info">
                  <div className="entry-name">{entry.food_item.name}</div>
                  <div className="entry-quantity">
                    {entry.quantity} {entry.unit}
                  </div>
                </div>
                <div className="entry-calories">
                  {(entry.food_item.calories * entry.quantity).toFixed(0)} cal
                </div>
              </div>
            ))}
          </div>

          <div className="meal-totals">
            <div className="meal-total-item">
              <span>Calories</span>
              <strong>{totalCalories.toFixed(0)}</strong>
            </div>
            <div className="meal-total-item">
              <span>Protein</span>
              <strong>{totalProtein.toFixed(1)}g</strong>
            </div>
            <div className="meal-total-item">
              <span>Carbs</span>
              <strong>{totalCarbs.toFixed(1)}g</strong>
            </div>
            <div className="meal-total-item">
              <span>Fat</span>
              <strong>{totalFat.toFixed(1)}g</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
