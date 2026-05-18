"use client";
import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";

interface QRPosterProps {
  companyName: string;
  accessCode: string;
  twilioNumber: string;
}

export default function QRPoster({ companyName, accessCode, twilioNumber }: QRPosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const smsLink = `sms:${twilioNumber.replace(/[^0-9]/g, "")}?body=JOIN ${accessCode}`;

  const handlePrint = () => {
    const content = posterRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Sidekick QR Poster - ${companyName}</title>
      <style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:Inter,system-ui,sans-serif;}
      @media print{body{margin:0;}}</style></head>
      <body>${content.innerHTML}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div>
      <div ref={posterRef} style={{
        background: "white", padding: 40, borderRadius: 16,
        border: "2px solid rgba(28,26,22,0.1)", textAlign: "center", maxWidth: 400, margin: "0 auto",
      }}>
        <div style={{ width: 40, height: 40, background: "#C96442", borderRadius: 10, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>S</span>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1C1A16", margin: "0 0 4px" }}>Got a question?</h2>
        <p style={{ fontSize: 15, color: "rgba(28,26,22,0.6)", margin: "0 0 24px" }}>Text Sidekick for instant answers!</p>
        
        <div style={{ background: "#F7F3EC", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <QRCodeSVG value={smsLink} size={180} level="M" style={{ margin: "0 auto" }} />
        </div>
        
        <p style={{ fontSize: 13, color: "rgba(28,26,22,0.5)", margin: "0 0 8px" }}>Scan the QR code or text:</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: "#C96442", fontFamily: "monospace", letterSpacing: 3, margin: "0 0 8px" }}>JOIN {accessCode}</p>
        <p style={{ fontSize: 15, color: "#1C1A16", margin: "0 0 20px" }}>to {twilioNumber}</p>
        
        <div style={{ borderTop: "1px solid rgba(28,26,22,0.08)", paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: "rgba(28,26,22,0.35)", margin: 0 }}>Powered by Sidekick | textsidekick.com</p>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
        <button onClick={handlePrint} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
          background: "#1C1A16", color: "white", borderRadius: 8, border: "none",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          <Printer size={16} /> Print Poster
        </button>
      </div>
    </div>
  );
}
