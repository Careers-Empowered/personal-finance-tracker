import { activityLogMockData } from "../data/activityLog.mock";
import { groupActivitiesByDate } from "../utils/groupActivitiesByDate";
import ActivityLogItem from "./ActivityLogItem";
import "./ActivityLog.css";

function ActivityLog() {
  const activityGroups = groupActivitiesByDate(activityLogMockData);

  return (
    <section className="activity-log">
      <h2 className="activity-log__title">Activity Log</h2>

      {activityGroups.map((group) => (
        <div className="activity-log__group" key={group.label}>
          <h3 className="activity-log__group-title">
            {group.label}
          </h3>

          <div className="activity-log__list">
            {group.activities.map((activity) => (
              <ActivityLogItem
                key={activity.id}
                activity={activity}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default ActivityLog;