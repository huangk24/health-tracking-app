import React, { useState, useEffect } from "react";
import { MealType, UsdaFoodSearchResult, CustomFood } from "../types/nutrition";
import { nutritionApi } from "../services/api";
import CustomFoodManager from "./CustomFoodManager";
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
  const [foodSource, setFoodSource] = useState<"usda" | "custom" | "saved_custom">("usda");
  const [usdaQuery, setUsdaQuery] = useState("");
  const [usdaResults, setUsdaResults] = useState<UsdaFoodSearchResult[]>([]);
  const [selectedUsda, setSelectedUsda] = useState<UsdaFoodSearchResult | null>(null);
  const [usdaGrams, setUsdaGrams] = useState("");
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [selectedCustomFood, setSelectedCustomFood] = useState<CustomFood | null>(null);
  const [customFoodQuantity, setCustomFoodQuantity] = useState("");
  const [showCustomFoodManager, setShowCustomFoodManager] = useState(false);

  const [formData, setFormData] = useState({
    mealType: "breakfast" as MealType,
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadCustomFoods();
    }
  }, [isOpen]);

  const loadCustomFoods = async () => {
    try {
      const foods = await nutritionApi.getCustomFoods(token);
      setCustomFoods(foods);
    } catch (err: any) {
      console.error("Failed to load custom foods:", err);
    }
  };

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
    if (foodSource === "saved_custom") {
      if (!selectedCustomFood) {
        setError("Select a custom food item");
        return false;
      }
      if (!customFoodQuantity || parseFloat(customFoodQuantity) <= 0) {
        setError("Quantity must be a positive number");
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
      } else if (foodSource === "saved_custom") {
        // Create a FoodItem from the custom food with proper scaling
        const foodItemResponse = await nutritionApi.createFoodItem(
          {
            name: selectedCustomFood!.name,
            serving_size: `${selectedCustomFood!.reference_amount} ${selectedCustomFood!.unit}`,
            serving_size_grams: selectedCustomFood!.unit === "g" ? selectedCustomFood!.reference_amount : null,
            calories: selectedCustomFood!.calories,
            protein_g: selectedCustomFood!.protein_g,
            carbs_g: selectedCustomFood!.carbs_g,
            fat_g: selectedCustomFood!.fat_g,
            fiber_g: selectedCustomFood!.fiber_g,
            sodium_mg: selectedCustomFood!.sodium_mg,
          },
          token
        );

        await nutritionApi.createFoodEntry(
          {
            food_item_id: foodItemResponse.id,
            quantity: parseFloat(customFoodQuantity),
            unit: selectedCustomFood!.unit,
            meal_type: formData.mealType,
            date: date,
          },
          token
        );

        setSuccessMessage(
          `${selectedCustomFood!.name} added to ${formData.mealType}!`
        );
        setSelectedCustomFood(null);
        setCustomFoodQuantity("");
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
                    <span>USDA Database</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="foodSource"
                      value="saved_custom"
                      checked={foodSource === "saved_custom"}
                      onChange={() => setFoodSource("saved_custom")}
                    />
                    <span>My Custom Foods</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="foodSource"
                      value="custom"
                      checked={foodSource === "custom"}
                      onChange={() => setFoodSource("custom")}
                    />
                    <span>Manual Entry</span>
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

              {foodSource === "saved_custom" ? (
                <>
                  <div className="form-group">
                    <label htmlFor="savedCustomFood">Select Custom Food *</label>
                    <select
                      id="savedCustomFood"
                      value={selectedCustomFood?.id || ""}
                      onChange={(e) => {
                        const food = customFoods.find(f => f.id === parseInt(e.target.value));
                        setSelectedCustomFood(food || null);
                      }}
                      required
                    >
                      <option value="">-- Choose a custom food --</option>
                      {customFoods.map((food) => (
                        <option key={food.id} value={food.id}>
                          {food.name} ({food.calories} cal per {food.reference_amount} {food.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {customFoods.length === 0 && (
                    <p style={{ color: "#999", fontSize: "14px", marginBottom: "16px" }}>
                      You haven't added any custom foods yet.{" "}
                      <button
                        type="button"
                        onClick={() => setShowCustomFoodManager(true)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#667eea",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Add one now
                      </button>
                    </p>
                  )}

                  {customFoods.length > 0 && (
                    <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                      <button
                        type="button"
                        onClick={() => setShowCustomFoodManager(true)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#667eea",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Manage Custom Foods
                      </button>
                    </p>
                  )}

                  {selectedCustomFood && (
                    <>
                      <div className="form-group">
                        <label htmlFor="customQuantity">Amount ({selectedCustomFood.unit}) *</label>
                        <input
                          id="customQuantity"
                          type="number"
                          value={customFoodQuantity}
                          onChange={(e) => setCustomFoodQuantity(e.target.value)}
                          placeholder={`e.g., ${selectedCustomFood.reference_amount}`}
                          min="0"
                          step="0.1"
                          required
                        />
                      </div>

                      <div className="nutrition-info-box">
                        <div className="nutrition-header">Nutrition Info</div>
                        <div className="nutrition-row">
                          <span>Per {selectedCustomFood.reference_amount} {selectedCustomFood.unit}</span>
                          <strong>{selectedCustomFood.calories} cal</strong>
                        </div>
                        {selectedCustomFood.protein_g > 0 && (
                          <div className="nutrition-row">
                            <span>Protein</span>
                            <strong>{selectedCustomFood.protein_g}g</strong>
                          </div>
                        )}
                        {selectedCustomFood.carbs_g > 0 && (
                          <div className="nutrition-row">
                            <span>Carbs</span>
                            <strong>{selectedCustomFood.carbs_g}g</strong>
                          </div>
                        )}
                        {selectedCustomFood.fat_g > 0 && (
                          <div className="nutrition-row">
                            <span>Fat</span>
                            <strong>{selectedCustomFood.fat_g}g</strong>
                          </div>
                        )}
                        {customFoodQuantity && parseFloat(customFoodQuantity) > 0 && (
                          <div className="nutrition-divider">
                            <div className="nutrition-section-title">
                              For {customFoodQuantity} {selectedCustomFood.unit}
                            </div>
                            <div className="nutrition-row">
                              <span>Calories</span>
                              <strong>{Math.round((parseFloat(customFoodQuantity) / selectedCustomFood.reference_amount) * selectedCustomFood.calories)} cal</strong>
                            </div>
                            {selectedCustomFood.protein_g > 0 && (
                              <div className="nutrition-row">
                                <span>Protein</span>
                                <strong>{Math.round((parseFloat(customFoodQuantity) / selectedCustomFood.reference_amount) * selectedCustomFood.protein_g * 10) / 10}g</strong>
                              </div>
                            )}
                            {selectedCustomFood.carbs_g > 0 && (
                              <div className="nutrition-row">
                                <span>Carbs</span>
                                <strong>{Math.round((parseFloat(customFoodQuantity) / selectedCustomFood.reference_amount) * selectedCustomFood.carbs_g * 10) / 10}g</strong>
                              </div>
                            )}
                            {selectedCustomFood.fat_g > 0 && (
                              <div className="nutrition-row">
                                <span>Fat</span>
                                <strong>{Math.round((parseFloat(customFoodQuantity) / selectedCustomFood.reference_amount) * selectedCustomFood.fat_g * 10) / 10}g</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : foodSource === "usda" ? (
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

      {showCustomFoodManager && (
        <CustomFoodManager
          token={token}
          customFoods={customFoods}
          onCustomFoodsChanged={loadCustomFoods}
          onClose={() => setShowCustomFoodManager(false)}
        />
      )}
    </>
  );
};

export default AddFoodForm;
