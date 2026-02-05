import React, { useState } from "react";
import { MealType } from "../types/nutrition";
import { nutritionApi } from "../services/api";
import "../styles/add-food-form.css";

interface AddFoodFormProps {
  token: string;
  onFoodAdded: () => void;
}

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast 🌅" },
  { value: "lunch", label: "Lunch 🥗" },
  { value: "dinner", label: "Dinner 🍽️" },
  { value: "snack", label: "Snack 🍿" },
  { value: "in_between", label: "In Between ☕" },
];

const AddFoodForm: React.FC<AddFoodFormProps> = ({ token, onFoodAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Create food item
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

      // Create calorie entry
      await nutritionApi.createFoodEntry(
        {
          food_item_id: foodItemResponse.id,
          quantity: 1,
          unit: "serving",
          meal_type: formData.mealType,
        },
        token
      );

      setSuccessMessage(`${formData.foodName} added to ${formData.mealType}!`);

      // Reset form
      setFormData({
        mealType: "breakfast",
        foodName: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
      });

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
