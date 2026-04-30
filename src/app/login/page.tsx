"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (username === "demo" && password === "sidekick") {
      document.cookie = "sidekick_auth=true; path=/; max-age=604800";
      localStorage.setItem("sidekick_auth", JSON.stringify({
        username, role: "manager", loggedIn: true,
      }));
      router.push("/manager");
    } else if (username === "founders" && password === "yc2026") {
      document.cookie = "sidekick_auth=true; path=/; max-age=604800";
      localStorage.setItem("sidekick_auth", JSON.stringify({
        username, role: "founders", loggedIn: true,
      }));
      router.push("/founders");
    } else {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.success) {
          document.cookie = "sidekick_auth=true; path=/; max-age=604800";
          localStorage.setItem("sidekick_auth", JSON.stringify({
            username, role: "manager", companyId: data.companyId, loggedIn: true,
          }));
          router.push("/manager");
        } else {
          setError("Invalid credentials. Please try again.");
          setIsLoading(false);
        }
      } catch {
        setError("Invalid credentials. Please try again.");
        setIsLoading(false);
      }
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    border: "1.5px solid #1C1A16/15",
    borderColor: "rgba(28,26,22,0.15)",
    borderRadius: 12,
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "'Inter', system-ui, sans-serif",
    backgroundColor: "#ffffff",
    color: "#1C1A16",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F7F3EC",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: 20,
    }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif&display=swap');
      `}</style>
      
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#ffffff",
        borderRadius: 20,
        padding: "48px 40px",
        boxShadow: "0 4px 24px -4px rgba(28,26,22,0.08), 0 2px 8px -2px rgba(28,26,22,0.04)",
        border: "1px solid rgba(28,26,22,0.06)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, margin: "0 auto 20px", position: "relative", background: "#C96442", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
            <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={56} height={56} style={{ objectFit: "contain" }} />
          </div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 600,
            color: "#1C1A16",
            marginBottom: 8,
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: "-0.02em",
          }}>Welcome back</h1>
          <p style={{
            color: "rgba(28,26,22,0.5)",
            fontSize: 15,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#1C1A16",
              marginBottom: 8,
              letterSpacing: "0.01em",
            }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#C96442"; e.target.style.boxShadow = "0 0 0 3px rgba(201,100,66,0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(28,26,22,0.15)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#1C1A16",
              marginBottom: 8,
              letterSpacing: "0.01em",
            }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ ...inputStyle, paddingRight: 48 }}
                onFocus={(e) => { e.target.style.borderColor = "#C96442"; e.target.style.boxShadow = "0 0 0 3px rgba(201,100,66,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(28,26,22,0.15)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(28,26,22,0.35)", padding: 4,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: "12px 16px",
              background: "rgba(201,100,66,0.08)",
              border: "1px solid rgba(201,100,66,0.2)",
              borderRadius: 10,
              color: "#A74D30",
              fontSize: 14,
              marginBottom: 20,
              textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              background: isLoading ? "rgba(28,26,22,0.4)" : "#1C1A16",
              color: "#F7F3EC",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'Inter', system-ui, sans-serif",
              cursor: isLoading ? "not-allowed" : "pointer",
              letterSpacing: "-0.01em",
              transition: "opacity 0.2s",
            }}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{
          textAlign: "center",
          marginTop: 24,
          fontSize: 13,
          color: "rgba(28,26,22,0.4)",
        }}>
          Don&apos;t have an account?{" "}
          <a href="https://textsidekick.com/#contact" style={{ color: "#C96442", textDecoration: "none", fontWeight: 500 }}>
            Book a demo
          </a>
        </p>
      </div>
    </div>
  );
}
