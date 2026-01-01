"use client";

import Link from "next/link";
import { useState } from "react";

function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8 Q4 4 8 4 L40 4 Q44 4 44 8 L44 32 Q44 36 40 36 L16 36 L8 44 L8 36 Q4 36 4 32 Z" fill="#0ea5e9"/>
      <rect x="20" y="16" width="8" height="3" rx="1.5" fill="white"/>
      <circle cx="15" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="33" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="15" cy="16" r="2.5" fill="#1e293b"/>
      <circle cx="33" cy="16" r="2.5" fill="#1e293b"/>
      <path d="M19 28 Q24 31 29 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// Mock data
const stats = [
  { label: "Questions Answered", value: "1,247", change: "+12%", up: true, icon: "💬" },
  { label: "Avg Response Time", value: "2.3s", change: "-18%", up: true, icon: "⚡" },
  { label: "Documents Processed", value: "34", change: "+3", up: true, icon: "📄" },
  { label: "Active Workers", value: "89", change: "+7", up: true, icon: "👷" },
];

const weeklyData = [
  { day: "Mon", questions: 145 },
  { day: "Tue", questions: 198 },
  { day: "Wed", questions: 167 },
  { day: "Thu", questions: 203 },
  { day: "Fri", questions: 189 },
  { day: "Sat", questions: 78 },
  { day: "Sun", questions: 45 },
];

const topTopics = [
  { topic: "Safety Procedures", count: 342, percent: 27, color: "bg-red-500" },
  { topic: "Break Times & Schedule", count: 256, percent: 21, color: "bg-blue-500" },
  { topic: "Equipment Operation", count: 198, percent: 16, color: "bg-yellow-500" },
  { topic: "HR & Benefits", count: 167, percent: 13, color: "bg-green-500" },
  { topic: "Reporting & Forms", count: 145, percent: 12, color: "bg-purple-500" },
  { topic: "Other", count: 139, percent: 11, color: "bg-gray-400" },
];

const recentQuestions = [
  { question: "What's the procedure for reporting a safety incident?", time: "2 min ago", worker: "Floor A", status: "answered", confidence: 98 },
  { question: "When is the next pay period?", time: "5 min ago", worker: "Warehouse", status: "answered", confidence: 95 },
  { question: "How do I request time off?", time: "12 min ago", worker: "Floor B", status: "answered", confidence: 92 },
  { question: "What PPE is required for the welding station?", time: "18 min ago", worker: "Floor A", status: "answered", confidence: 99 },
  { question: "Who do I contact about a broken forklift?", time: "24 min ago", worker: "Warehouse", status: "answered", confidence: 87 },
  { question: "What's the emergency evacuation route?", time: "31 min ago", worker: "Floor C", status: "answered", confidence: 96 },
];

const trainingGaps = [
  { topic: "Forklift Certification Process", questions: 23, severity: "high", suggestion: "Add forklift certification docs" },
  { topic: "New PTO Policy", questions: 18, severity: "high", suggestion: "Update employee handbook" },
  { topic: "Machine #7 Operation", questions: 12, severity: "medium", suggestion: "Add equipment manual" },
  { topic: "Overtime Rules", questions: 9, severity: "medium", suggestion: "Clarify in HR docs" },
];

const documents = [
  { name: "Employee Handbook 2024", type: "PDF", pages: 47, lastUpdated: "Dec 15, 2024", questions: 234 },
  { name: "Safety Procedures Manual", type: "PDF", pages: 82, lastUpdated: "Dec 20, 2024", questions: 342 },
  { name: "Equipment Operation Guide", type: "PDF", pages: 156, lastUpdated: "Nov 30, 2024", questions: 198 },
  { name: "HR Benefits Summary", type: "DOCX", pages: 23, lastUpdated: "Dec 1, 2024", questions: 167 },
  { name: "Emergency Response Plan", type: "PDF", pages: 34, lastUpdated: "Oct 15, 2024", questions: 89 },
];

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "documents" | "gaps">("overview");
  const maxQuestions = Math.max(...weeklyData.map(d => d.questions));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-gray-900 text-xl font-bold">Sidekick</span>
            <span className="text-gray-400 text-sm ml-2">Manager Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 text-sm">Settings</button>
            <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm font-medium">JD</div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, John</h1>
            <p className="text-gray-600">Here's what's happening with your team today.</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors">
              Export Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: "overview", label: "Overview" },
            { id: "questions", label: "Questions" },
            { id: "documents", label: "Documents" },
            { id: "gaps", label: "Training Gaps" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className={`text-sm font-medium ${stat.up ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Weekly Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Questions This Week</h3>
                <div className="flex items-end justify-between h-48 gap-2">
                  {weeklyData.map((day) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: "160px" }}>
                        <div
                          className="absolute bottom-0 w-full bg-sky-500 rounded-t-lg transition-all hover:bg-sky-600"
                          style={{ height: `${(day.questions / maxQuestions) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Topics */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Topics</h3>
                <div className="space-y-4">
                  {topTopics.map((topic) => (
                    <div key={topic.topic}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{topic.topic}</span>
                        <span className="text-gray-500">{topic.count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${topic.color} rounded-full`} style={{ width: `${topic.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Questions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Questions</h3>
                <button className="text-sky-500 hover:text-sky-600 text-sm font-medium">View All →</button>
              </div>
              <div className="divide-y divide-gray-100">
                {recentQuestions.slice(0, 5).map((q, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{q.question}</p>
                      <p className="text-sm text-gray-500 mt-1">{q.worker} • {q.time}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">{q.confidence}% match</div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "questions" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Questions</h3>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
                />
                <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white">
                  <option>All Topics</option>
                  <option>Safety</option>
                  <option>HR</option>
                  <option>Equipment</option>
                </select>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentQuestions.map((q, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{q.question}</p>
                    <p className="text-sm text-gray-500 mt-1">{q.worker} • {q.time}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{q.confidence}% match</div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
              <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <span>+</span> Upload Document
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pages</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 text-xs font-bold">{doc.type}</span>
                        </div>
                        <span className="font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{doc.type}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.pages}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.lastUpdated}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.questions} answered</td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">•••</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "gaps" && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-semibold text-amber-900">Training Gaps Detected</h3>
                  <p className="text-amber-800 text-sm mt-1">
                    We've identified {trainingGaps.length} topics where workers are asking questions but documentation is missing or incomplete.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Identified Gaps</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {trainingGaps.map((gap, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${gap.severity === "high" ? "bg-red-500" : "bg-yellow-500"}`} />
                        <p className="text-gray-900 font-medium">{gap.topic}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 ml-5">{gap.questions} unanswered questions this week</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        gap.severity === "high" 
                          ? "bg-red-100 text-red-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {gap.severity} priority
                      </span>
                      <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors">
                        {gap.suggestion}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">47 hrs</div>
                  <div className="text-sm text-green-700 mt-1">Supervisor time saved this week</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">$2,350</div>
                  <div className="text-sm text-blue-700 mt-1">Estimated cost savings</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">94%</div>
                  <div className="text-sm text-purple-700 mt-1">Questions answered instantly</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
