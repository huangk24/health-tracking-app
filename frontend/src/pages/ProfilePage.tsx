import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../services/api";
import WeightTrend from "../components/WeightTrend";
import WeeklyComparison from "../components/WeeklyComparison";
import "../styles/profile.css";

interface UserProfile {
  id: number;
  username: string;
  sex?: string;
  age?: number;
  height?: number;
  weight?: number;
  goal?: string;
}

const ProfilePage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    sex: "",
    age: "",
    height: "",
    weight: "",
    goal: "maintain",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await profileApi.getProfile(token || undefined);
        setProfile(data);
        setFormData({
          sex: data.sex || "",
          age: data.age?.toString() || "",
          height: data.height?.toString() || "",
          weight: data.weight?.toString() || "",
          goal: data.goal || "maintain",
        });
        setError(undefined);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    try {
      const updateData = {
        sex: formData.sex || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        goal: formData.goal,
      };

      const updatedProfile = await profileApi.updateProfile(updateData, token || undefined);
      setProfile(updatedProfile as any);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Refresh after 2 seconds
      setTimeout(() => {
        setSuccess(undefined);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!profile) {
    return <div className="error-message">Failed to load profile</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="header-left">
          <button onClick={() => navigate("/dashboard")} className="btn-back">
            ← Back to Dashboard
          </button>
          <h1>My Profile</h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-message-title">Error</div>
          {error}
        </div>
      )}

      {success && <div className="success-message">{success}</div>}

      <div className="profile-container">
        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-info">
              <h2>{profile.username}</h2>
              <div className="info-items">
                <div className="info-item">
                  <label>Gender</label>
                  <p>{profile.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : "Not set"}</p>
                </div>
                <div className="info-item">
                  <label>Age</label>
                  <p>{profile.age ? `${profile.age} years` : "Not set"}</p>
                </div>
                <div className="info-item">
                  <label>Height</label>
                  <p>{profile.height ? `${profile.height} cm` : "Not set"}</p>
                </div>
                <div className="info-item">
                  <label>Weight</label>
                  <p>{profile.weight ? `${profile.weight} kg` : "Not set"}</p>
                </div>
                <div className="info-item">
                  <label>Goal</label>
                  <p>
                    {profile.goal === "lose"
                      ? "Lose Weight"
                      : profile.goal === "gain"
                      ? "Gain Weight"
                      : "Maintain Weight"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-edit"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <h3>Edit Profile</h3>

            <div className="form-group">
              <label htmlFor="sex">Gender</label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="age">Age (years)</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="e.g., 25"
                min="10"
                max="120"
              />
            </div>

            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                placeholder="e.g., 175"
                min="100"
                max="220"
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 70"
                min="30"
                max="300"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="goal">Goal</label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setError(undefined);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      <WeeklyComparison token={token!} />

      <WeightTrend token={token!} />
    </div>
  );
};

export default ProfilePage;
