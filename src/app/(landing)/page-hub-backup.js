import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0a0a0a",
      color: "white",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "2rem"
    }}>
      <img 
        src="/images/logo/sidekick-logo-white.png" 
        alt="Sidekick" 
        style={{ width: "80px", marginBottom: "1.5rem" }}
      />
      <h1 style={{ 
        fontSize: "2.5rem", 
        fontWeight: "bold", 
        marginBottom: "0.5rem",
        textAlign: "center"
      }}>
        Sidekick
      </h1>
      <p style={{ 
        fontSize: "1.2rem", 
        color: "#888", 
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
        <Link href="https://textsidekick.com" style={{
          padding: "1rem 2rem",
          backgroundColor: "#333",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          textAlign: "center",
          fontSize: "1rem"
        }}>
          ← Main Website
        </Link>
        <Link href="/manager" style={{
          padding: "1rem 2rem",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          textAlign: "center",
          fontSize: "1rem"
        }}>
          Manager Dashboard
        </Link>
        <Link href="/onboarding" style={{
          padding: "1rem 2rem",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          textAlign: "center",
          fontSize: "1rem"
        }}>
          Onboarding Portal
        </Link>
        <Link href="/qa" style={{
          padding: "1rem 2rem",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          textAlign: "center",
          fontSize: "1rem"
        }}>
          Q&A Demo
        </Link>
      </div>

      <p style={{ 
        marginTop: "3rem", 
        fontSize: "0.875rem", 
        color: "#666" 
      }}>
        © 2026 Sidekick
      </p>
    </div>
  );
}
