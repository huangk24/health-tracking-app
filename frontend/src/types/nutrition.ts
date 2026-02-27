export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "in_between";

export type FoodItemSource = "custom" | "usda";

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
  serving_size_grams?: number | null;
  source?: FoodItemSource;
  external_id?: string | null;
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
  totals: NutritionTotals;
}

export interface CalorieEntryUpdate {
  quantity?: number;
  unit?: string;
  meal_type?: MealType;
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
  exercises: ExerciseEntry[];
}

export interface ExerciseEntry {
  id: number;
  user_id: number;
  name: string;
  calories_burned: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseEntryCreate {
  name: string;
  calories_burned: number;
  date: string;
}

export interface ExerciseEntryUpdate {
  name?: string;
  calories_burned?: number;
}

export interface UsdaFoodSearchResult {
  fdc_id: number;
  description: string;
  brand_name?: string | null;
  data_type?: string | null;
  serving_size?: number | null;
  serving_size_unit?: string | null;
}

export interface UsdaFoodSearchResponse {
  results: UsdaFoodSearchResult[];
}

export interface UsdaFoodDetailsResponse {
  fdc_id: number;
  description: string;
  brand_name?: string | null;
  data_type?: string | null;
  serving_size?: number | null;
  serving_size_unit?: string | null;
  nutrients_per_100g: NutritionTotals;
}

export interface CustomFood {
  id: number;
  user_id: number;
  name: string;
  unit: string;
  reference_amount: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  created_at: string;
}

export interface CustomFoodCreate {
  name: string;
  unit: string;
  reference_amount: number;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sodium_mg?: number;
}
