import React, { useState } from "react";
import { MealType, UsdaFoodSearchResult } from "../types/nutrition";
import { nutritionApi } from "../services/api";
import "../styles/add-food-form.css";

interface AddFoodFormProps {
  token: string;
  date: string;
  onFoodAdded: () => void;
}

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast 🌅" },
  { value: "lunch", label: "Lunch 🥗" },
  { value: "dinner", label: "Dinner 🍽️" },
  { value: "snack", label: "Snack 🍿" },
  { value: "in_between", label: "In Between ☕" },
];

const AddFoodForm: React.FC<AddFoodFormProps> = ({ token, date, onFoodAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [foodSource, setFoodSource] = useState<"usda" | "custom">("usda");
  const [usdaQuery, setUsdaQuery] = useState("");
  const [usdaResults, setUsdaResults] = useState<UsdaFoodSearchResult[]>([]);
  const [selectedUsda, setSelectedUsda] = useState<UsdaFoodSearchResult | null>(null);
  const [usdaGrams, setUsdaGrams] = useState("");

  const [formData, setFormData] = useState({
    mealType: "breakfast" as MealType,
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (foodSource === "usda") {
      if (!selectedUsda) {
        setError("Select a USDA food item");
        return false;
      }
      if (!usdaGrams || parseFloat(usdaGrams) <= 0) {
        setError("Amount must be a positive number of grams");
        return false;
      }
      return true;
    }
    if (!formData.foodName.trim()) {
      setError("Food name is required");
      return false;
    }
    if (!formData.calories || parseFloat(formData.calories) <= 0) {
      setError("Calories must be a positive number");
      return false;
    }
    if (formData.protein && parseFloat(formData.protein) < 0) {
      setError("Protein cannot be negative");
      return false;
    }
    if (formData.carbs && parseFloat(formData.carbs) < 0) {
      setError("Carbs cannot be negative");
      return false;
    }
    if (formData.fat && parseFloat(formData.fat) < 0) {
      setError("Fat cannot be negative");
      return false;
    }
    return true;
  };

  const handleUsdaSearch = async () => {
    setError(null);
    setSuccessMessage(null);
    const query = usdaQuery.trim();
    if (!query) {
      setError("Enter a search term");
      return;
    }

    try {
      setIsSearching(true);
      const response = await nutritionApi.searchUsdaFoods(query);
      setUsdaResults(response.results || []);
      setSelectedUsda(null);
    } catch (err: any) {
      setError(err.message || "Failed to search USDA foods");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      if (foodSource === "usda") {
        const foodItemResponse = await nutritionApi.createUsdaFoodItem(
          selectedUsda!.fdc_id,
          token
        );

        await nutritionApi.createFoodEntry(
          {
            food_item_id: foodItemResponse.id,
            quantity: parseFloat(usdaGrams),
            unit: "g",
            meal_type: formData.mealType,
            date: date,
          },
          token
        );

        setSuccessMessage(
          `${selectedUsda!.description} added to ${formData.mealType}!`
        );
        setUsdaQuery("");
        setUsdaResults([]);
        setSelectedUsda(null);
        setUsdaGrams("");
      } else {
        const foodItemResponse = await nutritionApi.createFoodItem(
          {
            name: formData.foodName.trim(),
            serving_size: "1 serving",
            calories: parseFloat(formData.calories),
            protein_g: formData.protein ? parseFloat(formData.protein) : 0,
            carbs_g: formData.carbs ? parseFloat(formData.carbs) : 0,
            fat_g: formData.fat ? parseFloat(formData.fat) : 0,
            fiber_g: 0,
            sodium_mg: 0,
          },
          token
        );

        await nutritionApi.createFoodEntry(
          {
            food_item_id: foodItemResponse.id,
            quantity: 1,
            unit: "serving",
            meal_type: formData.mealType,
            date: date,
          },
          token
        );

        setSuccessMessage(`${formData.foodName} added to ${formData.mealType}!`);

        setFormData({
          mealType: "breakfast",
          foodName: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
        });
      }

      // Close form after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        onFoodAdded();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to add food");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className="add-food-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Add food"
        >
          + Add Food
        </button>
      )}

      {isOpen && (
        <div className="add-food-overlay">
          <div className="add-food-modal">
            <div className="add-food-header">
              <h2>Add Food to Meal</h2>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="add-food-form">
              {error && <div className="form-error">{error}</div>}
              {successMessage && (
                <div className="form-success">{successMessage}</div>
              )}

              <div className="form-group">
                <label>Food Source *</label>
                <div className="food-source-toggle">
                  <label>
                    <input
                      type="radio"
                      name="foodSource"
                      value="usda"
                      checked={foodSource === "usda"}
                      onChange={() => setFoodSource("usda")}
                    />
                    USDA Database
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="foodSource"
                      value="custom"
                      checked={foodSource === "custom"}
                      onChange={() => setFoodSource("custom")}
                    />
                    Custom Food
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mealType">Meal Type *</label>
                <select
                  id="mealType"
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleInputChange}
                  required
                >
                  {MEAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {foodSource === "usda" ? (
                <>
                  <div className="form-group">
                    <label htmlFor="usdaSearch">Search USDA Foods *</label>
                    <div className="usda-search-row">
                      <input
                        id="usdaSearch"
                        type="text"
                        value={usdaQuery}
                        onChange={(e) => setUsdaQuery(e.target.value)}
                        placeholder="e.g., Chicken breast, Apple, Rice"
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleUsdaSearch}
                        disabled={isSearching}
                      >
                        {isSearching ? "Searching..." : "Search"}
                      </button>
                    </div>
                  </div>

                  {usdaResults.length > 0 && (
                    <div className="form-group">
                      <label>Select USDA Food *</label>
                      <div className="usda-results">
                        {usdaResults.map((result) => (
                          <button
                            type="button"
                            key={result.fdc_id}
                            className={
                              selectedUsda?.fdc_id === result.fdc_id
                                ? "usda-result selected"
                                : "usda-result"
                            }
                            onClick={() => setSelectedUsda(result)}
                          >
                            <div className="usda-result-title">
                              {result.description}
                            </div>
                            <div className="usda-result-meta">
                              {result.brand_name
                                ? `${result.brand_name} · `
                                : ""}
                              {result.data_type || "USDA"}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="usdaGrams">Amount (grams) *</label>
                    <input
                      id="usdaGrams"
                      type="number"
                      value={usdaGrams}
                      onChange={(e) => setUsdaGrams(e.target.value)}
                      placeholder="e.g., 150"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="foodName">Food Name *</label>
                    <input
                      id="foodName"
                      type="text"
                      name="foodName"
                      value={formData.foodName}
                      onChange={handleInputChange}
                      placeholder="e.g., Chicken Breast, Apple, Rice"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="calories">Calories *</label>
                    <input
                      id="calories"
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      placeholder="e.g., 150"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="protein">Protein (g)</label>
                      <input
                        id="protein"
                        type="number"
                        name="protein"
                        value={formData.protein}
                        onChange={handleInputChange}
                        placeholder="Optional"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="carbs">Carbs (g)</label>
                      <input
                        id="carbs"
                        type="number"
                        name="carbs"
                        value={formData.carbs}
                        onChange={handleInputChange}
                        placeholder="Optional"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fat">Fat (g)</label>
                      <input
                        id="fat"
                        type="number"
                        name="fat"
                        value={formData.fat}
                        onChange={handleInputChange}
                        placeholder="Optional"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Food"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFoodForm;
