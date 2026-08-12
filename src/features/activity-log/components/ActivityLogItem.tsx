import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CalendarCheck,
  CreditCard,
  Target,
  Wallet,
} from "lucide-react";

import type {
  ActivityLogItem as ActivityLogItemType,
} from "../types/activityLog.types";

import "./ActivityLog.css";

interface Props {
  activity: ActivityLogItemType;
}

function getActivityIcon(
  entity: ActivityLogItemType["entity"],
) {
  switch (entity) {
    case "transaction":
      return <CreditCard size={20} />;

    case "account":
      return <Wallet size={20} />;

    case "budget":
      return <Banknote size={20} />;

    case "goal":
      return <Target size={20} />;

    case "loan":
      return <ArrowDownLeft size={20} />;

    case "subscription":
      return <CalendarCheck size={20} />;

    default:
      return <ArrowUpRight size={20} />;
  }
}

function ActivityLogItem({ activity }: Props) {
  return (
    <article className="activity-log__item">
      <div className="activity-log__icon">
        {getActivityIcon(activity.entity)}
      </div>

      <div className="activity-log__content">
        <h3 className="activity-log__item-title">
          {activity.title}
        </h3>

        <p className="activity-log__description">
          {activity.description}
        </p>

        <small className="activity-log__timestamp">
          {new Date(activity.timestamp).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </small>
      </div>

      {activity.amount !== undefined && (
        <strong className="activity-log__amount">
          ₹{activity.amount.toLocaleString("en-IN")}
        </strong>
      )}
    </article>
  );
}

export default ActivityLogItem;