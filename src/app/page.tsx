'use client';

import React from 'react';
import { DesignCanvas, DCSection, DCArtboard, DCPostIt } from '@/components/DesignCanvas';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <DesignCanvas>
      <DCSection id="onboarding" title="Onboarding" subtitle="Get started in 3 steps">
        <DCArtboard id="a" label="Setup · Company" width={340} height={480}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 24,
            background: '#fff'
          }}>
            <h4 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px 0', color: '#2a251f' }}>
              Welcome to Sidekick
            </h4>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Tell us about your organization
            </p>
            <input type="text" placeholder="Company Name" style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 10,
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }} />
            <input type="text" placeholder="Industry" style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 10,
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }} />
            <textarea placeholder="Brief description" style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 13,
              flex: 1,
              fontFamily: 'inherit',
              resize: 'none',
              marginBottom: 12,
              boxSizing: 'border-box'
            }} />
            <button style={{
              width: '100%',
              padding: '10px 16px',
              background: '#c96442',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 13
            }}>Next →</button>
          </div>
        </DCArtboard>

        <DCArtboard id="b" label="Upload · Documents" width={340} height={480}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 24,
            background: '#fff'
          }}>
            <h4 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px 0', color: '#2a251f' }}>
              Upload Documents
            </h4>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Your knowledge base that Sidekick will search
            </p>
            <div style={{
              flex: 1,
              border: '2px dashed #ddd',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 16,
              marginBottom: 12
            }}>
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px 0' }}>Drag files here</p>
                <p style={{ fontSize: 11, color: '#999', margin: 0 }}>PDF, DOC, DOCX</p>
              </div>
            </div>
            <button style={{
              width: '100%',
              padding: '10px 16px',
              background: '#c96442',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 13
            }}>Continue →</button>
          </div>
        </DCArtboard>

        <DCArtboard id="c" label="Code · Worker Access" width={340} height={480}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 24,
            background: '#fff'
          }}>
            <h4 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px 0', color: '#2a251f' }}>
              Your Access Code
            </h4>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Share this with workers to join
            </p>
            <div style={{
              background: '#f5f5f5',
              border: '2px solid #c96442',
              borderRadius: 8,
              padding: 20,
              textAlign: 'center',
              marginBottom: 20,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <code style={{
                fontSize: 40,
                fontWeight: 700,
                color: '#c96442',
                letterSpacing: 2
              }}>7H4D9K</code>
            </div>
            <p style={{ fontSize: 12, color: '#999', margin: '0 0 12px 0', textAlign: 'center' }}>
              Workers text: <code style={{ background: '#f0eee9', padding: '2px 6px', borderRadius: 3, fontSize: 11 }}>JOIN 7H4D9K</code>
            </p>
            <button style={{
              width: '100%',
              padding: '10px 16px',
              background: '#c96442',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 13
            }}>Done! →</button>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection id="worker" title="Worker Experience" subtitle="How workers get answers">
        <DCArtboard id="sms" label="SMS Chat · Ask Questions" width={280} height={520}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#fafaf8',
            overflow: 'hidden'
          }}>
            {/* Phone header */}
            <div style={{
              background: '#333',
              color: '#fff',
              padding: '8px 12px',
              fontSize: 11,
              textAlign: 'center',
              borderBottom: '1px solid #555'
            }}>9:41 • Signal 📶</div>
            
            {/* Messages */}
            <div style={{
              flex: 1,
              padding: 12,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
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
                }}>Hey! I'm Sidekick 👋</div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end'
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
                }}>Per SOP-42: Turn off, wait 5min, use brush & cloth.</div>
              </div>
            </div>

            {/* Input */}
            <div style={{
              padding: 10,
              borderTop: '1px solid #ddd',
              display: 'flex',
              gap: 8
            }}>
              <input type="text" placeholder="Type..." style={{
                flex: 1,
                border: '1px solid #ccc',
                borderRadius: 16,
                padding: '6px 10px',
                fontSize: 12,
                fontFamily: 'inherit'
              }} />
              <button style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#c96442',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14
              }}>→</button>
            </div>
          </div>
        </DCArtboard>

        <DCArtboard id="dashboard" label="Dashboard · Monitor" width={340} height={520}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 20,
            background: '#fff'
          }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px 0', color: '#2a251f' }}>
              Dashboard
            </h4>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Active Workers</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#c96442' }}>12</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 8, fontWeight: 500 }}>
                Recent Questions
              </div>
              <div style={{ 
                background: '#f5f5f5',
                borderRadius: 6,
                padding: 12,
                fontSize: 12,
                marginBottom: 8
              }}>
                <div style={{ fontWeight: 500, marginBottom: 2, color: '#2a251f' }}>How to calibrate?</div>
                <div style={{ fontSize: 11, color: '#999' }}>Marcus • 2m ago</div>
              </div>
              <div style={{ 
                background: '#f5f5f5',
                borderRadius: 6,
                padding: 12,
                fontSize: 12
              }}>
                <div style={{ fontWeight: 500, marginBottom: 2, color: '#2a251f' }}>PPE requirements?</div>
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
              fontSize: 13,
              marginTop: 'auto'
            }}>View All</button>
          </div>
        </DCArtboard>
      </DCSection>

      <DCPostIt top={240} left={140} width={200}>
        Real-time AI answers from your docs
      </DCPostIt>

      <DCPostIt top={600} right={160} width={180} rotate={3}>
        No app downloads—just SMS
      </DCPostIt>

      {/* CTA overlay at bottom */}
      <div style={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50
      }}>
        <Link href="/onboarding-chat" style={{
          display: 'inline-block',
          padding: '12px 32px',
          background: '#c96442',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 14,
          boxShadow: '0 8px 24px rgba(201, 100, 66, 0.3)',
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.background = '#b8543a';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.background = '#c96442';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          Get Started Free →
        </Link>
      </div>
    </DesignCanvas>
  );
}
