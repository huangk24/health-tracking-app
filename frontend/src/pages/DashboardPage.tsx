import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getApiBaseUrl, nutritionApi } from "../services/api";
import { DailyNutritionSummary } from "../types/nutrition";
import NutritionSummary from "../components/NutritionSummary";
import MealSection from "../components/MealSection";
import AddFoodForm from "../components/AddFoodForm";
import AddExerciseForm from "../components/AddExerciseForm";
import ExerciseSection from "../components/ExerciseSection";
import {
  addDays,
  formatPstLongDate,
  getPstDateString,
  getTodayPst,
  getWeekDates,
} from "../utils/date";
import "../styles/global.css";

const DashboardPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [nutritionData, setNutritionData] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => getPstDateString(new Date()));
  const todayPst = getTodayPst();
  const isToday = selectedDate === todayPst;
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  // Load daily nutrition summary for the selected date.
  const fetchNutrition = async (dateStr?: string) => {
    if (!token) {
      setError("Not authenticated");
      return;
    }

    try {
      setLoading(true);
      const targetDate = dateStr || selectedDate;
      const data = await nutritionApi.getDailyNutrition(targetDate, token);
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
      fetchNutrition(selectedDate);
    };

    if (token) {
      checkBackendHealth();
    }
  }, [token]);

  const handleFoodAdded = () => {
    fetchNutrition(selectedDate);
  };

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    fetchNutrition(dateStr);
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
          <div className="date-strip">
            <div className="date-strip-header">
              <div className="date-title">
                {isToday ? "Today" : formatPstLongDate(selectedDate)}
              </div>
              <div className="date-controls">
                <button
                  type="button"
                  className="date-nav"
                  onClick={() => handleDateChange(addDays(selectedDate, -1))}
                  aria-label="Previous day"
                >
                  {"<"}
                </button>
                <input
                  type="date"
                  className="date-input"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
                <button
                  type="button"
                  className="date-nav"
                  onClick={() => handleDateChange(addDays(selectedDate, 1))}
                  aria-label="Next day"
                >
                  {">"}
                </button>
                {!isToday && (
                  <button
                    type="button"
                    className="date-today"
                    onClick={() => handleDateChange(todayPst)}
                  >
                    Today
                  </button>
                )}
              </div>
            </div>
            <div className="date-week">
              {weekDates.map((day) => (
                <button
                  key={day.dateStr}
                  type="button"
                  className={`date-chip ${day.dateStr === selectedDate ? "active" : ""}`}
                  onClick={() => handleDateChange(day.dateStr)}
                >
                  <span className="date-chip-label">{day.weekday}</span>
                  <span className="date-chip-number">{day.dayNumber}</span>
                </button>
              ))}
            </div>
          </div>

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
                <AddFoodForm
                  token={token!}
                  date={selectedDate}
                  onFoodAdded={handleFoodAdded}
                />
                <AddExerciseForm
                  token={token!}
                  date={selectedDate}
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
