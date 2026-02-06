import React, { useState } from "react";
import { ExerciseEntry } from "../types/nutrition";
import { exerciseApi } from "../services/api";
import "../styles/meals.css";

interface ExerciseSectionProps {
  exercises: ExerciseEntry[];
  token: string;
  onExerciseUpdated: () => void;
}

const ExerciseSection: React.FC<ExerciseSectionProps> = ({ exercises, token, onExerciseUpdated }) => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseEntry | null>(null);
  const [editName, setEditName] = useState("");
  const [editCaloriesBurned, setEditCaloriesBurned] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (exercises.length === 0) {
    return null;
  }

  const totalCaloriesBurned = exercises.reduce((sum, ex) => sum + ex.calories_burned, 0);

  const openEditor = (exercise: ExerciseEntry) => {
    setSelectedExercise(exercise);
    setEditName(exercise.name);
    setEditCaloriesBurned(exercise.calories_burned.toString());
    setError(null);
  };

  const closeEditor = () => {
    setSelectedExercise(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedExercise) return;
    const caloriesValue = parseFloat(editCaloriesBurned);
    if (!editName.trim()) {
      setError("Exercise name is required");
      return;
    }
    if (!editCaloriesBurned || Number.isNaN(caloriesValue) || caloriesValue <= 0) {
      setError("Calories burned must be a positive number");
      return;
    }

    try {
      setIsSaving(true);
      await exerciseApi.updateExercise(
        selectedExercise.id,
        {
          name: editName.trim(),
          calories_burned: caloriesValue,
        },
        token
      );
      closeEditor();
      onExerciseUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to update exercise");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExercise) return;
    const confirmed = window.confirm("Delete this exercise entry?");
    if (!confirmed) return;

    try {
      setIsSaving(true);
      await exerciseApi.deleteExercise(selectedExercise.id, token);
      closeEditor();
      onExerciseUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to delete exercise");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="meal-section">
      <div className="meal-header">
        <h3>
          <span className="meal-emoji">🏃</span>
          <span className="meal-label">Exercise</span>
        </h3>
      </div>

      <div className="meal-entries">
        {exercises.map((exercise) => (
          <button
            key={exercise.id}
            className="meal-entry"
            onClick={() => openEditor(exercise)}
          >
            <span className="entry-name">{exercise.name}</span>
            <span className="entry-calories">{exercise.calories_burned.toFixed(0)} cal</span>
          </button>
        ))}
      </div>

      <div className="meal-footer">
        <span className="meal-footer-label">Total burned</span>
        <span className="meal-footer-value">{totalCaloriesBurned.toFixed(0)} cal</span>
      </div>

      {selectedExercise && (
        <div className="entry-modal-overlay" onClick={closeEditor}>
          <div className="entry-modal" onClick={(e) => e.stopPropagation()}>
            <div className="entry-modal-header">
              <h4>Edit Exercise</h4>
              <button className="btn-close" onClick={closeEditor}>
                ✕
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="entry-modal-body">
              <div className="entry-field">
                <label>Exercise Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isSaving}
                  placeholder="e.g., Running"
                />
              </div>

              <div className="entry-field">
                <label>Calories Burned</label>
                <input
                  type="number"
                  value={editCaloriesBurned}
                  onChange={(e) => setEditCaloriesBurned(e.target.value)}
                  disabled={isSaving}
                  min="0.1"
                  step="0.1"
                  placeholder="e.g., 300"
                />
              </div>
            </div>

            <div className="entry-actions">
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Delete
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-secondary"
                  onClick={closeEditor}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseSection;
