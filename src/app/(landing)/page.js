import Link from "next/link";
export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
      color: "#1e293b",
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      padding: "2rem"
    }}>
      <img 
        src="/images/logo/newsidekicklogo.png" 
        alt="Sidekick" 
        style={{ width: "80px", marginBottom: "1.5rem" }}
      />
      <h1 style={{ 
        fontSize: "2.5rem", 
        fontWeight: "bold", 
        marginBottom: "0.5rem",
        textAlign: "center",
        color: "#1e293b"
      }}>
        Sidekick Demo
      </h1>
      <p style={{ 
        fontSize: "1.2rem", 
        color: "#64748b", 
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
        <Link href="/qa" style={{
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
          Q&A Demo
        </Link>
        <Link href="https://textsidekick.com" style={{
          padding: "1rem 2rem",
          backgroundColor: "#ffffff",
          color: "#374151",
          borderRadius: "12px",
          textDecoration: "none",
          textAlign: "center",
          fontSize: "1rem",
          fontWeight: "500",
          border: "2px solid #e5e7eb",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          ← Main Website
        </Link>
      </div>
      <p style={{ 
        marginTop: "3rem", 
        fontSize: "0.875rem", 
        color: "#94a3b8" 
      }}>
        © 2026 Sidekick
      </p>
    </div>
  );
}
