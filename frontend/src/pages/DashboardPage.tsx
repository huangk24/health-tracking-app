import React, { useEffect, useMemo, useState } from "react";
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

const PST_TIMEZONE = "America/Los_Angeles";
const PST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: PST_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const PST_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: PST_TIMEZONE,
  weekday: "short",
});
const PST_LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: PST_TIMEZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
});
const PST_DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: PST_TIMEZONE,
  day: "numeric",
});

const getPstDateString = (date: Date) => PST_DATE_FORMATTER.format(date);

const dateFromPstString = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
};

const addDays = (dateStr: string, offset: number) => {
  const base = dateFromPstString(dateStr);
  return getPstDateString(new Date(base.getTime() + offset * 86400000));
};

const getWeekDates = (dateStr: string) => {
  const anchor = dateFromPstString(dateStr);
  const dayIndex = anchor.getUTCDay();
  const start = new Date(anchor.getTime() - dayIndex * 86400000);
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start.getTime() + index * 86400000);
    return {
      dateStr: getPstDateString(current),
      weekday: PST_WEEKDAY_FORMATTER.format(current),
      dayNumber: PST_DAY_FORMATTER.format(current),
    };
  });
};

const DashboardPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [nutritionData, setNutritionData] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => getPstDateString(new Date()));
  const todayPst = getPstDateString(new Date());
  const isToday = selectedDate === todayPst;
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

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
                {isToday
                  ? "Today"
                  : PST_LONG_DATE_FORMATTER.format(dateFromPstString(selectedDate))}
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
