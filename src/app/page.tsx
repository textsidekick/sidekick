'use client';

import React from 'react';
import Link from 'next/link';

// Import DesignCanvas components
const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};

export default function LandingPage() {
  const [showCanvas, setShowCanvas] = React.useState(false);

  // Design canvas markup - simulating artboards
  const DesignPreview = () => (
    <div style={{
      width: '100%',
      maxWidth: 1400,
      margin: '0 auto',
      padding: '60px 0'
    }}>
      {/* Section 1: Onboarding Flow */}
      <div style={{ marginBottom: 120, paddingLeft: 60 }}>
        <h3 style={{
          fontSize: 28,
          fontWeight: 600,
          color: DC.title,
          letterSpacing: -0.4,
          marginBottom: 56,
          margin: '0 0 56px 0'
        }}>Onboarding</h3>
        
        <div style={{
          display: 'flex',
          gap: 48,
          alignItems: 'flex-start',
          width: 'max-content'
        }}>
          {/* Artboard 1: Setup */}
          <div style={{
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              color: DC.label,
              marginBottom: 8
            }}>Setup · Company Details</div>
            <div style={{
              width: 340,
              height: 480,
              background: '#fff',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 24
            }}>
              <h4 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px 0', color: '#2a251f' }}>Welcome to Sidekick</h4>
              <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px 0', lineHeight: 1.6 }}>Tell us about your organization</p>
              <input type="text" placeholder="Company Name" style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: 14,
                marginBottom: 12,
                boxSizing: 'border-box'
              }} />
              <input type="text" placeholder="Industry" style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: 14,
                marginBottom: 12,
                boxSizing: 'border-box'
              }} />
              <textarea placeholder="Description" style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: 14,
                flex: 1,
                fontFamily: 'inherit',
                resize: 'none'
              }} />
              <button style={{
                width: '100%',
                padding: '12px 16px',
                background: '#c96442',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: 16
              }}>Next →</button>
            </div>
          </div>

          {/* Artboard 2: Upload Docs */}
          <div style={{
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              color: DC.label,
              marginBottom: 8
            }}>Documents · Upload Knowledge Base</div>
            <div style={{
              width: 340,
              height: 480,
              background: '#fff',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 24
            }}>
              <h4 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px 0', color: '#2a251f' }}>Upload Documents</h4>
              <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px 0', lineHeight: 1.6 }}>Your knowledge base that Sidekick will search</p>
              <div style={{
                flex: 1,
                border: '2px dashed #ddd',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 16,
                marginBottom: 16
              }}>
                <div>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Drag files here or click to upload</p>
                  <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0 0' }}>PDF, DOC, DOCX</p>
                </div>
              </div>
              <button style={{
                width: '100%',
                padding: '12px 16px',
                background: '#c96442',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 500,
                cursor: 'pointer'
              }}>Continue →</button>
            </div>
          </div>

          {/* Artboard 3: Access Code */}
          <div style={{
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              color: DC.label,
              marginBottom: 8
            }}>Access Code · Worker Registration</div>
            <div style={{
              width: 340,
              height: 480,
              background: '#fff',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 24
            }}>
              <h4 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px 0', color: '#2a251f' }}>Your Access Code</h4>
              <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px 0', lineHeight: 1.6 }}>Share this with workers to join</p>
              <div style={{
                background: '#f5f5f5',
                border: '2px solid #c96442',
                borderRadius: 8,
                padding: 16,
                textAlign: 'center',
                marginBottom: 24
              }}>
                <code style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#c96442',
                  letterSpacing: 4
                }}>7H4D9K</code>
              </div>
              <p style={{ fontSize: 13, color: '#999', margin: '0 0 16px 0', textAlign: 'center' }}>Workers text: <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>JOIN 7H4D9K</code></p>
              <button style={{
                width: '100%',
                padding: '12px 16px',
                background: '#c96442',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: 'auto'
              }}>Done! →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Worker Experience */}
      <div style={{ marginBottom: 120, paddingLeft: 60 }}>
        <h3 style={{
          fontSize: 28,
          fontWeight: 600,
          color: DC.title,
          letterSpacing: -0.4,
          marginBottom: 56,
          margin: '0 0 56px 0'
        }}>Worker Experience</h3>
        
        <div style={{
          display: 'flex',
          gap: 48,
          alignItems: 'flex-start',
          width: 'max-content'
        }}>
          {/* Artboard: SMS Chat */}
          <div style={{
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              color: DC.label,
              marginBottom: 8
            }}>SMS Chat · Asking Questions</div>
            <div style={{
              width: 280,
              height: 520,
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,.12)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '8px solid #333'
            }}>
              {/* Phone header */}
              <div style={{
                background: '#333',
                color: '#fff',
                padding: '8px 16px',
                fontSize: 12,
                textAlign: 'center',
                borderBottom: '1px solid #555'
              }}>9:41 • Signal 📶</div>
              
              {/* Messages */}
              <div style={{
                flex: 1,
                padding: 12,
                overflow: 'auto',
                background: '#fafaf8',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                {/* Bot message */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 8
                }}>
                  <div style={{
                    maxWidth: '75%',
                    background: '#e0e0e0',
                    color: '#333',
                    padding: '8px 12px',
                    borderRadius: '16px 16px 16px 0',
                    fontSize: 13,
                    lineHeight: 1.4
                  }}>Hey! I'm here to help 👋</div>
                </div>

                {/* User message */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 8
                }}>
                  <div style={{
                    maxWidth: '75%',
                    background: '#c96442',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '16px 16px 0 16px',
                    fontSize: 13,
                    lineHeight: 1.4
                  }}>How do I clean the press?</div>
                </div>

                {/* Bot response */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '75%',
                    background: '#e0e0e0',
                    color: '#333',
                    padding: '8px 12px',
                    borderRadius: '16px 16px 16px 0',
                    fontSize: 13,
                    lineHeight: 1.4
                  }}>Per SOP-42: Turn off power, wait 5min, use brush & cloth (no solvents).</div>
                </div>
              </div>

              {/* Input */}
              <div style={{
                padding: 12,
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: 8
              }}>
                <input type="text" placeholder="Type message..." style={{
                  flex: 1,
                  border: '1px solid #ddd',
                  borderRadius: 20,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontFamily: 'inherit'
                }} />
                <button style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#c96442',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 16
                }}>→</button>
              </div>
            </div>
          </div>

          {/* Artboard: Manager Dashboard */}
          <div style={{
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 500,
              color: DC.label,
              marginBottom: 8
            }}>Dashboard · Monitor Workers</div>
            <div style={{
              width: 380,
              height: 520,
              background: '#fff',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 24
            }}>
              <h4 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px 0', color: '#2a251f' }}>Dashboard</h4>
              
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Active Workers</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#c96442' }}>12</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Recent Questions</div>
                <div style={{ 
                  background: '#f5f5f5',
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 12,
                  marginBottom: 8
                }}>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>How to calibrate?</div>
                  <div style={{ fontSize: 11, color: '#999' }}>Marcus • 2m ago</div>
                </div>
                <div style={{ 
                  background: '#f5f5f5',
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 12
                }}>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>PPE requirements?</div>
                  <div style={{ fontSize: 11, color: '#999' }}>Sarah • 5m ago</div>
                </div>
              </div>

              <button style={{
                width: '100%',
                padding: '10px 16px',
                background: '#f5f5f5',
                color: '#2a251f',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: 'auto'
              }}>View All Activity</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: DC.bg,
      fontFamily: DC.font,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 60px',
        borderBottom: `1px solid ${DC.grid}`,
        background: '#fff'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: DC.title, margin: 0 }}>
          Sidekick
        </h1>
        <Link href="/onboarding-chat" style={{
          padding: '10px 24px',
          background: '#c96442',
          color: '#fff',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.background = '#b8543a';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.background = '#c96442';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          Start Now →
        </Link>
      </header>

      {/* Hero */}
      <section style={{
        background: '#fff',
        padding: '80px 60px',
        textAlign: 'center',
        borderBottom: `1px solid ${DC.grid}`
      }}>
        <h2 style={{
          fontSize: 52,
          fontWeight: 700,
          color: DC.title,
          margin: '0 0 24px 0',
          letterSpacing: -1
        }}>
          AI Assistant for Frontline Workers
        </h2>
        <p style={{
          fontSize: 18,
          color: DC.subtitle,
          maxWidth: 600,
          margin: '0 auto 32px',
          lineHeight: 1.6
        }}>
          Get instant answers via SMS or voice memo. In any language. No app downloads needed.
        </p>
        <Link href="/onboarding-chat" style={{
          display: 'inline-block',
          padding: '14px 40px',
          background: '#c96442',
          color: '#fff',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 16,
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.background = '#b8543a';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.background = '#c96442';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          Get Started Free
        </Link>
      </section>

      {/* Design Preview */}
      <section style={{
        padding: '80px 0',
        background: DC.bg,
        position: 'relative'
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <DesignPreview />
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{
        padding: '60px 60px',
        textAlign: 'center',
        background: '#fff',
        borderTop: `1px solid ${DC.grid}`
      }}>
        <h3 style={{
          fontSize: 32,
          fontWeight: 700,
          color: DC.title,
          marginBottom: 16,
          margin: '0 0 16px 0'
        }}>
          Ready to empower your team?
        </h3>
        <Link href="/onboarding-chat" style={{
          display: 'inline-block',
          padding: '14px 40px',
          background: '#c96442',
          color: '#fff',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 16,
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.background = '#b8543a';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.background = '#c96442';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          Start 30-Day Free Trial
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 60px',
        background: '#f5f5f5',
        borderTop: `1px solid ${DC.grid}`,
        textAlign: 'center',
        color: DC.label,
        fontSize: 13
      }}>
        © 2026 Sidekick. AI for frontline workers.
      </footer>
    </div>
  );
}
