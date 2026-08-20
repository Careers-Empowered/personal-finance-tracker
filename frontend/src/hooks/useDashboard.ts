import { useMemo, useState } from "react";
import type { DashboardData } from "../types/dashboard";
import {
  createDashboardView,
  isValidDateRange,
  type DateRange,
} from "../utils/dashboardSelectors";

const EMPTY_DATE_RANGE: DateRange = { startDate: "", endDate: "" };

export const useDashboard = (data: DashboardData) => {
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange>(EMPTY_DATE_RANGE);
  const [appliedRange, setAppliedRange] = useState<DateRange | null>(null);

  const view = useMemo(
    () => createDashboardView(data, selectedAccountId, appliedRange),
    [data, selectedAccountId, appliedRange],
  );
  const isPeriodView = appliedRange !== null;

  const applyDateRange = () => {
    if (!isValidDateRange(draftRange)) return;
    setAppliedRange(draftRange);
    setIsDatePickerOpen(false);
  };

  const clearDateRange = () => {
    setAppliedRange(null);
    setDraftRange(EMPTY_DATE_RANGE);
    setIsDatePickerOpen(false);
  };

  return {
    view,
    selectedAccountId,
    setSelectedAccountId,
    isDatePickerOpen,
    toggleDatePicker: () => setIsDatePickerOpen((isOpen) => !isOpen),
    draftRange,
    setDraftRange,
    appliedRange,
    isPeriodView,
    applyDateRange,
    clearDateRange,
  };
};
