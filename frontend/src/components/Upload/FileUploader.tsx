import React, { useRef } from 'react';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isUploading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="group relative flex flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#2a2e35] bg-[#1c1f24] text-center transition-colors hover:border-[#3b9eff]/60 hover:bg-[#1f2329]"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#3b9eff]/10 text-[#3b9eff] transition-transform group-hover:scale-110 group-hover:bg-[#3b9eff]/15">
          {isUploading ? (
            <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-[#3b9eff] border-t-transparent" />
          ) : (
            <Upload className="h-11 w-11" />
          )}
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-[#e5e7eb]">
            {isUploading ? 'Uploading & Rendering Pages...' : 'Drop PDF or Image files here'}
          </h3>
          <p className="mt-2 text-sm text-[#8b929c]">
            Support PDF documents, PNG, JPG, WebP image files.
          </p>
        </div>

        <div className="flex items-center space-x-6 pt-2 text-xs text-[#6b7280]">
          <span className="flex items-center space-x-1">
            <FileText className="h-4 w-4 text-[#3b9eff]" />
            <span>PDF Processing</span>
          </span>
          <span className="flex items-center space-x-1">
            <ImageIcon className="h-4 w-4 text-[#1f9d6c]" />
            <span>Image Conversion</span>
          </span>
        </div>
      </div>
    </div>
  );
};
