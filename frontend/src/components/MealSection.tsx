import React, { useMemo, useState } from "react";
import { CalorieEntry, MealSummary, MealType } from "../types/nutrition";
import { nutritionApi } from "../services/api";
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
  token: string;
  onEntryUpdated: () => void;
}

const MealSection: React.FC<MealSectionProps> = ({ meal, token, onEntryUpdated }) => {
  const emoji = MEAL_EMOJIS[meal.meal_type];
  const label = MEAL_LABELS[meal.meal_type];
  const [selectedEntry, setSelectedEntry] = useState<CalorieEntry | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("serving");
  const [editMealType, setEditMealType] = useState<MealType>(meal.meal_type);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unitOptions = useMemo(() => {
    const base = ["serving", "g"];
    if (selectedEntry && !base.includes(selectedEntry.unit)) {
      return [...base, selectedEntry.unit];
    }
    return base;
  }, [selectedEntry]);

  const openEditor = (entry: CalorieEntry) => {
    setSelectedEntry(entry);
    setEditQuantity(entry.quantity.toString());
    setEditUnit(entry.unit || "serving");
    setEditMealType(entry.meal_type);
    setError(null);
  };

  const closeEditor = () => {
    setSelectedEntry(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedEntry) return;
    const quantityValue = parseFloat(editQuantity);
    if (!editQuantity || Number.isNaN(quantityValue) || quantityValue <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    try {
      setIsSaving(true);
      await nutritionApi.updateFoodEntry(
        selectedEntry.id,
        {
          quantity: quantityValue,
          unit: editUnit,
          meal_type: editMealType,
        },
        token
      );
      closeEditor();
      onEntryUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to update entry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    const confirmed = window.confirm("Delete this food entry?");
    if (!confirmed) return;

    try {
      setIsSaving(true);
      await nutritionApi.deleteFoodEntry(selectedEntry.id, token);
      closeEditor();
      onEntryUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to delete entry");
    } finally {
      setIsSaving(false);
    }
  };

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
              <button
                key={entry.id}
                type="button"
                className="meal-entry"
                onClick={() => openEditor(entry)}
              >
                <div className="entry-info">
                  <div className="food-name">{entry.food_item.name}</div>
                  <div className="entry-details">
                    {entry.quantity} {entry.unit}
                  </div>
                </div>
                <div className="entry-calories">
                  {Math.round(entry.totals.calories)} cal
                </div>
              </button>
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

      {selectedEntry && (
        <div className="entry-modal-overlay" role="dialog" aria-modal="true">
          <div className="entry-modal">
            <div className="entry-modal-header">
              <h4>Edit Food Entry</h4>
              <button type="button" className="entry-close" onClick={closeEditor}>
                ✕
              </button>
            </div>

            {error && <div className="entry-error">{error}</div>}

            <div className="entry-field">
              <label>Food</label>
              <div className="entry-food-name">{selectedEntry.food_item.name}</div>
            </div>

            <div className="entry-field">
              <label htmlFor="entry-amount">Amount</label>
              <input
                id="entry-amount"
                type="number"
                min="0"
                step="0.1"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
              />
            </div>

            <div className="entry-field">
              <label htmlFor="entry-unit">Unit</label>
              <select
                id="entry-unit"
                value={editUnit}
                onChange={(e) => setEditUnit(e.target.value)}
              >
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="entry-field">
              <label htmlFor="entry-meal">Meal Type</label>
              <select
                id="entry-meal"
                value={editMealType}
                onChange={(e) => setEditMealType(e.target.value as MealType)}
              >
                {Object.entries(MEAL_LABELS).map(([value, labelText]) => (
                  <option key={value} value={value}>
                    {labelText}
                  </option>
                ))}
              </select>
            </div>

            <div className="entry-actions">
              <button
                type="button"
                className="entry-delete"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Delete
              </button>
              <button
                type="button"
                className="entry-save"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealSection;
