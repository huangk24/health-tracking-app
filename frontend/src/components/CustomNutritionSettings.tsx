import React, { useState, useEffect } from "react";
import "../styles/profile.css";

interface CustomNutritionSettingsProps {
  useCustom: boolean;
  customCalories: number;
  customProteinPercent: number;
  customCarbsPercent: number;
  customFatPercent: number;
  recommendedCalories: number;
  onSave: (settings: {
    use_custom_nutrition: boolean;
    custom_calories: number;
    custom_protein_percent: number;
    custom_carbs_percent: number;
    custom_fat_percent: number;
  }) => void;
  onCancel: () => void;
}

const CustomNutritionSettings: React.FC<CustomNutritionSettingsProps> = ({
  useCustom,
  customCalories,
  customProteinPercent,
  customCarbsPercent,
  customFatPercent,
  recommendedCalories,
  onSave,
  onCancel,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(useCustom);
  const [calories, setCalories] = useState(customCalories || recommendedCalories);
  const [proteinPercent, setProteinPercent] = useState(customProteinPercent || 25);
  const [carbsPercent, setCarbsPercent] = useState(customCarbsPercent || 50);
  const [fatPercent, setFatPercent] = useState(customFatPercent || 25);

  // Calculate grams for each macro
  const proteinGrams = Math.round((calories * (proteinPercent / 100)) / 4);
  const carbsGrams = Math.round((calories * (carbsPercent / 100)) / 4);
  const fatGrams = Math.round((calories * (fatPercent / 100)) / 9);

  // Total percentage check
  const totalPercent = proteinPercent + carbsPercent + fatPercent;

  // Auto-adjust to maintain 100%
  useEffect(() => {
    const total = proteinPercent + carbsPercent + fatPercent;
    if (total !== 100 && total > 0) {
      // Normalize to 100%
      const scale = 100 / total;
      setProteinPercent(Math.round(proteinPercent * scale * 10) / 10);
      setCarbsPercent(Math.round(carbsPercent * scale * 10) / 10);
      setFatPercent(Math.round(fatPercent * scale * 10) / 10);
    }
  }, []);

  const handleProteinChange = (value: number) => {
    const remaining = 100 - value;
    const currentOther = carbsPercent + fatPercent;
    if (currentOther > 0) {
      const carbsRatio = carbsPercent / currentOther;
      const fatRatio = fatPercent / currentOther;
      setProteinPercent(value);
      setCarbsPercent(Math.round(remaining * carbsRatio * 10) / 10);
      setFatPercent(Math.round(remaining * fatRatio * 10) / 10);
    }
  };

  const handleCarbsChange = (value: number) => {
    const remaining = 100 - value;
    const currentOther = proteinPercent + fatPercent;
    if (currentOther > 0) {
      const proteinRatio = proteinPercent / currentOther;
      const fatRatio = fatPercent / currentOther;
      setCarbsPercent(value);
      setProteinPercent(Math.round(remaining * proteinRatio * 10) / 10);
      setFatPercent(Math.round(remaining * fatRatio * 10) / 10);
    }
  };

  const handleFatChange = (value: number) => {
    const remaining = 100 - value;
    const currentOther = proteinPercent + carbsPercent;
    if (currentOther > 0) {
      const proteinRatio = proteinPercent / currentOther;
      const carbsRatio = carbsPercent / currentOther;
      setFatPercent(value);
      setProteinPercent(Math.round(remaining * proteinRatio * 10) / 10);
      setCarbsPercent(Math.round(remaining * carbsRatio * 10) / 10);
    }
  };

  const handleSave = () => {
    onSave({
      use_custom_nutrition: isCustomMode,
      custom_calories: isCustomMode ? calories : 0,
      custom_protein_percent: isCustomMode ? proteinPercent / 100 : 0.25,
      custom_carbs_percent: isCustomMode ? carbsPercent / 100 : 0.50,
      custom_fat_percent: isCustomMode ? fatPercent / 100 : 0.25,
    });
  };

  return (
    <div className="custom-nutrition-modal">
      <div className="custom-nutrition-content">
        <h2>Custom Calories & Macronutrients</h2>

        {/* Mode Selection */}
        <div className="nutrition-mode-selector">
          <button
            className={`mode-button ${!isCustomMode ? "active" : ""}`}
            onClick={() => setIsCustomMode(false)}
          >
            <span className="mode-icon">📊</span>
            <div>
              <div className="mode-title">Recommended</div>
              <div className="mode-subtitle">{recommendedCalories} kcal</div>
            </div>
          </button>
          <button
            className={`mode-button ${isCustomMode ? "active" : ""}`}
            onClick={() => setIsCustomMode(true)}
          >
            <span className="mode-icon">✏️</span>
            <div>
              <div className="mode-title">Custom</div>
              <div className="mode-subtitle">Set your own</div>
            </div>
          </button>
        </div>

        {isCustomMode && (
          <>
            {/* Calorie Input */}
            <div className="custom-calories-section">
              <label>Daily Calorie Target</label>
              <div className="calorie-input-wrapper">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  min="1000"
                  max="4000"
                  className="calorie-input"
                />
                <span className="calorie-unit">kcal</span>
              </div>
              <p className="input-hint">Range: 1000 - 4000 kcal</p>
            </div>

            {/* Macronutrient Sliders */}
            <div className="macros-section">
              <h3>Macronutrient Distribution</h3>
              <p className="macros-hint">
                Set energy distribution for your daily calorie target. Exercise calories are not included.
              </p>

              {/* Carbs */}
              <div className="macro-slider-group">
                <div className="macro-header">
                  <div className="macro-label">
                    <span className="macro-icon carbs">🌾</span>
                    <span>Carbohydrates</span>
                  </div>
                  <div className="macro-values">
                    <span className="macro-grams">{carbsGrams}g</span>
                    <span className="macro-percent">({carbsPercent}%)</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="1"
                  value={carbsPercent}
                  onChange={(e) => handleCarbsChange(Number(e.target.value))}
                  className="macro-slider carbs-slider"
                />
              </div>

              {/* Protein */}
              <div className="macro-slider-group">
                <div className="macro-header">
                  <div className="macro-label">
                    <span className="macro-icon protein">🥚</span>
                    <span>Protein</span>
                  </div>
                  <div className="macro-values">
                    <span className="macro-grams">{proteinGrams}g</span>
                    <span className="macro-percent">({proteinPercent}%)</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="1"
                  value={proteinPercent}
                  onChange={(e) => handleProteinChange(Number(e.target.value))}
                  className="macro-slider protein-slider"
                />
              </div>

              {/* Fat */}
              <div className="macro-slider-group">
                <div className="macro-header">
                  <div className="macro-label">
                    <span className="macro-icon fat">🥑</span>
                    <span>Fat</span>
                  </div>
                  <div className="macro-values">
                    <span className="macro-grams">{fatGrams}g</span>
                    <span className="macro-percent">({fatPercent}%)</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="1"
                  value={fatPercent}
                  onChange={(e) => handleFatChange(Number(e.target.value))}
                  className="macro-slider fat-slider"
                />
              </div>

              {totalPercent !== 100 && (
                <div className="percent-warning">
                  Total: {totalPercent.toFixed(1)}% (should be 100%)
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomNutritionSettings;
