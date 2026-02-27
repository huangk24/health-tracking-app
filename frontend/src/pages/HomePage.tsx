import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated background circles */}
      <div style={{
        position: "absolute",
        top: "-20%",
        right: "-10%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-20%",
        left: "-10%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite reverse"
      }} />

      <div style={{
        maxWidth: "800px",
        textAlign: "center",
        color: "white",
        zIndex: 1,
        position: "relative"
      }}>
        <div style={{
          fontSize: "72px",
          marginBottom: "20px",
          animation: "bounce 2s ease-in-out infinite"
        }}>
          🏥💪🥗
        </div>
        
        <h1 style={{
          fontSize: "56px",
          fontWeight: "800",
          margin: "0 0 20px 0",
          textShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          letterSpacing: "-0.02em"
        }}>
          Health Tracking App
        </h1>
        
        <p style={{
          fontSize: "24px",
          margin: "0 0 48px 0",
          opacity: 0.95,
          fontWeight: "500",
          lineHeight: "1.6"
        }}>
          Track your nutrition, monitor your progress, and achieve your health goals
        </p>

        <div style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <Link
            to="/login"
            style={{
              padding: "16px 40px",
              background: "white",
              color: "#667eea",
              borderRadius: "50px",
              fontSize: "18px",
              fontWeight: "700",
              textDecoration: "none",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
              transition: "all 0.3s ease",
              display: "inline-block"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.3)";
            }}
          >
            Sign In →
          </Link>

          <Link
            to="/register"
            style={{
              padding: "16px 40px",
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "2px solid white",
              borderRadius: "50px",
              fontSize: "18px",
              fontWeight: "700",
              textDecoration: "none",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              display: "inline-block",
              backdropFilter: "blur(10px)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Get Started
          </Link>
        </div>

        <div style={{
          marginTop: "60px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
          padding: "0 20px"
        }}>
          {[
            { icon: "📊", title: "Track Nutrition", desc: "Log meals & monitor macros" },
            { icon: "🎯", title: "Set Goals", desc: "Customize your targets" },
            { icon: "📈", title: "See Progress", desc: "Visualize your journey" },
            { icon: "💪", title: "Stay Motivated", desc: "Achieve your goals" }
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                padding: "24px",
                borderRadius: "20px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
                e.currentTarget.style.transform = "translateY(-8px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                {feature.icon}
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700" }}>
                {feature.title}
              </h3>
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
