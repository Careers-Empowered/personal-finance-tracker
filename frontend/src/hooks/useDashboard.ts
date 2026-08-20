import { useEffect, useState } from "react";
import type { DashboardData } from "../types/dashboard";
import {
  getDashboard,
  type DashboardQuery,
} from "../services/dashboard.service";

const EMPTY_DATE_RANGE = {
  startDate: "",
  endDate: "",
};

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  const [selectedAccountId, setSelectedAccountId] =
    useState("all");

  const [isDatePickerOpen, setIsDatePickerOpen] =
    useState(false);

  const [draftRange, setDraftRange] =
    useState(EMPTY_DATE_RANGE);

  const [appliedRange, setAppliedRange] =
    useState<typeof EMPTY_DATE_RANGE | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const query: DashboardQuery = {};

        if (selectedAccountId !== "all") {
          query.accountId = selectedAccountId;
        }

        if (appliedRange) {
          query.startDate = appliedRange.startDate;
          query.endDate = appliedRange.endDate;
        }

        const result = await getDashboard(query);

        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [selectedAccountId, appliedRange]);

  const applyDateRange = () => {
    if (
      !draftRange.startDate ||
      !draftRange.endDate ||
      draftRange.startDate > draftRange.endDate
    ) {
      return;
    }

    setAppliedRange(draftRange);
    setIsDatePickerOpen(false);
  };

  const clearDateRange = () => {
    setAppliedRange(null);
    setDraftRange(EMPTY_DATE_RANGE);
    setIsDatePickerOpen(false);
  };

  return {
    data,
    selectedAccountId,
    setSelectedAccountId,
    isDatePickerOpen,
    toggleDatePicker: () =>
      setIsDatePickerOpen((value) => !value),
    draftRange,
    setDraftRange,
    appliedRange,
    applyDateRange,
    clearDateRange,
    loading,
    error,
  };
};