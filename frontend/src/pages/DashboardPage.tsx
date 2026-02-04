import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Welcome, {user?.username}!</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>
      <p>You've successfully logged in to the Health Tracking App.</p>
      <p>Dashboard features coming soon...</p>
    </div>
  );
};

export default DashboardPage;
