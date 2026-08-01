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
      className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-indigo-500/30 bg-slate-900/60 p-8 text-center transition-all hover:border-indigo-500/70 hover:bg-slate-900/90 glass-panel"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600/30 transition-all">
          {isUploading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-100 font-heading">
            {isUploading ? 'Uploading & Rendering Pages...' : 'Drop PDF or Image files here'}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Support PDF documents, PNG, JPG, WebP image files.
          </p>
        </div>

        <div className="flex items-center space-x-6 text-xs text-slate-400 pt-2">
          <span className="flex items-center space-x-1">
            <FileText className="h-4 w-4 text-indigo-400" />
            <span>PDF Processing</span>
          </span>
          <span className="flex items-center space-x-1">
            <ImageIcon className="h-4 w-4 text-emerald-400" />
            <span>Image Conversion</span>
          </span>
        </div>
      </div>
    </div>
  );
};
