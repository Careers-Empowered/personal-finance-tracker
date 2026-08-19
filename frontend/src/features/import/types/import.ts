export type ImportMode = "csv" | "transaction";

export interface FileUploadProps {
  mode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  onFileSelected: (file: File) => void;
  onPreview?: () => void;
}

export interface TransactionDataSummary {
  fileName: string;
  transactionCount: number;
  earliestDate: string;
  latestDate: string;
}

export interface ImportedTransaction {
  date: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  account: string;
  category?: string;
  notes?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidatedTransaction {
  row: number;
  data: ImportedTransaction;
  errors: ValidationError[];
  isValid: boolean;
  excluded: boolean;
  duplicateDecision?: "pending" | "exclude" | "add-anyway";
}

export type DuplicateAction = "exclude" | "add-anyway";

export interface DuplicateDecision {
  row: number;
  action: DuplicateAction;
  note?: string;
}