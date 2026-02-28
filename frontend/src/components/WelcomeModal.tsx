import React from "react";
import "../styles/welcome-modal.css";

interface WelcomeModalProps {
  username: string;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ username, onClose }) => {
  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-modal-header">
          <span className="welcome-icon">👋</span>
          <h2>Welcome to Health Tracking, {username}!</h2>
        </div>
        <div className="welcome-modal-body">
          <p className="welcome-main-text">
            We're excited to help you on your health journey!
          </p>
          <div className="welcome-steps">
            <div className="welcome-step">
              <span className="step-icon">📝</span>
              <div className="step-content">
                <h3>Step 1: Complete Your Profile</h3>
                <p>Add your basic information (gender, age, height, weight, and goal) to get personalized nutrition recommendations.</p>
              </div>
            </div>
            <div className="welcome-step">
              <span className="step-icon">🎯</span>
              <div className="step-content">
                <h3>Step 2: Get Your Goals</h3>
                <p>Once your profile is complete, we'll calculate your daily calorie and macronutrient goals based on your information.</p>
              </div>
            </div>
            <div className="welcome-step">
              <span className="step-icon">🍽️</span>
              <div className="step-content">
                <h3>Step 3: Start Tracking</h3>
                <p>Head to the dashboard to log your meals, track your progress, and achieve your health goals!</p>
              </div>
            </div>
          </div>
        </div>
        <div className="welcome-modal-footer">
          <button className="btn-get-started" onClick={onClose}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
