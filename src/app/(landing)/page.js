"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(JSON.parse(saved));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", JSON.stringify(!darkMode));
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: darkMode 
        ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" 
        : "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
      color: darkMode ? "#f1f5f9" : "#1e293b",
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      padding: "2rem",
      transition: "all 0.3s ease"
    }}>
      <button 
        onClick={toggleDarkMode}
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          padding: "0.75rem",
          borderRadius: "12px",
          border: "none",
          background: darkMode ? "#334155" : "#ffffff",
          color: darkMode ? "#fbbf24" : "#64748b",
          cursor: "pointer",
          boxShadow: darkMode 
            ? "0 2px 8px rgba(0,0,0,0.3)" 
            : "0 2px 8px rgba(0,0,0,0.08)",
          fontSize: "1.25rem",
          transition: "all 0.3s ease"
        }}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <img 
        src="/images/logo/newsidekicklogo.png" 
        alt="Sidekick" 
        style={{ 
          width: "80px", 
          marginBottom: "1.5rem",
          filter: darkMode ? "brightness(1.1)" : "none"
        }}
      />
      <h1 style={{ 
        fontSize: "2.5rem", 
        fontWeight: "bold", 
        marginBottom: "0.5rem",
        textAlign: "center",
        color: darkMode ? "#f1f5f9" : "#1e293b"
      }}>
        Sidekick Demo
      </h1>
      <p style={{ 
        fontSize: "1.2rem", 
        color: darkMode ? "#94a3b8" : "#64748b", 
        marginBottom: "3rem",
        textAlign: "center"
      }}>
        AI SMS Assistant for Frontline Workers
      </p>
      
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        maxWidth: "300px"
      }}>
        <Link href="/manager" style={{
          padding: "1rem 2rem",
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          color: "white",
          borderRadius: "12px",
          textDecoration: "none",
          textAlign: "center",
          fontSize: "1rem",
          fontWeight: "600",
          boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
        }}>
          Manager Dashboard
        </Link>
        <Link href="/onboarding" style={{
          padding: "1rem 2rem",
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          color: "white",
          borderRadius: "12px",
          textDecoration: "none",
          textAlign: "center",
          fontSize: "1rem",
          fontWeight: "600",
          boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
        }}>
          Onboarding Portal
        </Link>
        <Link href="https://textsidekick.com" style={{
          padding: "1rem 2rem",
          backgroundColor: darkMode ? "#334155" : "#ffffff",
          color: darkMode ? "#e2e8f0" : "#374151",
          borderRadius: "12px",
          textDecoration: "none",
          textAlign: "center",
          fontSize: "1rem",
          fontWeight: "500",
          border: darkMode ? "2px solid #475569" : "2px solid #e5e7eb",
          boxShadow: darkMode 
            ? "0 2px 8px rgba(0,0,0,0.2)" 
            : "0 2px 8px rgba(0,0,0,0.04)",
          transition: "all 0.3s ease"
        }}>
          ← Main Website
        </Link>
      </div>
      <p style={{ 
        marginTop: "3rem", 
        fontSize: "0.875rem", 
        color: darkMode ? "#64748b" : "#94a3b8" 
      }}>
        © 2026 Sidekick
      </p>
    </div>
  );
}
