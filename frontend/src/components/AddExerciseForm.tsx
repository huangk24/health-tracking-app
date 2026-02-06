import React, { useState } from "react";
import { exerciseApi } from "../services/api";
import "../styles/add-food-form.css";

interface AddExerciseFormProps {
  token: string;
  date: string;
  onExerciseAdded: () => void;
}

const AddExerciseForm: React.FC<AddExerciseFormProps> = ({ token, date, onExerciseAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    caloriesBurned: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Exercise name is required");
      return false;
    }
    if (!formData.caloriesBurned || parseFloat(formData.caloriesBurned) <= 0) {
      setError("Calories burned must be a positive number");
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

    setIsLoading(true);

    try {
      const exerciseData = {
        name: formData.name.trim(),
        calories_burned: parseFloat(formData.caloriesBurned),
        date: date,
      };

      await exerciseApi.createExercise(exerciseData, token);

      setSuccessMessage("Exercise logged successfully!");
      setFormData({
        name: "",
        caloriesBurned: "",
      });

      setTimeout(() => {
        setSuccessMessage(null);
        setIsOpen(false);
        onExerciseAdded();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to log exercise");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setSuccessMessage(null);
    setFormData({
      name: "",
      caloriesBurned: "",
    });
  };

  return (
    <div className="add-food-container">
      {!isOpen ? (
        <button className="btn-primary add-food-btn" onClick={() => setIsOpen(true)}>
          🏃 Log Exercise
        </button>
      ) : (
        <div className="food-form-card">
          <div className="form-header">
            <h3>Log Exercise</h3>
            <button className="btn-close" onClick={handleClose}>
              ✕
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Exercise Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Running, Cycling, Swimming"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="caloriesBurned">Calories Burned</label>
                <input
                  type="number"
                  id="caloriesBurned"
                  name="caloriesBurned"
                  value={formData.caloriesBurned}
                  onChange={handleInputChange}
                  placeholder="e.g., 300"
                  min="0.1"
                  step="0.1"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Logging..." : "Log Exercise"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddExerciseForm;
