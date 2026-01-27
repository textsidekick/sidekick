"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw, Unlink, Users, Download } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
}

interface QuickBooksIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onEmployeesImported?: (count: number) => void;
}

export default function QuickBooksIntegration({ companyId, darkMode = false, onEmployeesImported }: QuickBooksIntegrationProps) {
  const [connected, setConnected] = useState(false);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showEmployees, setShowEmployees] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { checkConnection(); }, [companyId]);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/quickbooks?companyId=${companyId}&action=status`);
      const data = await res.json();
      setConnected(data.connected);
      setCompanyName(data.companyName);
    } catch (error) { console.error("Failed to check QuickBooks connection:", error); }
    setLoading(false);
  };

  const connectQuickBooks = () => { window.location.href = `/api/auth/quickbooks?companyId=${companyId}`; };

  const disconnectQuickBooks = async () => {
    try {
      await fetch(`/api/integrations/quickbooks?companyId=${companyId}`, { method: "DELETE" });
      setConnected(false);
      setCompanyName(null);
      setEmployees([]);
      setShowEmployees(false);
    } catch (error) { console.error("Failed to disconnect:", error); }
  };

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch(`/api/integrations/quickbooks?companyId=${companyId}&action=employees`);
      const data = await res.json();
      if (data.employees) { setEmployees(data.employees); setShowEmployees(true); }
    } catch (error) { console.error("Failed to load employees:", error); }
    setLoadingEmployees(false);
  };

  const syncEmployees = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/integrations/quickbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, employees }),
      });
      const data = await res.json();
      if (data.ok) {
        onEmployeesImported?.(data.imported);
        alert(`Imported ${data.imported} employees to Sidekick`);
      }
    } catch (error) { console.error("Failed to sync employees:", error); }
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
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? "bg-green-100" : darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
              <svg className={`w-6 h-6 ${connected ? "text-green-600" : darkMode ? "text-gray-400" : "text-gray-500"}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>QuickBooks</h4>
              {connected ? (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Connected to {companyName}</p>
              ) : (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sync employees from QuickBooks</p>
              )}
            </div>
          </div>
          {connected ? (
            <div className="flex items-center gap-2">
              <button onClick={loadEmployees} disabled={loadingEmployees} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                {loadingEmployees ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                View Employees
              </button>
              <button onClick={disconnectQuickBooks} className={`p-2 rounded-lg ${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} title="Disconnect">
                <Unlink className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={connectQuickBooks} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              <Users className="w-4 h-4" />
              Connect QuickBooks
            </button>
          )}
        </div>
      </div>

      {showEmployees && (
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg border`}>
          <div className={`px-4 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-100"} flex items-center justify-between`}>
            <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>QuickBooks Employees ({employees.length})</h4>
            <button onClick={syncEmployees} disabled={syncing || employees.length === 0} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Sync to Sidekick
            </button>
          </div>
          <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"} max-h-60 overflow-y-auto`}>
            {employees.length === 0 ? (
              <div className={`p-8 text-center ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No employees found in QuickBooks</p>
              </div>
            ) : employees.map((emp) => (
              <div key={emp.id} className={`p-3 flex items-center justify-between ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                <div>
                  <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{emp.name}</p>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{emp.phone || emp.email || "No contact info"}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${emp.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {emp.active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
