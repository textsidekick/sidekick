export type DashboardScope = {
  companyId: string;
  locationId: string;
};

export function readDashboardScope(): DashboardScope {
  if (typeof window === "undefined") {
    return { companyId: "", locationId: "all" };
  }

  try {
    const auth = JSON.parse(window.localStorage.getItem("sidekick_auth") || "{}");
    return {
      companyId: auth.companyId || "",
      locationId: auth.locationId || "all",
    };
  } catch {
    return { companyId: "", locationId: "all" };
  }
}

export function buildScopedUrl(path: string, scope: DashboardScope, extra?: Record<string, string | null | undefined>) {
  const params = new URLSearchParams();
  if (scope.companyId) params.set("companyId", scope.companyId);
  if (scope.locationId && scope.locationId !== "all") params.set("locationId", scope.locationId);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
