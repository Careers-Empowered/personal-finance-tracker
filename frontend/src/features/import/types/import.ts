export interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onPreview?: () => void;
}