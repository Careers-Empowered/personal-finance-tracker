export type ActivityEntity =
  | "transaction"
  | "account"
  | "budget"
  | "goal"
  | "loan"
  | "subscription"
  | "system";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "paid"
  | "completed"
  | "added";

export interface ActivityLogItem {
  id: string;

  // What feature/entity caused this activity
  entity: ActivityEntity;

  // What happened
  action: ActivityAction;

  // Information shown to the user
  title: string;
  description: string;

  // When it happened
  timestamp: string;

  // User who performed the action
  userId: string;

  // ID of the affected record
  entityId?: string;

  // Optional financial value
  amount?: number;
}