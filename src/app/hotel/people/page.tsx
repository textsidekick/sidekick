"use client";

import { HotelPageHeader, HotelSourcePill, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";
import { teamRoutingRules } from "@/lib/hotel-demo-view";

const teamMeta: Record<string, { role: string; department: string; preferredLanguage: string; status: string; currentTasks: string; lastResponse: string; notificationMethod: string; permissions: string }> = {
  Maya: { role: "Manager on duty", department: "Management", preferredLanguage: "English", status: "On shift", currentTasks: "Room 204 manager review · Room 218 escalation", lastResponse: "2 minutes ago", notificationMethod: "SMS + dashboard", permissions: "Manager" },
  Elena: { role: "Lead housekeeper", department: "Housekeeping", preferredLanguage: "English / Spanish", status: "On shift", currentTasks: "Room 118 towels · Room 304 complete · Room 204 photo", lastResponse: "5 minutes ago", notificationMethod: "SMS", permissions: "Staff" },
  Maria: { role: "Room attendant", department: "Housekeeping", preferredLanguage: "Spanish", status: "Unknown", currentTasks: "Room 111 checkout-style cleaning", lastResponse: "18 minutes ago", notificationMethod: "SMS", permissions: "Staff" },
  Julio: { role: "Maintenance technician", department: "Maintenance", preferredLanguage: "Spanish", status: "On shift", currentTasks: "Room 218 water issue · Ice machine offline", lastResponse: "4 minutes ago", notificationMethod: "Voice note + SMS", permissions: "Staff" },
  Nadia: { role: "Front desk", department: "Front desk", preferredLanguage: "English", status: "Off shift", currentTasks: "No active tasks", lastResponse: "1 hour ago", notificationMethod: "SMS", permissions: "Desk" },
};

const groups = ["Management", "Front desk", "Housekeeping", "Maintenance"];

export default function HotelPeoplePage() {
  const { state, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Team"
          title="The routing model behind the hotel"
          body="Sidekick should know who owns what, how to route requests by department, who is likely on shift, and how each person prefers to be notified."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
          <section className="space-y-6">
            {groups.map((group) => (
              <div key={group} className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">{group}</div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {state.staff.filter((person) => (teamMeta[person.name]?.department || person.team) === group).map((person) => {
                    const meta = teamMeta[person.name];
                    return (
                      <div key={person.phone} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#18222C]">{person.name}</div>
                            <div className="mt-1 text-sm text-[#5C6975]">{meta?.role || person.team}</div>
                          </div>
                          <HotelStatusPill tone={meta?.status === "On shift" ? "resolved" : meta?.status === "Unknown" ? "queued" : "normal"}>{meta?.status || "Unknown"}</HotelStatusPill>
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-[#5C6975]">
                          <div>Department: {meta?.department || person.team}</div>
                          <div>Phone: {person.phone}</div>
                          <div>Preferred language: {meta?.preferredLanguage || "English"}</div>
                          <div>Current tasks: {meta?.currentTasks || "No active tasks"}</div>
                          <div>Last response: {meta?.lastResponse || "Unknown"}</div>
                          <div>Notification method: {meta?.notificationMethod || "SMS"}</div>
                          <div>Permissions: {meta?.permissions || "Staff"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Routing rules</div>
            <div className="mt-4 space-y-2">
              {teamRoutingRules.map((rule) => (
                <div key={rule} className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3 text-sm text-[#18222C]">{rule}</div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <HotelSourcePill>Rules should become configurable in Settings</HotelSourcePill>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
