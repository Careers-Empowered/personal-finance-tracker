import type { ActivityLogItem } from "../types/activityLog.types";

export interface ActivityGroup {
  label: string;
  activities: ActivityLogItem[];
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function groupActivitiesByDate(
  activities: ActivityLogItem[],
): ActivityGroup[] {
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const groups = new Map<string, ActivityLogItem[]>();

  activities.forEach((activity) => {
    const activityDate = new Date(activity.timestamp);

    let label: string;

    if (isSameDay(activityDate, today)) {
      label = "Today";
    } else if (isSameDay(activityDate, yesterday)) {
      label = "Yesterday";
    } else {
      label = activityDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    const existingActivities = groups.get(label) ?? [];

    groups.set(label, [...existingActivities, activity]);
  });

  return Array.from(groups.entries()).map(([label, activities]) => ({
    label,
    activities,
  }));
}