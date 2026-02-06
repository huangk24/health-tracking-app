import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { nutritionApi } from "../services/api";
import { DailyNutritionSummary } from "../types/nutrition";
import NutritionSummary from "../components/NutritionSummary";
import MealSection from "../components/MealSection";
import AddFoodForm from "../components/AddFoodForm";
import AddExerciseForm from "../components/AddExerciseForm";
import ExerciseSection from "../components/ExerciseSection";
import "../styles/global.css";

// Get API base URL (same logic as api.ts)
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';

  const hostname = window.location.hostname;

  if (hostname.includes('.app.github.dev')) {
    const backendHostname = hostname.replace(/-\d+\.app\.github\.dev/, '-8000.app.github.dev');
    return `https://${backendHostname}`;
  }

  return 'http://localhost:8000';
};

const DashboardPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [nutritionData, setNutritionData] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNutrition = async () => {
    if (!token) {
      setError("Not authenticated");
      return;
    }

    try {
      setLoading(true);
      const data = await nutritionApi.getDailyNutrition(undefined, token);
      setNutritionData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load nutrition data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Health check: verify backend is reachable before loading nutrition data
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/health`);
        if (!response.ok) {
          throw new Error("Backend returned error");
        }
      } catch (err) {
        setError(
          "⚠️ Backend server is not responding. Make sure to start it with: cd backend && uvicorn app.main:app --reload"
        );
        setLoading(false);
        return;
      }

      // Backend is healthy, fetch nutrition data
      fetchNutrition();
    };

    if (token) {
      checkBackendHealth();
    }
  }, [token]);

  const handleFoodAdded = () => {
    fetchNutrition();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <div className="header-actions">
          <button onClick={handleProfileClick} className="profile-btn">
            👤 Profile
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}
      {error && (
        <div className="error-message">
          <div className="error-message-title">Error</div>
          {error}
        </div>
      )}

      {nutritionData && (
        <>
          <NutritionSummary
            goals={nutritionData.goals}
            actual={nutritionData.actual_intake}
            remaining={nutritionData.remaining}
            consumption={nutritionData.actual_consumption}
          />

          <div className="meals-section">
            <div className="meals-header">
              <h2>Meals & Exercise</h2>
              <div className="header-buttons">
                <AddFoodForm token={token!} onFoodAdded={handleFoodAdded} />
                <AddExerciseForm
                  token={token!}
                  date={nutritionData.date}
                  onExerciseAdded={handleFoodAdded}
                />
              </div>
            </div>

            {nutritionData.meals.length === 0 ? (
              <p className="no-items">No meals logged yet. Start adding some food!</p>
            ) : (
              <div className="meals-container">
                {nutritionData.meals.map((meal) => (
                  <MealSection
                    key={meal.meal_type}
                    meal={meal}
                    token={token!}
                    onEntryUpdated={handleFoodAdded}
                  />
                ))}
              </div>
            )}

            {nutritionData.exercises && nutritionData.exercises.length > 0 && (
              <div className="exercise-section">
                <ExerciseSection
                  exercises={nutritionData.exercises}
                  token={token!}
                  onExerciseUpdated={handleFoodAdded}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
