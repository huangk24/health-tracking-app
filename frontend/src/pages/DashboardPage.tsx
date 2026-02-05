import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { nutritionApi } from "../services/api";
import { DailyNutritionSummary } from "../types/nutrition";
import NutritionSummary from "../components/NutritionSummary";
import MealSection from "../components/MealSection";
import "../styles/global.css";

const DashboardPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [nutritionData, setNutritionData] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Not authenticated");
      return;
    }

    const fetchNutrition = async () => {
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

    fetchNutrition();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>

      {loading && <div className="loading">Loading nutrition data...</div>}
      {error && <div className="error-message">{error}</div>}

      {nutritionData && (
        <>
          <NutritionSummary
            goals={nutritionData.goals}
            actual={nutritionData.actual_intake}
            remaining={nutritionData.remaining}
          />

          <div className="meals-container">
            <h2>Meals</h2>
            {nutritionData.meals.length === 0 ? (
              <p className="no-items">No meals logged yet. Start adding some food!</p>
            ) : (
              nutritionData.meals.map((meal) => (
                <MealSection key={meal.meal_type} meal={meal} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
