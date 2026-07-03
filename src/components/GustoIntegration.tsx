"use client";
import React, { useState, useEffect } from "react";
import { Users, RefreshCw, Download, Unlink, Check } from "lucide-react";

interface GustoEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  startDate: string;
}

interface GustoIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onEmployeesImported?: (count: number) => void;
}

export default function GustoIntegration({ companyId, darkMode = false, onEmployeesImported }: GustoIntegrationProps) {
  const [connected, setConnected] = useState(false);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<GustoEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => { checkConnection(); }, [companyId]);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/gusto?companyId=${companyId}&action=status`);
      const data = await res.json();
      setConnected(data.connected);
      setCompanyName(data.companyName);
    } catch (error) { console.error("Failed to check Gusto connection:", error); }
    setLoading(false);
  };

  const connectGusto = () => { window.location.href = `/api/auth/gusto?companyId=${companyId}`; };

  const disconnectGusto = async () => {
    try {
      await fetch(`/api/integrations/gusto?companyId=${companyId}`, { method: "DELETE" });
      setConnected(false);
      setCompanyName(null);
      setEmployees([]);
    } catch (error) { console.error("Failed to disconnect:", error); }
  };

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch(`/api/integrations/gusto?companyId=${companyId}&action=employees`);
      const data = await res.json();
      if (data.employees) { setEmployees(data.employees); }
    } catch (error) { console.error("Failed to load employees:", error); }
    setLoadingEmployees(false);
  };

  const syncEmployees = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/integrations/gusto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, employees }),
      });
      const data = await res.json();
      if (data.ok) {
        setSyncResult(`Successfully imported ${data.imported} employees`);
        onEmployeesImported?.(data.imported);
      } else {
        setSyncResult(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to sync employees:", error);
      setSyncResult("Failed to sync employees");
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4 flex items-center gap-3`}>
        <RefreshCw className={`w-5 h-5 animate-spin ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
        <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Checking connection...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"} rounded-lg border p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? "bg-blue-100" : darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
              <svg className={`w-6 h-6 ${connected ? "text-orange-600" : darkMode ? "text-gray-400" : "text-gray-500"}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Gusto</h4>
              {connected ? (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Connected to {companyName}</p>
              ) : (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sync employees from Gusto payroll</p>
              )}
            </div>
          </div>
          {connected ? (
            <div className="flex items-center gap-2">
              <button onClick={loadEmployees} disabled={loadingEmployees} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50">
                {loadingEmployees ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                View Employees
              </button>
              <button onClick={disconnectGusto} className={`p-2 rounded-lg ${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} title="Disconnect">
                <Unlink className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={connectGusto} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">
              <Users className="w-4 h-4" />
              Connect Gusto
            </button>
          )}
        </div>
      </div>

      {employees.length > 0 && (
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg border`}>
          <div className={`px-4 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-100"} flex items-center justify-between`}>
            <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Employees ({employees.length})</h4>
            <button onClick={syncEmployees} disabled={syncing} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
              {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Sync to Sidekick
            </button>
          </div>
          {syncResult && (
            <div className={`px-4 py-2 ${syncResult.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {syncResult}
            </div>
          )}
          <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"} max-h-60 overflow-y-auto`}>
            {employees.map((emp) => (
              <div key={emp.id} className={`p-4 flex items-center justify-between ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                <div>
                  <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{emp.firstName} {emp.lastName}</p>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {emp.jobTitle || "Employee"} • {emp.department || "General"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{emp.phone || "No phone"}</p>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{emp.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
