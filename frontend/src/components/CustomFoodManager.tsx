import React, { useState } from "react";
import { CustomFood, CustomFoodCreate } from "../types/nutrition";
import { nutritionApi } from "../services/api";

interface CustomFoodManagerProps {
  token: string;
  customFoods: CustomFood[];
  onCustomFoodsChanged: () => void;
  onClose: () => void;
}

const CustomFoodManager: React.FC<CustomFoodManagerProps> = ({
  token,
  customFoods,
  onCustomFoodsChanged,
  onClose,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingFood, setEditingFood] = useState<CustomFood | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const UNIT_OPTIONS = [
    { value: "g", label: "Grams (g)" },
    { value: "oz", label: "Ounces (oz)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "cup", label: "Cup" },
    { value: "tbsp", label: "Tablespoon (tbsp)" },
    { value: "tsp", label: "Teaspoon (tsp)" },
    { value: "serving", label: "Serving" },
    { value: "piece", label: "Piece" },
    { value: "slice", label: "Slice" },
  ];

  const [formData, setFormData] = useState<CustomFoodCreate>({
    name: "",
    unit: "g",
    reference_amount: 0,
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sodium_mg: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : name === "unit" ? value : parseFloat(value) || 0,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Food name is required");
      return false;
    }
    if (!formData.unit) {
      setError("Unit is required");
      return false;
    }
    if (formData.reference_amount <= 0) {
      setError("Reference amount must be a positive number");
      return false;
    }
    if (formData.calories <= 0) {
      setError("Calories must be a positive number");
      return false;
    }
    if (formData.protein_g! < 0 || formData.carbs_g! < 0 || formData.fat_g! < 0) {
      setError("Macros cannot be negative");
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
      if (editingFood) {
        await nutritionApi.updateCustomFood(editingFood.id, formData, token);
        setSuccessMessage(`${formData.name} updated successfully!`);
        setEditingFood(null);
      } else {
        await nutritionApi.createCustomFood(formData, token);
        setSuccessMessage(`${formData.name} added to your custom foods!`);
      }
      setFormData({
        name: "",
        unit: "g",
        reference_amount: 0,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        sodium_mg: 0,
      });
      setIsAddingNew(false);
      onCustomFoodsChanged();
    } catch (err: any) {
      setError(err.message || `Failed to ${editingFood ? 'update' : 'add'} custom food`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (foodId: number, foodName: string) => {
    if (!confirm(`Delete "${foodName}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await nutritionApi.deleteCustomFood(foodId, token);
      setSuccessMessage(`${foodName} deleted`);
      onCustomFoodsChanged();
    } catch (err: any) {
      setError(err.message || "Failed to delete custom food");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (food: CustomFood) => {
    setFormData({
      name: food.name,
      unit: food.unit,
      reference_amount: food.reference_amount,
      calories: food.calories,
      protein_g: food.protein_g || 0,
      carbs_g: food.carbs_g || 0,
      fat_g: food.fat_g || 0,
      fiber_g: food.fiber_g || 0,
      sodium_mg: food.sodium_mg || 0,
    });
    setEditingFood(food);
    setIsAddingNew(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingFood(null);
    setIsAddingNew(false);
    setFormData({
      name: "",
      unit: "g",
      reference_amount: 0,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sodium_mg: 0,
    });
    setError(null);
  };

  return (
    <div className="add-food-overlay">
      <div className="add-food-modal">
        <div className="add-food-header">
          <h2>My Custom Foods</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="custom-food-manager">
          {error && <div className="form-error">{error}</div>}
          {successMessage && <div className="form-success">{successMessage}</div>}

          {!isAddingNew && (
            <>
              <div className="custom-foods-list">
                {customFoods.length === 0 ? (
                  <p className="empty-message">
                    No custom foods yet. Add your favorite foods for quick logging!
                  </p>
                ) : (
                  customFoods.map((food) => (
                    <div key={food.id} className="custom-food-item">
                      <div className="custom-food-info">
                        <div className="custom-food-name">{food.name}</div>
                        <div className="custom-food-details">
                          per {food.reference_amount} {food.unit}: {food.calories} cal
                          {food.protein_g > 0 && ` | P: ${food.protein_g}g`}
                          {food.carbs_g > 0 && ` | C: ${food.carbs_g}g`}
                          {food.fat_g > 0 && ` | F: ${food.fat_g}g`}
                        </div>
                      </div>
                      <div className="custom-food-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(food)}
                          disabled={isLoading}
                          aria-label={`Edit ${food.name}`}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(food.id, food.name)}
                          disabled={isLoading}
                          aria-label={`Delete ${food.name}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                className="btn-submit"
                onClick={() => setIsAddingNew(true)}
                style={{ marginTop: "1rem" }}
              >
                + Add New Custom Food
              </button>
            </>
          )}

          {isAddingNew && (
            <form onSubmit={handleSubmit} className="add-food-form">
              <h3>{editingFood ? "Edit Custom Food" : "Add New Custom Food"}</h3>
              
              <div className="form-group">
                <label htmlFor="name">Food Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Homemade Pasta, Protein Shake"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit *</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                >
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reference_amount">Reference Amount *</label>
                <input
                  id="reference_amount"
                  type="number"
                  name="reference_amount"
                  value={formData.reference_amount || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., 39 (for 39g)"
                  min="0"
                  step="0.1"
                  required
                />
                <small>The amount for which you'll specify nutrition values below</small>
              </div>

              <div className="form-group">
                <label htmlFor="calories">Calories (per {formData.reference_amount || "reference amount"}{formData.unit}) *</label>
                <input
                  id="calories"
                  type="number"
                  name="calories"
                  value={formData.calories || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., 150"
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
                Macros (per {formData.reference_amount || "reference amount"}{formData.unit}) - Optional
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="protein_g">Protein (g)</label>
                  <input
                    id="protein_g"
                    type="number"
                    name="protein_g"
                    value={formData.protein_g || ""}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="carbs_g">Carbs (g)</label>
                  <input
                    id="carbs_g"
                    type="number"
                    name="carbs_g"
                    value={formData.carbs_g || ""}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fat_g">Fat (g)</label>
                  <input
                    id="fat_g"
                    type="number"
                    name="fat_g"
                    value={formData.fat_g || ""}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : editingFood ? "Update Custom Food" : "Save Custom Food"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomFoodManager;
