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

    // Check hardcoded admin credentials first
    if (username === "demo" && password === "sidekick") {
      document.cookie = "sidekick_auth=true; path=/; max-age=604800";
      localStorage.setItem("sidekick_auth", JSON.stringify({
        username: username,
        role: "manager",
        loggedIn: true,
      }));
      router.push("/manager");
    } else if (username === "founders" && password === "yc2026") {
      document.cookie = "sidekick_auth=true; path=/; max-age=604800";
      localStorage.setItem("sidekick_auth", JSON.stringify({
        username: username,
        role: "founders",
        loggedIn: true,
      }));
      router.push("/founders");
    } else {
      // Try database auth for company managers
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
            username: username,
            role: "manager",
            companyId: data.companyId,
            loggedIn: true,
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

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: 20,
    }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>
      
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#ffffff",
        borderRadius: 24,
        padding: "48px 40px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 80, height: 80, margin: "0 auto 24px", position: "relative" }}>
            <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={80} height={80} style={{ objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Welcome to Sidekick</h1>
          <p style={{ color: "#64748b", fontSize: 15 }}>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={{ width: "100%", padding: "14px 16px", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffffe", color: "#1e293b" }}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.backgroundColor = "#fffffe"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#fffffe"; }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: "100%", padding: "14px 48px 14px 16px", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffffe", color: "#1e293b" }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.backgroundColor = "#fffffe"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#fffffe"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 14, marginBottom: 20, textAlign: "center" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              background: isLoading ? "#94a3b8" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: isLoading ? "none" : "0 4px 14px rgba(59, 130, 246, 0.4)",
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
