import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { nutritionApi } from "../services/api";
import { DailyNutritionSummary } from "../types/nutrition";
import NutritionSummary from "../components/NutritionSummary";
import MealSection from "../components/MealSection";
import AddFoodForm from "../components/AddFoodForm";
import "../styles/global.css";

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
    fetchNutrition();
  }, [token]);

  const handleFoodAdded = () => {
    fetchNutrition();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
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
          />

          <div className="meals-section">
            <div className="meals-header">
              <h2>Meals</h2>
              <AddFoodForm token={token!} onFoodAdded={handleFoodAdded} />
            </div>

            {nutritionData.meals.length === 0 ? (
              <p className="no-items">No meals logged yet. Start adding some food!</p>
            ) : (
              <div className="meals-container">
                {nutritionData.meals.map((meal) => (
                  <MealSection key={meal.meal_type} meal={meal} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
