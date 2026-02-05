import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NutritionSummary from "../components/NutritionSummary";
import MealSection from "../components/MealSection";
import { nutritionApi } from "../services/api";
import { DailyNutritionSummary } from "../types/nutrition";

const DashboardPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [nutritionData, setNutritionData] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyNutrition = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!token) {
          setError("Not authenticated");
          return;
        }
        const data = await nutritionApi.getDailyNutrition(undefined, token);
        setNutritionData(data);
      } catch (err) {
        console.error("Failed to fetch nutrition data:", err);
        setError("Failed to load nutrition data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDailyNutrition();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.username}!</h1>
          <p className="today-date">Today's Summary</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your nutrition data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : nutritionData ? (
        <>
          <NutritionSummary
            goals={nutritionData.goals}
            actual={nutritionData.actual_intake}
            remaining={nutritionData.remaining}
          />

          <div className="meals-container">
            <h2>Meals</h2>
            {nutritionData.meals.length > 0 ? (
              nutritionData.meals.map((meal) => (
                <MealSection
                  key={meal.meal_type}
                  mealType={meal.meal_type}
                  entries={meal.entries}
                />
              ))
            ) : (
              <div className="empty-meals">
                <p>No meals logged yet. Add some food to get started!</p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DashboardPage;
