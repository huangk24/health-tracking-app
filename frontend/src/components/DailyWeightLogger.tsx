import React, { useState } from "react";
import { weightApi } from "../services/api";
import "../styles/add-food-form.css";

interface DailyWeightLoggerProps {
  token: string;
  date: string;
  onWeightLogged?: () => void;
}

const DailyWeightLogger: React.FC<DailyWeightLoggerProps> = ({ token, date, onWeightLogged }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Please enter a valid weight");
      return false;
    }
    if (weightValue < 30 || weightValue > 300) {
      setError("Weight must be between 30 and 300 kg");
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
      setLoading(true);
      const weightValue = parseFloat(weight);
      await weightApi.createWeightEntry({ date, weight: weightValue }, token);
      setSuccessMessage("Weight logged successfully!");
      setWeight("");

      setTimeout(() => {
        setSuccessMessage(null);
        setIsOpen(false);
        if (onWeightLogged) {
          onWeightLogged();
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to log weight");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setSuccessMessage(null);
    setWeight("");
  };

  return (
    <div className="add-food-container">
      {!isOpen ? (
        <button className="btn-primary add-food-btn" onClick={() => setIsOpen(true)}>
          ⚖️ Log Weight
        </button>
      ) : (
        <div className="food-form-card">
          <div className="form-header">
            <h3>Log Daily Weight</h3>
            <button className="btn-close" onClick={handleClose}>
              ✕
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 70.5"
                  min="30"
                  max="300"
                  step="0.1"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Logging..." : "Log Weight"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DailyWeightLogger;
