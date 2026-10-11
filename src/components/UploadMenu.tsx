import { File } from "lucide-react";

interface UploadMenuProps {
  onChooseFile: (
    type: "image" | "file" | "pdf",
  ) => void;
}

// ========================================
// CHATGPT-LIKE UPLOAD POPUP
// ========================================

export default function UploadMenu({
  onChooseFile,
}: UploadMenuProps) {
  return (
    <div className="upload-menu">
      <button
        onClick={() => onChooseFile("file")}
      >
        <File size={18} />

        <span>File</span>
      </button>

    </div>
  );
}
