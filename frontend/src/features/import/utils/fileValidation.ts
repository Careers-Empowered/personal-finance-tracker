export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const FILE_UPLOAD_RULES = {
  allowedExtensions: [".csv"],
  maxFileSizeInBytes: 10 * 1024 * 1024,
};

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

export function validateFile(file: File): FileValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: "Please select a file.",
    };
  }

  const extension = getFileExtension(file.name);

  if (!FILE_UPLOAD_RULES.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: "Unsupported file type. Please upload a CSV file.",
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: "The selected file is empty.",
    };
  }

  if (file.size > FILE_UPLOAD_RULES.maxFileSizeInBytes) {
    return {
      isValid: false,
      error: "File size exceeds the 10 MB limit.",
    };
  }

  return {
    isValid: true,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}