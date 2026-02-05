export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "in_between";

export interface NutritionTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
}

export interface FoodItem {
  id: number;
  name: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
}

export interface CalorieEntry {
  id: number;
  food_item_id: number;
  quantity: number;
  unit: string;
  meal_type: MealType;
  date: string;
  food_item: FoodItem;
}

export interface MealSummary {
  meal_type: MealType;
  entries: CalorieEntry[];
  totals: NutritionTotals;
}

export interface DailyNutritionSummary {
  date: string;
  goals: NutritionTotals;
  actual_intake: NutritionTotals;
  actual_consumption: NutritionTotals;
  remaining: NutritionTotals;
  meals: MealSummary[];
}
