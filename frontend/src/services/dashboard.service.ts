import type { DashboardData } from "../types/dashboard";

const API_BASE_URL = "http://localhost:3000";

export interface DashboardQuery {
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export const getDashboard = async (
  query: DashboardQuery,
): Promise<DashboardData> => {
  const params = new URLSearchParams();

  if (query.accountId && query.accountId !== "all") {
    params.set("accountId", query.accountId);
  }

  if (query.startDate) {
    params.set("startDate", query.startDate);
  }

  if (query.endDate) {
    params.set("endDate", query.endDate);
  }

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load dashboard");
  }

  return response.json();
};